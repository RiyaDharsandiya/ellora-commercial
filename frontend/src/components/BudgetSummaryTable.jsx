import { FaFileExcel } from 'react-icons/fa';
import * as XLSX from 'xlsx';

function BudgetSummaryTable({monthlyData}) {
  const totalMiscExp = monthlyData.reduce((sum, month) => sum + (month.miscExp || 0), 0);
  const totalRemaining = monthlyData.reduce((sum, month) => sum + (month.remaining || 0), 0);

  // Optionally, calculate difference (though this is not standard in this context)
  const totalDifference = totalRemaining - totalMiscExp;

  //excel
  const exportToExcel = () => {
    // Prepare the data array (including totals and difference)
    const exportData = [
      ...monthlyData.map(month => ({
        Month: month.month,
        MiscExpenses: `₹${month.miscExp.toFixed(2)}`,
        Remaining: `₹${month.remaining.toFixed(2)}`
      })),
      { Month: 'Total', MiscExpenses: `₹${totalMiscExp.toFixed(2)}`, Remaining: `₹${totalRemaining.toFixed(2)}` },
      { Month: 'Difference', MiscExpenses: '', Remaining: `₹${totalDifference.toFixed(2)}` }
    ];

    // Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BudgetSummary");

    // Export to file
    XLSX.writeFile(wb, "BudgetSummary.xlsx");
  };
  return (
    <div className="bg-white p-6 rounded-xl shadow border min-w-[350px] mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Monthly Budget Summary</h3>
        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
        >
          <FaFileExcel />
          <span>Export to Excel</span>
        </button>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border-b p-2 text-left">Month</th>
            <th className="border-b p-2 text-right">Misc Expenses</th>
            <th className="border-b p-2 text-right">Remaining</th>
            <th className="border-b p-2 text-right">Difference</th>
          </tr>
        </thead>
        <tbody>
          {monthlyData.map((month, index) => (
            <tr key={index}>
              <td className="border-b p-2">{month.month}</td>
              <td className="border-b p-2 text-right">
                ₹{month.miscExp.toFixed(2)}
              </td>
              <td className="border-b p-2 text-right">
                ₹{month.remaining.toFixed(2)}
              </td>
              <td className="border-b p-2 text-right">
              ₹{(month.remaining - month.miscExp).toFixed(2)}
            </td>
            </tr>
          ))}
          <tr>
            <td className="font-bold p-2">Total</td>
            <td className="font-bold p-2 text-right">₹{totalMiscExp.toFixed(2)}</td>
            <td className="font-bold p-2 text-right">₹{totalRemaining.toFixed(2)}</td>
            <td className="font-bold p-2 text-right">
              ₹{( totalRemaining-totalMiscExp ).toFixed(2)}
            </td>
          </tr>
          {/* Optional: Difference Row */}
          <tr>
            <td className="font-bold p-2">Difference</td>
            <td colSpan="1" className="font-bold p-2 text-right">
              {/* You can leave this empty or show the difference calculation */}
            </td>
            <td className="font-bold p-2 text-right">
              {/* If you want to show the difference: */}
              ₹{totalDifference.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default BudgetSummaryTable;
