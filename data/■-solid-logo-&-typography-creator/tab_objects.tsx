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