import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const onLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div style={{ padding: 30, maxWidth: 420 }}>
      <h2>Login</h2>

      <label>Email</label>
      <input
        style={{ width: "100%", marginBottom: 10 }}
        type="email"
        value={email}
        placeholder="user_name@fanshaweonline.ca"
        onChange={(e) => setEmail(e.target.value)}
      />

      <label>Password</label>
      <input
        style={{ width: "100%", marginBottom: 15 }}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={onLogin}>Login</button>

      <div style={{ marginTop: 12 }}>
        <button onClick={() => navigate("/register")}>
          Don&apos;t have an account? Register
        </button>
      </div>
    </div>
  );
}