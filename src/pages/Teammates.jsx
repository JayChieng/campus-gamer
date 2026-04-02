import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
} from "firebase/firestore";

export default function Teammates() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [blockedIds, setBlockedIds] = useState([]);
  const [reportingUser, setReportingUser] = useState(null);
  const [reason, setReason] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(true);

  const currentUser = auth.currentUser;

  const loadUsers = async () => {
    const snap = await getDocs(collection(db, "users"));
    const allUsers = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    const filtered = allUsers.filter((u) => u.id !== currentUser?.uid);
    setUsers(filtered);
  };

  const loadBlockedUsers = async () => {
    if (!currentUser) return;

    const q = query(
      collection(db, "blocks"),
      where("blockerId", "==", currentUser.uid)
    );

    const snap = await getDocs(q);
    const ids = snap.docs.map((d) => d.data().blockedId);
    setBlockedIds(ids);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!currentUser) return;
        await loadUsers();
        await loadBlockedUsers();
      } catch (error) {
        console.error("Error loading teammates:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  const handleBlock = async (user) => {
    if (!currentUser) return;

    if (user.id === currentUser.uid) {
      alert("You cannot block yourself.");
      return;
    }

    if (blockedIds.includes(user.id)) {
      alert("User already blocked.");
      return;
    }

    try {
      await addDoc(collection(db, "blocks"), {
        blockerId: currentUser.uid,
        blockedId: user.id,
        blockerEmail: currentUser.email,
        blockedEmail: user.email || "",
        createdAt: Date.now(),
      });

      setBlockedIds((prev) => [...prev, user.id]);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      alert("User blocked successfully.");
    } catch (error) {
      console.error("Error blocking user:", error);
      alert("Failed to block user.");
    }
  };

  const handleRemove = (user) => {
    if (!currentUser) return;

    if (user.id === currentUser.uid) {
      alert("You cannot remove yourself.");
      return;
    }

    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    alert("User removed from the list.");
  };

  const closeReportModal = () => {
    setReportingUser(null);
    setReason("");
    setExplanation("");
  };

  const submitReport = async () => {
    if (!currentUser || !reportingUser) return;

    if (!reason.trim()) {
      alert("Please select a reason before submitting.");
      return;
    }

    try {
      await addDoc(collection(db, "reports"), {
        reporterId: currentUser.uid,
        reporterEmail: currentUser.email,
        reportedId: reportingUser.id,
        reportedEmail: reportingUser.email || "",
        reportedDisplayName: reportingUser.displayName || "No name",
        reason,
        explanation: explanation.trim(),
        createdAt: Date.now(),
        status: "open",
      });

      alert("Report submitted successfully.");

      setUsers((prev) => prev.filter((u) => u.id !== reportingUser.id));

      closeReportModal();
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report.");
    }
  };

  const buttonStyle = {
    border: "none",
    borderRadius: 8,
    padding: "8px 14px",
    fontWeight: "bold",
    cursor: "pointer",
  };

  if (loading) {
    return <div style={{ padding: 30, color: "white" }}>Loading teammates...</div>;
  }

  return (
    <div style={{ padding: 30, color: "white" }}>
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            ...buttonStyle,
            backgroundColor: "#2196f3",
            color: "white",
          }}
        >
          Back to Dashboard
        </button>
      </div>

      <h1>Teammates</h1>

      {users.length === 0 ? (
        <p>No teammates available.</p>
      ) : (
        users.map((user) => (
          <div
            key={user.id}
            style={{
              border: "1px solid #444",
              borderRadius: 10,
              padding: 16,
              marginBottom: 16,
              backgroundColor: "#1a1a1a",
            }}
          >
            <p><b>Name:</b> {user.displayName || "No name"}</p>
            <p><b>Email:</b> {user.email || "No email"}</p>
            <p><b>Program:</b> {user.program || "Not set"}</p>
            <p><b>Year:</b> {user.year || "Not set"}</p>

            <div style={{ marginTop: 12 }}>
              <button
                onClick={() => handleBlock(user)}
                style={{
                  ...buttonStyle,
                  backgroundColor: "#e53935",
                  color: "white",
                }}
              >
                Block
              </button>

              <button
                onClick={() => handleRemove(user)}
                style={{
                  ...buttonStyle,
                  backgroundColor: "#fb8c00",
                  color: "white",
                  marginLeft: 10,
                }}
              >
                Remove
              </button>

              <button
                onClick={() => setReportingUser(user)}
                style={{
                  ...buttonStyle,
                  backgroundColor: "#8e24aa",
                  color: "white",
                  marginLeft: 10,
                }}
              >
                Report
              </button>
            </div>
          </div>
        ))
      )}

      {reportingUser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#1f1f1f",
              color: "white",
              padding: 24,
              borderRadius: 12,
              width: "90%",
              maxWidth: 500,
              boxShadow: "0 0 20px rgba(0,0,0,0.4)",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Report User</h3>

            <p>
              Reporting:{" "}
              <b>{reportingUser.displayName || reportingUser.email || "Unknown user"}</b>
            </p>

            <label><b>Reason</b></label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{
                width: "100%",
                marginTop: 6,
                marginBottom: 12,
                padding: 10,
                borderRadius: 8,
              }}
            >
              <option value="">Select a reason</option>
              <option value="Toxic behavior">Toxic behavior</option>
              <option value="Harassment">Harassment</option>
              <option value="Spam">Spam</option>
              <option value="Offensive language">Offensive language</option>
              <option value="Cheating">Cheating</option>
              <option value="Other">Other</option>
            </select>

            <label><b>Optional Explanation</b></label>
            <textarea
              placeholder="Add extra details if needed"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              style={{
                width: "100%",
                minHeight: 100,
                marginTop: 6,
                marginBottom: 14,
                padding: 10,
                borderRadius: 8,
                resize: "vertical",
              }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={closeReportModal}
                style={{
                  ...buttonStyle,
                  backgroundColor: "#757575",
                  color: "white",
                }}
              >
                Cancel
              </button>

              <button
                onClick={submitReport}
                style={{
                  ...buttonStyle,
                  backgroundColor: "#8e24aa",
                  color: "white",
                }}
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}