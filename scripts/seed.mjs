// Fills the database with sample authors, books, reviewers and reviews.
//
//   npm run seed           only seeds an empty database
//   npm run seed -- --reset  deletes ALL existing data first, then seeds

import mongoose from "mongoose";
import dbConnect from "../lib/mongodb.js";
import Author from "../models/Author.js";
import Book from "../models/Book.js";
import Reviewer from "../models/Reviewer.js";
import Review from "../models/Review.js";

const reset = process.argv.includes("--reset");
const models = [Review, Book, Reviewer, Author];

const authors = [
  { name: "Frank Herbert", nationality: "American", birthYear: 1920, bio: "Author of the Dune saga." },
  { name: "Ursula K. Le Guin", nationality: "American", birthYear: 1929, bio: "Wrote the Earthsea books and The Left Hand of Darkness." },
  { name: "Haruki Murakami", nationality: "Japanese", birthYear: 1949, bio: "Novelist known for surreal, melancholic fiction." },
  { name: "Jane Austen", nationality: "British", birthYear: 1775, bio: "Novelist of manners and Regency-era society." },
  { name: "Chimamanda Ngozi Adichie", nationality: "Nigerian", birthYear: 1977, bio: "Novelist and essayist." },
];

// author is matched by name to the authors above
const books = [
  { title: "Dune", author: "Frank Herbert", genre: "Sci-Fi", publishedYear: 1965 },
  { title: "Dune Messiah", author: "Frank Herbert", genre: "Sci-Fi", publishedYear: 1969 },
  { title: "A Wizard of Earthsea", author: "Ursula K. Le Guin", genre: "Fantasy", publishedYear: 1968 },
  { title: "The Left Hand of Darkness", author: "Ursula K. Le Guin", genre: "Sci-Fi", publishedYear: 1969 },
  { title: "Norwegian Wood", author: "Haruki Murakami", genre: "Literary Fiction", publishedYear: 1987 },
  { title: "Kafka on the Shore", author: "Haruki Murakami", genre: "Literary Fiction", publishedYear: 2002 },
  { title: "Pride and Prejudice", author: "Jane Austen", genre: "Classic", publishedYear: 1813 },
  { title: "Emma", author: "Jane Austen", genre: "Classic", publishedYear: 1815 },
  { title: "Half of a Yellow Sun", author: "Chimamanda Ngozi Adichie", genre: "Historical Fiction", publishedYear: 2006 },
  { title: "Americanah", author: "Chimamanda Ngozi Adichie", genre: "Literary Fiction", publishedYear: 2013 },
];

const reviewers = [
  { username: "paing", email: "paing@bookbox.test", bio: "Sci-fi first, everything else second." },
  { username: "heinhtet", email: "heinhtet@bookbox.test", bio: "Slow reader, long reviews." },
  { username: "thankyaw", email: "thankyaw@bookbox.test", bio: "Classics and contemporary fiction." },
];

// [username, book title, rating, notes]
const reviews = [
  ["paing", "Dune", 5, "Incredible world-building."],
  ["paing", "Dune Messiah", 4, "Darker and smaller in scope, but it earns it."],
  ["paing", "The Left Hand of Darkness", 5, "The ice crossing is unforgettable."],
  ["heinhtet", "Dune", 4, "Dense first 100 pages, then impossible to put down."],
  ["heinhtet", "Norwegian Wood", 3, "Beautiful prose, very bleak."],
  ["heinhtet", "Half of a Yellow Sun", 5, "Devastating and essential."],
  ["thankyaw", "Pride and Prejudice", 5, "Still the sharpest dialogue around."],
  ["thankyaw", "Kafka on the Shore", 4, "Strange in the best way."],
  ["thankyaw", "Americanah", 4, "Funny and honest about identity."],
  ["thankyaw", "A Wizard of Earthsea", 3, "A quiet, thoughtful fantasy."],
];

async function main() {
  await dbConnect();
  console.log(`Connected to database "${mongoose.connection.name}"`);

  const counts = await Promise.all(models.map((m) => m.countDocuments()));
  const existing = counts.reduce((a, b) => a + b, 0);

  if (existing > 0 && !reset) {
    console.error(
      `Database already has ${existing} document(s); nothing was changed.\n` +
        `Run "npm run seed -- --reset" to delete ALL authors, books, reviewers and reviews and reseed.`
    );
    process.exitCode = 1;
    return;
  }

  if (reset) {
    for (const model of models) await model.deleteMany({});
    console.log(`Deleted ${existing} existing document(s)`);
  }

  // Unique indexes (username, email) must exist before inserting.
  await Promise.all(models.map((m) => m.syncIndexes()));

  const authorDocs = await Author.insertMany(authors);
  const authorIdByName = new Map(authorDocs.map((a) => [a.name, a._id]));

  const bookDocs = await Book.insertMany(
    books.map(({ author, ...book }) => ({ ...book, authorId: authorIdByName.get(author) }))
  );
  const bookIdByTitle = new Map(bookDocs.map((b) => [b.title, b._id]));

  const reviewerDocs = await Reviewer.insertMany(reviewers);
  const userIdByName = new Map(reviewerDocs.map((r) => [r.username, r._id]));

  await Review.insertMany(
    reviews.map(([username, title, rating, notes]) => ({
      userId: userIdByName.get(username),
      bookId: bookIdByTitle.get(title),
      rating,
      notes,
    }))
  );

  console.log(
    `Seeded ${authors.length} authors, ${books.length} books, ` +
      `${reviewers.length} reviewers, ${reviews.length} reviews`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
