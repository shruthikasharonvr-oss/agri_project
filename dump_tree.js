const fs = require('fs');
const path = require('path');

function getDirectoryStructure(dirPath) {
  const result = {};
  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      result[item] = getDirectoryStructure(fullPath);
    } else {
      result[item] = stat.size;
    }
  }
  return result;
}

const structure = getDirectoryStructure('app');
fs.writeFileSync('app_structure.json', JSON.stringify(structure, null, 2), 'utf-8');
console.log('Done');
