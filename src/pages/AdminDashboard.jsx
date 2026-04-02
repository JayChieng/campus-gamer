import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const formatDate = (value) => {
  if (!value) return "N/A";

  if (typeof value?.toDate === "function") {
    return value.toDate().toLocaleString();
  }

  if (typeof value === "number") {
    return new Date(value).toLocaleString();
  }

  return String(value);
};

const sortByCreatedAt = (items) =>
  [...items].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

export default function AdminDashboard() {
  const [counts, setCounts] = useState({
    users: 0,
    teams: 0,
    reports: 0,
    tournaments: 0,
    registrations: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentTeams, setRecentTeams] = useState([]);
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadAdminData = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        const role = userSnap.exists() ? userSnap.data().role?.trim().toLowerCase() : "";

        if (role !== "admin") {
          alert("Access Denied");
          navigate("/dashboard");
          return;
        }

        setIsAdmin(true);

        const [usersSnap, teamsSnap, reportsSnap, tournamentsSnap, registrationsSnap] =
          await Promise.all([
            getDocs(collection(db, "users")),
            getDocs(collection(db, "teams")),
            getDocs(collection(db, "reports")),
            getDocs(collection(db, "tournaments")),
            getDocs(collection(db, "tournamentRegistrations")),
          ]);

        const users = usersSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
        const teams = teamsSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
        const registrations = registrationsSnap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        setCounts({
          users: usersSnap.size,
          teams: teamsSnap.size,
          reports: reportsSnap.size,
          tournaments: tournamentsSnap.size,
          registrations: registrationsSnap.size,
        });
        setRecentUsers(sortByCreatedAt(users).slice(0, 5));
        setRecentTeams(sortByCreatedAt(teams).slice(0, 5));
        setRecentRegistrations(sortByCreatedAt(registrations).slice(0, 5));
      } catch (error) {
        console.error("Failed to load admin dashboard:", error);
        alert("Could not load admin dashboard data.");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, [navigate]);

  if (loading) {
    return <div style={{ color: "white", padding: 20 }}>Loading admin dashboard...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1f1f1f",
        color: "white",
        padding: 28,
      }}
    >
      <div style={{ maxWidth: 1150, margin: "0 auto" }}>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            marginBottom: 20,
            padding: "10px 18px",
            background: "#151515",
            color: "white",
            border: "1px solid #444",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Back
        </button>

        <div
          style={{
            background: "linear-gradient(135deg, #2b2b2b 0%, #171717 100%)",
            border: "1px solid #343434",
            borderRadius: 18,
            padding: 24,
            marginBottom: 22,
          }}
        >
          <h1 style={{ marginTop: 0, marginBottom: 10 }}>Admin Dashboard</h1>
          <p style={{ margin: 0, color: "#c7c7c7", lineHeight: 1.6 }}>
            Monitor platform activity, review recent signups, and keep an eye on team and tournament engagement.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
            marginBottom: 22,
          }}
        >
          <div style={{ background: "#262626", padding: 18, borderRadius: 14, borderLeft: "5px solid #4caf50" }}>
            <div style={{ color: "#bdbdbd", marginBottom: 8 }}>Users</div>
            <div style={{ fontSize: 30, fontWeight: "bold" }}>{counts.users}</div>
          </div>
          <div style={{ background: "#262626", padding: 18, borderRadius: 14, borderLeft: "5px solid #2196f3" }}>
            <div style={{ color: "#bdbdbd", marginBottom: 8 }}>Teams</div>
            <div style={{ fontSize: 30, fontWeight: "bold" }}>{counts.teams}</div>
          </div>
          <div style={{ background: "#262626", padding: 18, borderRadius: 14, borderLeft: "5px solid #f44336" }}>
            <div style={{ color: "#bdbdbd", marginBottom: 8 }}>Reports</div>
            <div style={{ fontSize: 30, fontWeight: "bold" }}>{counts.reports}</div>
          </div>
          <div style={{ background: "#262626", padding: 18, borderRadius: 14, borderLeft: "5px solid #ff9800" }}>
            <div style={{ color: "#bdbdbd", marginBottom: 8 }}>Tournaments</div>
            <div style={{ fontSize: 30, fontWeight: "bold" }}>{counts.tournaments}</div>
          </div>
          <div style={{ background: "#262626", padding: 18, borderRadius: 14, borderLeft: "5px solid #9c27b0" }}>
            <div style={{ color: "#bdbdbd", marginBottom: 8 }}>Registrations</div>
            <div style={{ fontSize: 30, fontWeight: "bold" }}>{counts.registrations}</div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginBottom: 22,
          }}
        >
          <div style={{ background: "#262626", borderRadius: 14, padding: 20 }}>
            <h3 style={{ marginTop: 0 }}>Platform Health</h3>
            <p style={{ color: "#d0d0d0", marginBottom: 10 }}>
              The campus gaming hub currently has {counts.users} user{counts.users === 1 ? "" : "s"} and {counts.teams} active team{counts.teams === 1 ? "" : "s"}.
            </p>
            <p style={{ color: "#d0d0d0", margin: 0 }}>
              Tournament interest is tracked through {counts.registrations} registration{counts.registrations === 1 ? "" : "s"}, while reports stay at {counts.reports}.
            </p>
          </div>

          <div style={{ background: "#262626", borderRadius: 14, padding: 20 }}>
            <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={() => navigate("/dashboard")}>User Dashboard</button>
              <button onClick={() => navigate("/notifications")}>Notifications</button>
              <button onClick={() => navigate("/tournaments")}>Tournaments</button>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          <div style={{ background: "#262626", borderRadius: 14, padding: 20 }}>
            <h3 style={{ marginTop: 0 }}>Recent Users</h3>
            {recentUsers.length === 0 ? (
              <p style={{ color: "#bdbdbd", marginBottom: 0 }}>No users found.</p>
            ) : (
              recentUsers.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "12px 0",
                    borderBottom: "1px solid #3a3a3a",
                  }}
                >
                  <div style={{ fontWeight: "bold" }}>{item.displayName || item.email || "Unnamed User"}</div>
                  <div style={{ color: "#bdbdbd", fontSize: 14 }}>{item.email || "No email"}</div>
                  <div style={{ color: "#9e9e9e", fontSize: 13 }}>
                    Joined: {formatDate(item.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ background: "#262626", borderRadius: 14, padding: 20 }}>
            <h3 style={{ marginTop: 0 }}>Recent Teams</h3>
            {recentTeams.length === 0 ? (
              <p style={{ color: "#bdbdbd", marginBottom: 0 }}>No teams created yet.</p>
            ) : (
              recentTeams.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "12px 0",
                    borderBottom: "1px solid #3a3a3a",
                  }}
                >
                  <div style={{ fontWeight: "bold" }}>{item.name || "Untitled Team"}</div>
                  <div style={{ color: "#bdbdbd", fontSize: 14 }}>
                    {item.game || "Unknown game"} | {item.memberCount || 0} member{item.memberCount === 1 ? "" : "s"}
                  </div>
                  <div style={{ color: "#9e9e9e", fontSize: 13 }}>
                    Created: {formatDate(item.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ background: "#262626", borderRadius: 14, padding: 20 }}>
            <h3 style={{ marginTop: 0 }}>Recent Tournament Registrations</h3>
            {recentRegistrations.length === 0 ? (
              <p style={{ color: "#bdbdbd", marginBottom: 0 }}>No tournament registrations yet.</p>
            ) : (
              recentRegistrations.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "12px 0",
                    borderBottom: "1px solid #3a3a3a",
                  }}
                >
                  <div style={{ fontWeight: "bold" }}>{item.tournamentTitle || "Tournament"}</div>
                  <div style={{ color: "#bdbdbd", fontSize: 14 }}>{item.userEmail || "Unknown user"}</div>
                  <div style={{ color: "#9e9e9e", fontSize: 13 }}>
                    Registered: {formatDate(item.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

