from scapy.layers.inet import IP, TCP, UDP, ICMP
from scapy.layers.l2 import ARP
from scapy.packet import Raw
from datetime import datetime


def get_payload(packet, max_length=80):
    """
    Extract packet payload safely.
    Payload is truncated to avoid storing large/sensitive data.
    """
    try:
        if packet.haslayer(Raw):
            payload = packet[Raw].load
            return payload[:max_length].decode(errors="ignore")
        return ""
    except Exception:
        return ""


def parse_packet(packet):
    """
    Convert a raw Scapy packet into a clean Python dictionary.
    """

    packet_data = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "src_ip": "N/A",
        "dst_ip": "N/A",
        "protocol": "OTHER",
        "src_port": "N/A",
        "dst_port": "N/A",
        "ttl": "N/A",
        "payload": "",
        "risk_flag": "NORMAL"
    }

    try:
        if packet.haslayer(IP):
            packet_data["src_ip"] = packet[IP].src
            packet_data["dst_ip"] = packet[IP].dst
            packet_data["ttl"] = packet[IP].ttl

            if packet.haslayer(TCP):
                packet_data["protocol"] = "TCP"
                packet_data["src_port"] = packet[TCP].sport
                packet_data["dst_port"] = packet[TCP].dport

            elif packet.haslayer(UDP):
                packet_data["protocol"] = "UDP"
                packet_data["src_port"] = packet[UDP].sport
                packet_data["dst_port"] = packet[UDP].dport

            elif packet.haslayer(ICMP):
                packet_data["protocol"] = "ICMP"

        elif packet.haslayer(ARP):
            packet_data["protocol"] = "ARP"
            packet_data["src_ip"] = packet[ARP].psrc
            packet_data["dst_ip"] = packet[ARP].pdst

        packet_data["payload"] = get_payload(packet)

    except Exception as error:
        packet_data["protocol"] = "ERROR"
        packet_data["payload"] = f"Parsing error: {error}"

    return packet_data