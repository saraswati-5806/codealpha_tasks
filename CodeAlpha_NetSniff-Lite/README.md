# NetSniff-Lite

NetSniff-Lite is a lightweight network packet monitoring and analysis tool developed as part of the CodeAlpha Cyber Security Internship.

## Project Overview

The application captures live network packets using Scapy, analyzes packet metadata, applies rule-based threat detection, stores logs in CSV format, and visualizes network activity through a modern React dashboard.

## Features

### Packet Capture

* Live Packet Sniffing
* Source IP Detection
* Destination IP Detection
* Protocol Identification
* Payload Extraction

### Traffic Analysis

* Protocol Distribution
* Traffic Timeline
* Top Source IP Analysis
* Top Destination Port Analysis

### Threat Detection

* Suspicious Traffic Detection
* Alert Classification
* Rule-Based Analysis

### Reporting

* CSV Export
* Security Report Export
* Historical Packet Logging

### Dashboard

* Real-Time Refresh
* Search & Filtering
* Interactive Charts
* API Connection Status
* Ethical Usage Notice

---

## Tech Stack

### Backend

* Python
* Scapy
* Socket
* Flask
* Flask-CORS
* Colorama
* PyShark

### Frontend

* React.js
* Tailwind CSS v4
* Chart.js
* React-ChartJS-2
* Lucide React

---

## Installation

### Backend

```bash
pip install -r requirements.txt
python sniffer/api.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Screenshots

Add screenshots inside:

```text
screenshots/
```

* dashboard.png
* terminal_output.png

---

## Ethical Usage

This project is intended solely for educational and authorized network monitoring purposes.

Only monitor networks you own or have explicit permission to analyze.
