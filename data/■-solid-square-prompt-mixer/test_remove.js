const prev = {};
const category = 'race';
const DEFAULT = { race: [1,2,3] };
const newCategory = [...(prev[category] || DEFAULT[category])];
console.log(newCategory);
