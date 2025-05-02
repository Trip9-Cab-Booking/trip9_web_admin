import { axiosInstance } from "./axiosInstance";
import { exportToExcel } from "./export/excel";
import { exportToPDF } from "./export/pdf";

export const downloadData = async ({context, format}: {context: string, format: string}) => {
    try {
      const res = await axiosInstance.get(`/api/admin/${context}`)
      console.log(res.data);


      if(!res.data){
        const msg = res?.data?.message || "Failed to download the data";
        console.log(msg);
      }

      if(format === 'pdf'){
        exportToPDF(res.data.data, context);
      }else if(format === 'csv'){
        exportToExcel(res.data.data, context);
      }

      console.log("Data downloaded:", res.data.data);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Failed to download data:", errorMessage);
    }
  }
