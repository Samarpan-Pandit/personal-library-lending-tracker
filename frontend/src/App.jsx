import { useEffect, useState } from "react";
import { getDashboardStats } from "./services/dashboardService";
import Borrowers from "./pages/Borrowers";
import { Routes, Route, NavLink } from "react-router-dom";
import Books from "./pages/Books";
import Loans from "./pages/Loans";
import Overdue from "./pages/Overdue";
import { getBooks } from "./services/bookService";
import { getLoans } from "./services/loanService";
import { getBorrowers } from "./services/borrowerService";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Repeat,
  Clock,
  Search,
  Bell,
  Plus,
  ArrowUpRight,
  Library,
  Menu
} from "lucide-react";

import "./App.css";

function App() {
  const [statsData, setStatsData] = useState({
  total_books: 0,
  available_books: 0,
  lent_books: 0,
  overdue_books: 0
});
const [recentBooks, setRecentBooks] = useState([]);
const [recentLoans, setRecentLoans] = useState([]);
const [allBooks, setAllBooks] = useState([]);
const [allBorrowers, setAllBorrowers] = useState([]);
const [allLoans, setAllLoans] = useState([]);

const [globalSearch, setGlobalSearch] = useState("");
const [showSearchResults, setShowSearchResults] = useState(false);
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
const searchTerm = globalSearch.trim().toLowerCase();

const searchResults = searchTerm
  ? [
      ...allBooks
        .filter((book) =>
          [
            book.title,
            book.author,
            book.genre,
            book.isbn
          ]
            .filter(Boolean)
            .some((value) =>
              String(value).toLowerCase().includes(searchTerm)
            )
        )
        .map((book) => ({
  id: `book-${book.book_id}`,
  title: book.title,
  subtitle: `${book.author || "Unknown Author"} • Book`,
  path: `/books?id=${book.book_id}`
})),

      ...allBorrowers
        .filter((borrower) =>
          [borrower.name, borrower.contact]
            .filter(Boolean)
            .some((value) =>
              String(value).toLowerCase().includes(searchTerm)
            )
        )
        .map((borrower) => ({
  id: `borrower-${borrower.borrower_id}`,
  title: borrower.name,
  subtitle: `${borrower.contact || "No contact"} • Borrower`,
  path: `/borrowers?id=${borrower.borrower_id}`
})),

      ...allLoans
        .filter((loan) =>
          [loan.book_title, loan.borrower_name, loan.loan_status]
            .filter(Boolean)
            .some((value) =>
              String(value).toLowerCase().includes(searchTerm)
            )
        )
        .map((loan) => ({
  id: `loan-${loan.loan_id}`,
  title: loan.book_title,
  subtitle: `${loan.borrower_name} • ${loan.loan_status}`,
  path: `/loans?id=${loan.loan_id}`
}))
    ].slice(0, 10)
  : [];

const loadDashboardStats = async () => {
  try {
    const data = await getDashboardStats();
    setStatsData(data.statistics);
  } catch (error) {
    console.error("Unable to load dashboard statistics:", error);
  }
};

const loadRecentData = async () => {
  try {
    const [booksResponse, loansResponse, borrowersResponse] =
      await Promise.all([
        getBooks(),
        getLoans(),
        getBorrowers()
      ]);

    const books = booksResponse.books || [];
    const loans = loansResponse.loans || [];
    const borrowers = borrowersResponse.borrowers || [];

    setAllBooks(books);
    setAllLoans(loans);
    setAllBorrowers(borrowers);

    setRecentBooks(books.slice(0, 5));
    setRecentLoans(loans.slice(0, 5));

  } catch (error) {
    console.error("Unable to load dashboard data:", error);
  }
};

useEffect(() => {
  loadDashboardStats();
  loadRecentData();
}, []);
  
const stats = [
  {
    title: "Total Books",
    value: statsData.total_books ?? 0,
    description: "Books in your library",
    icon: BookOpen,
    color: "blue"
  },
  {
    title: "Available Books",
    value: statsData.available_books ?? 0,
    description: "Ready to lend",
    icon: Library,
    color: "green"
  },
  {
    title: "Lent Books",
    value: statsData.lent_books ?? 0,
    description: "Currently borrowed",
    icon: Repeat,
    color: "purple"
  },
  {
    title: "Overdue Books",
    value: statsData.overdue_books ?? 0,
    description: "Past their due date",
    icon: Clock,
    color: "orange"
  }
];


  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Books", icon: BookOpen },
    { name: "Borrowers", icon: Users },
    { name: "Loans", icon: Repeat },
    { name: "Overdue", icon: Clock }
  ];

  return (
    <div className="app-container">
     {isMobileMenuOpen && (
  <button
    type="button"
    className="mobile-menu-backdrop"
    aria-label="Close navigation menu"
    onClick={() => setIsMobileMenuOpen(false)}
  />
)} 
      <aside
  className={`sidebar ${isMobileMenuOpen ? "mobile-open" : ""}`}
>
        <div className="brand">
          <div className="brand-icon">
            <BookOpen size={25} />
          </div>
          <span>MyLibrary</span>
        </div>

        <div className="sidebar-label">MAIN MENU</div>

        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const Icon = item.icon;

            const path =
              item.name === "Dashboard"
                ? "/"
                : `/${item.name.toLowerCase()}`;

            return (
              <NavLink
                to={path}
                end={item.name === "Dashboard"}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
                key={item.name}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-label">YOUR LIBRARY</div>

          <div className="library-note">
            <BookOpen size={20} />
            <div>
              <strong>Personal Collection</strong>
              <span>Manage your books</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button
  className="mobile-menu"
  type="button"
  aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
  aria-expanded={isMobileMenuOpen}
  onClick={() => setIsMobileMenuOpen((previous) => !previous)}
>
  <Menu size={22} />
</button>

          <div className="breadcrumb">
            <span>Pages</span>
            <span>/</span>
            <strong>Personal Library</strong>
          </div>

          <div className="topbar-actions">
            
<div className="search-box">
  <Search size={18} />

  <input
    type="text"
    placeholder="Search books, borrowers, loans..."
    value={globalSearch}
    onChange={(e) => {
      setGlobalSearch(e.target.value);
      setShowSearchResults(true);
    }}
    onFocus={() => setShowSearchResults(true)}
    onKeyDown={(e) => {
      if (e.key === "Escape") {
        setShowSearchResults(false);
      }
    }}
  />
</div>

{showSearchResults && globalSearch.trim() && (
  <div className="global-search-results">
    {searchResults.length > 0 ? (
      <>
        <div className="search-results-heading">
          Search Results ({searchResults.length})
        </div>

        {searchResults.map((result) => (
          <NavLink
            key={result.id}
            to={result.path}
            className="global-search-result"
            onClick={() => {
  setGlobalSearch("");
  setShowSearchResults(false);
  setIsMobileMenuOpen(false);
}}
          >
            <div className="global-search-result-icon">
              <Search size={16} />
            </div>

            <div className="global-search-result-info">
              <strong>{result.title}</strong>
              <span>{result.subtitle}</span>
            </div>
          </NavLink>
        ))}
      </>
    ) : (
      <div className="global-search-empty">
        No matching results found.
      </div>
    )}
  </div>
)}


            <button className="icon-button" aria-label="Notifications">
              <Bell size={20} />
            </button>

            <div className="profile">
              <div className="avatar">S</div>
              <div className="profile-info">
                <strong>Administrator</strong>
                <span>Library Manager</span>
              </div>
            </div>
          </div>
        </header>

        <Routes>
          <Route
            path="/"
            element={
              <section className="dashboard-content">
                <div className="welcome-section">
                  <div>
                    <p className="eyebrow">LIBRARY OVERVIEW</p>
                    <h1>Welcome to Your Library!</h1>
                    <p className="welcome-description">
                      Manage your books, borrowers and lending activities
                      from one place.
                    </p>
                  </div>

                  <NavLink to="/books" className="primary-button">
                    <Plus size={19} />
                    Add New Book
                  </NavLink>
                </div>

                <div className="stats-grid">
                  {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                      <div className="stat-card" key={stat.title}>
                        <div className="stat-top">
                          <div className={`stat-icon ${stat.color}`}>
                            <Icon size={22} />
                          </div>

                          <ArrowUpRight
                            size={18}
                            className="stat-arrow"
                          />
                        </div>

                        <h2>{stat.value}</h2>
                        <h3>{stat.title}</h3>
                        <p>{stat.description}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="dashboard-grid">
                  <section className="panel recent-books">
                    <div className="panel-heading">
                      <div>
                        <h2>Recent Books</h2>
                        <p>Your recently added books</p>
                      </div>

                      <NavLink to="/books" className="text-button">
                        View All
                        <ArrowUpRight size={16} />
                      </NavLink>
                    </div>

                    <div className="recent-books-list">
  {recentBooks.length === 0 ? (
    <div className="empty-state">
      <div className="empty-icon">
        <BookOpen size={30} />
      </div>
      <h3>No books added yet</h3>
      <p>Add your first book to see it here.</p>
    </div>
  ) : (
    recentBooks.map((book) => (
      <div className="recent-book-item" key={book.book_id}>
        <div className="recent-book-icon">
          <BookOpen size={20} />
        </div>

        <div className="recent-book-info">
          <strong>{book.title}</strong>
          <span>{book.author || "Unknown Author"}</span>
        </div>

        <span className={`recent-book-status ${
          book.available ? "available" : "lent"
        }`}>
          {book.available ? "Available" : "Lent"}
        </span>
      </div>
    ))
  )}
</div>
                  </section>

                  <section className="panel activity-panel">
                    <div className="panel-heading">
                      <div>
                        <h2>Recent Activity</h2>
                        <p>Latest lending activities</p>
                      </div>
                    </div>

                    <div className="recent-activity-list">
  {recentLoans.length === 0 ? (
    <div className="empty-state">
      <div className="empty-icon">
        <Repeat size={28} />
      </div>
      <h3>No recent activity</h3>
      <p>Your lending and return activities will appear here.</p>
    </div>
  ) : (
    recentLoans.map((loan) => (
      <div className="recent-activity-item" key={loan.loan_id}>
        <div className="recent-activity-icon">
          <Repeat size={19} />
        </div>

        <div className="recent-activity-info">
          <strong>{loan.book_title}</strong>
          <span>Borrowed by {loan.borrower_name}</span>
        </div>

        <span className={`recent-activity-status ${
          loan.loan_status?.toLowerCase()
        }`}>
          {loan.loan_status}
        </span>
      </div>
    ))
  )}
</div>
                  </section>
                </div>
              </section>
            }
          />

          <Route
            path="/books"
            element={
              <section className="dashboard-content">
                <Books />
              </section>
            }
          />
          <Route
  path="/loans"
  element={
    <section className="dashboard-content">
      <Loans />
    </section>
  }
/>
          <Route
            path="/borrowers"
            element={
              <section className="dashboard-content">
                <Borrowers />
              </section>
            }
        />
          <Route
  path="/overdue"
  element={
    <section className="dashboard-content">
      <Overdue />
    </section>
  }
/>
          <Route
            path="*"
            element={
              <section className="dashboard-content">
                <h1>Page not found</h1>
                <p className="welcome-description">
                  The requested page does not exist.
                </p>
                <NavLink to="/" className="primary-button">
                  Back to Dashboard
                </NavLink>
              </section>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
