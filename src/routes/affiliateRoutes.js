const express = require("express");
const affiliateRouter = express.Router();
const {
  registerAffiliate,
  trackClick,
  getDashboard,
} = require("../controllers/authController.js");

affiliateRouter.post("/register", registerAffiliate);
affiliateRouter.post("/click", trackClick);
affiliateRouter.get("/dashboard/:code", getDashboard);

module.exports = affiliateRouter;
