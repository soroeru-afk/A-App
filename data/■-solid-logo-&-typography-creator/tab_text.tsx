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