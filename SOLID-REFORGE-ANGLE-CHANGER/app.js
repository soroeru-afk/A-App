// SOLID REFORGE ANGLE CHANGER - Core Logic

// 状態管理
const state = {
  webuiUrl: 'http://127.0.0.1:7860',
  poseImage: null,      // base64
  charAImage: null,     // base64
  charBImage: null,     // base64
  baseImage: null,      // base64 (Step 1の結果)
  step2Image: null,     // base64 (Step 2の結果)
  finalImage: null,     // base64 (Step 3の結果)
  isGenerating: false,
  controlNetModels: [], // APIから取得した正式なモデル名リスト
};

// DOM要素の取得
const elements = {
  webuiUrlInput: document.getElementById('webui-url'),
  btnCheckApi: document.getElementById('btn-check-api'),
  apiStatusBadge: document.getElementById('api-status-badge'),
  
  // 設定項目
  modelOpenpose: document.getElementById('model-openpose'),
  modelIpadapter: document.getElementById('model-ipadapter'),
  genWidth: document.getElementById('gen-width'),
  genHeight: document.getElementById('gen-height'),
  genSteps: document.getElementById('gen-steps'),
  genCfg: document.getElementById('gen-cfg'),
  genSampler: document.getElementById('gen-sampler'),
  inpaintDenoising: document.getElementById('inpaint-denoising'),
  denoisingVal: document.getElementById('denoising-val'),
  
  promptNegative: document.getElementById('prompt-negative'),
  promptBaseA: document.getElementById('prompt-base-a'),
  promptDetailA: document.getElementById('prompt-detail-a'),
  promptBaseB: document.getElementById('prompt-base-b'),
  promptDetailB: document.getElementById('prompt-detail-b'),
  
  // ファイルインプット & プレビュー
  filePose: document.getElementById('file-pose'),
  dropzonePose: document.getElementById('dropzone-pose'),
  prevPose: document.getElementById('prev-pose'),
  
  fileCharA: document.getElementById('file-char-a'),
  dropzoneCharA: document.getElementById('dropzone-char-a'),
  prevCharA: document.getElementById('prev-char-a'),
  
  fileCharB: document.getElementById('file-char-b'),
  dropzoneCharB: document.getElementById('dropzone-char-b'),
  prevCharB: document.getElementById('prev-char-b'),
  
  // 分割スライダー
  ratioSlider: document.getElementById('ratio-slider'),
  ratioLeftLabel: document.getElementById('ratio-left-label'),
  ratioRightLabel: document.getElementById('ratio-right-label'),
  
  // ボタン & ステータス
  btnStep1: document.getElementById('btn-step1'),
  step1Status: document.getElementById('step1-status'),
  step1Card: document.getElementById('step1-card'),
  
  btnStep2: document.getElementById('btn-step2'),
  step2Status: document.getElementById('step2-status'),
  step2Card: document.getElementById('step2-card'),
  
  btnStep3: document.getElementById('btn-step3'),
  step3Status: document.getElementById('step3-status'),
  step3Card: document.getElementById('step3-card'),
  
  btnAutoRun: document.getElementById('btn-auto-run'),
  btnSwap: document.getElementById('btn-swap'), // 追加
  
  // プレビュー & キャンバス
  mainPreview: document.getElementById('main-preview'),
  maskCanvas: document.getElementById('mask-canvas'),
  galleryContainer: document.getElementById('gallery-container'),
};

// 初期化
window.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  updateSliderRatio();
  const isOnline = await checkApiStatus();
  if (isOnline) {
    await fetchControlNetModels();
  }
});

