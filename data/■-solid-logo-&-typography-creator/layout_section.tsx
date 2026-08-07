
          <div className="flex-1 overflow-y-scroll p-4 flex flex-col gap-4">
            {activeTab === "objects" && (
              <div className="flex flex-col gap-4 animate-fade-in relative">
                <div className="ss-panel p-3">
                  <div className="ss-label mb-2 mt-1 flex justify-between items-center">
                    <div>
                      <span className="ss-number">01</span>
                      <span className="ss-title">{t("labelMotif")}</span>
                    </div>
                    <button
                      onClick={() => setShowApiSettings(!showApiSettings)}
                      className="text-[var(--text-base)] hover:text-[var(--text-bright)]"
                      title="API Settings"
                    >
                      <Settings size={12} />
                    </button>
                  </div>

                  {showApiSettings && (
                    <div className="mb-4 p-3 bg-black/40 border border-[#343d4a] rounded shadow-lg">
                      <div className="text-[10px] text-[#8a95a3] mb-2">
                        {t("apiTitle")}
                      </div>
                      <input
                        type="password"
                        className="ss-input py-1.5 px-2 text-[10px] w-full mb-1"
                        placeholder="API KEY"
                        value={customApiKey}
                        onChange={(e) => handleCustomApiKey(e.target.value)}
                      />
                      <div className="text-[8px] text-[#4e5d74]">
                        {t("apiDesc")}
                      </div>
                    </div>
                  )}

                  <input
                    type="text"
                    className="ss-input py-2 px-3 text-[12px] h-10 w-full mb-3"
                    placeholder={t("phMark")}
                    value={markPrompt}
                    onChange={(e) => setMarkPrompt(e.target.value)}
                    disabled={generatingMarks}
                  />
                  {!generatingMarks ? (
                    <button
                      className="ss-btn ss-btn-primary border-emerald-500 text-emerald-500 bg-transparent hover:bg-emerald-500/10 mb-2 w-full flex items-center justify-center gap-2"
                      disabled={!markPrompt}
                      onClick={generateAiMarks}
                    >
                      <Zap size={12} />
                      {t("generateTwiceBtn")}
                    </button>
                  ) : (
                    <button
                      className="ss-btn ss-btn-primary border-red-500 text-red-500 bg-transparent hover:bg-red-500/10 mb-2 w-full flex items-center justify-center gap-2"
                      onClick={handleCancelAiGeneration}
                    >
                      <span className="animate-pulse flex items-center justify-center gap-2 w-full">
                        <Square fill="currentColor" size={10} />{" "}
                        {t("btnGenerateMarkStop")}
                      </span>
                    </button>
                  )}
                  <div className="text-[9px] text-[#4e5d74] text-center mt-1">
                    {t("markMakerPromptDesc")}
                  </div>
                </div>

                {generatedMarks.length > 0 && (
                  <div className="ss-panel p-3">
                    <div className="ss-label mb-3 mt-1 flex justify-between items-center">
                      <div>
                        <span className="ss-number">02</span>
                        <span className="ss-title">{t("labelResult")}</span>
                      </div>
                      <ResetBtn onClick={() => setGeneratedMarks([])} />
                    </div>
                    <div className="text-[10px] text-[var(--text-base)] mb-3 leading-relaxed">
                      {t("markMakerResultDesc")}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {generatedMarks.map((markBase64, idx) => (
                        <div
                          key={idx}
                          className="group relative aspect-square bg-white border border-[var(--border-base)] rounded cursor-pointer hover:border-[var(--active-color)] transition-colors flex items-center justify-center p-2 overflow-hidden bg-white"
                          onClick={() => processGeneratedMark(markBase64)}
                        >
                          <img
                            src={markBase64}
                            alt={`Mark ${idx}`}
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-black/80 p-1 rounded">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInvert(markBase64, idx, undefined);
                              }}
                              className="text-[var(--text-base)] hover:text-[var(--text-bright)] p-0.5"
                              title={t("markInvertTooltip")}
                            >
                              <Contrast size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStockAdd(markBase64);
                              }}
                              className="text-[var(--text-base)] hover:text-[var(--active-color)] p-0.5"
                              title={t("markAddStockTooltip")}
                            >
                              <BookmarkPlus size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadPng(markBase64, false);
                              }}
                              className="text-[var(--text-base)] hover:text-blue-500 p-0.5"
                              title={t("markPngTooltip")}
                            >
                              <ImageIcon size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadPng(markBase64, true);
                              }}
                              className="text-[var(--text-base)] hover:text-blue-500 p-0.5"
                              title={t("markPngAlphaTooltip")}
                            >
                              <Download size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="ss-panel p-3">
                  <div className="ss-label mb-3 mt-1 flex justify-between items-center">
                    <div>
                      <span className="ss-number">03</span>
                      <span className="ss-title">
                        {t("labelStock")} ({stockedMarks.length})
                      </span>
                    </div>
                    <div>
                      <label
                        className="cursor-pointer text-[var(--text-base)] hover:text-[var(--text-bright)] transition-colors bg-[var(--bg-btn)] hover:bg-[var(--bg-btn-active)] border border-[var(--border-base)] p-1 rounded inline-flex items-center"
                        title={t("markBtnUploadTooltip")}
                      >
                        <Upload size={14} />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLocalImageUpload}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-3 pt-2 pb-2 bg-[var(--bg-panel)] border border-[var(--border-base)] rounded justify-center items-center">
                    <span className="text-[10px] text-[var(--text-base)] font-bold tracking-widest mr-2">
                      MENU
                    </span>
                    <button
                      onClick={handleSelectedInvert}
                      disabled={selectedStockId === null}
                      className={`p-1 transition-colors ${selectedStockId !== null ? "text-[var(--text-base)] hover:text-[var(--text-bright)] cursor-pointer" : "opacity-40 cursor-not-allowed"}`}
                      title={t("markInvertTooltip")}
                    >
                      <Contrast size={12} />
                    </button>
                    <button
                      onClick={() => handleSelectedDownload(false)}
                      disabled={selectedStockId === null}
                      className={`p-1 transition-colors ${selectedStockId !== null ? "text-[var(--text-base)] hover:text-blue-500 cursor-pointer" : "opacity-40 cursor-not-allowed"}`}
                      title={t("markPngTooltip")}
                    >
                      <ImageIcon size={12} />
                    </button>
                    <button
                      onClick={() => handleSelectedDownload(true)}
                      disabled={selectedStockId === null}
                      className={`p-1 transition-colors ${selectedStockId !== null ? "text-[var(--text-base)] hover:text-blue-500 cursor-pointer" : "opacity-40 cursor-not-allowed"}`}
                      title={t("markPngAlphaTooltip")}
                    >
                      <Download size={12} />
                    </button>
                    <button
                      onClick={handleSelectedRemove}
                      disabled={selectedStockId === null}
                      className={`p-1 ml-1 ${selectedStockId !== null ? "text-gray-300 hover:text-red-400 cursor-pointer" : "text-gray-600 cursor-not-allowed"}`}
                      title={t("markDeleteTooltip")}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {stockedMarks.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {stockedMarks.map((markBase64, idx) => {
                        const isSelected = selectedStockId === idx;
                        return (
                          <div
                            key={`stock-${idx}`}
                            className={`group relative aspect-square bg-white border ${isSelected ? "border-[var(--active-color)] scale-95" : "border-[var(--border-base)] hover:border-[var(--active-color)]"} rounded cursor-pointer transition-all flex items-center justify-center p-1.5 overflow-hidden`}
                            onClick={() => processGeneratedMark(markBase64)}
                          >
                            <img
                              src={markBase64}
                              alt={`Stock ${idx}`}
                              className={`w-full h-full object-contain ${isSelected ? "opacity-80" : ""}`}
                            />
                            <div
                              className={`absolute top-1 right-1 w-4 h-4 bg-black/60 border border-gray-400 rounded-sm flex items-center justify-center transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStockSelection(idx);
                              }}
                            >
                              {isSelected && (
                                <div className="w-2 h-2 bg-[var(--active-color)] rounded-sm" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div
                      className="text-center py-6 text-[10px] text-[var(--text-base)] border border-dashed border-[var(--border-base)] rounded mt-2"
                      dangerouslySetInnerHTML={{ __html: t("emptyStockMsg") }}
                    ></div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "text" && (
              <>
                <div className="ss-panel p-3 animate-fade-in">
                  <div className="ss-label mb-2 mt-1">
                    <span className="ss-title flex-1">{t("labelOffset")}</span>
                  </div>
                  <div className="ss-label mb-2 mt-3 text-[9px] flex items-center">
                    <span>{t("labelOffsetX")}</span>
                    <span className="ml-auto opacity-70 mr-2">{globalOffsetX}PX</span>
                    <ResetBtn onClick={() => setGlobalOffsetX(0)} />
                  </div>
                  <input type="range" min="-1000" max="1000" step="10" value={globalOffsetX} onChange={(e) => setGlobalOffsetX(Number(e.target.value))} className="ss-slider mb-4" />
                  <div className="ss-label mb-2 text-[9px] flex items-center">
                    <span>{t("labelOffsetY")}</span>
                    <span className="ml-auto opacity-70 mr-2">{globalOffsetY}PX</span>
                    <ResetBtn onClick={() => setGlobalOffsetY(0)} />
                  </div>
                  <input type="range" min="-1000" max="1000" step="10" value={globalOffsetY} onChange={(e) => setGlobalOffsetY(Number(e.target.value))} className="ss-slider" />
                </div>

                {attachedMark && (
                  <div className="ss-panel p-3 animate-fade-in">
                    <div className="ss-label mb-2 mt-1 flex justify-between items-center w-full">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="ss-number">01</span>
                        <span className="ss-title">AI MARK</span>
                        <button
                          onClick={() => setAttachedMark(null)}
                          className="opacity-50 hover:opacity-100 p-1 transition-opacity text-[var(--text-base)] hover:text-white mr-1"
                          title={t("markDeleteTooltip")}
                        >
                          <Trash2 size={12} />
                        </button>
                        <div className="flex-1"></div>
                        <button
                          onClick={() => setCollapsedMark(!collapsedMark)}
                          className="p-1 ml-1 text-[var(--text-base)] hover:text-[var(--active-color)] opacity-70 hover:opacity-100"
                        >
                          {collapsedMark ? "＋" : "−"}
                        </button>
                      </div>
                    </div>
                    {!collapsedMark && (
                      <>
                    <div className="ss-label mb-2 text-[9px] flex items-center mt-3">
                      <span>EDGE WIDTH</span>
                      <span className="ml-auto opacity-70 mr-2">
                        {outlineWidthMark}PX
                      </span>
                      <ResetBtn onClick={() => setOutlineWidthMark(0)} />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={outlineWidthMark}
                      onChange={(e) =>
                        setOutlineWidthMark(Number(e.target.value))
                      }
                      className="ss-slider mb-4"
                    />

                    <div className="ss-label mb-2 text-[9px] flex items-center mt-3">
                      <span>{t("labelScale")}</span>
                      <span className="ml-auto opacity-70 mr-2">
                        {attachedMarkScale.toFixed(2)}
                      </span>
                      <ResetBtn onClick={() => setAttachedMarkScale(1.0)} />
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="5.0"
                      step="0.1"
                      value={attachedMarkScale}
                      onChange={(e) =>
                        setAttachedMarkScale(Number(e.target.value))
                      }
                      className="ss-slider mb-4"
                    />

                    <div className="ss-label mb-2 text-[9px] flex items-center">
                      <span>{t("labelMarkX")}</span>
                      <span className="ml-auto opacity-70 mr-2">
                        {attachedMarkOffsetX}PX
                      </span>
                      <ResetBtn onClick={() => setAttachedMarkOffsetX(0)} />
                    </div>
                    <input
                      type="range"
                      min="-1500"
                      max="1500"
                      step="10"
                      value={attachedMarkOffsetX}
                      onChange={(e) =>
                        setAttachedMarkOffsetX(Number(e.target.value))
                      }
                      className="ss-slider mb-4"
                    />

                    <div className="ss-label mb-2 text-[9px] flex items-center">
                      <span>{t("labelMarkY")}</span>
                      <span className="ml-auto opacity-70 mr-2">
                        {attachedMarkOffsetY}PX
                      </span>
                      <ResetBtn onClick={() => setAttachedMarkOffsetY(-150)} />
                    </div>
                    <input
                      type="range"
                      min="-1500"
                      max="1500"
                      step="10"
                      value={attachedMarkOffsetY}
                      onChange={(e) =>
                        setAttachedMarkOffsetY(Number(e.target.value))
                      }
                      className="ss-slider mb-2"
                    />
                      </>
                    )}
                  </div>
                )}

                <div className="ss-panel p-3 animate-fade-in">
                  <div className="ss-label mb-2 mt-1 flex justify-between items-center w-full">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="ss-number">
                        {attachedMark ? "02" : "01"}
                      </span>
                      <span className="ss-title flex-shrink-0">
                        {t("labelMainText")}
                      </span>
                      <div className="flex-1"></div>
                      <button
                        onClick={() => setCollapsedMain(!collapsedMain)}
                        className="p-1 ml-1 text-[var(--text-base)] hover:text-[var(--active-color)] opacity-70 hover:opacity-100"
                      >
                        {collapsedMain ? "＋" : "−"}
                      </button>
                    </div>
                  </div>
                  {!collapsedMain && (
                    <>
                  <textarea
                    className="ss-input py-2 px-3 text-[12px] h-16 resize-none leading-relaxed mb-3"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  <select
                    value={fontMain}
                    onChange={(e) => setFontMain(e.target.value)}
                    className="ss-select w-full mb-3"
                    style={{ fontFamily: fontMain }}
                  >
                    {FONTS.map((f) => (
                      <option
                        key={f.name}
                        value={f.value}
                        style={{ fontFamily: f.value }}
                      >
                        {f.name}
                      </option>
                    ))}
                  </select>
                  <div className="ss-label mb-2 flex items-center">
                    <span>{t("labelSize")}</span>
                    <span className="ml-auto opacity-70 mr-2">
                      {sizeMain}PX
                    </span>
                    <ResetBtn onClick={() => setSizeMain(160)} />
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="400"
                    step="10"
                    value={sizeMain}
                    onChange={(e) => setSizeMain(Number(e.target.value))}
                    className="ss-slider mb-4"
                  />

                  <div className="ss-label mb-2 flex items-center">
                    <span>EDGE WIDTH</span>
                    <span className="ml-auto opacity-70 mr-2">
                      {outlineWidthMain}PX
                    </span>
                    <ResetBtn onClick={() => setOutlineWidthMain(0)} />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={outlineWidthMain}
                    onChange={(e) =>
                      setOutlineWidthMain(Number(e.target.value))
                    }
                    className="ss-slider mb-4"
                  />

                  <div className="ss-label mb-2 flex items-center">
                    <span>{t("labelMainTracking")}</span>
                    <span className="ml-auto opacity-70 mr-2">
                      {mainLetterSpacing}PX
                    </span>
                    <ResetBtn onClick={() => setMainLetterSpacing(5)} />
                  </div>
                  <input
                    type="range"
                    min="-20"
                    max="100"
                    step="1"
                    value={mainLetterSpacing}
                    onChange={(e) =>
                      setMainLetterSpacing(Number(e.target.value))
                    }
                    className="ss-slider mb-4"
                  />

                  <div className="ss-label mb-2 flex items-center">
                    <span>{t("labelMainLineSpace")}</span>
                    <span className="ml-auto opacity-70 mr-2">
                      {mainLineHeight.toFixed(1)}
                    </span>
                    <ResetBtn onClick={() => setMainLineHeight(1.2)} />
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    value={mainLineHeight}
                    onChange={(e) => setMainLineHeight(Number(e.target.value))}
                    className="ss-slider mb-4"
                  />

                  <div className="ss-label mb-2 text-[9px] flex items-center">
                    <span>{t("labelMainX")}</span>
                    <span className="ml-auto opacity-70 mr-2">
                      {mainOffsetX}PX
                    </span>
                    <ResetBtn onClick={() => setMainOffsetX(0)} />
                  </div>
                  <input
                    type="range"
                    min="-1500"
                    max="1500"
                    step="10"
                    value={mainOffsetX}
                    onChange={(e) => setMainOffsetX(Number(e.target.value))}
                    className="ss-slider mb-4"
                  />

                  <div className="ss-label mb-2 text-[9px] flex items-center">
                    <span>{t("labelMainY")}</span>
                    <span className="ml-auto opacity-70 mr-2">
                      {mainOffsetY}PX
                    </span>
                    <ResetBtn onClick={() => setMainOffsetY(-50)} />
                  </div>
                  <input
                    type="range"
                    min="-1500"
                    max="1500"
                    step="10"
                    value={mainOffsetY}
                    onChange={(e) => setMainOffsetY(Number(e.target.value))}
                    className="ss-slider mb-2"
                  />
                    </>
                  )}
                </div>

                <div className="ss-panel p-3 animate-fade-in">
                  <div className="ss-label mb-2 mt-1 flex justify-between items-center w-full">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="ss-number">
                        {attachedMark ? "03" : "02"}
                      </span>
                      <span className="ss-title flex-shrink-0">{t("labelSubText")}</span>
                      <div className="flex-1"></div>
                      <button
                        onClick={() => setCollapsedSub(!collapsedSub)}
                        className="p-1 ml-1 text-[var(--text-base)] hover:text-[var(--active-color)] opacity-70 hover:opacity-100"
                      >
                        {collapsedSub ? "＋" : "−"}
                      </button>
                    </div>
                  </div>
                  {!collapsedSub && (
                    <>
                  <textarea
                    className="ss-input py-2 px-3 text-[10px] h-12 resize-none leading-relaxed mb-3"
                    value={subPrompt}
                    onChange={(e) => setSubPrompt(e.target.value)}
                  />
                  <select
                    value={fontSub}
                    onChange={(e) => setFontSub(e.target.value)}
                    className="ss-select w-full mb-3"
                    style={{ fontFamily: fontSub }}
                  >
                    {FONTS.map((f) => (
                      <option
                        key={f.name}
                        value={f.value}
                        style={{ fontFamily: f.value }}
                      >
                        {f.name}
                      </option>
                    ))}
                  </select>
                  <div className="ss-label mb-2 flex items-center">
                    <span>{t("labelSize")}</span>
                    <span className="ml-auto opacity-70 mr-2">{sizeSub}PX</span>
                    <ResetBtn onClick={() => setSizeSub(30)} />
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="1"
                    value={sizeSub}
                    onChange={(e) => setSizeSub(Number(e.target.value))}
                    className="ss-slider mb-4"
                  />

                  <div className="ss-label mb-2 flex items-center">
                    <span>EDGE WIDTH</span>
                    <span className="ml-auto opacity-70 mr-2">
                      {outlineWidthSub}PX
                    </span>
                    <ResetBtn onClick={() => setOutlineWidthSub(0)} />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={outlineWidthSub}
                    onChange={(e) => setOutlineWidthSub(Number(e.target.value))}
                    className="ss-slider mb-4"
                  />

                  <div className="ss-label mb-2 flex items-center">
                    <span>{t("labelSubTracking")}</span>
                    <span className="ml-auto opacity-70 mr-2">
                      {subLetterSpacing}PX
                    </span>
                    <ResetBtn onClick={() => setSubLetterSpacing(5)} />
                  </div>
                  <input
                    type="range"
                    min="-20"
                    max="100"
                    step="1"
                    value={subLetterSpacing}
                    onChange={(e) =>
                      setSubLetterSpacing(Number(e.target.value))
                    }
                    className="ss-slider mb-4"
                  />

                  <div className="ss-label mb-2 flex items-center">
                    <span>{t("labelSubLineSpace")}</span>
                    <span className="ml-auto opacity-70 mr-2">
                      {subLineHeight.toFixed(1)}
                    </span>
                    <ResetBtn onClick={() => setSubLineHeight(1.5)} />
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    value={subLineHeight}
                    onChange={(e) => setSubLineHeight(Number(e.target.value))}
                    className="ss-slider mb-4"
                  />

                  <div className="ss-label mb-2 text-[9px] flex items-center">
                    <span>{t("labelSubX")}</span>
                    <span className="ml-auto opacity-70 mr-2">
                      {subOffsetX}PX
                    </span>
                    <ResetBtn onClick={() => setSubOffsetX(0)} />
                  </div>
                  <input
                    type="range"
                    min="-1500"
                    max="1500"
                    step="10"
                    value={subOffsetX}
                    onChange={(e) => setSubOffsetX(Number(e.target.value))}
                    className="ss-slider mb-4"
                  />

                  <div className="ss-label mb-2 text-[9px] flex items-center">
                    <span>{t("labelSubY")}</span>
                    <span className="ml-auto opacity-70 mr-2">
                      {subOffsetY}PX
                    </span>
                    <ResetBtn onClick={() => setSubOffsetY(100)} />
                  </div>
                  <input
                    type="range"
                    min="-1500"
                    max="1500"
                    step="10"
                    value={subOffsetY}
                    onChange={(e) => setSubOffsetY(Number(e.target.value))}
                    className="ss-slider mb-2"
                  />
                    </>
                  )}
                </div>

                <div className="ss-panel p-3 animate-fade-in">
                  <div className="ss-label mb-2 mt-1">
                    <span className="ss-number">
                      {attachedMark ? "04" : "03"}
                    </span>
                    <span className="ss-title">{t("labelCharSettings")}</span>
                  </div>

                  <div className="flex justify-between items-center gap-2 mb-2 mt-3">
                    <button
                      onClick={() => setTextAlign("left")}
                      className={`flex-1 ss-btn py-1.5 flex justify-center ${textAlign === "left" ? "ss-btn-active" : ""}`}
                    >
                      {t("labelAlignLeft")}
                    </button>
                    <button
                      onClick={() => setTextAlign("center")}
                      className={`flex-1 ss-btn py-1.5 flex justify-center ${textAlign === "center" ? "ss-btn-active" : ""}`}
                    >
                      {t("labelAlignCenter")}
                    </button>
                    <button
                      onClick={() => setTextAlign("right")}
                      className={`flex-1 ss-btn py-1.5 flex justify-center ${textAlign === "right" ? "ss-btn-active" : ""}`}
                    >
                      {t("labelAlignRight")}
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === "style" && (
              <>
                <div className="ss-panel p-3 animate-fade-in">
                  <div className="ss-label mb-2 mt-1">
                    <span className="ss-number">01</span>
                    <span className="ss-title">{t("labelColorSettings")}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div>
                      <div className="ss-label mb-1 text-[8px] justify-between">
                        {t("labelSideColor")}{" "}
                        <ResetBtn onClick={() => setColorSide("#808080")} />
                      </div>
                      <div className="flex bg-[var(--bg-panel)] p-1 rounded-sm border border-[var(--border-base)]">
                        <input
                          type="color"
                          value={colorSide}
                          onChange={(e) => setColorSide(e.target.value)}
                          className="w-full h-8 cursor-pointer border-none bg-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="ss-label mb-1 text-[8px] justify-between">
                        {t("labelBgColor2")}{" "}
                        <ResetBtn onClick={() => setBgColor("#1A1A1A")} />
                      </div>
                      <div className="flex bg-[var(--bg-panel)] p-1 rounded-sm border border-[var(--border-base)]">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-full h-8 cursor-pointer border-none bg-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[var(--border-base)] mt-4 pt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                    <div>
                      <div className="ss-label text-[9px] mb-1 opacity-80">{t("labelMainText")}</div>
                      <div className="flex gap-2">
                        <label className="flex-1 flex flex-col items-start text-[8px] text-[var(--text-base)]">
                          FACE
                          <div className="flex w-full mt-1 bg-[var(--bg-panel)] p-1 rounded-sm border border-[var(--border-base)]">
                            <input type="color" value={colorMain} onChange={(e) => setColorMain(e.target.value)} className="w-full h-4 cursor-pointer border-none bg-transparent" />
                          </div>
                        </label>
                        <label className="flex-1 flex flex-col items-start text-[8px] text-[var(--text-base)]">
                          EDGE
                          <div className="flex w-full mt-1 bg-[var(--bg-panel)] p-1 rounded-sm border border-[var(--border-base)]">
                            <input type="color" value={outlineMain} onChange={(e) => setOutlineMain(e.target.value)} className="w-full h-4 cursor-pointer border-none bg-transparent" />
                          </div>
                        </label>
                      </div>
                    </div>
                    <div>
                      <div className="ss-label text-[9px] mb-1 opacity-80">{t("labelSubText")}</div>
                      <div className="flex gap-2">
                        <label className="flex-1 flex flex-col items-start text-[8px] text-[var(--text-base)]">
                          FACE
                          <div className="flex w-full mt-1 bg-[var(--bg-panel)] p-1 rounded-sm border border-[var(--border-base)]">
                            <input type="color" value={colorSub} onChange={(e) => setColorSub(e.target.value)} className="w-full h-4 cursor-pointer border-none bg-transparent" />
                          </div>
                        </label>
                        <label className="flex-1 flex flex-col items-start text-[8px] text-[var(--text-base)]">
                          EDGE
                          <div className="flex w-full mt-1 bg-[var(--bg-panel)] p-1 rounded-sm border border-[var(--border-base)]">
                            <input type="color" value={outlineSub} onChange={(e) => setOutlineSub(e.target.value)} className="w-full h-4 cursor-pointer border-none bg-transparent" />
                          </div>
                        </label>
                      </div>
                    </div>
                    
                    {attachedMark && (
                      <div className="col-span-2">
                        <div className="ss-label text-[9px] mb-1 opacity-80">AI MARK</div>
                        <div className="flex gap-2 w-1/2 pr-2">
                          <label className="flex-1 flex flex-col items-start text-[8px] text-[var(--text-base)]">
                            FACE
                            <div className="flex w-full mt-1 bg-[var(--bg-panel)] p-1 rounded-sm border border-[var(--border-base)]">
                              <input type="color" value={colorMark} onChange={(e) => setColorMark(e.target.value)} className="w-full h-4 cursor-pointer border-none bg-transparent" />
                            </div>
                          </label>
                          <label className="flex-1 flex flex-col items-start text-[8px] text-[var(--text-base)]">
                            EDGE
                            <div className="flex w-full mt-1 bg-[var(--bg-panel)] p-1 rounded-sm border border-[var(--border-base)]">
                              <input type="color" value={outlineMark} onChange={(e) => setOutlineMark(e.target.value)} className="w-full h-4 cursor-pointer border-none bg-transparent" />
                            </div>
                          </label>
                        </div>
                      </div>
                    )}
                    
                    <div className="col-span-2 mt-1">
                      <div className="ss-label text-[9px] mb-1 opacity-80">ORNAMENTS</div>
                      <div className="flex gap-2">
                        {ornaments.map((ornament, idx) => (
                          <label key={idx} className="flex-1 flex flex-col items-start text-[8px] text-[var(--text-base)]">
                            {t(`labelOrnament${idx + 1}` as any) || `ORN ${idx + 1}`}
                            <div className="flex w-full mt-1 bg-[var(--bg-panel)] p-1 rounded-sm border border-[var(--border-base)]">
                              <input 
                                type="color" 
                                value={ornament.color} 
                                onChange={(e) => {
                                  const newOrn = [...ornaments];
                                  newOrn[idx].color = e.target.value;
                                  setOrnaments(newOrn);
                                }} 
                                className="w-full h-4 cursor-pointer border-none bg-transparent" 
                              />
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[var(--border-base)]">
                    <div className="ss-label mb-2 text-[10px] flex items-center">
                      <span className="flex-1">SHADOW</span>
                      COLOR{" "}
                      <input
                        type="color"
                        value={shadowColor}
                        onChange={(e) => setShadowColor(e.target.value)}
                        className="w-4 h-4 cursor-pointer border-none bg-transparent p-0 m-0 ml-2"
                      />
                    </div>
                    <div className="ss-label mb-2 text-[9px] flex items-center mt-3">
                      <span>BLUR</span>
                      <span className="ml-auto opacity-70 mr-2">
                        {shadowBlur}PX
                      </span>
                      <ResetBtn onClick={() => setShadowBlur(0)} />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={shadowBlur}
                      onChange={(e) => setShadowBlur(Number(e.target.value))}
                      className="ss-slider mb-3"
                    />

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <div className="ss-label mb-2 text-[9px] flex items-center">
                          <span>OFFSET X</span>
                          <span className="ml-auto opacity-70 mr-1">
                            {shadowOffsetX}
                          </span>
                          <ResetBtn onClick={() => setShadowOffsetX(0)} />
                        </div>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          step="1"
                          value={shadowOffsetX}
                          onChange={(e) =>
                            setShadowOffsetX(Number(e.target.value))
                          }
                          className="ss-slider mb-2"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="ss-label mb-2 text-[9px] flex items-center">
                          <span>OFFSET Y</span>
                          <span className="ml-auto opacity-70 mr-1">
                            {shadowOffsetY}
                          </span>
                          <ResetBtn onClick={() => setShadowOffsetY(5)} />
                        </div>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          step="1"
                          value={shadowOffsetY}
                          onChange={(e) =>
                            setShadowOffsetY(Number(e.target.value))
                          }
                          className="ss-slider mb-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                                {ornaments.map((ornament, idx) => (
                  <div key={`ornament-${idx}`} className="ss-panel p-3 animate-fade-in">
                    <div className="ss-label mb-2 mt-1 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="ss-number">{String(idx + 2).padStart(2, "0")}</span>
                        <span className="ss-title whitespace-nowrap flex-shrink-0">{t(`labelOrnament${idx + 1}` as any) || `ORNAMENT ${idx + 1}`}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setCollapsedOrnaments((prev) => {
                              const next = [...prev];
                              next[idx] = !next[idx];
                              return next;
                            });
                          }}
                          className="p-1 text-[var(--text-base)] hover:text-[var(--active-color)] opacity-70 hover:opacity-100 mr-2"
                        >
                          {collapsedOrnaments[idx] ? "＋" : "−"}
                        </button>
                        {idx > 0 && (
                          <button
                            onClick={() => {
                              const newOrn = [...ornaments];
                              const temp = newOrn[idx - 1];
                              newOrn[idx - 1] = newOrn[idx];
                              newOrn[idx] = temp;
                              setOrnaments(newOrn);
                            }}
                            className="p-1 hover:text-[var(--active-color)] opacity-70 hover:opacity-100"
                            title="Move Up (Render Below)"
                          >
                            ↑
                          </button>
                        )}
                        {idx < ornaments.length - 1 && (
                          <button
                            onClick={() => {
                              const newOrn = [...ornaments];
                              const temp = newOrn[idx + 1];
                              newOrn[idx + 1] = newOrn[idx];
                              newOrn[idx] = temp;
                              setOrnaments(newOrn);
                            }}
                            className="p-1 hover:text-[var(--active-color)] opacity-70 hover:opacity-100"
                            title="Move Down (Render Above)"
                          >
                            ↓
                          </button>
                        )}
                        <ResetBtn
                          onClick={() => {
                            const newOrn = [...ornaments];
                            newOrn[idx] = {
                              type: "none",
                              offsetX: 0,
                              offsetY: 0,
                              scale: 1.0,
                              width: 1.0,
                              thickness: 15,
                              dash: 0,
                              color: "#000000"
                            };
                            setOrnaments(newOrn);
                          }}
                        />
                      </div>
                    </div>
                    {!collapsedOrnaments[idx] && (
                      <>
                        <select
                          value={ornament.type}
                      onChange={(e) => {
                        const newOrn = [...ornaments];
                        newOrn[idx].type = e.target.value;
                        setOrnaments(newOrn);
                      }}
                      className="ss-select w-full mb-3"
                    >
                      {ORNAMENTS.map((o) => (
                        <option key={o.id} value={o.id}>
                          {t(o.labelKey as any)}
                        </option>
                      ))}
                    </select>

                    {ornament.type !== "none" && (
                      <div className="animate-fade-in mt-2 border-t border-[var(--border-base)] pt-3">
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <div className="ss-label mb-2 text-[9px] flex items-center">
                              <span>{t("labelHorizontalPos")}</span>
                              <span className="ml-auto opacity-70 mr-1">
                                {ornament.offsetX}
                              </span>
                              <ResetBtn
                                onClick={() => {
                                  const newOrn = [...ornaments];
                                  newOrn[idx].offsetX = 0;
                                  setOrnaments(newOrn);
                                }}
                              />
                            </div>
                            <input
                              type="range"
                              min="-1000"
                              max="1000"
                              step="10"
                              value={ornament.offsetX}
                              onChange={(e) => {
                                const newOrn = [...ornaments];
                                newOrn[idx].offsetX = Number(e.target.value);
                                setOrnaments(newOrn);
                              }}
                              className="ss-slider mb-4"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="ss-label mb-2 text-[9px] flex items-center">
                              <span>{t("labelVerticalPos")}</span>
                              <span className="ml-auto opacity-70 mr-1">
                                {ornament.offsetY}
                              </span>
                              <ResetBtn
                                onClick={() => {
                                  const newOrn = [...ornaments];
                                  newOrn[idx].offsetY = 0;
                                  setOrnaments(newOrn);
                                }}
                              />
                            </div>
                            <input
                              type="range"
                              min="-1000"
                              max="1000"
                              step="10"
                              value={ornament.offsetY}
                              onChange={(e) => {
                                const newOrn = [...ornaments];
                                newOrn[idx].offsetY = Number(e.target.value);
                                setOrnaments(newOrn);
                              }}
                              className="ss-slider mb-4"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <div className="flex-1">
                            <div className="ss-label mb-2 text-[9px] flex items-center">
                              <span>{t("labelOrnamentScale")}</span>
                              <span className="ml-auto opacity-70 mr-1">
                                {ornament.scale.toFixed(1)}
                              </span>
                              <ResetBtn
                                onClick={() => {
                                  const newOrn = [...ornaments];
                                  newOrn[idx].scale = 1.0;
                                  setOrnaments(newOrn);
                                }}
                              />
                            </div>
                            <input
                              type="range"
                              min="0.1"
                              max="5.0"
                              step="0.1"
                              value={ornament.scale}
                              onChange={(e) => {
                                const newOrn = [...ornaments];
                                newOrn[idx].scale = Number(e.target.value);
                                setOrnaments(newOrn);
                              }}
                              className="ss-slider mb-4"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="ss-label mb-2 text-[9px] flex items-center">
                              <span>{t("labelOrnamentWidth")}</span>
                              <span className="ml-auto opacity-70 mr-1">
                                {ornament.width.toFixed(1)}
                              </span>
                              <ResetBtn
                                onClick={() => {
                                  const newOrn = [...ornaments];
                                  newOrn[idx].width = 1.0;
                                  setOrnaments(newOrn);
                                }}
                              />
                            </div>
                            <input
                              type="range"
                              min="0.1"
                              max="5.0"
                              step="0.1"
                              value={ornament.width}
                              onChange={(e) => {
                                const newOrn = [...ornaments];
                                newOrn[idx].width = Number(e.target.value);
                                setOrnaments(newOrn);
                              }}
                              className="ss-slider mb-4"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <div className="flex-1">
                            <div className="ss-label mb-2 text-[9px] flex items-center">
                              <span>{t("labelOrnamentThickness")}</span>
                              <span className="ml-auto opacity-70 mr-1">
                                {ornament.thickness}
                              </span>
                              <ResetBtn
                                onClick={() => {
                                  const newOrn = [...ornaments];
                                  newOrn[idx].thickness = 15;
                                  setOrnaments(newOrn);
                                }}
                              />
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="100"
                              step="1"
                              value={ornament.thickness}
                              onChange={(e) => {
                                const newOrn = [...ornaments];
                                newOrn[idx].thickness = Number(e.target.value);
                                setOrnaments(newOrn);
                              }}
                              className="ss-slider mb-2"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="ss-label mb-2 text-[9px] flex items-center">
                              <span>{t("labelOrnamentDash")}</span>
                              <span className="ml-auto opacity-70 mr-1">
                                {ornament.dash}
                              </span>
                              <ResetBtn
                                onClick={() => {
                                  const newOrn = [...ornaments];
                                  newOrn[idx].dash = 0;
                                  setOrnaments(newOrn);
                                }}
                              />
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              value={ornament.dash}
                              onChange={(e) => {
                                const newOrn = [...ornaments];
                                newOrn[idx].dash = Number(e.target.value);
                                setOrnaments(newOrn);
                              }}
                              className="ss-slider mb-2"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                      </>
                    )}
                  </div>
                ))}
<div className="ss-panel p-3 animate-fade-in">
                  <div className="ss-label mb-2 mt-1 flex justify-between items-center">
                    <div>
                      <span className="ss-number">07</span>
                      <span className="ss-title">{t("label2DSkew")}</span>
                    </div>
                    <ResetBtn
                      onClick={() => {
                        setSkewX(0);
                        setSkewY(0);
                      }}
                    />
                  </div>

                  <div className="ss-label mb-2 mt-4 text-[9px] flex items-center">
                    <span>{t("labelSkewX")}</span>
                    <span className="ml-auto opacity-70 mr-2">{skewX}°</span>
                    <ResetBtn onClick={() => setSkewX(0)} />
                  </div>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    step="1"
                    value={skewX}
                    onChange={(e) => setSkewX(Number(e.target.value))}
                    className="ss-slider mb-2"
                  />

                  <div className="ss-label mb-2 mt-4 text-[9px] flex items-center">
                    <span>{t("labelSkewY")}</span>
                    <span className="ml-auto opacity-70 mr-2">{skewY}°</span>
                    <ResetBtn onClick={() => setSkewY(0)} />
                  </div>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    step="1"
                    value={skewY}
                    onChange={(e) => setSkewY(Number(e.target.value))}
                    className="ss-slider mb-2"
                  />
                </div>
              </>
            )}

            {activeTab === "3d" && (
              <>
                <div className="ss-panel p-3 animate-fade-in">
                  <div className="ss-label mb-2 mt-1">
                    <span className="ss-number">08</span>
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
                    <span className="ss-number">09</span>
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
              </>
            )}
          </div>

          <div className="p-3 border-t border-[var(--border-base)] shrink-0 bg-[var(--bg-panel)] backdrop-blur-md grid grid-cols-2 gap-2">
            <button
              onClick={exportSettings}
              className={`w-full ss-btn py-2 flex items-center justify-center gap-1 transition-colors !bg-transparent ${uiTheme === "WHITE" ? "!border-black !text-black hover:!bg-black hover:!text-white" : "!border-white !text-white hover:!bg-white hover:!text-black"}`}
            >
              <Download size={12} />{" "}
              <span className="text-[9px] tracking-widest font-bold">
                {t("btnConfigExport")}
              </span>
            </button>
            <label
              className={`w-full ss-btn py-2 flex items-center justify-center gap-1 transition-colors cursor-pointer !bg-transparent ${uiTheme === "WHITE" ? "!border-black !text-black hover:!bg-black hover:!text-white" : "!border-white !text-white hover:!bg-white hover:!text-black"}`}
            >
              <Upload size={12} />{" "}
              <span className="text-[9px] tracking-widest font-bold">
                {t("btnConfigImport")}
              </span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={importSettings}
              />
            </label>
          </div>
        </aside>

        {/* MAIN VIEWPORT */}
        <main className="flex-1 flex flex-col min-w-0 bg-[var(--bg-main)]/20 relative">
          {/* Tabs Bar */}
          <div className="flex bg-[var(--bg-main)] text-[9px] font-bold shrink-0 border-b border-[var(--border-base)] overflow-x-auto scroller-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={`px-4 py-2 border-r border-[var(--border-base)] flex items-center gap-2 transition-colors ${activeTabId === tab.id ? "bg-[var(--bg-panel)] text-[var(--text-bright)]" : "text-[var(--text-base)] hover:bg-[var(--bg-btn)]"}`}
              >
                {tab.name}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="hover:text-red-500 rounded p-[1px] -mr-1"
                >
                  <X size={10} />
                </span>
              </button>
            ))}
            <button
              onClick={addNewTab}
              className="px-4 py-2 border-r border-[var(--border-base)] text-[var(--text-base)] hover:text-[var(--text-bright)] hover:bg-[var(--bg-btn)] transition-colors flex items-center justify-center"
            >
              <span className="text-sm leading-none -mt-0.5">+</span>
            </button>
            <button
              onClick={clearAllTabs}
              className="mx-2 my-1 px-4 py-1 text-[var(--text-bright)] opacity-70 hover:opacity-100 border border-[var(--text-bright)] hover:bg-[var(--text-bright)] hover:text-[var(--bg-main)] ml-auto uppercase flex items-center gap-1 transition-all font-bold rounded-sm"
            >
              <Eraser size={10} /> CLEAR ALL
            </button>
          </div>

          {/* Viewport Header */}
          <div className="flex bg-[var(--bg-panel)]/60 border-b border-[var(--border-base)] shrink-0 h-[42px]">
            <div className="flex-1 px-4 flex items-center">
              {viewMode === "image" && (
                <div className="flex gap-2 h-[28px]">
                  <button
                    onClick={() =>
                      setPreviewBgMode((p) =>
                        p === "transparent" ? "solid" : "transparent",
                      )
                    }
                    className="ss-btn !flex-none w-[220px] !py-0 flex gap-2 items-center justify-center tracking-widest transition-colors active:!scale-100"
                    title="背景モード切替（透過 / ベタ塗り）"
                  >
                    <Contrast size={12} />
                    <span className="text-[10px] font-bold flex gap-1">
                      BACKGROUND MODE:
                      <span className="inline-block w-[40px] text-left">
                        {previewBgMode === "transparent" ? "ALPHA" : "SOLID"}
                      </span>
                    </span>
                  </button>
                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    className="ss-btn !flex-none min-w-[140px] px-3 w-auto !py-0 flex gap-2 items-center justify-center tracking-widest transition-colors active:!scale-100"
                    title="Toggle Grid overlay"
                  >
                    <Grid size={12} />{" "}
                    <span className="text-[10px] font-bold whitespace-nowrap">
                      {t("labelGrid")}: {showGrid ? "ON" : "OFF"}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setImagePan({ x: 0, y: 0 });
                      setImageZoom(1.0);
                    }}
                    className="ss-btn !flex-none w-[140px] !py-0 flex gap-2 items-center justify-center tracking-widest transition-colors active:!scale-100"
                    title="表示位置とズームをリセット"
                  >
                    <Maximize2 size={12} />{" "}
                    <span className="text-[10px] font-bold">RESET VIEW</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex shrink-0">
              <button
                onClick={() => setViewMode("image")}
                className={`w-[140px] px-4 py-0 flex items-center justify-center gap-2 text-[10px] uppercase font-bold tracking-wider transition-colors border-l border-[var(--border-base)] ${viewMode === "image" ? "bg-white text-black" : "text-[var(--text-base)] hover:text-[var(--text-bright)] hover:bg-[var(--bg-btn)]"}`}
                title="2Dベース画像を表示"
              >
                <Type size={14} /> <span>BASE_MAP</span>
              </button>
              <button
                onClick={handleConstructScene}
                disabled={status !== "idle" || !imageData}
                className={`w-[160px] px-4 py-0 flex items-center justify-center gap-2 text-[10px] uppercase font-bold tracking-wider transition-colors border-l border-[var(--border-base)]
                  ${
                    viewMode === "scene"
                      ? "bg-white text-black"
                      : "text-white bg-[var(--accent)] hover:opacity-80"
                  }
                  ${(status !== "idle" && status !== "generating_scene") || !imageData ? "opacity-50 cursor-not-allowed" : ""}
                `}
                title="3Dモデルを生成・更新"
              >
                {viewMode === "scene" ? (
                  <>
                    <ImageIcon
                      size={14}
                      className={
                        status === "generating_scene" ? "animate-spin" : ""
                      }
                    />
                    <span>3D_STUDIO</span>
                  </>
                ) : (
                  <>
                    <Cpu
                      size={14}
                      className={
                        status === "generating_scene" ? "animate-spin" : ""
                      }
                    />
                    <span>CONSTRUCT_3D</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Viewport Render Box */}
          <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-[radial-gradient(#1d2533_1px,transparent_1px)] [background-size:32px_32px]">
            <AnimatePresence mode="wait">
              {status !== "idle" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[#0a0e14]/90 z-30 flex flex-col items-center justify-center gap-6"
                >
                  <div className="relative">
                    <div className="w-16 h-16 border-2 border-[#1d2533] border-t-white rounded-full animate-spin"></div>
                    <Terminal
                      size={24}
                      className="absolute inset-0 m-auto text-white opacity-20"
                    />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] tracking-[0.4em] text-white uppercase font-bold">
                      {thinkingText || status.replace("_", " ")}
                    </span>
                    <span className="text-[8px] text-[#4e5d74]">
                      WRITING_THREE_JS_SHADERS...
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div
              className="w-full h-full relative"
              style={
                previewBgMode === "solid"
                  ? {
                      backgroundColor: bgColor,
                      backgroundImage: "none",
                    }
                  : {
                      backgroundColor: "#f3f4f6",
                      backgroundImage:
                        "linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%, #e5e7eb), linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%, #e5e7eb)",
                      backgroundSize: "20px 20px",
                      backgroundPosition: "0 0, 10px 10px",
                    }
              }
              onWheel={handleWheel}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onContextMenu={handleContextMenu}
            >
              {viewMode === "scene" && sceneCode ? (
                <iframe
                  ref={iframeRef}
                  title="3D View"
                  srcDoc={sceneCode}
                  className="w-full h-full border-none transition-opacity duration-300"
                  sandbox="allow-scripts allow-same-origin"
                  onLoad={(e) => {
                    (e.currentTarget as HTMLIFrameElement).style.opacity = "1";
                  }}
                />
              ) : viewMode === "image" && imageData ? (
                <div className="w-full h-full overflow-hidden relative cursor-grab active:cursor-grabbing">
                  <div
                    className="absolute top-1/2 left-1/2 pointer-events-none flex items-center justify-center"
                    style={{
                      transform: `translate(calc(-50% + ${imagePan.x}px), calc(-50% + ${imagePan.y}px)) scale(${imageZoom * 0.5})`,
                    }}
                  >
                    {showGrid && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30 z-0">
                        <div className="w-[3000px] h-[1px] bg-[#666666] absolute"></div>
                        <div className="h-[3000px] w-[1px] bg-[#666666] absolute"></div>
                        <div className="w-[100px] h-[100px] border border-[#666666] rounded-full absolute"></div>
                        <span className="absolute -mt-[110px] text-[#666666] text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full border border-[#666666]/30 bg-[#111] bg-opacity-10 backdrop-blur-sm">
                          CENTER (0,0)
                        </span>
                      </div>
                    )}
                    <img
                      src={imageData}
                      alt="2D Preview"
                      className="relative z-10 pointer-events-none max-w-none max-h-none"
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

        {/* RIGHT SIDEBAR: HISTORY/PRESETS */}
        <aside className="w-48 border-l border-[var(--border-base)] bg-[var(--bg-panel)]/40 backdrop-blur-sm p-4 flex flex-col gap-4 shrink-0 overflow-y-auto">
          <div className="ss-panel p-3 mb-2">
            <div className="ss-label mb-2">
              <span className="ss-number">05</span>
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
            <span className="ss-number">06</span>
            <span className="ss-title">{t("themeLabel")}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(themeClasses).map((th) => (
              <button
                key={th}
                onClick={() => setUiTheme(th)}
                className={`ss-btn py-1.5 ${uiTheme === th ? "ss-btn-active" : ""}`}
              >
                {th}
              </button>
            ))}
          </div>

          <div className="h-[1px] bg-[var(--border-base)] my-2"></div>

          <div className="ss-label">
            <span className="ss-number">07</span>
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
        </button>

        <div className="flex-[2] flex gap-3">
          <button
            onClick={() => handleExport2D(false)}
            title="背景色を含めたPNG画像としてダウンロードします"
            disabled={!imageData}
            className={`flex-1 bg-[var(--bg-btn)] border border-[var(--border-base)] rounded shadow-sm transition-all uppercase font-bold text-[11px] tracking-widest flex items-center justify-center ${imageData ? "hover:bg-[var(--bg-btn-active)] text-[var(--text-base)] hover:text-[var(--text-bright)] cursor-pointer" : "opacity-50 text-[var(--text-base)] cursor-not-allowed"}`}
          >
            PNG (SOLID)
          </button>
          <button
            onClick={() => handleExport2D(true)}
            title="背景を透過したPNG画像としてダウンロードします"
            disabled={!imageData}
            className={`flex-1 bg-[var(--bg-btn)] border border-[var(--border-base)] rounded shadow-sm transition-all uppercase font-bold text-[11px] tracking-widest flex items-center justify-center ${imageData ? "hover:bg-[var(--bg-btn-active)] text-[var(--text-base)] hover:text-[var(--text-bright)] cursor-pointer" : "opacity-50 text-[var(--text-base)] cursor-not-allowed"}`}
          >
            PNG (ALPHA)
          </button>
        </div>

        <button
          onClick={handleSaveToCache}
          title="現在の3D設定と画像をキャッシュに保存します"
          disabled={!imageData}
          className={`flex-1 bg-[var(--bg-btn)] border border-[var(--border-base)] rounded shadow-sm transition-all uppercase font-bold text-[11px] tracking-widest flex items-center justify-center ${imageData ? "hover:bg-[var(--bg-btn-active)] text-[var(--active-color)] hover:opacity-80 cursor-pointer" : "opacity-50 text-[var(--text-base)] cursor-not-allowed"}`}
        >
          SAVE TO CACHE
        </button>

        <button
          onClick={() => {
            setSceneCode(null);
            setViewMode("image");
            setHistory([]);
          }}
          title="キャッシュと3Dプレビューをリセットします"
          className="flex-1 bg-[var(--bg-btn)] hover:bg-[var(--bg-btn-active)] border border-[var(--border-base)] rounded shadow-sm transition-all uppercase font-bold text-[11px] text-red-500 hover:text-red-400 tracking-widest flex items-center justify-center"
        >
          CLEAR CACHE
        </button>

        <button
          onClick={downloadSceneHtml}
          title="3DモデルをHTMLファイルとしてエクスポートします"
          disabled={!sceneCode}
          className={`flex-1 bg-[var(--bg-btn)] border border-[var(--border-base)] rounded shadow-sm transition-all uppercase font-bold text-[11px] tracking-widest flex items-center justify-center ${sceneCode ? "hover:bg-[var(--bg-btn-active)] text-blue-500 hover:text-blue-400 cursor-pointer" : "opacity-50 text-[var(--text-base)] cursor-not-allowed"}`}
        >
          EXPORT 3D
        </button>
      </footer>

      {/* DEBUG STRIP */}
      <div className="ss-status-bar h-5 shrink-0 px-6 bg-[var(--bg-panel)] border-t border-[var(--border-base)] flex items-center">
        <div className="flex gap-6 flex-1 text-[var(--text-bright)]">
          <span className="flex items-center gap-1 text-[var(--active-color)] uppercase font-bold">
            <CheckCircle2 size={10} /> KERNEL_ACTIVE
          </span>
          <span className="opacity-90 font-bold">
            NODE_LOAD: {status === "idle" ? "1.84%" : "94.12%"}
          </span>
          <span className="opacity-90 uppercase font-bold">
            Canvas: {resolution}px Grid
          </span>
          {errorMsg && (
            <span className="text-red-500 opacity-100 uppercase">
              {errorMsg}
            </span>
          )}
        </div>
        <div className="text-[var(--text-bright)] opacity-90 text-[9px] tracking-widest uppercase font-bold">
          © 2026 SOLID_TYPOGRAPHY
        </div>
      </div>
    </div>
  );
};

export default App;
