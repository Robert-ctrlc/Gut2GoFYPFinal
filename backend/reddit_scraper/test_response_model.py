import joblib


pipeline = joblib.load("symptom_recommender.pkl")
mlb = joblib.load("label_binarizer.pkl")




input_symptoms = "bloating"


y_pred = pipeline.predict([input_symptoms])
predicted_labels = mlb.inverse_transform(y_pred)
print(f"Predicted labels (raw): {predicted_labels}")


print(f"\n💡 Recommendation for symptoms ({input_symptoms}):")
if predicted_labels[0]:
    print(f"➡️ {', '.join(predicted_labels[0])}")
else:
    print("⚠️ No recommendations found.")
