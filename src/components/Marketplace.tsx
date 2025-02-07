import { useState } from "react";
import type { Deck, StoreDeck } from "types/types";
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
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-4 text-lg font-medium">List a Deck for Sale</h3>
        <form onSubmit={handleListDeck} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Select Deck
            </label>
            <select
              value={selectedDeck?.deck_name ?? ""}
              onChange={(e) => {
                const deck = userDecks.find(
                  (d) => d.deck_name === e.target.value,
                );
                setSelectedDeck(deck ?? null);
              }}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              <option value="">Select a deck</option>
              {userDecks.map((deck) => (
                <option key={deck.deck_name} value={deck.deck_name}>
                  {deck.deck_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="Enter a description for your deck"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price (USD)
            </label>
            <input
              type="number"
              min="0.00"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="Enter price"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            List for Sale
          </button>
        </form>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {storeDecks.map((deck) => (
          <div
            key={deck.deck_name}
            className="flex flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-4">
              <h3 className="text-lg font-medium">{deck.deck_name}</h3>
              <p className="text-sm text-gray-500">
                by {deck.deck_author === user?.uid ? "You" : deck.deck_author}
              </p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">{deck.deck_description}</p>
            </div>

            <div className="mb-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-medium">
                  ${deck.deck_price.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Notes:</span>
                <span>{deck.note_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Purchases:</span>
                <span>{deck.purchase_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rating:</span>
                <span>
                  {deck.average_rating > 0
                    ? `${deck.average_rating.toFixed(1)} / 5.0`
                    : "No ratings"}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="mb-2 text-sm font-medium text-gray-700">
                Referenced Books:
              </h4>
              <ul className="space-y-1 text-sm text-gray-600">
                {(deck.referenced_books ?? []).map((book, index) => (
                  <li key={index}>
                    {book.name}
                    {book.detail && (
                      <span className="text-gray-500"> - {book.detail}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {(deck.preview_notes ?? []).length > 0 && (
              <div className="mb-4">
                <h4 className="mb-2 text-sm font-medium text-gray-700">
                  Preview Notes:
                </h4>
                <div className="space-y-2">
                  {(deck.preview_notes ?? []).map((note, index) => (
                    <div
                      key={index}
                      className="rounded-md border border-gray-200 p-3"
                    >
                      <p className="text-sm font-medium">{note.book_name}</p>
                      {note.book_detail && (
                        <p className="text-xs text-gray-500">
                          {note.book_detail}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-gray-600">
                        {note.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {deck.deck_author !== user?.uid && (
              <button
                onClick={() => handlePurchase(deck.deck_name)}
                className="mt-auto w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                Purchase
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
