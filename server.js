const app = require("./app");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./config.env" });

let DATABASE = process.env.DATABASE;
if (process.env.NODE_ENV === "development") {
  DATABASE = process.env.DATABASE_LOCAL;
}

const port = 4000;

mongoose
  .connect(DATABASE)
  .then(() => {
    console.log("Database Connection is established");
  })
  .catch((error) => {
    console.error("Error connecting to database:", error);
  });

app.listen(port, () => {
  console.log(`Sever is listening on port ${port}`);
});
