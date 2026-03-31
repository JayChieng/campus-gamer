import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("recipientId", "==", user.uid),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (id) => {
    const notifyRef = doc(db, "notifications", id);
    await updateDoc(notifyRef, { isRead: true });
  };

  return (
    <div 
      style={{ 
        minHeight: "100vh", 
        background: "#1f1f1f", 
        color: "white", 
        padding: 28 
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header Section */}
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Your Notifications</h2>
        <p style={{ color: "#bdbdbd", marginTop: 0, marginBottom: 24 }}>
          Stay updated with your team invites and tournament alerts.
        </p>

        {/* Back Button - Matches Tournaments page style */}
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

        {/* Notifications List */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
          {notifications.length === 0 ? (
            <p style={{ color: "#bdbdbd" }}>No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                style={{
                  background: n.isRead ? "#e0e0e0" : "#ffffff", // Light card style
                  color: "#111",
                  borderRadius: 16,
                  padding: "20px",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
                  cursor: "pointer",
                  borderLeft: n.isRead ? "none" : "6px solid #6200ea", // Purple highlight for unread
                  transition: "transform 0.2s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <p style={{ 
                    margin: 0, 
                    fontSize: "1.05rem", 
                    fontWeight: n.isRead ? "normal" : "bold",
                    lineHeight: 1.4 
                  }}>
                    {n.message}
                  </p>
                  {!n.isRead && (
                    <span style={{ 
                      background: "#6200ea", 
                      color: "white", 
                      fontSize: "0.7rem", 
                      padding: "4px 8px", 
                      borderRadius: 20,
                      marginLeft: 10 
                    }}>
                      NEW
                    </span>
                  )}
                </div>
                
                <small style={{ color: "#666", display: "block", marginTop: 10, fontWeight: "500" }}>
                  {n.timestamp?.toDate().toLocaleString()}
                </small>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}