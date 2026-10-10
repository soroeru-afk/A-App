import React, { useState } from 'react';
import { Theme, Language, PreferredPlayer, ConnectionStatus } from '../types';
import { t } from '../translations';
import { HelpCircle, MonitorPlay, Download, Terminal, CheckCircle2, AlertTriangle } from 'lucide-react';
import { downloadLauncherBatch, downloadSetupVbs, downloadRegistryFile } from '../utils/playerLauncher';

interface SystemControlProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
  preferredPlayer: PreferredPlayer;
  onPlayerChange: (player: PreferredPlayer) => void;
  connectionStatus: ConnectionStatus;
  detectedPlayers: { potplayer?: boolean; kmplayer?: boolean };
  onRefreshConnection: () => void;
  listSize: number;
  onListSizeChange: (size: number) => void;
  titleSize: number;
  onTitleSizeChange: (size: number) => void;
  onClearAllVideos: () => void;
  onExportDb: () => void;
  onImportDb: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SystemControl({
  theme,
  onThemeChange,
  lang,
  onLangChange,
  preferredPlayer,
  onPlayerChange,
  connectionStatus,
  detectedPlayers,
  onRefreshConnection,
  listSize,
  onListSizeChange,
  titleSize,
  onTitleSizeChange,
  onClearAllVideos,
  onExportDb,
  onImportDb,
}: SystemControlProps) {
  const txt = t(lang).systemControl;
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  React.useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowGuideModal(true);
    }
  };

  const handleDownloadBatch = () => {
    downloadLauncherBatch();
    setDownloadNotice('「solid_movie_launcher.bat」をダウンロードしました。');
    setTimeout(() => setDownloadNotice(null), 5000);
  };

  const handleDownloadVbs = () => {
    downloadSetupVbs();
    setDownloadNotice('「setup_kmplayer.vbs」をダウンロードしました。ダブルクリックするだけでKMPlayer直結登録が完了します。');
    setTimeout(() => setDownloadNotice(null), 8000);
  };

  return (
    <section className="mb-3 font-mono">
      {/* Top status bar */}
      <div className="text-[10px] text-text-dim mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>01</span>
          <span className="font-bold text-text-bright uppercase tracking-wider">{txt.title}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* PWA スタートメニュー登録ボタン */}
          {!isInstalled && (
            <button
              onClick={handleInstallPwa}
              className="flex items-center gap-1 text-[10px] text-text-bright hover:bg-border-light border border-border-light px-2 py-0.5 bg-panel-bg shadow-sm"
              title="ブラウザからスタートメニューやタスクバーにSOLIDシリーズのアプリアイコンとして登録します"
            >
              <span>💻 スタートメニュー登録 (PWA)</span>
            </button>
          )}

          {/* 設定方法 */}
          <button
            onClick={() => setShowGuideModal(true)}
            className="flex items-center gap-1 text-[10px] text-text-normal hover:text-text-bright border border-border-main px-2 py-0.5 bg-panel-bg"
          >
            <span>⚙ 設定方法</span>
          </button>

          {/* 直結モード表示 */}
          <div 
            onClick={() => setShowGuideModal(true)}
            className="flex items-center gap-1.5 cursor-pointer hover:opacity-90 bg-panel-bg px-2 py-0.5 border border-border-main"
            title="KM / PotPlayer 直結モード (クリックで詳細)"
          >
            <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-[10px] text-text-normal font-bold">
              KM / PotPlayer 直結モード
            </span>
          </div>

          {/* 映画全クリア (カテゴリ保持) */}
          {showClearConfirm ? (
            <div className="flex items-center gap-1 bg-red-950/70 border border-red-700 px-2 py-0.5 text-[10px]">
              <span className="text-red-300 font-bold">全削除しますか？</span>
              <button
                onClick={() => {
                  onClearAllVideos();
                  setShowClearConfirm(false);
                }}
                className="bg-red-600 text-white px-1.5 py-0.2 hover:bg-red-700 font-bold"
              >
                はい
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="text-text-dim hover:text-white px-1"
              >
                取消
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 border border-red-900/60 hover:border-red-600 px-2 py-0.5 bg-panel-bg transition-colors"
              title="登録された映画リストのみを全消去します（カテゴリはそのまま残ります）"
            >
              <span>⟲ 映画全クリア (カテゴリ保持)</span>
            </button>
          )}

          {/* ヘルプ */}
          <button
            onClick={() => setShowGuideModal(true)}
            className="flex items-center gap-1 text-[10px] text-text-dim hover:text-text-bright border border-border-main px-2 py-0.5 bg-panel-bg"
          >
            <HelpCircle size={10} />
            <span>ヘルプ</span>
          </button>
        </div>
      </div>

      {downloadNotice && (
        <div className="mb-2 p-1.5 bg-blue-950/60 border border-blue-600 text-blue-200 text-xs flex items-center gap-2 animate-fade-in">
          <Terminal size={13} className="text-blue-400 shrink-0" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Main control line */}
      <div className="border border-border-main bg-panel-bg p-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Player Target */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-dim font-bold tracking-wider">TARGET PLAYER:</span>
          <div className="flex bg-base-bg p-0.5 border border-border-main">
            {(['kmplayer', 'potplayer', 'auto'] as PreferredPlayer[]).map((p) => {
              const isActive = preferredPlayer === p;
              const label = p === 'auto' ? 'AUTO' : p === 'potplayer' ? 'PotPlayer' : 'KMPlayer';
              return (
                <button
                  key={p}
                  onClick={() => onPlayerChange(p)}
                  className={`px-2 py-0.5 text-[10px] font-mono transition-colors ${
                    isActive 
                      ? 'bg-border-light text-text-bright font-bold' 
                      : 'text-text-dim hover:text-text-normal'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: LIST SIZE & TITLE SIZE Sliders */}
        <div className="flex items-center gap-4">
          {/* List Size */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-dim font-bold">LIST SIZE</span>
            <input
              type="range"
              min={11}
              max={22}
              value={listSize}
              onChange={(e) => onListSizeChange(Number(e.target.value))}
              className="w-16 h-1 bg-border-main rounded appearance-none cursor-pointer accent-text-bright"
            />
            <span className="text-[10px] text-text-bright font-bold w-7 text-right">{listSize}PX</span>
          </div>

          {/* Title Size */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-dim font-bold">TITLE SIZE</span>
            <input
              type="range"
              min={12}
              max={24}
              value={titleSize}
              onChange={(e) => onTitleSizeChange(Number(e.target.value))}
              className="w-16 h-1 bg-border-main rounded appearance-none cursor-pointer accent-text-bright"
            />
            <span className="text-[10px] text-text-bright font-bold w-7 text-right">{titleSize}PX</span>
          </div>
        </div>

        {/* Right: Sync & Lang & Theme */}
        <div className="flex items-center gap-2">
          {/* DB Export / Import (Google Drive sync for PC1 & PC2) */}
          <div className="flex items-center gap-1 border border-border-main p-0.5 bg-base-bg">
            <button
              onClick={onExportDb}
              className="px-1.5 py-0.5 text-[9px] text-text-dim hover:text-text-bright transition-colors"
              title="PC1号機・2号機で共有できるJSONバックアップファイルを出力します"
            >
              💾 DB書出
            </button>
            <span className="text-border-main">|</span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-1.5 py-0.5 text-[9px] text-text-dim hover:text-text-bright transition-colors"
              title="JSONファイルを読み込んで映画・カテゴリデータを一瞬で同期します"
            >
              📂 DB読込
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={onImportDb}
              accept=".json"
              className="hidden"
            />
          </div>

          <div className="w-[1px] h-3 bg-border-main" />

          {/* Language Switch */}
          <div className="flex bg-base-bg p-0.5 border border-border-main">
            <button
              onClick={() => onLangChange('ja')}
              className={`px-1.5 py-0.5 text-[10px] font-bold transition-colors ${
                lang === 'ja' ? 'bg-text-bright text-base-bg' : 'text-text-dim hover:text-text-normal'
              }`}
            >
              JP
            </button>
            <button
              onClick={() => onLangChange('en')}
              className={`px-1.5 py-0.5 text-[10px] font-bold transition-colors ${
                lang === 'en' ? 'bg-text-bright text-base-bg' : 'text-text-dim hover:text-text-normal'
              }`}
            >
              EN
            </button>
          </div>

          {/* Theme Switch */}
          <div className="flex items-center gap-1">
            {(['onyxblack', 'paperlight'] as Theme[]).map((thm) => (
              <button
                key={thm}
                onClick={() => onThemeChange(thm)}
                className={`px-1.5 py-0.5 border text-[10px] ${
                  theme === thm
                    ? 'bg-border-light text-text-bright border-border-light font-bold'
                    : 'border-border-main text-text-dim hover:border-text-dim'
                }`}
              >
                {thm === 'onyxblack' ? 'ONYX' : 'LIGHT'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Guide & Connection Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-panel-bg border border-border-main p-6 text-text-normal shadow-2xl relative font-mono text-xs">
            <div className="flex justify-between items-start border-b border-border-main pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-text-bright tracking-wider">
                  KMPlayer 連携と「名前を付けて保存」の解決方法
                </h3>
                <p className="text-[10px] text-text-dim mt-0.5">
                  ブラウザの保存ダイアログを出さずに、ワンクリックで直接KMPlayerを立ち上げる手順
                </p>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="text-text-dim hover:text-text-bright px-2 py-1 border border-border-main"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* PWA App Icon Install Guide */}
              <div className="p-3 bg-base-bg border border-border-main">
                <div className="font-bold text-text-bright mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-text-bright inline-block" />
                    SOLIDシリーズのスタートメニュー（PWAアプリアイコン）への登録
                  </span>
                  <button
                    onClick={handleInstallPwa}
                    className="px-2 py-1 bg-border-main hover:bg-border-light text-text-bright font-bold text-[10px] border border-border-light"
                  >
                    アプリアイコン登録を実行
                  </button>
                </div>
                <div className="text-[11px] text-text-dim leading-relaxed">
                  ブラウザ（Chrome / Edge）のアドレスバー右側にある<strong>「アプリをインストール」</strong>アイコンを押すか、上のボタンを押すと、Windowsのスタートメニューの<strong>「PWA」項目にSOLID MOVIE MAKERの専用アイコン（映写機＋Mロゴ）</strong>が登録され、他のSOLIDシリーズと同じように単体ウィンドウでワンクリック起動できるようになります。
                </div>
              </div>

              {/* Question: What is this save dialog? */}
              <div className="p-3 bg-amber-950/30 border border-amber-800 text-amber-200">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-xs">
                  <AlertTriangle size={13} className="text-amber-400" />
                  Q. 映画を押すと「名前を付けて保存 (.m3u)」が出るのはなぜ？どうする？
                </div>
                <div className="text-[11px] leading-relaxed text-amber-300/90">
                  これはKMPlayerで映画を即座に開くための「再生用ショートカット（プレイリスト情報）」です。<br />
                  保存して開けばKMPlayerで再生されますが、<strong>映画を押すたびに保存先を聞かれるのは非常に面倒</strong>です。<br />
                  下の<strong>「ワンクリック連携バッチ」</strong>をPCで実行しておけば、保存ダイアログが一切出ずにKMPlayerが直結起動します！
                </div>
              </div>

              {/* Solution 1: Download Batch & Full Zip Package */}
              <div className="border border-border-main p-3 bg-base-bg">
                <div className="font-bold text-text-bright mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 inline-block" />
                    【Antigravity / PC1・PC2用】配布ZIPパッケージを一括ダウンロード
                  </span>
                  <a
                    href="/solid_movie_maker_app.zip"
                    download="solid_movie_maker_app.zip"
                    className="px-2.5 py-1 bg-blue-700 hover:bg-blue-600 text-white font-bold text-[10px] flex items-center gap-1 shadow"
                  >
                    <Download size={11} />
                    <span>配布ZIP (一式) を取得</span>
                  </a>
                </div>
                <p className="text-[11px] text-text-dim leading-relaxed mb-2">
                  このZIPを解凍して「<strong>solid_movie_launcher.bat</strong>」をダブルクリックするだけで、PC1号機でも2号機でも通信エラーなしで全機能が即座に起動します。
                </p>
                <div className="text-[10px] text-emerald-400 bg-black/60 p-2 border border-border-main font-mono">
                  現在のPC接続ステータス: {connectionStatus === 'connected' ? '● ONLINE (通信中・直接起動可能)' : '○ 未起動 (バッチを起動するとONLINEになります)'}
                </div>
              </div>

              {/* Solution 2: Browser auto open */}
              <div className="border border-border-main p-3 bg-base-bg">
                <div className="font-bold text-text-bright mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-blue-500 inline-block" />
                  解決策 ② : バッチを使わない場合（ブラウザ設定で自動オープン）
                </div>
                <p className="text-[11px] text-text-dim leading-relaxed">
                  保存ダイアログで一度「保存」した後、ブラウザ（ChromeやEdge）の画面下やダウンロード履歴で、保存したファイル（.m3u）を右クリックして<strong>「この種類のファイルは常に開く」</strong>にチェックを入れてください。次回からは保存確認が出ずに自動的にKMPlayerが起動します。
                </p>
              </div>

            </div>

            <div className="mt-5 pt-3 border-t border-border-main flex justify-between items-center">
              <button
                onClick={onRefreshConnection}
                className="px-2.5 py-1 bg-border-main hover:bg-border-light text-text-dim hover:text-text-bright text-[10px]"
              >
                接続を再確認
              </button>
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-1.5 bg-text-bright text-base-bg font-bold text-xs hover:opacity-90"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
