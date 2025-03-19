const { app, BrowserWindow, Notification } = require("electron");
const path = require("path");
const { exec } = require("child_process");
const http = require("http");

let mainWindow;
const serverPort = 3000;

const waitForServer = (url, callback) => {
  const interval = setInterval(() => {
    http
      .get(url, (res) => {
        if (res.statusCode === 200) {
          clearInterval(interval);
          callback();
        }
      })
      .on("error", () => {
        console.log("Waiting for server...");
      });
  }, 1000);
};

app.whenReady().then(() => {
  const serverProcess = exec("node app.js");

  serverProcess.stdout.on("data", (data) => {
    const notification = new Notification({
      title: "BudgetMate",
      body: `Server: ${data}`,
    });

    notification.show();
  });

  serverProcess.stderr.on("data", (data) => {
    console.error(`Server Error: ${data}`);
  });

  waitForServer(`http://localhost:${serverPort}`, () => {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: false,
      },
    });

    mainWindow.loadURL(`http://localhost:${serverPort}`);
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
