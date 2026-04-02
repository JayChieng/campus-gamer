import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { addDoc, collection } from "firebase/firestore";
import { auth, db } from "../firebase";

const PROGRAMS = ["Computer Science", "Web Development", "Engineering", "Business", "Mathematics", "Psychology", "Nursing", "Cyber Security"];
const YEARS = ["Freshman", "Sophomore", "Junior", "Senior"];
const NAMES = ["ShadowNinja", "ProGamer420", "GamerGirl123", "TeamPlayer", "NoobSlayer", "ChillGamer", "NightOwl", "AceStriker"];
const REPORT_REASONS = ["Toxic behavior", "Harassment", "Spam", "Cheating", "Other"];

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function initials(name) { return name.substring(0, 2).toUpperCase(); }

function buildPlayers(game, skill) {
  return Array.from({ length: 6 }).map((_, i) => {
    const name = NAMES[i] || `Gamer${i + 1}`;
    return {
      id: i,
      userId: `mock-player-${i + 1}`,
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

  const [sentRequests, setSentRequests] = useState([]);
  const [reportingPlayer, setReportingPlayer] = useState(null);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [reportExplanation, setReportExplanation] = useState("");
  const [reportStatus, setReportStatus] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const players = useMemo(() => buildPlayers(game, skill), [game, skill]);

  const handleConnect = (playerId) => {
    setSentRequests((prev) => [...prev, playerId]);
    alert("Friend request sent!");
  };

  const openReportForm = (player) => {
    setReportingPlayer(player);
    setReportReason(REPORT_REASONS[0]);
    setReportExplanation("");
    setReportStatus("");
  };

  const closeReportForm = () => {
    setReportingPlayer(null);
    setReportReason(REPORT_REASONS[0]);
    setReportExplanation("");
    setIsSubmittingReport(false);
  };

  const submitReport = async () => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      return;
    }

    if (!reportingPlayer) {
      return;
    }

    if (!reportReason.trim()) {
      setReportStatus("Please select a reason.");
      return;
    }

    if (reportingPlayer.userId === user.uid) {
      setReportStatus("You cannot report yourself.");
      return;
    }

    try {
      setIsSubmittingReport(true);
      setReportStatus("");

      await addDoc(collection(db, "reports"), {
        reporterId: user.uid,
        reporterEmail: user.email || "",
        reporterName: user.displayName || user.email || "Anonymous User",
        reportedUserId: reportingPlayer.userId,
        reportedUserName: reportingPlayer.name,
        reason: reportReason,
        explanation: reportExplanation.trim(),
        source: "teammates",
        createdAt: Date.now(),
      });

      setReportStatus(`Report submitted for "${reportingPlayer.name}".`);
      setTimeout(() => {
        closeReportForm();
      }, 800);
    } catch (error) {
      console.error("Failed to submit report:", error);
      setReportStatus("Could not submit report right now.");
      setIsSubmittingReport(false);
    }
  };

  return (
    <div style={{ padding: 30, maxWidth: 1000, margin: "0 auto", position: "relative" }}>
      <h2 style={{ marginBottom: 6 }}>Recommended Teammates</h2>
      <div style={{ color: "#999", marginBottom: 20 }}>Players matched based on your game and skill level</div>

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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(260px, 1fr))", gap: 20 }}>
        {players.map((p) => {
          const isPending = sentRequests.includes(p.id);
          return (
            <div key={p.id} style={{ background: "white", color: "#111", borderRadius: 14, padding: 20, boxShadow: "0 5px 15px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 45, height: 45, borderRadius: "50%", background: "#c7b8ff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                    {p.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: "bold" }}>{p.name}</div>
                    <div style={{ fontSize: 13, color: "#666" }}>{p.match}% Match</div>
                  </div>
                </div>
                <div style={{ marginTop: 14, color: "#333" }}>
                  <div>{p.program} • {p.year}</div>
                  <div style={{ marginTop: 6 }}>{p.game} • {p.skill}</div>
                </div>
              </div>

              <button
                disabled={isPending}
                style={{
                  marginTop: 18, width: "100%", padding: 10, borderRadius: 10, border: "none",
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
                  marginTop: 10,
                  width: "100%",
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid #d32f2f",
                  background: "white",
                  color: "#d32f2f",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
                onClick={() => openReportForm(p)}
              >
                Report
              </button>
            </div>
          );
        })}
      </div>

      {reportingPlayer && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 520,
              background: "#f4f4f4",
              color: "#111",
              borderRadius: 18,
              padding: 24,
              boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: 10 }}>Report Player</h3>
            <p style={{ marginTop: 0, marginBottom: 16, color: "#555" }}>
              Reporting <b>{reportingPlayer.name}</b>. Please select a reason and add details if needed.
            </p>

            <label style={{ display: "block", fontWeight: "bold", marginBottom: 8 }}>
              Reason
            </label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: "1px solid #ccc",
                marginBottom: 14,
              }}
            >
              {REPORT_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>

            <label style={{ display: "block", fontWeight: "bold", marginBottom: 8 }}>
              Explanation (Optional)
            </label>
            <textarea
              value={reportExplanation}
              onChange={(e) => setReportExplanation(e.target.value)}
              rows="4"
              placeholder="Share what happened..."
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: "1px solid #ccc",
                marginBottom: 14,
                resize: "vertical",
              }}
            />

            {reportStatus && (
              <div style={{ marginBottom: 14, color: reportStatus.startsWith("Report submitted") ? "#2e7d32" : "#c62828", fontWeight: "bold" }}>
                {reportStatus}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={closeReportForm}
                disabled={isSubmittingReport}
                style={{
                  padding: "10px 18px",
                  background: "#ffffff",
                  color: "#111",
                  border: "1px solid #bbb",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitReport}
                disabled={isSubmittingReport}
                style={{
                  padding: "10px 18px",
                  background: "#151515",
                  color: "white",
                  border: "1px solid #444",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                {isSubmittingReport ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
