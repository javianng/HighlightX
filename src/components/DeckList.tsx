import { useState } from "react";
import type { Deck } from "types/types";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
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
        <Input
          type="text"
          value={newDeckName}
          onChange={(e) => setNewDeckName(e.target.value)}
          placeholder="New deck name"
        />
        <Button type="submit">Create Deck</Button>
      </form>

      <div className="space-y-2">
        {decks.map((deck) => (
          <Card key={deck.id}>
            <CardContent className="flex items-center justify-between p-4">
              {editingDeckId === deck.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <Input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                  />
                  <Button
                    onClick={() => handleUpdateDeckName(deck.id)}
                    variant="default"
                    size="sm"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => setEditingDeckId(null)}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    onClick={() => onDeckSelect(deck)}
                    variant="ghost"
                    className="flex-1 justify-start text-lg font-medium"
                  >
                    {deck.deck_name}
                  </Button>
                  {deck.deck_author === user?.uid && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setEditingDeckId(deck.id);
                          setEditingName(deck.deck_name);
                        }}
                        variant="secondary"
                        size="sm"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteDeck(deck.id)}
                        variant="destructive"
                        size="sm"
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
