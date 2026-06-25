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
  Play,
  Pause,
  Trash2,
  Eye,
  X,
  Zap,
  Timer,
  Globe2,
  ShieldAlert,
  Settings,
  FileJson,
  Gauge,
  Route,
  Moon,
  Sun,
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
  const [isLive, setIsLive] = useState(true);
  const [selectedPacket, setSelectedPacket] = useState(null);
  const [sessionStartedAt] = useState(new Date());
  const [theme, setTheme] = useState("dark");
  const [refreshSpeed, setRefreshSpeed] = useState(3000);
  const [packetLimit, setPacketLimit] = useState(500);
  const [showSettings, setShowSettings] = useState(false);

  const loadPackets = async (force = false) => {
    if (!isLive && !force) return;

    setStatus("Refreshing live packet data...");

    try {
      const response = await fetch(`${API_URL}?time=${Date.now()}`);

      if (!response.ok) {
        throw new Error("API response failed");
      }

      const apiData = await response.json();
      const livePackets = apiData.packets || [];

      setPackets(livePackets.slice(-packetLimit));
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
    loadPackets(true);

    const interval = setInterval(() => {
      loadPackets(false);
    }, refreshSpeed);

    return () => clearInterval(interval);
  }, [isLive, refreshSpeed, packetLimit]);

  const filteredPackets = useMemo(() => {
    return packets.filter((packet) => {
      const keyword = searchTerm.toLowerCase();

      const matchesSearch =
        packet.timestamp?.toLowerCase().includes(keyword) ||
        packet.src_ip?.toLowerCase().includes(keyword) ||
        packet.dst_ip?.toLowerCase().includes(keyword) ||
        packet.protocol?.toLowerCase().includes(keyword) ||
        packet.risk_flag?.toLowerCase().includes(keyword) ||
        packet.alert_reason?.toLowerCase().includes(keyword) ||
        packet.payload?.toLowerCase().includes(keyword) ||
        packet.src_port?.toString().includes(keyword) ||
        packet.dst_port?.toString().includes(keyword) ||
        packet.ttl?.toString().includes(keyword);

      const matchesProtocol =
        protocolFilter === "ALL" || packet.protocol === protocolFilter;

      const matchesRisk =
        riskFilter === "ALL" || packet.risk_flag === riskFilter;

      return matchesSearch && matchesProtocol && matchesRisk;
    });
  }, [packets, searchTerm, protocolFilter, riskFilter]);

  const totalPackets = filteredPackets.length;
  const alertPackets = filteredPackets.filter((p) => p.risk_flag === "ALERT").length;
  const suspiciousPackets = filteredPackets.filter((p) => p.risk_flag === "SUSPICIOUS").length;
  const normalPackets = totalPackets - alertPackets - suspiciousPackets;

  const protocolCounts = useMemo(() => countBy(filteredPackets, "protocol"), [filteredPackets]);
  const sourceCounts = useMemo(() => countBy(filteredPackets, "src_ip"), [filteredPackets]);
  const destinationCounts = useMemo(() => countBy(filteredPackets, "dst_ip"), [filteredPackets]);
  const portCounts = useMemo(() => countBy(filteredPackets, "dst_port"), [filteredPackets]);

  const topSourceIP = getTopItem(sourceCounts);
  const topDestination = getTopItem(destinationCounts);
  const topPort = getTopItem(portCounts);
  const topProtocol = getTopItem(protocolCounts);

  const uniqueHosts = new Set([
    ...filteredPackets.map((p) => p.src_ip),
    ...filteredPackets.map((p) => p.dst_ip),
  ]).size;

  const averageTTL =
    filteredPackets.length > 0
      ? Math.round(
          filteredPackets.reduce((sum, p) => sum + Number(p.ttl || 0), 0) /
            filteredPackets.length
        )
      : 0;

  const largestPacket =
    filteredPackets.length > 0
      ? Math.max(...filteredPackets.map((p) => (p.payload || "").length))
      : 0;

  const averagePacketSize =
    filteredPackets.length > 0
      ? Math.round(
          filteredPackets.reduce((sum, p) => sum + (p.payload || "").length, 0) /
            filteredPackets.length
        )
      : 0;

  const sessionSeconds = Math.max(1, Math.floor((new Date() - sessionStartedAt) / 1000));
  const packetsPerSecond = (totalPackets / sessionSeconds).toFixed(2);
  const alertsPerSecond = (alertPackets / sessionSeconds).toFixed(2);
  const protocolsPerSecond = (Object.keys(protocolCounts).length / sessionSeconds).toFixed(2);
  const trafficRate = `${packetsPerSecond} pkt/s`;
  const sessionDuration = getSessionDuration(sessionStartedAt);

  const severity = getSeverity(alertPackets, suspiciousPackets, totalPackets);

  const protocolChartData = {
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

  const riskTimelineData = buildRiskTimeline(filteredPackets);

  const riskTimelineChart = {
    labels: riskTimelineData.labels,
    datasets: [
      {
        label: "NORMAL",
        data: riskTimelineData.normal,
        borderColor: "#34d399",
        backgroundColor: "rgba(52, 211, 153, 0.15)",
        tension: 0.4,
      },
      {
        label: "SUSPICIOUS",
        data: riskTimelineData.suspicious,
        borderColor: "#facc15",
        backgroundColor: "rgba(250, 204, 21, 0.15)",
        tension: 0.4,
      },
      {
        label: "ALERT",
        data: riskTimelineData.alert,
        borderColor: "#fb7185",
        backgroundColor: "rgba(251, 113, 133, 0.15)",
        tension: 0.4,
      },
    ],
  };

  const riskBadge = (risk) => {
    if (risk === "ALERT") return "bg-red-500/20 text-red-300 border-red-500/40";
    if (risk === "SUSPICIOUS") return "bg-yellow-500/20 text-yellow-300 border-yellow-500/40";
    return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
  };

  const clearFilters = () => {
    setSearchTerm("");
    setProtocolFilter("ALL");
    setRiskFilter("ALL");
  };

  const clearDashboardView = () => {
    setPackets([]);
    setSelectedPacket(null);
    setStatus("Dashboard view cleared. Click Refresh Data to reload.");
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

    downloadFile([headers.join(","), ...rows].join("\n"), "netsniff_filtered_packets.csv", "text/csv");
  };

  const downloadJSON = () => {
    downloadFile(
      JSON.stringify(filteredPackets, null, 2),
      "netsniff_packets.json",
      "application/json"
    );
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
Unique Hosts: ${uniqueHosts}
Average TTL: ${averageTTL}
Average Packet Size: ${averagePacketSize}
Largest Packet Payload: ${largestPacket}
Session Duration: ${sessionDuration}
Packets/sec: ${packetsPerSecond}
Alerts/sec: ${alertsPerSecond}

Threat Intelligence
-------------------
Top Talker IP: ${topSourceIP.label} (${topSourceIP.count})
Most Active Destination: ${topDestination.label} (${topDestination.count})
Most Targeted Port: ${topPort.label} (${topPort.count})
Most Used Protocol: ${topProtocol.label} (${topProtocol.count})
Threat Severity: ${severity.label}

Detected Alerts
---------------
${
  filteredPackets.filter((packet) => packet.risk_flag !== "NORMAL").length
    ? filteredPackets
        .filter((packet) => packet.risk_flag !== "NORMAL")
        .map(
          (packet, index) =>
            `${index + 1}. [${packet.risk_flag}] ${packet.src_ip} -> ${packet.dst_ip} | ${packet.protocol} | ${packet.alert_reason}`
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

  const themeClass =
    theme === "dark"
      ? "bg-slate-950 text-white"
      : "bg-slate-100 text-slate-950";

  return (
    <main className={`min-h-screen overflow-hidden ${themeClass}`}>
      {theme === "dark" && (
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.18),_transparent_35%)]" />
      )}

      <nav className="sticky top-0 z-50 border-b border-cyan-400/20 bg-slate-950/90 px-6 py-4 text-white backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-2">
              <Network className="text-cyan-300" />
            </div>
            <div>
              <h2 className="font-bold">NetSniff-Lite</h2>
              <p className="text-xs text-slate-400">Smart Network Packet Analyzer</p>
            </div>
          </div>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="btn-cyan"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <LandingHero
          isLive={isLive}
          lastUpdated={lastUpdated}
          loadPackets={() => loadPackets(true)}
          setIsLive={setIsLive}
          clearDashboardView={clearDashboardView}
          downloadCSV={downloadCSV}
          downloadJSON={downloadJSON}
          downloadSecurityReport={downloadSecurityReport}
          filteredPackets={filteredPackets}
          setShowSettings={setShowSettings}
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <StatusBox status={status} lastUpdated={lastUpdated} />
          <ApiBox apiStatus={apiStatus} />
        </div>

        {showSettings && (
          <SettingsPanel
            refreshSpeed={refreshSpeed}
            setRefreshSpeed={setRefreshSpeed}
            packetLimit={packetLimit}
            setPacketLimit={setPacketLimit}
            theme={theme}
            setTheme={setTheme}
          />
        )}

        <ControlPanel
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          protocolFilter={protocolFilter}
          setProtocolFilter={setProtocolFilter}
          riskFilter={riskFilter}
          setRiskFilter={setRiskFilter}
          clearFilters={clearFilters}
        />

        <div className="mt-6 grid gap-5 md:grid-cols-4">
          <Card icon={<Wifi />} title="Visible Packets" value={totalPackets} color="text-cyan-300" />
          <Card icon={<ShieldCheck />} title="Normal Packets" value={normalPackets} color="text-emerald-300" />
          <Card icon={<Activity />} title="Suspicious" value={suspiciousPackets} color="text-yellow-300" />
          <Card icon={<AlertTriangle />} title="Alerts Today" value={alertPackets} color="text-red-300" />
        </div>

        <LiveStats
          packetsPerSecond={packetsPerSecond}
          trafficRate={trafficRate}
          alertsPerSecond={alertsPerSecond}
          protocolsPerSecond={protocolsPerSecond}
        />

        <ThreatIntelligenceGrid
          topSourceIP={topSourceIP}
          topDestination={topDestination}
          topPort={topPort}
          topProtocol={topProtocol}
          uniqueHosts={uniqueHosts}
          averageTTL={averageTTL}
          sessionDuration={sessionDuration}
          averagePacketSize={averagePacketSize}
          largestPacket={largestPacket}
          severity={severity}
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Panel title="Protocol Distribution" icon={<BarChart3 className="text-cyan-300" />}>
            <Doughnut data={protocolChartData} />
          </Panel>

          <Panel title="Packet Risk Timeline" icon={<Radio className="text-cyan-300" />}>
            <Line data={riskTimelineChart} />
          </Panel>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <SeverityGauge severity={severity} />
          <PacketFlowDiagram />
        </div>

        <AlertPanel packets={filteredPackets} />

        <PacketTable
          packets={filteredPackets}
          riskBadge={riskBadge}
          setSelectedPacket={setSelectedPacket}
        />

        <EthicalNotice />

        <footer className="mt-10 border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
          NetSniff-Lite • CodeAlpha Cyber Security Internship • Python • Scapy • Flask • React • Tailwind CSS v4
        </footer>
      </section>

      {selectedPacket && (
        <PacketDrawer
          packet={selectedPacket}
          closeDrawer={() => setSelectedPacket(null)}
          riskBadge={riskBadge}
        />
      )}
    </main>
  );
}

