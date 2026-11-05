

-- =========================================
-- PERSONAL LIBRARY & LENDING TRACKER
-- Database Schema
-- =========================================

-- 1. BOOKS TABLE
CREATE TABLE books (
    book_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(250) NOT NULL,
    author VARCHAR(200),
    genre VARCHAR(100),
    isbn VARCHAR(20) UNIQUE,
    publication_year SMALLINT,
    description TEXT,
    summary_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (
        publication_year IS NULL
        OR publication_year BETWEEN 1 AND 9999
    ),
    CHECK (jsonb_typeof(summary_tags) = 'array')
);

-- 2. BORROWERS TABLE
CREATE TABLE borrowers (
    borrower_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    contact VARCHAR(254),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. LOANS TABLE
CREATE TABLE loans (
    loan_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    book_id BIGINT NOT NULL REFERENCES books(book_id)
        ON DELETE RESTRICT,
    borrower_id BIGINT NOT NULL REFERENCES borrowers(borrower_id)
        ON DELETE RESTRICT,
    loan_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    return_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (due_date >= loan_date),
    CHECK (return_date IS NULL OR return_date >= loan_date)
);

-- 4. INDEXES

CREATE UNIQUE INDEX unique_book_isbn
ON books (isbn)
WHERE isbn IS NOT NULL AND isbn <> '';

CREATE UNIQUE INDEX one_active_loan_per_book
ON loans (book_id)
WHERE return_date IS NULL;

CREATE INDEX loans_due_date_idx
ON loans (due_date)
WHERE return_date IS NULL;

CREATE INDEX loans_borrower_idx
ON loans (borrower_id);

CREATE INDEX books_title_idx
ON books (title);

CREATE INDEX books_author_idx
ON books (author);
