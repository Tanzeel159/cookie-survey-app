import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

interface InteractionRecord {
  userId: string;
  timestamp: string;
  website: string;
  selection: string;
  timeSpent: number;
}

/**
 * Saves cookie consent interaction data to Firestore
 */
export async function saveToFirestore(data: InteractionRecord): Promise<void> {
  try {
    // Reference to the "interactions" collection
    const interactionsRef = collection(db, "interactions");
    
    // Add a new document with the data
    await addDoc(interactionsRef, {
      userId: data.userId,
      timestamp: data.timestamp,
      website: data.website,
      selection: data.selection,
      timeSpent: data.timeSpent,
      createdAt: serverTimestamp() // Add server timestamp
    });
    
    console.log("Data saved to Firestore successfully");
  } catch (error) {
    console.error("Error saving to Firestore:", error);
    throw error;
  }
}