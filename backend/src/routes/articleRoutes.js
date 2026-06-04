const express = require("express");
const router = express.Router();
const {
    getArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
} = require("../controllers/articleController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Public access
router.get("/", getArticles);
router.get("/:id", getArticleById);

// Protected routes
router.post(
    "/",
    protect,
    authorizeRoles("ADMIN", "MANAGER", "AGENT"),
    createArticle,
);
router.put(
    "/:id",
    protect,
    authorizeRoles("ADMIN", "MANAGER", "AGENT"),
    updateArticle,
);
router.delete(
    "/:id",
    protect,
    authorizeRoles("ADMIN", "MANAGER", "AGENT"),
    deleteArticle,
);

module.exports = router;
