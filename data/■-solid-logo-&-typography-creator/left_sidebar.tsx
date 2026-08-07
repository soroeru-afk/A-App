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
