import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { createNotification } from "../notifications";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const MOCK_TOURNAMENTS = [
  {
    id: "tour-1",
    title: "Campus Valorant Cup",
    game: "Valorant",
    date: "2026-04-10",
    description: "5v5 tournament for students who enjoy competitive matches.",
  },
  {
    id: "tour-2",
    title: "League Showdown",
    game: "League of Legends",
    date: "2026-04-15",
    description: "Join other campus players and compete in a friendly event.",
  },
  {
    id: "tour-3",
    title: "CS2 Weekend Clash",
    game: "CS2",
    date: "2026-04-20",
    description: "A weekend tournament for students who want organized matches.",
  },
  {
    id: "tour-4",
    title: "FIFA Campus Challenge",
    game: "FIFA",
    date: "2026-04-25",
    description: "Play against other students and test your football gaming skills.",
  },
];

export default function Tournaments() {
  const navigate = useNavigate();
  const [registeredMap, setRegisteredMap] = useState({});
  const [statusMsg, setStatusMsg] = useState("");
  const [loadingId, setLoadingId] = useState("");

  const user = auth.currentUser;

  useEffect(() => {
    const loadRegistrations = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const q = query(
          collection(db, "tournamentRegistrations"),
          where("userId", "==", user.uid)
        );

        const snap = await getDocs(q);

        const map = {};
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          map[data.tournamentId] = true;
        });

        setRegisteredMap(map);
      } catch (error) {
        console.error("Failed to load registrations:", error);
      }
    };

    loadRegistrations();
  }, [navigate, user]);

  const tournaments = useMemo(() => MOCK_TOURNAMENTS, []);

  const handleRegister = async (tournament) => {
    if (!user) {
      alert("You must be logged in.");
      navigate("/login");
      return;
    }

    if (registeredMap[tournament.id]) {
      setStatusMsg(`You already registered for "${tournament.title}".`);
      return;
    }

    try {
      setLoadingId(tournament.id);
      setStatusMsg("");

      const duplicateQuery = query(
        collection(db, "tournamentRegistrations"),
        where("userId", "==", user.uid),
        where("tournamentId", "==", tournament.id)
      );

      const duplicateSnap = await getDocs(duplicateQuery);

      if (!duplicateSnap.empty) {
        setRegisteredMap((prev) => ({
          ...prev,
          [tournament.id]: true,
        }));
        setStatusMsg(`You already registered for "${tournament.title}".`);
        return;
      }

      await addDoc(collection(db, "tournamentRegistrations"), {
        tournamentId: tournament.id,
        tournamentTitle: tournament.title,
        game: tournament.game,
        date: tournament.date,
        userId: user.uid,
        userEmail: user.email || "",
        createdAt: Date.now(),
      });

      await createNotification({
        recipientId: user.uid,
        type: "tournament_registration",
        message: `You registered for "${tournament.title}" on ${tournament.date}.`,
        meta: {
          tournamentId: tournament.id,
          tournamentTitle: tournament.title,
          game: tournament.game,
          date: tournament.date,
        },
      });

      setRegisteredMap((prev) => ({
        ...prev,
        [tournament.id]: true,
      }));

      setStatusMsg(`Registered successfully for "${tournament.title}"`);
    } catch (error) {
      console.error(error);
      setStatusMsg("Registration failed");
      alert(error.message);
    } finally {
      setLoadingId("");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1f1f1f",
        color: "white",
        padding: 28,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Upcoming Tournaments</h2>
        <p style={{ color: "#bdbdbd", marginTop: 0, marginBottom: 24 }}>
          Browse campus tournaments and register for upcoming competitions.
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

        {statusMsg && (
          <div style={{ marginBottom: 18, color: "#d7c8ff", fontWeight: "bold" }}>
            {statusMsg}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(280px, 1fr))",
            gap: 18,
          }}
        >
          {tournaments.map((tournament) => {
            const isRegistered = !!registeredMap[tournament.id];
            const isLoading = loadingId === tournament.id;

            return (
              <div
                key={tournament.id}
                style={{
                  background: "#f4f4f4",
                  color: "#111",
                  borderRadius: 16,
                  padding: 18,
                  boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: 10 }}>
                  {tournament.title}
                </h3>

                <p style={{ margin: "0 0 8px 0" }}>
                  <b>Game:</b> {tournament.game}
                </p>

                <p style={{ margin: "0 0 8px 0" }}>
                  <b>Date:</b> {tournament.date}
                </p>

                <p style={{ margin: "0 0 18px 0", lineHeight: 1.5 }}>
                  {tournament.description}
                </p>

                <button
                  onClick={() => handleRegister(tournament)}
                  disabled={isRegistered || isLoading}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: isRegistered ? "#444" : "#000",
                    color: "white",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: "bold",
                    cursor: isRegistered ? "default" : "pointer",
                  }}
                >
                  {isLoading
                    ? "Registering..."
                    : isRegistered
                    ? "Registered"
                    : "Register"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
