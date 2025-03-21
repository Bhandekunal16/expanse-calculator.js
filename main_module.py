import tkinter as tk
from tkinter import messagebox


class main_module:
    def packer(input):
        return input.pack(pady=10)

    def destroy(input):
        return input.destroy()

    def label_module(input, value):
        return tk.Label(input, text=value)

    def button_module(input, Text: str, fun):
        return tk.Button(input, text=Text, command=fun)

    def text_module(input):
        return tk.Text(input, wrap="word", height=2, width=60)

    def notification_module(header: str, content: str):
        messagebox.showinfo(header, content)

    def entry_module(input):
        return tk.Entry(input, width=50)


class Text_sub_module:
    def insert(input, content):
        input.insert(tk.END, content)
        input.config(state="disabled")
