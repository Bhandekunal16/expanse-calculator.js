import os
import tkinter as tk
from tkinter import filedialog
from main_module import Text_sub_module, main_module
from fs import file_service_module
from fs import date_module
from fs import user_module
import asyncio
import concurrent.futures

executor = concurrent.futures.ThreadPoolExecutor() 

window = tk.Tk()
window.title("BudgetMate")


def open_file():
    file_path = filedialog.askopenfilename(
        title="Select a file", filetypes=[("Text Files", "*.csv"), ("All Files", "*.*")]
    )
    if file_path:
        with open(file_path, "r") as file:
            content = file.read()
            rows = [row.split(",") for row in content.split("\n")]
            rows = rows[:-1]
            headers = rows[0]
            result = [dict(zip(headers, row)) for row in rows]
            report = generate_report(result)
            obj1 = {
                "totalExpanse": report["totalExpanse"],
                "totalIncome": report["totalIncome"],
                "bigExpanse": report["bigExpanse"],
                "bigIncome": report["bigIncome"],
                "bigExpanseName": report["bigExpanseName"],
                "bigIncomeName": report["bigIncomeName"],
                "totalTransactions": report["totalTransactions"],
                "avgIncome": report["avgIncome"],
                "avgExpense": report["avgExpense"],
            }
            file_service_module.write_file(
                "uploads", f"{date_module.get_date()}_IE.csv", rows
            )
            file_service_module.write_file_obj(
                "report", f"{date_module.get_date()}__IER.csv", obj1
            )
            file_service_module.write_file_obj_list(
                "report", "ED.csv", report["expanse"]
            )
            file_service_module.write_file_obj_list(
                "report", "ID.csv", report["income"]
            )
            home_directory = os.path.expanduser("~")
            folder_path = os.path.join(home_directory, f"BudgetMateReports/report")
            os.makedirs(folder_path, exist_ok=True)
            files = os.path.join(folder_path, "account.csv")
            loop = asyncio.get_event_loop()
            loop.run_in_executor(
                executor,
                asyncio.run,
                user_module.maintain_account(
                    files,
                    {
                        "totalExpanse": report["totalExpanse"],
                        "totalIncome": report["totalIncome"],
                        "totalTransactions": report["totalTransactions"],
                    },
                ),
            )
            Text_sub_module.insert(text_box, 'Report generated successfully at BudgetMateReports/report\n')


def generate_report(data):
    expanse = []
    income = []
    big_income = 0
    big_expanse = 0
    total_income = 0
    total_expanse = 0
    big_expanse_name = ""
    big_income_name = ""
    total_transactions = len(data)

    for transaction in data:
        if transaction["Type"] == "Income":
            income.append(transaction)
            amount = float(transaction["Amount"])
            total_income += amount
            if big_income < amount:
                big_income = amount
                big_income_name = transaction["Source"]

        if transaction["Type"] == "Expense":
            expanse.append(transaction)
            amount = float(transaction["Amount"])
            total_expanse += amount
            if big_expanse < amount:
                big_expanse = amount
                big_expanse_name = transaction["Source"]

    avg_income = round(total_income / len(income), 2) if income else 0
    avg_expense = round(total_expanse / len(expanse), 2) if expanse else 0

    return {
        "expanse": expanse,
        "income": income,
        "totalExpanse": total_expanse,
        "totalIncome": total_income,
        "bigExpanse": big_expanse,
        "bigIncome": big_income,
        "bigExpanseName": big_expanse_name,
        "bigIncomeName": big_income_name,
        "totalTransactions": total_transactions,
        "avgIncome": avg_income,
        "avgExpense": avg_expense,
    }


label = main_module.label_module(window, "Welcome in BudgetMate!")
main_module.packer(label)

button = main_module.button_module(window, "select file", open_file)
main_module.packer(button)

text_box = main_module.text_module(window, "")
main_module.packer(text_box)


window.mainloop()
