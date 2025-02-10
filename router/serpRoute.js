const express = require("express");
const router = express.Router();
const serpController = require("../controllers/serpController");

router.get("/search", serpController.searchSerp);
router.get("/history", serpController.getSearchHistory);

module.exports = router;