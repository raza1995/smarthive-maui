// Main Routes
require("dotenv").config();
const express = require("express");

const router = express.Router();

// Middle ware that is specific to this router
router.use((req, res, next) => {
  console.log("Time: ", Date.now());
  next();
});

// Define the initial route
// router.get('/', function(req, res) {
//   res.redirect(process.env.APP_URL+'/login/')
// });

router.get("/about", (req, res) => {
  res.send("About us");
});

router.post("/webhooks", (req, res) => {
  res.status(200).send("About us");
});

module.exports = router;
