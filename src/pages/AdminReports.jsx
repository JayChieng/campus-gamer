import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, query, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";

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

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadReports = async () => {
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

        let reportsSnap;

        try {
          reportsSnap = await getDocs(query(collection(db, "reports"), orderBy("createdAt", "desc")));
        } catch (error) {
          console.warn("Falling back to unordered report query:", error);
          reportsSnap = await getDocs(collection(db, "reports"));
        }

        const reportItems = reportsSnap.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
          .sort((a, b) => {
            const aTime = a.createdAt?.seconds ?? a.createdAt ?? 0;
            const bTime = b.createdAt?.seconds ?? b.createdAt ?? 0;
            return bTime - aTime;
          });

        setReports(reportItems);
      } catch (error) {
        console.error("Failed to load reports:", error);
        alert("Could not load reports.");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [navigate]);

  if (loading) {
    return <div style={{ padding: 30, color: "white" }}>Loading reports...</div>;
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
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
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
          <h1 style={{ marginTop: 0, marginBottom: 8 }}>Admin Reports</h1>
          <p style={{ margin: 0, color: "#c7c7c7", lineHeight: 1.6 }}>
            Review player behavior reports and keep track of recent moderation submissions.
          </p>
        </div>

        {reports.length === 0 ? (
          <div
            style={{
              background: "#262626",
              borderRadius: 14,
              padding: 24,
              color: "#c7c7c7",
            }}
          >
            No reports have been submitted yet.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {reports.map((report) => (
              <div
                key={report.id}
                style={{
                  background: "#262626",
                  borderRadius: 14,
                  padding: 20,
                  borderLeft: "5px solid #ff9800",
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: 10 }}>
                  {report.reason || "Behavior Report"}
                </h3>
                <p style={{ margin: "0 0 8px 0", color: "#d8d8d8" }}>
                  <b>Reported User:</b> {report.reportedUserName || report.reportedUserEmail || report.reportedUserId || "N/A"}
                </p>
                <p style={{ margin: "0 0 8px 0", color: "#d8d8d8" }}>
                  <b>Reported By:</b> {report.reporterName || report.reporterEmail || report.reporterId || "N/A"}
                </p>
                <p style={{ margin: "0 0 8px 0", color: "#d8d8d8" }}>
                  <b>Explanation:</b> {report.explanation || report.details || "No extra explanation provided."}
                </p>
                <p style={{ margin: 0, color: "#9e9e9e", fontSize: 13 }}>
                  Submitted: {formatDate(report.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
