const API_URL = "https://your-backend-service.onrender.com";

function addTaskInput() {
    const container = document.getElementById("taskInputs");
    const index = container.children.length;
    
    container.innerHTML += `
        <div class="task-group">
            <label>Task Type:</label>
            <select id="task_type_${index}">
                <option value="transaction_matching">Transaction Matching</option>
                <option value="account_reconciliation">Account Reconciliation</option>
            </select>
            <label>Number of Preparers:</label>
            <input type="number" id="preparers_${index}" required>
            <label>Manual Time Per Transaction (minutes):</label>
            <input type="number" id="manual_time_${index}" required>
        </div>
    `;
}

async function calculateROI() {
    const tasks = [{ 
        task_type: document.getElementById("task_type_0").value,
        preparers: document.getElementById("preparers_0").value,
        manual_time: document.getElementById("manual_time_0").value
    }];

    try {
        const response = await fetch(`${API_URL}/calculate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tasks })
        });
        const data = await response.json();
        document.getElementById("result").innerText = `ROI: ${data[0].roi}%`;
    } catch (error) {
        console.error("Error calculating ROI:", error);
        alert("Error calculating ROI. Check the console for details.");
    }
}

async function askChatGPT() {
    const message = document.getElementById("chatInput").value;
    
    try {
        const response = await fetch(`${API_URL}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        document.getElementById("chatResponse").innerText = data.response;
    } catch (error) {
        console.error("Error with ChatGPT API:", error);
        alert("Error connecting to ChatGPT API. Check the console for details.");
    }
}
