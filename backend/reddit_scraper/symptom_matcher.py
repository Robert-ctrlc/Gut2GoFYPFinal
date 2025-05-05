import firebase_admin
from firebase_admin import credentials, firestore
from textblob import TextBlob

cred = credentials.Certificate("../secrets/gut2gofypfinal-945d770b0216.json")  
firebase_admin.initialize_app(cred)
db = firestore.client()


user_symptoms = ["diarrhea", "severe pain"]  

def fetch_matching_posts(symptoms):
    """Fetch Reddit posts matching user symptoms."""
    matching_posts = []
    
   
    posts_ref = db.collection("reddit_data")
    posts = posts_ref.stream()

    for post in posts:
        post_data = post.to_dict()
   
        if any(symptom.lower() in post_data.get("content", "").lower() or
               symptom.lower() in post_data.get("title", "").lower() for symptom in symptoms):
            
            
            sentiment_score = post_data.get("sentiment_score", 0)
            if sentiment_score > -0.2:  
                matching_posts.append(post_data)

    return matching_posts


relevant_posts = fetch_matching_posts(user_symptoms)

for post in relevant_posts:
    print(f"✅ Found Post: {post['title']} (Upvotes: {post['upvotes']})")
    print(f"Content: {post['content'][:200]}...\n")
