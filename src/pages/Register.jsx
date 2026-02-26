import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [program, setProgram] = useState("");
  const [year, setYear] = useState("");

  const navigate = useNavigate();

  const onRegister = async () => {
    // US-001: only school email
    if (!email.endsWith("@fanshaweonline.ca")) {
      alert("Only school email allowed (@fanshaweonline.ca)");
      return;
    }

    if (!displayName || !program || !year) {
      alert("Please fill Display Name, Program, and Year.");
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // US-003: save profile
      await setDoc(doc(db, "users", cred.user.uid), {
        email,
        displayName,
        program,
        year,
        createdAt: Date.now(),
      });

      alert("Registered successfully");
      navigate("/dashboard");
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div style={{ padding: 30, maxWidth: 420 }}>
      <h2>Register</h2>

      <label>School Email</label>
      <input
        style={{ width: "100%", marginBottom: 10 }}
        type="email"
        value={email}
        placeholder="user_name@fanshaweonline.ca"
        onChange={(e) => setEmail(e.target.value)}
      />

      <label>Password</label>
      <input
        style={{ width: "100%", marginBottom: 10 }}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <label>Display Name</label>
      <input
        style={{ width: "100%", marginBottom: 10 }}
        value={displayName}
        placeholder="Your gaming name"
        onChange={(e) => setDisplayName(e.target.value)}
      />

      <label>Program</label>
      <input
        style={{ width: "100%", marginBottom: 10 }}
        value={program}
        placeholder="e.g., Computer Science"
        onChange={(e) => setProgram(e.target.value)}
      />

      <label>Year</label>
      <input
        style={{ width: "100%", marginBottom: 15 }}
        value={year}
        placeholder="e.g., Sophomore"
        onChange={(e) => setYear(e.target.value)}
      />

      <button onClick={onRegister}>Register</button>

      <div style={{ marginTop: 12 }}>
        <button onClick={() => navigate("/login")}>Back to Login</button>
      </div>
    </div>
  );
}