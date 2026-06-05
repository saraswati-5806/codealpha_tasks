import csv
import os
from datetime import datetime

CSV_FILE = os.path.join("data", "captured_packets.csv")
MAX_ROWS = 1000

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
    "alert_reason",
]


def ensure_csv_exists():
    os.makedirs("data", exist_ok=True)

    if not os.path.exists(CSV_FILE):
        with open(CSV_FILE, mode="w", newline="", encoding="utf-8") as file:
            writer = csv.DictWriter(file, fieldnames=CSV_HEADERS)
            writer.writeheader()


def count_csv_rows():
    if not os.path.exists(CSV_FILE):
        return 0

    with open(CSV_FILE, mode="r", encoding="utf-8", errors="ignore") as file:
        return max(sum(1 for _ in file) - 1, 0)


def rotate_csv_if_needed():
    if count_csv_rows() < MAX_ROWS:
        return

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    archived_file = os.path.join("data", f"captured_packets_{timestamp}.csv")

    os.rename(CSV_FILE, archived_file)
    ensure_csv_exists()


def log_packet(packet_data):
    ensure_csv_exists()
    rotate_csv_if_needed()

    safe_packet = {key: packet_data.get(key, "") for key in CSV_HEADERS}

    with open(CSV_FILE, mode="a", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=CSV_HEADERS)
        writer.writerow(safe_packet)