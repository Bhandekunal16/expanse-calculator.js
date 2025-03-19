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
  res.send(`
   <h1>BudgetMate</h1>
<div
  style="
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0%;
    padding: 0%;
  "
>
  <form
    action="/upload"
    method="post"
    enctype="multipart/form-data"
    style="
      margin-top: 10%;
      border: 1px #000 solid;
      width: 40dvw;
      height: 40dvh;
      display: flex;
      justify-content: space-around;
      align-items: center;
    "
  >
    <input type="file" name="file" />
    <button
      type="submit"
      style="
        padding: 10px 15px;
        background-color: #007bff;
        border: 1px transparent solid;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        display: inline-block;
      "
    >
      Upload
    </button>
  </form>
</div>

  `);
});

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
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
  } catch (error) {
    res.send("wrong file input please insert correct data");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
