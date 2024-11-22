import SwiftUI
import FirebaseFirestore
import FirebaseAuth

struct SymptomLoggingView: View {
    @State private var painLevel: Double = 5
    @State private var bloating: Bool = false
    @State private var stressLevel: Double = 5
    @State private var bowelMovements = "Normal"
    @State private var logDate = Date()
    @State private var logStatusMessage = ""

    let bowelMovementOptions = ["Normal", "Diarrhea", "Constipation"]

    var body: some View {
        VStack(spacing: 20) {
            Text("Log Your Symptoms")
                .font(.largeTitle)
                .padding()

            HStack {
                Text("Pain Level: \(Int(painLevel))")
                Slider(value: $painLevel, in: 0...10, step: 1)
            }

            Toggle("Bloating", isOn: $bloating)

            HStack {
                Text("Stress Level: \(Int(stressLevel))")
                Slider(value: $stressLevel, in: 0...10, step: 1)
            }

            Picker("Bowel Movements", selection: $bowelMovements) {
                ForEach(bowelMovementOptions, id: \.self) { option in
                    Text(option)
                }
            }

            DatePicker("Log Date", selection: $logDate, displayedComponents: .date)

            Button(action: saveSymptomLog) {
                Text("Save Log")
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(8)
            }

            Text(logStatusMessage)
                .foregroundColor(.red)
        }
        .padding()
    }

    private func saveSymptomLog() {
        guard let userId = Auth.auth().currentUser?.uid else {
            logStatusMessage = "User not logged in!"
            return
        }

        let logId = UUID().uuidString
        let symptomData: [String: Any] = [
            "painLevel": Int(painLevel),
            "bloating": bloating,
            "stressLevel": Int(stressLevel),
            "bowelMovements": bowelMovements,
            "logDate": logDate,
            "timestamp": FieldValue.serverTimestamp()
        ]

        Firestore.firestore()
            .collection("symptoms")
            .document(userId)
            .collection("logs")
            .document(logId)
            .setData(symptomData) { error in
                if let error = error {
                    logStatusMessage = "Error saving log: \(error.localizedDescription)"
                } else {
                    logStatusMessage = "Symptom log saved successfully!"
                }
            }
    }
}
