document.addEventListener("DOMContentLoaded", () => {

    const urlInput = document.getElementById("urlInput");
    const resultDiv = document.getElementById("result");

    const riskLevelEl = document.getElementById("riskLevel");
    const riskScoreEl = document.getElementById("riskScore");
    const riskFactorsEl = document.getElementById("riskFactors");
    const safetySuggestionsEl = document.getElementById("safetySuggestions");

    let checkedUrl = "";

    // 🔹 CLEAR URL + RESULT WHEN USER CLICKS INPUT FIELD
    urlInput.addEventListener("focus", () => {
        urlInput.value = "";
        resultDiv.style.display = "none";

        riskLevelEl.innerText = "";
        riskScoreEl.innerText = "";
        riskFactorsEl.innerHTML = "";
        safetySuggestionsEl.innerHTML = "";
    });

    // 🔹 EXTRA SAFETY: CLEAR RESULT IF USER TYPES
    urlInput.addEventListener("input", () => {
        resultDiv.style.display = "none";
    });

    // 🔹 1. CHECK WEBSITE BUTTON (Java Backend - Port 8080)
    window.checkWebsite = function () {
        const url = urlInput.value.trim();
        if (!url) {
            alert("Enter a website URL");
            return;
        }

        fetch(`http://localhost:8080/api/phishing/check?url=${encodeURIComponent(url)}`)
            .then(res => {
                if (!res.ok) throw new Error("Backend error");
                return res.json();
            })
            .then(data => {
                resultDiv.style.display = "block";

                riskLevelEl.innerText = data.level;
                riskLevelEl.className = data.level.toLowerCase();
                riskScoreEl.innerText = data.risk;

                riskFactorsEl.innerHTML = "";
                data.factors.forEach(f => {
                    const li = document.createElement("li");
                    li.textContent = f;
                    riskFactorsEl.appendChild(li);
                });

                safetySuggestionsEl.innerHTML = "";
                data.suggestions.forEach(s => {
                    const li = document.createElement("li");
                    li.textContent = s;
                    safetySuggestionsEl.appendChild(li);
                });

                checkedUrl = url;
            })
            .catch(err => {
                console.error(err);
                alert("Backend not reachable (Check Java Terminal)");
            });
    };

    // 🔹 2. VISIT WEBSITE BUTTON
    window.visitWebsite = function () {
        if (!checkedUrl) return;

        let finalUrl = checkedUrl;
        if (!finalUrl.startsWith("http")) {
            finalUrl = "https://" + finalUrl;
        }
        window.open(finalUrl, "_blank");
    };

    // 🔹 3. NEW: CHECK EMAIL, SPEAR & VISHING (Python AI - Port 5000)
    // This connects to the enhanced_phishing_model.pkl you trained today
    window.checkTextPhishing = function () {
        const textData = document.getElementById("phishText").value.trim();
        
        if (!textData) {
            alert("Please paste the email content or voice transcript first!");
            return;
        }

        fetch("http://127.0.0.1:5000/predict/phishing", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: textData })
        })
        .then(res => {
            if (!res.ok) throw new Error("Flask Server Error");
            return res.json();
        })
        .then(data => {
            // Show the result in the existing UI result box
            resultDiv.style.display = "block";
            riskLevelEl.innerText = data.level;
            
            // UI Styling for Phishing vs Safe
            if (data.level.includes("HIGH") || data.level.includes("PHISHING")) {
                riskLevelEl.style.color = "red";
                riskLevelEl.style.fontWeight = "bold";
            } else {
                riskLevelEl.style.color = "green";
            }

            // Update details for text analysis
            riskScoreEl.innerText = "N/A (AI Analysis)";
            riskFactorsEl.innerHTML = "<li>Analyzed text for scam patterns</li>";
            safetySuggestionsEl.innerHTML = "<li>Be careful of unsolicited messages asking for sensitive data</li>";
        })
        .catch(err => {
            console.error(err);
            alert("Python Server Error: Make sure app.py is running on port 5000");
        });
    };

});