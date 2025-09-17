const express = require("express");
const affiliateRouter = express.Router();
const {
  registerAffiliate,
  trackClick,
  getDashboard,
  loginAffiliate,
  getReferrals,
  updateAffiliateLink,
} = require("../controllers/authController.js");

affiliateRouter.post("/register", registerAffiliate);
affiliateRouter.post("/login", loginAffiliate);
affiliateRouter.post("/click", trackClick);
affiliateRouter.get("/dashboard", getDashboard);
affiliateRouter.get("/referrals", getReferrals);
affiliateRouter.put("/link", updateAffiliateLink);

module.exports = affiliateRouter;
