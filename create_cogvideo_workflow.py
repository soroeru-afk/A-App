import json

workflow_path = r"C:\StabilityMatrix\Data\Packages\comfyui\custom_nodes\ComfyUI-CogVideoXWrapper\example_workflows\cogvideox_1_0_5b_I2V_02.json"
output_path = r"G:\マイドライブ\00_AI-SEARCH\00_AIエージェント専用\💡_CogVideoX_5B_I2V_軽量ワークフロー.json"

with open(workflow_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

for node in data['nodes']:
    # 1. モデルローダーの精度設定を軽量な fp8_e4m3fn に変更して8GB VRAMに対応させる
    if node['type'] == 'DownloadAndLoadCogVideoModel' and node['id'] == 59:
        # widgets: ['THUDM/CogVideoX-5b-I2V', 'bf16', 'disabled', False, 'sdpa', 'main_device']
        node['widgets_values'][1] = 'bf16'              # precision (基本精度。'bf16' や 'fp16' 等を指定)
        node['widgets_values'][2] = 'fp8_e4m3fn'       # quantization (量子化。ここでfp8を指定)

    # 2. テキストエンコーダー（T5）の読み込み設定
    elif node['type'] == 'CLIPLoader' and node['id'] == 20:
        # すでにfp8版が指定されているのでそのまま
        pass

    # 3. テスト用のステップ数を一時的に下げて高速化 (元の50ステップ ➔ 25ステップに調整)
    elif node['type'] == 'CogVideoSampler' and node['id'] == 63:
        node['widgets_values'][1] = 25 # steps数

# 修正後のJSONを出力
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("[完了] CogVideoX-5B-I2V 量子化版ワークフローJSONを保存しました。")
