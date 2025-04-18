import SwiftUI
import FirebaseFirestore
import FirebaseAuth

struct MedicationHistoryView: View {
    @State private var medications: [MedicationLog] = []
    @State private var isLoading = true
    @State private var errorMessage: String?

    var body: some View {
        NavigationView {
            VStack {
                if isLoading {
                    ProgressView("Loading Medications...")
                } else if let errorMessage = errorMessage {
                    Text("Error: \(errorMessage)")
                        .foregroundColor(.red)
                        .multilineTextAlignment(.center)
                        .padding()
                } else if medications.isEmpty {
                    Text("No medication logs found.")
                        .foregroundColor(.gray)
                } else {
                    List(medications) { med in
                        VStack(alignment: .leading, spacing: 5) {
                            Text(med.medicationName)
                                .font(.headline)
                            Text("Dosage: \(med.dosage)")
                            Text("Date: \(med.timestamp, formatter: dateFormatter)")
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                        .padding(.vertical, 4)
                    }
                }
            }
            .navigationTitle("Medication History")
            .onAppear(perform: fetchMedications)
        }
    }

    private func fetchMedications() {
        guard let uid = Auth.auth().currentUser?.uid else {
            self.errorMessage = "User not logged in."
            self.isLoading = false
            return
        }
        let db = Firestore.firestore()
        db.collection("medications").document(uid).collection("logs")
            .order(by: "timestamp", descending: true)
            .getDocuments { snapshot, error in
                if let error = error {
                    self.errorMessage = error.localizedDescription
                } else if let snapshot = snapshot {
                    self.medications = snapshot.documents.compactMap { document in
                        try? document.data(as: MedicationLog.self)
                    }
                }
                self.isLoading = false
            }
    }
}

struct MedicationLog: Identifiable, Codable {
    @DocumentID var id: String?
    var medicationName: String
    var dosage: String
    var timestamp: Date
}

private let dateFormatter: DateFormatter = {
    let formatter = DateFormatter()
    formatter.dateStyle = .medium
    formatter.timeStyle = .short
    return formatter
}()
