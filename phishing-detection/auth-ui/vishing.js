function updateFileName() {
    const fileInput = document.getElementById('audioFile');
    const display = document.getElementById('file-name-display');
    const label = document.getElementById('file-label');
    
    if (fileInput.files.length > 0) {
        display.innerText = "Target Loaded: " + fileInput.files[0].name;
        label.innerText = "Recording Ready for Intelligence Scan";
    }
}

async function analyzeAudio() {
    const fileInput = document.getElementById('audioFile');
    const resultDiv = document.getElementById('result');
    const statusMsg = document.getElementById('loading-text');
    const transcriptBox = document.getElementById('transcript-container');
    const detectedText = document.getElementById('detectedText');

    if (fileInput.files.length === 0) {
        return alert("Please upload a call recording first.");
    }

    // Reset UI for new scan
    statusMsg.innerHTML = `<i class="fas fa-microchip fa-spin"></i> Processing Vocal Patterns...`;
    resultDiv.innerHTML = "";

    const formData = new FormData();
    formData.append("audio", fileInput.files[0]);
    formData.append("mode", "Vishing");

    try {
        const response = await fetch("http://localhost:5000/predict_voice", {
            method: "POST",
            body: formData 
        });
        
        const data = await response.json();
        
        // Show detected text from the audio
        transcriptBox.style.display = "block";
        detectedText.innerText = `"${data.transcript}"`;

        const riskColor = data.risk > 70 ? "#e53e3e" : (data.risk > 30 ? "#f6ad55" : "#38a169");
        
        resultDiv.innerHTML = `
            <div style="margin-top:25px; padding:20px; border-radius:12px; border-left:8px solid ${riskColor}; background:#fff; box-shadow: 0 15px 30px rgba(0,0,0,0.08);">
                <h3 style="color: ${riskColor}; margin:0; letter-spacing: 1px;">${data.level} RISK DETECTED</h3>
                <p style="margin:10px 0; font-size: 1.2rem;">Probability: <b>${data.risk}%</b></p>
                <p style="font-size: 0.85rem; color: #718096; line-height: 1.4;">Forensic AI has flagged suspicious social engineering tone and keywords in the audio stream.</p>
            </div>
        `;
        
        statusMsg.innerText = "Scan Complete.";
        addToHistory(data.transcript.substring(0, 30) + "...", data.risk, data.level);

    } catch (error) {
        statusMsg.innerText = "Offline.";
        resultDiv.innerHTML = "<p style='color:red;'>Intelligence server unreachable. Start app.py on Port 5000.</p>";
    }
}

function addToHistory(snippet, risk, verdict) {
    const table = document.getElementById("historyBody");
    const color = risk > 70 ? "#e53e3e" : "#38a169";
    const row = `<tr><td>${snippet}</td><td style="font-weight:600;">${risk}%</td><td style="color:${color}; font-weight:bold;">${verdict}</td></tr>`;
    table.innerHTML = row + table.innerHTML;
}