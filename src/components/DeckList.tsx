import { useState } from "react";
import type { Deck } from "types/types";
import { useAuth } from "~/lib/AuthContext";
import {
  createNewDeck,
  deleteDeck,
  updateDeckName,
} from "~/lib/deckOperations";

type DeckWithId = Deck & { id: string };

interface DeckListProps {
  decks: DeckWithId[];
  onDeckSelect: (deck: DeckWithId) => void;
  onDecksChange: () => void;
}

export default function DeckList({
  decks,
  onDeckSelect,
  onDecksChange,
}: DeckListProps) {
  const [newDeckName, setNewDeckName] = useState("");
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const { user } = useAuth();

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;

    try {
      await createNewDeck(newDeckName);
      setNewDeckName("");
      onDecksChange();
    } catch (error) {
      console.error("Error creating deck:", error);
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    if (!confirm("Are you sure you want to delete this deck?")) return;

    try {
      await deleteDeck(deckId);
      onDecksChange();
    } catch (error) {
      console.error("Error deleting deck:", error);
    }
  };

  const handleUpdateDeckName = async (deckId: string) => {
    if (!editingName.trim()) return;

    try {
      await updateDeckName(deckId, editingName);
      setEditingDeckId(null);
      setEditingName("");
      onDecksChange();
    } catch (error) {
      console.error("Error updating deck name:", error);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreateDeck} className="flex gap-2">
        <input
          type="text"
          value={newDeckName}
          onChange={(e) => setNewDeckName(e.target.value)}
          placeholder="New deck name"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2"
        />
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Create Deck
        </button>
      </form>

      <div className="space-y-2">
        {decks.map((deck) => (
          <div
            key={deck.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          >
            {editingDeckId === deck.id ? (
              <div className="flex flex-1 items-center gap-2">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-1"
                />
                <button
                  onClick={() => handleUpdateDeckName(deck.id)}
                  className="rounded-md bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingDeckId(null)}
                  className="rounded-md bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onDeckSelect(deck)}
                  className="flex-1 text-left text-lg font-medium hover:text-blue-600"
                >
                  {deck.deck_name}
                </button>
                {deck.deck_author === user?.uid && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingDeckId(deck.id);
                        setEditingName(deck.deck_name);
                      }}
                      className="rounded-md bg-yellow-600 px-3 py-1 text-sm text-white hover:bg-yellow-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteDeck(deck.id)}
                      className="rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
