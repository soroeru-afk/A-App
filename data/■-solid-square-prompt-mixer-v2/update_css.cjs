const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

const newCss = `
/* Square Slider for Preview Column */
input[type=range].square-slider {
  -webkit-appearance: none;
  background: transparent;
}
input[type=range].square-slider:focus {
  outline: none;
}
input[type=range].square-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 14px;
  width: 10px;
  border-radius: 2px;
  background: #737373; /* neutral-500 */
  border: 1px solid #404040; /* neutral-700 */
  border-top: 1px solid #a3a3a3; /* neutral-400 */
  border-left: 1px solid #a3a3a3;
  box-shadow: 1px 1px 3px rgba(0,0,0,0.5), inset -1px -1px 2px rgba(0,0,0,0.4), inset 1px 1px 2px rgba(255,255,255,0.3);
  cursor: pointer;
  margin-top: -5px;
}
input[type=range].square-slider::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: var(--border-main);
  border-radius: 2px;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.5);
}
input[type=range].square-slider::-moz-range-thumb {
  height: 14px;
  width: 10px;
  border-radius: 2px;
  background: #737373;
  border: 1px solid #404040;
  border-top: 1px solid #a3a3a3;
  border-left: 1px solid #a3a3a3;
  box-shadow: 1px 1px 3px rgba(0,0,0,0.5), inset -1px -1px 2px rgba(0,0,0,0.4), inset 1px 1px 2px rgba(255,255,255,0.3);
  cursor: pointer;
}
input[type=range].square-slider::-moz-range-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: var(--border-main);
  border-radius: 2px;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.5);
}
`;

fs.writeFileSync('src/index.css', css + newCss);
