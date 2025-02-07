"use client";

import {
  collection,
  getDocs,
  query,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Deck, StoreDeck } from "types/types";
import DeckEditor from "~/components/DeckEditor";
import DeckList from "~/components/DeckList";
import Marketplace from "~/components/Marketplace";
import ProtectedRoute from "~/components/ProtectedRoute";
import { logout } from "~/lib/auth";
import { useAuth } from "~/lib/AuthContext";
import { db } from "~/lib/firebase";
import { listDeckForSale } from "~/lib/storeOperations";

type DeckWithId = Deck & { id: string };

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"decks" | "marketplace">("decks");
  const [decks, setDecks] = useState<DeckWithId[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<DeckWithId | null>(null);
  const [storeDecks, setStoreDecks] = useState<StoreDeck[]>([]);

  const fetchDecks = async () => {
    if (!user) return;

    try {
      // Get decks from user's decks sub-collection
      const decksQuery = query(collection(db, "users", user.uid, "decks"));
      const querySnapshot = await getDocs(decksQuery);
      const fetchedDecks = querySnapshot.docs.map(
        (doc: QueryDocumentSnapshot<DocumentData>) => ({
          ...(doc.data() as Deck),
          id: doc.id,
        }),
      );
      setDecks(fetchedDecks);
    } catch (error) {
      console.error("Error fetching decks:", error);
    }
  };

  const fetchStoreDecks = async () => {
    try {
      const storeQuery = query(collection(db, "store_decks"));
      const querySnapshot = await getDocs(storeQuery);
      const fetchedStoreDecks = querySnapshot.docs.map(
        (doc: QueryDocumentSnapshot<DocumentData>) => ({
          ...(doc.data() as StoreDeck),
          id: doc.id,
        }),
      );
      setStoreDecks(fetchedStoreDecks);
    } catch (error) {
      console.error("Error fetching store decks:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchDecks(), fetchStoreDecks()]);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    void loadData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleListDeck = async (
    deck: Deck,
    price: number,
    description: string,
  ) => {
    try {
      await listDeckForSale(deck, price, description);
      await fetchStoreDecks();
    } catch (error) {
      console.error("Error listing deck for sale:", error);
    }
  };

  const handlePurchaseComplete = async () => {
    try {
      await Promise.all([fetchDecks(), fetchStoreDecks()]);
    } catch (error) {
      console.error("Error refreshing data after purchase:", error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex items-center space-x-8">
                <h1 className="text-xl font-semibold">Dashboard</h1>
                <div className="hidden sm:flex sm:space-x-4">
                  <button
                    onClick={() => setActiveTab("decks")}
                    className={`px-3 py-2 text-sm font-medium ${
                      activeTab === "decks"
                        ? "text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    My Decks
                  </button>
                  <button
                    onClick={() => setActiveTab("marketplace")}
                    className={`px-3 py-2 text-sm font-medium ${
                      activeTab === "marketplace"
                        ? "text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Marketplace
                  </button>
                </div>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => router.push("/profile")}
                  className="mr-4 text-sm text-gray-700 hover:text-gray-900"
                >
                  Edit Profile
                </button>
                <span className="mr-4">{user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {activeTab === "decks" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                <div className="lg:col-span-1">
                  <DeckList
                    decks={decks}
                    onDeckSelect={setSelectedDeck}
                    onDecksChange={fetchDecks}
                  />
                </div>
                <div className="lg:col-span-3">
                  {selectedDeck ? (
                    <DeckEditor
                      deck={selectedDeck}
                      onDeckChange={fetchDecks}
                      onClose={() => setSelectedDeck(null)}
                    />
                  ) : (
                    <div className="rounded-lg border-4 border-dashed border-gray-200 p-8 text-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        Select a Deck
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Choose a deck from the list to view and edit its
                        contents
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "marketplace" && (
            <Marketplace
              storeDecks={storeDecks}
              userDecks={decks}
              onPurchase={handlePurchaseComplete}
              onListDeck={handleListDeck}
            />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
