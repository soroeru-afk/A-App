import customtkinter as ctk

# ダークモードと色テーマの設定
ctk.set_appearance_mode("Dark")
ctk.set_default_color_theme("blue")

class Calculator(ctk.CTk):
    def __init__(self):
        super().__init__()
        
        self.title("計算機 (Calculator)")
        self.geometry("320x450")
        self.resizable(False, False)
        
        # 内部で保持する計算式
        self.expression = ""
        # 画面に表示する文字列
        self.display_var = ctk.StringVar(value="0")
        
        # ディスプレイ（結果表示部分）
        self.display = ctk.CTkEntry(self, textvariable=self.display_var, font=("Arial", 40), justify="right", state="readonly")
        self.display.grid(row=0, column=0, columnspan=4, padx=10, pady=20, sticky="nsew")
        
        # ウィンドウリサイズ時の挙動設定（均等に伸びるように）
        for i in range(1, 6):
            self.grid_rowconfigure(i, weight=1)
        for i in range(4):
            self.grid_columnconfigure(i, weight=1)
            
        # ボタンの配置 (テキスト, 行, 列, 列の結合数)
        buttons = [
            ('C', 1, 0, 2), ('DEL', 1, 2, 1), ('/', 1, 3, 1),
            ('7', 2, 0, 1), ('8', 2, 1, 1), ('9', 2, 2, 1), ('*', 2, 3, 1),
            ('4', 3, 0, 1), ('5', 3, 1, 1), ('6', 3, 2, 1), ('-', 3, 3, 1),
            ('1', 4, 0, 1), ('2', 4, 1, 1), ('3', 4, 2, 1), ('+', 4, 3, 1),
            ('0', 5, 0, 2), ('.', 5, 2, 1), ('=', 5, 3, 1)
        ]
        
        for btn in buttons:
            text = btn[0]
            r = btn[1]
            c = btn[2]
            colspan = btn[3]
            
            # ボタンの種類によって色を分ける
            color = ["#4a4a4a", "#3b3b3b"] # 通常の数字はダークグレー
            
            if text in ['/', '*', '-', '+', '=']:
                color = ["#ff9500", "#cc7700"] # 演算子はオレンジ
            elif text in ['C', 'DEL']:
                color = ["#a5a5a5", "#8c8c8c"] # クリア系はライトグレー
                
            text_color = "black" if text in ['C', 'DEL'] else "white"
                
            self.create_button(text, r, c, colspan, color, text_color)

    def create_button(self, text, row, col, colspan, color, text_color):
        button = ctk.CTkButton(self, text=text, font=("Arial", 24), 
                               fg_color=color[0], hover_color=color[1], text_color=text_color,
                               command=lambda t=text: self.on_button_click(t))
        button.grid(row=row, column=col, columnspan=colspan, padx=3, pady=3, sticky="nsew")

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
                # 文字列を評価して計算
                result = str(eval(self.expression))
                # .0 で終わる場合は小数点を削除して見やすくする
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
