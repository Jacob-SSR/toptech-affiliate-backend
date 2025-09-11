import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 100, // จำกัด request 100 ครั้งต่อ window
  standardHeaders: true, // ส่ง rate limit info ใน headers
  legacyHeaders: false, // ปิด X-RateLimit-* headers
  message: "คุณส่งคำขอมากเกินไป โปรดลองใหม่ในภายหลัง",
});