function LandingHero({
  isLive,
  lastUpdated,
  loadPackets,
  setIsLive,
  clearDashboardView,
  downloadCSV,
  downloadJSON,
  downloadSecurityReport,
  filteredPackets,
  setShowSettings,
}) {
  return (
    <div className="rounded-3xl border border-cyan-400/20 bg-slate-900/80 p-8 text-white shadow-2xl shadow-cyan-950/40 backdrop-blur-xl">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
        Modern Network Traffic Analyzer
      </p>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
        <div>
          <h1 className="text-4xl font-black md:text-6xl">NetSniff-Lite</h1>
          <p className="mt-4 max-w-3xl text-slate-300">
            Live packet monitoring, threat detection, real-time analytics, packet
            inspection, and downloadable cybersecurity reports.
          </p>

          <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-300">
            <span className="hero-pill">Live Packet Monitoring</span>
            <span className="hero-pill">Threat Detection</span>
            <span className="hero-pill">Real-time Dashboard</span>
            <span className="hero-pill">Security Reports</span>
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-400/20 bg-slate-950/70 p-5">
          <p className="text-sm text-slate-400">Live Monitoring</p>
          <h3 className={`mt-1 text-2xl font-bold ${isLive ? "text-emerald-300" : "text-yellow-300"}`}>
            {isLive ? "Active" : "Paused"}
          </h3>
          <p className="mt-2 text-sm text-slate-400">Last updated: {lastUpdated}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={loadPackets} className="btn-cyan"><RefreshCw size={18} />Refresh</button>
        <button onClick={() => setIsLive(true)} className="btn-green"><Play size={18} />Start</button>
        <button onClick={() => setIsLive(false)} className="btn-yellow"><Pause size={18} />Pause</button>
        <button onClick={clearDashboardView} className="btn-red"><Trash2 size={18} />Clear</button>
        <button onClick={downloadCSV} disabled={filteredPackets.length === 0} className="btn-green disabled:opacity-40"><Download size={18} />CSV</button>
        <button onClick={downloadJSON} disabled={filteredPackets.length === 0} className="btn-purple disabled:opacity-40"><FileJson size={18} />JSON</button>
        <button onClick={downloadSecurityReport} disabled={filteredPackets.length === 0} className="btn-purple disabled:opacity-40"><FileDown size={18} />TXT Report</button>
        <button onClick={() => setShowSettings((value) => !value)} className="btn-cyan"><Settings size={18} />Settings</button>
      </div>
    </div>
  );
}

