class command_line_module:
    def graceful_exit(root):
        confirm = input("\nAre you sure you want to exit? (y/n): ").strip().lower()
        if confirm == 'y':
            print("Program stopped by user.")
            root.destroy()
        else:
            root.mainloop()
            print("Resuming program...")