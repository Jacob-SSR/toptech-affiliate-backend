import prisma from "../models/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";

const registerAffiliate = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const exist = await prisma.affiliate.findUnique({ where: { email } });
    if (exist) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const code = `${firstName.toLowerCase()}-${nanoid(6)}`;

    const affiliate = await prisma.affiliate.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        code,
      },
    });

    const link = `https://paylater.toptechplaza.com?via=${affiliate.code}`;
    await prisma.affiliate.update({
      where: { id: affiliate.id },
      data: { link },
    });

    res.json({
      message: "Registered successfully",
      affiliateCode: affiliate.code,
      affiliateLink: link,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const loginAffiliate = async (req, res) => {
  try {
    const { email, password } = req.body;

    const affiliate = await prisma.affiliate.findUnique({ where: { email } });
    if (!affiliate)
      return res.status(404).json({ message: "Affiliate not found" });

    const validPassword = await bcrypt.compare(password, affiliate.password);
    if (!validPassword)
      return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: affiliate.id, code: affiliate.code, email: affiliate.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const trackClick = async (req, res) => {
  try {
    const { affiliate_code, campaign_code } = req.body;

    const affiliate = await prisma.affiliate.findUnique({
      where: { code: affiliate_code },
    });
    if (!affiliate)
      return res.status(404).json({ message: "Affiliate not found" });

    await prisma.referralClick.create({
      data: {
        affiliateId: affiliate.id,
        campaignCode: campaign_code || "default",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] || "unknown",
        clickedAt: new Date(),
      },
    });

    res.json({ message: "Click tracked" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getDashboard = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }

    const affiliate = await prisma.affiliate.findUnique({
      where: { id: decoded.id },
      include: { referralClicks: true, referrals: true },
    });

    if (!affiliate)
      return res.status(404).json({ message: "Affiliate not found" });

    res.json({
      name: `${affiliate.firstName} ${affiliate.lastName}`,
      link: affiliate.link,
      clicks: affiliate.referralClicks.length,
      totalReferrals: affiliate.referrals.length,
      status: affiliate.status,
      emailConfirmed: affiliate.emailConfirmed,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getReferrals = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }

    const affiliate = await prisma.affiliate.findUnique({
      where: { id: decoded.id },
      include: {
        referrals: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            code: true,
            createdAt: true,
          },
        },
      },
    });

    if (!affiliate)
      return res.status(404).json({ message: "Affiliate not found" });

    res.json({
      referrals: affiliate.referrals.map((r) => ({
        id: r.id,
        name: `${r.firstName} ${r.lastName}`,
        email: r.email,
        code: r.code,
        registeredAt: r.createdAt,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export {
  registerAffiliate,
  loginAffiliate,
  trackClick,
  getDashboard,
  getReferrals,
};
