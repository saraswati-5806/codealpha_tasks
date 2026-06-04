from scapy.all import sniff
from packet_handler import parse_packet
from rules_engine import detect_threat
from logger import log_packet
from colorama import Fore, Style, init

init(autoreset=True)


def display_packet(packet_data):
    risk_color = {
        "NORMAL": Fore.GREEN,
        "SUSPICIOUS": Fore.YELLOW,
        "ALERT": Fore.RED
    }

    color = risk_color.get(packet_data["risk_flag"], Fore.WHITE)

    print(
        color
        + f"[{packet_data['timestamp']}] "
        + f"{packet_data['protocol']} | "
        + f"{packet_data['src_ip']}:{packet_data['src_port']} "
        + f"→ {packet_data['dst_ip']}:{packet_data['dst_port']} "
        + f"| TTL: {packet_data['ttl']} "
        + f"| Risk: {packet_data['risk_flag']}"
        + Style.RESET_ALL
    )

    if packet_data["risk_flag"] != "NORMAL":
        print(Fore.RED + f"Reason: {packet_data['alert_reason']}")

    if packet_data["payload"]:
        print(Fore.LIGHTBLACK_EX + f"Payload: {packet_data['payload']}")


def handle_packet(packet):
    packet_data = parse_packet(packet)

    risk_flag, alert_reason = detect_threat(packet_data)
    packet_data["risk_flag"] = risk_flag
    packet_data["alert_reason"] = alert_reason

    log_packet(packet_data)
    display_packet(packet_data)


def start_sniffer():
    print(Fore.CYAN + "\n======================================")
    print(Fore.CYAN + " NetSniff-Lite | Smart Packet Analyzer")
    print(Fore.CYAN + "======================================")
    print(Fore.YELLOW + "Capturing packets... Press CTRL + C to stop.\n")

    try:
        sniff(prn=handle_packet, store=False)

    except PermissionError:
        print(Fore.RED + "\nPermission Error:")
        print("Please run VS Code or PowerShell as Administrator.")

    except KeyboardInterrupt:
        print(Fore.GREEN + "\nSniffing stopped by user.")

    except Exception as error:
        print(Fore.RED + f"\nUnexpected error: {error}")


if __name__ == "__main__":
    start_sniffer()