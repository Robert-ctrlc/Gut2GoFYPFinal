import spacy
from spacy.training.example import Example
import json


nlp = spacy.load("en_core_web_sm")

# Function to load the training data from the JSON file
def load_training_data(file_path):
    with open(file_path, "r") as f:
        return json.load(f)

#  fine-tune the NER model
def fine_tune_ner(training_data):
    # NER component of the pipeline
    ner = nlp.get_pipe("ner")

    # adds new labels to the NER component
    for _, annotations in training_data:
        for ent in annotations.get("entities"):
            ner.add_label(ent[2])  # adds new labels to the model
    
    #begins training
    optimizer = nlp.begin_training()
    
    # trains the model for several iterations
    for epoch in range(100): #set to 100 epochs
        losses = {}
        for text, annotations in training_data:
            #creates an example object from the text and annotations
            doc = nlp.make_doc(text)
            example = Example.from_dict(doc, annotations)
            
            #updates the model with the example
            nlp.update([example], drop=0.5, losses=losses)
        
        print(f"Epoch {epoch} - Losses: {losses}")

    # saved the finetunedmodel
    nlp.to_disk("fine_tuned_model")
    print("Fine-tuned model saved to 'fine_tuned_model'.")

if __name__ == "__main__":
    #loads the labeled training data
    training_data = load_training_data("ner_training_data.json")
    fine_tune_ner(training_data)
