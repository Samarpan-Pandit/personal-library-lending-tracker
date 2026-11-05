
const express = require("express");
const { z } = require("zod");
const db = require("../db");

const router = express.Router();

// ======================================
// BOOK VALIDATION SCHEMA
// ======================================

const bookSchema = z.object({
    title: z.string().trim().min(1, "Title is required").max(250),
    author: z.string().trim().max(200).nullable().optional(),
    genre: z.string().trim().max(100).nullable().optional(),
    isbn: z.string().trim().max(20).nullable().optional(),
    publication_year: z.number().int().min(1).max(9999).nullable().optional(),
    description: z.string().max(20000).nullable().optional(),
    summary_tags: z.array(z.string().trim().min(1).max(100)).max(30).optional()
}).strict();

// ======================================
// VALIDATION MIDDLEWARE
// ======================================

function validateBook(req, res, next) {
    const result = bookSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            error: "Invalid book data",
            details: result.error.issues
        });
    }

    req.validatedBook = result.data;
    next();
}

// ======================================
// 1. CREATE BOOK
// POST /api/books
// ======================================

router.post("/", validateBook, async (req, res, next) => {
    try {
        const book = req.validatedBook;

        const result = await db.query(
            `INSERT INTO books
            (title, author, genre, isbn, publication_year,
             description, summary_tags)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [
                book.title,
                book.author ?? null,
                book.genre ?? null,
                book.isbn || null,
                book.publication_year ?? null,
                book.description ?? null,
                JSON.stringify(book.summary_tags ?? [])
            ]
        );

        res.status(201).json({
            message: "Book added successfully",
            book: result.rows[0]
        });

    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                error: "A book with this ISBN already exists"
            });
        }

        next(error);
    }
});


// ======================================
// SEARCH AND FILTER BOOKS
// GET /api/books/search
// ======================================

router.get("/search", async (req, res, next) => {
    try {
        const {
            q,
            title,
            author,
            genre,
            isbn
        } = req.query;

        const conditions = [];
        const values = [];

        function addCondition(sql, value) {
            values.push(value);
            conditions.push(
                sql.replace("?", `$${values.length}`)
            );
        }

        if (q) {
            addCondition(
                `(title ILIKE ? OR author ILIKE ?
                  OR genre ILIKE ? OR isbn ILIKE ?)`,
                `%${q}%`
            );

            // The combined search uses the same value four times.
            const last = values.length;
            conditions[conditions.length - 1] =
                `(title ILIKE $${last} OR author ILIKE $${last}
                  OR genre ILIKE $${last} OR isbn ILIKE $${last})`;
        }

        if (title) {
            addCondition("title ILIKE ?", `%${title}%`);
        }

        if (author) {
            addCondition("author ILIKE ?", `%${author}%`);
        }

        if (genre) {
            addCondition("genre ILIKE ?", `%${genre}%`);
        }

        if (isbn) {
            addCondition("isbn ILIKE ?", `%${isbn}%`);
        }

        const whereClause = conditions.length
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

        const result = await db.query(
            `SELECT * FROM books
             ${whereClause}
             ORDER BY book_id DESC`,
            values
        );

        res.json({
            total: result.rowCount,
            books: result.rows
        });

    } catch (error) {
        next(error);
    }
});


// ======================================
// 2. GET ALL BOOKS
// GET /api/books
// ======================================

router.get("/", async (req, res, next) => {
    try {
        const result = await db.query(
            `SELECT b.*,
                NOT EXISTS (
                    SELECT 1
                    FROM loans l
                    WHERE l.book_id = b.book_id
                    AND l.return_date IS NULL
                ) AS available
             FROM books b
             ORDER BY b.book_id DESC`
        );

        res.json({
            total: result.rowCount,
            books: result.rows
        });

    } catch (error) {
        next(error);
    }
});

// ======================================
// 3. GET BOOK BY ID
// GET /api/books/:id
// ======================================

router.get("/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id < 1) {
            return res.status(400).json({
                error: "Invalid book ID"
            });
        }

        const result = await db.query(
            "SELECT * FROM books WHERE book_id = $1",
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                error: "Book not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        next(error);
    }
});

// ======================================
// 4. UPDATE BOOK
// PUT /api/books/:id
// ======================================

router.put("/:id", validateBook, async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id < 1) {
            return res.status(400).json({
                error: "Invalid book ID"
            });
        }

        const book = req.validatedBook;

        const result = await db.query(
            `UPDATE books SET
                title = $1,
                author = $2,
                genre = $3,
                isbn = $4,
                publication_year = $5,
                description = $6,
                summary_tags = $7,
                updated_at = CURRENT_TIMESTAMP
             WHERE book_id = $8
             RETURNING *`,
            [
                book.title,
                book.author ?? null,
                book.genre ?? null,
                book.isbn || null,
                book.publication_year ?? null,
                book.description ?? null,
                JSON.stringify(book.summary_tags ?? []),
                id
            ]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                error: "Book not found"
            });
        }

        res.json({
            message: "Book updated successfully",
            book: result.rows[0]
        });

    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                error: "A book with this ISBN already exists"
            });
        }

        next(error);
    }
});

// ======================================
// 5. DELETE BOOK
// DELETE /api/books/:id
// ======================================

router.delete("/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id < 1) {
            return res.status(400).json({
                error: "Invalid book ID"
            });
        }

        const result = await db.query(
            "DELETE FROM books WHERE book_id = $1 RETURNING book_id",
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                error: "Book not found"
            });
        }

        res.json({
            message: "Book deleted successfully"
        });

    } catch (error) {
        if (error.code === "23503") {
            return res.status(409).json({
                error: "Cannot delete a book with lending history"
            });
        }

        next(error);
    }
});

module.exports = router;
