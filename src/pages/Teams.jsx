import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const ALL_GAMES = ["Valorant", "League of Legends", "CS2", "FIFA"];
const ALL_LEVELS = ["Beginner", "Intermediate", "Advanced"];
const ALL_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const ALL_TIME_SLOTS = ["Morning", "Afternoon", "Evening"];

const rotateValue = (list, currentValue, step = 1) => {
  const index = list.indexOf(currentValue);
  if (index === -1) return list[0];
  return list[(index + step) % list.length];
};

const getUniqueValues = (primaryList, fallbackList, neededCount) => {
  const result = [];

  for (const item of primaryList) {
    if (!result.includes(item)) result.push(item);
    if (result.length === neededCount) return result;
  }

  for (const item of fallbackList) {
    if (!result.includes(item)) result.push(item);
    if (result.length === neededCount) return result;
  }

  return result;
};

const buildMockTeams = (game, skill, availableDays, availableTimeSlots) => {
  const safeDays = getUniqueValues(availableDays, ALL_DAYS, 3);
  const safeTimeSlots = getUniqueValues(availableTimeSlots, ALL_TIME_SLOTS, 3);

  const altSkill1 = rotateValue(ALL_LEVELS, skill, 1);
  const altSkill2 = rotateValue(ALL_LEVELS, skill, 2);

  const extraGame1 = rotateValue(ALL_GAMES, game, 1);
  const extraGame2 = rotateValue(ALL_GAMES, game, 2);

  const [day1, day2, day3] = safeDays;
  const [slot1, slot2, slot3] = safeTimeSlots;

  return [
    {
      id: "t1",
      name: "Falcons United",
      game,
      preferredSkill: skill,
      description: "Looking for active players for ranked matches.",
      availableDays: [day1, day2],
      availableTimeSlots: [slot1],
      members: 3,
      match: "98% Match",
    },
    {
      id: "t2",
      name: "Night Raiders",
      game,
      preferredSkill: altSkill1,
      description: "Casual but competitive team for evening games.",
      availableDays: [day2, day3],
      availableTimeSlots: [slot1, slot2],
      members: 4,
      match: "94% Match",
    },
    {
      id: "t3",
      name: "Campus Champs",
      game,
      preferredSkill: skill,
      description: "Friendly student team that plays on flexible schedules.",
      availableDays: [day1],
      availableTimeSlots: [slot2],
      members: 2,
      match: "91% Match",
    },
  ];
};

export default function Teams() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const selectedGame = state.game || "Valorant";
  const selectedSkill = state.skill || "Intermediate";
  const availableDays = state.availableDays || [];
  const availableTimeSlots = state.availableTimeSlots || [];

  const [sentRequests, setSentRequests] = useState({});
  const [statusMsg, setStatusMsg] = useState("");
  const [dbTeams, setDbTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const snapshot = await getDocs(collection(db, "teams"));

        const teamsFromDb = snapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            name: String(data.name || "Unnamed Team").trim(),
            game: String(data.game || selectedGame).trim(),
            preferredSkill: String(data.skill || selectedSkill).trim(),
            description: String(
              data.description || "Team created in Firestore."
            ).trim(),
            availableDays: Array.isArray(data.days)
              ? data.days.map((day) => String(day).trim())
              : [],
            availableTimeSlots: Array.isArray(data.timeSlots)
              ? data.timeSlots.map((slot) => String(slot).trim())
              : data.time
              ? [String(data.time).trim()]
              : [],
            members: typeof data.members === "number" ? data.members : 0,
            match: String(data.match || "95% Match").trim(),
          };
        });

        setDbTeams(teamsFromDb);

        if (teamsFromDb.length > 0) {
          setStatusMsg(`Loaded ${teamsFromDb.length} Firestore team(s).`);
        } else {
          setStatusMsg("No Firestore teams found. Showing fallback teams.");
        }
      } catch (error) {
        console.error("Error loading teams:", error);
        setStatusMsg("Could not load Firestore teams. Showing fallback teams.");
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, [selectedGame, selectedSkill]);

  const fallbackTeams = useMemo(() => {
    return buildMockTeams(
      selectedGame,
      selectedSkill,
      availableDays,
      availableTimeSlots
    );
  }, [selectedGame, selectedSkill, availableDays, availableTimeSlots]);

  const teamsToShow = dbTeams.length > 0 ? dbTeams : fallbackTeams;

  const handleRequestJoin = (team) => {
    setSentRequests((prev) => ({
      ...prev,
      [team.id]: true,
    }));
    setStatusMsg(`Request sent to "${team.name}"`);
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1f1f1f",
        color: "white",
        padding: "28px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Recommended Teams</h2>
        <p style={{ color: "#bdbdbd", marginTop: 0, marginBottom: 24 }}>
          Teams matched based on your game, skill level, and availability
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
            Loading teams...
          </div>
        )}

        {statusMsg && (
          <div style={{ marginBottom: 18, color: "#d7c8ff", fontWeight: "bold" }}>
            {statusMsg}
          </div>
        )}

        {!loading && teamsToShow.length === 0 && (
          <div style={{ color: "#d7c8ff", fontWeight: "bold" }}>
            No teams available.
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(280px, 1fr))",
            gap: 18,
          }}
        >
          {teamsToShow.map((team) => (
            <div
              key={team.id}
              style={{
                background: "#f4f4f4",
                color: "#111",
                borderRadius: 16,
                padding: 18,
                boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    background: "#c7b8ff",
                    color: "#241c45",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                  }}
                >
                  {getInitials(team.name)}
                </div>

                <div>
                  <h3 style={{ margin: 0, fontSize: 18 }}>{team.name}</h3>
                  <div style={{ fontSize: 14, color: "#666" }}>{team.match}</div>
                </div>
              </div>

              <p style={{ margin: "0 0 10px 0" }}>
                {team.game} - {team.preferredSkill}
              </p>

              <p style={{ margin: "0 0 10px 0", lineHeight: 1.5 }}>
                {team.description}
              </p>

              <p style={{ margin: "0 0 8px 0" }}>
                <b>Days:</b> {team.availableDays.join(", ") || "Not specified"}
              </p>

              <p style={{ margin: "0 0 8px 0" }}>
                <b>Time:</b> {team.availableTimeSlots.join(", ") || "Not specified"}
              </p>

              <p style={{ margin: "0 0 18px 0" }}>
                <b>Members:</b> {team.members}
              </p>

              <button
                onClick={() => handleRequestJoin(team)}
                disabled={!!sentRequests[team.id]}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: sentRequests[team.id] ? "#444" : "#000",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: "bold",
                  cursor: sentRequests[team.id] ? "default" : "pointer",
                }}
              >
                {sentRequests[team.id] ? "Request Sent" : "Request to Join"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
