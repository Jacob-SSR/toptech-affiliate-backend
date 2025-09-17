import prisma from "../models/prisma.js";
import bcrypt from "bcryptjs";
import { signToken } from "../utils/jwt.js";
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
    const link = `https://paylater.toptechplaza.com?via=${code}`;

    const affiliate = await prisma.affiliate.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        code,
        link,
        lastLinkUpdate: new Date(),
      },
    });

    res.json({
      message: "Registered successfully",
      affiliateCode: affiliate.code,
      affiliateLink: affiliate.link,
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
    if (!affiliate)
      return res.status(404).json({ message: "Affiliate not found" });

    const validPassword = await bcrypt.compare(password, affiliate.password);
    if (!validPassword)
      return res.status(401).json({ message: "Invalid password" });

    const payload = {
      id: affiliate.id,
      code: affiliate.code,
      email: affiliate.email,
    };
    const token = signToken(payload);

    res.json({
      message: "Login successful",
      token,
      affiliate: {
        id: affiliate.id,
        firstName: affiliate.firstName,
        lastName: affiliate.lastName,
        email: affiliate.email,
        code: affiliate.code,
        link: affiliate.link,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

export { registerAffiliate, loginAffiliate };
