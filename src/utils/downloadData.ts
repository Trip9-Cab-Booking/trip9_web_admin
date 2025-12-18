import { axiosInstance } from "./axiosInstance";
import { exportToExcel } from "./export/excel";
import { exportToPDF } from "./export/pdf";
import type { ExportContext } from "@/types/common";

export const downloadData = async ({
  context,
  format,
}: {
  context: ExportContext;
  format: "pdf" | "csv";
}) => {
  try {
    const res = await axiosInstance.get(`/api/admin/${context}`, {
      params: { download: true },
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!res.data) {
      console.log(res?.data?.message || "Failed to download the data");
      return;
    }

    if (format === "pdf") {
      if (context === "getAlltransactions") {
        const mapped = res.data.data.map((tx: any) => ({
          id: tx.transactionId,
          type: tx.transactionType,
          userName: "-",
          driverName: tx.driver
            ? `${tx.driver.firstName} ${tx.driver.lastName}`
            : "—",
          amount: tx.totalAmount,
          mode: tx.paymentMode,
          status: tx.status,
          date: tx.createdAt,
        }));

        exportToPDF(mapped, context);
      } else {
        exportToPDF(res.data.data, context);
      }
    }
    else {
      exportToExcel(res.data.data, context);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Failed to download data:", errorMessage);
  }
};
