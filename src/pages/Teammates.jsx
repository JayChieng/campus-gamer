import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";

const PROGRAMS = [
  "Computer Science",
  "Web Development",
  "Engineering",
  "Business",
  "Mathematics",
  "Psychology",
  "Nursing",
  "Cyber Security",
];

const YEARS = ["Freshman", "Sophomore", "Junior", "Senior"];
const NAMES = [
  "ShadowNinja",
  "ProGamer420",
  "GamerGirl123",
  "TeamPlayer",
  "NoobSlayer",
  "ChillGamer",
  "NightOwl",
  "AceStriker",
];

const REPORT_REASONS = [
  "Toxic behavior",
  "Spam",
  "Harassment",
  "Cheating",
  "Other",
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function initials(name) {
  return name.substring(0, 2).toUpperCase();
}

function buildPlayers(game, skill) {
  return Array.from({ length: 6 }).map((_, i) => {
    const name = NAMES[i] || `Gamer${i + 1}`;
    return {
      id: i + 1,
      name,
      initials: initials(name),
      match: 98 - i * 3,
      game,
      skill,
      program: pickRandom(PROGRAMS),
      year: pickRandom(YEARS),
    };
  });
}

export default function Teammates() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state || {};
  const game = state.game || "Valorant";
  const skill = state.skill || "Intermediate";

  const [currentUserId, setCurrentUserId] = useState("current-user");
  const [sentRequests, setSentRequests] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [removedUsers, setRemovedUsers] = useState([]);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportExplanation, setReportExplanation] = useState("");
  const [reportError, setReportError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    if (auth.currentUser?.uid) {
      setCurrentUserId(auth.currentUser.uid);
    }
  }, []);

  useEffect(() => {
    const loadBlockedUsers = async () => {
      if (!currentUserId) return;

      try {
        const blocksRef = collection(db, "blocks");
        const q = query(blocksRef, where("blockerId", "==", currentUserId));
        const snapshot = await getDocs(q);

        const blockedIds = snapshot.docs.map((doc) => doc.data().blockedId);
        setBlockedUsers(blockedIds);
      } catch (error) {
        console.error("Error loading blocked users:", error);
      }
    };

    loadBlockedUsers();
  }, [currentUserId]);

  const players = useMemo(() => buildPlayers(game, skill), [game, skill]);

  const visiblePlayers = players.filter(
    (p) => !blockedUsers.includes(p.id) && !removedUsers.includes(p.id)
  );

  const handleConnect = (playerId) => {
    if (String(playerId) === String(currentUserId)) {
      setStatusMsg("You cannot send a request to yourself.");
      return;
    }

    if (blockedUsers.includes(playerId)) {
      setStatusMsg("Blocked users cannot send new requests.");
      return;
    }

    if (sentRequests.includes(playerId)) {
      setStatusMsg("Request already sent.");
      return;
    }

    setSentRequests((prev) => [...prev, playerId]);
    setStatusMsg("Friend request sent!");
  };

  const handleBlock = async (playerId) => {
    if (String(playerId) === String(currentUserId)) {
      setStatusMsg("You cannot block yourself.");
      return;
    }

    if (blockedUsers.includes(playerId)) {
      setStatusMsg("User is already blocked.");
      return;
    }

    try {
      await addDoc(collection(db, "blocks"), {
        blockerId: currentUserId,
        blockedId: playerId,
        createdAt: serverTimestamp(),
      });

      setBlockedUsers((prev) => [...prev, playerId]);
      setSentRequests((prev) => prev.filter((id) => id !== playerId));
      setStatusMsg("User blocked successfully.");
    } catch (error) {
      console.error("Error blocking user:", error);
      setStatusMsg("Error blocking user.");
    }
  };

  const handleRemove = (playerId) => {
    if (String(playerId) === String(currentUserId)) {
      setStatusMsg("You cannot remove yourself.");
      return;
    }

    setRemovedUsers((prev) =>
      prev.includes(playerId) ? prev : [...prev, playerId]
    );
    setSentRequests((prev) => prev.filter((id) => id !== playerId));
    setStatusMsg("User removed successfully.");
  };

  const openReportModal = (playerId) => {
    setReportTarget(playerId);
    setReportReason("");
    setReportExplanation("");
    setReportError("");
    setStatusMsg("");
  };

  const closeReportModal = () => {
    setReportTarget(null);
    setReportReason("");
    setReportExplanation("");
    setReportError("");
  };

  const handleSubmitReport = async () => {
    if (!reportTarget) return;

    if (!reportReason) {
      setReportError("Please select a report reason.");
      return;
    }

    try {
      await addDoc(collection(db, "reports"), {
        reporterId: currentUserId,
        reportedUserId: reportTarget,
        reason: reportReason,
        explanation: reportExplanation.trim(),
        createdAt: serverTimestamp(),
      });

      setReportError("");
      setStatusMsg("Report submitted successfully.");
      closeReportModal();
    } catch (error) {
      console.error("Error submitting report:", error);
      setReportError("");
      setStatusMsg("Error submitting report.");
    }
  };

  return (
    <div style={{ padding: 30, maxWidth: 1000, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 6 }}>Recommended Teammates</h2>
      <div style={{ color: "#999", marginBottom: 20 }}>
        Players matched based on your game and skill level
      </div>

      <button
        style={{
          padding: "8px 12px",
          marginBottom: 20,
          borderRadius: 6,
          border: "1px solid #ccc",
          cursor: "pointer",
          background: "transparent",
          color: "white",
        }}
        onClick={() => navigate("/dashboard")}
      >
        Back
      </button>

      {statusMsg && (
        <div style={{ marginBottom: 18, color: "#d7c8ff", fontWeight: "bold" }}>
          {statusMsg}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(260px, 1fr))",
          gap: 20,
        }}
      >
        {visiblePlayers.map((p) => {
          const isPending = sentRequests.includes(p.id);

          return (
            <div
              key={p.id}
              style={{
                background: "white",
                color: "#111",
                borderRadius: 14,
                padding: 20,
                boxShadow: "0 5px 15px rgba(0,0,0,0.15)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div
                    style={{
                      width: 45,
                      height: 45,
                      borderRadius: "50%",
                      background: "#c7b8ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {p.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: "bold" }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 13, color: "#666" }}>
                      {p.match}% Match
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 14, color: "#333" }}>
                  <div>{p.program} - {p.year}</div>
                  <div style={{ marginTop: 6 }}>{p.game} - {p.skill}</div>
                </div>
              </div>

              <div style={{ marginTop: 18 }}>
                <button
                  disabled={isPending}
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 10,
                    border: "none",
                    background: isPending ? "#ccc" : "black",
                    color: isPending ? "#666" : "white",
                    cursor: isPending ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                  }}
                  onClick={() => handleConnect(p.id)}
                >
                  {isPending ? "Pending" : "Connect"}
                </button>

                <button
                  style={{
                    marginTop: 8,
                    width: "100%",
                    padding: 10,
                    borderRadius: 10,
                    border: "1px solid #b91c1c",
                    background: "white",
                    color: "#b91c1c",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                  onClick={() => handleBlock(p.id)}
                >
                  Block User
                </button>

                <button
                  style={{
                    marginTop: 8,
                    width: "100%",
                    padding: 10,
                    borderRadius: 10,
                    border: "1px solid #444",
                    background: "white",
                    color: "#111",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                  onClick={() => handleRemove(p.id)}
                >
                  Remove User
                </button>

                <button
                  style={{
                    marginTop: 8,
                    width: "100%",
                    padding: 10,
                    borderRadius: 10,
                    border: "1px solid #d97706",
                    background: "white",
                    color: "#d97706",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                  onClick={() => openReportModal(p.id)}
                >
                  Report User
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {reportTarget !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: "white",
              color: "#111",
              width: "100%",
              maxWidth: 500,
              borderRadius: 14,
              padding: 22,
              boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Report User</h3>

            <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
              Reason
            </label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                marginBottom: 14,
              }}
            >
              <option value="">Select a reason</option>
              {REPORT_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>

            <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
              Explanation (optional)
            </label>
            <textarea
              value={reportExplanation}
              onChange={(e) => setReportExplanation(e.target.value)}
              placeholder="Add extra details if needed"
              rows={5}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                resize: "vertical",
                marginBottom: 16,
              }}
            />

            {reportError && (
              <div style={{ color: "#b91c1c", fontWeight: "bold", marginBottom: 12 }}>
                {reportError}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={closeReportModal}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  background: "white",
                  color: "#111",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleSubmitReport}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: "black",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "bold",
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
