from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# OpenAI API Key (Replace with your actual key)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY

# Sample benchmark automation time per transaction (minutes)
BENCHMARK_AUTOMATION_TIMES = {
    "transaction_matching": 1.2,
    "account_reconciliation": 2.5,
    "journal_entry": 1.8,
    "variance_analysis": 3.0,
    "flux_analysis": 2.0
}

# ROI Calculation Function
def calculate_roi(preparers, approvers, transactions, manual_time, hourly_rate, task_type):
    automation_time = BENCHMARK_AUTOMATION_TIMES.get(task_type, manual_time * 0.3)
    
    manual_total_hours = (preparers + approvers) * manual_time * transactions / 60
    automated_total_hours = (preparers + approvers) * automation_time * transactions / 60
    time_saved = manual_total_hours - automated_total_hours
    cost_saved = time_saved * hourly_rate
    roi = (cost_saved / (automated_total_hours * hourly_rate)) * 100 if automated_total_hours > 0 else 0

    return automation_time, time_saved, cost_saved, roi

# ROI Calculation API
@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    results = []

    for task in data.get("tasks", []):
        automation_time, time_saved, cost_saved, roi = calculate_roi(
            int(task["preparers"]), int(task["approvers"]),
            int(task["transactions"]), float(task["manual_time"]),
            float(task["hourly_rate"]), task["task_type"]
        )

        results.append({
            "task_type": task["task_type"],
            "automation_time": automation_time,
            "time_saved": time_saved,
            "cost_saved": cost_saved,
            "roi": roi
        })

    return jsonify(results), 200

# ChatGPT API Integration
@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get("message", "")

    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": user_message}]
    )

    return jsonify({"response": response["choices"][0]["message"]["content"]})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
