# 🛡️ NetSniff-Lite — Smart Network Packet Analyzer

NetSniff-Lite is a cybersecurity project built as part of the **CodeAlpha Cyber Security Internship — Task 1**.  
It captures live network packets, analyzes packet structure, detects suspicious activity, logs traffic data, and visualizes everything through a modern SOC-style dashboard.

---

## 🚀 Project Overview

The original task was to build a basic Python network sniffer that captures packets and displays useful information such as:

- Source IP
- Destination IP
- Protocol
- Payload

I upgraded the project into a complete **packet monitoring and threat analysis dashboard** using Python, Scapy, Flask, React, Tailwind CSS, and Chart.js.

---

## ✨ Key Features

### 🔍 Packet Capture & Analysis
- Live packet sniffing using Scapy
- Source and destination IP detection
- Protocol detection: TCP, UDP, ICMP, ARP
- Source and destination port extraction
- TTL extraction
- Payload inspection

### 🚨 Threat Detection
- Port scan detection
- High packet rate detection
- Suspicious payload keyword detection
- Unknown protocol flagging
- Risk levels: `NORMAL`, `SUSPICIOUS`, `ALERT`

### 📊 SOC-Style Dashboard
- Protocol distribution chart
- Packet risk timeline
- Recent threat feed
- Threat severity gauge
- Packet flow diagram
- Threat intelligence cards

### 🧠 Advanced Features
- Packet details drawer
- ASCII payload preview
- HEX payload preview
- Raw JSON packet view
- Search across IP, protocol, payload, port, TTL, risk, and date
- Protocol and risk filters
- Start, pause, refresh, and clear dashboard controls
- Dark and light mode
- Settings panel for refresh speed and packet limit

### 📤 Export Options
- CSV export
- JSON export
- TXT security report export

---

## 🧰 Tech Stack

### Backend
- Python
- Scapy
- Socket
- Flask
- Flask-CORS
- Gunicorn
- Colorama
- PyShark

### Frontend
- React.js
- Vite
- Tailwind CSS v4
- Chart.js
- React-ChartJS-2
- Lucide React

### Deployment
- Backend: Render
- Frontend: Vercel
- Version Control: GitHub

---

## 🏗️ Architecture

```text
Network Interface
        ↓
Scapy Packet Capture
        ↓
Packet Handler & Parser
        ↓
Rules Engine
        ↓
CSV Logger
        ↓
Flask API
        ↓
React Dashboard


📁 Folder Structure
CodeAlpha_NetSniff-Lite/
│
├── data/
│   └── sample_packets.csv
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── sniffer/
│   ├── main.py
│   ├── api.py
│   ├── packet_handler.py
│   ├── rules_engine.py
│   ├── logger.py
│   └── socket_info.py
│
├── requirements.txt
└── README.md


⚙️ How to Run Locally

1️⃣ Backend Setup

cd CodeAlpha_NetSniff-Lite
pip install -r requirements.txt
python sniffer/api.py

Backend runs on:

http://localhost:5000


2️⃣ Run Packet Sniffer

Run PowerShell/VS Code as Administrator:

python sniffer/main.py
3️⃣ Frontend Setup
cd frontend
npm install
npm run dev

Frontend runs on:

http://localhost:5173


🔐 Ethical Usage Notice

This tool is created only for educational cybersecurity learning.
Use it only on your own network or in an environment where you have clear permission.


👩‍💻 Author

Saraswati Panigrahi
Cyber Security Intern — CodeAlpha

GitHub: https://github.com/saraswati-5806
LinkedIn: https://linkedin.com/in/saraswati-panigrahi-67b5b133b