function checkSms() {
    const input = document.getElementById("smsInput");
    const text = input.value.trim();

    if (!text) {
        alert("Enter SMS content");
        return;
    }

    fetch("http://localhost:8080/api/sms/check", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(text)
    })
    .then(res => {
        if (!res.ok) throw new Error("Backend error");
        return res.json();
    })
    .then(data => {
        const result = document.getElementById("result");
        result.classList.remove("hidden");

        document.getElementById("riskLevel").innerText = data.level;
        document.getElementById("riskScore").innerText = data.risk;

        const factors = document.getElementById("riskFactors");
        const suggestions = document.getElementById("suggestions");

        factors.innerHTML = "";
        suggestions.innerHTML = "";

        data.factors.forEach(f => {
            const li = document.createElement("li");
            li.innerText = f;
            factors.appendChild(li);
        });

        data.suggestions.forEach(s => {
            const li = document.createElement("li");
            li.innerText = s;
            suggestions.appendChild(li);
        });
    })
    .catch(err => {
        console.error(err);
        alert("SMS service not reachable");
    });
}

