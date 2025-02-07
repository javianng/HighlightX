import type { ChangeEvent } from "react";
import { useState } from "react";
import type { Deck, Note } from "types/types";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Textarea } from "~/components/ui/textarea";
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

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setNewNote({ ...newNote, content: e.target.value });
  };

  const handleEditContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setEditingContent(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{deck.deck_name}</h2>
        <div className="flex gap-2">
          <Button onClick={() => setMode("review")} variant="default">
            Start Review
          </Button>
          <Button onClick={onClose} variant="outline">
            Exit Editor
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Note</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddNote} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bookName">Book Name</Label>
                <Input
                  id="bookName"
                  value={newNote.bookName}
                  onChange={(e) =>
                    setNewNote({ ...newNote, bookName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bookDetail">Book Detail (optional)</Label>
                <Input
                  id="bookDetail"
                  value={newNote.bookDetail}
                  onChange={(e) =>
                    setNewNote({ ...newNote, bookDetail: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Note Content</Label>
              <Textarea
                id="content"
                value={newNote.content}
                onChange={handleContentChange}
                className="h-24"
                required
              />
            </div>
            <Button type="submit">Add Note</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book</TableHead>
                <TableHead>Detail</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Reviews</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deck.notes.map((note: Note, index: number) => (
                <TableRow key={index}>
                  <TableCell>{note.book_name}</TableCell>
                  <TableCell>{note.book_detail ?? "-"}</TableCell>
                  <TableCell>
                    {editingNoteIndex === index ? (
                      <div className="flex gap-2">
                        <Textarea
                          value={editingContent}
                          onChange={handleEditContentChange}
                          className="flex-1"
                        />
                        <div className="flex flex-col gap-2">
                          <Button
                            onClick={() => handleEditNote(index)}
                            variant="default"
                            size="sm"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => setEditingNoteIndex(null)}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-xl whitespace-pre-wrap">
                        {note.note_content.content_latest}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{note.review_count}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => {
                        setEditingNoteIndex(index);
                        setEditingContent(note.note_content.content_latest);
                      }}
                      variant="secondary"
                      size="sm"
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