// イベントリスナー設定
function setupEventListeners() {
  // API接続テスト
  elements.btnCheckApi.addEventListener('click', async () => {
    const isOnline = await checkApiStatus();
    if (isOnline) {
      await fetchControlNetModels();
    }
  });
  
  // デノイズ強度数値の同期
  elements.inpaintDenoising.addEventListener('input', (e) => {
    elements.denoisingVal.textContent = e.target.value;
  });

  // スライダーの制御
  elements.ratioSlider.addEventListener('input', () => {
    updateSliderRatio();
    if (state.baseImage) {
      drawMasks();
    }
  });

  // ファイル選択のセットアップ
  setupDropzone(elements.dropzonePose, elements.filePose, (base64) => {
    state.poseImage = base64;
    showPreview(elements.prevPose, base64);
  });
  
  setupDropzone(elements.dropzoneCharA, elements.fileCharA, (base64) => {
    state.charAImage = base64;
    showPreview(elements.prevCharA, base64);
  });
  
  setupDropzone(elements.dropzoneCharB, elements.fileCharB, (base64) => {
    state.charBImage = base64;
    showPreview(elements.prevCharB, base64);
  });

  // ステップ実行ボタン
  elements.btnStep1.addEventListener('click', runStep1);
  elements.btnStep2.addEventListener('click', runStep2);
  elements.btnStep3.addEventListener('click', runStep3);
  elements.btnAutoRun.addEventListener('click', runAllSteps);
  elements.btnSwap.addEventListener('click', swapCharacters); // 追加
}

// スライダーの割合表示更新
function updateSliderRatio() {
  const val = elements.ratioSlider.value;
  elements.ratioSlider.style.setProperty('--val', `${val}%`);
  elements.ratioLeftLabel.textContent = `${val}%`;
  elements.ratioRightLabel.textContent = `${100 - val}%`;
}

// ドロップゾーンの処理
function setupDropzone(dropzone, fileInput, callback) {
  dropzone.addEventListener('click', () => fileInput.click());
  
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--accent-active)';
  });
  
  dropzone.addEventListener('dragleave', () => {
    dropzone.style.borderColor = 'var(--border-color)';
  });
  
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--border-color)';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file, callback);
    }
  });
  
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file, callback);
    }
  });
}

function handleFile(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    callback(e.target.result.split(',')[1]);
  };
  reader.readAsDataURL(file);
}

function showPreview(imgElement, base64) {
  imgElement.src = `data:image/png;base64,${base64}`;
  imgElement.style.display = 'block';
  const p = imgElement.previousElementSibling.previousElementSibling;
  if (p && p.tagName === 'P') p.style.display = 'none';
}

// API接続テスト
async function checkApiStatus() {
  state.webuiUrl = elements.webuiUrlInput.value.trim();
  elements.apiStatusBadge.textContent = 'CHECKING...';
  elements.apiStatusBadge.className = 'badge badge-offline';
  
  try {
    const response = await fetch('/api/proxy/get', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl: `${state.webuiUrl}/sdapi/v1/samplers` })
    });
    
    if (response.ok) {
      elements.apiStatusBadge.textContent = 'ONLINE';
      elements.apiStatusBadge.className = 'badge badge-online';
      return true;
    }
  } catch (error) {
    console.error('API Connection Error:', error);
  }
  
  elements.apiStatusBadge.textContent = 'OFFLINE';
  elements.apiStatusBadge.className = 'badge badge-offline';
  return false;
}

// ControlNetモデルリストの取得
async function fetchControlNetModels() {
  try {
    const response = await fetch('/api/proxy/get', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl: `${state.webuiUrl}/controlnet/model_list` })
    });
    if (response.ok) {
      const data = await response.json();
      state.controlNetModels = data.model_list || [];
      console.log('Loaded ControlNet Models:', state.controlNetModels);
    }
  } catch (e) {
    console.error('Failed to load ControlNet models:', e);
  }
}

// モデル名の自動補完ロジック (部分一致から正式なハッシュ付きモデル名へ置換)
function getFullModelName(inputName) {
  if (!inputName) return '';
  const searchName = inputName.toLowerCase().trim();
  
  const match = state.controlNetModels.find(m => m.toLowerCase().includes(searchName));
  if (match) {
    console.log(`Auto-completed Model Name: "${inputName}" -> "${match}"`);
    return match;
  }
  
  return inputName;
}

// マスク画像の自動描画 (Canvas処理)
function generateMask(side) {
  const width = parseInt(elements.genWidth.value) || 512;
  const height = parseInt(elements.genHeight.value) || 768;
  const ratio = parseInt(elements.ratioSlider.value) / 100;
  
  elements.maskCanvas.width = width;
  elements.maskCanvas.height = height;
  const ctx = elements.maskCanvas.getContext('2d');
  
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);
  
  ctx.fillStyle = '#FFFFFF';
  const boundary = Math.round(width * ratio);
  
  if (side === 'left') {
    ctx.fillRect(0, 0, boundary, height);
  } else {
    ctx.fillRect(boundary, 0, width - boundary, height);
  }
  
  return elements.maskCanvas.toDataURL('image/png').split(',')[1];
}

