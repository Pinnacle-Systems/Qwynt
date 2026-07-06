const TransactionGrid = ({
  title = "Items",
  className = "",
  containerClassName = "",
  tableClassName = "w-full border-collapse table-fixed",
  headClassName = "bg-gray-200 text-gray-800 sticky top-0 z-10",
  bodyClassName = "",
  footer,
  columns = [],
  rows = [],
  getRowKey,
  getRowClassName,
  renderRow,
  emptyState = null,
}) => {
  const visibleRows = Array.isArray(rows) ? rows : [];

  return (
    <div
      className={`border border-slate-200 px-2 bg-white rounded-md shadow-sm w-full h-full min-h-0 flex flex-col ${containerClassName}`}
    >
      {title ? (
        <div className="flex justify-between items-center my-2 shrink-0">
          <h2 className="font-medium text-slate-700">{title}</h2>
        </div>
      ) : null}

      <div className={`w-full flex-1 min-h-0 overflow-auto my-1 ${className}`}>
        <table className={tableClassName}>
          <thead className={headClassName}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={column.className}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className={bodyClassName}>
            {visibleRows.length === 0 && emptyState ? (
              <tr>
                <td colSpan={columns.length}>{emptyState}</td>
              </tr>
            ) : (
              visibleRows.map((row, index) => (
                <tr
                  key={getRowKey ? getRowKey(row, index) : index}
                  className={getRowClassName ? getRowClassName(row, index) : undefined}
                >
                  {renderRow(row, index)}
                </tr>
              ))
            )}
          </tbody>

          {footer ? <tfoot className="sticky bottom-0 z-10 bg-gray-50">{footer}</tfoot> : null}
        </table>
      </div>
    </div>
  );
};

export default TransactionGrid;
