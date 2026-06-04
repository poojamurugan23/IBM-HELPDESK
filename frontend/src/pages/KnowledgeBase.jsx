import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import "./KnowledgeBase.css";

function KnowledgeBase() {
    const [articles, setArticles] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [newArticle, setNewArticle] = useState({
        title: "",
        content: "",
        category: "General",
        status: "public",
    });

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role"); // ADMIN, AGENT, CUSTOMER

    const categories = [
        "All",
        "General",
        "Technical",
        "Billing",
        "Account",
        "Software",
        "Hardware",
    ];

    useEffect(() => {
        fetchArticles();
    }, [search, category]);

    const fetchArticles = async () => {
        try {
            let url = "http://localhost:5000/api/articles?";
            if (search) url += `search=${search}&`;
            if (category && category !== "All") url += `category=${category}`;

            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setArticles(res.data.articles || []);
        } catch (err) {
            console.error("Failed to fetch articles", err);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:5000/api/articles", newArticle, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Article published!");
            setShowCreate(false);
            setNewArticle({
                title: "",
                content: "",
                category: "General",
                status: "public",
            });
            fetchArticles();
        } catch (err) {
            alert("Failed to publish");
        }
    };

    return (
        <div className="kb-container">
            <Navbar />

            <div className="kb-header">
                <motion.h1
                    className="kb-title"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    Knowledge Base 📚
                </motion.h1>
                <p className="kb-subtitle">
                    Find answers, tutorials, and support articles.
                </p>

                {/* Search Bar */}
                <div className="search-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search for answers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Admin/Agent Create Button */}
                {(role === "ADMIN" || role === "AGENT") && (
                    <button
                        className="submit-btn"
                        style={{ marginBottom: "2rem" }}
                        onClick={() => setShowCreate(!showCreate)}
                    >
                        {showCreate ? "Cancel" : "+ Write New Article"}
                    </button>
                )}
            </div>

            {/* Create Form */}
            {showCreate && (
                <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="create-article-form"
                    onSubmit={handleCreate}
                >
                    <h3>Write a New Article</h3>
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            className="form-input"
                            value={newArticle.title}
                            onChange={(e) =>
                                setNewArticle({ ...newArticle, title: e.target.value })
                            }
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Category</label>
                        <select
                            className="form-select"
                            value={newArticle.category}
                            onChange={(e) =>
                                setNewArticle({ ...newArticle, category: e.target.value })
                            }
                        >
                            {categories
                                .filter((c) => c !== "All")
                                .map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Content</label>
                        <textarea
                            className="form-textarea"
                            value={newArticle.content}
                            onChange={(e) =>
                                setNewArticle({ ...newArticle, content: e.target.value })
                            }
                            required
                        />
                    </div>
                    <button type="submit" className="submit-btn">
                        Publish Article
                    </button>
                </motion.form>
            )}

            {/* Categories Nav */}
            <div className="categories-nav">
                {categories.map((cat) => (
                    <span
                        key={cat}
                        className={`category-pill ${(category === cat || (cat === "All" && !category)) ? "active" : ""
                            }`}
                        onClick={() => setCategory(cat === "All" ? "" : cat)}
                    >
                        {cat}
                    </span>
                ))}
            </div>

            {/* Articles Grid */}
            <div className="articles-grid">
                {articles.length > 0 ? (
                    articles.map((article) => (
                        <motion.div
                            key={article._id}
                            className="article-card"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="article-category">{article.category}</div>
                            <h3 className="article-title">{article.title}</h3>
                            <p className="article-excerpt">
                                {article.content.substring(0, 100)}...
                            </p>
                            <div className="article-meta">
                                <span>By {article.author?.name || "Unknown"}</span>
                                <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <p style={{ textAlign: "center", gridColumn: "1/-1", color: "#6b7280" }}>
                        No articles found.
                    </p>
                )}
            </div>
        </div>
    );
}

export default KnowledgeBase;
