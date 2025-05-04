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
                    
                    // Meal & Medication Plan Buttons at the bottom of the screen (smaller size)
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
            // Sheet to show the Meal or Medication Plan when clicked
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
        
        Firestore.firestore().collection("users").document(uid).getDocument { document, error in
            if let document = document, document.exists, let data = document.data() {
                self.userName = data["name"] as? String ?? "User"
            } else {
                print("User document does not exist or failed to fetch: \(error?.localizedDescription ?? "Unknown error")")
            }
        }
    }
    
    private func requestAndSyncHealthData() {
        HealthKitManager.shared.requestAuthorization { success in
            if success {
                HealthKitManager.shared.fetchAndLogHealthData()
            } else {
                print("HealthKit access denied.")
            }
        }
    }
    
    private func logOut() {
        do {
            try Auth.auth().signOut()
            showLogin = true
        } catch let error {
            print("Failed to log out: \(error.localizedDescription)")
        }
    }
}

struct MealPlanView: View {
    var body: some View {
        VStack(alignment: .leading) {
            ForEach(1..<8) { day in
                Text("Day \(day):")
                    .font(.headline)
                    .padding(.top)
                
               
                Text("• Lunch: Grilled chicken with vegetables")
                Text("• Dinner: Salmon with quinoa")
            }
        }
        .padding()
        .background(Color.green.opacity(0.1))
        .cornerRadius(10)
    }
}

struct MedicationPlanView: View {
    var body: some View {
        VStack(alignment: .leading) {
            ForEach(1..<8) { day in
                Text("Day \(day):")
                    .font(.headline)
                    .padding(.top)
                
              
                Text("• Medication: Probiotics - 1 Capsule per day")
                
            }
        }
        .padding()
        .background(Color.purple.opacity(0.1))
        .cornerRadius(10)
    }
}
