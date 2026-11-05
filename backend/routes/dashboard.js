
const express = require("express");
const db = require("../db");

const router = express.Router();

// ======================================
// GET DASHBOARD STATISTICS
// GET /api/dashboard
// ======================================

router.get("/", async (req, res, next) => {
    try {
        const result = await db.query(`
            SELECT
                (SELECT COUNT(*) FROM books)
                    AS total_books,

                (SELECT COUNT(*)
                 FROM books b
                 WHERE NOT EXISTS (
                     SELECT 1
                     FROM loans l
                     WHERE l.book_id = b.book_id
                     AND l.return_date IS NULL
                 ))
                    AS available_books,

                (SELECT COUNT(*)
                 FROM loans
                 WHERE return_date IS NULL)
                    AS lent_books,

                (SELECT COUNT(*)
                 FROM loans
                 WHERE return_date IS NULL
                 AND due_date < CURRENT_DATE)
                    AS overdue_books,

                (SELECT COUNT(*) FROM borrowers)
                    AS total_borrowers,

                (SELECT COUNT(*)
                 FROM loans
                 WHERE return_date IS NOT NULL)
                    AS returned_loans
        `);

        const stats = result.rows[0];

        res.json({
            message: "Dashboard statistics retrieved successfully",
            statistics: stats
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
