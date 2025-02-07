import { useState } from "react";
import type { Deck, Note } from "types/types";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { reviewCard } from "~/lib/deckOperations";

interface ReviewAllProps {
  decks: (Deck & { id: string })[];
  onDeckChange: () => void;
  onClose: () => void;
}

interface ReviewNote extends Note {
  deckId: string;
  deckName: string;
  noteIndex: number;
}

export default function ReviewAll({
  decks,
  onDeckChange,
  onClose,
}: ReviewAllProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewComplete, setReviewComplete] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);

  // Flatten all notes from all decks into a single array with deck info
  const allNotes = decks.reduce<ReviewNote[]>((acc, deck) => {
    const deckNotes = deck.notes.map((note, index) => ({
      ...note,
      deckId: deck.id,
      deckName: deck.deck_name,
      noteIndex: index,
    }));
    return [...acc, ...deckNotes];
  }, []);

  // Sort notes by next review date or last reviewed date
  const sortedNotes = allNotes.sort((a, b) => {
    const dateA = a.next_review_date ?? a.last_reviewed ?? "0";
    const dateB = b.next_review_date ?? b.last_reviewed ?? "0";
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  });

  const currentNote = sortedNotes[currentNoteIndex];
  const totalNotes = sortedNotes.length;

  if (sortedNotes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Review All Notes</h2>
          <Button onClick={onClose} variant="outline">
            Exit Review
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>No Notes to Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Add some notes to your decks to start reviewing.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (reviewComplete) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Review Complete</h2>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setCurrentNoteIndex(0);
                setShowAnswer(false);
                setReviewComplete(false);
              }}
              variant="default"
            >
              Review Again
            </Button>
            <Button onClick={onClose} variant="outline">
              Exit Review
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Review Complete!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You&apos;ve reviewed all {totalNotes} notes.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleRateCard = async (quality: number) => {
    if (!currentNote) return;

    try {
      await reviewCard(currentNote.deckId, currentNote.noteIndex, quality);
      onDeckChange();

      if (currentNoteIndex < totalNotes - 1) {
        setCurrentNoteIndex(currentNoteIndex + 1);
        setShowAnswer(false);
      } else {
        setReviewComplete(true);
      }
    } catch (error) {
      console.error("Error reviewing card:", error);
    }
  };

  if (!currentNote) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Review All Notes</h2>
          <Button onClick={onClose} variant="outline">
            Exit Review
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>No Notes to Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Add some notes to your decks to start reviewing.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Review All Notes</h2>
          <p className="text-sm text-muted-foreground">
            Note {currentNoteIndex + 1} of {totalNotes}
          </p>
        </div>
        <Button onClick={onClose} variant="outline">
          Exit Review
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              From Deck: {currentNote.deckName}
            </h3>
            <div className="mt-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Book
              </h4>
              <p className="mt-1">{currentNote.book_name}</p>
              {currentNote.book_detail && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {currentNote.book_detail}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                Note
              </h4>
              <div className="mt-2 rounded-md bg-muted p-4">
                <p className="whitespace-pre-wrap">
                  {currentNote.note_content.content_latest}
                </p>
              </div>
            </div>

            {!showAnswer ? (
              <Button
                onClick={handleShowAnswer}
                className="w-full"
                variant="default"
              >
                Show Answer
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="rounded-md bg-muted p-4">
                  <h4 className="text-sm font-medium">
                    How well did you remember this?
                  </h4>
                  <div className="mt-4 flex justify-between gap-2">
                    <Button
                      onClick={() => handleRateCard(1)}
                      variant="destructive"
                      className="flex-1"
                    >
                      Failed
                    </Button>
                    <Button
                      onClick={() => handleRateCard(3)}
                      variant="secondary"
                      className="flex-1"
                    >
                      Hard
                    </Button>
                    <Button
                      onClick={() => handleRateCard(4)}
                      variant="default"
                      className="flex-1"
                    >
                      Good
                    </Button>
                    <Button
                      onClick={() => handleRateCard(5)}
                      variant="default"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      Easy
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
