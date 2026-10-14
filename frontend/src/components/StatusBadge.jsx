export default function StatusBadge({ status }) {
  const normalized = String(status || 'Unknown').toLowerCase().replaceAll(' ', '-');
  return <span className={`status-badge status-${normalized}`}>{status || 'Unknown'}</span>;
}
