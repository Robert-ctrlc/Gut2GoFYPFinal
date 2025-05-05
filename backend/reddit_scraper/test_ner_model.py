import spacy


nlp = spacy.load("fine_tuned_model")


def test_ner_model(input_string):
   
    doc = nlp(input_string)
    
    print(f"\nInput Text: {input_string}")
    print(f"Entities Extracted:")
    for ent in doc.ents:
        print(f"  - {ent.text} ({ent.label_})")


if __name__ == "__main__":
  
    test_ner_model("I have diarrhea and bloating.")
