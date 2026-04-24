from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import re
import os

# --- NEW: Speech-to-Text Library ---
# Install this via: pip install SpeechRecognition
import speech_recognition as sr 

app = Flask(__name__)
CORS(app)

# --- LOAD MODELS ---
try:
    sms_model = joblib.load("sms_model.pkl")
    sms_vec = joblib.load("sms_vectorizer.pkl")
    email_model = joblib.load("sms_model.pkl") 
    print("✅ Hybrid AI System Online (Port 5000)")
except Exception as e:
    print(f"❌ Critical Error: Models not found. Details: {e}")

# --- CONFIGURATION ---
WHITELIST = ["hdfcbank.com", "google.com", "microsoft.com", "amazon.in", "paypal.com"]
INTERNAL_KEYWORDS = ["ceo", "manager", "hr", "director", "colleague", "lead", "office"]
URGENCY_WORDS = ['urgent', 'blocked', 'verify now', 'suspended', 'immediate']

def run_hybrid_analysis(text, ml_score, source):
    text_lower = text.lower()
    final_score = ml_score
    reasons = ["Random Forest semantic analysis."]

    # Internal Source Logic (The update for Spear/Vishing)
    if any(role in source.lower() for role in INTERNAL_KEYWORDS):
        return 12, ["Verified Internal Identity: Trust level high."]

    # Technical/Heuristic Checks
    if re.search(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', text):
        return 99, ["Critical: Raw IP link detected."]

    if any(u in text_lower for u in URGENCY_WORDS) and "http" in text_lower:
        final_score = max(final_score, 88)
        reasons.append("High-risk: Pressure tactics detected with external link.")

    return int(final_score), reasons

# --- NEW ENDPOINT: VISHING (AUDIO) ---
@app.route('/predict_voice', methods=['POST'])
def predict_voice():
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file uploaded"}), 400
        
        audio_file = request.files['audio']
        recognizer = sr.Recognizer()
        
        # Convert audio to text
        with sr.AudioFile(audio_file) as source:
            audio_data = recognizer.record(source)
            # Use Google's free STT API (requires internet)
            transcript = recognizer.recognize_google(audio_data)
        
        # Run ML Analysis on the transcribed text
        vec_text = sms_vec.transform([transcript])
        ml_prob = sms_model.predict_proba(vec_text)[0][1]
        
        # Refine with Hybrid Logic
        final_risk, reasons = run_hybrid_analysis(transcript, int(ml_prob * 100), "Voice Scan")

        return jsonify({
            "transcript": transcript,
            "risk": final_risk,
            "level": "CRITICAL" if final_risk >= 75 else "HIGH" if final_risk >= 50 else "LOW",
            "analysis": reasons
        })
    except Exception as e:
        return jsonify({"error": f"Vocal Analysis Failed: {str(e)}"}), 500

# --- EXISTING ENDPOINT: TEXT (EMAIL/SMS/SPEAR) ---
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        text = data.get('text', '')
        source = data.get('target', 'unknown') # Handles 'target' from spear.js

        # ML Prediction
        vec_text = sms_vec.transform([text])
        ml_prob = sms_model.predict_proba(vec_text)[0][1]

        # Hybrid Refinement
        final_risk, reasons = run_hybrid_analysis(text, int(ml_prob * 100), source)

        level = "CRITICAL" if final_risk >= 75 else "HIGH" if final_risk >= 50 else "LOW"

        return jsonify({
            "risk": final_risk,
            "level": level,
            "analysis": reasons
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)