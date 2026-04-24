window.onload = function() {
    // 1. Immediately update the UI badge with the selection
    const sector = localStorage.getItem('selectedSector') || 'unknown';
    const display = document.getElementById('sectorDisplay');
    if (display) display.innerText = sector.toUpperCase();

    // 2. Load the history table
    loadHistory();
};

async function checkEmail() {
    const emailInput = document.getElementById("emailText");
    const resultDiv = document.getElementById("result");
    const selectedSector = localStorage.getItem('selectedSector') || 'unknown';

    if (!emailInput || !emailInput.value.trim()) {
        alert("Please paste the email content first.");
        return;
    }

    const text = emailInput.value.trim();
    resultDiv.innerHTML = `
        <p style="color: #3182ce; text-align: center;">
            <i class="fas fa-spinner fa-spin"></i> AI Scanning for ${selectedSector.toUpperCase()} patterns...
        </p>`;

    try {
        // --- STEP 1: Predict via Python AI ---
        const response = await fetch("http://localhost:5000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                text: text, 
                type: "email", 
                source: selectedSector 
            })
        });
        
        const data = await response.json();
        const riskColor = data.risk > 70 ? "#e53e3e" : (data.risk > 30 ? "#ed8936" : "#38a169");
        
        // --- STEP 2: Render Result Card ---
        resultDiv.innerHTML = `
            <div class="result-card" style="margin-top:20px; padding:20px; border-radius:8px; border-left:6px solid ${riskColor}; background:#fff; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                <h3 style="color: ${riskColor}; margin-top:0;">${data.level} RISK DETECTED</h3>
                <p style="font-size: 1.1rem;">Risk Score: <b>${data.risk}%</b></p>
                <div style="margin-top: 10px; border-top: 1px solid #eee; padding-top: 10px;">
                    <strong style="font-size: 0.85rem; color: #718096;">AI FORENSIC REASONS:</strong>
                    <ul style="font-size: 0.9rem; color: #4a5568; margin-top: 5px; padding-left: 20px;">
                        ${data.analysis.map(reason => `<li>${reason}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;

        // --- STEP 3: Save to Java History ---
        await fetch("http://localhost:8080/api/history/save", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                type: `Email (${selectedSector})`,
                contentSnippet: text.substring(0, 40) + "...",
                riskScore: data.risk,
                result: data.level
            })
        });

        loadHistory(); 

    } catch (error) {
        console.error("Connection Error:", error);
        resultDiv.innerHTML = "<p style='color:red; text-align:center;'>Error: AI Server is offline.</p>";
    }
}

function loadHistory() {
    const historyBody = document.getElementById("historyBody");
    if (!historyBody) return;

    fetch("http://localhost:8080/api/history/all", {
        headers: { "Authorization": "Bearer " + localStorage.getItem("jwt") }
    })
    .then(res => res.json())
    .then(data => {
        historyBody.innerHTML = "";
        data.filter(item => item.type.toLowerCase().includes("email")).slice(-5).reverse().forEach(item => {
            const scoreColor = item.riskScore > 70 ? "#e53e3e" : (item.riskScore > 30 ? "#ed8936" : "#38a169");
            historyBody.innerHTML += `
                <tr>
                    <td><span style="font-weight: bold; color: #4a5568;">${item.type}</span></td>
                    <td>${item.contentSnippet}</td>
                    <td style="color: ${scoreColor}; font-weight: bold;">${item.riskScore}%</td>
                    <td><span class="status-pill" style="color: ${scoreColor};">${item.result}</span></td>
                </tr>
            `;
        });
    })
    .catch(err => console.log("Check if Java Port 8080 and JWT are active."));
}