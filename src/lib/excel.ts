import ExcelJS from 'exceljs';

export interface ExcelData {
    invoiceNumber: string;
    invoiceDate: string;
    dateRange: string;
    originalWorkbook: ExcelJS.Workbook;
}

export async function parseExcel(file: File): Promise<ExcelData> {
    const workbook = new ExcelJS.Workbook();
    const arrayBuffer = await file.arrayBuffer();
    await workbook.xlsx.load(arrayBuffer);
    const worksheet = workbook.getWorksheet(1); // Assuming first sheet

    if (!worksheet) throw new Error("No worksheet found");

    const invoiceCell = worksheet.getCell('B1');
    const dateCell = worksheet.getCell('B2');
    const rangeCell = worksheet.getCell('B15');

    return {
        invoiceNumber: invoiceCell.value ? String(invoiceCell.value).replace('Invoice: ', '') : '',
        invoiceDate: dateCell.value ? (dateCell.value instanceof Date ? dateCell.value.toISOString().split('T')[0] : String(dateCell.value)) : '',
        dateRange: rangeCell.value ? String(rangeCell.value).replace('Confirmation of hours worked From ', '') : '',
        originalWorkbook: workbook,
    };
}

export async function generateExcel(
    workbook: ExcelJS.Workbook,
    data: { invoiceNumber: string; invoiceDate: string; dateRange: string }
): Promise<Blob> {
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) throw new Error("No worksheet found");

    worksheet.getCell('B1').value = `Invoice: ${data.invoiceNumber}`;
    worksheet.getCell('B2').value = data.invoiceDate;
    worksheet.getCell('B15').value = `Confirmation of hours worked From ${data.dateRange}`;

    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
