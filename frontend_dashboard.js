<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Time Study Analysis</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            background-color: #f4f7fc; 
            margin: 0; 
            padding: 40px; 
        }
        .container { 
            max-width: 800px; 
            margin: auto; 
            background: white; 
            padding: 20px; 
            border-radius: 10px; 
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        h2 {
            text-align: center;
            color: #2c3e50;
        }
        label {
            font-weight: bold;
            color: #34495e;
        }
        input, select {
            display: block; 
            width: 100%; 
            padding: 10px; 
            margin-bottom: 15px; 
            border: 1px solid #bdc3c7; 
            border-radius: 5px;
            background: #ecf0f1;
        }
        button {
            padding: 12px; 
            width: 100%; 
            background-color: #007bff; 
            color: white; 
            border: none; 
            cursor: pointer; 
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
        }
        button:hover {
            background-color: #0056b3;
        }
        .result {
            margin-top: 20px; 
            font-size: 1.2em;
            text-align: center;
            color: #2c3e50;
        }
        .chatbot {
            margin-top: 20px; 
            padding: 15px; 
            background: #eef2f7; 
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }
        .chatbot h3 {
            color: #007bff;
        }
        .task-group {
            background: #f8f9fd;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Time Study Analysis Tool</h2>
        <div id="taskInputs"></div>
        <button onclick="initializeTaskInputs()">Add Task Type</button>
        <button onclick="calculateROI()" style="margin-top: 10px;">Calculate ROI</button>
        
        <div class="result" id="result"></div>
        <canvas id="roiChart"></canvas>
        
        <div class="chatbot" id="chatbot">
            <h3>Chatbot Assistance</h3>
            <p>Need help? Enter task details and click "Calculate ROI" to analyze potential savings.</p>
        </div>
    </div>
    
    <script>
        let tasks = [];

        function initializeTaskInputs() {
            let container = document.getElementById("taskInputs");
            if (!container) {
                console.error("Error: taskInputs element not found.");
                return;
            }
            addTaskInput();
        }

        function addTaskInput() {
            const container = document.getElementById('taskInputs');
            if (!container) {
                console.error("Error: taskInputs element not found.");
                return;
            }
            const index = tasks.length;
            
            const taskHTML = `
                <div class="task-group">
                    <label for="task_type_${index}">Select Task Type:</label>
                    <select id="task_type_${index}">
                        <option value="transaction_matching">Transaction Matching</option>
                        <option value="account_reconciliation">Account Reconciliation</option>
                        <option value="journal_entry">Journal Entry</option>
                        <option value="variance_analysis">Variance Analysis</option>
                        <option value="flux_analysis">Flux Analysis</option>
                    </select>
                    <label for="preparers_${index}">Number of Preparers:</label>
                    <input type="number" id="preparers_${index}" min="1" required>
                    <label for="approvers_${index}">Number of Approvers:</label>
                    <input type="number" id="approvers_${index}" min="1" required>
                    <label for="transactions_${index}">Number of Transactions (per month):</label>
                    <input type="number" id="transactions_${index}" min="1" required>
                    <label for="manual_time_${index}">Manual Time Per Transaction (minutes):</label>
                    <input type="number" id="manual_time_${index}" step="0.1" required>
                    <label for="hourly_rate_${index}">Hourly Rate ($):</label>
                    <input type="number" id="hourly_rate_${index}" step="0.1" required>
                </div>
            `;
            container.innerHTML += taskHTML;
            tasks.push(index);
        }

        async function calculateROI() {
            try {
                const response = await fetch("http://localhost:5000/calculate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ tasks: tasks.map(index => ({
                        task_type: document.getElementById(`task_type_${index}`).value,
                        preparers: document.getElementById(`preparers_${index}`).value,
                        approvers: document.getElementById(`approvers_${index}`).value,
                        transactions: document.getElementById(`transactions_${index}`).value,
                        manual_time: document.getElementById(`manual_time_${index}`).value,
                        hourly_rate: document.getElementById(`hourly_rate_${index}`).value
                    })) })
                });
                const data = await response.json();
                document.getElementById("result").innerHTML = `<p>ROI Calculation Complete! Check Console for Details.</p>`;
                console.log("ROI Results:", data);
            } catch (error) {
                console.error("Error calculating ROI:", error);
            }
        }
    </script>
</body>
</html>
