import { useCallback, useEffect, useMemo, useState } from 'react';
import api, { getApiErrorMessage } from '../services/api';
import DataTable from './DataTable';
import Modal from './Modal';
import ResourceForm from './ResourceForm';
import SubscriptionTierModal from '../pages/SubscriptionTierModal';

export default function ResourcePage({ resource }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState(null);
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState(null);
  const [tierModal, setTierModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadRows = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const { data } = await api.get(resource.endpoint);
      setRows(data.data);
    } catch (error) {
      setLoadError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [resource.endpoint]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const visibleRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return rows;
    return rows.filter((row) => Object.values(row).some((value) => String(value ?? '').toLowerCase().includes(normalizedQuery)));
  }, [query, rows]);

  async function submitRecord(values) {
    setSaving(true);
    setNotice(null);
    try {
      if (modal.record) {
        const id = encodeURIComponent(modal.record[resource.primaryKey]);
        await api.put(`${resource.endpoint}/${id}`, values);
        setNotice({ type: 'success', message: `${resource.singular} updated successfully.` });
      } else {
        await api.post(resource.endpoint, values);
        setNotice({ type: 'success', message: `${resource.singular} created successfully.` });
      }
      setModal(null);
      await loadRows();
    } catch (error) {
      setNotice({ type: 'error', message: getApiErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  }

  async function deleteRecord(record) {
    const id = record[resource.primaryKey];
    if (!window.confirm(`Delete ${resource.singular} ${id}? This cannot be undone.`)) return;
    setNotice(null);
    try {
      await api.delete(`${resource.endpoint}/${encodeURIComponent(id)}`);
      setNotice({ type: 'success', message: `${resource.singular} deleted successfully.` });
      await loadRows();
    } catch (error) {
      setNotice({ type: 'error', message: getApiErrorMessage(error) });
    }
  }

  function rowActions(record) {
    return (
      <div className="table-action-group">
        {resource.endpoint === '/subscriptions' && record.Status === 'Active' && (
          <button type="button" className="text-button" onClick={() => setTierModal(record)}>Change tier</button>
        )}
        <button type="button" className="icon-button row-edit" aria-label={`Edit ${resource.singular} ${record[resource.primaryKey]}`} onClick={() => setModal({ record })}>Edit</button>
        <button type="button" className="icon-button row-delete" aria-label={`Delete ${resource.singular} ${record[resource.primaryKey]}`} onClick={() => deleteRecord(record)}>Delete</button>
      </div>
    );
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">WORKSPACE / MANAGEMENT</p>
          <h1>{resource.title}</h1>
          <p className="page-description">{resource.description}</p>
        </div>
        <button type="button" className="button button-primary" onClick={() => setModal({ record: null })}>
          <span aria-hidden="true">＋</span> Add {resource.singular}
        </button>
      </div>

      {notice && <div className={`alert alert-${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>{notice.message}</div>}

      <section className="panel">
        <div className="panel-toolbar">
          <div>
            <h2>All {resource.title.toLowerCase()}</h2>
            <p>{rows.length} database {rows.length === 1 ? 'record' : 'records'}</p>
          </div>
          <label className="search-field">
            <span className="sr-only">Search {resource.title.toLowerCase()}</span>
            <span aria-hidden="true">⌕</span>
            <input type="search" placeholder={`Search ${resource.title.toLowerCase()}…`} value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
        </div>
        {loading ? (
          <div className="loading-state"><span className="spinner" aria-hidden="true" />Loading {resource.title.toLowerCase()}…</div>
        ) : loadError ? (
          <div className="error-state" role="alert">
            <strong>Could not load {resource.title.toLowerCase()}</strong>
            <p>{loadError}</p>
            <button className="button button-secondary" type="button" onClick={loadRows}>Try again</button>
          </div>
        ) : (
          <DataTable
            columns={resource.columns}
            rows={visibleRows}
            rowKey={resource.primaryKey}
            actions={rowActions}
            emptyTitle={query ? 'No matching records' : `No ${resource.title.toLowerCase()} found`}
            emptyDescription={query ? 'Try another search term.' : 'No matching records are currently available in the database.'}
          />
        )}
      </section>

      {modal && (
        <Modal title={`${modal.record ? 'Edit' : 'Add'} ${resource.singular}`} onClose={() => setModal(null)} wide>
          <ResourceForm resource={resource} record={modal.record} onSubmit={submitRecord} onCancel={() => setModal(null)} saving={saving} />
        </Modal>
      )}
      {tierModal && (
        <SubscriptionTierModal
          subscription={tierModal}
          onClose={() => setTierModal(null)}
          onUpdated={async () => {
            await loadRows();
            setNotice({ type: 'success', message: 'Subscription tier updated successfully.' });
          }}
        />
      )}
    </section>
  );
}
