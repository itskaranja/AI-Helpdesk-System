import { useState } from "react";
import { Upload } from "lucide-react";

export default function CreateTicketPage() {

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: ""
  });

  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();
  
    try {
  
      const response = await fetch("http://127.0.0.1:8001/tickets", {
  
        method: "POST",
  
        headers: {
          "Content-Type": "application/json",
        },
  
        body: JSON.stringify({
  
          title: formData.title,
  
          description: formData.description,
  
          category: formData.category,
  
          user_email: localStorage.getItem("email"),
        }),
      });
  
      const data = await response.json();
  
      console.log("Ticket response:", data);
  
      if (!response.ok || data.success === false) {
  
        alert(data.message || "Failed to create ticket");
  
        return;
      }
  
      alert(
        `Ticket Created Successfully\nAssigned To: ${data.assigned_to}`
      );
  
      setFormData({
        title: "",
        category: "",
        description: "",
      });
  
      setFile(null);
  
    } catch (err) {
  
      console.log("Create ticket error:", err);
  
      alert("Server error while creating ticket");
    }
  };
  return (
    <div style={styles.page}>

      {/* DARK OVERLAY */}
      <div style={styles.overlay}></div>

      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>🎫 Create Support Ticket</h1>
          <p style={styles.subtitle}>
            Nairobi Bottlers AI Helpdesk — Log your IT issue instantly
          </p>
        </div>

        {/* FORM CARD */}
        <div style={styles.card}>
        <form onSubmit={handleSubmit}>

            {/* TITLE */}
            <div style={styles.inputGroup}>
              <label>Ticket Title</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Cannot connect to WiFi"
                style={styles.input}
              />
            </div>

            {/* CATEGORY */}
            <div style={styles.inputGroup}>
              <label>Category</label>

              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="">Select category</option>
                <option value="network">Network</option>
                <option value="software">Software</option>
                <option value="hardware">Hardware</option>
                <option value="email communication issues">Email Issues</option>
                <option value="account and access issues">Account Access</option>
                <option value="security incidents">Security</option>
                <option value="service requests">Service Requests</option>
                <option value="compliance issues">Compliance</option>
              </select>
            </div>

            {/* DESCRIPTION */}
            <div style={styles.inputGroup}>
              <label>Description</label>
              <textarea
                rows="6"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Explain your issue clearly..."
                style={styles.textarea}
              />
            </div>


            {/* BUTTONS */}
            <div style={styles.buttonRow}>

              <button type="submit" style={styles.submitBtn}>
                Submit Ticket
              </button>

              <button
                type="button"
                style={styles.cancelBtn}
                onClick={() => {
                  setFormData({ title: "", category: "", description: "" });
                  setFile(null);
                }}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>

      </div>
    </div>
  );
}

/* =========================
   STYLES (COCA-COLA THEME)
========================= */
const styles = {

  page: {
    minHeight: "100vh",
    position: "relative",
    color: "white"
  },

  overlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.88)"
  },

  container: {
    position: "relative",
    zIndex: 2,
    padding: "50px",
    maxWidth: "900px"
  },

  header: {
    marginBottom: "30px"
  },

  title: {
    fontSize: "40px",
    fontWeight: "bold"
  },

  subtitle: {
    color: "#bbb"
  },

  card: {
    background: "rgba(255,255,255,0.08)",
    padding: "35px",
    borderRadius: "20px",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.1)"
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "20px",
    gap: "8px"
  },

  input: {
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    outline: "none",
    background: "rgba(255,255,255,0.1)",
    color: "white"
  },

  select: {
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    outline: "none",
    background: "white",
    color: "black"
  },

  textarea: {
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    outline: "none",
    resize: "none",
    background: "rgba(255,255,255,0.1)",
    color: "white"
  },

  uploadBox: {
    border: "2px dashed #ff1a1a",
    padding: "25px",
    borderRadius: "15px",
    textAlign: "center",
    cursor: "pointer",
    background: "rgba(255,255,255,0.05)"
  },

  fileName: {
    marginTop: "10px",
    color: "#ff4d4d"
  },

  buttonRow: {
    display: "flex",
    gap: "15px",
    marginTop: "10px"
  },

  submitBtn: {
    flex: 1,
    padding: "14px",
    background: "#ff1a1a",
    border: "none",
    borderRadius: "12px",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer"
  },

  cancelBtn: {
    padding: "14px 25px",
    background: "#333",
    border: "none",
    borderRadius: "12px",
    color: "white",
    cursor: "pointer"
  }
};