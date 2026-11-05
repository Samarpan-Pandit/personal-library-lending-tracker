
const express = require("express");
const { z } = require("zod");
const db = require("../db");

const router = express.Router();

// ======================================
// LENDING VALIDATION
// ======================================

const loanSchema = z.object({
    book_id: z.coerce.number().int().positive(),
    borrower_id: z.coerce.number().int().positive(),
    due_date: z.string().regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "Due date must be YYYY-MM-DD"
    ).refine((value) => {
        const date = new Date(`${value}T00:00:00Z`);
        return !Number.isNaN(date.getTime()) &&
            date.toISOString().slice(0, 10) === value;
    }, "Invalid calendar date")
}).strict();

// ======================================
// 1. LEND A BOOK
// POST /api/loans
// ======================================

router.post("/", async (req, res, next) => {
    const validation = loanSchema.safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({
            error: "Invalid lending data",
            details: validation.error.issues
        });
    }

    const { book_id, borrower_id, due_date } = validation.data;
    const client = await db.pool.connect();

    try {
        await client.query("BEGIN");

        // Check whether book exists
        const book = await client.query(
            "SELECT book_id FROM books WHERE book_id = $1",
            [book_id]
        );

        if (book.rowCount === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                error: "Book not found"
            });
        }

        // Check whether borrower exists
        const borrower = await client.query(
            "SELECT borrower_id FROM borrowers WHERE borrower_id = $1",
            [borrower_id]
        );

        if (borrower.rowCount === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                error: "Borrower not found"
            });
        }

        // Check whether book is already lent
        const activeLoan = await client.query(
            `SELECT loan_id FROM loans
             WHERE book_id = $1
             AND return_date IS NULL`,
            [book_id]
        );

        if (activeLoan.rowCount > 0) {
            await client.query("ROLLBACK");
            return res.status(409).json({
                error: "This book is already lent"
            });
        }

        // Create loan record
        const result = await client.query(
            `INSERT INTO loans
             (book_id, borrower_id, loan_date, due_date)
             VALUES ($1, $2, CURRENT_DATE, $3)
             RETURNING *`,
            [book_id, borrower_id, due_date]
        );

        await client.query("COMMIT");

        res.status(201).json({
            message: "Book lent successfully",
            loan: result.rows[0]
        });

    } catch (error) {
        await client.query("ROLLBACK");

        if (error.code === "23505") {
            return res.status(409).json({
                error: "This book is already lent"
            });
        }

        if (error.code === "23514") {
            return res.status(400).json({
                error: "Due date cannot be before the loan date"
            });
        }

        next(error);

    } finally {
        client.release();
    }
});

// ======================================
// 2. GET ALL LOANS
// GET /api/loans
// ======================================

router.get("/", async (req, res, next) => {
    try {
        const result = await db.query(
            `SELECT
                l.loan_id,
                l.book_id,
                b.title AS book_title,
                l.borrower_id,
                br.name AS borrower_name,
                l.loan_date,
                l.due_date,
                l.return_date,
                CASE
                    WHEN l.return_date IS NOT NULL THEN 'Returned'
                    WHEN l.due_date < CURRENT_DATE THEN 'Overdue'
                    ELSE 'Active'
                END AS loan_status
             FROM loans l
             JOIN books b ON l.book_id = b.book_id
             JOIN borrowers br ON l.borrower_id = br.borrower_id
             ORDER BY l.loan_id DESC`
        );

        res.json({
            total: result.rowCount,
            loans: result.rows
        });

    } catch (error) {
        next(error);
    }
});

// ======================================
// 3. GET ACTIVE LOANS
// GET /api/loans/active
// ======================================

router.get("/active", async (req, res, next) => {
    try {
        const result = await db.query(
            `SELECT
                l.loan_id,
                b.title AS book_title,
                br.name AS borrower_name,
                l.loan_date,
                l.due_date
             FROM loans l
             JOIN books b ON l.book_id = b.book_id
             JOIN borrowers br ON l.borrower_id = br.borrower_id
             WHERE l.return_date IS NULL
             ORDER BY l.due_date ASC`
        );

        res.json({
            total: result.rowCount,
            active_loans: result.rows
        });

    } catch (error) {
        next(error);
    }
});

// ======================================
// 4. GET OVERDUE LOANS
// GET /api/loans/overdue
// ======================================

router.get("/overdue", async (req, res, next) => {
    try {
        const result = await db.query(
            `SELECT
                l.loan_id,
                b.title AS book_title,
                br.name AS borrower_name,
                l.loan_date,
                l.due_date,
                CURRENT_DATE - l.due_date AS days_overdue
             FROM loans l
             JOIN books b ON l.book_id = b.book_id
             JOIN borrowers br ON l.borrower_id = br.borrower_id
             WHERE l.return_date IS NULL
             AND l.due_date < CURRENT_DATE
             ORDER BY l.due_date ASC`
        );

        res.json({
            total: result.rowCount,
            overdue_loans: result.rows
        });

    } catch (error) {
        next(error);
    }
});

// ======================================
// 5. RETURN A BOOK
// PATCH /api/loans/:id/return
// ======================================

router.patch("/:id/return", async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id < 1) {
            return res.status(400).json({
                error: "Invalid loan ID"
            });
        }

        const result = await db.query(
            `UPDATE loans
             SET return_date = CURRENT_DATE
             WHERE loan_id = $1
             AND return_date IS NULL
             RETURNING *`,
            [id]
        );

        if (result.rowCount === 0) {
            const existing = await db.query(
                "SELECT loan_id, return_date FROM loans WHERE loan_id = $1",
                [id]
            );

            if (existing.rowCount === 0) {
                return res.status(404).json({
                    error: "Loan not found"
                });
            }

            return res.status(409).json({
                error: "This book has already been returned"
            });
        }

        res.json({
            message: "Book returned successfully",
            loan: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
