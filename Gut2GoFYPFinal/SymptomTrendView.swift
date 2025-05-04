//import SwiftUI
//import Charts
//import FirebaseAuth
//import FirebaseFirestore
//
//struct SymptomTrendView: View {
//    @State private var symptoms: [Symptom] = []
//    @State private var isLoading = true
//    @State private var errorMessage: String?
//
//    var body: some View {
//        VStack {
//            if isLoading {
//                ProgressView("Loading Symptom Trends...")
//            } else if let errorMessage = errorMessage {
//                Text("Error: \(errorMessage)")
//                    .foregroundColor(.red)
//                    .multilineTextAlignment(.center)
//                    .padding()
//            } else if symptoms.isEmpty {
//                Text("No symptom data available.")
//                    .foregroundColor(.gray)
//            } else {
//                Chart {
//                    
//                    ForEach(symptoms) { symptom in
//                        LineMark(
//                            x: .value("Date", symptom.timestamp),
//                            y: .value("Pain", symptom.painLevel)
//                        )
//                        .foregroundStyle(.blue)
//                        .symbol(.circle)
//                        .interpolationMethod(.catmullRom) 
//                    }
//                }
//                .chartXAxis {
//                    AxisMarks(values: .stride(by: .month)) {
//                        
//                        AxisGridLine()
//                        
//                        AxisTick()
//                        
//                        AxisValueLabel(format: .dateTime.month(.abbreviated))
//                    }
//                }
//                .chartYAxis {
//                    AxisMarks {
//                        AxisGridLine()
//                        AxisTick()
//                        AxisValueLabel()
//                    }
//                }
//                
//                .chartXAxisLabel(position: .bottom) {
//                    Text("Month")
//                        .font(.caption)
//                        .foregroundColor(.secondary)
//                }
//                .chartYAxisLabel(position: .leading) {
//                    Text("Pain Level")
//                        .font(.caption)
//                        .foregroundColor(.secondary)
//                }
//                .padding()
//            }
//        }
//        .navigationTitle("Symptom Trends")
//        .onAppear(perform: fetchSymptoms)
//    }
//
//    private func fetchSymptoms() {
//        guard let uid = Auth.auth().currentUser?.uid else {
//            errorMessage = "User not logged in."
//            isLoading = false
//            return
//        }
//        Firestore.firestore().collection("symptoms")
//            .document(uid)
//            .collection("logs")
//            .order(by: "timestamp", descending: false)
//            .getDocuments { (snapshot, error) in
//                if let error = error {
//                    errorMessage = "Failed to fetch symptoms: \(error.localizedDescription)"
//                } else if let snapshot = snapshot {
//                    self.symptoms = snapshot.documents.compactMap { document -> Symptom? in
//                        do {
//                            return try document.data(as: Symptom.self)
//                        } catch {
//                            print("Error decoding symptom: \(error)")
//                            return nil
//                        }
//                    }
//                }
//                self.isLoading = false
//            }
//    }
//}
