import SwiftUI
import Charts
import FirebaseAuth
import FirebaseFirestore


struct DailySymptom: Identifiable {
    let id = UUID()
    let date: Date
    let avgPain: Double
    let avgStress: Double
    let logsCount: Int
}

struct ReportsView: View {
    @State private var dailySymptoms: [DailySymptom] = []
    @State private var isLoading = true
    @State private var errorMessage: String?

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    if isLoading {
                        ProgressView("Loading Reports...")
                            .progressViewStyle(CircularProgressViewStyle(tint: .blue))
                    } else if let errorMessage = errorMessage {
                        Text("Error: \(errorMessage)")
                            .foregroundColor(.red)
                    } else if dailySymptoms.isEmpty {
                        Text("No symptom data available.")
                            .foregroundColor(.gray)
                    } else {
                        
                        // 1) PAIN TREND CHART
                        Chart {
                            ForEach(dailySymptoms) { day in
                                LineMark(
                                    x: .value("Date", day.date),
                                    y: .value("Average Pain", day.avgPain)
                                )
                                .foregroundStyle(
                                    LinearGradient(
                                        gradient: Gradient(colors: [.blue, .purple]),
                                        startPoint: .top,
                                        endPoint: .bottom
                                    )
                                )
                                .symbol(.circle)
                                .interpolationMethod(.cardinal)
                                .annotation {
                                    Text(String(format: "%.1f", day.avgPain))
                                        .font(.caption)
                                        .padding(4)
                                        .background(Color.white.opacity(0.7))
                                        .cornerRadius(4)
                                }
                            }
                        }
                        .frame(height: 300)
                        .padding()
                        .background(Color.white)
                        .cornerRadius(15)
                        .shadow(radius: 5)
                       
                        .chartXAxisLabel("Date")
                        .chartYAxisLabel("Average Pain")
                        
                        // 2) STRESS TREND CHART
                        Chart {
                            ForEach(dailySymptoms) { day in
                                BarMark(
                                    x: .value("Date", day.date),
                                    y: .value("Average Stress", day.avgStress)
                                )
                                .foregroundStyle(Color.orange)
                                .annotation {
                                    Text(String(format: "%.1f", day.avgStress))
                                        .font(.caption)
                                        .padding(4)
                                        .background(Color.white.opacity(0.7))
                                        .cornerRadius(4)
                                }
                            }
                        }
                        .frame(height: 200)
                        .padding()
                        .background(Color.white)
                        .cornerRadius(15)
                        .shadow(radius: 5)
                    
                        .chartXAxisLabel("Date")
                        .chartYAxisLabel("Average Stress")
                        
                       
                        SummaryCardView(dailySymptoms: dailySymptoms)
                    }
                }
                .padding()
            }
            .navigationTitle("Reports")
        }
        .onAppear(perform: fetchDailySymptoms)
    }
    
    func fetchDailySymptoms() {
        guard let uid = Auth.auth().currentUser?.uid else {
            errorMessage = "User not logged in."
            isLoading = false
            return
        }
        let db = Firestore.firestore()
        db.collection("symptoms")
            .document(uid)
            .collection("logs")
            .order(by: "timestamp", descending: false)
            .getDocuments { (snapshot, error) in
                if let error = error {
                    errorMessage = "Failed to fetch symptoms: \(error.localizedDescription)"
                } else if let snapshot = snapshot {
                    var grouped: [Date: [Symptom]] = [:]
                    let calendar = Calendar.current
                    for document in snapshot.documents {
                        if let symptom = try? document.data(as: Symptom.self) {
                            let day = calendar.startOfDay(for: symptom.timestamp)
                            grouped[day, default: []].append(symptom)
                        }
                    }
                    dailySymptoms = grouped.map { (day, logs) in
                        let avgPain = logs.map { Double($0.painLevel) }.reduce(0, +) / Double(logs.count)
                        let avgStress = logs.map { Double($0.stressLevel) }.reduce(0, +) / Double(logs.count)
                        return DailySymptom(date: day, avgPain: avgPain, avgStress: avgStress, logsCount: logs.count)
                    }
                    dailySymptoms.sort { $0.date < $1.date }
                }
                isLoading = false
            }
    }
}
