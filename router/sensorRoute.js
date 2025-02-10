const express = require("express");
const router = express.Router();
const sensorController = require("../controllers/sensorController");


router.route("/").get(sensorController.getSensorReadings);


module.exports = router;
