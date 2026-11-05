
const path = require("path");

require("dotenv").config({
    path: path.resolve(__dirname, "../.env")
});

const express = require("express");
const cors = require("cors");

const booksRouter = require("./routes/books");
const borrowersRouter = require("./routes/borrowers");
const loansRouter = require("./routes/loans");
const dashboardRouter = require("./routes/dashboard");
const app = express();

app.use(cors());
app.use(express.json({ limit: "100kb" }));

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "success",
        message: "Personal Library API is running"
    });
});

// Book management routes
app.use("/api/books", booksRouter);

// Borrower management routes
app.use("/api/borrowers", borrowersRouter);
// Lending management routes
app.use("/api/loans", loansRouter);
// Dashboard statistics routes
app.use("/api/dashboard", dashboardRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: "Endpoint not found"
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        error: "Internal server error"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
