import customtkinter as ctk
import os

# ダークモードの設定
ctk.set_appearance_mode("Dark")

class Calculator(ctk.CTk):
    def __init__(self):
        super().__init__()
        
        self.title("Antigravity Calculator")
        self.geometry("320x500")
        self.resizable(False, False)
        
        # 状態管理
        self.expression = ""
        self.display_var = ctk.StringVar(value="0")
        self.current_theme = "solid_square" # Default theme
        
        # デザイン設定（テーマ）
        self.themes = {
            "original": {
                "bg": "#242424",
                "display_bg": "#343638",
                "num_btn": "#4a4a4a",
                "op_btn": "#ff9500",
                "clear_btn": "#a5a5a5",
                "text_color": "white",
                "num_text": "white",
                "clear_text": "black",
                "radius": 10,
                "font": ("Arial", 24)
            },
            "solid_square": {
                "bg": "#121722",
                "display_bg": "#191f2c",
                "num_btn": "#212a38",
                "op_btn": "#8ea3c7",
                "clear_btn": "#303b4c",
                "text_color": "#e8edf7",
                "num_text": "#e8edf7",
                "clear_text": "#e8edf7",
                "radius": 0, # 完全に四角
                "font": ("Consolas", 24, "bold") # メカニカルなフォント
            }
        }
        
        self.setup_ui()

    def setup_ui(self):
        # メインフレーム
        self.main_frame = ctk.CTkFrame(self, fg_color=self.themes[self.current_theme]["bg"], corner_radius=0)
        self.main_frame.pack(fill="both", expand=True)
        
        # ディスプレイ
        theme = self.themes[self.current_theme]
        self.display = ctk.CTkEntry(
            self.main_frame, 
            textvariable=self.display_var, 
            font=(theme["font"][0], 40), 
            justify="right", 
            state="readonly",
            fg_color=theme["display_bg"],
            border_color=theme["op_btn"] if self.current_theme == "solid_square" else theme["num_btn"],
            corner_radius=theme["radius"]
        )
        self.display.grid(row=0, column=0, columnspan=4, padx=10, pady=(20, 10), sticky="nsew")
        
        # テーマ切替ボタン（右上に小さく配置）
        self.theme_btn = ctk.CTkButton(
            self.main_frame, 
            text="THEME", 
            width=60, height=20, 
            font=("Arial", 10),
            fg_color=theme["clear_btn"],
            text_color=theme["clear_text"],
            corner_radius=theme["radius"],
            command=self.toggle_theme
        )
        self.theme_btn.grid(row=1, column=3, padx=10, pady=5, sticky="e")

        # グリッド構成
        for i in range(2, 7):
            self.main_frame.grid_rowconfigure(i, weight=1)
        for i in range(4):
            self.main_frame.grid_columnconfigure(i, weight=1)
            
        # ボタンの配置
        buttons = [
            ('C', 2, 0, 2), ('DEL', 2, 2, 1), ('/', 2, 3, 1),
            ('7', 3, 0, 1), ('8', 3, 1, 1), ('9', 3, 2, 1), ('*', 3, 3, 1),
            ('4', 4, 0, 1), ('5', 4, 1, 1), ('6', 4, 2, 1), ('-', 4, 3, 1),
            ('1', 5, 0, 1), ('2', 5, 1, 1), ('3', 5, 2, 1), ('+', 5, 3, 1),
            ('0', 6, 0, 2), ('.', 6, 2, 1), ('=', 6, 3, 1)
        ]
        
        self.btn_objects = []
        for btn in buttons:
            text, r, c, colspan = btn
            
            # 色の決定
            if text in ['/', '*', '-', '+', '=']:
                color = theme["op_btn"]
                text_color = "white" if self.current_theme == "original" else "#121722"
            elif text in ['C', 'DEL']:
                color = theme["clear_btn"]
                text_color = theme["clear_text"]
            else:
                color = theme["num_btn"]
                text_color = theme["num_text"]
                
            button = ctk.CTkButton(
                self.main_frame, 
                text=text, 
                font=theme["font"], 
                fg_color=color,
                text_color=text_color,
                corner_radius=theme["radius"],
                hover_color=color, # シンプルにするためhoverも同系色
                command=lambda t=text: self.on_button_click(t)
            )
            button.grid(row=r, column=c, columnspan=colspan, padx=3, pady=3, sticky="nsew")
            self.btn_objects.append(button)

    def toggle_theme(self):
        self.current_theme = "solid_square" if self.current_theme == "original" else "original"
        # 全体をクリアして再構築
        for widget in self.main_frame.winfo_children():
            widget.destroy()
        self.main_frame.destroy()
        self.setup_ui()

    def on_button_click(self, char):
        if char == 'C':
            self.expression = ""
            self.display_var.set("0")
        elif char == 'DEL':
            if self.display_var.get() == "Error":
                self.expression = ""
            self.expression = self.expression[:-1]
            self.display_var.set(self.expression if self.expression else "0")
        elif char == '=':
            try:
                result = str(eval(self.expression))
                if result.endswith('.0'):
                    result = result[:-2]
                self.display_var.set(result)
                self.expression = result
            except Exception:
                self.display_var.set("Error")
                self.expression = ""
        else:
            if self.display_var.get() == "Error":
                self.expression = ""
            self.expression += char
            self.display_var.set(self.expression)

if __name__ == "__main__":
    app = Calculator()
    app.mainloop()
