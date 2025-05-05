import SwiftUI
import FirebaseAuth
import FirebaseFirestore
import HealthKit

struct WelcomeView: View {
    var user: User
    @State private var userName: String = "User"
    @State private var showLogin = false
    @State private var isSheetPresented = false
    @State private var selectedPlan: PlanType = .meal

    enum PlanType {
        case meal, medication
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 10) {
                HStack {
                    VStack(alignment: .leading, spacing: 5) {
                        Text("Welcome Back,")
                            .font(.headline)
                            .foregroundColor(.gray)
                        Text(userName)
                            .font(.largeTitle)
                            .fontWeight(.bold)
                            .foregroundColor(.primary)
                    }
                    Spacer(minLength: 5)
                    Circle()
                        .fill(Color.blue.opacity(0.2))
                        .frame(width: 60, height: 60)
                        .overlay(
                            Text(userName.prefix(1).uppercased())
                                .font(.title)
                                .foregroundColor(.blue)
                        )
                }
                .padding()

                Divider()

                VStack(spacing: 15) {
                    DashboardCard(
                        title: "Log Symptoms",
                        description: "Track and monitor your health symptoms.",
                        icon: "plus.circle.fill",
                        backgroundColor: Color.green.opacity(0.2),
                        destination: AnyView(SymptomLoggingView())
                    )

                    DashboardCard(
                        title: "View History",
                        description: "Check your past logged symptoms.",
                        icon: "calendar",
                        backgroundColor: Color.orange.opacity(0.2),
                        destination: AnyView(SymptomHistoryView())
                    )

                    DashboardCard(
                        title: "Track Medications",
                        description: "Log your medication usage.",
                        icon: "pills.fill",
                        backgroundColor: Color.purple.opacity(0.2),
                        destination: AnyView(MedicationLoggingView())
                    )

                    DashboardCard(
                        title: "Medication Logs",
                        description: "View your medication history",
                        icon: "pills",
                        backgroundColor: Color.purple.opacity(0.2),
                        destination: AnyView(MedicationHistoryView())
                    )

                    DashboardCard(
                        title: "Reports",
                        description: "View trends and summaries of your symptoms.",
                        icon: "chart.line.uptrend.xyaxis",
                        backgroundColor: Color.green.opacity(0.2),
                        destination: AnyView(ReportsView())
                    )

                    HStack {
                        Button(action: {
                            selectedPlan = .meal
                            isSheetPresented.toggle()
                        }) {
                            VStack {
                                Image(systemName: "fork.knife")
                                    .font(.title2)
                                Text("Meal Plan")
                                    .font(.footnote)
                            }
                            .padding(10)
                            .background(Color.green.opacity(0.3))
                            .foregroundColor(.black)
                            .cornerRadius(10)
                        }

                        Button(action: {
                            selectedPlan = .medication
                            isSheetPresented.toggle()
                        }) {
                            VStack {
                                Image(systemName: "pills.fill")
                                    .font(.title2)
                                Text("Medication Plan")
                                    .font(.footnote)
                            }
                            .padding(10)
                            .background(Color.purple.opacity(0.3))
                            .foregroundColor(.black)
                            .cornerRadius(10)
                        }
                    }
                    .padding(.bottom)
                }

                Spacer(minLength: 5)

                Button(action: logOut) {
                    Text("Log Out")
                        .font(.headline)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color.red)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                }
                .padding()
            }
            .padding()
            .background(Color(.systemGroupedBackground).edgesIgnoringSafeArea(.all))
            .onAppear {
                fetchUserData()
                requestAndSyncHealthData()
            }
            .fullScreenCover(isPresented: $showLogin) {
                LoginView()
            }
            .sheet(isPresented: $isSheetPresented) {
                VStack {
                    Text(selectedPlan == .meal ? "Your 7-Day Meal Plan" : "Your 7-Day Medication Plan")
                        .font(.title)
                        .padding()
                    if selectedPlan == .meal {
                        MealPlanView()
                    } else {
                        MedicationPlanView()
                    }
                }
                .padding()
            }
        }
    }

    private func fetchUserData() {
        guard let uid = Auth.auth().currentUser?.uid else {
            showLogin = true
            return
        }
        Firestore.firestore().collection("users").document(uid).getDocument { document, _ in
            if let data = document?.data() {
                userName = data["name"] as? String ?? "User"
            }
        }
    }

    private func requestAndSyncHealthData() {
        HealthKitManager.shared.requestAuthorization { success in
            if success {
                HealthKitManager.shared.fetchAndLogHealthData()
            }
        }
    }

    private func logOut() {
        try? Auth.auth().signOut()
        showLogin = true
    }
}

