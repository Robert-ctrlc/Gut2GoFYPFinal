import SwiftUI

struct DashboardCard<Destination: View>: View {
    var title: String
    var description: String
    var icon: String
    var backgroundColor: Color
    var destination: Destination

    var body: some View {
        NavigationLink(destination: destination) {
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
        .buttonStyle(PlainButtonStyle())
    }
}
