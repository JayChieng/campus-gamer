import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateTeam() {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Team "${teamName}" created successfully! You are the owner.`);
    navigate("/dashboard"); // Redirect back to dashboard after creating
  };

  return (
    <div style={{ padding: 40, maxWidth: 600, margin: "0 auto", color: "white" }}>
      <h2>Create a Team (US-009)</h2>
      <p style={{ color: "#999" }}>Fill out the details to start your gaming team.</p>
      
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        <div>
          <label>Team Name:</label><br/>
          <input 
            type="text" 
            style={{ width: "100%", padding: 10, borderRadius: 6, marginTop: 5 }}
            placeholder="e.g. Falcons United"
            onChange={(e) => setTeamName(e.target.value)}
            required 
          />
        </div>

        <div>
          <label>Select Game:</label><br/>
          <select style={{ width: "100%", padding: 10, borderRadius: 6, marginTop: 5 }}>
            <option>Valorant</option>
            <option>League of Legends</option>
            <option>CS2</option>
            <option>Overwatch 2</option>
          </select>
        </div>

        <div>
          <label>Team Description:</label><br/>
          <textarea 
            style={{ width: "100%", padding: 10, borderRadius: 6, marginTop: 5 }}
            rows="4" 
            placeholder="What is your team about?"
          ></textarea>
        </div>

        <button 
          type="submit" 
          style={{ padding: 12, background: "#c7b8ff", border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer" }}
        >
          Create Team
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