function drawMasks() {
  generateMask('left');
}

// プロキシ経由でAPIリクエストを送信
async function sendApiRequest(endpoint, payload) {
  const response = await fetch('/api/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      targetUrl: `${state.webuiUrl}${endpoint}`,
      payload: payload
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'API Request failed');
  }
  
  return await response.json();
}

// ギャラリーへの履歴追加
function addToGallery(title, base64) {
  const item = document.createElement('div');
  item.className = 'gallery-item';
  
  const img = document.createElement('img');
  img.src = `data:image/png;base64,${base64}`;
  
  const label = document.createElement('div');
  label.className = 'gallery-label';
  label.textContent = title;
  
  item.appendChild(img);
  item.appendChild(label);
  
  item.addEventListener('click', () => {
    elements.mainPreview.src = img.src;
  });
  
  elements.galleryContainer.appendChild(item);
}

function setStepStatus(stepNum, status, message) {
  const card = document.getElementById(`step${stepNum}-card`);
  const statusEl = document.getElementById(`step${stepNum}-status`);
  
  card.className = `step-card status-${status}`;
  statusEl.textContent = message;
}

// Step 1: ベース画像生成 (txt2img)
async function runStep1() {
  if (state.isGenerating) return;
  if (!state.poseImage) {
    alert('ポーズ用の骨格画像をアップロードしてください。');
    return;
  }
  
  state.isGenerating = true;
  setStepStatus(1, 'running', 'GENERATING BASE...');
  elements.btnStep1.disabled = true;
  elements.btnAutoRun.disabled = true;
  
  const width = parseInt(elements.genWidth.value);
  const height = parseInt(elements.genHeight.value);
  const ratioVal = parseInt(elements.ratioSlider.value);
  
  const promptA = elements.promptBaseA.value.trim();
  const promptB = elements.promptBaseB.value.trim();
  const combinedPrompt = `${promptA} BREAK ${promptB}`;
  
  const openposeModel = getFullModelName(elements.modelOpenpose.value.trim());
  
  // Forge/reForge ControlNet 正式仕様オブジェクト
  const controlNetArgs = [
    {
      enabled: true,
      image: state.poseImage,
      model: openposeModel,
      module: 'none',
      weight: 1.0,
      resize_mode: 'Crop and Resize',
      control_mode: 'Balanced',
      pixel_perfect: true,
      guidance_start: 0,
      guidance_end: 1,
      processor_res: 512,
      threshold_a: 64,
      threshold_b: 64
    }
  ];

  const regionalPrompterArgs = [
    true,
    false,
    "Matrix",
    "Columns",
    "Mask",
    "Prompt",
    `${ratioVal / 10},${(100 - ratioVal) / 10}`,
    "0",
    false,
    true,
    false,
    "Attention",
    [],
    "0",
    "0",
    "0.4",
    null,
    "0",
    "0",
    false
  ];

  const payload = {
    prompt: combinedPrompt,
    negative_prompt: elements.promptNegative.value,
    sampler_name: elements.genSampler.value,
    steps: parseInt(elements.genSteps.value),
    cfg_scale: parseFloat(elements.genCfg.value),
    width: width,
    height: height,
    seed: -1,
    alwayson_scripts: {
      "ControlNet": { // 大文字「ControlNet」に統一
        "args": controlNetArgs
      },
      "regional prompter": {
        "args": regionalPrompterArgs
      },
      "Regional Prompter": {
        "args": regionalPrompterArgs
      }
    }
  };

  try {
    const result = await sendApiRequest('/sdapi/v1/txt2img', payload);
    if (result.images && result.images.length > 0) {
      state.baseImage = result.images[0];
      elements.mainPreview.src = `data:image/png;base64,${state.baseImage}`;
      addToGallery('BASE (Step 1)', state.baseImage);
      
      setStepStatus(1, 'success', 'COMPLETED');
      elements.btnStep2.disabled = false;
      drawMasks();
    } else {
      throw new Error('No images returned from API');
    }
  } catch (error) {
    console.error(error);
    setStepStatus(1, 'error', 'FAILED');
    alert(`Step 1 生成エラー: ${error.message}`);
  } finally {
    state.isGenerating = false;
    elements.btnStep1.disabled = false;
    elements.btnAutoRun.disabled = false;
  }
}

