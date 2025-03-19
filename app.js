const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const csv = require("./csv");
const generator = require("./generator");

const uploadsDir = "./uploads";

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
    cb(
      null,
      `${new generator().getFormattedDate()}_IE` +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

app.use(express.static(uploadsDir));
app.use("/report", express.static("report"));

app.get("/", (req, res) => {
  res.send(path.join(__dirname, "index.html"));
});

app.post("/upload", upload.single("file"), async (req, res) => {
  if (req.file) {
    if (req.file.filename.endsWith(".csv")) {
      const ele = await new csv().read(`uploads/${req.file.filename}`);
      const report = new csv().generate_report(ele);
      const download = await new csv().write(
        `report/${new generator().getFormattedDate()}_IER.csv`,
        {
          totalExpanse: report.totalExpanse,
          totalIncome: report.totalIncome,
          bigExpanse: report.bigExpanse,
          bigIncome: report.bigIncome,
          bigExpanseName: report.bigExpanseName,
          bigIncomeName: report.bigIncomeName,
          totalTransactions: report.totalTransactions,
          avgIncome: report.avgIncome,
          avgExpense: report.avgExpense,
        }
      );
      await Promise.all([
        new csv().append(`report/ED.csv`, report.expanse),
        new csv().append(`report/ID.csv`, report.income),
        new csv().maintain_account(`report/account.csv`, {
          totalExpanse: report.totalExpanse,
          totalIncome: report.totalIncome,
          totalTransactions: report.totalTransactions,
        }),
      ]);
      res.send(`<a href="${download}" style="padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Download File ${download}</a>
`);
    }
  } else {
    res.send("No file uploaded");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
