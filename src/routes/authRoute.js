const express = require("express");
const authRouter = express.Router();
const {
  registerAffiliate,
  loginAffiliate,
} = require("../controllers/authController.js");

authRouter.post("/register", registerAffiliate);
authRouter.post("/login", loginAffiliate);

module.exports = authRouter;
