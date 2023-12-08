const express = require("express");
const { createUser, loginUserController, getaUser, getallUser, deleteaUser, updateaUser, blockUser, unblockUser, handleRefreshToken, logout, updatePassword, forgotPasswordToken } = require("../controller/userController");
const {authMiddleware, isAdmin} = require("../middlewares/authMiddleware");
const router = express.Router();
/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with the provided information.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully.
 *       400:
 *         description: Bad request or user already exists.
 */
router.post("/register", createUser);
router.post("/forgot-password-token", forgotPasswordToken);
router.put('/password', authMiddleware, updatePassword);
router.post("/login", loginUserController);
router.get("/all-users", getallUser);
router.get("/refresh", handleRefreshToken);
router.get('/logout', logout);
router.get("/:id", authMiddleware, isAdmin, getaUser);
router.delete("/:id", deleteaUser);
router.put("/edit-user", authMiddleware, updateaUser);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);

module.exports = router;