function SettingsPanel({ refreshSpeed, setRefreshSpeed, packetLimit, setPacketLimit, theme, setTheme }) {
  return (
    <div className="mt-6 rounded-3xl border border-purple-400/20 bg-slate-900/80 p-5 text-white">
      <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
        <Settings className="text-purple-300" /> Settings Panel
      </h3>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-sm text-slate-300">
          Refresh Speed
          <select value={refreshSpeed} onChange={(e) => setRefreshSpeed(Number(e.target.value))} className="input mt-2">
            <option value={3000}>3 seconds</option>
            <option value={5000}>5 seconds</option>
            <option value={10000}>10 seconds</option>
          </select>
        </label>

        <label className="text-sm text-slate-300">
          Packet Limit
          <select value={packetLimit} onChange={(e) => setPacketLimit(Number(e.target.value))} className="input mt-2">
            <option value={100}>100 packets</option>
            <option value={250}>250 packets</option>
            <option value={500}>500 packets</option>
          </select>
        </label>

        <label className="text-sm text-slate-300">
          Theme
          <select value={theme} onChange={(e) => setTheme(e.target.value)} className="input mt-2">
            <option value="dark">Dark SOC Theme</option>
            <option value="light">Light Report Theme</option>
          </select>
        </label>
      </div>
    </div>
  );
}

