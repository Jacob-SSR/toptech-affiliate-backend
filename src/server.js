require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { apiLimiter } = require("./utils/rateLimiter");
const affiliateRouter = require("./routes/affiliateRoutes");
const authRouter = require("./routes/authRoute");

const app = express();
const PORT = process.env.PORT || 8001;

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(apiLimiter);

app.use("/api/affiliate", affiliateRouter);
app.use("/api/affiliate", authRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
