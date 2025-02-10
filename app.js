const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");
const globalErrorHandler = require("./controllers/errorController");
const dotenv = require("dotenv");
const paperAnalysisRoute = require("./routes/paperAnalysisRoute");

dotenv.config({ path: "./config.env" });

app.use(morgan("dev"));

app.use(express.json());
app.use(cors());
app.use(compression());
app.use(morgan("dev"));

app.use("/api/papers", paperAnalysisRoute);

app.get("/", (req, res) => {
  res.send("Hello to Clmides API");
});


app.use(globalErrorHandler);

module.exports = app;
