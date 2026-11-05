# Personal Library & Lending Tracker

A backend-based library management system designed to manage books, borrowers, and lending activities. It provides REST APIs to add, update, search, and delete books, manage borrowers, track book loans, and view dashboard statistics.

## Features

### Book Management
- Add new books.
- View all books and check their availability.
- Search books by title, author, genre, or ISBN.
- View book details.
- Update book information.
- Delete books when they have no lending history.
- Prevent duplicate ISBN entries.

### Borrower Management
- Register new borrowers.
- View all borrowers.
- View individual borrower details.

### Loan Management
- Lend books to registered borrowers.
- View all lending records.
- View active loans.
- View overdue loans.
- Record book returns.
- Prevent a book from being lent to multiple borrowers at the same time.

### Dashboard
- View total number of books.
- View available and lent books.
- View overdue books.
- View total borrowers.
- View returned loans.

### Data Validation
- Validate incoming API requests using Zod.
- Handle invalid IDs and missing records.
- Return appropriate HTTP status codes.
- Use database constraints to maintain data integrity.

## Technologies Used

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Database Library:** pg
- **Validation:** Zod
- **Environment Variables:** dotenv
- **API Testing:** Postman
- **Database Management:** pgAdmin 4
- **Version Control:** Git and GitHub

## Project Structure

```text
personal-library-lending-tracker/
│
├── backend/
│   ├── server.js
│   ├── db.js
│   └── routes/
│       ├── books.js
│       ├── borrowers.js
│       ├── loans.js
│       └── dashboard.js
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── API_DOCUMENTATION.md
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Database Setup

1. Install PostgreSQL and pgAdmin 4.
2. Create a database named `personal_library`.
3. Open the PostgreSQL Query Tool.
4. Execute the SQL statements from `database/schema.sql`.
5. If sample data is required, execute `database/seed.sql`.

## Installation

Clone the repository:

```bash
git clone  https://github.com/Samarpan-Pandit/personal-library-lending-tracker.git
```

Move into the project directory:

```bash
cd personal-library-lending-tracker
```

Install dependencies:

```bash
npm install
```

## Environment Configuration

Create or update the `.env` file in the project root:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=personal_library
DB_USER=your_postgresql_username
DB_PASSWORD=your_postgresql_password
```

Replace the username and password with your own PostgreSQL credentials.

**Important:** Never upload your actual `.env` file or database password to GitHub. Use `.env.example` to share the required variable names.

## Running the Backend

Start the backend server using:

```bash
node backend/server.js
```

The backend will run at:

```text
http://localhost:3000
```

## API Documentation

Detailed API endpoints, request examples, validation rules, and response formats are available in:

`API_DOCUMENTATION.md`

Main API routes:

| Module | Base Route |
|---|---|
| Books | `/api/books` |
| Borrowers | `/api/borrowers` |
| Loans | `/api/loans` |
| Dashboard | `/api/dashboard` |

## Testing

The backend APIs have been tested using Postman.

Testing includes:
- Creating, viewing, updating, deleting, and searching books.
- Registering and viewing borrowers.
- Creating and returning loans.
- Checking active and overdue loans.
- Testing duplicate ISBN and duplicate active lending restrictions.
- Testing invalid input, invalid IDs, and missing records.
- Checking dashboard statistics.

## Team Responsibilities

The project is developed collaboratively, with responsibilities divided between team members.

- **Member 1:** Backend development, PostgreSQL database design, REST API development, request validation, and API testing.
- **Member 2:** Frontend development and assigned AI-related features.

## Future Enhancements

- AI-based book metadata extraction.
- Semantic book search using vector embeddings.
- AI-powered book recommendations.
- Contextual communication assistance.

---

**Project:** Personal Library & Lending Tracker  
**Status:** Backend API and database implementation completed and tested.