struct MealPlanView: View {
    @State private var mealPlan: [String: [String: String]] = [:]
    @State private var loading = true

    var body: some View {
        VStack(alignment: .leading) {
            if loading {
                ProgressView("Loading meal plan…")
                    .padding()
            } else if mealPlan.isEmpty {
                Text("No meal plan found.")
                    .padding()
            } else {
                ForEach(mealPlan.keys.sorted(), id: \.self) { day in
                    VStack(alignment: .leading) {
                        Text(day)
                            .font(.headline)
                            .padding(.top, 8)
                        if let meals = mealPlan[day] {
                            if let breakfast = meals["Breakfast"] {
                                Text("• Breakfast: \(breakfast)")
                            }
                            if let lunch = meals["Lunch"] {
                                Text("• Lunch: \(lunch)")
                            }
                            if let dinner = meals["Dinner"] {
                                Text("• Dinner: \(dinner)")
                            }
                        }
                    }
                }
                .padding(.horizontal)
            }
        }
        .onAppear(perform: fetchMealPlan)
        .padding()
        .background(Color.green.opacity(0.1))
        .cornerRadius(10)
    }

    private func fetchMealPlan() {
        guard let uid = Auth.auth().currentUser?.uid else {
            loading = false
            return
        }
        let db = Firestore.firestore()
        db.collection("mealPlans")
            .whereField("patientId", isEqualTo: uid)
            .order(by: "createdAt", descending: true)
            .limit(to: 1)
            .getDocuments { snapshot, _ in
                loading = false
                if let doc = snapshot?.documents.first,
                   let data = doc.data()["mealPlan"] as? [String: [String: String]] {
                    mealPlan = data
                }
            }
    }
}

struct MedicationPlanView: View {
    @State private var medPlan: [String: [String: String]] = [:]
    @State private var loading = true

    var body: some View {
        VStack(alignment: .leading) {
            if loading {
                ProgressView("Loading medication plan…")
                    .padding()
            } else if medPlan.isEmpty {
                Text("No medication plan found.")
                    .padding()
            } else {
                ForEach(medPlan.keys.sorted(), id: \.self) { day in
                    VStack(alignment: .leading) {
                        Text(day)
                            .font(.headline)
                            .padding(.top, 8)
                        if let meds = medPlan[day], let medication = meds["Medication"] {
                            Text("• Medication: \(medication)")
                        }
                    }
                }
                .padding(.horizontal)
            }
        }
        .onAppear(perform: fetchMedPlan)
        .padding()
        .background(Color.purple.opacity(0.1))
        .cornerRadius(10)
    }

    private func fetchMedPlan() {
        guard let uid = Auth.auth().currentUser?.uid else {
            loading = false
            return
        }
        let db = Firestore.firestore()
        db.collection("medicationPlans")
            .whereField("patientId", isEqualTo: uid)
            .order(by: "createdAt", descending: true)
            .limit(to: 1)
            .getDocuments { snapshot, _ in
                loading = false
                if let doc = snapshot?.documents.first,
                   let data = doc.data()["medicationPlan"] as? [String: [String: String]] {
                    medPlan = data
                }
            }
    }
}
