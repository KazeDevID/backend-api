
const express = require("express");
const router = express.Router();

// Import the createProduct function if it's defined in a separate module.
const { createProduct, getaProduct, getAllProduct, updateProduct, deleteProduct } = require("../controller/productConstroller");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, isAdmin, createProduct);
router.get("/:id", getaProduct);
router.put("/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);
router.get("/", getAllProduct);

module.exports = router;
