const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const csv = require("./csv");
const generator = require("./generator");

const uploadsDir = "./uploads";
const reportDir = "./report";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const app = express();
const port = 3000;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.use(express.static(uploadsDir));
app.use(reportDir, express.static(reportDir));

app.get("/", (req, res) => {
  res.send(`
    <form action="/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="file" />
      <button type="submit">Upload</button>
    </form>
  `);
});

app.post("/upload", upload.single("file"), async (req, res) => {
  if (req.file) {
    if (req.file.filename.endsWith(".csv")) {
      const ele = await new csv().read(`uploads/${req.file.filename}`);
      const report = new csv().generate_report(ele);
      const download = await new csv().write(
        `report/${new generator().getFormattedDate()}_IncomeExpanse.csv`,
        {
          totalExpanse: report.totalExpanse,
          totalIncome: report.totalIncome,
          bigExpanse: report.bigExpanse,
          bigIncome: report.bigIncome,
          bigExpanseName: report.bigExpanseName,
          bigIncomeName: report.bigIncomeName,
        }
      );
      res.send(`<a href="${download}">${download}</a>`);
    }
  } else {
    res.send("No file uploaded");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
