import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier

# 1. LOAD DATA
data = pd.read_csv("sms.csv").dropna(subset=["text", "is_smishing"])
X, y = data["text"], data["is_smishing"]

# 2. SPLIT
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# 3. ADVANCED TF-IDF (1-3 Word Phrases)
vectorizer = TfidfVectorizer(lowercase=True, stop_words="english", ngram_range=(1, 3), max_features=5000)
X_train_vec = vectorizer.fit_transform(X_train)

# 4. RANDOM FOREST (300 Trees)
model = RandomForestClassifier(n_estimators=300, random_state=42, class_weight="balanced")
model.fit(X_train_vec, y_train)

# 5. SAVE
joblib.dump(model, "sms_model.pkl")
joblib.dump(vectorizer, "sms_vectorizer.pkl")
print("✅ SMS ML Brain Updated with 300 Trees and Tri-grams")