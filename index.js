require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT||3005;
const mongoDb = require("./db");

mongoDb();
const cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:3004", // Allow requests from this origin only
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"], // Define allowed headers
  })
);
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use(express.json());
app.use("/api", require("./Routes/CreateUser"));
app.use("/api", require("./Routes/DisplayData"));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
