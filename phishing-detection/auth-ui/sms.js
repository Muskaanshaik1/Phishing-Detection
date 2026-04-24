window.onload = function() {
    // 1. Detect the mode from the URL (?mode=Email or ?mode=SpearPhishing)
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode') || "Email";
    
    const themeLink = document.getElementById('theme-link');
    const titleElem = document.getElementById('main-title');
    const spearBox = document.getElementById('spear-profile-box');

    // 2. DYNAMIC THEME & BACKGROUND SWITCHER
    if (mode === "Email") {
        // Apply the new light corporate background
        themeLink.href = "email-style.css"; 
        titleElem.innerText = "Email Detection Center";
        if (spearBox) spearBox.style.display = 'none';
    } else if (mode === "SpearPhishing") {
        // Apply the dark gradient background
        themeLink.href = "styles.css"; 
        titleElem.innerText = "Spear Phishing Analysis";
        if (spearBox) spearBox.style.display = 'block';
    }

    // 3. Load previous scan history from Java backend
    loadHistory();
};

async function checkSMS() {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode') || "Email";
    
    const smsInput = document.getElementById("smsText");
    const targetInput = document.getElementById("targetName");
    const resultDiv = document.getElementById("result");
    
    const text = smsInput.value.trim();
    const target = targetInput ? targetInput.value.trim() : "";

    if (!text) return alert("Please enter content to analyze.");

    // Show Loader
    resultDiv.innerHTML = `<p>AI analyzing neural patterns for ${mode}...</p>`;

    try {
        // STEP 1: Get Score from Python AI (Port 5000)
        const response = await fetch("http://localhost:5000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                text: text, 
                mode: mode, 
                target: target 
            })
        });
        const data = await response.json();

        // STEP 2: Update UI with the result
        resultDiv.innerHTML = `
            <div class="result-card">
                <h3 style="color: ${data.risk > 80 ? 'red' : 'orange'}">${data.level} Threat</h3>
                <p>Risk Probability: <b>${data.risk}%</b></p>
            </div>
        `;

        // STEP 3: Save results to Java History Database (Port 8080)
        await fetch("http://localhost:8080/api/history/save", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                type: mode + " Scan",
                contentSnippet: text.substring(0, 30) + "...",
                riskScore: data.risk,
                result: data.level
            })
        });

        // Refresh the log table
        loadHistory();

    } catch (error) {
        console.error("Connection error:", error);
        resultDiv.innerHTML = "<p style='color:red;'>Error: Ensure Python app.py is running on Port 5000.</p>";
    }
}

function loadHistory() {
    // Calls Java backend to fetch previous scan results
    fetch("http://localhost:8080/api/history/all", {
        headers: { "Authorization": "Bearer " + localStorage.getItem("jwt") }
    })
    .then(res => res.json())
    .then(data => {
        const body = document.getElementById("historyBody");
        if (!body) return;
        body.innerHTML = ""; 

        // Show last 5 scans in reverse order
        const lastFive = data.slice(-5).reverse(); 

        lastFive.forEach(item => {
            body.innerHTML += `
                <tr>
                    <td>${item.type}</td>
                    <td>${item.contentSnippet}</td>
                    <td style="color: red; font-weight: bold;">${item.riskScore}%</td>
                    <td>${item.result}</td>
                </tr>
            `;
        });
    })
    .catch(err => console.log("History Load Error:", err));
}