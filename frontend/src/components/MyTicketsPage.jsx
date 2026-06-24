import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Ticket,
  Clock3,
  ArrowLeft,
  Send
} from "lucide-react";

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const userEmail = localStorage.getItem("email")?.trim() || "";

  // =========================
  // FETCH USER TICKETS
  // =========================
  const loadTickets = async () => {
    if (!userEmail) {
      console.log("No user email found in localStorage");
      setTickets([]);
      return;
    }

    try {
      const res = await fetch(
        `http://127.0.0.1:8001/user-tickets/${encodeURIComponent(userEmail)}`
      );

      const data = await res.json();

      console.log("Tickets response:", data);

      if (Array.isArray(data)) {
        setTickets(data);
      } else {
        setTickets([]);
      }
    } catch (err) {
      console.log("Error loading tickets:", err);
      setTickets([]);
    }
  };

  useEffect(() => {
    loadTickets(console.log("Current user email:", userEmail));
    const interval = setInterval(() => {
      loadTickets();
    }, 5000);

    return () => clearInterval(interval);
  }, [userEmail]);

  // =========================
  // LOAD CHAT MESSAGES
  // =========================
  const loadMessages = async (ticketId) => {
    setLoadingMessages(true);

    try {
      const res = await fetch(
        `http://127.0.0.1:8001/tickets/messages/${ticketId}`
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.log("Error loading messages:", err);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Reload messages when a ticket is opened
  useEffect(() => {
    if (selectedTicket) {
      loadMessages(selectedTicket.id);

      const interval = setInterval(() => {
        loadMessages(selectedTicket.id);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [selectedTicket]);

  // =========================
  // COLORS
  // =========================
  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "open":
        return "#3b82f6";
      case "in_progress":
      case "in progress":
        return "#f59e0b";
      case "resolved":
        return "#22c55e";
      default:
        return "#9ca3af";
    }
  };

  const getPriorityColor = (priority) => {
    switch ((priority || "").toLowerCase()) {
      case "high":
        return "#ff1a1a";
      case "medium":
        return "#ff9900";
      case "low":
        return "#22c55e";
      default:
        return "#9ca3af";
    }
  };

  // =========================
  // SEND CHAT MESSAGE
  // =========================
  const sendMessage = async () => {
    if (!chatMessage.trim() || !selectedTicket) return;

    try {
      const res = await fetch("http://127.0.0.1:8001/tickets/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticket_id: selectedTicket.id,
          sender_email: userEmail,
          message: chatMessage,
        }),
      });

      const data = await res.json();
      console.log("Send message response:", data);

      setChatMessage("");
      loadMessages(selectedTicket.id);
    } catch (err) {
      console.log("Error sending message:", err);
    }
  };

  const closeDetails = () => {
    setSelectedTicket(null);
    setMessages([]);
    setChatMessage("");
  };

  // =========================
  // DETAIL VIEW
  // =========================
  if (selectedTicket) {
    return (
      <div style={styles.page}>
        <div style={styles.overlay} />

        <div style={styles.content}>
          <button onClick={closeDetails} style={styles.backBtn}>
            <ArrowLeft size={16} /> Back
          </button>

          <div style={styles.detailGrid}>
            {/* DETAILS CARD */}
            <div style={styles.detailCard}>
              <h2 style={{ color: "#ff1a1a" }}>Ticket #{selectedTicket.id}</h2>
              <h3 style={styles.detailTitle}>{selectedTicket.title}</h3>

              <p style={styles.detailText}>{selectedTicket.description}</p>
              <p><b>Category:</b> {selectedTicket.category}</p>

              <p style={{ color: getStatusColor(selectedTicket.status) }}>
                Status: {selectedTicket.status}
              </p>

              <p style={{ color: getPriorityColor(selectedTicket.priority) }}>
                Priority: {selectedTicket.priority}
              </p>

              <p>
                <b>Assigned:</b>{" "}
                {selectedTicket.assigned_to || "Not assigned yet"}
              </p>
            </div>

            {/* CHAT */}
            <div style={styles.chatBox}>
              <h3 style={styles.chatHeading}>💬 IT Chat</h3>

              <div style={styles.chatMessages}>
                {loadingMessages ? (
                  <div style={styles.botMsg}>Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div style={styles.botMsg}>
                    IT Support: Hello, please describe your issue clearly and we will assist you.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isUser =
                      (msg.sender_email || "").trim().toLowerCase() ===
                      userEmail.toLowerCase();

                    return (
                      <div
                        key={msg.id}
                        style={isUser ? styles.userMsg : styles.botMsg}
                      >
                        <div style={styles.messageEmail}>
                          {msg.sender_email}
                        </div>
                        <div>{msg.message}</div>
                      </div>
                    );
                  })
                )}
              </div>

              <div style={styles.chatInputRow}>
                <input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type message..."
                  style={styles.chatInput}
                />

                <button onClick={sendMessage} style={styles.sendBtn}>
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // LIST VIEW
  // =========================
  return (
    <div style={styles.page}>
      <div style={styles.overlay} />

      <div style={styles.content}>
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>🎫 My Tickets</h1>
            <p style={styles.subheading}>Track IT issues in real time</p>
          </div>

          <div style={styles.statsContainer}>
            <div style={styles.statCard}>
              <Ticket size={18} />
              {tickets.length} Tickets
            </div>

            <div style={styles.statCard}>
              <Clock3 size={18} />
              {tickets.filter((t) => (t.status || "").toLowerCase() !== "resolved").length} Active
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <div style={styles.topBar}>
          <div style={styles.searchBox}>
            <Search size={18} />
            <input
              placeholder="Search tickets..."
              style={styles.searchInput}
            />
          </div>

          <button style={styles.filterButton}>
            <Filter size={18} /> Filter
          </button>
        </div>

        {/* TICKETS */}
        <div style={styles.ticketContainer}>
          {tickets.length === 0 ? (
            <div style={styles.ticketCard}>
              No tickets found for this account.
            </div>
          ) : (
            tickets.map((ticket) => (
              <div
                key={ticket.id}
                style={styles.ticketCard}
                onClick={() => setSelectedTicket(ticket)}
              >
                <div style={styles.ticketTop}>
                  <div>
                    <h3 style={styles.ticketId}>#{ticket.id}</h3>
                    <h2 style={styles.ticketTitle}>{ticket.title}</h2>
                  </div>

                  <div
                    style={{
                      ...styles.priorityBadge,
                      background: getPriorityColor(ticket.priority),
                    }}
                  >
                    {ticket.priority}
                  </div>
                </div>

                <div style={styles.ticketBottom}>
                  <span
                    style={{
                      ...styles.statusBadge,
                      borderColor: getStatusColor(ticket.status),
                      color: getStatusColor(ticket.status),
                    }}
                  >
                    {ticket.status}
                  </span>

                  <span style={styles.ticketInfo}>{ticket.category}</span>

                  <span style={styles.ticketInfo}>
                    {ticket.assigned_to || "Not assigned"}
                  </span>

                  <span style={styles.ticketInfo}>
    {ticket.created_at
      ? new Date(ticket.created_at).toLocaleString()
      : "No date"}
  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// =========================
// STYLES
// =========================
const styles = {
  page: {
    minHeight: "100vh",
    position: "relative",
  },

  overlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.88)",
  },

  content: {
    position: "relative",
    zIndex: 2,
    padding: "40px",
    color: "white",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "25px",
  },

  heading: {
    fontSize: "42px",
    fontWeight: "bold",
  },

  subheading: {
    color: "#aaa",
  },

  statsContainer: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(255,255,255,0.08)",
    padding: "10px 15px",
    borderRadius: "12px",
    backdropFilter: "blur(10px)",
  },

  topBar: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },

  searchBox: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "10px",
  },

  searchInput: {
    flex: 1,
    background: "transparent",
    border: "none",
    color: "white",
    outline: "none",
  },

  filterButton: {
    background: "#ff1a1a",
    border: "none",
    padding: "10px 15px",
    borderRadius: "10px",
    color: "white",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
  },

  ticketContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    paddingRight: "5px",
  },

  ticketCard: {
    background: "rgba(255,255,255,0.08)",
    padding: "20px",
    borderRadius: "15px",
    cursor: "pointer",
    transition: "0.3s",
  },

  ticketTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
  },

  ticketId: {
    color: "#ff1a1a",
  },

  ticketTitle: {
    fontSize: "20px",
  },

  priorityBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    color: "white",
    fontWeight: "bold",
    height: "fit-content",
    textTransform: "capitalize",
  },

  ticketBottom: {
    display: "flex",
    gap: "15px",
    marginTop: "10px",
    flexWrap: "wrap",
  },

  statusBadge: {
    border: "1px solid",
    padding: "4px 10px",
    borderRadius: "20px",
    textTransform: "capitalize",
  },

  ticketInfo: {
    color: "#ccc",
  },

  backBtn: {
    marginBottom: "20px",
    background: "transparent",
    border: "1px solid white",
    color: "white",
    padding: "8px 12px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },

  detailCard: {
    background: "rgba(255,255,255,0.08)",
    padding: "20px",
    borderRadius: "15px",
  },

  detailTitle: {
    fontSize: "24px",
    marginTop: "10px",
    marginBottom: "10px",
  },

  detailText: {
    color: "#e5e5e5",
    marginBottom: "16px",
    lineHeight: "1.6",
  },

  chatBox: {
    background: "rgba(255,255,255,0.08)",
    padding: "20px",
    borderRadius: "15px",
    display: "flex",
    flexDirection: "column",
    minHeight: "540px",
  },

  chatHeading: {
    fontSize: "22px",
    marginBottom: "10px",
    color: "#ffb3b3",
  },

  chatMessages: {
    flex: 1,
    minHeight: "120px",
    marginTop: "10px",
    marginBottom: "10px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    paddingRight: "5px",
  },

  botMsg: {
    background: "#222",
    padding: "12px",
    borderRadius: "10px",
    color: "white",
    alignSelf: "flex-start",
    maxWidth: "80%",
  },

  userMsg: {
    background: "#ff1a1a",
    padding: "12px",
    borderRadius: "10px",
    color: "white",
    alignSelf: "flex-end",
    maxWidth: "80%",
  },

  messageEmail: {
    fontSize: "11px",
    opacity: 0.8,
    marginBottom: "4px",
  },

  chatInputRow: {
    display: "flex",
    gap: "10px",
  },

  chatInput: {
    flex: 1,
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    outline: "none",
  },

  sendBtn: {
    background: "#ff1a1a",
    border: "none",
    padding: "10px",
    borderRadius: "10px",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
};