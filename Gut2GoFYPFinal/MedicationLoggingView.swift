import SwiftUI
import FirebaseFirestore
import FirebaseAuth

struct Medication: Identifiable, Codable {
    @DocumentID var id: String?
    var medicationName: String
    var dosage: String
    var frequency: String
    var logDate: Date
    var timestamp: Date?
}

struct MedicationLoggingView: View {
    @State private var medicationName: String = ""
    @State private var dosage: String = ""
    @State private var frequency: String = ""
    @State private var logDate: Date = Date()
    @State private var statusMessage: String = ""
    @State private var interactionMessage: String = ""
    @State private var showInteractionSheet: Bool = false

    var body: some View {
        VStack(spacing: 20) {
            Text("Log Your Medication")
                .font(.largeTitle)
                .padding()

            TextField("Medication Name", text: $medicationName)
                .padding()
                .background(Color(.secondarySystemBackground))

            TextField("Dosage", text: $dosage)
                .padding()
                .background(Color(.secondarySystemBackground))

            TextField("Frequency (e.g., once a day)", text: $frequency)
                .padding()
                .background(Color(.secondarySystemBackground))

            DatePicker("Log Date", selection: $logDate, displayedComponents: .date)
                .padding()

            Button(action: saveMedicationLog) {
                Text("Save Medication Log")
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(8)
            }

            Text(statusMessage)
                .foregroundColor(.red)
                .padding(.top, 5)
        }
        .padding()
        .navigationTitle("Medication Tracking")
        .sheet(isPresented: $showInteractionSheet) {
            VStack(alignment: .leading, spacing: 16) {
                Text("⚠️ Possible Interactions")
                    .font(.title2)
                    .bold()
                    .foregroundColor(.orange)

                ScrollView {
                    Text(interactionMessage)
                        .font(.body)
                        .multilineTextAlignment(.leading)
                        .padding(.top, 4)
                }

                Spacer()

                Button("Close") {
                    showInteractionSheet = false
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(10)
            }
            .padding()
        }
    }

    private func saveMedicationLog() {
        guard let userId = Auth.auth().currentUser?.uid else {
            statusMessage = "User not logged in!"
            return
        }

        let logId = UUID().uuidString
        let data: [String: Any] = [
            "medicationName": medicationName,
            "dosage": dosage,
            "frequency": frequency,
            "logDate": logDate,
            "timestamp": FieldValue.serverTimestamp()
        ]

        Firestore.firestore()
            .collection("medications")
            .document(userId)
            .collection("logs")
            .document(logId)
            .setData(data) { error in
                if let error = error {
                    statusMessage = "Error saving log: \(error.localizedDescription)"
                } else {
                    statusMessage = "Medication log saved successfully!"
                    checkMedicationInteractions(medicationName: medicationName)
                    medicationName = ""
                    dosage = ""
                    frequency = ""
                }
            }
    }

    private func checkMedicationInteractions(medicationName: String) {
        guard !medicationName.isEmpty else {
            interactionMessage = ""
            return
        }

        let prompt = """
        The user is taking \(medicationName). Please list 2–3 common drug interactions with Irish brand examples if available.

        - Use bullet points with emojis.
        - Mention Irish brand names in parentheses, e.g., "Erythromycin (Erythrocin®)".
        - Keep explanations clear and patient-friendly.
        - No intro or outro, just the bullets.

        Example format:
        - ❌ Drug name (Brand®) – short risk explanation
        """

        guard let url = URL(string: "https://api.groq.com/openai/v1/chat/completions") else { return }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("Bearer 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", forHTTPHeaderField: "Authorization")
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = [
            "model": "llama3-70b-8192",
            "messages": [
                ["role": "system", "content": "You are a concise medical assistant."],
                ["role": "user", "content": prompt]
            ],
            "temperature": 0.3
        ]

        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
        } catch {
            print("Failed to encode request body.")
            return
        }

        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                print("Groq API error: \(error)")
                return
            }
            guard let data = data else { return }
            do {
                if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let choices = json["choices"] as? [[String: Any]],
                   let message = choices.first?["message"] as? [String: Any],
                   let content = message["content"] as? String {
                    DispatchQueue.main.async {
                        self.interactionMessage = content.trimmingCharacters(in: .whitespacesAndNewlines)
                        self.showInteractionSheet = true
                    }
                }
            } catch {
                print("Failed to decode Groq response.")
            }
        }.resume()
    }
}
