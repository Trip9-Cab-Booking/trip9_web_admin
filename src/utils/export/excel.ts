import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  UserExportData,
  DriverExportData,
  TransactionExportData,
} from "@/types/common";

type ExportContext = "users" | "drivers" | "getAlltransactions";

export const exportToExcel = async (
  data: UserExportData[] | DriverExportData[] | TransactionExportData[],
  context: ExportContext
) => {
  if (!data || data.length === 0) {
    console.warn("No data available to export");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Data");

  // 🔹 Generate headers safely
  const headers = Object.keys(data[0]).map((key) => ({
    header: key,
    key,
  }));

  worksheet.columns = headers;

  // 🔹 Add rows
  data.forEach((item) => {
    worksheet.addRow(item as Record<string, unknown>);
  });

  // 🔹 Auto-size columns
  worksheet.columns.forEach((column) => {
    let maxLength = 10;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      maxLength = Math.max(maxLength, String(cell.value ?? "").length);
    });
    column.width = maxLength + 2;
  });

  const buffer = await workbook.xlsx.writeBuffer();

  const file = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(file, `${context}.xlsx`);
};
