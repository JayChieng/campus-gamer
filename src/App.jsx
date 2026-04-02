import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Teammates from "./pages/Teammates";
import CreateTeam from "./pages/CreateTeam";
import Teams from "./pages/Teams";
import Tournaments from "./pages/Tournaments";
import AdminReports from "./pages/AdminReports";
import ProtectedRoute from "./ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/create-team"
        element={
          <ProtectedRoute>
            <CreateTeam />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teammates"
        element={
          <ProtectedRoute>
            <Teammates />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teams"
        element={
          <ProtectedRoute>
            <Teams />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tournaments"
        element={
          <ProtectedRoute>
            <Tournaments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-reports"
        element={
          <ProtectedRoute>
            <AdminReports />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}