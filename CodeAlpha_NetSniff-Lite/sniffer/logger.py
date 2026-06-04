import csv
import os

CSV_FILE = os.path.join("data", "captured_packets.csv")

CSV_HEADERS = [
    "timestamp",
    "src_ip",
    "dst_ip",
    "protocol",
    "src_port",
    "dst_port",
    "ttl",
    "payload",
    "risk_flag",
    "alert_reason"
]


def ensure_csv_exists():
    os.makedirs("data", exist_ok=True)

    if not os.path.exists(CSV_FILE):
        with open(CSV_FILE, mode="w", newline="", encoding="utf-8") as file:
            writer = csv.DictWriter(file, fieldnames=CSV_HEADERS)
            writer.writeheader()


def log_packet(packet_data):
    ensure_csv_exists()

    safe_packet = {key: packet_data.get(key, "") for key in CSV_HEADERS}

    with open(CSV_FILE, mode="a", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=CSV_HEADERS)
        writer.writerow(safe_packet)