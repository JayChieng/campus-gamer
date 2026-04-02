import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { createNotification } from "../notifications";

export default function CreateTeam() {
  const navigate = useNavigate();

  const [teamName, setTeamName] = useState("");
  const [game, setGame] = useState("Valorant");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in.");
      navigate("/login");
      return;
    }

    if (!teamName.trim()) {
      alert("Please enter a team name.");
      return;
    }

    try {
      setLoading(true);

      // 1. Create a new team document
      const teamRef = await addDoc(collection(db, "teams"), {
        name: teamName.trim(),
        game,
        description: description.trim(),
        ownerId: user.uid,
        ownerEmail: user.email || "",
        members: [user.uid],
        memberCount: 1,
        createdAt: Date.now(),
      });

      // 2. Update current user profile with team info
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        teamId: teamRef.id,
        teamName: teamName.trim(),
        teamGame: game,
        teamDescription: description.trim(),
        role: "Owner",
      });

      await createNotification({
        recipientId: user.uid,
        type: "team_created",
        message: `Your team "${teamName.trim()}" was created successfully.`,
        meta: {
          teamId: teamRef.id,
          teamName: teamName.trim(),
          game,
        },
      });

      alert(`Team "${teamName}" created successfully!`);
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40, maxWidth: 600, margin: "0 auto", color: "white" }}>
      <h2>Create a Team (US-009)</h2>
      <p style={{ color: "#999" }}>Fill out the details to start your gaming team.</p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        <div>
          <label>Team Name:</label><br />
          <input
            type="text"
            value={teamName}
            style={{ width: "100%", padding: 10, borderRadius: 6, marginTop: 5 }}
            placeholder="e.g. Falcons United"
            onChange={(e) => setTeamName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Select Game:</label><br />
          <select
            value={game}
            onChange={(e) => setGame(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 6, marginTop: 5 }}
          >
            <option>Valorant</option>
            <option>League of Legends</option>
            <option>CS2</option>
            <option>Overwatch 2</option>
          </select>
        </div>

        <div>
          <label>Team Description:</label><br />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 6, marginTop: 5 }}
            rows="4"
            placeholder="What is your team about?"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: 12,
            background: "#c7b8ff",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
            cursor: "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Creating..." : "Create Team"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          style={{ background: "transparent", border: "none", color: "#999", cursor: "pointer" }}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}
