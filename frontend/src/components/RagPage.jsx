import { useState } from "react";
import CreateTicketPage from "./CreateTicketPage";
import MyTicketsPage from "./MyTicketsPage.jsx";

export default function RagPage() {
  // =========================
  // CHAT STATE
  // =========================
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [activePage, setActivePage] = useState("chat");
  const [loading, setLoading] = useState(false);
  // =========================
  // SUGGESTED ISSUES
  // =========================
  const suggestedIssues = [
    "Outlook not opening",
    "Cannot connect to WiFi",
    "Password reset",
  ];

  // =========================
  // ASK AI
  // =========================
  const askAI = async () => {

    if (!input.trim()) return;
  
    const updatedMessages = [
      ...messages,
      { sender: "user", text: input },
    ];
  
    setMessages(updatedMessages);
  
    const currentInput = input;
  
    setInput("");
  
    setLoading(true);
  
    try {
  
      const res = await fetch("http://127.0.0.1:8001/ask", {
  
        method: "POST",
  
        headers: {
          "Content-Type": "application/json",
        },
  
        body: JSON.stringify({
          message: currentInput,
        }),
      });
  
      const data = await res.json();
  
      setMessages([
        ...updatedMessages,
        {
          sender: "bot",
          text: data.answer,
        },
      ]);
  
    } catch (err) {
  
      console.log("RAG Error:", err);
  
      setMessages([
        ...updatedMessages,
        {
          sender: "bot",
          text: "AI service unavailable right now.",
        },
      ]);
  
    } finally {
  
      setLoading(false);
    }
  };

  // =========================
  // ESCALATE TO TICKET
  // =========================
  const escalateTicket = async () => {
    if (messages.length === 0) return;

    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.sender === "user");

    if (!lastUserMessage) return;

    let category = "service requests";
    const text = lastUserMessage.text.toLowerCase();

    if (text.includes("wifi") || text.includes("network")) {
      category = "network";
    } else if (text.includes("email") || text.includes("outlook")) {
      category = "email communication issues";
    } else if (text.includes("password") || text.includes("account")) {
      category = "account and access issues";
    }

    const res = await fetch("http://127.0.0.1:8001/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: lastUserMessage.text,
        description: lastUserMessage.text,
        category: category,
        user_email: localStorage.getItem("email"),
      }),
    });

    const data = await res.json();
    alert(`Ticket created! Priority: ${data.priority}`);
  };

  return (
    <div style={styles.container}>
      
      {/* =========================
          SIDEBAR
      ========================= */}
      <div style={styles.sidebar}>
        <div style={styles.overlay}></div>

        <div style={styles.sidebarContent}>
          <h2 style={styles.sidebarTitle}>Nairobi Bottlers AI</h2>

          <ul style={styles.menu}>
            <li onClick={() => setActivePage("chat")}>🏠 AI Assistant</li>
            <li onClick={() => setActivePage("create-ticket")}>🎫 Create Ticket</li>
            <li onClick={() => setActivePage("my-tickets")}>📂 My Tickets</li>
          </ul>
        </div>
      </div>

      {/* =========================
          MAIN CONTENT
      ========================= */}
      
      <div style={styles.mainContent}>

        {/* TOP BAR WITH LOGOUT */}
        <div style={styles.topBar}>
          <div /> {/* spacer to push button right */}
          <button
            style={styles.logoutBtn}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#991111")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#b30000")}
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
          >
            Logout
          </button>
        </div>

        {activePage === "chat" && (
          <div style={styles.pageBlock}>
            <h1 style={styles.pageTitle}>Welcome back! How may I help you today?</h1>
           
            {/* suggested issues */}
            <div style={styles.suggestionsContainer}>
              {suggestedIssues.map((issue, i) => (
                <button
                  key={i}
                  style={styles.suggestionButton}
                  onClick={() => setInput(issue)}
                >
                  {issue}
                </button>
              ))}
            </div>
            
            {/* chat */}
            <div style={styles.chatBox}>
              <div style={styles.chatMessages}>
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.bubble,
                      alignSelf:
                        msg.sender === "user" ? "flex-end" : "flex-start",
                      backgroundColor:
                        msg.sender === "user"
                          ? "#b30000"
                          : "rgba(255,255,255,0.12)",
                    }}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>

              <div style={styles.inputRow}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your IT issue..."
                  style={styles.input}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      askAI();
                    }
                  }}
                />

                <button onClick={askAI} style={styles.sendBtn}>
                  Send
                </button>

                {loading && (
                  <div style={styles.loadingContainer}>
                    <div style={styles.loadingDot}></div>
                    <div style={styles.loadingDot}></div>
                    <div style={styles.loadingDot}></div>
                  </div>
                )}
              </div>

              <button
                style={styles.escalateBtn}
                onClick={escalateTicket}
              >
                🎫 Can't resolve? Escalate to Ticket
              </button>
            </div>
          </div>
        )}

        {activePage === "create-ticket" && <CreateTicketPage />}

        {activePage === "my-tickets" && <MyTicketsPage />}
      </div>
    </div>
  );
}


