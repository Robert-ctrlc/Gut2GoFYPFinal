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
    
 
    @State private var userSymptoms: String = ""
    @State private var recommendation: String = ""
    
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

            
            TextField("Enter your symptoms here...", text: $userSymptoms)
                .padding()
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .frame(height: 60)
            
           
            Button(action: getRecommendation) {
                Text("Get A Treatment Recommendation")
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(8)
            }

            
            if !recommendation.isEmpty {
                            VStack(alignment: .leading) {
                                Text("Based on your symptoms, we recommend :")
                                    .font(.headline)
                                    .padding(.top)

                                
                                VStack(alignment: .leading) {
                                    ForEach(recommendation.split(separator: ","), id: \.self) { treatment in
                                        Text("• \(treatment.trimmingCharacters(in: .whitespaces))")
                                            .foregroundColor(.green)
                                            .padding(.leading, 10)
                                    }
                                }
                                .padding(.top, 10)
                            }
                            .padding()
                        }

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

   
    private func getRecommendation() {
        
        guard !userSymptoms.isEmpty else {
            recommendation = "Please enter your symptoms."
            return
        }
        
       
        guard let url = URL(string: "http://127.0.0.1:5003/get_recommendation") else {
            recommendation = "Invalid URL."
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        
       
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
       
        let body: [String: Any] = ["symptoms": userSymptoms]
        let jsonData = try? JSONSerialization.data(withJSONObject: body, options: .prettyPrinted)
        request.httpBody = jsonData
        
       
        let task = URLSession.shared.dataTask(with: request) { (data, response, error) in
            if let error = error {
                DispatchQueue.main.async {
                    recommendation = "Error: \(error.localizedDescription)"
                }
                return
            }
            
            if let data = data {
                do {
                   
                    if let jsonResponse = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                        let recommendationText = jsonResponse["recommendation"] as? String ?? "No recommendations found."
                        
                       
                        DispatchQueue.main.async {
                            recommendation = recommendationText
                        }
                    }
                } catch {
                    DispatchQueue.main.async {
                        recommendation = "Error parsing response."
                    }
                }
            }
        }
        
        task.resume()
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
            "userSymptoms": userSymptoms,
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
