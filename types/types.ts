import { z } from "zod";

// Note Schema
export const NoteSchema = z.object({
  book_id: z.string(), // Reference to Books Collection
  book_name: z.string(),
  book_detail: z.string().optional(),
  note_content: z.object({
    content_latest: z.string(),
    content_history: z.array(z.string()).optional(),
  }),
  last_reviewed: z.string().optional(), // ISO string date
  next_review_date: z.string().optional(), // ISO string date
  review_count: z.number().default(0),
});

export type Note = z.infer<typeof NoteSchema>;

// Deck Schema
export const DeckSchema = z.object({
  id: z.string().optional(), // Document ID from Firestore
  deck_name: z.string(),
  deck_author: z.string(), // Reference to User ID
  created_at: z.string(), // Firestore Timestamp as string
  description: z.string().default(""), // Description of the deck
  notes: z.array(NoteSchema),
});

export type Deck = z.infer<typeof DeckSchema>;

// User Schema
export const UserSchema = z.object({
  user_info: z.object({
    name: z.string(),
    email: z.string().email(),
    profile_picture: z.string().url().optional(),
  }),
  purchases: z.array(z.string()), // Stores purchase_ids as references
});

export type User = z.infer<typeof UserSchema>;

// Book Schema
export const BookSchema = z.object({
  book_title: z.string(),
  book_author: z.string(),
  book_description: z.string().optional(),
  published_date: z.string(), // Can be converted to Date object when needed
  genre: z.array(z.string()),
  cover_image: z.string().url(),
});

export type Book = z.infer<typeof BookSchema>;

// Store Deck Schema (Marketplace)
export const StoreDeckSchema = z.object({
  deck_name: z.string(),
  deck_author: z.string(), // Reference to User ID
  deck_description: z.string(),
  deck_price: z.number(),
  purchase_count: z.number().default(0),
  average_rating: z.number().default(0),
  note_count: z.number(),
  preview_notes: z
    .array(
      z.object({
        book_name: z.string(),
        book_detail: z.string().optional(),
        content: z.string(),
      }),
    )
    .max(3),
  referenced_books: z.array(
    z.object({
      name: z.string(),
      detail: z.string().optional(),
    }),
  ),
});

export type StoreDeck = z.infer<typeof StoreDeckSchema>;

// Rating Schema
export const RatingSchema = z.object({
  user_id: z.string(),
  rating: z.number().min(1).max(5),
  review: z.string().optional(),
  created_at: z.string(), // Firestore Timestamp as string
});

export type Rating = z.infer<typeof RatingSchema>;
