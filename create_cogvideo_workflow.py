import json

workflow_path = r"C:\StabilityMatrix\Data\Packages\comfyui\custom_nodes\ComfyUI-CogVideoXWrapper\example_workflows\cogvideox_1_0_5b_I2V_02.json"
output_path = r"G:\マイドライブ\00_AI-SEARCH\00_AIエージェント専用\💡_CogVideoX_5B_I2V_軽量ワークフロー.json"

with open(workflow_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

for node in data['nodes']:
    # 1. モデルローダーの精度設定を軽量な fp8_e4m3fn に変更して8GB VRAMに対応させる
    if node['id'] == 59:
        node['type'] = 'DownloadAndLoadCogVideoGGUFModel'
        node['widgets_values'] = [
            'CogVideoX_5b_I2V_GGUF_Q4_0.safetensors', # model
            'bf16',                                    # vae_precision
            False,                                     # fp8_fastmode
            'offload_device',                          # load_device
            False,                                     # enable_sequential_cpu_offload (GGUFモデルのためオフに)
            'sdpa'                                     # attention_mode
        ]

    # 2. テキストエンコーダー（T5）の読み込み設定
    elif node['type'] == 'CLIPLoader' and node['id'] == 20:
        node['widgets_values'][0] = 'google_t5-v1_1-xxl_encoderonly-fp8_e4m3fn.safetensors'
        if len(node['widgets_values']) > 2:
            node['widgets_values'][2] = 'cpu'
        else:
            node['widgets_values'].append('cpu')

    # 3. テスト用のステップ数を一時的に下げて高速化 (元の50ステップ ➔ 25ステップに調整)
    elif node['type'] == 'CogVideoSampler' and node['id'] == 63:
        node['widgets_values'][1] = 25 # steps数

# 修正後のJSONを出力
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("[完了] CogVideoX-5B-I2V 量子化版ワークフローJSONを保存しました。")
