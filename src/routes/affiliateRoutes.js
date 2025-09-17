const express = require("express");
const affiliateRouter = express.Router();
const {
  trackClick,
  getDashboard,
  getReferrals,
  updateAffiliateLink,
} = require("../controllers/affiliateController.js");
const { verifyToken } = require("../middlewares/authMiddleware.js");

affiliateRouter.post("/click", trackClick);
affiliateRouter.get("/dashboard", verifyToken, getDashboard);
affiliateRouter.get("/referrals", verifyToken, getReferrals);
affiliateRouter.put("/update-link", verifyToken, updateAffiliateLink);

module.exports = affiliateRouter;
