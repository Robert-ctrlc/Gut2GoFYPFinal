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
        }
        .padding()
        .navigationTitle("Medication Tracking")
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
                   
                    medicationName = ""
                    dosage = ""
                    frequency = ""
                }
            }
    }
}
