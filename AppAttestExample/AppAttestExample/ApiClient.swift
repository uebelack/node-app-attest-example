//
//  ApiClient.swift
//  AppAttestExample
//
//  Created by David Uebelacker on 04.02.2024.
//

import CryptoKit
import DeviceCheck
import Foundation

enum ApiClientError: Error {
    case attestVerificationFailed
    case attestNotSupported
    case assertionFailed
}

class ApiClient {
    static let shared = ApiClient()

    private var endpoint = "http://192.168.222.71:3000/v1"

    func attestChallenge() async throws -> String {
        let (data, _) = try await URLSession.shared.data(from: url("/attest/challenge"))
        let json = try JSONDecoder().decode([String: String].self, from: data)
        return json["challenge"]!
    }

    func attestKey() async throws -> String {
        let service = DCAppAttestService.shared
        if service.isSupported {
            let challenge = try await attestChallenge()
            let keyId = try await service.generateKey()
            let clientDataHash = Data(SHA256.hash(data: challenge.data(using: .utf8)!))
            let attestation = try await service.attestKey(keyId, clientDataHash: clientDataHash)

            var request = URLRequest(url: url("/attest/verify"))
            request.httpMethod = "POST"
            request.httpBody = try JSONEncoder().encode(
                [
                    "keyId": keyId,
                    "challenge": challenge,
                    "attestation": attestation.base64EncodedString(),
                ]
            )
            request.setValue(
                "application/json",
                forHTTPHeaderField: "Content-Type"
            )

            let (_, response) = try await URLSession.shared.data(for: request)

            if let httpResponse = response as? HTTPURLResponse {
                if httpResponse.statusCode == 204 {
                    UserDefaults.standard.set(keyId, forKey: "AttestKeyId")
                    return keyId
                }
            }

            throw ApiClientError.attestVerificationFailed
        }
        throw ApiClientError.attestNotSupported
    }

    func createAssertion(_ payload: Data) async throws -> String {
        var keyId = UserDefaults.standard.string(forKey: "AttestKeyId")

        if keyId == nil {
            keyId = try await attestKey()
        }

        let hash = Data(SHA256.hash(data: payload))
        let service = DCAppAttestService.shared
        let assertion = try await service.generateAssertion(keyId!, clientDataHash: hash)

        return try JSONEncoder().encode([
            "keyId": keyId,
            "assertion": assertion.base64EncodedString(),
        ]).base64EncodedString()
    }

    func sendMessage(subject: String, message: String) async throws {
        let challenge = try await attestChallenge()
        let payload = try JSONEncoder().encode([
            "subject": subject,
            "message": message,
            "challenge": challenge,
        ])

        let assertion = try await createAssertion(payload)

        var request = URLRequest(url: url("/send-message"))
        request.httpMethod = "POST"
        request.httpBody = payload
        request.setValue(
            "application/json",
            forHTTPHeaderField: "Content-Type"
        )

        request.setValue(
            assertion,
            forHTTPHeaderField: "authentication"
        )

        let (_, response) = try await URLSession.shared.data(for: request)

        if let httpResponse = response as? HTTPURLResponse {
            if httpResponse.statusCode == 401 {
                UserDefaults.standard.removeObject(forKey: "AttestKeyId")
                throw ApiClientError.assertionFailed
            }
        }
    }

    private func url(_ target: String) -> URL {
        return URL(string: "\(endpoint)\(target)")!
    }
}
