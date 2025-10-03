import React from "react";

const Table = ({
  colomns,
  renderRow,
  data,
}: {
  colomns: { header: string; accessor: string; className?: string }[];
  renderRow: (item: any) => React.ReactNode;
  data: any[];
}) => {
  return (
    <div className="w-full mt-4 overflow-x-auto" suppressHydrationWarning>
      <table className="w-full" suppressHydrationWarning>
        <thead className="bg-gray-50 border-b-2 border-gray-200">
          <tr>
            {colomns.map((col) => (
              <th
                key={col.accessor}
                className={`px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                  col.className ?? ""
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data && data.length > 0 ? (
            data.map((item) => renderRow(item))
          ) : (
            <tr>
              <td
                colSpan={colomns.length}
                className="px-6 py-8 text-center text-gray-500"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
