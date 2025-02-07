import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { type Deck, type Note } from "types/types";
import { auth, db } from "./firebase";

// Create a new deck
export async function createNewDeck(deckName: string): Promise<string> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User must be logged in to create a deck");

    const newDeck: Deck = {
      deck_name: deckName,
      deck_author: user.uid,
      created_at: new Date().toISOString(),
      notes: [],
      description: "",
    };

    // Create a new deck in the user's decks sub-collection
    const deckRef = doc(collection(db, "users", user.uid, "decks"));
    await setDoc(deckRef, newDeck);

    return deckRef.id;
  } catch (error) {
    console.error("Error creating deck:", error);
    throw error;
  }
}

// Purchase a deck
export async function purchaseDeck(purchaseId: string): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User must be logged in to purchase a deck");

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      purchases: arrayUnion(purchaseId),
    });
  } catch (error) {
    console.error("Error purchasing deck:", error);
    throw error;
  }
}

// Delete a deck
export async function deleteDeck(deckId: string): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User must be logged in to delete a deck");

    const deckRef = doc(db, "users", user.uid, "decks", deckId);
    const deckSnap = await getDoc(deckRef);

    if (!deckSnap.exists()) {
      throw new Error("Deck not found");
    }

    const deckData = deckSnap.data() as Deck;
    if (deckData.deck_author !== user.uid) {
      throw new Error("User does not have permission to delete this deck");
    }

    await deleteDoc(deckRef);
  } catch (error) {
    console.error("Error deleting deck:", error);
    throw error;
  }
}

// Add a card to a deck
export async function addCardToDeck(
  deckId: string,
  bookId: string,
  bookName: string,
  bookDetail: string | undefined,
  noteContent: string,
): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User must be logged in to add a card");

    const deckRef = doc(db, "users", user.uid, "decks", deckId);
    const deckSnap = await getDoc(deckRef);

    if (!deckSnap.exists()) {
      throw new Error("Deck not found");
    }

    const deckData = deckSnap.data() as Deck;
    if (deckData.deck_author !== user.uid) {
      throw new Error("User does not have permission to modify this deck");
    }

    const newNote: Note = {
      book_id: bookId,
      book_name: bookName,
      book_detail: bookDetail,
      note_content: {
        content_latest: noteContent,
        content_history: [],
      },
      review_count: 0,
    };

    await updateDoc(deckRef, {
      notes: [...deckData.notes, newNote],
    });
  } catch (error) {
    console.error("Error adding card to deck:", error);
    throw error;
  }
}

// Edit a card in a deck
export async function editCard(
  deckId: string,
  noteIndex: number,
  updatedContent: string,
): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User must be logged in to edit a card");

    const deckRef = doc(db, "users", user.uid, "decks", deckId);
    const deckSnap = await getDoc(deckRef);

    if (!deckSnap.exists()) {
      throw new Error("Deck not found");
    }

    const deckData = deckSnap.data() as Deck;
    if (deckData.deck_author !== user.uid) {
      throw new Error("User does not have permission to modify this deck");
    }

    if (noteIndex < 0 || noteIndex >= deckData.notes.length) {
      throw new Error("Invalid note index");
    }

    const currentNote = deckData.notes[noteIndex];
    if (!currentNote) {
      throw new Error("Note not found");
    }

    const contentHistory = currentNote.note_content.content_history ?? [];
    contentHistory.push(currentNote.note_content.content_latest);

    const updatedNotes = [...deckData.notes];
    updatedNotes[noteIndex] = {
      book_id: currentNote.book_id,
      book_name: currentNote.book_name,
      book_detail: currentNote.book_detail,
      note_content: {
        content_latest: updatedContent,
        content_history: contentHistory,
      },
      review_count: currentNote.review_count,
      last_reviewed: currentNote.last_reviewed,
      next_review_date: currentNote.next_review_date,
    };

    await updateDoc(deckRef, {
      notes: updatedNotes,
    });
  } catch (error) {
    console.error("Error editing card:", error);
    throw error;
  }
}

// Update deck name
export async function updateDeckName(
  deckId: string,
  newName: string,
): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User must be logged in to update deck name");

    const deckRef = doc(db, "users", user.uid, "decks", deckId);
    const deckSnap = await getDoc(deckRef);

    if (!deckSnap.exists()) {
      throw new Error("Deck not found");
    }

    const deckData = deckSnap.data() as Deck;
    if (deckData.deck_author !== user.uid) {
      throw new Error("User does not have permission to modify this deck");
    }

    await updateDoc(deckRef, {
      deck_name: newName,
    });
  } catch (error) {
    console.error("Error updating deck name:", error);
    throw error;
  }
}

// Delete user account and all associated data
export async function deleteUserAccount(): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User must be logged in to delete account");

    // Get user data
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("User data not found");
    }

    // Delete user document (this will also delete the decks sub-collection)
    await deleteDoc(userRef);

    // Delete Firebase Auth user
    await user.delete();
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
}

// Review a card
export async function reviewCard(
  deckId: string,
  noteIndex: number,
  quality: number, // 0-5 rating of how well the card was remembered
): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User must be logged in to review a card");

    const deckRef = doc(db, "users", user.uid, "decks", deckId);
    const deckSnap = await getDoc(deckRef);

    if (!deckSnap.exists()) {
      throw new Error("Deck not found");
    }

    const deckData = deckSnap.data() as Deck;
    if (deckData.deck_author !== user.uid) {
      throw new Error("User does not have permission to modify this deck");
    }

    if (noteIndex < 0 || noteIndex >= deckData.notes.length) {
      throw new Error("Invalid note index");
    }

    const currentNote = deckData.notes[noteIndex];
    if (!currentNote) {
      throw new Error("Note not found");
    }

    const updatedNotes = [...deckData.notes];
    updatedNotes[noteIndex] = {
      ...currentNote,
      review_count: (currentNote.review_count ?? 0) + 1,
      last_reviewed: new Date().toISOString(),
      next_review_date: (() => {
        const daysUntilReview = Math.max(
          1,
          Math.min(14, Math.floor((6 - quality) * 2.8)),
        );
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + daysUntilReview);
        return nextReview.toISOString();
      })(),
    };

    await updateDoc(deckRef, {
      notes: updatedNotes,
    });
  } catch (error) {
    console.error("Error reviewing card:", error);
    throw error;
  }
}
