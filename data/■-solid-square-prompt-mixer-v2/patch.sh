#!/bin/bash
sed -i '/{expandedActionId !== part.id && (/,/{(expandedActionId === part.id || confirmQuickDeleteId === part.id || copiedPartId === part.id) && (/c\
                                  {expandedActionId !== part.id && (\
                                    <>\
                                      <button \
                                        onClick={(e) => {\
                                          e.preventDefault();\
                                          e.stopPropagation();\
                                          navigator.clipboard.writeText(part.content);\
                                          setCopiedPartId(part.id);\
                                          setTimeout(() => setCopiedPartId(null), 2000);\
                                        }}\
                                        className={`opacity-0 group-hover:opacity-100 p-1 bg-bg-panel rounded shadow-sm border border-border-main transition-all ${\
                                          copiedPartId === part.id \
                                            ? '"'text-green-500 bg-green-500/10 opacity-100'"'\
                                            : '"'text-text-dim hover:text-green-400'"'\
                                        }`}\
                                        title={lang === '"'en'"' ? '"'Copy Prompt Text'"' : '"'プロンプトをコピー'"'}\
                                      >\
                                        {copiedPartId === part.id ? (\
                                          <Check className="w-3 h-3" />\
                                        ) : (\
                                          <div className="relative w-3 h-3 flex items-center justify-center">\
                                            <div className="border border-current rounded-[2px] w-full h-full flex items-center justify-center font-mono text-[9px] font-bold leading-none">P</div>\
                                          </div>\
                                        )}\
                                      </button>\
                                      <button \
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpandedActionId(part.id); }}\
                                        className="opacity-0 group-hover:opacity-100 text-text-dim hover:text-text-main transition-opacity p-1 bg-bg-panel rounded shadow-sm border border-border-main"\
                                        title={lang === '"'en'"' ? '"'More actions'"' : '"'メニュー'"'}\
                                      >\
                                        <MoreHorizontal className="w-3 h-3" />\
                                      </button>\
                                    </>\
                                  )}\
                                  \
                                  {(expandedActionId === part.id || confirmQuickDeleteId === part.id) && (' src/components/VariationColumn.tsx

sed -i '/{expandedActionId !== item.id && (/,/{(expandedActionId === item.id || confirmQuickDeleteId === item.id || copiedItemId === item.id) && (/c\
                {expandedActionId !== item.id && (\
                  <>\
                    <button \
                      onClick={(e) => {\
                        e.preventDefault();\
                        e.stopPropagation();\
                        navigator.clipboard.writeText(item.content);\
                        setCopiedItemId(item.id);\
                        setTimeout(() => setCopiedItemId(null), 2000);\
                      }}\
                      className={`opacity-0 group-hover:opacity-100 p-1 bg-bg-panel rounded shadow-sm border border-border-main transition-all ${\
                        copiedItemId === item.id \
                          ? '"'text-green-500 bg-green-500/10 opacity-100'"'\
                          : '"'text-text-dim hover:text-green-400'"'\
                      }`}\
                      title={lang === '"'en'"' ? '"'Copy Prompt Text'"' : '"'プロンプトをコピー'"'}\
                    >\
                      {copiedItemId === item.id ? (\
                        <Check className="w-3 h-3" />\
                      ) : (\
                        <div className="relative w-3 h-3 flex items-center justify-center">\
                          <div className="border border-current rounded-[2px] w-full h-full flex items-center justify-center font-mono text-[9px] font-bold leading-none">P</div>\
                        </div>\
                      )}\
                    </button>\
                    <button \
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpandedActionId(item.id); }}\
                      className="opacity-0 group-hover:opacity-100 text-text-dim hover:text-text-main transition-opacity p-1 bg-bg-panel rounded shadow-sm border border-border-main"\
                      title={lang === '"'en'"' ? '"'More actions'"' : '"'メニュー'"'}\
                    >\
                      <MoreHorizontal className="w-3 h-3" />\
                    </button>\
                  </>\
                )}\
                \
                {(expandedActionId === item.id || confirmQuickDeleteId === item.id) && (' src/components/MasterColumn.tsx

sed -i '/{expandedActionId !== item.id && (/,/{(expandedActionId === item.id || confirmQuickDeleteId === item.id || copiedItemId === item.id) && (/c\
                {expandedActionId !== item.id && (\
                  <>\
                    <button \
                      onClick={(e) => {\
                        e.preventDefault();\
                        e.stopPropagation();\
                        navigator.clipboard.writeText(item.content);\
                        setCopiedItemId(item.id);\
                        setTimeout(() => setCopiedItemId(null), 2000);\
                      }}\
                      className={`opacity-0 group-hover:opacity-100 p-1 bg-bg-panel rounded shadow-sm border border-border-main transition-all ${\
                        copiedItemId === item.id \
                          ? '"'text-green-500 bg-green-500/10 opacity-100'"'\
                          : '"'text-text-dim hover:text-green-400'"'\
                      }`}\
                      title={lang === '"'en'"' ? '"'Copy Memo Text'"' : '"'メモをコピー'"'}\
                    >\
                      {copiedItemId === item.id ? (\
                        <Check className="w-3 h-3" />\
                      ) : (\
                        <div className="relative w-3 h-3 flex items-center justify-center">\
                          <div className="border border-current rounded-[2px] w-full h-full flex items-center justify-center font-mono text-[9px] font-bold leading-none">P</div>\
                        </div>\
                      )}\
                    </button>\
                    <button \
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpandedActionId(item.id); }}\
                      className="opacity-0 group-hover:opacity-100 text-text-dim hover:text-text-main transition-opacity p-1 bg-bg-panel rounded shadow-sm border border-border-main"\
                      title={lang === '"'en'"' ? '"'More actions'"' : '"'メニュー'"'}\
                    >\
                      <MoreHorizontal className="w-3 h-3" />\
                    </button>\
                  </>\
                )}\
                \
                {(expandedActionId === item.id || confirmQuickDeleteId === item.id) && (' src/components/MemoColumn.tsx
