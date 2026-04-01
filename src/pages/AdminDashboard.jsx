import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getCountFromServer, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ users: 0, teams: 0, reports: 0, tournaments: 0 });
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;
      if (!user) { navigate("/login"); return; }

      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (userSnap.exists() && userSnap.data().role === "Admin") {
        setIsAdmin(true);
        const uC = await getCountFromServer(collection(db, "users"));
        const tC = await getCountFromServer(collection(db, "teams"));
        const rC = await getCountFromServer(collection(db, "reports"));
        const tourneyC = await getCountFromServer(collection(db, "tournaments"));
        setCounts({ users: uC.data().count, teams: tC.data().count, reports: rC.data().count, tournaments: tourneyC.data().count });
      } else {
        alert("Access Denied");
        navigate("/dashboard");
      }
    };
    checkAdmin();
  }, [navigate]);

  if (!isAdmin) return <div style={{ color: "white", padding: 20 }}>Checking permissions...</div>;

  return (
    <div style={{ padding: 30, color: "white", background: "#121212", minHeight: "100vh" }}>
      <h1>Admin Dashboard</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: "#1e1e1e", padding: 20, borderRadius: 10, borderLeft: "5px solid #4caf50" }}>
          <h3>Total Users: {counts.users}</h3>
        </div>
        <div style={{ background: "#1e1e1e", padding: 20, borderRadius: 10, borderLeft: "5px solid #2196f3" }}>
          <h3>Total Teams: {counts.teams}</h3>
        </div>
        <div style={{ background: "#1e1e1e", padding: 20, borderRadius: 10, borderLeft: "5px solid #f44336" }}>
          <h3>Reports: {counts.reports}</h3>
        </div>
        <div style={{ background: "#1e1e1e", padding: 20, borderRadius: 10, borderLeft: "5px solid #ff9800" }}>
          <h3>Tournaments: {counts.tournaments}</h3>
        </div>
      </div>
    </div>
  );
}