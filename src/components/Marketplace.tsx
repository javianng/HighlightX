import { useState } from "react";
import type { Deck, StoreDeck } from "types/types";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { useAuth } from "~/lib/AuthContext";
import { purchaseDeck } from "~/lib/deckOperations";

interface MarketplaceProps {
  storeDecks: StoreDeck[];
  userDecks: Deck[];
  onPurchase: () => void;
  onListDeck: (deck: Deck, price: number, description: string) => void;
}

export default function Marketplace({
  storeDecks,
  userDecks,
  onPurchase,
  onListDeck,
}: MarketplaceProps) {
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const { user } = useAuth();

  const handlePurchase = async (deckId: string) => {
    try {
      await purchaseDeck(deckId);
      onPurchase();
    } catch (error) {
      console.error("Error purchasing deck:", error);
    }
  };

  const handleListDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeck || !price.trim() || !description.trim()) return;

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice < 0) return;

    onListDeck(selectedDeck, numericPrice, description);
    setSelectedDeck(null);
    setPrice("");
    setDescription("");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>List a Deck for Sale</CardTitle>
          <CardDescription>
            Select a deck from your collection to list in the marketplace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleListDeck} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deck">Select Deck</Label>
              <select
                id="deck"
                value={selectedDeck?.deck_name ?? ""}
                onChange={(e) => {
                  const deck = userDecks.find(
                    (d) => d.deck_name === e.target.value,
                  );
                  setSelectedDeck(deck ?? null);
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">Select a deck</option>
                {userDecks.map((deck) => (
                  <option key={deck.deck_name} value={deck.deck_name}>
                    {deck.deck_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a description for your deck"
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                min="0.00"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price"
              />
            </div>
            <Button type="submit">List for Sale</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {storeDecks.map((deck) => (
          <Card key={deck.deck_name}>
            <CardHeader>
              <CardTitle>{deck.deck_name}</CardTitle>
              <CardDescription>
                by {deck.deck_author === user?.uid ? "You" : deck.deck_author}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {deck.deck_description}
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-medium">
                    ${deck.deck_price.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Notes:</span>
                  <span>{deck.note_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Purchases:</span>
                  <span>{deck.purchase_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rating:</span>
                  <span>
                    {deck.average_rating > 0
                      ? `${deck.average_rating.toFixed(1)} / 5.0`
                      : "No ratings"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Referenced Books:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {(deck.referenced_books ?? []).map((book, index) => (
                    <li key={index}>
                      {book.name}
                      {book.detail && (
                        <span className="text-muted-foreground">
                          {" "}
                          - {book.detail}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {(deck.preview_notes ?? []).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Preview Notes:</h4>
                  <div className="space-y-2">
                    {deck.preview_notes.map((note, index) => (
                      <Card key={index}>
                        <CardContent className="p-3">
                          <p className="text-sm font-medium">
                            {note.book_name}
                          </p>
                          {note.book_detail && (
                            <p className="text-xs text-muted-foreground">
                              {note.book_detail}
                            </p>
                          )}
                          <p className="mt-1 text-sm text-muted-foreground">
                            {note.content}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>

            {deck.deck_author !== user?.uid && (
              <CardFooter>
                <Button
                  onClick={() => handlePurchase(deck.deck_name)}
                  className="w-full"
                  variant="default"
                >
                  Purchase
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
