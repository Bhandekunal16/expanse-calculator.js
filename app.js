const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const csv = require("./csv");

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
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.use(express.static(uploadsDir));

app.get("/", (req, res) => {
  res.send(`
    <form action="/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="file" />
      <button type="submit">Upload</button>
    </form>
  `);
});

app.post("/upload", upload.single("file"), (req, res) => {
  if (req.file) {
    res.send(
      `File uploaded successfully: <a href="/${req.file.filename}">${req.file.filename}</a>`
    );
    if (req.file.filename.endsWith(".csv")) {
      new csv().read(`uploads/${req.file.filename}`).then((ele) => {
        new csv().generate_report(ele);
      });
    }
  } else {
    res.send("No file uploaded");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
