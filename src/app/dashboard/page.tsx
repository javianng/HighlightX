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
import ReviewAll from "~/components/ReviewAll";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
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
  const [showReviewAll, setShowReviewAll] = useState(false);

  const handleTabChange = (value: string) => {
    if (value === "decks" || value === "marketplace") {
      setActiveTab(value);
    }
  };

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
      <div className="min-h-screen">
        <header className="border-b">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold">HighlightX</h1>
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList>
                  <TabsTrigger value="decks">My Decks</TabsTrigger>
                  <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar>
                    <AvatarImage src={user?.photoURL ?? undefined} />
                    <AvatarFallback>?</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.displayName ?? user?.email?.split("@")[0]}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="container mx-auto py-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold">Dashboard</h1>
              {activeTab === "decks" && (
                <Button
                  onClick={() => setShowReviewAll(true)}
                  variant="outline"
                >
                  Review All Notes
                </Button>
              )}
            </div>
          </div>

          {showReviewAll ? (
            <ReviewAll
              decks={decks}
              onClose={() => setShowReviewAll(false)}
              onDeckChange={fetchDecks}
            />
          ) : (
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <div className="mb-6 flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="decks">My Decks</TabsTrigger>
                  <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="decks">
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
                      <Card>
                        <CardHeader>
                          <CardTitle>Select a Deck</CardTitle>
                          <CardDescription>
                            Choose a deck from the list to view and edit its
                            contents
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="marketplace">
                <Marketplace
                  storeDecks={storeDecks}
                  userDecks={decks}
                  onPurchase={handlePurchaseComplete}
                  onListDeck={handleListDeck}
                />
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
