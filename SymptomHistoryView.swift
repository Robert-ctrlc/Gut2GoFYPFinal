import SwiftUI
import FirebaseAuth
import FirebaseFirestore

struct SymptomHistoryView: View {
    @State private var symptoms: [Symptom] = []
    @State private var isLoading = true
    @State private var errorMessage: String?

    var body: some View {
        VStack {
            if isLoading {
                ProgressView("Loading Symptoms...")
            } else if let errorMessage = errorMessage {
                Text("Error: \(errorMessage)")
                    .foregroundColor(.red)
                    .multilineTextAlignment(.center)
                    .padding()
            } else if symptoms.isEmpty {
                Text("No symptoms logged yet.")
                    .foregroundColor(.gray)
            } else {
                List(symptoms) { symptom in
                    VStack(alignment: .leading) {
                        Text("Date: \(symptom.timestamp.formatted(date: .abbreviated, time: .shortened))")
                            .font(.headline)
                        Text("Pain Level: \(symptom.painLevel)")
                        Text("Bloating: \(symptom.bloating)")
                        Text("Stress Level: \(symptom.stressLevel)")
                        Text("Bowel Movements: \(symptom.bowelMovements)")
                    }
                    .padding()
                }
            }
        }
        .navigationTitle("Symptom History")
        .onAppear(perform: fetchSymptoms)
    }

    private func fetchSymptoms() {
        guard let uid = Auth.auth().currentUser?.uid else {
            errorMessage = "User not logged in."
            isLoading = false
            return
        }

        let db = Firestore.firestore()
        db.collection("symptoms")
            .document(uid)
            .collection("logs")
            .order(by: "timestamp", descending: true)
            .getDocuments { (snapshot, error) in
                if let error = error {
                    errorMessage = "Failed to fetch symptoms: \(error.localizedDescription)"
                } else if let snapshot = snapshot {
                    symptoms = snapshot.documents.compactMap { document -> Symptom? in
                        do {
                            return try document.data(as: Symptom.self)
                        } catch {
                            print("Error decoding symptom: \(error)")
                            return nil
                        }
                    }
                }
                isLoading = false
            }
    }
}

struct Symptom: Identifiable, Codable {
    @DocumentID var id: String?
    var userId: String? 
    var painLevel: Int
    var bloating: Bool
    var stressLevel: Int
    var bowelMovements: String
    var timestamp: Date
}
