import pkg from 'xlsx';
const { readFile, utils } = pkg;

const workbook = readFile('public/wk_38.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const exactData = utils.sheet_to_json(sheet, { header: 1 });
console.log('Row 14 (Index 14):', exactData[14]);

const objData = utils.sheet_to_json(sheet);
console.log('Object Row 14 (approx):', objData[13]); // objData index is shifted because row 0 is header
console.log('Keys:', Object.keys(objData[0]));
