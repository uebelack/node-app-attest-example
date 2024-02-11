//
//  ContentView.swift
//  AppAttestExample
//
//  Created by David Uebelacker on 04.02.2024.
//

import SwiftUI

struct ContentView: View {
    @State var subject = "Lorem ipsum"
    @State var message = "Lorem ipsum dolor sit amet, consectetur adipiscing elit."

    var body: some View {
        NavigationStack {
            VStack {
                Form {
                    TextField("subject", text: $subject)
                    TextField("message", text: $message,  axis: .vertical)
                        .lineLimit(10...10)
                }
                Button("Send") {
                    Task {
                        try await ApiClient.shared.sendMessage(subject: subject, message: message)
                    }
                }.buttonStyle(.borderedProminent)
                
            }.background(Color(uiColor: .systemGray6))
                .navigationTitle("Send Message")
        }
    }
}

#Preview {
    ContentView()
}
