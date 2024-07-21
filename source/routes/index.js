const express = require("express");
const { body, param, query, validationResult } = require("express-validator");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const ShortURL = require("../models/ShortURLModel");

const publicUrl = process.env.PUBLIC_URL || "http://localhost:3000";
const apiKeys = process.env.API_KEYS.split(",");

/**
 * @swagger
 * components:
 *   schemas:
 *     URL:
 *       type: object
 *       required:
 *         - url
 *         - key
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the URL
 *         url:
 *           type: string
 *           description: The original URL
 *         key:
 *           type: string
 *           description: The API key for authorization
 *         short_url:
 *           type: string
 *           description: The shortened URL
 *         expiration:
 *           type: string
 *           format: date-time
 *           description: The expiration date of the URL
 *       example:
 *         url: "https://www.example.com"
 *         key: "your_api_key_here"
 *         expiration: "2024-12-31T23:59:59.000Z"
 */

/**
 * @swagger
 * tags:
 *   name: URLs
 *   description: The URL managing API
 */

/**
 * @swagger
 * /:
 *   post:
 *     summary: Create a short URL
 *     tags: [URLs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/URL"
 *     responses:
 *       200:
 *         description: The short URL was created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shortUrl:
 *                   type: string
 *                   description: The shortened URL
 *       403:
 *         description: Invalid API key
 *       500:
 *         description: Failed to create short URL
 */
router.post("/", [
  body("url").isURL().withMessage("Invalid URL format"),
  body("key").isString().withMessage("API key is required"),
  body("expiration").optional().isISO8601().withMessage("Invalid expiration date format")
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { url, key, expiration } = req.body;

  if (!apiKeys.includes(key)) {
    return res.status(403).json({ error: "Invalid API key" });
  }

  const id = uuidv4();
  const shortUrl = `${publicUrl}/${id}`;
  const expiresAt = expiration ? new Date(expiration) : null;

  try {
    const newUrl = await ShortURL.create({
      id,
      original_url: url,
      short_url: shortUrl,
      expires_at: expiresAt
    });

    res.status(201).json({ shortUrl: newUrl.short_url });
  } catch (error) {
    res.status(500).json({ error: "Failed to create short URL" });
  }
});

/**
 * @swagger
 * /{id}:
 *   delete:
 *     summary: Delete a short URL
 *     tags: [URLs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The URL id
 *       - in: query
 *         name: key
 *         schema:
 *           type: string
 *         required: true
 *         description: The API key for authorization
 *     responses:
 *       200:
 *         description: URL deleted successfully
 *       403:
 *         description: Invalid API key
 *       404:
 *         description: URL not found
 *       500:
 *         description: Failed to delete URL
 */
router.delete("/:id", [
  param("id").isUUID().withMessage("Invalid URL ID format"),
  query("key").isString().withMessage("API key is required")
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const id = req.params.id;
  const key = req.query.key;

  if (!apiKeys.includes(key)) {
    return res.status(403).json({ error: "Invalid API key" });
  }

  try {
    const result = await ShortURL.destroy({
      where: { id }
    });

    if (result) {
      res.json({ message: "URL deleted successfully" });
    } else {
      res.status(404).json({ error: "URL not found" });
    }

  } catch (error) {
    res.status(500).json({ error: "Failed to delete URL" });
  }
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get a list of all URLs
 *     tags: [URLs]
 *     responses:
 *       200:
 *         description: A list of URLs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/URL"
 *       500:
 *         description: Failed to retrieve URLs
 */
router.get("/", async (req, res) => {
  try {
    const urls = await ShortURL.findAll();

    res.json(urls);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve URLs" });
  }
});

/**
 * @swagger
 * /{id}:
 *   get:
 *     summary: Redirect to the original URL
 *     tags: [URLs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The URL id
 *     responses:
 *       302:
 *         description: Redirect to the original URL
 *       404:
 *         description: URL not found
 *       410:
 *         description: URL has expired
 *       500:
 *         description: Failed to retrieve URL
 */
router.get("/:id", [
  param("id").isUUID().withMessage("Invalid URL ID format")
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const id = req.params.id;

  try {
    const url = await ShortURL.findOne({ where: { id } });
    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    if (url.expires_at && new Date(url.expires_at) < new Date()) {
      return res.status(410).json({ error: "URL has expired" });
    }

    res.redirect(url.original_url);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve URL" });
  }
});

module.exports = router;
