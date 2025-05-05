from flask import Flask, request, jsonify
import spacy
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split


app = Flask(__name__)

nlp = spacy.load("fine_tuned_model")


df = pd.read_csv("recommendation_pairs.csv")


X = df['Symptoms']  
y = df['Recommendation']  


X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)


pipeline = make_pipeline(
    TfidfVectorizer(),  
    RandomForestClassifier(n_estimators=100)  
)


pipeline.fit(X_train, y_train)


def extract_symptoms_from_input(user_input):
    doc = nlp(user_input)
    symptoms = [ent.text.lower() for ent in doc.ents if ent.label_ == "SYMPTOM"]
    return symptoms

def recommend_treatments(symptoms):
   
    symptom_text = ' '.join(symptoms)
    recommendation = pipeline.predict([symptom_text])
    return recommendation[0]


@app.route('/get_recommendation', methods=['POST'])
def get_recommendation():
    try:
        
        data = request.get_json()
        user_input = data.get("symptoms", "")
        
        if not user_input:
            return jsonify({"error": "No symptoms provided"}), 400
        
       
        symptoms = extract_symptoms_from_input(user_input)
        
        
        if symptoms:
            treatment = recommend_treatments(symptoms)
            return jsonify({"recommendation": treatment}), 200
        else:
            return jsonify({"error": "No symptoms detected"}), 400
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003)
