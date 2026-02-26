import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

const GAMES = ["Valorant", "League of Legends", "CS2", "FIFA"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  // selections
  const [selectedGame, setSelectedGame] = useState(GAMES[0]);
  const [skill, setSkill] = useState(LEVELS[1]);

  // UI state
  const [saved, setSaved] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const navigate = useNavigate();

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

        // if both exist -> consider saved
        if (data.favoriteGame && data.skillLevel) {
          setSaved(true);
          setStatusMsg("Loaded saved settings ✅");
        }
      }
    });

    return () => unsub();
  }, [navigate]);

  // if user changes dropdown, mark unsaved
  useEffect(() => {
    setSaved(false);
    setStatusMsg("");
  }, [selectedGame, skill]);

  const onSave = async () => {
    if (!user) return;

    try {
      const ref = doc(db, "users", user.uid);

      await updateDoc(ref, {
        favoriteGame: selectedGame,
        skillLevel: skill,
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

  const onFindTeammate = () => {
    // only allow after saved
    if (!saved) return;

    navigate("/teammates", {
      state: { game: selectedGame, skill },
    });
  };

  const logout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div style={{ padding: 30, maxWidth: 520 }}>
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

      <hr />

      <h3>Game Settings</h3>

      <label>Select Game</label>
      <select
        style={{ width: "100%", marginBottom: 10 }}
        value={selectedGame}
        onChange={(e) => setSelectedGame(e.target.value)}
      >
        {GAMES.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>

      <label>Skill Level</label>
      <select
        style={{ width: "100%", marginBottom: 12 }}
        value={skill}
        onChange={(e) => setSkill(e.target.value)}
      >
        {LEVELS.map((l) => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button onClick={onSave}>Save</button>

        <button onClick={onFindTeammate} disabled={!saved}>
          Find Teammate
        </button>

        {statusMsg && (
          <span style={{ fontWeight: "bold" }}>
            {statusMsg}
          </span>
        )}
      </div>

      <div style={{ marginTop: 14 }}>
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
}