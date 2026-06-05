import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Activity,
  ShieldCheck,
  Wifi,
  FileText,
  RefreshCw,
  Search,
  Download,
  Filter,
  XCircle,
  Server,
  BarChart3,
  Lock,
  Radio,
  FileDown,
  Network,
} from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import "./index.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

const API_URL = "http://localhost:5000/api/packets";

const DEMO_PACKETS = [
  {
    timestamp: "2026-06-05 10:00:01",
    src_ip: "192.168.1.37",
    dst_ip: "142.250.71.99",
    protocol: "UDP",
    src_port: "57825",
    dst_port: "443",
    ttl: "128",
    payload: "Encrypted HTTPS QUIC traffic",
    risk_flag: "NORMAL",
    alert_reason: "No suspicious activity detected",
  },
  {
    timestamp: "2026-06-05 10:00:04",
    src_ip: "10.0.0.23",
    dst_ip: "192.168.1.37",
    protocol: "TCP",
    src_port: "49152",
    dst_port: "22",
    ttl: "64",
    payload: "shell access attempt",
    risk_flag: "ALERT",
    alert_reason: "Suspicious keyword detected in payload: shell",
  },
];

function App() {
  const [packets, setPackets] = useState([]);
  const [status, setStatus] = useState("Connecting to Flask API...");
  const [apiStatus, setApiStatus] = useState("CHECKING");
  const [lastUpdated, setLastUpdated] = useState("-");
  const [searchTerm, setSearchTerm] = useState("");
  const [protocolFilter, setProtocolFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");

  const loadPackets = async () => {
    setStatus("Refreshing live packet data...");

    try {
      const response = await fetch(`${API_URL}?time=${Date.now()}`);

      if (!response.ok) throw new Error("API response failed");

      const apiData = await response.json();
      const livePackets = apiData.packets || [];

      setPackets(livePackets);
      setApiStatus("CONNECTED");

      if (livePackets.length === 0) {
        setStatus("Waiting for packets... Run the sniffer to capture traffic.");
      } else {
        setStatus(apiData.message || `Loaded ${livePackets.length} packets.`);
      }

      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      setPackets(DEMO_PACKETS);
      setApiStatus("OFFLINE");
      setStatus("Flask API offline. Showing demo data.");
      setLastUpdated(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    loadPackets();
    const interval = setInterval(loadPackets, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredPackets = useMemo(() => {
    return packets.filter((packet) => {
      const keyword = searchTerm.toLowerCase();

      const matchesSearch =
        packet.src_ip?.toLowerCase().includes(keyword) ||
        packet.dst_ip?.toLowerCase().includes(keyword) ||
        packet.protocol?.toLowerCase().includes(keyword) ||
        packet.risk_flag?.toLowerCase().includes(keyword) ||
        packet.alert_reason?.toLowerCase().includes(keyword);

      const matchesProtocol =
        protocolFilter === "ALL" || packet.protocol === protocolFilter;

      const matchesRisk = riskFilter === "ALL" || packet.risk_flag === riskFilter;

      return matchesSearch && matchesProtocol && matchesRisk;
    });
  }, [packets, searchTerm, protocolFilter, riskFilter]);

  const totalPackets = filteredPackets.length;
  const alertPackets = filteredPackets.filter((p) => p.risk_flag === "ALERT").length;
  const suspiciousPackets = filteredPackets.filter((p) => p.risk_flag === "SUSPICIOUS").length;
  const normalPackets = totalPackets - alertPackets - suspiciousPackets;

  const protocolCounts = useMemo(() => countBy(filteredPackets, "protocol"), [filteredPackets]);
  const sourceCounts = useMemo(() => countBy(filteredPackets, "src_ip"), [filteredPackets]);
  const portCounts = useMemo(() => countBy(filteredPackets, "dst_port"), [filteredPackets]);

  const topSourceIP = getTopItem(sourceCounts);
  const topPort = getTopItem(portCounts);
  const topProtocol = getTopItem(protocolCounts);

  const chartData = {
    labels: Object.keys(protocolCounts).length ? Object.keys(protocolCounts) : ["No Data"],
    datasets: [
      {
        data: Object.values(protocolCounts).length ? Object.values(protocolCounts) : [1],
        backgroundColor: ["#22d3ee", "#38bdf8", "#a78bfa", "#facc15", "#fb7185"],
        borderColor: "#020617",
        borderWidth: 2,
      },
    ],
  };

  const lineData = {
    labels: filteredPackets.length
      ? filteredPackets.map((_, index) => `P${index + 1}`)
      : ["No Data"],
    datasets: [
      {
        label: "Packets Captured",
        data: filteredPackets.length ? filteredPackets.map((_, index) => index + 1) : [0],
        borderColor: "#22d3ee",
        backgroundColor: "rgba(34, 211, 238, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const clearFilters = () => {
    setSearchTerm("");
    setProtocolFilter("ALL");
    setRiskFilter("ALL");
  };

  const downloadCSV = () => {
    const headers = [
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
    ];

    const rows = filteredPackets.map((packet) =>
      headers.map((header) => `"${packet[header] || ""}"`).join(",")
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    downloadFile(csvContent, "netsniff_filtered_packets.csv", "text/csv");
  };

  const downloadSecurityReport = () => {
    const report = `
NetSniff-Lite Security Report
Generated At: ${new Date().toLocaleString()}

Summary
-------
Total Visible Packets: ${totalPackets}
Normal Packets: ${normalPackets}
Suspicious Packets: ${suspiciousPackets}
Alert Packets: ${alertPackets}

Threat Intelligence
-------------------
Top Source IP: ${topSourceIP.label} (${topSourceIP.count})
Top Destination Port: ${topPort.label} (${topPort.count})
Most Used Protocol: ${topProtocol.label} (${topProtocol.count})

Detected Alerts
---------------
${
  filteredPackets.filter((p) => p.risk_flag !== "NORMAL").length
    ? filteredPackets
        .filter((p) => p.risk_flag !== "NORMAL")
        .map(
          (p, i) =>
            `${i + 1}. [${p.risk_flag}] ${p.src_ip} -> ${p.dst_ip} | ${p.protocol} | ${p.alert_reason}`
        )
        .join("\n")
    : "No suspicious or alert packets detected."
}

Ethical Usage Notice
--------------------
This tool is for educational cybersecurity learning and should only be used on your own network or in environments where you have permission.
`;

    downloadFile(report, "netsniff_security_report.txt", "text/plain");
  };

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.18),_transparent_35%)]" />

      <nav className="sticky top-0 z-50 border-b border-cyan-400/20 bg-slate-950/80 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-2">
              <Network className="text-cyan-300" />
            </div>
            <div>
              <h2 className="font-bold">NetSniff-Lite</h2>
              <p className="text-xs text-slate-400">CodeAlpha Task 1</p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-cyan-400/20 bg-slate-900/70 px-4 py-2 text-sm md:flex">
            <span
              className={`h-2 w-2 rounded-full ${
                apiStatus === "CONNECTED"
                  ? "bg-emerald-400"
                  : apiStatus === "OFFLINE"
                  ? "bg-red-400"
                  : "bg-yellow-400"
              }`}
            />
            API {apiStatus}
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-3xl border border-cyan-400/20 bg-slate-900/70 p-8 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Live Network Packet Analyzer
          </p>

          <div className="mt-4 grid gap-6 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
            <div>
              <h1 className="text-4xl font-black md:text-6xl">
                NetSniff-Lite Dashboard
              </h1>
              <p className="mt-4 max-w-3xl text-slate-300">
                A beginner-friendly yet professional packet monitoring dashboard
                powered by Scapy, Flask, React, Tailwind CSS, CSV logging, and
                rule-based threat detection.
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-400/20 bg-slate-950/70 p-5">
              <p className="text-sm text-slate-400">Live Mode</p>
              <h3 className="mt-1 text-2xl font-bold text-cyan-300">
                Auto-refresh: 3s
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Last updated: {lastUpdated}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={loadPackets} className="btn-cyan">
              <RefreshCw size={18} />
              Refresh Data
            </button>

            <button
              onClick={downloadCSV}
              disabled={filteredPackets.length === 0}
              className="btn-green disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Download size={18} />
              Download CSV
            </button>

            <button
              onClick={downloadSecurityReport}
              disabled={filteredPackets.length === 0}
              className="btn-purple disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FileDown size={18} />
              Security Report
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <StatusBox status={status} lastUpdated={lastUpdated} />
          <ApiBox apiStatus={apiStatus} />
        </div>

        <div className="mt-6 rounded-3xl border border-cyan-400/20 bg-slate-900/70 p-5 backdrop-blur-xl">
          <div className="grid gap-4 lg:grid-cols-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search IP, protocol, risk, alert reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-3 text-slate-400" size={18} />
              <select
                value={protocolFilter}
                onChange={(e) => setProtocolFilter(e.target.value)}
                className="input pl-10"
              >
                <option value="ALL">All Protocols</option>
                <option value="TCP">TCP</option>
                <option value="UDP">UDP</option>
                <option value="ICMP">ICMP</option>
                <option value="ARP">ARP</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            <div className="flex gap-3">
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="input"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="NORMAL">NORMAL</option>
                <option value="SUSPICIOUS">SUSPICIOUS</option>
                <option value="ALERT">ALERT</option>
              </select>

              <button onClick={clearFilters} className="rounded-xl border border-red-400/40 bg-red-400/10 px-4 text-red-200 hover:bg-red-400/20">
                <XCircle size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-4">
          <Card icon={<Wifi />} title="Visible Packets" value={totalPackets} color="text-cyan-300" />
          <Card icon={<ShieldCheck />} title="Normal Packets" value={normalPackets} color="text-emerald-300" />
          <Card icon={<Activity />} title="Suspicious" value={suspiciousPackets} color="text-yellow-300" />
          <Card icon={<AlertTriangle />} title="Alerts" value={alertPackets} color="text-red-300" />
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-4">
          <MiniCard title="Top Source IP" value={topSourceIP.label} sub={`${topSourceIP.count} packets`} />
          <MiniCard title="Top Destination Port" value={topPort.label} sub={`${topPort.count} hits`} />
          <MiniCard title="Most Used Protocol" value={topProtocol.label} sub={`${topProtocol.count} packets`} />
          <MiniCard title="Risk Ratio" value={`${alertPackets + suspiciousPackets}/${totalPackets}`} sub="flagged packets" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Panel title="Protocol Distribution" icon={<BarChart3 className="text-cyan-300" />}>
            <Doughnut data={chartData} />
          </Panel>

          <Panel title="Traffic Timeline" icon={<Radio className="text-cyan-300" />}>
            <Line data={lineData} />
          </Panel>
        </div>

        <AlertPanel packets={filteredPackets} />
        <PacketTable packets={filteredPackets} riskBadge={riskBadge} />

        <div className="mt-8 rounded-3xl border border-amber-400/20 bg-amber-400/10 p-5 text-amber-100">
          <div className="flex items-start gap-3">
            <Lock className="mt-1" />
            <div>
              <h3 className="font-bold">Ethical Usage Notice</h3>
              <p className="mt-1 text-sm text-amber-100/80">
                NetSniff-Lite is created only for educational cybersecurity
                learning. Use it only on your own network or in environments
                where you have clear permission.
              </p>
            </div>
          </div>
        </div>

        <footer className="mt-10 border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
          NetSniff-Lite • CodeAlpha Cyber Security Internship • Built with Python,
          Scapy, Flask, React, Tailwind CSS v4 and Chart.js
        </footer>
      </section>
    </main>
  );
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || "N/A";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function getTopItem(counts) {
  const entries = Object.entries(counts);
  if (!entries.length) return { label: "N/A", count: 0 };

  const [label, count] = entries.sort((a, b) => b[1] - a[1])[0];
  return { label, count };
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

function StatusBox({ status, lastUpdated }) {
  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-slate-900/70 p-4 text-sm text-cyan-200">
      <p>Status: {status}</p>
      <p className="mt-1 text-slate-400">Last updated: {lastUpdated}</p>
    </div>
  );
}

function ApiBox({ apiStatus }) {
  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-slate-900/70 p-4 text-sm">
      <div className="flex items-center gap-2">
        <Server size={18} className="text-cyan-300" />
        API Connection:
        <span
          className={
            apiStatus === "CONNECTED"
              ? "text-emerald-300"
              : apiStatus === "OFFLINE"
              ? "text-red-300"
              : "text-yellow-300"
          }
        >
          {apiStatus}
        </span>
      </div>
      <p className="mt-1 text-slate-400">Endpoint: {API_URL}</p>
    </div>
  );
}

function Card({ icon, title, value, color }) {
  return (
    <div className="rounded-3xl border border-cyan-400/20 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/40 backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-300/40">
      <div className={`mb-4 ${color}`}>{icon}</div>
      <p className="text-sm text-slate-400">{title}</p>
      <h2 className="text-3xl font-black">{value}</h2>
    </div>
  );
}

function MiniCard({ title, value, sub }) {
  return (
    <div className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-4">
      <p className="text-sm text-slate-400">{title}</p>
      <h3 className="mt-1 truncate text-xl font-bold text-white">{value}</h3>
      <p className="mt-1 text-xs text-cyan-300">{sub}</p>
    </div>
  );
}

function Panel({ title, icon, children }) {
  return (
    <div className="rounded-3xl border border-cyan-400/20 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/40 backdrop-blur-xl">
      <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

function AlertPanel({ packets }) {
  const riskyPackets = packets.filter((p) => p.risk_flag !== "NORMAL");

  return (
    <div className="mt-8 rounded-3xl border border-red-400/20 bg-slate-900/70 p-6 backdrop-blur-xl">
      <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
        <AlertTriangle className="text-red-300" />
        Alert Panel
      </h3>

      <div className="grid gap-3">
        {riskyPackets.length === 0 ? (
          <p className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-emerald-200">
            No alerts detected yet.
          </p>
        ) : (
          riskyPackets.map((packet, index) => (
            <div key={index} className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4">
              <p className="font-semibold text-red-200">
                {packet.risk_flag}: {packet.alert_reason}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                {packet.src_ip} → {packet.dst_ip} | {packet.protocol}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function PacketTable({ packets, riskBadge }) {
  return (
    <div className="mt-8 rounded-3xl border border-cyan-400/20 bg-slate-900/70 p-6 backdrop-blur-xl">
      <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
        <FileText className="text-cyan-300" />
        Live Packet Feed
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-300">
              <th className="p-3">Time</th>
              <th className="p-3">Source</th>
              <th className="p-3">Destination</th>
              <th className="p-3">Protocol</th>
              <th className="p-3">TTL</th>
              <th className="p-3">Risk</th>
            </tr>
          </thead>

          <tbody>
            {packets.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-400">
                  Waiting for packets... Start the sniffer and click Refresh Data.
                </td>
              </tr>
            ) : (
              packets.map((packet, index) => (
                <tr key={index} className="border-b border-slate-800 hover:bg-slate-800/60">
                  <td className="p-3 text-slate-300">{packet.timestamp}</td>
                  <td className="p-3">{packet.src_ip}:{packet.src_port}</td>
                  <td className="p-3">{packet.dst_ip}:{packet.dst_port}</td>
                  <td className="p-3 text-cyan-300">{packet.protocol}</td>
                  <td className="p-3">{packet.ttl}</td>
                  <td className="p-3">
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskBadge(packet.risk_flag)}`}>
                      {packet.risk_flag}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;