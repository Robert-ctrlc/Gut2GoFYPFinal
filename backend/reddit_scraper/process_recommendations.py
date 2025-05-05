import spacy
import firebase_admin
from firebase_admin import credentials, firestore
from collections import defaultdict
from textblob import TextBlob

#loading nlp model
nlp = spacy.load("en_core_web_sm")


cred = credentials.Certificate("../secrets/gut2gofypfinal-945d770b0216.json")  
firebase_admin.initialize_app(cred)
db = firestore.client()

#defining symptoms and treatment keywords
symptoms = ["bloating", "diarrhea", "constipation", "gut pain", "cramps", "stomach ache"]
treatment_keywords = ["probiotics", "low FODMAP", "gluten-free", "yogurt", "ginger", "fiber", "hydration", "bananas"]
#sentiement analysis function
def analyze_sentiment(text):
    """Perform sentiment analysis on text to determine if treatment is recommended positively or negatively."""
    sentiment = TextBlob(text).sentiment.polarity  # Score between -1 and 1
    return "positive" if sentiment > 0 else "negative"
#treatment extraction function
def extract_treatments(text):
    """Extract treatments, foods, and medications from text."""
    doc = nlp(text.lower())
    treatments_found = []

    for token in doc:
        if token.text in treatment_keywords:
            treatments_found.append(token.text)

    return treatments_found
#processing reddit posts stored in firebase
def process_reddit_posts():
    """Fetch Reddit posts, extract relevant data, summarize, and store in Firebase."""
    posts_ref = db.collection("reddit_data").stream()
    symptom_recommendations = defaultdict(list)
    #looping through posts and extracting treatments and sentiment
    #converts it into a readable format(dictionary)
    for post in posts_ref:
        post_data = post.to_dict()
        text = post_data.get("content", "")
        sentiment = analyze_sentiment(text)
        extracted_treatments = extract_treatments(text)

        for symptom in symptoms:
            if symptom in text:
                for treatment in extracted_treatments:
                    symptom_recommendations[symptom].append({"treatment": treatment, "sentiment": sentiment})

    # Summarize recommendations
    final_recommendations = {}
    for symptom, treatments in symptom_recommendations.items():
        summary = {}
        for item in treatments:
            treatment = item["treatment"]
            sentiment = item["sentiment"]

            if treatment not in summary:
                summary[treatment] = {"positive": 0, "negative": 0}

            summary[treatment][sentiment] += 1

        # Convert summary into readable format
            #creates a readable format for the recommendations
        recommendation_text = []
        for treatment, counts in summary.items():
            if counts["positive"] > counts["negative"]:
                recommendation_text.append(f"{treatment} helped {counts['positive']} users.")
            elif counts["negative"] > counts["positive"]:
                recommendation_text.append(f"{treatment} was not helpful for {counts['negative']} users.")
        
        final_recommendations[symptom] = {
            "solution": " ".join(recommendation_text),
            "sources": ["Reddit Analysis"]
        }
        #storing it in firebase recommendations 
    recommendations_ref = db.collection("recommendations")
    for symptom, data in final_recommendations.items():
        recommendations_ref.document(symptom).set(data)

    print("✅ Recommendations stored in Firebase successfully!")

if __name__ == "__main__":
    process_reddit_posts()



