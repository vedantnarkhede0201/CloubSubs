import StatusBadge from './StatusBadge';

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(date);
}

function formatAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '—';
  return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

function CellValue({ value, type }) {
  if (type === 'status') return <StatusBadge status={value} />;
  if (type === 'date') return formatDate(value);
  if (type === 'currency') return formatAmount(value);
  if (type === 'boolean') {
    return <span className={`renewal-indicator ${value ? 'is-enabled' : 'is-disabled'}`}>{value ? 'On' : 'Off'}</span>;
  }
  return value === null || value === undefined || value === '' ? '—' : String(value);
}

export default function DataTable({ columns, rows, rowKey, actions, emptyTitle = 'No records yet', emptyDescription = 'Records from your database will appear here.' }) {
  if (!rows.length) {
    return (
      <div className="empty-state">
        <span className="empty-state-icon" aria-hidden="true">⌕</span>
        <h3>{emptyTitle}</h3>
        <p>{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => <th scope="col" key={column.key}>{column.label}</th>)}
            {actions && <th scope="col" className="actions-heading">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row[rowKey] ?? 'record'}-${index}`}>
              {columns.map((column) => (
                <td key={column.key}><CellValue value={row[column.key]} type={column.type} /></td>
              ))}
              {actions && <td className="row-actions">{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
