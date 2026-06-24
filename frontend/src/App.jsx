import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import LoginPage from "./components/LoginPage";
import RagPage from "./components/RagPage";
import CreateTicketPage from "./components/CreateTicketPage";
import MyTicketsPage from "./components/MyTicketsPage";
import ITDashboard from "./components/ITDashboard";

export default function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* LOGIN */}
        <Route
          path="/"
          element={<LoginPage />}
        />

        {/* USER AI PAGE */}
        <Route
          path="/rag"
          element={<RagPage />}
        />

        {/* CREATE TICKET */}
        <Route
          path="/create-ticket"
          element={<CreateTicketPage />}
        />

        {/* USER TICKETS */}
        <Route
          path="/my-tickets"
          element={<MyTicketsPage />}
        />

        {/* IT DASHBOARD */}
        <Route
          path="/it-dashboard"
          element={<ITDashboard />}
        />

      </Routes>

    </BrowserRouter>

  );
}

