import { useState } from "react";
import type { Deck } from "types/types";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { reviewCard } from "~/lib/deckOperations";

interface DeckReviewProps {
  deck: Deck & { id: string };
  onDeckChange: () => void;
  onClose: () => void;
}

export default function DeckReview({
  deck,
  onDeckChange,
  onClose,
}: DeckReviewProps) {
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewComplete, setReviewComplete] = useState(false);

  const currentNote = deck.notes[currentNoteIndex];
  const totalNotes = deck.notes.length;

  // Early return if no current note
  if (!currentNote && !reviewComplete && totalNotes > 0) {
    setCurrentNoteIndex(0);
    return null;
  }

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleRateCard = async (quality: number) => {
    try {
      await reviewCard(deck.id, currentNoteIndex, quality);
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

  const handleRestartReview = () => {
    setCurrentNoteIndex(0);
    setShowAnswer(false);
    setReviewComplete(false);
  };

  if (deck.notes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{deck.deck_name} - Review</h2>
          <Button onClick={onClose} variant="outline">
            Exit Review
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>No Cards to Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Add some cards to this deck to start reviewing.
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
          <h2 className="text-2xl font-bold">
            {deck.deck_name} - Review Complete
          </h2>
          <div className="flex gap-2">
            <Button onClick={handleRestartReview} variant="default">
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
              You&apos;ve reviewed all {totalNotes} cards in this deck.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentNote) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{deck.deck_name} - Review</h2>
          <p className="text-sm text-muted-foreground">
            Card {currentNoteIndex + 1} of {totalNotes}
          </p>
        </div>
        <Button onClick={onClose} variant="outline">
          Exit Review
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Book</h3>
            <p className="mt-1">{currentNote.book_name}</p>
            {currentNote.book_detail && (
              <p className="mt-1 text-sm text-muted-foreground">
                {currentNote.book_detail}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Note
              </h3>
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
