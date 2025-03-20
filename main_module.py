import tkinter as tk

class main_module:
    def packer(input):
        return input.pack(pady=10)

    def label_module(input, value):
        return tk.Label(input, text=value)
    
    def button_module(input, Text, fun):
        return tk.Button(input, text=Text, command=fun)
    
    def text_module(input, value):
        return tk.Text(input, wrap="word", height=10, width=50, padx=10, pady=10)
    
    def entry_module(input):
        return tk.Entry(input, width=50)
    
class Text_sub_module:
    def insert(input, content):
        input.insert(tk.END, content)
        input.config(state="disabled")
    