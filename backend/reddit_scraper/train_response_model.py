import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.multioutput import MultiOutputClassifier

# Load data
df = pd.read_csv("cleaned_recommendation_pairs.csv")
df["output"] = df["output"].apply(lambda x: [o.strip() for o in x.split(",")])

# Binarize output labels
mlb = MultiLabelBinarizer()
Y = mlb.fit_transform(df["output"])
X = df["input"]

# Define the pipeline
pipeline = Pipeline([
    ("tfidf", TfidfVectorizer()),
    ("clf", MultiOutputClassifier(LogisticRegression()))
])

# Train the model
pipeline.fit(X, Y)

# Save the model and label binarizer
joblib.dump(pipeline, "symptom_recommender.pkl")
joblib.dump(mlb, "label_binarizer.pkl")

print("✅ Model and label binarizer saved.")
