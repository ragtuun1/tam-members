const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const XLSX = require("xlsx");

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

// Serve static files
app.use("/assets", express.static(path.join(__dirname, "public")));

// Save Excel file from base64
app.post("/save-file", (req, res) => {
  const { fileData } = req.body;

  if (!fileData) {
    return res.status(400).json({ message: "No file data received" });
  }

  const buffer = Buffer.from(fileData, "base64");
  const filePath = path.join(__dirname, "public/MembershipData.xlsx");
  //const sponsorFilePath = path.join(__dirname, "public/SponsorData.xlsx");

  fs.writeFile(filePath, buffer, (err) => {
    if (err) {
      console.error("Error saving file:", err);
      return res.status(500).json({ message: "Error saving file" });
    }

    res.json({
      message: "File saved successfully!",
      path: "/assets/MembershipData.xlsx",
    });
  });
});

// Save Excel file from base64
app.post("/save-sponsor-file", (req, res) => {
  const { fileData } = req.body;

  if (!fileData) {
    return res.status(400).json({ message: "No file data received" });
  }

  const buffer = Buffer.from(fileData, "base64");
  //const filePath = path.join(__dirname, "public/MembershipData.xlsx");
  const sponsorFilePath = path.join(__dirname, "public/SponsorData.xlsx");

  fs.writeFile(filePath, buffer, (err) => {
    if (err) {
      console.error("Error saving file:", err);
      return res.status(500).json({ message: "Error saving file" });
    }

    res.json({
      message: "File saved successfully!",
      path: "/assets/SponsorData.xlsx",
    });
  });
});

// Load Excel file and return JSON
app.get("/api/membership-data", (req, res) => {
  const filePath = path.join(__dirname, "public", "MembershipData.xlsx");

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    res.json(data);
  } catch (err) {
    console.error("Error reading Excel file:", err);
    res.status(500).json({ message: "Failed to load Excel data" });
  }
});

// Load Excel file and return JSON
app.get("/api/sponsor-data", (req, res) => {
  const filePath = path.join(__dirname, "public", "SponsorData.xlsx");

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    res.json(data);
  } catch (err) {
    console.error("Error reading Excel file:", err);
    res.status(500).json({ message: "Failed to load Excel data" });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
