import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Data } from "@/components/DriverManagement";

// Format timestamp
const getCurrentTimestamp = () => {
  const now = new Date();
  return now.toLocaleString(); // e.g., "4/20/2025, 3:45:22 PM"
};

export const exportToPDF = (data: Data[]) => {
  const doc = new jsPDF();
  const pageSize = doc.internal.pageSize;

  // 💡 Custom Header
  doc.setFontSize(18);
  doc.text("Trip9 Co.", 14, 15); // Company Name

  doc.setFontSize(14);
  doc.setTextColor(100);
  doc.text("Drivers data", pageSize.width - 60, 15);

  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text("support@trip9.com", 14, 22);


  const tableData = data.map((row) => [
    row.id,
    row.firstName,
    row.lastName,
    row.address,
    row.status,
  ]);

  // 🧾 Table with autoTable
  autoTable(doc, {
    startY: 35, // Leave space for header
    head: [['ID', 'First Name', 'Last Name', 'Address', 'Status']],
    body: tableData,

    // 💬 Footer on every page
    didDrawPage: (data) => {
      const pageCount = doc.getNumberOfPages();
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();

      doc.setFontSize(10);
      doc.text(`Page ${pageCount}`, data.settings.margin.left, pageHeight - 10);
      doc.text(getCurrentTimestamp(), pageSize.width - 60, pageHeight - 10);
    }
  });

  doc.save("drivers.pdf");
};
