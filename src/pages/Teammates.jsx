import { useLocation, useNavigate } from "react-router-dom";

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

  const players = buildPlayers(game, skill);

  return (
    <div style={{ padding: 30, maxWidth: 1000, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 6 }}>Recommended Teammates</h2>
      <div style={{ color: "#999", marginBottom: 20 }}>
        Players matched based on your game and skill level
      </div>

      <div style={{ marginBottom: 15 }}>
        Showing players for: <b>{game}</b> / <b>{skill}</b>
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(260px, 1fr))",
          gap: 20,
        }}
      >
        {players.map((p) => (
          <div
            key={p.name}
            style={{
              background: "white",
              color: "#111",              // ✅ quan trọng: text màu đen
              borderRadius: 14,
              padding: 20,
              boxShadow: "0 5px 15px rgba(0,0,0,0.15)",
              minHeight: 170,
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
                <div>{p.program} • {p.year}</div>
                <div style={{ marginTop: 6 }}>
                  {p.game} • {p.skill}
                </div>
              </div>
            </div>

            <button
              style={{
                marginTop: 18,
                width: "100%",
                padding: 10,
                borderRadius: 10,
                border: "none",
                background: "black",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
              }}
              onClick={() => alert("Friend request sent (mock)")}
            >
              Connect
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}