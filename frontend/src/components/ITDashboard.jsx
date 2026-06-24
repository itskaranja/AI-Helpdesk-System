import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import { useEffect, useState } from "react";
import TicketDetails from "./TicketDetails";

export default function ITDashboard() {
  const [summary, setSummary] = useState({});
  const [myTickets, setMyTickets] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [transferTickets, setTransferTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketsOverTime, setTicketsOverTime] = useState([]);
  const [workloadData, setWorkloadData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [activePage, setActivePage] = useState("dashboard");

  // FIX 1: Use the declared state variables consistently
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("employee");

  const itEmail = localStorage.getItem("email");
  const isAdmin = itEmail === "botieno.itse@nairobibottlers.com";

  const styles = {
    chartCard: {
      background: "rgba(255,255,255,0.08)",
      padding: "25px",
      borderRadius: "20px",
      marginBottom: "30px",
      backdropFilter: "blur(12px)",
    },
  };

  const loadDashboard = async () => {
    const summaryRes = await fetch("http://127.0.0.1:8001/dashboard/summary");
    const summaryData = await summaryRes.json();
    setSummary(summaryData);

    const myRes = await fetch(`http://127.0.0.1:8001/my-tickets/${itEmail}`);
    const myData = await myRes.json();
    setMyTickets(myData);

    const allRes = await fetch("http://127.0.0.1:8001/tickets");
    const allData = await allRes.json();
    setAllTickets(allData);

    const transfers = allData.filter(
      (ticket) =>
        ticket.transfer_requested_to === itEmail &&
        ticket.transfer_status === "pending"
    );
    setTransferTickets(transfers);

    if (isAdmin) {
      const trendRes = await fetch("http://127.0.0.1:8001/analytics/tickets-over-time");
      const trendData = await trendRes.json();
      setTicketsOverTime(trendData);

      const workloadRes = await fetch("http://127.0.0.1:8001/analytics/it-workload");
      const workload = await workloadRes.json();
      setWorkloadData(workload);

      const categoryRes = await fetch("http://127.0.0.1:8001/analytics/ticket-categories");
      const categories = await categoryRes.json();
      setCategoryData(categories);
    }
  };

  // FIX 2: Use the declared state variables (newUserName etc.) and the defined createUser function
  const createUser = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8001/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
        }),
      });
      const data = await res.json();
      alert(data.message);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("employee");
    } catch (err) {
      console.log(err);
      alert("Failed to create user");
    }
  };

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(() => {
      loadDashboard();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (selectedTicket) {
    return (
      <TicketDetails
        ticket={selectedTicket}
        goBack={() => {
          setSelectedTicket(null);
          loadDashboard();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-red-950 via-black to-gray-900 text-white">

      {/* ========================= SIDEBAR ========================= */}
      <div
        className="w-[260px] border-r border-white/10 p-6 flex flex-col relative overflow-hidden"
        style={{
          backgroundImage:
            "url('https://cdn.shopify.com/s/files/1/0349/9055/5181/files/O1CN015Kst2r1UTkdl7b9Jn__56612519_jpg_Q75_jpg_480x480.webp?v=1718954377')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/80"></div>

        <div className="relative z-10 flex flex-col h-full">
          <div>
            <h1 className="text-3xl font-bold text-red-500">NB IT Support</h1>
            <p className="text-gray-300 text-sm mt-2 break-all">{itEmail}</p>
          </div>

          <div className="mt-10 flex flex-col gap-3">
            <button
              onClick={() => setActivePage("dashboard")}
              className={`text-left px-4 py-3 rounded-xl transition ${
                activePage === "dashboard" ? "bg-red-600" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              📊 Dashboard
            </button>

            <button
              onClick={() => setActivePage("assigned")}
              className={`text-left px-4 py-3 rounded-xl transition ${
                activePage === "assigned" ? "bg-red-600" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              🎫 Assigned Tickets
            </button>

            <button
              onClick={() => setActivePage("all")}
              className={`text-left px-4 py-3 rounded-xl transition ${
                activePage === "all" ? "bg-red-600" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              📂 All Tickets
            </button>

            <button
              onClick={() => setActivePage("transfers")}
              className={`text-left px-4 py-3 rounded-xl transition ${
                activePage === "transfers" ? "bg-red-600" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              🔄 Transfer Requests
            </button>

            {/* FIX 3: Changed <li> to <button> and use setActivePage consistently */}
            {isAdmin && (
              <button
                onClick={() => setActivePage("create-user")}
                className={`text-left px-4 py-3 rounded-xl transition ${
                  activePage === "create-user" ? "bg-red-600" : "bg-white/10 hover:bg-white/20"
                }`}
              >
                👤 Create User
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ========================= MAIN CONTENT ========================= */}
      <div className="flex-1 p-8 overflow-y-auto">

        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-red-500">
              Nairobi Bottlers IT Support
            </h1>
            <p className="text-gray-300 mt-2">
              Smart Helpdesk & Ticket Management System
            </p>
          </div>
          <button
            className="bg-red-600 hover:bg-red-700 px-5 py-3 rounded-xl font-semibold transition"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
          >
            Logout
          </button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10">
          <div className="bg-red-800 p-5 rounded-2xl shadow-lg">
            <h2 className="text-lg">Total</h2>
            <p className="text-3xl font-bold">{summary.total_tickets ?? 0}</p>
          </div>
          <div className="bg-yellow-700 p-5 rounded-2xl shadow-lg">
            <h2 className="text-lg">Open</h2>
            <p className="text-3xl font-bold">{summary.open_tickets ?? 0}</p>
          </div>
          <div className="bg-blue-700 p-5 rounded-2xl shadow-lg">
            <h2 className="text-lg">In Progress</h2>
            <p className="text-3xl font-bold">{summary.in_progress_tickets ?? 0}</p>
          </div>
          <div className="bg-green-700 p-5 rounded-2xl shadow-lg">
            <h2 className="text-lg">Resolved</h2>
            <p className="text-3xl font-bold">{summary.resolved_tickets ?? 0}</p>
          </div>
          <div className="bg-red-500 p-5 rounded-2xl shadow-lg">
            <h2 className="text-lg">High Priority</h2>
            <p className="text-3xl font-bold">{summary.high_priority_tickets ?? 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-6">
            <h2 className="text-xl font-bold text-red-400 mb-3">System Status</h2>
            <p className="text-gray-300 leading-7">
              AI Helpdesk system is operational. Tickets are being assigned automatically
              based on issue category and IT workload.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-6">
            <h2 className="text-xl font-bold text-red-400 mb-3">Performance</h2>
            <p className="text-gray-300 leading-7">
              Real-time ticket updates, live chat, transfer requests and analytics are
              currently active across the platform.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-6">
            <h2 className="text-xl font-bold text-red-400 mb-3">AI Assistant</h2>
            <p className="text-gray-300 leading-7">
              Employees can troubleshoot issues instantly using the AI assistant
              before escalating to IT support.
            </p>
          </div>
        </div>

        {/* ========================= DASHBOARD PAGE ========================= */}
        {activePage === "dashboard" && (
          <>
            {isAdmin && (
              <div style={{ marginTop: "20px" }}>
                <h2 className="text-3xl font-bold mb-6 text-white">📊 Admin Analytics</h2>

                <div style={styles.chartCard}>
                  <h3 className="text-xl mb-4">Tickets Created Over Time</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={ticketsOverTime}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="tickets" stroke="#ff1a1a" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div style={styles.chartCard}>
                  <h3 className="text-xl mb-4">Resolved Tickets Per IT Engineer</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={workloadData}>
                      <XAxis dataKey="engineer" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="resolved" fill="#ff1a1a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={styles.chartCard}>
                  <h3 className="text-xl mb-4">Most Common Ticket Categories</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={100}
                        fill="#ff1a1a"
                        label
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={["#ff1a1a", "#b30000", "#ff6666", "#991111", "#cc0000"][index % 5]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}

        {/* FIX 4: Create User is its own activePage, uses correct state vars and createUser() */}
        {activePage === "create-user" && isAdmin && (
          <div className="bg-white/10 p-8 rounded-3xl mt-6">
            <h2 className="text-3xl font-bold text-red-400 mb-6">Create New User</h2>

            <input
              type="text"
              placeholder="Full Name"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="w-full p-4 rounded-xl bg-black/40 mb-4 outline-none"
            />
            <input
              type="email"
              placeholder="Email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="w-full p-4 rounded-xl bg-black/40 mb-4 outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              className="w-full p-4 rounded-xl bg-black/40 mb-4 outline-none"
            />
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value)}
              className="w-full p-4 rounded-xl bg-black/40 mb-6 outline-none"
            >
              <option value="employee">employee</option>
              <option value="it_support">it_support</option>
            </select>

            <button
              onClick={createUser}
              className="bg-red-600 hover:bg-red-700 transition px-6 py-4 rounded-xl font-semibold"
            >
              Create User
            </button>
          </div>
        )}

        {/* ========================= ASSIGNED TICKETS ========================= */}
        {activePage === "assigned" && (
          <div className="space-y-4">
            {myTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-black/40 border border-red-900 p-5 rounded-2xl cursor-pointer hover:border-red-500 transition"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex justify-between">
                  <h2 className="text-xl font-bold">{ticket.title}</h2>
                  <span className="bg-red-700 px-3 py-1 rounded-full text-sm">{ticket.status}</span>
                </div>
                <p className="text-gray-300 mt-3">{ticket.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* ========================= ALL TICKETS ========================= */}
        {activePage === "all" && (
          <div className="space-y-4">
            {allTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-black/40 border border-gray-700 p-5 rounded-2xl cursor-pointer hover:border-red-500 transition"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold">{ticket.title}</h2>
                  <span className="bg-gray-700 px-3 py-1 rounded-full text-sm">{ticket.status}</span>
                </div>
                <p className="text-gray-300 mt-3">{ticket.description}</p>
                <div className="mt-4 flex gap-4 text-sm text-gray-400">
                  <span>Assigned: {ticket.assigned_to || "Unassigned"}</span>
                  <span>Priority: {ticket.priority}</span>
                </div>
                {ticket.transfer_requested_to === itEmail && ticket.transfer_status === "pending" && (
                  <div className="mt-4 bg-green-600 px-4 py-2 rounded-xl w-fit font-semibold">
                    🔄 Transfer Request For You
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ========================= TRANSFER REQUESTS ========================= */}
        {activePage === "transfers" && (
          <div className="space-y-4">
            {transferTickets.length === 0 ? (
              <div className="bg-white/5 p-6 rounded-2xl text-gray-300">
                No transfer requests available.
              </div>
            ) : (
              transferTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-green-900/30 border border-green-700 p-5 rounded-2xl cursor-pointer"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <h2 className="text-xl font-bold">{ticket.title}</h2>
                  <p className="mt-2 text-gray-300">{ticket.description}</p>
                  <div className="mt-4 text-green-400 font-semibold">
                    Waiting for you to accept transfer
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}
