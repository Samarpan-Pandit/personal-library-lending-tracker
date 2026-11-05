
# Personal Library & Lending Tracker

## API Documentation

### 1. Project Overview

Personal Library & Lending Tracker is a backend application that helps users manage their personal book collections, borrowers, and lending records.

The backend is developed using:

- Node.js
- Express.js
- PostgreSQL
- Zod (Data Validation)

### 2. Base URL

`http://localhost:3000/api`

### 3. Book Management APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | /books | Add a new book |
| GET | /books | Get all books |
| GET | /books/:id | Get a book by ID |
| PUT | /books/:id | Update a book |
| DELETE | /books/:id | Delete a book |
| GET | /books/search | Search and filter books |

#### 3.1 Add a New Book

Method: POST

Endpoint: `/books`

Request Body:

```json
{
  "title": "The Alchemist",
  "author": "Paulo Coelho",
  "genre": "Adventure",
  "isbn": "9780061122415",
  "publication_year": 1988,
  "description": "A young shepherd travels in search of treasure.",
  "summary_tags": ["adventure", "dreams", "self-discovery"]
}
```

Successful Response: 201 Created

#### 3.2 Get All Books

Method: GET

Endpoint: `/books`

Returns all books along with their availability status.

#### 3.3 Get Book by ID

Method: GET

Endpoint: `/books/:id`

Example: `/books/2`

Returns the details of a specific book.

#### 3.4 Update a Book

Method: PUT

Endpoint: `/books/:id`

Updates the details of an existing book.

#### 3.5 Delete a Book

Method: DELETE

Endpoint: `/books/:id`

Deletes a book if it has no lending history.

#### 3.6 Search and Filter Books

Method: GET

Endpoint: `/books/search`

Search Parameters:

- `q`: Search across title, author, genre and ISBN.
- `title`: Search by title.
- `author`: Search by author.
- `genre`: Search by genre.
- `isbn`: Search by ISBN.

Example:

`/books/search?q=Alchemist`

Multiple filters can also be combined.

Example:

`/books/search?author=Paulo&genre=Adventure`

#### Book Validation

- Title is required.
- Title cannot exceed 250 characters.
- Author cannot exceed 200 characters.
- Genre cannot exceed 100 characters.
- ISBN cannot exceed 20 characters.
- Publication year must be between 1 and 9999.
- Summary tags must contain valid strings.
- Duplicate ISBN values are rejected.

### 4. Borrower Management APIs

The Borrower Management module allows users to register borrowers and retrieve their information.

| Method | Endpoint | Description |
|---|---|---|
| POST | /borrowers | Add a new borrower |
| GET | /borrowers | Get all borrowers |
| GET | /borrowers/:id | Get borrower by ID |

#### 4.1 Add a New Borrower

Method: POST

Endpoint: `/borrowers`

Request Body:

```json
{
  "name": "Rahul Sharma",
  "contact": "rahul@example.com"
}
```

Successful Response: 201 Created

#### 4.2 Get All Borrowers

Method: GET

Endpoint: `/borrowers`

Returns all registered borrowers.

#### 4.3 Get Borrower by ID

Method: GET

Endpoint: `/borrowers/:id`

Example: `/borrowers/1`

Returns the details of a specific borrower.

#### Borrower Validation

- Name is required.
- Name cannot be empty.
- Name must not exceed 150 characters.
- Contact must not exceed 254 characters.
- Invalid borrower data returns 400 Bad Request.
- Nonexistent borrower returns 404 Not Found.

### 5. Lending Management APIs

The Lending Management module handles book lending, returning, and tracking of borrowed books.

| Method | Endpoint | Description |
|---|---|---|
| POST | /loans | Lend a book |
| GET | /loans | Get all lending records |
| GET | /loans/active | Get active loans |
| GET | /loans/overdue | Get overdue loans |
| PATCH | /loans/:id/return | Return a borrowed book |

#### 5.1 Lend a Book

Method: POST

Endpoint: `/loans`

Request Body:

