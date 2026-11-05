
const express = require("express");
const { z } = require("zod");
const db = require("../db");

const router = express.Router();

// ======================================
// BORROWER VALIDATION
// ======================================

const borrowerSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(150),
    contact: z.string().trim().max(254).nullable().optional()
}).strict();

// ======================================
// 1. ADD BORROWER
// POST /api/borrowers
// ======================================

router.post("/", async (req, res, next) => {
    try {
        const validation = borrowerSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                error: "Invalid borrower data",
                details: validation.error.issues
            });
        }

        const { name, contact } = validation.data;

        const result = await db.query(
            `INSERT INTO borrowers (name, contact)
             VALUES ($1, $2)
             RETURNING *`,
            [name, contact || null]
        );

        res.status(201).json({
            message: "Borrower added successfully",
            borrower: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

// ======================================
// 2. GET ALL BORROWERS
// GET /api/borrowers
// ======================================

router.get("/", async (req, res, next) => {
    try {
        const result = await db.query(
            `SELECT * FROM borrowers
             ORDER BY borrower_id DESC`
        );

        res.json({
            total: result.rowCount,
            borrowers: result.rows
        });

    } catch (error) {
        next(error);
    }
});

// ======================================
// 3. GET BORROWER BY ID
// GET /api/borrowers/:id
// ======================================

router.get("/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id < 1) {
            return res.status(400).json({
                error: "Invalid borrower ID"
            });
        }

        const result = await db.query(
            "SELECT * FROM borrowers WHERE borrower_id = $1",
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                error: "Borrower not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        next(error);
    }
});

module.exports = router;
