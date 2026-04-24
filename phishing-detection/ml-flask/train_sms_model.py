import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# 1. LOAD DATA
data = pd.read_csv("sms.csv")
data = data.dropna(subset=["text", "is_smishing"])
X = data["text"]
y = data["is_smishing"]

# 2. SPLIT
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# 3. ADVANCED VECTORIZATION
# ngram_range=(1, 3) captures sequences like "verify now at"
vectorizer = TfidfVectorizer(
    lowercase=True, 
    stop_words="english", 
    ngram_range=(1, 3), 
    max_features=5000
)
X_train_vec = vectorizer.fit_transform(X_train)

# 4. TRAIN RANDOM FOREST (Increased Ensemble Size)
rf_sms_model = RandomForestClassifier(n_estimators=300, random_state=42, class_weight="balanced")
rf_sms_model.fit(X_train_vec, y_train)

# 5. SAVE
joblib.dump(rf_sms_model, "sms_model.pkl")
joblib.dump(vectorizer, "sms_vectorizer.pkl")

print(f"✅ Random Forest Model Trained. Accuracy: {accuracy_score(y_test, rf_sms_model.predict(vectorizer.transform(X_test))):.4f}")