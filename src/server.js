require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { apiLimiter } = require("./utils/rateLimiter");
const affiliateRouter = require("./routes/affiliateRoutes");

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(apiLimiter);

app.use("/api/affiliate", affiliateRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
