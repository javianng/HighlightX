import { useState } from "react";
import type { Deck, Note } from "types/types";
import { addCardToDeck, editCard } from "~/lib/deckOperations";
import DeckReview from "./DeckReview";

interface DeckEditorProps {
  deck: Deck & { id: string };
  onDeckChange: () => void;
  onClose: () => void;
}

export default function DeckEditor({
  deck,
  onDeckChange,
  onClose,
}: DeckEditorProps) {
  const [mode, setMode] = useState<"edit" | "review">("edit");
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [newNote, setNewNote] = useState({
    bookId: "",
    bookName: "",
    bookDetail: "",
    content: "",
  });

  if (mode === "review") {
    return (
      <DeckReview
        deck={deck}
        onDeckChange={onDeckChange}
        onClose={() => setMode("edit")}
      />
    );
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.bookName.trim() || !newNote.content.trim()) return;

    try {
      await addCardToDeck(
        deck.id,
        newNote.bookId ?? "manual",
        newNote.bookName,
        newNote.bookDetail,
        newNote.content,
      );
      setNewNote({ bookId: "", bookName: "", bookDetail: "", content: "" });
      onDeckChange();
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const handleEditNote = async (noteIndex: number) => {
    if (!editingContent.trim()) return;

    try {
      await editCard(deck.id, noteIndex, editingContent);
      setEditingNoteIndex(null);
      setEditingContent("");
      onDeckChange();
    } catch (error) {
      console.error("Error editing note:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{deck.deck_name}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setMode("review")}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Start Review
          </button>
          <button
            onClick={onClose}
            className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Exit Editor
          </button>
        </div>
      </div>

      <form
        onSubmit={handleAddNote}
        className="space-y-4 rounded-lg border border-gray-200 bg-white p-4"
      >
        <h3 className="text-lg font-medium">Add New Note</h3>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            value={newNote.bookName}
            onChange={(e) =>
              setNewNote({ ...newNote, bookName: e.target.value })
            }
            placeholder="Book Name"
            className="rounded-md border border-gray-300 px-3 py-2"
            required
          />
          <input
            type="text"
            value={newNote.bookDetail}
            onChange={(e) =>
              setNewNote({ ...newNote, bookDetail: e.target.value })
            }
            placeholder="Book Detail (optional)"
            className="rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
        <textarea
          value={newNote.content}
          onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
          placeholder="Note Content"
          className="h-24 w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Add Note
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Book
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Detail
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Content
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Reviews
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {deck.notes.map((note: Note, index: number) => (
              <tr key={index}>
                <td className="whitespace-nowrap px-6 py-4">
                  {note.book_name}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {note.book_detail ?? "-"}
                </td>
                <td className="px-6 py-4">
                  {editingNoteIndex === index ? (
                    <div className="flex gap-2">
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                      />
                      <button
                        onClick={() => handleEditNote(index)}
                        className="rounded-md bg-green-600 px-3 py-1 text-white hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingNoteIndex(null)}
                        className="rounded-md bg-gray-600 px-3 py-1 text-white hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="max-w-xl whitespace-pre-wrap">
                      {note.note_content.content_latest}
                    </div>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {note.review_count}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <button
                    onClick={() => {
                      setEditingNoteIndex(index);
                      setEditingContent(note.note_content.content_latest);
                    }}
                    className="rounded-md bg-yellow-600 px-3 py-1 text-sm text-white hover:bg-yellow-700"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
