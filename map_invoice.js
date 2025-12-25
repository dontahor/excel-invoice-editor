import xlsx from 'xlsx';
const { readFile, utils } = xlsx;

// Read the file
const workbook = readFile('public/wk_38.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Dump all cells with their address and value to find the specific fields user wants
for (const key in worksheet) {
    if (key.startsWith('!')) continue;
    console.log(`${key}: ${JSON.stringify(worksheet[key].v)}`);
}

// Also try to find the structure of the table
const json = utils.sheet_to_json(worksheet, { header: 1 });
console.log("\n--- Row Structure ---");
json.forEach((row, i) => {
    console.log(`Row ${i}:`, row);
});
