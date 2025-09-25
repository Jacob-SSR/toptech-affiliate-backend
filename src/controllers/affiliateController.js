import prisma from "../models/prisma.js";

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
        campaignCode: campaign_code || "paylater",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] || "unknown",
      },
    });

    res.json({ message: "Click tracked", success: true });
  } catch (err) {
    console.error("TRACK CLICK ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

const trackLead = async (req, res) => {
  try {
    const { referralCode, name, email, phone } = req.body;

    if (!referralCode) {
      return res.status(400).json({ message: "Referral code is required" });
    }

    const affiliate = await prisma.affiliate.findUnique({
      where: { code: referralCode },
    });

    if (!affiliate) {
      return res.status(404).json({ message: "Affiliate not found" });
    }

    // === เก็บ Lead ===
    const lead = await prisma.lead.create({
      data: {
        affiliateId: affiliate.id,
        name,
        email,
        phone,
        sourceCampaign: "paylater",
      },
    });

    res.json({ message: "Lead tracked", lead });
  } catch (err) {
    console.error("TRACK LEAD ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

const getDashboard = async (req, res) => {
  try {
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: req.user.id },
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
      affiliateLink:
        affiliate.link ||
        `https://paylater.toptechplaza.com?via=${affiliate.code}`,
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
    res.status(500).json({ error: err.message });
  }
};

const updateAffiliateLink = async (req, res) => {
  try {
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: req.user.id },
    });
    if (!affiliate) {
      return res.status(404).json({ message: "Affiliate not found" });
    }

    const { newCode } = req.body;
    if (!newCode || newCode.trim().length < 4) {
      return res
        .status(400)
        .json({ message: "Code must be at least 4 characters" });
    }

    const newLink = `https://paylater.toptechplaza.com?via=${newCode}`;

    const updated = await prisma.affiliate.update({
      where: { id: affiliate.id },
      data: {
        code: newCode,
        link: newLink,
        lastLinkUpdate: new Date(),
      },
    });

    res.json({
      message: "Affiliate link updated successfully",
      affiliateLink: updated.link,
      lastLinkUpdate: updated.lastLinkUpdate,
    });
  } catch (err) {
    console.error("UPDATE LINK ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

const getReferrals = async (req, res) => {
  try {
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: req.user.id },
      include: {
        referrals: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            code: true,
            createdAt: true,
            status: true,
            leads: {
              include: {
                orders: {
                  include: {
                    commissions: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!affiliate) {
      return res.status(404).json({ message: "Affiliate not found" });
    }

    const formatted = affiliate.referrals.map((r) => {
      const totalLeads = r.leads.length;
      const totalOrders = r.leads.reduce((sum, l) => sum + l.orders.length, 0);
      const totalCommission = r.leads.reduce(
        (sum, l) =>
          sum +
          l.orders.reduce(
            (oSum, o) =>
              oSum +
              o.commissions.reduce((cSum, c) => cSum + parseFloat(c.amount), 0),
            0
          ),
        0
      );

      return {
        id: r.id,
        name: `${r.firstName} ${r.lastName}`,
        email: r.email,
        code: r.code,
        registeredAt: r.createdAt,
        status: r.status,
        leads: totalLeads,
        orders: totalOrders,
        commission: totalCommission,
      };
    });

    res.json({ referrals: formatted });
  } catch (err) {
    console.error("REFERRALS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

export {
  trackClick,
  trackLead,
  getDashboard,
  updateAffiliateLink,
  getReferrals,
};
