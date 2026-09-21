const fs = require('fs');
let content = fs.readFileSync('src/components/AttributeMixer.tsx', 'utf8');

// 1085: Insert to editor button
content = content.replace(
  'className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded"',
  'className={`p-1.5 rounded ${theme === \'mono\' ? \'text-black hover:bg-black/10\' : \'text-blue-500 hover:bg-blue-500/10\'}`}'
);

// 1252: Save icon
content = content.replace(
  '<Save className="w-4 h-4 text-blue-500" />',
  '<Save className={`w-4 h-4 ${theme === \'mono\' ? \'text-black\' : \'text-blue-500\'}`} />'
);

// 1349: Save combination edit checkmark
content = content.replace(
  'className="text-blue-500 p-1 hover:bg-blue-500/10 rounded"',
  'className={`p-1 rounded ${theme === \'mono\' ? \'text-black hover:bg-black/10\' : \'text-blue-500 hover:bg-blue-500/10\'}`}'
);

// 1389: Load combination button
content = content.replace(
  'className="w-full text-center py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 rounded text-[11px] font-bold transition-colors"',
  'className={`w-full text-center py-1.5 rounded text-[11px] font-bold transition-colors ${theme === \'mono\' ? \'bg-black/10 hover:bg-black/20 text-black\' : \'bg-blue-600/10 hover:bg-blue-600/20 text-blue-500\'}`}'
);

// 1406: Selected items badge
content = content.replace(
  'className="text-[10px] font-mono font-bold text-blue-500 whitespace-nowrap bg-blue-500/10 px-2 py-0.5 rounded"',
  'className={`text-[10px] font-mono font-bold whitespace-nowrap px-2 py-0.5 rounded ${theme === \'mono\' ? \'text-black bg-black/10\' : \'text-blue-500 bg-blue-500/10\'}`}'
);

// hover:text-blue-500 globally replacing with conditional if easy, but maybe it's too much Regex. Let's just do a few common ones.
content = content.replace(/hover:text-blue-500/g, 'hover:text-blue-500'); // actually wait, I'd need conditional templating which is hard to blindly regex.

fs.writeFileSync('src/components/AttributeMixer.tsx', content);
