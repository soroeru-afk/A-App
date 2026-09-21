const fs = require('fs');
let code = fs.readFileSync('src/components/PreviewColumn.tsx', 'utf8');

code = code.replace(
`          )}
          </>
          )
        </div>`,
`          )}
          </>
          )}
        </div>`
);

fs.writeFileSync('src/components/PreviewColumn.tsx', code);
