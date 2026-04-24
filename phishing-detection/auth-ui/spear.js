async function checkSpear() {
    const contentInput = document.getElementById("smsText");
    const targetInput = document.getElementById("targetProfile");
    const resultDiv = document.getElementById("result");
    
    const text = contentInput.value.trim();
    const target = targetInput.value.trim();

    if (!text) return alert("Please enter the targeted message.");

    resultDiv.innerHTML = `<p style="color: #f59e0b;"><i class="fas fa-microchip fa-spin"></i> Verifying source and running neural profiling...</p>`;

    // --- STEP 1: INTERNAL SOURCE VERIFICATION ---
    // List of keywords that identify internal/safe personnel
    const internalKeywords = ["ceo", "manager", "hr", "director", "colleague", "teammate", "vp", "lead", "office"];
    const targetLower = target.toLowerCase();
    
    // Check if the target profile matches internal keywords
    const isInternal = internalKeywords.some(role => targetLower.includes(role));

    try {
        // --- STEP 2: API CALL TO FLASK SERVER ---
        const response = await fetch("http://localhost:5000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                text: text, 
                mode: "Spear", 
                target: target 
            })
        });
        
        const data = await response.json();
        
        // --- STEP 3: LOGIC OVERRIDE FOR INTERNAL SOURCES ---
        let finalRisk = data.risk;
        let finalLevel = data.level;
        let sourceStatus = "External Entity";

        if (isInternal) {
            // If internal, we significantly drop the risk score 
            // because a CEO/Colleague is a trusted identity.
            finalRisk = Math.min(data.risk, 15); 
            finalLevel = "LOW";
            sourceStatus = "VERIFIED INTERNAL SOURCE";
        } else {
            sourceStatus = "EXTERNAL SOURCE (UNVERIFIED)";
        }

        // --- STEP 4: DISPLAY UPDATED RESULT ---
        const color = finalRisk > 70 ? "#ef4444" : (finalRisk > 30 ? "#f59e0b" : "#10b981");
        
        resultDiv.innerHTML = `
            <div style="border: 2px solid ${color}; padding: 20px; margin-top: 20px; border-radius: 8px; background: rgba(30, 41, 59, 0.5);">
                <h3 style="color: ${color}; margin-top: 0; text-transform: uppercase;">
                    <i class="fas fa-shield-alt"></i> ${finalLevel} Risk Detected
                </h3>
                <p style="font-size: 1.1rem;">Threat Probability: <strong>${finalRisk}%</strong></p>
                <hr style="border: 0; border-top: 1px solid #334155; margin: 15px 0;">
                <p style="font-size: 0.85rem; color: #94a3b8;">
                    <strong>Intelligence Source:</strong> ${sourceStatus}<br>
                    <strong>Target Profile:</strong> ${target || "General Entry"}
                </p>
            </div>
        `;

        // Update the table/logs if you have them on your page
        updateIntelligenceLogs(target, finalRisk, finalLevel);
        
    } catch (error) {
        resultDiv.innerHTML = "<p style='color:#ef4444;'><i class='fas fa-exclamation-triangle'></i> Intelligence server offline. Start app.py on Port 5000.</p>";
    }
}

// Optional helper function to update your "Intelligence Logs" table
function updateIntelligenceLogs(target, risk, status) {
    const logBody = document.getElementById("logBody");
    if (!logBody) return;

    const color = risk > 70 ? "#ef4444" : (risk > 30 ? "#f59e0b" : "#10b981");
    const newRow = `
        <tr>
            <td>${target || "General"}</td>
            <td style="color: ${color}; font-weight: bold;">${risk}%</td>
            <td style="color: ${color};">${status}</td>
        </tr>
    `;
    logBody.innerHTML = newRow + logBody.innerHTML;
}