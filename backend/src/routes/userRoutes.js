const express = require("express");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
} = require("../controllers/userController");

const router = express.Router();

router.use(protect);
router.get("/", authorizeRoles("ADMIN", "MANAGER", "SUPER_ADMIN"), getAllUsers);
router
    .route("/:id")
    .get(authorizeRoles("ADMIN", "MANAGER", "SUPER_ADMIN"), getUserById)
    .put(authorizeRoles("ADMIN", "MANAGER", "SUPER_ADMIN"), updateUser)
    .delete(authorizeRoles("ADMIN", "SUPER_ADMIN"), deleteUser);

module.exports = router;
