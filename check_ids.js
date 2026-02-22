const fs = require('fs');
const code = fs.readFileSync('js/app.js', 'utf8');

const idRegex = /id=['"]([^'"]+)['"]/g;
const htmlIds = new Set();
let match;
while ((match = idRegex.exec(code)) !== null) {
    htmlIds.add(match[1]);
}

const getElementByIdRegex = /getElementById\(['"]([^'"]+)['"]\)/g;
const getIds = new Set();
while ((match = getElementByIdRegex.exec(code)) !== null) {
    getIds.add(match[1]);
}

const unusedHtmlIds = [...htmlIds].filter(id => !getIds.has(id));
console.log('IDs in HTML template not queried via getElementById:', unusedHtmlIds);

const missingIds = [...getIds].filter(id => !htmlIds.has(id) && id !== 'app-content' && id !== 'modal-container'); // these are in index.html
console.log('IDs queried via getElementById not found in HTML template strings in app.js:', missingIds);

const querySelectorRegex = /querySelector\(['"]([^'"]+)['"]\)/g;
const qSelectors = new Set();
while ((match = querySelectorRegex.exec(code)) !== null) {
    qSelectors.add(match[1]);
}

const querySelectorAllRegex = /querySelectorAll\(['"]([^'"]+)['"]\)/g;
const qAllSelectors = new Set();
while ((match = querySelectorAllRegex.exec(code)) !== null) {
    qAllSelectors.add(match[1]);
}

console.log('Selectors used in querySelector:', [...qSelectors]);
console.log('Selectors used in querySelectorAll:', [...qAllSelectors]);
