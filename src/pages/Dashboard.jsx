import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function Dashboard() {
  const navigate = useNavigate();

  const [saved, setSaved] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState({
    displayName: "Not set",
    program: "Not set",
    year: "Not set",
    game: "FIFA",
    skillLevel: "Beginner",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      setCurrentUser(user);

      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          setProfile({
            displayName: data.displayName || "Not set",
            program: data.program || "Not set",
            year: data.year || "Not set",
            game: data.game || "FIFA",
            skillLevel: data.skillLevel || "Beginner",
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSave = () => {
    setSaved(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to log out.");
    }
  };

  return (
    <div style={{ padding: 30, color: "white" }}>
      <h1>Dashboard</h1>

      <p><b>Email:</b> {currentUser?.email || "No email found"}</p>
      <p><b>Name:</b> {profile.displayName}</p>
      <p><b>Program:</b> {profile.program}</p>
      <p><b>Year:</b> {profile.year}</p>

      <div style={{ marginTop: 20, padding: 20, border: "1px solid #444", borderRadius: 10 }}>
        <h2>My Team</h2>
        <p><b>Team Name:</b> No team yet</p>
        <p><b>Game:</b> {profile.game}</p>
        <p><b>Description:</b> No description</p>
        <p><b>Role:</b> Not assigned</p>
      </div>

      <hr style={{ margin: "20px 0" }} />

      <h3>Game Settings</h3>

      <div style={{ display: "flex", gap: 40 }}>
        <div>
          <p>Select Game</p>
          <select defaultValue={profile.game}>
            <option>FIFA</option>
            <option>Valorant</option>
            <option>League of Legends</option>
          </select>

          <p style={{ marginTop: 10 }}>Skill Level</p>
          <select defaultValue={profile.skillLevel}>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>

        <div>
          <p>Available Days</p>
          <div>
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
              <label key={day} style={{ display: "block" }}>
                <input type="checkbox" defaultChecked /> {day}
              </label>
            ))}
          </div>
        </div>

        <div>
          <p>Preferred Time Slots</p>
          <div>
            <label><input type="checkbox" defaultChecked /> Morning</label><br />
            <label><input type="checkbox" defaultChecked /> Afternoon</label><br />
            <label><input type="checkbox" /> Evening</label>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={handleSave}>Save</button>

        <button onClick={() => navigate("/teammates")} style={{ marginLeft: 10 }}>
          Find Teammate
        </button>

        <button onClick={() => navigate("/create-team")} style={{ marginLeft: 10 }}>
          Create Team
        </button>

        <button onClick={() => navigate("/teams")} style={{ marginLeft: 10 }}>
          Join team
        </button>

        <button onClick={() => navigate("/tournaments")} style={{ marginLeft: 10 }}>
          View Tournaments
        </button>

        <button
          onClick={() => navigate("/admin-reports")}
          style={{ marginLeft: 10, background: "#ff9800", color: "black", fontWeight: "bold" }}
        >
          Admin Reports
        </button>
      </div>

      {saved && (
        <p style={{ marginTop: 10, color: "#d7c8ff" }}>
          Settings saved
        </p>
      )}

      <div style={{ marginTop: 20, padding: 20, border: "1px solid #444", borderRadius: 10 }}>
        <h3>Saved Availability</h3>
        <p><b>Available Days:</b> Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday</p>
        <p><b>Preferred Time Slots:</b> Morning, Afternoon</p>
      </div>

      <button onClick={handleLogout} style={{ marginTop: 20 }}>
        Logout
      </button>
    </div>
  );
}