// Step 2: 人物A特徴転写 (img2img Inpaint)
async function runStep2() {
  if (state.isGenerating) return;
  if (!state.baseImage) {
    alert('先にStep 1を実行してベース画像を生成してください。');
    return;
  }
  if (!state.charAImage) {
    alert('人物Aの元画像をアップロードしてください。');
    return;
  }

  state.isGenerating = true;
  setStepStatus(2, 'running', 'INPAINTING CHAR A...');
  elements.btnStep2.disabled = true;
  elements.btnAutoRun.disabled = true;

  const maskBase64 = generateMask('left');
  const ipAdapterModel = getFullModelName(elements.modelIpadapter.value.trim());
  
  // Forge/reForge ControlNet 正式仕様オブジェクト
  const controlNetArgs = [
    {
      enabled: true,
      image: state.charAImage,
      model: ipAdapterModel,
      module: 'CLIP-ViT-H (IPAdapter)',
      weight: 1.0,
      resize_mode: 'Crop and Resize',
      control_mode: 'Balanced',
      pixel_perfect: true,
      guidance_start: 0,
      guidance_end: 1,
      processor_res: 512,
      threshold_a: 64,
      threshold_b: 64
    }
  ];

  const payload = {
    init_images: [state.baseImage],
    mask: maskBase64,
    mask_blur: 4,
    inpainting_fill: 1,
    inpaint_full_res: false,
    inpaint_full_res_padding: 32,
    inpainting_mask_invert: 0,
    
    prompt: elements.promptDetailA.value,
    negative_prompt: elements.promptNegative.value,
    sampler_name: elements.genSampler.value,
    steps: parseInt(elements.genSteps.value),
    cfg_scale: parseFloat(elements.genCfg.value),
    denoising_strength: parseFloat(elements.inpaintDenoising.value),
    width: parseInt(elements.genWidth.value),
    height: parseInt(elements.genHeight.value),
    seed: -1,
    alwayson_scripts: {
      "ControlNet": { // 大文字「ControlNet」に統一
        "args": controlNetArgs
      }
    }
  };

  try {
    const result = await sendApiRequest('/sdapi/v1/img2img', payload);
    if (result.images && result.images.length > 0) {
      state.step2Image = result.images[0];
      elements.mainPreview.src = `data:image/png;base64,${state.step2Image}`;
      addToGallery('CHAR A (Step 2)', state.step2Image);
      
      setStepStatus(2, 'success', 'COMPLETED');
      elements.btnStep3.disabled = false;
      generateMask('right');
    } else {
      throw new Error('No images returned from API');
    }
  } catch (error) {
    console.error(error);
    setStepStatus(2, 'error', 'FAILED');
    alert(`Step 2 特徴転写エラー: ${error.message}`);
  } finally {
    state.isGenerating = false;
    elements.btnStep2.disabled = false;
    elements.btnAutoRun.disabled = false;
  }
}

