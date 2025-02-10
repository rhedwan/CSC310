const express = require("express");
const router = express.Router();
const paperAnalysisController = require("../controllers/paperAnalysisController");

router.get("/analyze-features", paperAnalysisController.analyzePapers);

module.exports = router;