```json
{
  "book_id": 2,
  "borrower_id": 1,
  "due_date": "2026-11-15"
}
```

Successful Response: 201 Created

The system checks:

- Whether the book exists.
- Whether the borrower exists.
- Whether the book is already lent.
- Whether the due date is a valid calendar date.
- Whether the due date is before the loan date.

Database transactions are used to maintain data consistency.

#### 5.2 Get All Loans

Method: GET

Endpoint: `/loans`

Returns all lending records with:

- Book title.
- Borrower name.
- Loan date.
- Due date.
- Return date.
- Loan status (Active, Overdue or Returned).

#### 5.3 Get Active Loans

Method: GET

Endpoint: `/loans/active`

Returns books that have been lent but not yet returned.

#### 5.4 Get Overdue Loans

Method: GET

Endpoint: `/loans/overdue`

Returns books that:

- Have not been returned.
- Have a due date earlier than the current date.

Also calculates the number of overdue days.

#### 5.5 Return a Book

Method: PATCH

Endpoint: `/loans/:id/return`

Example:

`/loans/1/return`

Marks the loan as returned by updating its return_date.

#### Lending Validation and Error Handling

- Invalid lending data returns 400 Bad Request.
- Nonexistent book returns 404 Not Found.
- Nonexistent borrower returns 404 Not Found.
- Already-lent book returns 409 Conflict.
- Invalid due date returns 400 Bad Request.
- Invalid loan ID returns 400 Bad Request.
- Nonexistent loan returns 404 Not Found.
- Already-returned loan returns 409 Conflict.

A PostgreSQL partial unique index prevents multiple active loans for the same book.

### 6. Dashboard API

| Method | Endpoint | Description |
|---|---|---|
| GET | /dashboard | Get dashboard statistics |

#### Get Dashboard Statistics

Method: GET

Endpoint: `/dashboard`

Dashboard statistics include:

- Total books.
- Available books.
- Lent books.
- Overdue books.
- Total borrowers.
- Returned loans.

Successful Response: 200 OK

Example Response:

```json
{
  "message": "Dashboard statistics retrieved successfully",
  "statistics": {
    "total_books": "2",
    "available_books": "1",
    "lent_books": "1",
    "overdue_books": "0",
    "total_borrowers": "1",
    "returned_loans": "1"
  }
}
```

Note: PostgreSQL COUNT results are returned as strings by the current Node.js PostgreSQL driver.

### 7. Validation and Error Handling

The application uses Zod for input validation.

Important HTTP status codes:

| Status Code | Meaning |
|---|---|
| 200 | Request successful |
| 201 | Resource created |
| 400 | Invalid request data |
| 404 | Resource not found |
| 409 | Conflict or duplicate data |
| 500 | Internal server error |

The application uses parameterized SQL queries to protect against SQL injection.

### 8. Database

The application uses PostgreSQL.

Database Name: `personal_library`

Main database tables:

- books
- borrowers
- loans

Relationships:

- Each loan references one book.
- Each loan references one borrower.
- A book cannot be deleted while it has lending history.
- A book cannot have multiple active loans.
- A book can be lent again after it is returned.

### 9. AI Features

Planned AI capabilities:

- Automatic book metadata extraction.
- Structured JSON output for book information.
- Automatic genre and theme tagging.
- Semantic book search.
- Hybrid search combining semantic search and SQL filters.
- Contextual communication assistance.

These AI capabilities are documented as planned features and should only be marked complete after implementation and testing.

### 10. Running the Backend

#### Install Dependencies

```bash
npm install
```

#### Configure Environment Variables

Create a `.env` file in the project root and configure the PostgreSQL connection details.

#### Start the Backend

```bash
node backend/server.js
```

#### Health Check

`GET http://localhost:3000/api/health`

Expected Response:

```json
{
  "status": "success",
  "message": "Personal Library API is running"
}
```

---

**Project:** Personal Library & Lending Tracker

**Backend Technologies:** Node.js, Express.js, PostgreSQL and Zod.
