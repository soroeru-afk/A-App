const fs = require('fs');
let code = fs.readFileSync('src/components/PreviewColumn.tsx', 'utf8');

const oldPositiveChange = `onChange={(e) => {
                lastUserTextRef.current = e.target.value;
                setEditorText(e.target.value);`;
const newPositiveChange = `onChange={(e) => {
                setSearchSelectionActive(false);
                lastUserTextRef.current = e.target.value;
                setEditorText(e.target.value);`;

const oldPositiveSelect = `onSelect={(e) => {
                setActiveEditor('positive');`;
const newPositiveSelect = `onSelect={(e) => {
                setSearchSelectionActive(false);
                setActiveEditor('positive');`;

const oldNegativeChange = `onChange={(e) => {
                lastUserNegativeTextRef.current = e.target.value;
                setNegativeEditorText(e.target.value);`;
const newNegativeChange = `onChange={(e) => {
                setSearchSelectionActive(false);
                lastUserNegativeTextRef.current = e.target.value;
                setNegativeEditorText(e.target.value);`;

const oldNegativeSelect = `onSelect={(e) => {
                setActiveEditor('negative');`;
const newNegativeSelect = `onSelect={(e) => {
                setSearchSelectionActive(false);
                setActiveEditor('negative');`;

const oldPositiveMouseDown = `ref={positiveTextRef}
              value={editorText}`;
const newPositiveMouseDown = `ref={positiveTextRef}
              onMouseDown={() => setSearchSelectionActive(false)}
              value={editorText}`;

const oldNegativeMouseDown = `ref={negativeTextRef}
              value={negativeEditorText}`;
const newNegativeMouseDown = `ref={negativeTextRef}
              onMouseDown={() => setSearchSelectionActive(false)}
              value={negativeEditorText}`;

code = code.replace(oldPositiveChange, newPositiveChange);
code = code.replace(oldPositiveSelect, newPositiveSelect);
code = code.replace(oldNegativeChange, newNegativeChange);
code = code.replace(oldNegativeSelect, newNegativeSelect);
code = code.replace(oldPositiveMouseDown, newPositiveMouseDown);
code = code.replace(oldNegativeMouseDown, newNegativeMouseDown);

fs.writeFileSync('src/components/PreviewColumn.tsx', code);
