from scapy.all import sniff
from packet_handler import parse_packet
from colorama import Fore, Style, init

init(autoreset=True)


def display_packet(packet_data):
    """
    Print parsed packet details in terminal.
    """

    protocol_color = {
        "TCP": Fore.CYAN,
        "UDP": Fore.GREEN,
        "ICMP": Fore.YELLOW,
        "ARP": Fore.MAGENTA,
        "OTHER": Fore.WHITE,
        "ERROR": Fore.RED
    }

    color = protocol_color.get(packet_data["protocol"], Fore.WHITE)

    print(
        color
        + f"[{packet_data['timestamp']}] "
        + f"{packet_data['protocol']} | "
        + f"{packet_data['src_ip']}:{packet_data['src_port']} "
        + f"→ {packet_data['dst_ip']}:{packet_data['dst_port']} "
        + f"| TTL: {packet_data['ttl']}"
        + Style.RESET_ALL
    )

    if packet_data["payload"]:
        print(Fore.LIGHTBLACK_EX + f"Payload: {packet_data['payload']}" + Style.RESET_ALL)


def handle_packet(packet):
    """
    Called automatically whenever Scapy captures a packet.
    """

    packet_data = parse_packet(packet)
    display_packet(packet_data)


def start_sniffer():
    """
    Start live network sniffing.
    """

    print(Fore.CYAN + "\n======================================")
    print(Fore.CYAN + " NetSniff-Lite | Basic Network Sniffer")
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