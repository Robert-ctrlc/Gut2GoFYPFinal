import Foundation
import HealthKit
import FirebaseFirestore
import FirebaseAuth

class HealthKitManager {
    static let shared = HealthKitManager()
    private let healthStore = HKHealthStore()

    private init() {}

   
    func requestAuthorization(completion: @escaping (Bool) -> Void) {
        guard HKHealthStore.isHealthDataAvailable() else {
            completion(false)
            return
        }

        let readTypes: Set<HKObjectType> = [
            HKObjectType.quantityType(forIdentifier: .stepCount)!,
            HKObjectType.quantityType(forIdentifier: .heartRate)!,
            HKObjectType.categoryType(forIdentifier: .sleepAnalysis)!
        ]

        healthStore.requestAuthorization(toShare: nil, read: readTypes) { success, _ in
            completion(success)
        }
    }

    
    func fetchAndLogHealthData() {
        guard let userId = Auth.auth().currentUser?.uid else { return }

        let dispatchGroup = DispatchGroup()
        var healthData: [String: Any] = [:]

       
        dispatchGroup.enter()
        fetchSumQuantity(type: .stepCount) { value in
            healthData["steps"] = Int(value)
            dispatchGroup.leave()
        }

       
        dispatchGroup.enter()
        fetchAverageQuantity(type: .heartRate) { value in
            healthData["heartRateAvg"] = Int(value)
            dispatchGroup.leave()
        }

        
        dispatchGroup.enter()
        fetchSleepDuration { hours in
            healthData["sleepHours"] = Double(round(10 * hours) / 10)
            dispatchGroup.leave()
        }

        dispatchGroup.notify(queue: .main) {
           
            let logId = UUID().uuidString
            let logData: [String: Any] = [
                "steps": healthData["steps"] ?? 0,
                "heartRateAvg": healthData["heartRateAvg"] ?? 0,
                "sleepHours": healthData["sleepHours"] ?? 0.0,
                "source": "HealthKit",
                "timestamp": FieldValue.serverTimestamp()
            ]

            Firestore.firestore()
                .collection("health")
                .document(userId)
                .collection("logs")
                .document(logId)
                .setData(logData) { error in
                    if let error = error {
                        print("🔥 Failed to save HealthKit log: \(error)")
                    } else {
                        print("✅ HealthKit log saved to Firebase!")
                    }
                }
        }
    }

    private func fetchSumQuantity(type: HKQuantityTypeIdentifier, completion: @escaping (Double) -> Void) {
        guard let quantityType = HKObjectType.quantityType(forIdentifier: type) else { return completion(0) }

        let calendar = Calendar.current
        let startDate = calendar.startOfDay(for: Date())
        let endDate = Date()

        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate)
        let query = HKStatisticsQuery(quantityType: quantityType, quantitySamplePredicate: predicate, options: .cumulativeSum) { _, result, _ in
            let value = result?.sumQuantity()?.doubleValue(for: .count()) ?? 0
            completion(value)
        }

        healthStore.execute(query)
    }

    private func fetchAverageQuantity(type: HKQuantityTypeIdentifier, completion: @escaping (Double) -> Void) {
        guard let quantityType = HKObjectType.quantityType(forIdentifier: type) else { return completion(0) }

        let calendar = Calendar.current
        let startDate = calendar.startOfDay(for: Date())
        let endDate = Date()

        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate)

        let query = HKStatisticsQuery(quantityType: quantityType, quantitySamplePredicate: predicate, options: .discreteAverage) { _, result, _ in
            let value = result?.averageQuantity()?.doubleValue(for: .init(from: "count/min")) ?? 0
            completion(value)
        }

        healthStore.execute(query)
    }

    private func fetchSleepDuration(completion: @escaping (Double) -> Void) {
        guard let sleepType = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) else { return completion(0) }

        let calendar = Calendar.current
        let startDate = calendar.startOfDay(for: Date())
        let endDate = Date()
        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate)

        let query = HKSampleQuery(sampleType: sleepType, predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: nil) { _, samples, _ in
            var totalSleep = 0.0

            for sample in samples as? [HKCategorySample] ?? [] {
                if sample.value == HKCategoryValueSleepAnalysis.asleep.rawValue {
                    totalSleep += sample.endDate.timeIntervalSince(sample.startDate)
                }
            }

            completion(totalSleep / 3600.0) 
        }

        healthStore.execute(query)
    }
}
