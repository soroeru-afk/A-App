#!/bin/bash
sed -i '/<div className={`absolute top-2 right-6 ${confirmQuickDeleteId === item.id ? '"'opacity-100'"' : '"'opacity-0 group-hover:opacity-100'"'} flex items-center transition-opacity bg-bg-panel rounded shadow-sm border border-border-main overflow-hidden`}>/,/<\/div>/c\
              <div className={`absolute top-2 right-6 flex items-center gap-1`}>\
                {expandedActionId !== item.id && (\
                  <button \
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpandedActionId(item.id); }}\
                    className="opacity-0 group-hover:opacity-100 text-text-dim hover:text-text-main transition-opacity p-1 bg-bg-panel rounded shadow-sm border border-border-main"\
                    title={lang === '"'en'"' ? '"'More actions'"' : '"'メニュー'"'}\
                  >\
                    <MoreHorizontal className="w-3 h-3" />\
                  </button>\
                )}\
                \
                {(expandedActionId === item.id || confirmQuickDeleteId === item.id || copiedItemId === item.id) && (\
                  <>\
                    <div className="flex items-center bg-bg-panel rounded shadow-sm border border-border-main overflow-hidden">\
                      <button \
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (currentOnReorder && index > 0) currentOnReorder(index, 0); }}\
                        className="p-1.5 text-text-dim hover:text-text-main hover:bg-bg-input transition-colors disabled:opacity-30 disabled:hover:bg-transparent"\
                        disabled={index === 0}\
                        title="Move to Top"\
                      ><ChevronsUp className="w-3 h-3" /></button>\
                      <button \
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (currentOnReorder && index < currentList.length - 1) currentOnReorder(index, currentList.length - 1); }}\
                        className="p-1.5 text-text-dim hover:text-text-main hover:bg-bg-input transition-colors disabled:opacity-30 disabled:hover:bg-transparent"\
                        disabled={index === currentList.length - 1}\
                        title="Move to Bottom"\
                      ><ChevronsDown className="w-3 h-3" /></button>\
                    </div>\
                    <button \
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (onDuplicate) onDuplicate(item.id); }}\
                      className="p-1.5 text-text-dim hover:text-blue-400 bg-bg-panel rounded shadow-sm border border-border-main"\
                      title="Duplicate"\
                    ><Copy className="w-3 h-3" /></button>\
                    <button \
                      onClick={(e) => {\
                        e.preventDefault();\
                        e.stopPropagation();\
                        navigator.clipboard.writeText(item.content);\
                        setCopiedItemId(item.id);\
                        setTimeout(() => setCopiedItemId(null), 2000);\
                      }}\
                      className={`p-1.5 bg-bg-panel rounded shadow-sm border border-border-main ${\
                        copiedItemId === item.id \
                          ? '"'text-green-500 bg-green-500/10'"'\
                          : '"'text-text-dim hover:text-green-400 hover:bg-bg-input'"'\
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
                      onClick={(e) => {\
                        e.preventDefault();\
                        e.stopPropagation();\
                        if (confirmQuickDeleteId === item.id) {\
                          currentOnDelete(item.id);\
                          setConfirmQuickDeleteId(null);\
                        } else {\
                          setConfirmQuickDeleteId(item.id);\
                          setTimeout(() => setConfirmQuickDeleteId(null), 3000);\
                        }\
                      }}\
                      className={`p-1.5 bg-bg-panel rounded shadow-sm border border-border-main ${\
                        confirmQuickDeleteId === item.id \
                          ? '"'text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 opacity-100'"' \
                          : '"'text-text-dim hover:text-red-400 hover:bg-bg-input'"'\
                      }`}\
                      title={confirmQuickDeleteId === item.id ? '"'Confirm delete'"' : '"'Delete'"'}\
                    ><Trash2 className="w-3 h-3" /></button>\
                    <button \
                      onClick={(e) => startEdit(item, e)}\
                      className="p-1.5 text-text-dim hover:text-blue-400 bg-bg-panel rounded shadow-sm border border-border-main transition-colors"\
                    ><Pencil className="w-3 h-3" /></button>\
                    <button \
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpandedActionId(null); }}\
                      className="p-1.5 text-text-dim hover:text-text-main bg-bg-panel rounded shadow-sm border border-border-main"\
                      title="Close"\
                    ><X className="w-3 h-3" /></button>\
                  </>\
                )}\
              </div>' src/components/MemoColumn.tsx
