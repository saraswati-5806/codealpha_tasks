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

const SAMPLE_PACKETS = [
  {
    timestamp: "2026-06-05 01:10:01",
    src_ip: "192.168.1.37",
    dst_ip: "142.250.71.99",
    protocol: "UDP",
    src_port: "57825",
    dst_port: "443",
    ttl: "128",
    payload: "Encrypted HTTPS/QUIC traffic",
    risk_flag: "NORMAL",
    alert_reason: "No suspicious activity detected",
  },
  {
    timestamp: "2026-06-05 01:10:02",
    src_ip: "172.64.148.235",
    dst_ip: "192.168.1.37",
    protocol: "TCP",
    src_port: "443",
    dst_port: "57047",
    ttl: "59",
    payload: "TLS encrypted web response",
    risk_flag: "NORMAL",
    alert_reason: "No suspicious activity detected",
  },
  {
    timestamp: "2026-06-05 01:10:04",
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

function parseCSV(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",");

  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const row = {};

    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || "";
    });

    return row;
  });
}

function App() {
  const [packets, setPackets] = useState(SAMPLE_PACKETS);
  const [status, setStatus] = useState("Demo data loaded");
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const [searchTerm, setSearchTerm] = useState("");
  const [protocolFilter, setProtocolFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");

  const loadPackets = async () => {
    setStatus("Refreshing packet data...");

    try {
      const response = await fetch(`/sample_packets.csv?time=${Date.now()}`);

      if (!response.ok) {
        setPackets(SAMPLE_PACKETS);
        setStatus("CSV not found. Showing built-in demo data.");
        setLastUpdated(new Date().toLocaleTimeString());
        return;
      }

      const csvText = await response.text();
      const parsed = parseCSV(csvText);

      if (parsed.length > 0) {
        setPackets(parsed);
        setStatus(`Loaded ${parsed.length} packets from CSV.`);
      } else {
        setPackets(SAMPLE_PACKETS);
        setStatus("CSV is empty. Showing demo packet data.");
      }

      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      setPackets(SAMPLE_PACKETS);
      setStatus("Could not load CSV. Showing demo packet data.");
      setLastUpdated(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    loadPackets();
    const interval = setInterval(loadPackets, 5000);
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
  const suspiciousPackets = filteredPackets.filter(
    (p) => p.risk_flag === "SUSPICIOUS"
  ).length;

  const protocolCounts = useMemo(() => {
    return filteredPackets.reduce((acc, packet) => {
      acc[packet.protocol] = (acc[packet.protocol] || 0) + 1;
      return acc;
    }, {});
  }, [filteredPackets]);

  const chartData = {
    labels: Object.keys(protocolCounts),
    datasets: [
      {
        data: Object.values(protocolCounts),
        backgroundColor: ["#22d3ee", "#38bdf8", "#a78bfa", "#facc15", "#fb7185"],
        borderColor: "#020617",
        borderWidth: 2,
      },
    ],
  };

  const lineData = {
    labels: filteredPackets.map((_, index) => `P${index + 1}`),
    datasets: [
      {
        label: "Packets Captured",
        data: filteredPackets.map((_, index) => index + 1),
        borderColor: "#22d3ee",
        backgroundColor: "rgba(34, 211, 238, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const riskBadge = (risk) => {
    if (risk === "ALERT") return "bg-red-500/20 text-red-300 border-red-500/40";
    if (risk === "SUSPICIOUS")
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/40";
    return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
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
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "netsniff_filtered_packets.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="border-b border-cyan-400/20 bg-slate-900/80 px-6 py-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            
            <h1 className="mt-2 text-3xl font-bold text-white md:text-5xl">
              NetSniff-Lite Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-slate-300">
              Real-time packet monitoring dashboard with protocol analysis,
              search filters, CSV export, and rule-based threat alerts.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={loadPackets}
              className="flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-4 py-3 text-cyan-200 transition hover:bg-cyan-400/20"
            >
              <RefreshCw size={18} />
              Refresh Data
            </button>

            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-emerald-200 transition hover:bg-emerald-400/20"
            >
              <Download size={18} />
              Download CSV
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 rounded-xl border border-cyan-400/20 bg-slate-900 p-4 text-sm text-cyan-200">
          Status: {status} | Last updated: {lastUpdated}
        </div>

        <div className="mb-6 grid gap-4 rounded-2xl border border-cyan-400/20 bg-slate-900 p-5 lg:grid-cols-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by IP, protocol, risk, or alert reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-cyan-400"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-3 text-slate-400" size={18} />
            <select
              value={protocolFilter}
              onChange={(e) => setProtocolFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-cyan-400"
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
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="NORMAL">NORMAL</option>
              <option value="SUSPICIOUS">SUSPICIOUS</option>
              <option value="ALERT">ALERT</option>
            </select>

            <button
              onClick={clearFilters}
              className="rounded-xl border border-red-400/40 bg-red-400/10 px-4 text-red-200 transition hover:bg-red-400/20"
              title="Clear filters"
            >
              <XCircle size={20} />
            </button>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-4">
          <div className="rounded-2xl border border-cyan-400/20 bg-slate-900 p-5">
            <Wifi className="mb-4 text-cyan-300" />
            <p className="text-sm text-slate-400">Visible Packets</p>
            <h2 className="text-3xl font-bold">{totalPackets}</h2>
          </div>

          <div className="rounded-2xl border border-emerald-400/20 bg-slate-900 p-5">
            <ShieldCheck className="mb-4 text-emerald-300" />
            <p className="text-sm text-slate-400">Normal Packets</p>
            <h2 className="text-3xl font-bold">
              {totalPackets - alertPackets - suspiciousPackets}
            </h2>
          </div>

          <div className="rounded-2xl border border-yellow-400/20 bg-slate-900 p-5">
            <Activity className="mb-4 text-yellow-300" />
            <p className="text-sm text-slate-400">Suspicious</p>
            <h2 className="text-3xl font-bold">{suspiciousPackets}</h2>
          </div>

          <div className="rounded-2xl border border-red-400/20 bg-slate-900 p-5">
            <AlertTriangle className="mb-4 text-red-300" />
            <p className="text-sm text-slate-400">Alerts</p>
            <h2 className="text-3xl font-bold">{alertPackets}</h2>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-cyan-400/20 bg-slate-900 p-6">
            <h3 className="mb-4 text-xl font-semibold">Protocol Distribution</h3>
            <Doughnut data={chartData} />
          </div>

          <div className="rounded-2xl border border-cyan-400/20 bg-slate-900 p-6">
            <h3 className="mb-4 text-xl font-semibold">Traffic Timeline</h3>
            <Line data={lineData} />
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-red-400/20 bg-slate-900 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <AlertTriangle className="text-red-300" />
            Alert Panel
          </h3>

          <div className="grid gap-3">
            {filteredPackets
              .filter((p) => p.risk_flag !== "NORMAL")
              .map((packet, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-red-400/20 bg-red-500/10 p-4"
                >
                  <p className="font-semibold text-red-200">
                    {packet.risk_flag}: {packet.alert_reason}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    {packet.src_ip} → {packet.dst_ip} | {packet.protocol}
                  </p>
                </div>
              ))}

            {filteredPackets.filter((p) => p.risk_flag !== "NORMAL").length ===
              0 && <p className="text-slate-400">No alerts detected yet.</p>}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-cyan-400/20 bg-slate-900 p-6">
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
                {filteredPackets.map((packet, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-800 hover:bg-slate-800/60"
                  >
                    <td className="p-3 text-slate-300">{packet.timestamp}</td>
                    <td className="p-3">
                      {packet.src_ip}:{packet.src_port}
                    </td>
                    <td className="p-3">
                      {packet.dst_ip}:{packet.dst_port}
                    </td>
                    <td className="p-3 text-cyan-300">{packet.protocol}</td>
                    <td className="p-3">{packet.ttl}</td>
                    <td className="p-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskBadge(
                          packet.risk_flag
                        )}`}
                      >
                        {packet.risk_flag}
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredPackets.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-slate-400">
                      No packets match your current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;