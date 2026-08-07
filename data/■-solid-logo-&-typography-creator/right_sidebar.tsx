                      style={{
                        filter:
                          previewBgMode === "transparent"
                            ? "drop-shadow(0 25px 25px rgb(0 0 0 / 0.5))"
                            : "none",
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-[var(--border-base)]">
                  <Grid size={64} className="opacity-10" />
                  <span className="text-[10px] tracking-[0.5em] uppercase italic">
                    NO_OUTPUT_BUFFER
                  </span>
                </div>
              )}
            </div>

            {/* Overlays */}
            {sceneCode && viewMode === "scene" && (
              <div className="absolute top-4 left-4 p-2 bg-[#0a0e14]/80 backdrop-blur-md border border-[#1d2533] text-[8px] flex flex-col gap-1 pointer-events-none">
                <div className="flex justify-between gap-8">
                  <span className="opacity-60">STYLE:</span>{" "}
                  <span className="text-white font-bold">
                    {EFFECTS.find((e) => e.id === effectStyle)?.name}
                  </span>
                </div>
                <div className="flex justify-between gap-8">
                  <span className="opacity-60">GRID:</span>{" "}
                  <span className="text-white">
                    {resolution}x{resolution}
                  </span>
                </div>
              </div>
            )}

            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={downloadSceneHtml}
                disabled={!sceneCode}
                className="w-8 h-8 ss-panel items-center justify-center p-0 hover:bg-[#252f41] cursor-pointer"
              >
                <Download size={14} className="opacity-60 hover:opacity-100" />
              </button>
              <button
                onClick={() => {
                  setSceneCode(null);
                  setViewMode("image");
                }}
                className="w-8 h-8 ss-panel items-center justify-center p-0 hover:bg-[#252f41] cursor-pointer"
              >
                <RotateCcw size={14} className="opacity-60 hover:opacity-100" />
              </button>
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR: SETTINGS & HISTORY */}
        <aside className="w-48 border-l border-[var(--border-base)] bg-[var(--bg-panel)]/40 backdrop-blur-sm flex flex-col shrink-0 overflow-hidden">
          <div className="flex shrink-0 px-4 pt-4 pb-0 gap-1 border-b border-[var(--border-base)] pb-3 mb-1">
            <button
              onClick={() => setActiveRightTab("3d")}
              className={`flex-1 py-1.5 rounded text-[8px] font-bold tracking-wider transition-colors ${activeRightTab === "3d" ? "text-white bg-[var(--bg-btn-active)] shadow-sm" : "text-[var(--text-base)] hover:text-[var(--text-bright)] hover:bg-[var(--bg-btn)]"}`}
            >
              {t("tab3dLabel")}
            </button>
            <button
              onClick={() => setActiveRightTab("data")}
              className={`flex-1 py-1.5 rounded text-[8px] font-bold tracking-wider transition-colors ${activeRightTab === "data" ? "text-white bg-[var(--bg-btn-active)] shadow-sm" : "text-[var(--text-base)] hover:text-[var(--text-bright)] hover:bg-[var(--bg-btn)]"}`}
            >
              {t("tabDataLabel")}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 relative">
