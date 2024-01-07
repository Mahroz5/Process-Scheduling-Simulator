# app.py

from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/simulate", methods=["POST"])
def simulate():
    algorithm = request.json["algorithm"]
    processes = request.json["processes"]
    
    burst_times = {str(process["id"]): process["burstTime"] for process in processes}

    # Implement the selected algorithm logic here
    if algorithm == "fcfs":
        result = fcfs(processes)
    elif algorithm == "sjf":
        result = sjf(processes)
    elif algorithm == "ljf":
        result = ljf(processes)
    else:
        result = {"error": "Invalid algorithm"}

    result["burstTimes"] = burst_times
    
    return jsonify(result)

def fcfs(processes):
    # Implement FCFS logic
    result = {"order": [], "completionTimes": {}, "burstTimes":{}}
    completion_time = 0

    for process in processes:
        result["order"].append(process["id"])
        completion_time += process["burstTime"]
        result["completionTimes"][process["id"]] = completion_time

    return result

def sjf(processes):
    # Implement SJF logic
    result = {"order": [], "completionTimes": {}, "burstTimes":{}}
    completion_time = 0

    # Sort processes based on burst time
    sorted_processes = sorted(processes, key=lambda x: x["burstTime"])

    for process in sorted_processes:
        result["order"].append(process["id"])
        completion_time += process["burstTime"]
        result["completionTimes"][process["id"]] = completion_time

    return result

def ljf(processes):
    # Implement LJF logic
    result = {"order": [], "completionTimes": {}, "burstTimes":{}}
    completion_time = 0

    # Sort processes based on burst time in descending order
    sorted_processes = sorted(processes, key=lambda x: x["burstTime"], reverse=True)

    for process in sorted_processes:
        result["order"].append(process["id"])
        completion_time += process["burstTime"]
        result["completionTimes"][process["id"]] = completion_time

    return result

if __name__ == "__main__":
    app.run(debug=True)