function ControlPanel({ searchTerm, setSearchTerm, protocolFilter, setProtocolFilter, riskFilter, setRiskFilter, clearFilters }) {
  return (
    <div className="mt-6 rounded-3xl border border-cyan-400/20 bg-slate-900/80 p-5 text-white">
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search IP, protocol, payload, risk, alert, TTL, port, date..." className="input pl-10" />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-3 text-slate-400" size={18} />
          <select value={protocolFilter} onChange={(e) => setProtocolFilter(e.target.value)} className="input pl-10">
            <option value="ALL">All Protocols</option>
            <option value="TCP">TCP</option>
            <option value="UDP">UDP</option>
            <option value="ICMP">ICMP</option>
            <option value="ARP">ARP</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>

        <div className="flex gap-3">
          <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="input">
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
  );
}

function LiveStats({ packetsPerSecond, trafficRate, alertsPerSecond, protocolsPerSecond }) {
  return (
    <div className="mt-6 grid gap-5 md:grid-cols-4">
      <MiniCard icon={<Zap />} title="Packets/sec" value={packetsPerSecond} sub="live rate" />
      <MiniCard icon={<Activity />} title="Traffic Rate" value={trafficRate} sub="current flow" />
      <MiniCard icon={<ShieldAlert />} title="Alerts/sec" value={alertsPerSecond} sub="risk velocity" />
      <MiniCard icon={<Radio />} title="Protocols/sec" value={protocolsPerSecond} sub="protocol diversity" />
    </div>
  );
}

function ThreatIntelligenceGrid({ topSourceIP, topDestination, topPort, topProtocol, uniqueHosts, averageTTL, sessionDuration, averagePacketSize, largestPacket, severity }) {
  return (
    <div className="mt-6 grid gap-5 md:grid-cols-4">
      <MiniCard icon={<Globe2 />} title="Top Talker IP" value={topSourceIP.label} sub={`${topSourceIP.count} packets`} />
      <MiniCard icon={<Route />} title="Most Active Destination" value={topDestination.label} sub={`${topDestination.count} packets`} />
      <MiniCard icon={<Zap />} title="Most Targeted Port" value={topPort.label} sub={`${topPort.count} hits`} />
      <MiniCard icon={<Radio />} title="Most Used Protocol" value={topProtocol.label} sub={`${topProtocol.count} packets`} />
      <MiniCard icon={<Network />} title="Unique Hosts" value={uniqueHosts} sub="observed devices" />
      <MiniCard icon={<Activity />} title="Average TTL" value={averageTTL} sub="network distance" />
      <MiniCard icon={<Timer />} title="Session Duration" value={sessionDuration} sub="capture runtime" />
      <MiniCard icon={<FileText />} title="Average Packet Size" value={averagePacketSize} sub={`largest ${largestPacket}`} />
      <MiniCard icon={<Gauge />} title="Threat Severity" value={severity.label} sub={`${severity.score}% risk score`} />
    </div>
  );
}

