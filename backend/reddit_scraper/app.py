from flask import Flask, request, jsonify
from flask_cors import CORS
import spacy


app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})
# Load model
nlp = spacy.load('fine_tuned_model') 

@app.route('/')
def home():
    return "Flask is working!"

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json() #gets incoming data
        text = data['text'] #gets the text from the incoming data
        doc = nlp(text)  # Process the text with the NER model

        # Extract entities from the processed document
        entities = [{'text': ent.text, 'label': ent.label_} for ent in doc.ents]

        # returns the entities as a JSON response
        return jsonify({'entities': entities}), 200

    except Exception as e:
        #returns a JSON response with the error message
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
