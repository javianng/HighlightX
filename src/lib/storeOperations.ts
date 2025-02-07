import {
  collection,
  deleteDoc,
  doc,
  increment,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import type { Deck, StoreDeck } from "types/types";
import { auth, db } from "./firebase";

// List a deck for sale in the marketplace
export async function listDeckForSale(
  deck: Deck,
  price: number,
  description: string,
): Promise<string> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User must be logged in to list a deck");

    // Get unique books from notes with proper typing
    const uniqueBooks = Array.from(
      new Set(
        deck.notes.map((note) =>
          JSON.stringify({
            name: note.book_name,
            detail: note.book_detail,
          }),
        ),
      ),
    ).map((str) => {
      const parsed = JSON.parse(str) as {
        name: string;
        detail?: string;
      };
      return {
        name: parsed.name,
        detail: parsed.detail,
      };
    });

    // Get up to 3 preview notes
    const previewNotes = deck.notes.slice(0, 3).map((note) => ({
      book_name: note.book_name,
      book_detail: note.book_detail,
      content: note.note_content.content_latest,
    }));

    const storeDeck: StoreDeck = {
      deck_name: deck.deck_name,
      deck_author: user.uid,
      deck_description: description,
      deck_price: price,
      purchase_count: 0,
      average_rating: 0,
      note_count: deck.notes.length,
      preview_notes: previewNotes,
      referenced_books: uniqueBooks,
    };

    // Create a new store deck document
    const storeDeckRef = doc(collection(db, "store_decks"));
    await setDoc(storeDeckRef, storeDeck);

    return storeDeckRef.id;
  } catch (error) {
    console.error("Error listing deck for sale:", error);
    throw error;
  }
}

// Remove a deck from the marketplace
export async function removeDeckFromStore(storeDeckId: string): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User must be logged in to remove a deck");

    await deleteDoc(doc(db, "store_decks", storeDeckId));
  } catch (error) {
    console.error("Error removing deck from store:", error);
    throw error;
  }
}

// Rate a purchased deck
export async function rateDeck(
  storeDeckId: string,
  rating: number,
  review?: string,
): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User must be logged in to rate a deck");

    const storeDeckRef = doc(db, "store_decks", storeDeckId);
    const ratingRef = doc(collection(db, "ratings"));

    // Add the rating document
    await setDoc(ratingRef, {
      user_id: user.uid,
      rating,
      review,
      created_at: new Date().toISOString(),
    });

    // Update the store deck's rating
    await updateDoc(storeDeckRef, {
      average_rating: increment(rating),
      rating_count: increment(1),
    });
  } catch (error) {
    console.error("Error rating deck:", error);
    throw error;
  }
}

// Update deck price
export async function updateDeckPrice(
  storeDeckId: string,
  newPrice: number,
): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User must be logged in to update deck price");

    const storeDeckRef = doc(db, "store_decks", storeDeckId);
    await updateDoc(storeDeckRef, {
      deck_price: newPrice,
    });
  } catch (error) {
    console.error("Error updating deck price:", error);
    throw error;
  }
}
