import SwiftUI
import FirebaseAuth
import FirebaseFirestore

    struct WelcomeView: View {
        var user: User
        @State private var userName: String = "User"
        @State private var showLogin = false
        
        var body: some View {
            VStack(spacing: 20) {
                HStack {
                    VStack(alignment: .leading, spacing: 5) {
                        Text("Hey,")
                            .font(.headline)
                            .foregroundColor(.green)
                        Text(userName)
                            .font(.largeTitle)
                            .fontWeight(.bold)
                            .foregroundColor(.green)
                    }
                    Spacer()
                    Circle()
                        .fill(Color.blue.opacity(0.2))
                        .frame(width: 60, height: 60)
                        .overlay(
                            Text(userName.prefix(1).uppercased())
                                .font(.title)
                                .foregroundColor(.green)
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
                        action: {
                            // Navigate to Log Symptoms Screen
                        }
                    )
                    
                    DashboardCard(
                        title: "View History",
                        description: "Check your past logged symptoms.",
                        icon: "calendar",
                        backgroundColor: Color.orange.opacity(0.2),
                        action: {
                            // Navigate to History Screen
                        }
                    )
                    
                    DashboardCard(
                        title: "Settings",
                        description: "Customize your preferences.",
                        icon: "gearshape.fill",
                        backgroundColor: Color.gray.opacity(0.2),
                        action: {
                            // Navigate to Settings Screen
                        }
                    )
                }
                .padding()
                
                Spacer()
                
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

    
    struct DashboardCard: View {
        var title: String
        var description: String
        var icon: String
        var backgroundColor: Color
        var action: () -> Void
        
        var body: some View {
            Button(action: action) {
                HStack {
                    Image(systemName: icon)
                        .font(.largeTitle)
                        .foregroundColor(.blue)
                        .padding()
                        .background(Circle().fill(backgroundColor))
                    
                    VStack(alignment: .leading, spacing: 5) {
                        Text(title)
                            .font(.headline)
                            .foregroundColor(.primary)
                        Text(description)
                            .font(.subheadline)
                            .foregroundColor(.gray)
                    }
                    Spacer()
                }
                .padding()
                .background(Color.white)
                .cornerRadius(15)
                .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 5)
            }
        }
    }


