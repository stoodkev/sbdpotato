const express = require("express");
var cors = require("cors");
const jobsRouter = require("./routes/jobs");
const conversionsRouter = require("./routes/conversions");

// Express
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));

//CORS
app.use(cors());

// Routes
app.use(jobsRouter);
app.use(conversionsRouter);
module.exports = app;
