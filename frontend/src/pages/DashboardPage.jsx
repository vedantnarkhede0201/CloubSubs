import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getApiErrorMessage } from '../services/api';
import DataTable from '../components/DataTable';

const metrics = [
  { key: 'Total_Clients', label: 'Total clients' },
  { key: 'Total_Subscriptions', label: 'Subscriptions' },
  { key: 'Active_Subscriptions', label: 'Active subscriptions' },
  { key: 'Total_Invoices', label: 'Total invoices' },
  { key: 'Paid_Invoices', label: 'Paid invoices' },
  { key: 'Total_Revenue', label: 'Total revenue', amount: true }
];

function displayMetric(value, amount = false) {
  if (amount) return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0));
  return new Intl.NumberFormat().format(Number(value || 0));
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    setLoading(true);
    setError('');
    try {
      const [summaryResponse, subscriptionsResponse, plansResponse] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/subscriptions'),
        api.get('/reports/plan-distribution')
      ]);
      setSummary(summaryResponse.data.data);
      setSubscriptions(subscriptionsResponse.data.data.slice(0, 5));
      setPlans(plansResponse.data.data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDashboard(); }, []);

  const maxPlanCount = Math.max(1, ...plans.map((plan) => Number(plan.Subscription_Count)));

  return (
    <section>
      <div className="page-heading dashboard-heading">
        <div>
          <p className="eyebrow">WORKSPACE / OVERVIEW</p>
          <h1>Overview</h1>
          <p className="page-description">Billing operations, subscription health and account activity.</p>
        </div>
        <Link className="button button-primary" to="/subscriptions">View subscriptions <span aria-hidden="true">→</span></Link>
      </div>

      {error && <div className="alert alert-error" role="alert"><span>{error}</span><button className="text-button" type="button" onClick={loadDashboard}>Retry</button></div>}

      <div className="metrics-grid">
        {metrics.map((metric) => (
          <article className="metric-card" key={metric.key}>
            <p>{metric.label}</p>
            <strong>{loading ? '—' : summary ? displayMetric(summary[metric.key], metric.amount) : '—'}</strong>
          </article>
        ))}
      </div>

      <div className="dashboard-lower-grid">
        <section className="panel">
          <div className="panel-toolbar">
            <div><h2>Recent subscriptions</h2><p>Latest records from your workspace</p></div>
            <Link className="subtle-link" to="/subscriptions">View all <span aria-hidden="true">→</span></Link>
          </div>
          {loading ? <div className="loading-state"><span className="spinner" aria-hidden="true" />Loading subscription data…</div> : (
            <DataTable
              columns={[
                { key: 'Subscription_ID', label: 'Subscription' },
                { key: 'Client_ID', label: 'Client' },
                { key: 'Tier_ID', label: 'Tier' },
                { key: 'Status', label: 'Status', type: 'status' }
              ]}
              rows={subscriptions}
              rowKey="Subscription_ID"
              emptyTitle="No subscriptions yet"
            />
          )}
        </section>
        <section className="panel plans-panel">
          <div className="panel-toolbar">
            <div><h2>Plan distribution</h2><p>Current subscriptions by tier</p></div>
            <span className="panel-icon" aria-hidden="true">◇</span>
          </div>
          {loading ? <div className="loading-state"><span className="spinner" aria-hidden="true" />Loading plans…</div> : plans.length ? (
            <div className="plan-bars">
              {plans.map((plan) => (
                <div className="plan-bar-row" key={plan.Tier_ID}>
                  <div className="plan-bar-meta"><span>{plan.Tier_Name}</span><strong>{plan.Subscription_Count}</strong></div>
                  <div className="progress-track" role="img" aria-label={`${plan.Subscription_Count} subscriptions on ${plan.Tier_Name}`}>
                    <span style={{ width: `${(Number(plan.Subscription_Count) / maxPlanCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="inline-empty">No plan distribution data.</p>}
          <Link className="panel-footer-link" to="/reports">Explore all reports <span aria-hidden="true">↗</span></Link>
        </section>
      </div>
    </section>
  );
}
