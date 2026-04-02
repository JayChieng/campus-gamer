import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export const createNotification = async ({
  recipientId,
  message,
  type = "general",
  meta = {},
}) => {
  if (!recipientId || !message) {
    return;
  }

  await addDoc(collection(db, "notifications"), {
    recipientId,
    message,
    type,
    meta,
    isRead: false,
    timestamp: serverTimestamp(),
  });
};
