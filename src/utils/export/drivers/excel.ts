import Exceljs from "exceljs"
import {saveAs} from "file-saver";
import { Data } from '@/components/DriverManagement';


export const exportToExcel = async (data: Data[]) => {
    const workBook = new Exceljs.Workbook();
    const workSheet = workBook.addWorksheet('Data');

    //* Add headers
    workSheet.columns = Object.keys(data[0]).map((key) => ({ header: key, key}));

    //*Add rows
    data.forEach(item => workSheet.addRow(item));

    const buffer = await workBook.xlsx.writeBuffer();

    const file = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(file, "drivers.xlsx");
}
