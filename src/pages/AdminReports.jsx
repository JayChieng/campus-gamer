import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

export default function AdminReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    const loadReports = async () => {
      try {
        const reportsRef = collection(db, "reports");
        const q = query(reportsRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const reportsList = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            reporterId: data.reporterId || "Unknown",
            reportedUserId: data.reportedUserId || "Unknown",
            reason: data.reason || "No reason provided",
            explanation: data.explanation || "",
            createdAt: data.createdAt?.toDate
              ? data.createdAt.toDate().toLocaleString()
              : "No date",
          };
        });

        setReports(reportsList);
      } catch (error) {
        console.error("Error loading reports:", error);
        setStatusMsg("Error loading reports.");
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1f1f1f",
        color: "white",
        padding: 28,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Admin Reports Review</h2>
        <p style={{ color: "#bdbdbd", marginTop: 0, marginBottom: 24 }}>
          Review reports submitted by users for moderation purposes
        </p>

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

        {loading && (
          <div style={{ marginBottom: 18, color: "#d7c8ff", fontWeight: "bold" }}>
            Loading reports...
          </div>
        )}

        {statusMsg && (
          <div style={{ marginBottom: 18, color: "#ffb3b3", fontWeight: "bold" }}>
            {statusMsg}
          </div>
        )}

        {!loading && reports.length === 0 && (
          <div style={{ color: "#d7c8ff", fontWeight: "bold" }}>
            No reports found.
          </div>
        )}

        <div style={{ display: "grid", gap: 16 }}>
          {reports.map((report) => (
            <div
              key={report.id}
              style={{
                background: "#f4f4f4",
                color: "#111",
                borderRadius: 16,
                padding: 18,
                boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: 12 }}>
                Report: {report.reason}
              </h3>

              <p style={{ margin: "0 0 8px 0" }}>
                <b>Reporter ID:</b> {report.reporterId}
              </p>

              <p style={{ margin: "0 0 8px 0" }}>
                <b>Reported User ID:</b> {report.reportedUserId}
              </p>

              <p style={{ margin: "0 0 8px 0" }}>
                <b>Explanation:</b>{" "}
                {report.explanation ? report.explanation : "No explanation provided"}
              </p>

              <p style={{ margin: 0 }}>
                <b>Submitted At:</b> {report.createdAt}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
