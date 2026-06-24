import { useState } from "react"
function LoginPage({ setUser }) {

  // =========================
  // FORM STATE
  // =========================
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // =========================
  // LOGIN FUNCTION
  // =========================
  const handleLogin = async () => {

    const response = await fetch(
      "http://127.0.0.1:8001/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );
  
    const data = await response.json();
    console.log(data)
    // Save email
    localStorage.setItem("email", data.email)
    // Save role
    localStorage.setItem("role", data.role);
  
    // Login success
    if (data.success) {
  
      // IT SUPPORT LOGIN
      if (data.role === "it_support") {
  
        window.location.href = "/it-dashboard";
  
      }
  
      // NORMAL USER LOGIN
      else {
  
        window.location.href = "/rag";
  
      }
  
    } else {
  
      alert(data.message);
  
    }
  };
  return (

    // Full screen background
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"

      style={{
        backgroundImage:
          "url(https://www.shutterstock.com/image-photo/lviv-ukraine-february-6-2026-600nw-2725335277.jpg)"
      }}
    >

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl p-10 shadow-2xl border border-white/20">

        {/* Title */}
        <h1 className="text-4xl font-bold text-white text-center mb-2">

          Nairobi Bottlers

        </h1>

        {/* Subtitle */}
        <p className="text-gray-200 text-center mb-8">

          AI Helpdesk System

        </p>

        {/* Email Input */}
        <input
          type="email"
          placeholder="Company Email"

          value={email}

          onChange={(e) => setEmail(e.target.value)}

          className="w-full p-4 rounded-xl mb-4 bg-white/20 text-white placeholder-gray-300 outline-none border border-white/20"
        />

        {/* Password Input */}
        <input
          type="password"
          placeholder="Password"

          value={password}

          onChange={(e) => setPassword(e.target.value)}

          className="w-full p-4 rounded-xl mb-6 bg-white/20 text-white placeholder-gray-300 outline-none border border-white/20"
        />

        {/* Login Button */}
        <button

          onClick={handleLogin}

          className="w-full bg-red-600 hover:bg-red-700 transition-all duration-300 text-white font-semibold py-4 rounded-xl"
        >

          Login

        </button>

      </div>

    </div>
  )
}

export default LoginPage