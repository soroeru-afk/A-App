const fs = require('fs');
let code = fs.readFileSync('src/components/PreviewColumn.tsx', 'utf8');

code = code.replace(
`          {isMemoTab ? (
            <div className="px-2 py-1 text-[9px] font-mono border border-text-dim text-text-dim rounded outline-none cursor-default">
              MEMO MODE
            </div>
          ) : (
            <>
              <input `,
`          {isMemoTab && (
            <div className="px-2 py-1 text-[9px] font-mono border border-text-dim text-text-dim rounded outline-none cursor-default">
              MEMO MODE
            </div>
          )}
              <input `
);

code = code.replace(
`          )}
          </>
          )}
        </div>`,
`          )}
        </div>`
);

fs.writeFileSync('src/components/PreviewColumn.tsx', code);
