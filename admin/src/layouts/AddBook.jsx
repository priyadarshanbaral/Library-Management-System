import React, { useState } from "react";
import "../CSS/AddBook.css";
import axios from "axios";
import { toast } from "react-toastify";

// Open Library API - free, no API key required (Google Books API often hits quota limits)
const OPEN_LIBRARY_SEARCH_API = "https://openlibrary.org/search.json";
const OPEN_LIBRARY_WORK_API = "https://openlibrary.org";
const OPEN_LIBRARY_COVER_API = "https://covers.openlibrary.org/b/id";

function AddBook() {
  const [book, setBook] = useState({
    photo: null,
    name: "",
    author: "",
    quantity: "",
    description: "",
  });

  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---- Open Library API search state ----
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [coverUrl, setCoverUrl] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "photo") {
      setBook({ ...book, photo: files[0] });
    } else {
      setBook({ ...book, [name]: value });
    }
  };

  // ============================================================
  // Handle book page image selection (multiple files)
  // ============================================================
  const handlePagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setPages(files);
  };

  // Remove a selected page from the preview list
  const removePage = (index) => {
    setPages((prev) => prev.filter((_, i) => i !== index));
  };

  // ============================================================
  // Search books using the Open Library API
  // ============================================================
  const searchBook = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.warn("Please enter a book title or author to search.");
      return;
    }

    setSearching(true);
    setSearchResults([]);
    setSelectedBookId(null);

    try {
      const res = await axios.get(OPEN_LIBRARY_SEARCH_API, {
        params: { q: searchQuery.trim(), limit: 12, fields: "key,title,author_name,first_publish_year,cover_i" },
      });

      const docs = res.data?.docs || [];

      if (docs.length === 0) {
        toast.info("No books found. Try a different search.");
      }

      const mapped = docs.map((doc) => ({
        id: doc.key,
        title: doc.title || "Untitled",
        authors: doc.author_name || [],
        description:
          doc.first_publish_year
            ? `First published in ${doc.first_publish_year}.`
            : "No description available.",
        thumbnail: doc.cover_i
          ? `${OPEN_LIBRARY_COVER_API}/${doc.cover_i}-M.jpg`
          : "",
        workKey: doc.key,
      }));

      setSearchResults(mapped);
    } catch (err) {
      console.log(err);
      toast.error("Failed to search books. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  // ============================================================
  // Fetch a richer description from the Open Library work endpoint
  // ============================================================
  const fetchWorkDescription = async (workKey) => {
    try {
      const res = await axios.get(`${OPEN_LIBRARY_WORK_API}${workKey}.json`);
      const desc = res.data?.description;

      if (typeof desc === "string") return desc;
      if (desc?.value) return desc.value;

      return "";
    } catch (err) {
      console.log("Work description fetch failed:", err.message);
      return "";
    }
  };

  // ============================================================
  // Convert a remote cover image URL into a File (for upload)
  // ============================================================
  const fetchImageAsFile = async (url, filename = "book-cover.jpg") => {
    try {
      const res = await axios.get(url, { responseType: "blob" });
      const blob = res.data;
      return new File([blob], filename, { type: blob.type || "image/jpeg" });
    } catch (err) {
      console.log("Cover fetch failed:", err.message);
      return null;
    }
  };

  // ============================================================
  // Auto-fill the form with a selected search result
  // ============================================================
  const selectBook = async (result) => {
    setSelectedBookId(result.id);
    setCoverUrl(result.thumbnail);

    // Try to fetch a richer description from the work endpoint
    const workDescription = await fetchWorkDescription(result.workKey);

    const updatedBook = {
      ...book,
      name: result.title,
      author: result.authors?.join(", ") || "Unknown",
      description:
        workDescription || result.description || "No description available.",
      quantity: "",
    };

    setBook(updatedBook);

    if (result.thumbnail) {
      const file = await fetchImageAsFile(result.thumbnail);
      if (file) {
        setBook((prev) => ({ ...prev, photo: file }));
      } else {
        toast.warn(
          "Could not auto-fetch the cover. Please upload an image manually."
        );
      }
    }

    toast.success("Book details filled! Review and click Add Book.");
  };

  // ============================================================
  // Submit book to the backend API
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("photo", book.photo);
      formData.append("name", book.name);
      formData.append("author", book.author);
      formData.append("quantity", book.quantity);
      formData.append("description", book.description);

      // Append all book pages
      pages.forEach((page) => {
        formData.append("pages", page);
      });

      const res = await axios.post(
        "/api/allbooks",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(res.data.message);

      setBook({
        photo: null,
        name: "",
        author: "",
        quantity: "",
        description: "",
      });
      setSearchQuery("");
      setSearchResults([]);
      setSelectedBookId(null);
      setCoverUrl("");
      setPages([]);

      e.target.reset();
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Failed to add book");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-book-page">
      <div className="add-book-card">
        <h2>Add New Book</h2>

        {/* ============================================
            Open Library API Search Section
        ============================================ */}
        <div className="api-search-section">
          <h3>📖 Search Book via API</h3>
          <p className="api-search-hint">
            Search the Open Library database and auto-fill the form below.
          </p>

          <form onSubmit={searchBook} className="api-search-form">
            <input
              type="text"
              placeholder="Search by book title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" disabled={searching} className="search-btn">
              {searching ? "Searching..." : "Search"}
            </button>
          </form>

          {searchResults.length > 0 && (
            <div className="api-results">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className={`api-result-card ${selectedBookId === result.id ? "selected" : ""
                    }`}
                  onClick={() => selectBook(result)}
                >
                  <div className="api-result-thumb">
                    {result.thumbnail ? (
                      <img src={result.thumbnail} alt={result.title} />
                    ) : (
                      <div className="no-cover">📚</div>
                    )}
                  </div>
                  <div className="api-result-info">
                    <h4>{result.title}</h4>
                    <p className="api-result-author">
                      {result.authors?.join(", ") || "Unknown author"}
                    </p>
                    <p className="api-result-desc">
                      {result.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ============================================
            Divider
        ============================================ */}
        <div className="divider">
          <span>OR fill manually</span>
        </div>

        {/* ============================================
            Add Book Form
        ============================================ */}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Book Cover</label>
            {coverUrl && (
              <div className="selected-cover">
                <img src={coverUrl} alt="Selected cover preview" />
              </div>
            )}
            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Book Pages (inside pages)</label>
            <input
              type="file"
              name="pages"
              accept="image/*"
              multiple
              onChange={handlePagesChange}
            />
            <small className="pages-hint">
              Select all the pages of the book in order. These will be viewable
              when someone clicks "View Book".
            </small>

            {pages.length > 0 && (
              <div className="pages-preview">
                {pages.map((page, index) => (
                  <div className="page-thumb" key={index}>
                    <img src={URL.createObjectURL(page)} alt={`Page ${index + 1}`} />
                    <button
                      type="button"
                      className="remove-page-btn"
                      onClick={() => removePage(index)}
                    >
                      ✕
                    </button>
                    <span className="page-num">P.{index + 1}</span>
                  </div>
                ))}
              </div>
            )}
          </div>


          <div className="input-group">
            <label>Book Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter Book Name"
              value={book.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Author Name</label>
            <input
              type="text"
              name="author"
              placeholder="Enter Author Name"
              value={book.author}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Quantity</label>
            <input
              type="number"
              name="quantity"
              placeholder="Enter Quantity"
              value={book.quantity}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="input-group">
            <label>Description</label>
            <textarea
              name="description"
              rows="5"
              placeholder="Write Book Description..."
              value={book.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Adding Book..." : "Add Book"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddBook;

