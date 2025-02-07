import { useState } from "react";
import type { Deck } from "types/types";
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
          <h2 className="text-2xl font-bold text-gray-900">
            {deck.deck_name} - Review
          </h2>
          <button
            onClick={onClose}
            className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Exit Review
          </button>
        </div>
        <div className="rounded-lg border-4 border-dashed border-gray-200 p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900">
            No Cards to Review
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Add some cards to this deck to start reviewing.
          </p>
        </div>
      </div>
    );
  }

  if (reviewComplete) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {deck.deck_name} - Review Complete
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleRestartReview}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Review Again
            </button>
            <button
              onClick={onClose}
              className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Exit Review
            </button>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900">
            Review Complete!
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You&apos;ve reviewed all {totalNotes} cards in this deck.
          </p>
        </div>
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
          <h2 className="text-2xl font-bold text-gray-900">
            {deck.deck_name} - Review
          </h2>
          <p className="text-sm text-gray-500">
            Card {currentNoteIndex + 1} of {totalNotes}
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Exit Review
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Book</h3>
            <p className="mt-1">{currentNote.book_name}</p>
            {currentNote.book_detail && (
              <p className="mt-1 text-sm text-gray-500">
                {currentNote.book_detail}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Note</h3>
              <div className="mt-2 rounded-md bg-gray-50 p-4">
                <p className="whitespace-pre-wrap">
                  {currentNote.note_content.content_latest}
                </p>
              </div>
            </div>

            {!showAnswer ? (
              <button
                onClick={handleShowAnswer}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Show Answer
              </button>
            ) : (
              <div className="space-y-4">
                <div className="rounded-md bg-green-50 p-4">
                  <h4 className="text-sm font-medium text-green-800">
                    How well did you remember this?
                  </h4>
                  <div className="mt-4 flex justify-between gap-2">
                    <button
                      onClick={() => handleRateCard(1)}
                      className="flex-1 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                    >
                      Failed
                    </button>
                    <button
                      onClick={() => handleRateCard(3)}
                      className="flex-1 rounded-md bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700"
                    >
                      Hard
                    </button>
                    <button
                      onClick={() => handleRateCard(4)}
                      className="flex-1 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                    >
                      Good
                    </button>
                    <button
                      onClick={() => handleRateCard(5)}
                      className="flex-1 rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
                    >
                      Easy
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
