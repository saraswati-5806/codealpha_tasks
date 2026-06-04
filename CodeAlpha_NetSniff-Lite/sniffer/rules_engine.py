from collections import defaultdict, deque
from datetime import datetime, timedelta

port_scan_tracker = defaultdict(lambda: deque())
traffic_tracker = defaultdict(lambda: deque())

SUSPICIOUS_KEYWORDS = ["shell", "attack", "exploit", "malware", "trojan", "password"]


def detect_threat(packet_data):
    src_ip = packet_data.get("src_ip", "N/A")
    dst_port = packet_data.get("dst_port", "N/A")
    protocol = packet_data.get("protocol", "OTHER")
    payload = str(packet_data.get("payload", "")).lower()

    now = datetime.now()
    risk_flag = "NORMAL"
    alert_reason = "No suspicious activity detected"

    if protocol not in ["TCP", "UDP", "ICMP", "ARP"]:
        risk_flag = "SUSPICIOUS"
        alert_reason = "Unknown or unsupported protocol detected"

    for keyword in SUSPICIOUS_KEYWORDS:
        if keyword in payload:
            return "ALERT", f"Suspicious keyword detected in payload: {keyword}"

    if src_ip != "N/A":
        traffic_tracker[src_ip].append(now)

        while traffic_tracker[src_ip] and now - traffic_tracker[src_ip][0] > timedelta(seconds=1):
            traffic_tracker[src_ip].popleft()

        if len(traffic_tracker[src_ip]) > 100:
            risk_flag = "SUSPICIOUS"
            alert_reason = "High packet rate detected from source IP"

    if protocol in ["TCP", "UDP"] and src_ip != "N/A" and dst_port != "N/A":
        port_scan_tracker[src_ip].append((now, dst_port))

        while port_scan_tracker[src_ip] and now - port_scan_tracker[src_ip][0][0] > timedelta(seconds=5):
            port_scan_tracker[src_ip].popleft()

        unique_ports = {port for _, port in port_scan_tracker[src_ip]}

        if len(unique_ports) >= 10:
            return "ALERT", "Possible port scan detected"

    return risk_flag, alert_reason