// =========================
// STYLES
// =========================
const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    height: "100vh",
    overflow: "hidden",
    background: "linear-gradient(to right, #111111, #2a0000)",
  },

  // Sidebar
  sidebar: {
    width: "260px",
    color: "white",
    padding: "25px",
    borderRight: "1px solid rgba(255,255,255,0.08)",
    position: "relative",
    overflow: "hidden",
    backgroundImage:
      "url('https://cdn.shopify.com/s/files/1/0349/9055/5181/files/O1CN015Kst2r1UTkdl7b9Jn__56612519_jpg_Q75_jpg_480x480.webp?v=1718954377')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.68)",
  },

  sidebarContent: {
    position: "relative",
    zIndex: 1,
  },

  sidebarTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "40px",
  },

  menu: {
    listStyle: "none",
    padding: 0,
    marginTop: "40px",
    display: "flex",
    flexDirection: "column",
    gap: "22px",
    fontSize: "16px",
    cursor: "pointer",
  },

  // Main
  mainContent: {
    flex: 1,
    padding: "40px",
    color: "white",
    overflowY: "auto",
    height: "100vh",
  },

  // Top bar
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  logoutBtn: {
    padding: "10px 22px",
    backgroundColor: "#b30000",
    border: "none",
    borderRadius: "12px",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "15px",
    transition: "background-color 0.2s",
  },

  pageBlock: {
    maxWidth: "1200px",
  },

  pageTitle: {
    fontSize: "34px",
    fontWeight: "bold",
    marginBottom: "18px",
  },

  suggestionsContainer: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "20px",
  },

  suggestionButton: {
    padding: "10px 15px",
    backgroundColor: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "20px",
    color: "white",
    cursor: "pointer",
    backdropFilter: "blur(10px)",
  },

  // Chat
 
    chatBox: {
      background: "rgba(255,255,255,0.08)",
      padding: "20px",
      borderRadius: "15px",
      display: "flex",
      flexDirection: "column",
      minHeight: "75vh",   // makes it much taller
  },

  chatMessages: {
    flex: 1,
    minHeight: "300px",   // increased from 120px
    maxHeight: "60vh",    // allows bigger chat for screenshots
    marginTop: "10px",
    marginBottom: "10px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "10px",
    paddingRight: "8px",
    scrollBehavior: "smooth",
  },

  bubble: {
    maxWidth: "70%",
    padding: "12px 16px",
    borderRadius: "18px",
    color: "white",
    lineHeight: "1.5",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
  },

  inputRow: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },

  input: {
    flex: 1,
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.12)",
    outline: "none",
    background: "rgba(255,255,255,0.08)",
    color: "white",
  },

  sendBtn: {
    padding: "12px 18px",
    backgroundColor: "#b30000",
    border: "none",
    borderRadius: "12px",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },

  escalateBtn: {
    marginTop: "15px",
    padding: "12px 16px",
    backgroundColor: "#ff1a1a",
    border: "none",
    borderRadius: "12px",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },

  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "6px",
    marginTop: "10px",
  },

  loadingDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#ffffff",
    opacity: 0.7,
  },
  botMsg: {
    background: "#222",
    padding: "14px",
    borderRadius: "12px",
    color: "white",
    alignSelf: "flex-start",
    maxWidth: "85%",
    lineHeight: "1.5",
  },
  
  userMsg: {
    background: "#ff1a1a",
    padding: "14px",
    borderRadius: "12px",
    color: "white",
    alignSelf: "flex-end",
    maxWidth: "85%",
    lineHeight: "1.5",
  },
};