// ==UserScript==
// @name         Google AI Studio | 読み上げパネル (TTS)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  AI Studioのチャット画面（ms-chat-turn）をWeb Speech APIで読み上げ。各ターンに🔊ボタン、自動読み上げ、クリップボード読み上げにも対応。Trusted Types対応（innerHTML不使用）。
// @author       You
// @match        https://aistudio.google.com/*
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    // =========================================================
    // === 状態
    // =========================================================
    let voices         = [];
    let isReading       = false;
    let autoReadEnabled  = false;
    let lastAutoText     = '';
    let lastUrl           = location.href;
    let speechQueue       = [];
    let ttsGeneration     = 0;
    let activeBtn         = null;

    // =========================================================
    // === localStorage ラッパー
    // =========================================================
    function lsGet(key, def) {
        try { const v = localStorage.getItem(key); return v !== null ? v : def; } catch (e) { return def; }
    }
    function lsSet(key, val) {
        try { localStorage.setItem(key, val); } catch (e) {}
    }

    // =========================================================
    // === DOM構築ヘルパー（innerHTMLを一切使わない。Trusted Types対策）
    // =========================================================
    function mk(tag, opts, children) {
        opts = opts || {}; children = children || [];
        const e = document.createElement(tag);
        if (opts.id) e.id = opts.id;
        if (opts.className) e.className = opts.className;
        if (opts.type) e.type = opts.type;
        if (opts.style) e.style.cssText = opts.style;
        if (opts.text !== undefined) e.textContent = opts.text;
        if (opts.dataset) Object.keys(opts.dataset).forEach(k => { e.dataset[k] = opts.dataset[k]; });
        if (opts.attrs) Object.keys(opts.attrs).forEach(k => e.setAttribute(k, opts.attrs[k]));
        children.forEach(c => { if (c) e.appendChild(c); });
        return e;
    }
    function opt(text, value, selected) {
        const o = new Option(text, value);
        if (selected) o.selected = true;
        return o;
    }

    // =========================================================
    // === テーマ・フォント定義
    // =========================================================
    const THEMES = {
        light: { panel:'#ffffff', header:'#f1f3f4', headerText:'#3c4043', border:'#dadce0', content:'#ffffff', text:'#3c4043', subText:'#5f6368', inputBg:'#ffffff', inputBorder:'#dadce0', btn1Bg:'#1a73e8', btn1Text:'#ffffff', btn2Bg:'#f1f3f4', btn2Text:'#3c4043', btn2Border:'#dadce0', stopBg:'#ea4335', stopText:'#ffffff', tabActive:'#1a73e8', tabActiveTxt:'#ffffff', tabInactive:'#f1f3f4', tabInactiveTxt:'#5f6368', shadow:'0 2px 10px rgba(0,0,0,0.15)', infoBg:'#f8f9fa', infoBorder:'#e0e0e0' },
        dark:  { panel:'#1e1e2e', header:'#2d2d3f', headerText:'#cdd6f4', border:'#45475a', content:'#1e1e2e', text:'#cdd6f4', subText:'#a6adc8', inputBg:'#313244', inputBorder:'#45475a', btn1Bg:'#89b4fa', btn1Text:'#1e1e2e', btn2Bg:'#313244', btn2Text:'#cdd6f4', btn2Border:'#45475a', stopBg:'#f38ba8', stopText:'#1e1e2e', tabActive:'#89b4fa', tabActiveTxt:'#1e1e2e', tabInactive:'#313244', tabInactiveTxt:'#cdd6f4', shadow:'0 4px 20px rgba(0,0,0,0.5)', infoBg:'#313244', infoBorder:'#45475a' },
        pastel:{ panel:'#0a0a0a', header:'#111111', headerText:'#e0e0e0', border:'#2a2a2a', content:'#0a0a0a', text:'#d8d8d8', subText:'#c8c8c8', inputBg:'#1a1a1a', inputBorder:'#2a2a2a', btn1Bg:'#e0e0e0', btn1Text:'#0a0a0a', btn2Bg:'#1a1a1a', btn2Text:'#d8d8d8', btn2Border:'#2a2a2a', stopBg:'#444444', stopText:'#f0f0f0', tabActive:'#e0e0e0', tabActiveTxt:'#0a0a0a', tabInactive:'#1a1a1a', tabInactiveTxt:'#c8c8c8', shadow:'0 4px 24px rgba(0,0,0,0.8)', infoBg:'#111111', infoBorder:'#2a2a2a' },
        brown: { panel:'#3b2314', header:'#5c3317', headerText:'#f5deb3', border:'#7a4a28', content:'#3b2314', text:'#f5deb3', subText:'#d4a574', inputBg:'#4e2e17', inputBorder:'#7a4a28', btn1Bg:'#c8843a', btn1Text:'#ffffff', btn2Bg:'#4e2e17', btn2Text:'#f5deb3', btn2Border:'#7a4a28', stopBg:'#a0522d', stopText:'#ffffff', tabActive:'#c8843a', tabActiveTxt:'#ffffff', tabInactive:'#4e2e17', tabInactiveTxt:'#d4a574', shadow:'0 4px 20px rgba(0,0,0,0.5)', infoBg:'#4e2e17', infoBorder:'#7a4a28' },
        ocean: { panel:'#0f172a', header:'#1e3a5f', headerText:'#7dd3fc', border:'#1e40af', content:'#0f172a', text:'#e0f2fe', subText:'#7dd3fc', inputBg:'#1e293b', inputBorder:'#1e40af', btn1Bg:'#0ea5e9', btn1Text:'#ffffff', btn2Bg:'#1e293b', btn2Text:'#7dd3fc', btn2Border:'#1e40af', stopBg:'#f43f5e', stopText:'#ffffff', tabActive:'#0ea5e9', tabActiveTxt:'#ffffff', tabInactive:'#1e293b', tabInactiveTxt:'#7dd3fc', shadow:'0 4px 20px rgba(14,165,233,0.3)', infoBg:'#1e293b', infoBorder:'#1e40af' },
    };
    const FONTS = {
        mono:    { label:'Monospace',  css:"'Courier New',Consolas,monospace" },
        roboto:  { label:'Roboto',     css:"Roboto,Arial,sans-serif" },
        noto:    { label:'Noto Sans JP', css:"'Noto Sans JP','Hiragino Kaku Gothic ProN',sans-serif" },
        rounded: { label:'丸ゴシック', css:"'M PLUS Rounded 1c','Hiragino Maru Gothic Pro',sans-serif" },
    };
    function getTheme()    { return THEMES[lsGet('aist-tts-theme', 'dark')] || THEMES.dark; }
    function getThemeKey() { return lsGet('aist-tts-theme', 'dark'); }
    function getFont()     { return FONTS[lsGet('aist-tts-font', 'mono')] || FONTS.mono; }
    function getFontSize() { return parseInt(lsGet('aist-tts-font-size', '11')); }

    // =========================================================
    // === チャットターン検出・テキスト抽出
    // =========================================================
    const TURN_SELECTOR = 'ms-chat-turn';

    function getTurns() {
        return Array.from(document.querySelectorAll(TURN_SELECTOR));
    }

    // ターンからボタン・アイコン・コードブロック・「考え中」パネルなどを除いた読み上げ用テキストを抽出
    function extractTurnText(turn) {
        const clone = turn.cloneNode(true);
        clone.querySelectorAll(
            'button,[role="button"],svg,mat-icon,.material-symbols-outlined,' +
            'input,textarea,select,img,script,style,pre,code,' +
            'ms-chat-turn-options,.aist-tts-bar,' +
            '[class*="thought" i],[class*="thinking" i],[aria-label*="Thought" i]'
        ).forEach(e => e.remove());
        let text = (clone.innerText || clone.textContent || '').trim();
        text = text.replace(/\n{3,}/g, '\n\n').replace(/[ \t]{2,}/g, ' ');
        return text.trim();
    }

    // =========================================================
    // === speak（チャンク分割で長文に対応）
    // =========================================================
    function splitIntoChunks(text, maxLen) {
        maxLen = maxLen || 180;
        const sentences = text.split(/(?<=[。！？\n])/);
        const chunks = [];
        let cur = '';
        sentences.forEach(s => {
            if ((cur + s).length > maxLen && cur) { chunks.push(cur); cur = s; }
            else cur += s;
            while (cur.length > maxLen) { chunks.push(cur.slice(0, maxLen)); cur = cur.slice(maxLen); }
        });
        if (cur.trim()) chunks.push(cur);
        return chunks.filter(c => c.trim().length);
    }

    function applyVoiceSettings(utter) {
        const sel = document.getElementById('aist-tts-voice');
        const idx = sel ? parseInt(sel.value) : NaN;
        if (!isNaN(idx) && voices[idx]) { utter.voice = voices[idx]; utter.lang = voices[idx].lang || 'ja-JP'; }
        else utter.lang = 'ja-JP';
        utter.rate   = parseFloat(document.getElementById('aist-tts-speed')?.value || '1.2');
        utter.pitch  = parseFloat(document.getElementById('aist-tts-pitch')?.value || '1.0');
        utter.volume = parseFloat(document.getElementById('aist-tts-volume')?.value || '80') / 100;
    }

    function setActiveButton(btn) {
        if (activeBtn) { activeBtn.style.opacity = '1'; activeBtn.style.outline = 'none'; }
        activeBtn = btn || null;
        if (activeBtn) { activeBtn.style.opacity = '0.6'; activeBtn.style.outline = '2px solid currentColor'; }
    }

    function updateAutoStatus(s) { const el = document.getElementById('aist-tts-auto-status'); if (el) el.textContent = s; }

    function playNextChunk(gen) {
        if (gen !== ttsGeneration) return;
        if (!speechQueue.length) { isReading = false; setActiveButton(null); updateAutoStatus(autoReadEnabled ? '✓ 待機中' : ''); return; }
        const text = speechQueue.shift();
        const utter = new SpeechSynthesisUtterance(text);
        applyVoiceSettings(utter);
        utter.onend = utter.onerror = () => { if (gen === ttsGeneration) playNextChunk(gen); };
        window.speechSynthesis.speak(utter);
    }

    function speak(text, btn) {
        if (!text || !text.trim()) return;
        const chunks = splitIntoChunks(text.trim());
        if (!chunks.length) return;
        ttsGeneration++;
        const gen = ttsGeneration;
        window.speechSynthesis.cancel();
        speechQueue = chunks;
        isReading = true;
        setActiveButton(btn);
        // Firefoxはcancel直後のspeakをブロックすることがあるため少し待つ
        setTimeout(() => playNextChunk(gen), 150);
    }

    function stopSpeaking() {
        ttsGeneration++;
        window.speechSynthesis.cancel();
        speechQueue = [];
        isReading = false;
        setActiveButton(null);
        updateAutoStatus(autoReadEnabled ? '✓ 待機中' : '');
    }

    // =========================================================
    // === クリップボード読み上げ（フォールバック機能）
    // =========================================================
    async function readClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            if (!text || !text.trim()) { alert('クリップボードにテキストがありません。'); return; }
            speak(text, null);
        } catch (e) {
            alert('クリップボードの読み取りに失敗しました。\nブラウザがクリップボードへのアクセスを許可しているか確認してください。\n' + e.message);
        }
    }

    function readLatestTurn() {
        const turns = getTurns();
        if (!turns.length) { alert('チャットのターンが見つかりません。'); return; }
        const text = extractTurnText(turns[turns.length - 1]);
        if (!text) { alert('読み上げるテキストが見つかりません。'); return; }
        speak(text, null);
    }

    // =========================================================
    // === 各ターンに 🔊 / ⏹ ボタンを追加
    // =========================================================
    function styleTurnButton(b, bg, fg) {
        b.style.cssText = 'border:none;padding:5px 10px;border-radius:3px;cursor:pointer;font-weight:700;font-size:11px;letter-spacing:0.5px;box-shadow:0 1px 3px rgba(0,0,0,0.15);';
        b.style.background = bg; b.style.color = fg;
        b.onmouseover = () => b.style.opacity = '0.85';
        b.onmouseout  = () => { if (b !== activeBtn) b.style.opacity = '1'; };
    }

    function buildTurnBar(turn) {
        const t = getTheme();
        const playBtn = mk('button', { type: 'button', className: 'tts-play', text: '🔊 読み上げ' });
        styleTurnButton(playBtn, t.btn1Bg, t.btn1Text);
        const stopBtn = mk('button', { type: 'button', text: '⏹' });
        styleTurnButton(stopBtn, t.stopBg, t.stopText);
        playBtn.onclick = e => { e.stopPropagation(); speak(extractTurnText(turn), playBtn); };
        stopBtn.onclick = e => { e.stopPropagation(); stopSpeaking(); };
        return mk('div', { className: 'aist-tts-bar', style: 'margin-top:8px;display:flex;gap:6px;align-items:center;' }, [playBtn, stopBtn]);
    }

    function ensureTurnButtons() {
        getTurns().forEach(turn => {
            const existing = turn.querySelector(':scope > .aist-tts-bar');
            if (existing && existing.isConnected) return;
            const text = extractTurnText(turn);
            if (text.length < 2) return;
            if (existing) existing.remove();
            turn.appendChild(buildTurnBar(turn));
        });
    }

    function restyleTurnButtons() {
        const t = getTheme();
        document.querySelectorAll('.aist-tts-bar .tts-play').forEach(b => { b.style.background = t.btn1Bg; b.style.color = t.btn1Text; });
        document.querySelectorAll('.aist-tts-bar button:not(.tts-play)').forEach(b => { b.style.background = t.stopBg; b.style.color = t.stopText; });
    }

    // =========================================================
    // === 自動読み上げ（ストリーミング完了をテキスト安定性で判定）
    // =========================================================
    function checkAndAutoRead() {
        if (!autoReadEnabled || isReading) return;
        const turns = getTurns();
        if (!turns.length) return;
        const text = extractTurnText(turns[turns.length - 1]);
        if (text.length > 1 && text !== lastAutoText) {
            lastAutoText = text;
            updateAutoStatus('▶ 待機中(変化を監視)');
            setTimeout(() => {
                if (text === lastAutoText && autoReadEnabled && !isReading) {
                    updateAutoStatus('▶ 読み上げ中');
                    speak(text, null);
                }
            }, 900);
        }
    }

    // =========================================================
    // === スライダー等のCSS（GM_addStyleはtextContentベースなのでTrusted Types下でも安全）
    // =========================================================
    GM_addStyle(`
      #aist-tts-panel * { box-sizing: border-box !important; }
      #aist-tts-panel input[type="range"] { -webkit-appearance:none; appearance:none; height:3px; background:#b0b8c8; outline:none; border:none !important; cursor:pointer; width:100%; }
      #aist-tts-panel[data-dark="1"] input[type="range"] { background:#3a3f4b; }
      #aist-tts-panel input[type="range"]::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:11px; height:11px; border-radius:50%; background:var(--aist-accent,#7b8cde); cursor:pointer; border:none; }
      #aist-tts-panel input[type="range"]::-moz-range-thumb { width:11px; height:11px; border-radius:50%; background:var(--aist-accent,#7b8cde); cursor:pointer; border:none; }
      #aist-tts-panel button:active { opacity:0.7 !important; }
    `);

    // =========================================================
    // === パネルをDOM APIだけで構築（innerHTML不使用 = Trusted Types対応）
    // =========================================================
    function buildPanel() {
        // --- ヘッダー ---
        const headerLabel = mk('span', { text: '🔊 読み上げパネル', style: 'font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;' });
        const toggleBtn = mk('button', { id: 'aist-tts-toggle', type: 'button', text: '－', style: 'border:none;padding:0;width:24px;height:24px;cursor:pointer;font-size:15px;line-height:22px;text-align:center;' });
        const header = mk('div', { id: 'aist-tts-header', style: 'display:flex;justify-content:space-between;align-items:center;padding:9px 12px;cursor:move;' }, [headerLabel, toggleBtn]);

        // --- タブ ---
        const tabVoice = mk('button', { id: 'aist-tts-tab-voice', className: 'aist-tab-btn', type: 'button', text: '音声', dataset: { tab: 'voice' }, style: 'flex:1;padding:7px 2px;cursor:pointer;font-size:10px;font-weight:700;border:none;' });
        const tabTheme = mk('button', { id: 'aist-tts-tab-theme', className: 'aist-tab-btn', type: 'button', text: 'テーマ', dataset: { tab: 'theme' }, style: 'flex:1;padding:7px 2px;cursor:pointer;font-size:10px;font-weight:700;border:none;' });
        const tabs = mk('div', { id: 'aist-tts-tabs', style: 'display:flex;width:100%;' }, [tabVoice, tabTheme]);

        // --- 音声タブ ---
        const voiceLabel = mk('label', { className: 'aist-label', text: 'ボイス', style: 'display:block;margin-bottom:5px;font-size:9px;font-weight:700;letter-spacing:1px;' });
        const voiceSelect = mk('select', { id: 'aist-tts-voice', className: 'aist-input', style: 'width:100%;padding:5px 7px;font-size:11px;' }, [opt('読み込み中...', '')]);
        const voiceRow = mk('div', { style: 'padding:10px 12px;' }, [voiceLabel, voiceSelect]);

        function sliderRow(idBase, labelText, defVal, min, max, step) {
            const valSpan = mk('span', { id: 'aist-tts-' + idBase + '-val', text: String(defVal) });
            const label = mk('label', { className: 'aist-label', style: 'display:flex;justify-content:space-between;margin-bottom:5px;font-size:9px;font-weight:700;' }, [mk('span', { text: labelText }), valSpan]);
            const input = mk('input', { id: 'aist-tts-' + idBase, type: 'range', attrs: { min: String(min), max: String(max), step: String(step), value: String(defVal) } });
            return mk('div', { style: 'padding:8px 12px;' }, [label, input]);
        }
        const speedRow  = sliderRow('speed', '速度', 1.2, 0.5, 3.0, 0.1);
        const pitchRow  = sliderRow('pitch', '高さ', 1.0, 0.5, 2.0, 0.1);
        const volumeRow = sliderRow('volume', '音量', 80, 0, 100, 5);
        document.getElementById && null; // no-op (placeholder removed below)
        // 音量だけ末尾に%を付けたいので後でJS側のinput表示処理内で対応

        const autoCheckbox = mk('input', { id: 'aist-tts-auto', type: 'checkbox', style: 'cursor:pointer;width:13px;height:13px;' });
        const autoLabelSpan = mk('span', { className: 'aist-label', text: '自動読み上げ', style: 'font-weight:700;letter-spacing:1px;' });
        const autoStatusSpan = mk('span', { id: 'aist-tts-auto-status', style: 'margin-left:auto;font-size:9px;' });
        const autoRow = mk('div', { style: 'padding:8px 12px;' }, [
            mk('label', { id: 'aist-tts-auto-label', style: 'display:flex;align-items:center;gap:7px;font-size:10px;cursor:pointer;' }, [autoCheckbox, autoLabelSpan, autoStatusSpan])
        ]);

        const latestBtn    = mk('button', { id: 'aist-tts-latest', type: 'button', text: '🔊 最新の回答', style: 'padding:7px 4px;cursor:pointer;font-size:10px;font-weight:700;border:none;border-radius:3px;' });
        const clipboardBtn = mk('button', { id: 'aist-tts-clipboard', type: 'button', text: '📋 コピー文を読む', style: 'padding:7px 4px;cursor:pointer;font-size:10px;font-weight:700;border:none;border-radius:3px;' });
        const stopAllBtn   = mk('button', { id: 'aist-tts-stop-all', type: 'button', text: '■ 全停止', style: 'padding:7px 4px;cursor:pointer;font-size:10px;font-weight:700;border:none;border-radius:3px;' });
        const testBtn      = mk('button', { id: 'aist-tts-test', type: 'button', text: '▶ テスト', style: 'padding:7px 4px;cursor:pointer;font-size:10px;font-weight:700;border:none;border-radius:3px;' });
        const btnGrid = mk('div', { style: 'padding:8px 12px;display:grid;grid-template-columns:1fr 1fr;gap:6px;' }, [latestBtn, clipboardBtn, stopAllBtn, testBtn]);

        const infoBox = mk('div', {
            className: 'aist-info',
            text: '各回答の下にも🔊ボタンが表示されます。「コピー文を読む」はクリップボードにコピーした文章を読み上げます（初回はブラウザの許可が必要な場合があります）。',
            style: 'margin:10px 12px 12px;padding:7px 8px;font-size:9px;line-height:1.6;border-radius:3px;'
        });

        const voiceTabContent = mk('div', { id: 'aist-tts-tab-content-voice', className: 'aist-tab-content', style: 'display:block;' },
            [voiceRow, speedRow, pitchRow, volumeRow, autoRow, btnGrid, infoBox]);

        // --- テーマタブ ---
        const themeLabel = mk('div', { className: 'aist-label', text: 'テーマ', style: 'font-size:9px;font-weight:700;letter-spacing:1px;margin-bottom:7px;' });
        const themeDefs = [
            ['light', 'ライト',    '#e8ecf0', '#2e333d', '#ccc', false],
            ['dark', 'ダーク',     '#2d2d3f', '#cdd6f4', '#555', false],
            ['pastel', 'モノトーン', '#0a0a0a', '#e0e0e0', '#444', false],
            ['brown', 'ブラウン',   '#5c3317', '#f5deb3', '#7a4a28', false],
            ['ocean', 'オーシャン', '#1e3a5f', '#7dd3fc', '#1e40af', true],
        ];
        const themeButtons = themeDefs.map(([key, label, bg, fg, border, wide]) =>
            mk('button', {
                className: 'aist-theme-btn', type: 'button', text: label, dataset: { theme: key },
                style: 'padding:9px 4px;cursor:pointer;font-size:10px;font-weight:700;background:' + bg + ';color:' + fg + ';border:1px solid ' + border + ';border-radius:3px;' + (wide ? 'grid-column:span 2;' : '')
            })
        );
        const themeGrid = mk('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:6px;' }, themeButtons);
        const themeSection = mk('div', { style: 'padding:10px 12px;' }, [themeLabel, themeGrid]);

        const fontSel = mk('select', { id: 'aist-tts-font-sel', className: 'aist-input', style: 'width:100%;padding:5px 7px;font-size:11px;' }, [
            opt('Monospace', 'mono'), opt('Roboto', 'roboto'), opt('Noto Sans JP', 'noto'), opt('丸ゴシック', 'rounded')
        ]);
        const fontRow = mk('div', { style: 'padding:8px 12px;' }, [
            mk('label', { className: 'aist-label', text: 'パネルのフォント', style: 'display:block;margin-bottom:5px;font-size:9px;font-weight:700;' }), fontSel
        ]);

        const fsSel = mk('select', { id: 'aist-tts-fontsize-sel', className: 'aist-input', style: 'width:100%;padding:5px 7px;font-size:11px;' }, [
            opt('9px（小）', '9'), opt('10px', '10'), opt('11px（標準）', '11', true), opt('12px', '12'), opt('13px（大）', '13')
        ]);
        const fsRow = mk('div', { style: 'padding:8px 12px 12px;' }, [
            mk('label', { className: 'aist-label', text: '文字サイズ', style: 'display:block;margin-bottom:5px;font-size:9px;font-weight:700;' }), fsSel
        ]);

        const themeTabContent = mk('div', { id: 'aist-tts-tab-content-theme', className: 'aist-tab-content', style: 'display:none;' },
            [themeSection, fontRow, fsRow]);

        const content = mk('div', { id: 'aist-tts-content', style: 'display:block;' }, [tabs, voiceTabContent, themeTabContent]);

        const panel = mk('div', {
            id: 'aist-tts-panel',
            style: 'display:block;position:fixed;left:8px;top:8px;width:260px;border-radius:6px;padding:0;z-index:999999;user-select:none;overflow:hidden;box-sizing:border-box;'
        }, [header, content]);

        return panel;
    }

    // =========================================================
    // === テーマ適用
    // =========================================================
    function applyFontAll() {
        const panel = document.getElementById('aist-tts-panel');
        const f = getFont(), fs = getFontSize();
        if (panel) {
            panel.style.setProperty('font-family', f.css, 'important');
            panel.querySelectorAll('*').forEach(el => el.style.setProperty('font-family', f.css, 'important'));
            panel.style.setProperty('font-size', fs + 'px', 'important');
        }
    }

    function applyTheme() {
        const t = getTheme(), key = getThemeKey();
        const panel = document.getElementById('aist-tts-panel');
        if (!panel) return;
        const isDark = ['dark', 'brown', 'ocean', 'pastel'].includes(key);
        panel.setAttribute('data-dark', isDark ? '1' : '0');
        panel.style.setProperty('--aist-accent', t.btn1Bg);
        panel.style.background = t.panel;
        panel.style.border = '1px solid ' + t.border;
        panel.style.boxShadow = t.shadow;
        panel.style.color = t.text;

        const hdr = document.getElementById('aist-tts-header');
        if (hdr) { hdr.style.background = t.header; hdr.style.color = t.headerText; hdr.style.borderBottom = '1px solid ' + t.border; }

        const tog = document.getElementById('aist-tts-toggle');
        if (tog) { tog.style.background = t.tabInactive; tog.style.color = t.headerText; }

        const activeTab = lsGet('aist-tts-active-tab', 'voice');
        ['voice', 'theme'].forEach(tab => {
            const btn = document.getElementById('aist-tts-tab-' + tab);
            if (!btn) return;
            const on = tab === activeTab;
            btn.style.background = on ? t.tabActive : t.tabInactive;
            btn.style.color = on ? t.tabActiveTxt : t.tabInactiveTxt;
        });
        panel.querySelectorAll('.aist-tab-content').forEach(el => el.style.background = t.content);
        panel.querySelectorAll('.aist-label').forEach(el => el.style.color = t.subText);
        panel.querySelectorAll('.aist-input').forEach(el => { el.style.background = t.inputBg; el.style.border = '1px solid ' + t.inputBorder; el.style.color = t.text; });
        panel.querySelectorAll('.aist-info').forEach(el => { el.style.background = t.infoBg; el.style.border = '1px solid ' + t.infoBorder; el.style.color = t.subText; });

        const latest = document.getElementById('aist-tts-latest');
        if (latest) { latest.style.background = t.btn1Bg; latest.style.color = t.btn1Text; }
        const clip = document.getElementById('aist-tts-clipboard');
        if (clip) { clip.style.background = t.btn2Bg; clip.style.color = t.btn2Text; clip.style.border = '1px solid ' + t.btn2Border; }
        const stopAll = document.getElementById('aist-tts-stop-all');
        if (stopAll) { stopAll.style.background = t.stopBg; stopAll.style.color = t.stopText; }
        const test = document.getElementById('aist-tts-test');
        if (test) { test.style.background = t.btn2Bg; test.style.color = t.btn2Text; test.style.border = '1px solid ' + t.btn2Border; }

        panel.querySelectorAll('.aist-theme-btn').forEach(btn => {
            const on = btn.dataset.theme === key;
            btn.style.opacity = on ? '1' : '0.55';
            btn.style.outline = on ? '2px solid ' + t.btn1Bg : 'none';
        });

        restyleTurnButtons();
        applyFontAll();
    }

    function switchTab(tabName) {
        lsSet('aist-tts-active-tab', tabName);
        ['voice', 'theme'].forEach(t => {
            const c = document.getElementById('aist-tts-tab-content-' + t);
            if (c) c.style.display = t === tabName ? 'block' : 'none';
        });
        applyTheme();
    }

    // =========================================================
    // === パネル挿入・イベント設定
    // =========================================================
    function insertPanel() {
        if (document.getElementById('aist-tts-panel')) return;
        if (!document.body) { setTimeout(insertPanel, 300); return; }
        const panel = buildPanel();
        document.body.appendChild(panel);
        setupEvents();
        switchTab(lsGet('aist-tts-active-tab', 'voice'));
        applyTheme();
    }

    function setupEvents() {
        const panel = document.getElementById('aist-tts-panel');
        if (!panel) return;

        // 最小化トグル（位置・状態を記憶）
        const tog = document.getElementById('aist-tts-toggle');
        const cont = document.getElementById('aist-tts-content');
        let minimized = lsGet('aist-tts-minimized', 'false') === 'true';
        cont.style.display = minimized ? 'none' : 'block';
        tog.textContent = minimized ? '＋' : '－';
        tog.addEventListener('click', () => {
            minimized = !minimized;
            cont.style.display = minimized ? 'none' : 'block';
            tog.textContent = minimized ? '＋' : '－';
            lsSet('aist-tts-minimized', minimized);
        });

        // ドラッグ
        let drag = false, ox = 0, oy = 0;
        document.getElementById('aist-tts-header').addEventListener('mousedown', e => {
            if (e.target.tagName === 'BUTTON') return;
            drag = true;
            const r = panel.getBoundingClientRect();
            ox = e.clientX - r.left; oy = e.clientY - r.top; e.preventDefault();
        });
        document.addEventListener('mousemove', e => {
            if (!drag) return;
            panel.style.left = Math.max(0, Math.min(e.clientX - ox, window.innerWidth - panel.offsetWidth - 8)) + 'px';
            panel.style.top  = Math.max(0, Math.min(e.clientY - oy, window.innerHeight - panel.offsetHeight - 8)) + 'px';
        });
        document.addEventListener('mouseup', () => {
            if (drag) {
                drag = false;
                const r = panel.getBoundingClientRect();
                lsSet('aist-tts-pos-left', Math.round(r.left));
                lsSet('aist-tts-pos-top', Math.round(r.top));
            }
        });
        const savedLeft = lsGet('aist-tts-pos-left', null);
        const savedTop  = lsGet('aist-tts-pos-top', null);
        if (savedLeft !== null) panel.style.left = savedLeft + 'px';
        if (savedTop  !== null) panel.style.top  = savedTop + 'px';

        // タブ切り替え
        document.querySelectorAll('.aist-tab-btn').forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

        // テーマ
        document.querySelectorAll('.aist-theme-btn').forEach(btn => btn.addEventListener('click', () => { lsSet('aist-tts-theme', btn.dataset.theme); applyTheme(); }));

        // フォント
        const fontSel = document.getElementById('aist-tts-font-sel');
        fontSel.value = lsGet('aist-tts-font', 'mono');
        fontSel.addEventListener('change', e => { lsSet('aist-tts-font', e.target.value); applyTheme(); });
        const fsSel = document.getElementById('aist-tts-fontsize-sel');
        fsSel.value = lsGet('aist-tts-font-size', '11');
        fsSel.addEventListener('change', e => { lsSet('aist-tts-font-size', e.target.value); applyTheme(); });

        // ボイス読み込み（innerHTMLを使わずOption要素を追加）
        function loadVoices() {
            const all = window.speechSynthesis.getVoices();
            voices = all.filter(v => /ja|JP/i.test(v.lang));
            if (!voices.length) voices = all;
            const sel = document.getElementById('aist-tts-voice');
            if (!sel || !all.length) { setTimeout(loadVoices, 200); return; }
            while (sel.firstChild) sel.removeChild(sel.firstChild);
            voices.forEach((v, i) => sel.appendChild(new Option(v.name + ' (' + v.lang + ')', String(i))));
            const savedName = lsGet('aist-tts-voice-name', '');
            const idx = voices.findIndex(v => v.name === savedName);
            if (idx >= 0) sel.value = String(idx);
        }
        window.speechSynthesis.getVoices().length === 0
            ? (window.speechSynthesis.onvoiceschanged = loadVoices)
            : loadVoices();
        document.getElementById('aist-tts-voice').addEventListener('change', e => {
            const v = voices[e.target.value];
            lsSet('aist-tts-voice-name', v ? v.name : '');
        });

        // スライダー
        ['speed', 'pitch', 'volume'].forEach(key => {
            const inp = document.getElementById('aist-tts-' + key);
            const val = document.getElementById('aist-tts-' + key + '-val');
            inp.value = lsGet('aist-tts-' + key, inp.value);
            val.textContent = inp.value + (key === 'volume' ? '%' : '');
            inp.addEventListener('input', e => {
                val.textContent = e.target.value + (key === 'volume' ? '%' : '');
                lsSet('aist-tts-' + key, e.target.value);
            });
        });

        // 自動読み上げ
        const autoChk = document.getElementById('aist-tts-auto');
        autoChk.checked = lsGet('aist-tts-auto', 'false') === 'true';
        autoReadEnabled = autoChk.checked;
        updateAutoStatus(autoReadEnabled ? '✓ 有効' : '');
        autoChk.addEventListener('change', e => {
            autoReadEnabled = e.target.checked;
            lsSet('aist-tts-auto', e.target.checked);
            lastAutoText = '';
            updateAutoStatus(autoReadEnabled ? '✓ 有効' : '');
        });

        document.getElementById('aist-tts-stop-all').addEventListener('click', stopSpeaking);
        document.getElementById('aist-tts-test').addEventListener('click', () => speak('こんにちは。読み上げパネルのテストです。', null));
        document.getElementById('aist-tts-latest').addEventListener('click', readLatestTurn);
        document.getElementById('aist-tts-clipboard').addEventListener('click', readClipboard);
    }

    // =========================================================
    // === 初期化・SPAナビゲーション監視
    // =========================================================
    function runAll() {
        ensureTurnButtons();
        checkAndAutoRead();
    }

    function init() {
        if (!document.body) { setTimeout(init, 300); return; }
        insertPanel();
        setTimeout(runAll, 1000);

        let t = null;
        new MutationObserver(() => {
            if (t) clearTimeout(t);
            t = setTimeout(runAll, 400);
        }).observe(document.body, { childList: true, subtree: true });

        // チャット切り替え・ページ遷移時は読み上げを停止
        setInterval(() => {
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                lastAutoText = '';
                if (isReading) stopSpeaking();
            }
        }, 300);

        // 自動読み上げの安定性チェック（ストリーミング完了待ち）
        setInterval(checkAndAutoRead, 500);
    }

    document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', init)
        : setTimeout(init, 500);

})();
