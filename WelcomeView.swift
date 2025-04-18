import SwiftUI
import FirebaseAuth
import FirebaseFirestore

struct WelcomeView: View {
    var user: User
    @State private var userName: String = "User"
    @State private var showLogin = false

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
            .onAppear(perform: fetchUserData)
            .fullScreenCover(isPresented: $showLogin) {
                LoginView()
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
    
    private func logOut() {
        do {
            try Auth.auth().signOut()
            showLogin = true
        } catch let error {
            print("Failed to log out: \(error.localizedDescription)")
        }
    }
}