<div className="ss-panel p-3 animate-fade-in">
                  <div className="ss-label mb-2 mt-1">
                    <span className="ss-number">01</span>
                    <span className="ss-title">{t("labelRenderSettings")}</span>
                  </div>
                  <div className="ss-label mb-2 mt-3 text-[10px]">
                    <span className="">{t("labelMeshDensity")}</span>
                    <span className="ml-auto opacity-70 mr-2">
                      {resolution}
                    </span>
                    <ResetBtn onClick={() => setResolution(512)} />
                  </div>
                  <input
                    type="range"
                    min="32"
                    max="512"
                    step="16"
                    value={resolution}
                    onChange={(e) => setResolution(Number(e.target.value))}
                    className="ss-slider"
                  />

                  <div className="ss-label mb-2 mt-4 text-[10px] flex items-center">
                    <span>{t("labelExtrudeDepth")}</span>
                    <span className="ml-auto opacity-70 mr-2">
                      {thickness.toFixed(1)}
                    </span>
                    <ResetBtn onClick={() => setThickness(20)} />
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="100"
                    step="0.5"
                    value={thickness}
                    onChange={(e) => setThickness(Number(e.target.value))}
                    className="ss-slider"
                  />

                  <div className="ss-label mb-2 mt-4 text-[10px]">
                    <span className="">{t("labelAutoRotate2")}</span>
                  </div>
                  <button
                    onClick={() => setAutoRotate(!autoRotate)}
                    className={`ss-btn py-1.5 w-full flex justify-center ${autoRotate ? "ss-btn-active" : ""}`}
                  >
                    {autoRotate ? "ON" : "OFF"}
                  </button>
                </div>

                <div className="ss-panel p-3 animate-fade-in">
                  <div className="ss-label mb-3 mt-1">
                    <span className="ss-number">02</span>
                    <span className="ss-title">{t("label3DEffects")}</span>
                  </div>
                  <div className="flex flex-col gap-1 overflow-y-auto">
                    {EFFECTS.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => handleEffectStyleChange(e.id)}
                        className={`ss-btn py-1.5 ${effectStyle === e.id ? "ss-btn-active" : ""}`}
                      >
                        {e.name}
                      </button>
                    ))}
                  </div>
                </div>
          <div className="ss-panel p-3 mb-2">
            <div className="ss-label mb-2">
              <span className="ss-number">03</span>
              <span className="ss-title">{t("labelLight")}</span>
              <span className="ml-auto text-white text-[10px]">
                {lighting.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="3.0"
              step="0.1"
              value={lighting}
              onChange={(e) => setLighting(Number(e.target.value))}
              className="ss-slider"
            />
          </div>


          <div className="ss-label">
            <span className="ss-number">04</span>
            <span className="ss-title">{t("labelHistory")}</span>
          </div>
          <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
            {history.length > 0 ? (
              history.map((sn, idx) => (
                <div
                  key={sn.id + "-" + idx}
                  className="ss-panel p-1 cursor-pointer hover:border-[#4d5e7a] group bg-black/40 border-black/50 relative"
                >
                  <img
                    src={sn.image}
                    onClick={() => loadSnapshot(sn)}
                    className="w-full h-16 object-cover opacity-60 group-hover:opacity-100 transition-all shadow-lg mix-blend-screen"
                    alt="Thumb"
                  />
                  <div className="p-1 text-[7px] truncate opacity-40 group-hover:opacity-100 mt-1 flex justify-between items-center">
                    <span
                      className="truncate flex-1"
                      onClick={() => loadSnapshot(sn)}
                      title={sn.title}
                    >
                      {sn.title}
                    </span>
                    <button
                      className="ml-1 p-1 hover:text-red-500 hover:bg-black/50 rounded flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHistory((h) =>
                          h.filter((item) => item.id !== sn.id),
                        );
                      }}
                      title="Remove from history"
                    >
                      <X size={10} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 border border-dashed border-[#1d2533] p-4 flex items-center justify-center opacity-30">
                <span className="text-[9px] text-[var(--border-base)] rotate-90 uppercase tracking-widest">
                  Cache_Empty
                </span>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* FOOTER BAR */}
      <footer className="p-3 border-t border-[var(--border-base)] bg-[var(--bg-panel)] shrink-0 flex gap-3 h-[60px]">
        <button
          onClick={copyToClipboard}
          title="3Dモデルを描画するHTMLソースコードをクリップボードにコピーします"
          className="flex-1 bg-[var(--bg-btn)] hover:bg-[var(--bg-btn-active)] border border-[var(--border-base)] rounded shadow-sm transition-all uppercase font-bold text-[11px] text-[var(--text-base)] hover:text-[var(--text-bright)] tracking-widest flex items-center justify-center"
        >
          COPY 3D SOURCE
