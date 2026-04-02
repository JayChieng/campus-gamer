import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

const GAMES = ["Valorant", "League of Legends", "CS2", "FIFA"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const TIME_SLOTS = ["Morning", "Afternoon", "Evening"];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  // selections
  const [selectedGame, setSelectedGame] = useState(GAMES[0]);
  const [skill, setSkill] = useState(LEVELS[1]);

  // available time
  const [availableDays, setAvailableDays] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  // UI state
  const [saved, setSaved] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const navigate = useNavigate();
  const isAdmin = profile?.role?.trim().toLowerCase() === "admin";

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        navigate("/login");
        return;
      }
      setUser(u);

      const ref = doc(db, "users", u.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setProfile(data);

        // load saved selections if exist
        if (data.favoriteGame) setSelectedGame(data.favoriteGame);
        if (data.skillLevel) setSkill(data.skillLevel);

        // Load availability from Firestore
        if (data.availableDays) setAvailableDays(data.availableDays);
        if (data.availableTimeSlots) {
          setAvailableTimeSlots(data.availableTimeSlots);
        }

        // if both exist -> consider saved
        if (
          data.favoriteGame &&
          data.skillLevel &&
          data.availableDays &&
          data.availableDays.length > 0 &&
          data.availableTimeSlots &&
          data.availableTimeSlots.length > 0
        ) {
          setSaved(true);
          setStatusMsg("Loaded saved settings");
        }
      }

    });

    return () => unsub();
  }, [navigate]);


  // handle day change
  const handleDayChange = (day) => {
    setAvailableDays((prev) =>
      prev.includes(day)
        ? prev.filter((item) => item !== day)
        : [...prev, day]
    );
    setSaved(false);
    setStatusMsg("");
  };

  // handle time change
  const handleTimeSlotChange = (slot) => {
    setAvailableTimeSlots((prev) =>
      prev.includes(slot)
        ? prev.filter((item) => item !== slot)
        : [...prev, slot]
    );
    setSaved(false);
    setStatusMsg("");
  };

  const onSave = async () => {
    if (!user) return;

    // validation for day and time available
    if (availableDays.length === 0 || availableTimeSlots.length === 0) {
      setSaved(false);
      setStatusMsg("Please select at least one day and one time slot");
      return;
    }

    try {
      const ref = doc(db, "users", user.uid);

      await updateDoc(ref, {
        favoriteGame: selectedGame,
        skillLevel: skill,
        availableDays,
        availableTimeSlots,
        updatedAt: Date.now(),
      });

      setSaved(true);
      setStatusMsg("Saved ✅");
    } catch (e) {
      setSaved(false);
      setStatusMsg("Save failed ❌");
      alert(e.message);
    }
  };

  // Find teammate
  const onFindTeammate = () => {
    // only allow after saved
    if (!saved) return;

    navigate("/teammates", {
      state: { game: selectedGame, skill },
    });
  };

  // Create team
  const onCreateTeam = () => {
    if (!saved) return;

    navigate("/create-team", {
      state: { game: selectedGame, skill },
    });
  };

  // join teams
  const onFindTeam = () => {
    if (!saved) return;

    navigate("/teams", {
      state: {
        game: selectedGame,
        skill,
        availableDays,
        availableTimeSlots,
      },
    });
  };

  // view tournaments
  const onViewTournaments = () => {
  if (!saved) return;

  navigate("/tournaments");
};

  const logout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div style={{ padding: 30, maxWidth: 1000 }}>
      <h2>Dashboard</h2>

      {profile ? (
        <div style={{ marginBottom: 12 }}>
          <div><b>Email:</b> {profile.email}</div>
          <div><b>Name:</b> {profile.displayName}</div>
          <div><b>Program:</b> {profile.program}</div>
          <div><b>Year:</b> {profile.year}</div>
        </div>
      ) : (
        <div style={{ marginBottom: 12 }}>Loading profile...</div>
      )}

      {profile?.teamName && (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            border: "1px solid #555",
            borderRadius: 8,
            background: "#1f1f1f",
          }}
        >
          <h3 style={{ marginTop: 0 }}>My Team</h3>
          <div><b>Team Name:</b> {profile.teamName}</div>
          <div><b>Game:</b> {profile.teamGame}</div>
          <div><b>Description:</b> {profile.teamDescription || "No description"}</div>
          <div><b>Role:</b> {profile.role}</div>
        </div>
      )}

      <hr />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 40,
          alignItems: "start",
          marginTop: 20,
        }}
      >
        <div>
          <h3>Game Settings</h3>

          <label>Select Game</label>
          <select
            style={{ width: "100%", marginBottom: 10 }}
            value={selectedGame}
            onChange={(e) => {
              setSelectedGame(e.target.value);
              setSaved(false);
              setStatusMsg("");
            }}
          >
            {GAMES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <label>Skill Level</label>
          <select
            style={{ width: "100%", marginBottom: 12 }}
            value={skill}
            onChange={(e) => {
              setSkill(e.target.value);
              setSaved(false);
              setStatusMsg("");
            }}
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div>
          <h3>Availability</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
              marginTop: 8,
            }}
          >
            <div>
              <label style={{ display: "block", marginBottom: 10, fontWeight: "bold" }}>
                Available Days
              </label>

              {DAYS.map((day) => (
                <label
                  key={day}
                  style={{ display: "block", marginBottom: 6 }}
                >
                  <input
                    type="checkbox"
                    checked={availableDays.includes(day)}
                    onChange={() => handleDayChange(day)}
                    style={{ marginRight: 8 }}
                  />
                  {day}
                </label>
              ))}
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 10, fontWeight: "bold" }}>
                Preferred Time Slots
              </label>

              {TIME_SLOTS.map((slot) => (
                <label
                  key={slot}
                  style={{ display: "block", marginBottom: 6 }}
                >
                  <input
                    type="checkbox"
                    checked={availableTimeSlots.includes(slot)}
                    onChange={() => handleTimeSlotChange(slot)}
                    style={{ marginRight: 8 }}
                  />
                  {slot}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 20 }}>
        <button onClick={onSave}>Save</button>

        <button onClick={onFindTeammate} disabled={!saved}>
          Find Teammate
        </button>

        <button onClick={onCreateTeam} disabled={!saved}>
          Create Team
        </button>

        <button onClick={onFindTeam} disabled={!saved}>
          Join team
        </button>
        <button onClick={onViewTournaments} disabled={!saved}>
          View Tournaments
        </button>
        <button onClick={() => navigate("/notifications")} disabled={!saved}>
          Notifications
        </button>

        {/* ONLY show this button if the user is an admin */}
        {isAdmin && (
          <button onClick={() => navigate("/admin")}>
            Admin Panel
          </button>
        )}

        {statusMsg && (
          <span style={{ fontWeight: "bold" }}>
            {statusMsg}
          </span>
        )}
      </div>

      <div
        style={{
          marginTop: 20,
          padding: 16,
          border: "1px solid #555",
          borderRadius: 8,
          background: "#1f1f1f",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Saved Availability</h3>

        <p>
          <b>Available Days:</b>{" "}
          {availableDays.length > 0 ? availableDays.join(", ") : "No days selected"}
        </p>

        <p style={{ marginBottom: 0 }}>
          <b>Preferred Time Slots:</b>{" "}
          {availableTimeSlots.length > 0
            ? availableTimeSlots.join(", ")
            : "No time slots selected"}
        </p>
      </div>

      <div style={{ marginTop: 14 }}>
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
}


