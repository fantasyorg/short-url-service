const express = require("express");
const { Op } = require("sequelize");
const cron = require("node-cron");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const ShortURL = require("./source/models/ShortURLModel");

require("dotenv").config();

const app = express();

const publicUrl = process.env.PUBLIC_URL || "http://localhost:3000";
const host = process.env.HOST || "localhost";
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Short URL Service",
      version: "1.0.0",
      description: "A simple URL shortener service"
    },
    servers: [
      {
        url: publicUrl
      }
    ],
  },
  apis: ["./source/routes/*.js"],
})));

app.use("/", require("./source/routes/index"));

// Scheduled task to delete expired URLs daily at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    const result = await ShortURL.destroy({
      where: {
        expires_at: {
          [Op.lt]: new Date()
        }
      }
    });

    console.log(`Deleted ${result} expired URLs`);
  } catch (error) {
    console.error("Failed to delete expired URLs:", error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://${host}:${port}`);
});