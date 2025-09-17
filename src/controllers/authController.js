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
        lastLinkUpdate: new Date(),
      },
    });

    res.json({
      message: "Registered successfully",
      affiliateCode: affiliate.code,
      affiliateLink: `https://paylater.toptechplaza.com?via=${affiliate.code}`,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

const loginAffiliate = async (req, res) => {
  try {
    const { email, password } = req.body;

    const affiliate = await prisma.affiliate.findUnique({ where: { email } });
    if (!affiliate) {
      return res.status(404).json({ message: "Affiliate not found" });
    }

    const validPassword = await bcrypt.compare(password, affiliate.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in .env");
    }

    const token = jwt.sign(
      { id: affiliate.id, code: affiliate.code, email: affiliate.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      affiliateLink: `https://paylater.toptechplaza.com?via=${affiliate.code}`,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

const verifyToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new Error("No token provided");

  const token = authHeader.split(" ")[1];
  if (!token) throw new Error("No token provided");

  return jwt.verify(token, process.env.JWT_SECRET);
};


const trackClick = async (req, res) => {
  try {
    const { affiliate_code, campaign_code } = req.body;

    const affiliate = await prisma.affiliate.findUnique({
      where: { code: affiliate_code },
    });
    if (!affiliate) {
      return res.status(404).json({ message: "Affiliate not found" });
    }

    await prisma.referralClick.create({
      data: {
        affiliateId: affiliate.id,
        campaignCode: campaign_code || "default",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] || "unknown",
        createdAt: new Date(),
      },
    });

    res.json({ message: "Click tracked" });
  } catch (err) {
    console.error("TRACK CLICK ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

const getDashboard = async (req, res) => {
  try {
    const decoded = verifyToken(req);

    const affiliate = await prisma.affiliate.findUnique({
      where: { id: decoded.id },
      include: {
        referralClicks: true,
        leads: { include: { orders: true } },
        commissions: true,
      },
    });

    if (!affiliate) {
      return res.status(404).json({ message: "Affiliate not found" });
    }

    const totalClicks = affiliate.referralClicks.length;
    const totalOrders = affiliate.leads.reduce(
      (sum, lead) => sum + lead.orders.length,
      0
    );
    const totalCommission = affiliate.commissions.reduce(
      (sum, c) => sum + parseFloat(c.amount),
      0
    );

    const conversionRate =
      totalClicks > 0 ? ((totalOrders / totalClicks) * 100).toFixed(2) : 0;
    const epc =
      totalClicks > 0 ? (totalCommission / totalClicks).toFixed(2) : 0;

    const days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });

    const clicksByDay = days.map(
      (d) =>
        affiliate.referralClicks.filter(
          (c) => c.createdAt.toISOString().slice(0, 10) === d
        ).length
    );

    const commissionsByDay = days.map((d) =>
      affiliate.commissions
        .filter((c) => c.createdAt.toISOString().slice(0, 10) === d)
        .reduce((sum, c) => sum + parseFloat(c.amount), 0)
    );

    res.json({
      name: `${affiliate.firstName} ${affiliate.lastName}`,
      affiliateLink: `https://paylater.toptechplaza.com?via=${affiliate.code}`,
      clicks: totalClicks,
      orders: totalOrders,
      commission: totalCommission,
      conversionRate,
      epc,
      status: affiliate.status,
      emailConfirmed: affiliate.emailConfirmed,
      lastLinkUpdate: affiliate.lastLinkUpdate,
      chart: { days, clicks: clicksByDay, commissions: commissionsByDay },
    });
  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
    res.status(401).json({ message: err.message });
  }
};

const updateAffiliateLink = async (req, res) => {
  try {
    const decoded = verifyToken(req);

    const affiliate = await prisma.affiliate.findUnique({
      where: { id: decoded.id },
    });
    if (!affiliate) {
      return res.status(404).json({ message: "Affiliate not found" });
    }

    if (affiliate.lastLinkUpdate) {
      const nextUpdate = new Date(affiliate.lastLinkUpdate);
      nextUpdate.setMonth(nextUpdate.getMonth() + 3);
      if (new Date() < nextUpdate) {
        return res.status(400).json({
          message: `คุณสามารถแก้ไขลิงก์ได้อีกครั้งหลังวันที่ ${nextUpdate
            .toISOString()
            .slice(0, 10)}`,
        });
      }
    }

    const { newCode } = req.body;
    if (!newCode || newCode.trim().length < 4) {
      return res
        .status(400)
        .json({ message: "Code must be at least 4 characters" });
    }

    const updated = await prisma.affiliate.update({
      where: { id: affiliate.id },
      data: { code: newCode, lastLinkUpdate: new Date() },
    });

    res.json({
      message: "Affiliate link updated successfully",
      affiliateLink: `https://paylater.toptechplaza.com?via=${updated.code}`,
    });
  } catch (err) {
    console.error("UPDATE LINK ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

const getReferrals = async (req, res) => {
  try {
    const decoded = verifyToken(req);

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

    if (!affiliate) {
      return res.status(404).json({ message: "Affiliate not found" });
    }

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
    console.error("REFERRALS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

export {
  registerAffiliate,
  loginAffiliate,
  trackClick,
  getDashboard,
  updateAffiliateLink,
  getReferrals,
};
