import prisma from "../models/prisma.js";
import bcrypt from "bcryptjs";

// Register Affiliate
const registerAffiliate = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // เช็ค email ซ้ำ
    const exist = await prisma.affiliates.findUnique({ where: { email } });
    if (exist)
      return res.status(400).json({ message: "Email already registered" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // สร้าง affiliate
    const affiliate = await prisma.affiliates.create({
      data: {
        name,
        email,
        password: hashedPassword,
        code: name.toLowerCase(),
      },
    });

    // สร้าง link แล้ว update DB
    const link = `https://paylater.toptechplaza.com?via=${affiliate.code}`;
    await prisma.affiliates.update({
      where: { id: affiliate.id },
      data: { link },
    });

    res.json({ message: "Registered", affiliateLink: link });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// Track Click
const trackClick = async (req, res) => {
  try {
    const { affiliate_code, campaign_code } = req.body;

    const affiliate = await prisma.affiliates.findUnique({
      where: { code: affiliate_code },
    });
    if (!affiliate)
      return res.status(404).json({ message: "Affiliate not found" });

    await prisma.referralClicks.create({
      data: {
        affiliate_id: affiliate.id,
        campaign_code: campaign_code || "default",
        ip_address: req.ip,
        user_agent: req.headers["user-agent"] || "unknown",
        clicked_at: new Date(),
      },
    });

    res.json({ message: "Click tracked" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// Dashboard
const getDashboard = async (req, res) => {
  try {
    const affiliate = await prisma.affiliates.findUnique({
      where: { code: req.params.code },
      include: { referralClicks: true },
    });

    if (!affiliate)
      return res.status(404).json({ message: "Affiliate not found" });

    res.json({
      name: affiliate.name,
      link: affiliate.link,
      clicks: affiliate.referralClicks.length,
      status: affiliate.status,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export { registerAffiliate, trackClick, getDashboard };
