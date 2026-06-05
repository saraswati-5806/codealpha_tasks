import socket


def get_local_network_info():
    """
    Small socket-based helper included for blueprint completeness.
    It shows the device hostname and local IP address.
    """

    try:
        hostname = socket.gethostname()
        local_ip = socket.gethostbyname(hostname)

        return {
            "hostname": hostname,
            "local_ip": local_ip,
            "status": "Socket network info loaded successfully",
        }

    except Exception as error:
        return {
            "hostname": "Unavailable",
            "local_ip": "Unavailable",
            "status": f"Socket info error: {error}",
        }


if __name__ == "__main__":
    info = get_local_network_info()

    print("NetSniff-Lite Socket Info")
    print("-------------------------")
    print(f"Hostname : {info['hostname']}")
    print(f"Local IP : {info['local_ip']}")
    print(f"Status   : {info['status']}")