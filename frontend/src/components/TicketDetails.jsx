import { useEffect, useState } from "react";

export default function TicketDetails({ ticket, goBack }) {

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [status, setStatus] = useState(ticket.status || "open");
  const [newItEmail, setNewItEmail] = useState("");

  const itEmail = localStorage.getItem("email");

  // Check if this IT engineer owns the ticket
  const isAssigned =
  (ticket.assigned_to || "").trim().toLowerCase() ===
  (itEmail || "").trim().toLowerCase();
  // =========================
  // LOAD CHAT MESSAGES
  // =========================
  
  const loadMessages = async () => {

    try {
  
      const res = await fetch(
        `http://127.0.0.1:8001/tickets/messages/${ticket.id}`
      );
  
      const data = await res.json();
  
      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        setMessages([]);
      }
  
    } catch (err) {
  
      console.log("Error loading IT messages:", err);
  
      setMessages([]);
    }
  };
  // =========================
  // AUTO REFRESH CHAT
  // =========================
  useEffect(() => {

    loadMessages();

    setStatus(ticket.status || "open");

    const interval = setInterval(() => {
      loadMessages();
    }, 3000);

    return () => clearInterval(interval);

  }, [ticket.id]);

  // =========================
  // SEND MESSAGE
  // =========================
  const sendMessage = async () => {

    if (!newMessage.trim()) return;

    await fetch("http://127.0.0.1:8001/tickets/message", {

      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({

        ticket_id: ticket.id,

        sender_email: itEmail,

        message: newMessage,
      }),
    });

    setNewMessage("");

    loadMessages();
  };

  // =========================
  // UPDATE STATUS
  // =========================
  const updateStatus = async () => {

    await fetch("http://127.0.0.1:8001/tickets/update-status", {

      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({

        ticket_id: ticket.id,

        status: status,

        it_email: itEmail,
      }),
    });

    alert("Status updated successfully");

    goBack();
  };

  // =========================
  // REQUEST TRANSFER
  // =========================
  const requestTransfer = async () => {

    if (!newItEmail.trim()) return;

    await fetch("http://127.0.0.1:8001/tickets/request-transfer", {

      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({

        ticket_id: ticket.id,

        current_it_email: itEmail,

        new_it_support_email: newItEmail,
      }),
    });

    alert("Transfer request sent");
  };

  // =========================
  // ACCEPT TRANSFER
  // =========================
  const acceptTransfer = async () => {

    try {
  
      const res = await fetch(
        "http://127.0.0.1:8001/tickets/accept-transfer",
        {
  
          method: "PUT",
  
          headers: {
            "Content-Type": "application/json",
          },
  
          body: JSON.stringify({
  
            ticket_id: ticket.id,
  
            current_it_email: itEmail,
  
            new_it_support_email: itEmail
          }),
        }
      );
  
      const data = await res.json();
  
      console.log("Accept transfer response:", data);
  
      alert(data.message);
  
      goBack();
  
    } catch (err) {
  
      console.log("Accept transfer error:", err);
  
      alert("Failed to accept transfer");
    }
  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-red-950 via-black to-gray-900 text-white p-6">

      {/* TOP BAR */}
      <div className="flex justify-between items-center mb-6">

        <button
          onClick={goBack}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-xl"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-red-400">
          Ticket Details
        </h1>

        <div />

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT SIDE */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10">

          <h2 className="text-2xl font-bold mb-3">
            {ticket.title}
          </h2>

          <p className="text-gray-300 mb-4">
            {ticket.description}
          </p>

          <div className="space-y-2 text-sm text-gray-200">

            <p>
              <strong>Category:</strong> {ticket.category}
            </p>

            <p>
              <strong>Priority:</strong> {ticket.priority}
            </p>

            <p>
              <strong>Status:</strong> {ticket.status}
            </p>

            <p>
              <strong>User:</strong> {ticket.user_email}
            </p>

            <p>
              <strong>Assigned To:</strong> {ticket.assigned_to}
            </p>

            {
              ticket.transfer_status === "pending" && (
                <p className="text-yellow-400">
                  Pending transfer to:
                  {" "}
                  {ticket.transfer_requested_to}
                </p>
              )
            }

          </div>

          {/* STATUS UPDATE */}
          <div className="mt-6">

            <label className="block mb-2 font-semibold text-red-300">
              Change Status
            </label>

            <select
              disabled={!isAssigned}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-3 rounded-xl bg-black/40 border border-white/10 outline-none text-white disabled:opacity-50"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            <button
              disabled={!isAssigned}
              onClick={updateStatus}
              className="mt-3 w-full bg-red-600 hover:bg-red-700 transition px-4 py-3 rounded-xl font-semibold disabled:opacity-40"
            >
              Save Status
            </button>
            <p>
  SLA:
  {
    new Date() - new Date(ticket.created_at)
      > 24 * 60 * 60 * 1000
      ? " ⚠️ Warning"
      : " ✅ On Track"
  }
</p>

          </div>

          {/* TRANSFER */}
          <div className="mt-8">

            <label className="block mb-2 font-semibold text-red-300">
              Transfer Ticket
            </label>

            <select
              disabled={!isAssigned}
              value={newItEmail}
              onChange={(e) => setNewItEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-black/40 border border-white/10 outline-none text-white disabled:opacity-50"
            >
              <option value="">Select IT Engineer</option>

              <option value="botieno.itse@nairobibottlers.com">
                Barry Otieno
              </option>

              <option value="pnjatha.itse@nairobibottlers.com">
                Paul Njatha
              </option>

              <option value="nmukholi.itse@nairobibottlers.com">
                Nicholus Mukholi
              </option>

            </select>

            <button
              disabled={!isAssigned}
              onClick={requestTransfer}
              className="mt-3 w-full bg-gray-200 text-black hover:bg-white transition px-4 py-3 rounded-xl font-semibold disabled:opacity-40"
            >
              Request Transfer
            </button>

            {/* ACCEPT TRANSFER */}
            {
              ticket.transfer_requested_to === itEmail &&
              ticket.transfer_status === "pending" && (

                <button
                  onClick={acceptTransfer}
                  className="mt-4 w-full bg-green-600 hover:bg-green-700 transition px-4 py-3 rounded-xl font-semibold"
                >
                  Accept Transfer Request
                </button>
              )
            }

          </div>

        </div>

        {/* RIGHT SIDE CHAT */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 flex flex-col">

          <h2 className="text-2xl font-bold mb-4 text-red-300">
            Conversation
          </h2>

          <div className="flex-1 space-y-4 max-h-[520px] overflow-y-auto pr-2">

            {
              messages.map((msg) => {

                const isMe =
                  msg.sender_email === itEmail;

                return (

                  <div
                    key={msg.id}
                    className={`flex ${
                      isMe
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >

                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                        isMe
                          ? "bg-red-600 text-white"
                          : "bg-gray-200 text-black"
                      }`}
                    >

                      <p className="text-xs opacity-80 mb-1">
                        {msg.sender_email}
                      </p>

                      <p>{msg.message}</p>

                    </div>

                  </div>
                );
              })
            }

          </div>

          {/* MESSAGE BOX */}
          <div className="mt-4">

            <textarea
              disabled={!isAssigned}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a reply to the user..."
              rows="4"
              className="w-full p-4 rounded-2xl bg-black/40 border border-white/10 outline-none resize-none text-white disabled:opacity-40"
            />

            <button
              disabled={!isAssigned}
              onClick={sendMessage}
              className="mt-3 w-full bg-red-600 hover:bg-red-700 transition px-4 py-3 rounded-xl font-semibold disabled:opacity-40"
            >
              Send Message
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}


