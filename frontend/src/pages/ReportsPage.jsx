import { useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '../services/api';
import DataTable from '../components/DataTable';

const reports = [
  { endpoint: '/reports/payment-summary', title: 'Payments by status', columns: [
    { key: 'Status', label: 'Status', type: 'status' },
    { key: 'Payment_Count', label: 'Payments' },
    { key: 'Total_Amount', label: 'Amount', type: 'currency' }
  ] },
  { endpoint: '/reports/subscriptions-by-status', title: 'Subscriptions by status', columns: [
    { key: 'Status', label: 'Status', type: 'status' },
    { key: 'Subscription_Count', label: 'Subscriptions' }
  ] },
  { endpoint: '/reports/invoices-by-status', title: 'Invoices by status', columns: [
    { key: 'Invoice_Status', label: 'Status', type: 'status' },
    { key: 'Invoice_Count', label: 'Invoices' },
    { key: 'Total_Amount', label: 'Amount', type: 'currency' }
  ] },
  { endpoint: '/reports/plan-distribution', title: 'Plan distribution', columns: [
    { key: 'Tier_Name', label: 'Plan' },
    { key: 'Subscription_Count', label: 'Subscriptions' }
  ] },
  { endpoint: '/reports/storage-usage', title: 'Storage usage', columns: [
    { key: 'Company_Name', label: 'Client' },
    { key: 'Subscription_ID', label: 'Subscription' },
    { key: 'Tier_Name', label: 'Plan' },
    { key: 'Total_Storage_Used_GB', label: 'Storage used (GB)' },
    { key: 'Latest_Usage_Date', label: 'Latest usage', type: 'date' }
  ] },
  { endpoint: '/reports/client-subscriptions', title: 'Client subscriptions', columns: [
    { key: 'Company_Name', label: 'Client' },
    { key: 'Subscription_ID', label: 'Subscription' },
    { key: 'Tier_Name', label: 'Plan' },
    { key: 'Monthly_Rate', label: 'Monthly rate', type: 'currency' },
    { key: 'Status', label: 'Status', type: 'status' }
  ] }
];

function ReportPanel({ report, rows }) {
  return (
    <section className="panel report-panel">
      <div className="panel-toolbar"><div><h2>{report.title}</h2><p>Calculated from current database records</p></div></div>
      <DataTable columns={report.columns} rows={rows} rowKey={report.columns.find((column) => column.key.endsWith('_ID'))?.key || report.columns[0].key} emptyTitle="No report data" />
    </section>
  );
}

export default function ReportsPage() {
  const [data, setData] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadReports() {
    setLoading(true);
    setError('');
    try {
      const responses = await Promise.all(reports.map((report) => api.get(report.endpoint)));
      setData(Object.fromEntries(reports.map((report, index) => [report.endpoint, responses[index].data.data])));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadReports(); }, []);

  return (
    <section>
      <div className="page-heading">
        <div><p className="eyebrow">WORKSPACE / INSIGHTS</p><h1>Reports</h1><p className="page-description">Database-driven views into billing, plans and service usage.</p></div>
        <button type="button" className="button button-secondary" onClick={loadReports}>↻ Refresh reports</button>
      </div>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {loading ? <div className="panel loading-state"><span className="spinner" aria-hidden="true" />Loading reports from CloudSubs…</div> : (
        <div className="reports-grid">
          {reports.map((report) => <ReportPanel key={report.endpoint} report={report} rows={data[report.endpoint] || []} />)}
        </div>
      )}
    </section>
  );
}
