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