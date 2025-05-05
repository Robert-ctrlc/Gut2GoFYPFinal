import spacy
import json
from spacy.training.example import Example


with open("ner_training_data.json", "r", encoding="utf-8") as f:
    TRAIN_DATA = json.load(f)

# Creates a blank English model
nlp = spacy.blank("en")

# Adds the NER pipeline
ner = nlp.add_pipe("ner")

# Adds entity labels to the model
for _, annotations in TRAIN_DATA:
    for ent in annotations["entities"]:
        ner.add_label(ent[2]) # Adds the entity label to the NER pipeline

# converts to spacy format
examples = []
for text, annotations in TRAIN_DATA:
    examples.append(Example.from_dict(nlp.make_doc(text), annotations))

# trains  the model
nlp.begin_training()
for epoch in range(100): 
    losses = {}
    nlp.update(examples, drop=0.3, losses=losses)
    print(f"Epoch {epoch+1}, Loss: {losses}")


output_dir = "fine_tuned_model"
nlp.to_disk(output_dir)

print(f"✅ Custom NER model trained and saved to '{output_dir}'!")