function SeverityGauge({ severity }) {
  return (
    <Panel title="Threat Severity Gauge" icon={<Gauge className="text-red-300" />}>
      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative h-44 w-44 rounded-full border-[16px] border-slate-700">
          <div
            className="absolute inset-[-16px] rounded-full border-[16px] border-red-400"
            style={{ clipPath: `inset(${100 - severity.score}% 0 0 0)` }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-4xl font-black">{severity.score}%</p>
            <p className={`mt-1 font-bold ${severity.color}`}>{severity.label}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs">
          {["SAFE", "LOW", "MEDIUM", "HIGH", "CRITICAL"].map((level) => (
            <span key={level} className="hero-pill">{level}</span>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function PacketFlowDiagram() {
  return (
    <Panel title="Packet Flow Diagram" icon={<Route className="text-cyan-300" />}>
      <div className="grid gap-4 py-4 text-center md:grid-cols-4">
        {["Laptop", "Router", "Internet", "Destination"].map((item, index) => (
          <div key={item} className="flow-node">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10">
              {index === 0 ? <Wifi /> : index === 1 ? <Network /> : index === 2 ? <Globe2 /> : <Server />}
            </div>
            <p className="font-semibold">{item}</p>
            {index < 3 && <p className="mt-2 text-cyan-300">↓</p>}
          </div>
        ))}
      </div>
    </Panel>
  );
}

function AlertPanel({ packets }) {
  const riskyPackets = packets.filter((packet) => packet.risk_flag !== "NORMAL");

  return (
    <div className="mt-8 rounded-3xl border border-red-400/20 bg-slate-900/80 p-6 text-white">
      <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
        <AlertTriangle className="text-red-300" />
        Recent Threat Feed
      </h3>

      <div className="max-h-80 overflow-y-auto pr-2">
        {riskyPackets.length === 0 ? (
          <p className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-emerald-200">
            No alerts detected yet.
          </p>
        ) : (
          riskyPackets.slice(-10).map((packet, index) => (
            <div key={`${packet.timestamp}-${index}`} className="mb-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4">
              <p className="font-semibold text-red-200">{packet.timestamp} • {packet.risk_flag}</p>
              <p className="text-sm text-slate-300">{packet.alert_reason}</p>
              <p className="mt-1 text-sm text-slate-400">{packet.src_ip} → {packet.dst_ip}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function PacketTable({ packets, riskBadge, setSelectedPacket }) {
  return (
    <div className="mt-8 rounded-3xl border border-cyan-400/20 bg-slate-900/80 p-6 text-white">
      <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
        <FileText className="text-cyan-300" />
        Live Packet Feed
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-300">
              <th className="p-3">Time</th>
              <th className="p-3">Source</th>
              <th className="p-3">Destination</th>
              <th className="p-3">Protocol</th>
              <th className="p-3">TTL</th>
              <th className="p-3">Risk</th>
              <th className="p-3">Details</th>
            </tr>
          </thead>

          <tbody>
            {packets.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-slate-400">
                  Waiting for packets... Start the sniffer and click Refresh.
                </td>
              </tr>
            ) : (
              packets.map((packet, index) => (
                <tr key={`${packet.timestamp}-${index}`} className="border-b border-slate-800 hover:bg-slate-800/60">
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
                  <td className="p-3">
                    <button onClick={() => setSelectedPacket(packet)} className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-cyan-200 hover:bg-cyan-400/20">
                      <Eye size={16} />
                    </button>
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

function PacketDrawer({ packet, closeDrawer, riskBadge }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm">
      <div className="ml-auto h-full w-full max-w-xl overflow-y-auto border-l border-cyan-400/20 bg-slate-950 p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-cyan-200">Packet Details</h2>
          <button onClick={closeDrawer} className="rounded-xl border border-red-400/30 bg-red-400/10 p-2 text-red-200 hover:bg-red-400/20">
            <X />
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          <Detail label="Timestamp" value={packet.timestamp} />
          <Detail label="Source" value={`${packet.src_ip}:${packet.src_port}`} />
          <Detail label="Destination" value={`${packet.dst_ip}:${packet.dst_port}`} />
          <Detail label="TTL" value={packet.ttl} />
          <Detail label="Protocol" value={packet.protocol} />

          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Risk</p>
            <span className={`mt-2 inline-block rounded-full border px-3 py-1 text-xs font-semibold ${riskBadge(packet.risk_flag)}`}>
              {packet.risk_flag}
            </span>
          </div>

          <Detail label="Alert Reason" value={packet.alert_reason} />
          <Detail label="Payload ASCII" value={packet.payload || "No payload found"} />
          <Detail label="Payload HEX" value={toHex(packet.payload || "")} />
          <Detail label="Raw Packet JSON" value={JSON.stringify(packet, null, 2)} />
        </div>
      </div>
    </div>
  );
}

function StatusBox({ status, lastUpdated }) {
  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-4 text-sm text-cyan-200">
      <p>Status: {status}</p>
      <p className="mt-1 text-slate-400">Last updated: {lastUpdated}</p>
    </div>
  );
}

function ApiBox({ apiStatus }) {
  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-4 text-sm text-white">
      <div className="flex items-center gap-2">
        <Server size={18} className="text-cyan-300" />
        API Connection:
        <span className={apiStatus === "CONNECTED" ? "text-emerald-300" : apiStatus === "OFFLINE" ? "text-red-300" : "text-yellow-300"}>
          {apiStatus}
        </span>
      </div>
      <p className="mt-1 text-slate-400">Endpoint: {API_URL}</p>
    </div>
  );
}

function Card({ icon, title, value, color }) {
  return (
    <div className="rounded-3xl border border-cyan-400/20 bg-slate-900/80 p-5 text-white shadow-xl transition hover:-translate-y-1">
      <div className={`mb-4 ${color}`}>{icon}</div>
      <p className="text-sm text-slate-400">{title}</p>
      <h2 className="counter-number">{value}</h2>
    </div>
  );
}

function MiniCard({ icon, title, value, sub }) {
  return (
    <div className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-4 text-white transition hover:border-cyan-300/40">
      <div className="mb-2 text-cyan-300">{icon}</div>
      <p className="text-sm text-slate-400">{title}</p>
      <h3 className="mt-1 truncate text-xl font-bold">{value}</h3>
      <p className="mt-1 text-xs text-cyan-300">{sub}</p>
    </div>
  );
}

function Panel({ title, icon, children }) {
  return (
    <div className="rounded-3xl border border-cyan-400/20 bg-slate-900/80 p-6 text-white shadow-xl">
      <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <pre className="mt-1 whitespace-pre-wrap break-words text-sm text-white">{value}</pre>
    </div>
  );
}

function EthicalNotice() {
  return (
    <div className="mt-8 rounded-3xl border border-amber-400/20 bg-amber-400/10 p-5 text-amber-100">
      <div className="flex items-start gap-3">
        <Lock className="mt-1" />
        <div>
          <h3 className="font-bold">Ethical Usage Notice</h3>
          <p className="mt-1 text-sm text-amber-100/80">
            Use NetSniff-Lite only on your own network or in environments where you have permission.
          </p>
        </div>
      </div>
    </div>
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

function getSessionDuration(startDate) {
  const seconds = Math.floor((new Date() - startDate) / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function getSeverity(alerts, suspicious, total) {
  if (total === 0) return { label: "SAFE", score: 0, color: "text-emerald-300" };
  const score = Math.min(100, Math.round(((alerts * 3 + suspicious) / total) * 100));

  if (score >= 75) return { label: "CRITICAL", score, color: "text-red-400" };
  if (score >= 50) return { label: "HIGH", score, color: "text-orange-300" };
  if (score >= 25) return { label: "MEDIUM", score, color: "text-yellow-300" };
  if (score > 0) return { label: "LOW", score, color: "text-cyan-300" };
  return { label: "SAFE", score, color: "text-emerald-300" };
}

function buildRiskTimeline(packets) {
  const labels = packets.length ? packets.map((_, index) => `P${index + 1}`) : ["No Data"];

  return {
    labels,
    normal: packets.length ? packets.map((p) => (p.risk_flag === "NORMAL" ? 1 : 0)) : [0],
    suspicious: packets.length ? packets.map((p) => (p.risk_flag === "SUSPICIOUS" ? 1 : 0)) : [0],
    alert: packets.length ? packets.map((p) => (p.risk_flag === "ALERT" ? 1 : 0)) : [0],
  };
}

function toHex(text) {
  return text
    .split("")
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
    .join(" ");
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

export default App;