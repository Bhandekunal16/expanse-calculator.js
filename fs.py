import csv
from datetime import datetime
import os
import aiofiles
from aiofiles import os as aio_os
import asyncio

class file_service_module:
    def write_file(folderPath, file_path, content):
        home_directory = os.path.expanduser("~")
        folder_path = os.path.join(home_directory, f"BudgetMateReports/{folderPath}")
        os.makedirs(folder_path, exist_ok=True)
        file = os.path.join(folder_path, file_path)
        with open(file, "w") as file:
            writer = csv.writer(file)
            writer.writerows(content)
            
    def write_file_obj(folderPath, file_path, content):
        home_directory = os.path.expanduser("~")
        folder_path = os.path.join(home_directory, f"BudgetMateReports/{folderPath}")
        os.makedirs(folder_path, exist_ok=True)
        files = os.path.join(folder_path, file_path)
        with open(files, "w") as file:
            writer = csv.DictWriter(file, fieldnames=content.keys())
            writer.writeheader()
            writer.writerow(content)
            
    def write_file_obj_list(folderPath, file_path, content):
        home_directory = os.path.expanduser("~")
        folder_path = os.path.join(home_directory, f"BudgetMateReports/{folderPath}")
        os.makedirs(folder_path, exist_ok=True)
        files = os.path.join(folder_path, file_path)
        with open(files, "w") as file:
            writer = csv.DictWriter(file, fieldnames=content[0].keys())
            writer.writeheader()
            writer.writerows(content)
            
class date_module:
    def get_date():
        date = datetime.now()
        return date.strftime("%d-%m-%Y")
    
class user_module:
    async def maintain_account(path, updated_data):
       file_exists = await aio_os.path.exists(path)
       if not file_exists:
        async with aiofiles.open(path, mode='w', encoding='utf-8') as file:
            await file.write('"totalExpanse","totalIncome","totalTransactions"\n0,0,0\n')
        print(f"File created: {path}")
    
        async with aiofiles.open(path, mode='r', encoding='utf-8') as file:
            content = await file.read()
            lines = content.strip().split("\n")
            if len(lines) < 2:
                data_array = [{"totalExpanse": "0", "totalIncome": "0", "totalTransactions": "0"}]
            else:
                reader = csv.DictReader(lines)
                data_array = list(reader)
            
            if data_array:
                csv_data = {
            "totalExpanse": updated_data["totalExpanse"] + float(data_array[0]["totalExpanse"]),
            "totalIncome": updated_data["totalIncome"] + float(data_array[0]["totalIncome"]),
            "totalTransactions": updated_data["totalTransactions"] + float(data_array[0]["totalTransactions"]),
                        }
                async with aiofiles.open(path, mode='w', encoding='utf-8') as file:
                    await file.write(",".join(csv_data.keys()) + "\n")
                    await file.write(",".join(map(str, csv_data.values())) + "\n")
                    print(f"Data updated and written to {path}")