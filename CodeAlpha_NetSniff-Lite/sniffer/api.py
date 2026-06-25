import csv
import os
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CAPTURED_CSV_FILE = os.path.join(BASE_DIR, "data", "captured_packets.csv")
SAMPLE_CSV_FILE = os.path.join(BASE_DIR, "data", "sample_packets.csv")


def load_packets_from_csv(file_path):
    packets = []

    with open(file_path, mode="r", encoding="utf-8", errors="ignore") as file:
        reader = csv.DictReader(file)
        for row in reader:
            packets.append(row)

    return packets


@app.route("/")
def home():
    return jsonify({
        "project": "NetSniff-Lite",
        "status": "Flask API is running",
        "endpoint": "/api/packets"
    })


@app.route("/api/health")
def health_check():
    return jsonify({
        "status": "healthy",
        "message": "NetSniff-Lite Flask API is online"
    })


@app.route("/api/packets")
def get_packets():
    try:
        if os.path.exists(CAPTURED_CSV_FILE):
            packets = load_packets_from_csv(CAPTURED_CSV_FILE)
            return jsonify({
                "status": "success",
                "source": "captured_packets.csv",
                "message": f"{len(packets)} captured packets loaded successfully.",
                "packets": packets[-500:]
            })

        if os.path.exists(SAMPLE_CSV_FILE):
            packets = load_packets_from_csv(SAMPLE_CSV_FILE)
            return jsonify({
                "status": "success",
                "source": "sample_packets.csv",
                "message": f"{len(packets)} sample packets loaded successfully.",
                "packets": packets[-500:]
            })

        return jsonify({
            "status": "missing",
            "source": "none",
            "message": "No packet CSV file found.",
            "packets": []
        })

    except Exception as error:
        return jsonify({
            "status": "error",
            "message": str(error),
            "packets": []
        })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)