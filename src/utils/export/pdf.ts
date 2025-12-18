import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  UserExportData,
  DriverExportData,
  TransactionExportData,
} from "@/types/common";

type ExportContext = "users" | "drivers" | "getAlltransactions";

// Format timestamp
const getCurrentTimestamp = () => {
  const now = new Date();
  return now.toLocaleString();
};


export const exportToPDF = (
  data: UserExportData[] | DriverExportData[] | TransactionExportData[],
  context: ExportContext
) => {
  

  const doc = new jsPDF();
  const pageSize = doc.internal.pageSize;

  // 💡 Custom Header
  doc.setFontSize(18);
  doc.text("Trip9 Co.", 14, 15); 

  doc.setFontSize(14);
  doc.setTextColor(100);
  doc.text(`${context} data`, pageSize.width - 60, 15);

  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text("support@trip9.com", 14, 22);

  //* Drivers PDF
  if(context === "drivers"){
    const rows = data as DriverExportData[];
      const tableData = rows.map((row) => [
          row.firstName ?? '',
          row.lastName ?? '',
          row.gender ?? '',
          row.address ?? '',
        //   row._id ?? '',
            row.phone ?? "",
          row.status ?? '',
      ]);

      // 🧾 Table with autoTable
      autoTable(doc, {
        startY: 35, // Leave space for header
        head: [['Sl No', 'First Name', 'Last Name','Gender', 'Address', 'Phone', 'Status']],
        body: tableData.map((row, index) => [index + 1, ...row]),

        // 💬 Footer on every page
        didDrawPage: (data) => {
          const pageCount = doc.getNumberOfPages();
          const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();

          doc.setFontSize(10);
          doc.text(`Page ${pageCount}`, data.settings.margin.left, pageHeight - 10);
          doc.text(getCurrentTimestamp(), pageSize.width - 60, pageHeight - 10);
        }
      });
  }else if (context === "getAlltransactions"){
    const rows = data as TransactionExportData[]; 
    const tableData = rows.map((row) => [
    row.id ?? '',
    row.type ?? '',
    row.userName ?? '',
    row.driverName ?? '—',
    row.amount ?? '',
    row.mode ?? '',
    row.status ?? '',
    row.date ? new Date(row.date).toLocaleString() : '',
  ]);

  autoTable(doc, {
    startY: 35,
    head: [[
      'Txn ID',
      'Type',
      'User',
      'Driver',
      'Amount',
      'Mode',
      'Status',
      'Date'
    ]],
    body: tableData,
    didDrawPage: (data) => {
      const pageCount = doc.getNumberOfPages();
      const pageHeight = pageSize.height || pageSize.getHeight();

      doc.setFontSize(10);
      doc.text(`Page ${pageCount}`, data.settings.margin.left, pageHeight - 10);
      doc.text(getCurrentTimestamp(), pageSize.width - 60, pageHeight - 10);
    }
  });
  }
  else{
    //* Users PDF
    const rows = data as UserExportData[]; 
    const tableData = rows.map((row) => [
        row.firstName ?? '',
        row.lastName ?? '',
        row.gender ?? '',
        row.phone ?? '',
        row.status ?? '',
        row._id ?? '',
      ]);

      // 🧾 Table with autoTable
      autoTable(doc, {
        startY: 35, // Leave space for header
        head: [['Sl No', 'First Name', 'Last Name', 'Gender', 'Phone', 'Status', 'User ID']],
        body: tableData.map((row, index) => [index + 1, ...row]),

        // 💬 Footer on every page
        didDrawPage: (data) => {
          const pageCount = doc.getNumberOfPages();
          const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();

          doc.setFontSize(10);
          doc.text(`Page ${pageCount}`, data.settings.margin.left, pageHeight - 10);
          doc.text(getCurrentTimestamp(), pageSize.width - 60, pageHeight - 10);
        }
      });
  }

  doc.save(`${context}.pdf`);
};