// Step 3: 人物B特徴転写 (img2img Inpaint)
async function runStep3() {
  if (state.isGenerating) return;
  if (!state.step2Image) {
    alert('先にStep 2を実行してください。');
    return;
  }
  if (!state.charBImage) {
    alert('人物Bの元画像をアップロードしてください。');
    return;
  }

  state.isGenerating = true;
  setStepStatus(3, 'running', 'INPAINTING CHAR B...');
  elements.btnStep3.disabled = true;
  elements.btnAutoRun.disabled = true;

  const maskBase64 = generateMask('right');
  const ipAdapterModel = getFullModelName(elements.modelIpadapter.value.trim());
  
  // Forge/reForge ControlNet 正式仕様オブジェクト
  const controlNetArgs = [
    {
      enabled: true,
      image: state.charBImage,
      model: ipAdapterModel,
      module: 'CLIP-ViT-H (IPAdapter)',
      weight: 1.0,
      resize_mode: 'Crop and Resize',
      control_mode: 'Balanced',
      pixel_perfect: true,
      guidance_start: 0,
      guidance_end: 1,
      processor_res: 512,
      threshold_a: 64,
      threshold_b: 64
    }
  ];

  const payload = {
    init_images: [state.step2Image],
    mask: maskBase64,
    mask_blur: 4,
    inpainting_fill: 1,
    inpaint_full_res: false,
    inpaint_full_res_padding: 32,
    inpainting_mask_invert: 0,
    
    prompt: elements.promptDetailB.value,
    negative_prompt: elements.promptNegative.value,
    sampler_name: elements.genSampler.value,
    steps: parseInt(elements.genSteps.value),
    cfg_scale: parseFloat(elements.genCfg.value),
    denoising_strength: parseFloat(elements.inpaintDenoising.value),
    width: parseInt(elements.genWidth.value),
    height: parseInt(elements.genHeight.value),
    seed: -1,
    alwayson_scripts: {
      "ControlNet": { // 大文字「ControlNet」に統一
        "args": controlNetArgs
      }
    }
  };

  try {
    const result = await sendApiRequest('/sdapi/v1/img2img', payload);
    if (result.images && result.images.length > 0) {
      state.finalImage = result.images[0];
      elements.mainPreview.src = `data:image/png;base64,${state.finalImage}`;
      addToGallery('FINAL (Step 3)', state.finalImage);
      
      setStepStatus(3, 'success', 'COMPLETED');
    } else {
      throw new Error('No images returned from API');
    }
  } catch (error) {
    console.error(error);
    setStepStatus(3, 'error', 'FAILED');
    alert(`Step 3 特徴転写エラー: ${error.message}`);
  } finally {
    state.isGenerating = false;
    elements.btnStep3.disabled = false;
    elements.btnAutoRun.disabled = false;
  }
}

// 全ステップを一括自動実行
async function runAllSteps() {
  if (state.isGenerating) return;
  if (!state.poseImage || !state.charAImage || !state.charBImage) {
    alert('骨格画像、人物A元画像、人物B元画像のすべての画像をアップロードしてください。');
    return;
  }

  try {
    const isOnline = await checkApiStatus();
    if (!isOnline) {
      if (!confirm('SD WebUI APIがオフラインの可能性があります。実行を続けますか？')) {
        return;
      }
    }

    await fetchControlNetModels();

    // Step 1
    await runStep1();
    if (!state.baseImage) return;

    await sleep(2000);

    // Step 2
    await runStep2();
    if (!state.step2Image) return;

    await sleep(2000);

    // Step 3
    await runStep3();

  } catch (error) {
    console.error('Auto Run Pipeline failed:', error);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 左右のキャラクター（画像・プロンプト）を一発でスワップする
function swapCharacters() {
  // 画像(base64)の交換
  const tempImgA = state.charAImage;
  state.charAImage = state.charBImage;
  state.charBImage = tempImgA;

  // プレビュー表示の交換
  const srcA = elements.prevCharA.src;
  const displayA = elements.prevCharA.style.display;
  
  elements.prevCharA.src = elements.prevCharB.src;
  elements.prevCharA.style.display = elements.prevCharB.style.display;
  
  elements.prevCharB.src = srcA;
  elements.prevCharB.style.display = displayA;

  // プレースホルダ（Pタグ）の表示調整
  const pA = elements.dropzoneCharA.querySelector('p');
  const pB = elements.dropzoneCharB.querySelector('p');
  if (pA) pA.style.display = state.charAImage ? 'none' : 'block';
  if (pB) pB.style.display = state.charBImage ? 'none' : 'block';

  // 簡易プロンプトの交換
  const tempBase = elements.promptBaseA.value;
  elements.promptBaseA.value = elements.promptBaseB.value;
  elements.promptBaseB.value = tempBase;

  // 特徴プロンプトの交換
  const tempDetail = elements.promptDetailA.value;
  elements.promptDetailA.value = elements.promptDetailB.value;
  elements.promptDetailB.value = tempDetail;

  console.log('Successfully swapped Character A and Character B inputs.');
}

