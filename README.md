# Personal Library & Lending Tracker

A full-stack library management system designed to manage books, borrowers, and lending activities. The application provides a user-friendly interface and REST APIs to add, update, search, and delete books, manage borrowers, track book loans, record returns, and view library statistics.

## Features

### 1. Dashboard
- View total number of books.
- View available and lent books.
- View overdue books.
- Display recently added books.
- Display recent lending activities.
- View live library statistics from the database.

### 2. Book Management
- Add new books.
- View all books and their availability.
- Search books by title, author, genre, or ISBN.
- View book details.
- Update book information.
- Delete books when they have no lending history.
- Prevent duplicate ISBN entries.

### 3. Borrower Management
- Register new borrowers.
- View all borrowers.
- View individual borrower details.
- Search borrowers by name or contact information.

### 4. Loan Management
- Issue books to registered borrowers.
- View all lending records.
- View active loans.
- View overdue loans.
- Record book returns.
- Prevent a book from being lent to multiple borrowers at the same time.

### 5. Responsive User Interface
- Dashboard with summary cards.
- Navigation sidebar.
- Books, Borrowers, Loans, and Overdue pages.
- Responsive layouts for desktop, tablet, and mobile devices.
- Search, refresh, and interactive modal components.

### 6. Data Validation and Security
- Validate incoming API requests using Zod.
- Handle invalid IDs and missing records.
- Return appropriate HTTP status codes.
- Use database constraints to maintain data integrity.
- Protect database credentials using environment variables.

## Technologies Used

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite |
| Styling | CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Database Library | pg |
| Validation | Zod |
| HTTP Client | Axios |
| Routing | React Router |
| Icons | Lucide React |
| Environment Variables | dotenv |
| API Testing | Postman |
| Database Management | pgAdmin 4 |
| Version Control | Git and GitHub |

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
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── API_DOCUMENTATION.md
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
5. Execute `database/seed.sql` if sample data is required.

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Samarpan-Pandit/personal-library-lending-tracker.git
```

Move into the project directory:

```bash
cd personal-library-lending-tracker
```

### 2. Install Backend Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root using `.env.example` as a reference.

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=personal_library
DB_USER=your_postgresql_username
DB_PASSWORD=your_postgresql_password
```

Replace the username and password with your own PostgreSQL credentials.

**Important:** Never upload your actual `.env` file or database password to GitHub.

### 4. Install Frontend Dependencies

Open a new terminal and execute:

```bash
cd frontend
npm install
```

## Running the Application

Both the backend and frontend must be running.

### Start the Backend

From the project root:

```bash
node backend/server.js
```

Backend URL:

`http://localhost:3000`

### Start the Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

Frontend URL:

`http://localhost:5173`

Open the frontend URL in your browser to use the application.

## API Documentation

Detailed API endpoints, request examples, validation rules, and response formats are available in `API_DOCUMENTATION.md`.

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
- Testing duplicate ISBN restrictions.
- Testing duplicate active lending restrictions.
- Testing invalid input, invalid IDs, and missing records.
- Checking dashboard statistics.

The frontend has also been tested for:

- Navigation between all application pages.
- Adding and managing books and borrowers.
- Issuing and returning books.
- Dashboard statistics and recent activities.
- Mobile, tablet, and desktop responsiveness.

## Team Responsibilities

The project is developed collaboratively, with responsibilities divided between team members.

- **Member 1:** PostgreSQL database design, backend development, REST API development, request validation, and API testing.
- **Member 2:** Frontend development, user interface design, and assigned AI-related features.

## Future Enhancements

- AI-based book metadata extraction.
- Semantic book search using vector embeddings.
- AI-powered book recommendations.
- Contextual communication assistance.

---

**Project Name:** Personal Library & Lending Tracker

**Project Type:** Full-Stack Web Application

**Database:** PostgreSQL

**Status:** Core backend, database, and frontend implementation completed and tested.
