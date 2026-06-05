import csv
import os
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_FILE = os.path.join(BASE_DIR, "data", "captured_packets.csv")


@app.route("/")
def home():
    return jsonify({
        "project": "NetSniff-Lite",
        "status": "Flask API is running",
        "endpoint": "/api/packets"
    })


@app.route("/api/packets")
def get_packets():
    if not os.path.exists(CSV_FILE):
        return jsonify({
            "status": "missing",
            "message": "captured_packets.csv not found. Run the sniffer first.",
            "packets": []
        })

    packets = []

    try:
        with open(CSV_FILE, mode="r", encoding="utf-8", errors="ignore") as file:
            reader = csv.DictReader(file)
            for row in reader:
                packets.append(row)

        return jsonify({
            "status": "success",
            "message": f"{len(packets)} packets loaded successfully.",
            "packets": packets[-500:]
        })

    except Exception as error:
        return jsonify({
            "status": "error",
            "message": str(error),
            "packets": []
        })


if __name__ == "__main__":
    app.run(debug=True, port=5000)