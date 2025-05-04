import SwiftUI
import FirebaseAuth
import FirebaseFirestore

struct User {
    var email: String
    var name: String
}
struct LoginView: View {
    @State private var email = ""
    @State private var password = ""
    @State private var name = ""
    @State private var isLoginMode = true
    @State private var loginStatusMessage = ""
    @State private var isLoggedIn = false
    @State private var loggedInUser: User?

    var body: some View {
        NavigationStack {
            VStack {
                Picker(selection: $isLoginMode, label: Text("Picker")) {
                    Text("Login")
                        .tag(true)
                    Text("Create Account")
                        .tag(false)
                }
                .pickerStyle(SegmentedPickerStyle())
                .padding()
                
                TextField("Email", text: $email)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                    .padding()
                    .background(Color(.secondarySystemBackground))
                
                SecureField("Password", text: $password)
                    .padding()
                    .background(Color(.secondarySystemBackground))
                
                if !isLoginMode {
                    TextField("Name", text: $name)
                        .padding()
                        .background(Color(.secondarySystemBackground))
                }
                
                Button(action: handleAction) {
                    HStack {
                        Spacer()
                        Text(isLoginMode ? "Log In" : "Create Account")
                            .foregroundColor(.white)
                            .padding()
                        Spacer()
                    }
                    .background(Color.blue)
                }
                
                Text(loginStatusMessage)
                    .foregroundColor(.red)
                    .padding()
                
                .navigationDestination(isPresented: $isLoggedIn) {
                    if let user = loggedInUser {
                        WelcomeView(user: user) 
                    }
                }
            }
            .padding()
        }
    }
    
    private func handleAction() {
        if isLoginMode {
            loginUser()
        } else {
            createNewAccount()
        }
    }
    
    private func loginUser() {
        Auth.auth().signIn(withEmail: email, password: password) { result, error in
            if let error = error {
                self.loginStatusMessage = "Failed to log in: \(error.localizedDescription)"
                return
            }
            self.loginStatusMessage = "Successfully logged in!"
            fetchLoggedInUser()
            scheduleMedicationReminder()
            
        }
    }
    
    private func createNewAccount() {
        Auth.auth().createUser(withEmail: email, password: password) { authResult, error in
            if let error = error {
                print("Registration error details: \(error)")
                self.loginStatusMessage = "Failed to create account: \(error.localizedDescription)"
                return
            }
            
            guard let uid = authResult?.user.uid else { return }
            
            let userData = [
                "uid": uid,
                "email": email,
                "name": name
            ]
            
            Firestore.firestore().collection("users").document(uid).setData(userData) { error in
                if let error = error {
                    print("Error adding user to Firestore: \(error.localizedDescription)")
                } else {
                    print("User added to Firestore")
                    fetchLoggedInUser()
                }
            }
        }
    }
    
    private func fetchLoggedInUser() {
        guard let uid = Auth.auth().currentUser?.uid else { return }
        Firestore.firestore().collection("users").document(uid).getDocument { document, error in
            if let document = document, document.exists, let data = document.data() {
                self.loggedInUser = User(email: data["email"] as? String ?? "Unknown", name: data["name"] as? String ?? "User")
                self.isLoggedIn = true
            } else {
                print("User document does not exist or failed to fetch: \(error?.localizedDescription ?? "Unknown error")")
            }
        }
    }
}
    func scheduleMedicationReminder() {
        let content = UNMutableNotificationContent()
        content.title = "💊 Time to log your meds"
        content.body = "Don’t forget to log today’s medication in Gut2Go!"
        content.sound = .default

       
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 5, repeats: false)

        let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: trigger)

        UNUserNotificationCenter.current().add(request) { error in
        if let error = error {
            print("Failed to schedule notification: \(error)")
        }
    }
}
