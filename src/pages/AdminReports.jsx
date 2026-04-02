import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";

export default function AdminReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const currentUser = auth.currentUser;

        if (!currentUser || currentUser.email !== "admin@fanshaweonline.ca") {
          setLoading(false);
          return;
        }

        const snap = await getDocs(collection(db, "reports"));

        const data = snap.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter(
            (report) =>
              report.reporterEmail &&
              report.reportedEmail &&
              report.reason &&
              String(report.reporterEmail).trim() !== "" &&
              String(report.reportedEmail).trim() !== "" &&
              String(report.reason).trim() !== ""
          );

        data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setReports(data);
      } catch (error) {
        console.error("Error loading reports:", error);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  if (!auth.currentUser || auth.currentUser.email !== "admin@fanshaweonline.ca") {
    return (
      <div style={{ padding: 30, color: "white" }}>
        <h1>Admin Reports</h1>
        <p>Access denied.</p>

        <button
          onClick={() => navigate("/dashboard")}
          style={{
            marginTop: 15,
            padding: "8px 14px",
            border: "none",
            borderRadius: 8,
            backgroundColor: "#2196f3",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: 30, color: "white" }}>Loading reports...</div>;
  }

  return (
    <div style={{ padding: 30, color: "white" }}>
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            padding: "8px 14px",
            border: "none",
            borderRadius: 8,
            backgroundColor: "#2196f3",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Back to Dashboard
        </button>
      </div>

      <h1>Admin Reports</h1>

      {reports.length === 0 ? (
        <p>No real reports found.</p>
      ) : (
        reports.map((report) => (
          <div
            key={report.id}
            style={{
              border: "1px solid #444",
              borderRadius: 10,
              padding: 16,
              marginBottom: 16,
              backgroundColor: "#1a1a1a",
            }}
          >
            <p><b>Reporter:</b> {report.reporterEmail}</p>
            <p><b>Reported User:</b> {report.reportedEmail}</p>
            <p><b>Reported Name:</b> {report.reportedDisplayName || "Unknown"}</p>
            <p><b>Reason:</b> {report.reason}</p>
            <p><b>Explanation:</b> {report.explanation || "None"}</p>
            <p><b>Status:</b> {report.status || "open"}</p>
          </div>
        ))
      )}
    </div>
  );
}