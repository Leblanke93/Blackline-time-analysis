from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import numpy as np
import os

app = Flask(__name__)

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///finance_tool.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Define the ROI Calculation Model
class ROICalculation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task_type = db.Column(db.String(100), nullable=False)
    preparers = db.Column(db.Integer, nullable=False)
    approvers = db.Column(db.Integer, nullable=False)
    transactions = db.Column(db.Integer, nullable=False)
    manual_time = db.Column(db.Float, nullable=False)
    automation_time = db.Column(db.Float, nullable=False)
    hourly_rate = db.Column(db.Float, nullable=False)
    time_saved = db.Column(db.Float, nullable=False)
    cost_saved = db.Column(db.Float, nullable=False)
    roi = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            "task_type": self.task_type,
            "preparers": self.preparers,
            "approvers": self.approvers,
            "transactions": self.transactions,
            "manual_time": self.manual_time,
            "automation_time": self.automation_time,
            "hourly_rate": self.hourly_rate,
            "time_saved": self.time_saved,
            "cost_saved": self.cost_saved,
            "roi": self.roi
        }

# Sample benchmark data for automation time per task type (minutes)
BENCHMARK_AUTOMATION_TIMES = {
    "transaction_matching": 1.2,
    "account_reconciliation": 2.5,
    "journal_entry": 1.8,
    "variance_analysis": 3.0,
    "flux_analysis": 2.0
}

def calculate_roi(preparers, approvers, transactions, manual_time, hourly_rate, task_type):
    automation_time = BENCHMARK_AUTOMATION_TIMES.get(task_type, manual_time * 0.3)  # Estimated automation time
    
    manual_total_hours = (preparers + approvers) * manual_time * transactions / 60
    automated_total_hours = (preparers + approvers) * automation_time * transactions / 60
    time_saved = manual_total_hours - automated_total_hours
    cost_saved = time_saved * hourly_rate
    roi = (cost_saved / (automated_total_hours * hourly_rate)) * 100 if automated_total_hours > 0 else 0
    
    return automation_time, time_saved, cost_saved, roi

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    results = []
    
    for task in data.get("tasks", []):
        automation_time, time_saved, cost_saved, roi = calculate_roi(
            int(task["preparers"]),
            int(task["approvers"]),
            int(task["transactions"]),
            float(task["manual_time"]),
            float(task["hourly_rate"]),
            task["task_type"]
        )
        
        new_calculation = ROICalculation(
            task_type=task["task_type"],
            preparers=int(task["preparers"]),
            approvers=int(task["approvers"]),
            transactions=int(task["transactions"]),
            manual_time=float(task["manual_time"]),
            automation_time=automation_time,
            hourly_rate=float(task["hourly_rate"]),
            time_saved=time_saved,
            cost_saved=cost_saved,
            roi=roi
        )
        db.session.add(new_calculation)
        db.session.commit()

        results.append(new_calculation.to_dict())
    
    return jsonify(results), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)
