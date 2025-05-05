import json
import re
import nlpaug.augmenter.word as naw

#Define the symptoms and treatments
symptoms = [
    "bloating", "nausea", "diarrhea", "constipation", "stomach pain", "cramps", 
    "vomiting", "gas", "indigestion", "slower motility", "abdominal pain", "fatigue",
    "headaches", "loss of appetite", "gurgling", "stomach upset", "intestinal issues", "reflux",
    "acidity", "acne", "brain fog", "weight gain", "loss of weight", "intense cramping"
]

treatments = [
    "probiotics", "fiber", "medication", "exercise", "diet", "low FODMAP", "yogurt", 
    "enzymes", "Florastor", "L casei", "Imodium", "antibiotics", "surgery", "supplements", 
    "pelvic floor therapy", "acupuncture", "peppermint", "apple cider vinegar", "gluten-free diet",
    "hydration", "peppermint tea", "caffeine", "ginger", "vitamin D", "prebiotics"
]


target_keywords = set(symptoms + treatments)

def label_entities(text, keywords, label):
    entities = []
    
    spans = set()
    
    for keyword in keywords:
      
        pattern = re.compile(r'\b' + re.escape(keyword.lower()) + r'\b')
        for match in pattern.finditer(text.lower()):
            start_idx, end_idx = match.span()

           
            if all([start_idx >= end or end_idx <= start for start, end in spans]):
                entities.append((start_idx, end_idx, label))  
                spans.add((start_idx, end_idx))
    return entities


aug = naw.SynonymAug(aug_src='wordnet')


def augment_keywords(sentence, num_augments=3):
    tokens = sentence.split()
    augmented_sentences = []
    for _ in range(num_augments):
        new_tokens = []
        for token in tokens:
            
            if token.lower() in target_keywords:
                
                new_token = aug.augment(token, n=1)[0]
                new_tokens.append(new_token)
            else:
                new_tokens.append(token)
        augmented_sentence = " ".join(new_tokens)
        augmented_sentences.append(augmented_sentence)
    return augmented_sentences



with open('reddit_data.json', 'r') as f:
    posts_data = json.load(f)


labeled_data = []

for post in posts_data:
    content = post['content']
    
   
    symptoms_entities = label_entities(content, symptoms, "SYMPTOM")
    treatments_entities = label_entities(content, treatments, "TREATMENT")
    all_entities = symptoms_entities + treatments_entities
    labeled_data.append([content, {"entities": all_entities}])
    
   
    augmented_sentences = augment_keywords(content, num_augments=3)
    for aug_sent in augmented_sentences:
        aug_symptoms = label_entities(aug_sent, symptoms, "SYMPTOM")
        aug_treatments = label_entities(aug_sent, treatments, "TREATMENT")
        aug_entities = aug_symptoms + aug_treatments
        labeled_data.append([aug_sent, {"entities": aug_entities}])

with open("ner_training_data.json", "w") as f:
    json.dump(labeled_data, f, indent=4)

print("✅ Labeled posts saved!")
