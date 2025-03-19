const fs = require("fs");
const csv = require("csv-parser");
const { parse } = require("json2csv");

class csvProcess {
  #results = [];

  read(path) {
    return new Promise((resolve, reject) => {
      fs.createReadStream(path)
        .pipe(csv())
        .on("data", (data) => this.#results.push(data))
        .on("end", () => {
          resolve(this.#results);
        })
        .on("error", (err) => {
          reject(err);
        });
    });
  }

  write(path, data) {
    return new Promise((resolve, reject) => {
      try {
        const csvData = parse(data);
        fs.writeFile(path, csvData, "utf8", (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(path);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  append(path, data) {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(path)) {
        fs.writeFileSync(path, "", "utf8");
        console.log(`File created: ${path}`);
      }
      try {
        let dataArray = [];
        fs.createReadStream(path)
          .pipe(csv())
          .on("data", (input) => {
            dataArray.push(input);
          })
          .on("end", () => {
            if (dataArray[0] != data[0]) {
              for (let index = 0; index < data.length; index++) {
                let body = Object.values(data[index]);
                fs.appendFile(path, body.join(",") + "\n", "utf8", (err) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(path);
                  }
                });
              }
            } else {
              const csvData = typeof data === "string" ? data : parse(data);
              fs.appendFile(path, csvData + "\n", "utf8", (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(path);
                }
              });
            }
          });
      } catch (error) {
        reject(error);
      }
    });
  }

  async maintain_account(path, updatedData) {
    let dataArray = [];
    fs.createReadStream(path)
      .pipe(csv())
      .on("data", (data) => {
        dataArray.push(data);
      })
      .on("end", () => {
        const csvData = {
          totalExpanse:
            updatedData.totalExpanse + parseFloat(dataArray[0].totalExpanse),
          totalIncome:
            updatedData.totalIncome + parseFloat(dataArray[0].totalIncome),
          totalTransactions:
            updatedData.totalTransactions +
            parseFloat(dataArray[0].totalTransactions),
        };
        fs.writeFile(path, parse(csvData), "utf8", (err) => {
          if (err) {
            throw err;
          }
        });
      });
  }

  generate_report(data) {
    const expanse = [];
    const income = [];
    let bigIncome = 0;
    let bigExpanse = 0;
    let totalIncome = 0;
    let totalExpanse = 0;
    let bigExpanseName = "";
    let bigIncomeName = "";
    let totalTransactions = data.length;

    for (let i = 0; i < data.length; i++) {
      if (data[i].Type == "Income") {
        income.push(data[i]);
        totalIncome += parseFloat(data[i].Amount);
        if (bigIncome < parseFloat(data[i].Amount)) {
          bigIncome = parseFloat(data[i].Amount);
          bigIncomeName = data[i].Source;
        }
      }
      if (data[i].Type == "Expense") {
        expanse.push(data[i]);
        totalExpanse += parseFloat(data[i].Amount);
        if (bigExpanse < parseFloat(data[i].Amount)) {
          bigExpanse = parseFloat(data[i].Amount);
          bigExpanseName = data[i].Source;
        }
      }
    }

    let avgIncome = income.length
      ? (totalIncome / income.length).toFixed(2)
      : 0;
    let avgExpense = expanse.length
      ? (totalExpanse / expanse.length).toFixed(2)
      : 0;

    return {
      expanse,
      income,
      totalExpanse,
      totalIncome,
      bigExpanse,
      bigIncome,
      bigExpanseName,
      bigIncomeName,
      totalTransactions,
      avgIncome,
      avgExpense,
    };
  }
}

module.exports = csvProcess;
