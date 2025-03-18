const fs = require("fs");
const csv = require("csv-parser");

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

  generate_report(data) {
    const expanse = [];
    const income = [];
    let bigIncome = 0;
    let bigExpanse = 0;
    let totalIncome = 0;
    let totalExpanse = 0;
    let bigExpanseName = "";
    let bigIncomeName = "";
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
    console.log({
      expanse,
      income,
      totalExpanse,
      totalIncome,
      bigExpanse,
      bigIncome,
      bigExpanseName,
      bigIncomeName,
    });
  }
}

module.exports = csvProcess;
