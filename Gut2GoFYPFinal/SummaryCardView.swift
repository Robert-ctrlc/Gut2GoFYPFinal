import SwiftUI

struct SummaryCardView: View {
    let dailySymptoms: [DailySymptom]
    
    var overallAvgPain: Double {
        guard !dailySymptoms.isEmpty else { return 0 }
        return dailySymptoms.map { $0.avgPain }.reduce(0, +) / Double(dailySymptoms.count)
    }
    
    var maxPain: Double {
        return dailySymptoms.map { $0.avgPain }.max() ?? 0
    }
    
    var logsCount: Int {
        return dailySymptoms.count
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Summary")
                .font(.headline)
                .foregroundColor(.white)
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Avg Pain")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                    Text(String(format: "%.1f", overallAvgPain))
                        .font(.title)
                        .foregroundColor(.white)
                }
                Spacer()
                VStack(alignment: .leading, spacing: 4) {
                    Text("Max Pain")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                    Text(String(format: "%.1f", maxPain))
                        .font(.title)
                        .foregroundColor(.white)
                }
                Spacer()
                VStack(alignment: .leading, spacing: 4) {
                    Text("Days Logged")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                    Text("\(logsCount)")
                        .font(.title)
                        .foregroundColor(.white)
                }
            }
        }
        .padding()
        .background(LinearGradient(gradient: Gradient(colors: [Color.blue, Color.purple]), startPoint: .topLeading, endPoint: .bottomTrailing))
        .cornerRadius(15)
        .shadow(radius: 5)
    }
}
