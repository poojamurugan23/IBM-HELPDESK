const Article = require("../models/Article");

// Get all articles (public only for customers, all for staff)
exports.getArticles = async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = {};

        // Filter by visibility if not staff
        if (
            !req.user ||
            (req.user.role !== "ADMIN" &&
                req.user.role !== "AGENT" &&
                req.user.role !== "MANAGER")
        ) {
            query.isPublic = true;
        }

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$text = { $search: search };
        }

        const articles = await Article.find(query)
            .populate("author", "name")
            .sort({ views: -1, createdAt: -1 });

        res.json({ success: true, count: articles.length, articles });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single article
exports.getArticleById = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id).populate(
            "author",
            "name",
        );

        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        // Increment views
        article.views += 1;
        await article.save();

        res.json({ success: true, article });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create article (Admin/Agent/Manager only)
exports.createArticle = async (req, res) => {
    try {
        const { title, content, category, tags, isPublic } = req.body;

        const article = await Article.create({
            title,
            content,
            category,
            tags,
            isPublic,
            author: req.user._id,
        });

        res.status(201).json({
            success: true,
            message: "Article created successfully",
            article,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update article
exports.updateArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        // Only author or admin can update? Use middleware for role check mostly
        Object.assign(article, req.body);
        await article.save();

        res.json({ success: true, message: "Article updated", article });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete article
exports.deleteArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        await article.deleteOne();

        res.json({ success: true, message: "Article deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
