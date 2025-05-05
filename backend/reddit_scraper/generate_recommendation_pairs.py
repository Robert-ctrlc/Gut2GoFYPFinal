import json
import csv


with open("ner_training_data.json", "r") as f:
    data = json.load(f)

def extract_pairs(data):
    pairs = []
    for text, annotation in data:
        entities = annotation.get("entities", [])
        symptoms = set()
        treatments = set()
        for ent in entities:
            
            if ent[2] == "SYMPTOM":
                symptom = text[ent[0]:ent[1]].strip().lower()
                symptoms.add(symptom)
            elif ent[2] == "TREATMENT":
                treatment = text[ent[0]:ent[1]].strip().lower()
                treatments.add(treatment)
       
        if symptoms and treatments:
            input_text = "Symptoms: " + ", ".join(sorted(symptoms))
            output_text = "Recommendation: " + ", ".join(sorted(treatments))
            pairs.append((input_text, output_text))
    return pairs

pairs = extract_pairs(data)
print(f"Generated {len(pairs)} training pairs.")


with open("recommendation_pairs.csv", "w", newline="", encoding="utf-8") as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(["input", "output"])
    for inp, out in pairs:
        writer.writerow([inp, out])
print("✅ Recommendation training pairs saved to recommendation_pairs.csv")
