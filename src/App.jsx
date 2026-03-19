import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Teammates from "./pages/Teammates";
import CreateTeam from "./pages/CreateTeam";
import Teams from "./pages/Teams";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/create-team" element={<CreateTeam />} />
      <Route path="/teammates" element={<Teammates />} />
      <Route path="/teams" element={<Teams />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}