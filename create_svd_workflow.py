import json

workflow = {
  "last_node_id": 6,
  "last_link_id": 6,
  "nodes": [
    {
      "id": 1,
      "type": "ImageOnlyCheckpointLoader",
      "pos": [10, 10],
      "size": [350, 100],
      "flags": {},
      "order": 0,
      "mode": 0,
      "outputs": [
        {"name": "MODEL", "type": "MODEL", "links": [1]},
        {"name": "CLIP", "type": "CLIP", "links": [2]},
        {"name": "VAE", "type": "VAE", "links": [3, 6]}
      ],
      "properties": {},
      "widgets_values": ["svd_xt.safetensors"]
    },
    {
      "id": 2,
      "type": "LoadImage",
      "pos": [10, 200],
      "size": [350, 300],
      "flags": {},
      "order": 1,
      "mode": 0,
      "outputs": [
        {"name": "IMAGE", "type": "IMAGE", "links": [4]}
      ],
      "properties": {},
      "widgets_values": ["sd3stag.png", "image"]
    },
    {
      "id": 3,
      "type": "SVD_img2vid_Conditioning",
      "pos": [400, 10],
      "size": [350, 220],
      "flags": {},
      "order": 2,
      "mode": 0,
      "inputs": [
        {"name": "clip", "type": "CLIP", "link": 2},
        {"name": "init_image", "type": "IMAGE", "link": 4},
        {"name": "vae", "type": "VAE", "link": 3}
      ],
      "outputs": [
        {"name": "positive", "type": "CONDITIONING", "links": [7]},
        {"name": "negative", "type": "CONDITIONING", "links": [8]},
        {"name": "latent", "type": "LATENT", "links": [9]}
      ],
      "properties": {},
      "widgets_values": [1024, 576, 25, 127, 6, 0.0]
    },
    {
      "id": 4,
      "type": "KSampler",
      "pos": [800, 10],
      "size": [350, 380],
      "flags": {},
      "order": 3,
      "mode": 0,
      "inputs": [
        {"name": "model", "type": "MODEL", "link": 1},
        {"name": "positive", "type": "CONDITIONING", "link": 7},
        {"name": "negative", "type": "CONDITIONING", "link": 8},
        {"name": "latent_image", "type": "LATENT", "link": 9}
      ],
      "outputs": [
        {"name": "LATENT", "type": "LATENT", "links": [5]}
      ],
      "properties": {},
      "widgets_values": [0, "randomize", 20, 2.5, "euler", "karras", 1.0]
    },
    {
      "id": 5,
      "type": "VAEDecode",
      "pos": [1200, 10],
      "size": [210, 100],
      "flags": {},
      "order": 4,
      "mode": 0,
      "inputs": [
        {"name": "samples", "type": "LATENT", "link": 5},
        {"name": "vae", "type": "VAE", "link": 6}
      ],
      "outputs": [
        {"name": "IMAGE", "type": "IMAGE", "links": [10]}
      ],
      "properties": {}
    },
    {
      "id": 6,
      "type": "VHS_VideoCombine",
      "pos": [1450, 10],
      "size": [400, 300],
      "flags": {},
      "order": 5,
      "mode": 0,
      "inputs": [
        {"name": "images", "type": "IMAGE", "link": 10}
      ],
      "outputs": [
        {"name": "Filenames", "type": "VHS_FILENAMES", "links": None}
      ],
      "properties": {},
      "widgets_values": {
        "frame_rate": 6,
        "loop_count": 0,
        "filename_prefix": "SVD-I2V",
        "format": "video/h264-mp4",
        "pix_fmt": "yuv420p",
        "crf": 19,
        "save_metadata": True,
        "trim_to_audio": False,
        "pingpong": False,
        "save_output": True,
        "videopreview": {"hidden": False, "paused": False, "muted": False}
      }
    }
  ],
  "links": [
    [1, 1, 0, 4, 0, "MODEL"],
    [2, 1, 1, 3, 0, "CLIP"],
    [3, 1, 2, 3, 2, "VAE"],
    [4, 2, 0, 3, 1, "IMAGE"],
    [5, 4, 0, 5, 0, "LATENT"],
    [6, 1, 2, 5, 1, "VAE"],
    [7, 3, 0, 4, 1, "CONDITIONING"],
    [8, 3, 1, 4, 2, "CONDITIONING"],
    [9, 3, 2, 4, 3, "LATENT"],
    [10, 5, 0, 6, 0, "IMAGE"]
  ],
  "groups": [],
  "config": {},
  "extra": {},
  "version": 0.4
}

output_path = r"G:\マイドライブ\00_AI-SEARCH\00_AIエージェント専用\💡_SVD_軽量動画生成ワークフロー.json"

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(workflow, f, ensure_ascii=False, indent=2)

print("[完了] Stable Video Diffusion (SVD) 軽量ワークフローを保存しました。")
