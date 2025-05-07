import express from "express";
import fetch from "node-fetch";
import multer from "multer";
import { Buffer } from "buffer";

const router = express.Router();
const upload = multer();
const imgbbApiKey = "46a8459452ff5cbfa27871f0f69ac118";
// @ts-ignore
router.post("/", upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const base64Image = file.buffer.toString("base64");

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          image: base64Image,
          name: file.originalname,
        }),
      }
    );

    const result = await response.json();
    res.json(result);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
