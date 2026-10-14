import { useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '../services/api';
import Modal from '../components/Modal';

export default function SubscriptionTierModal({ subscription, onClose, onUpdated }) {
  const [tiers, setTiers] = useState([]);
  const [selectedTierId, setSelectedTierId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/pricing-tiers')
      .then(({ data }) => {
        if (active) {
          setTiers(data.data);
          setSelectedTierId(subscription.Tier_ID);
        }
      })
      .catch((requestError) => {
        if (active) setError(getApiErrorMessage(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [subscription.Tier_ID]);

  const currentTier = tiers.find((tier) => tier.Tier_ID === subscription.Tier_ID);
  const selectedTier = tiers.find((tier) => tier.Tier_ID === selectedTierId);

  async function submit(event) {
    event.preventDefault();
    if (!selectedTierId || selectedTierId === subscription.Tier_ID) {
      setError('Choose a different pricing tier before continuing.');
      return;
    }
    if (!window.confirm(`Change this active subscription to ${selectedTier?.Tier_Name}? Existing invoices will not be changed.`)) return;
    setSaving(true);
    setError('');
    try {
      await api.patch(`/subscriptions/${encodeURIComponent(subscription.Subscription_ID)}/tier`, { tierId: selectedTierId });
      await onUpdated();
      onClose();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Adjust subscription tier" onClose={onClose}>
      <form className="record-form tier-form" onSubmit={submit}>
        <div className="current-subscription">
          <span className="eyebrow">ACTIVE SUBSCRIPTION</span>
          <strong>{subscription.Subscription_ID}</strong>
          <span>Client {subscription.Client_ID} · Current tier {currentTier?.Tier_Name || subscription.Tier_ID}</span>
        </div>
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        {loading ? <div className="loading-state"><span className="spinner" aria-hidden="true" />Loading available tiers…</div> : (
          <>
            <div className="form-field">
              <label htmlFor="new-tier">New pricing tier</label>
              <select id="new-tier" value={selectedTierId} onChange={(event) => setSelectedTierId(event.target.value)} required>
                {tiers.map((tier) => <option value={tier.Tier_ID} key={tier.Tier_ID}>{tier.Tier_Name} — {tier.Tier_ID}</option>)}
              </select>
            </div>
            {selectedTier && <div className="tier-preview">
              <div><span>Monthly rate</span><strong>{new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(selectedTier.Monthly_Rate))}</strong></div>
              <div><span>Maximum users</span><strong>{selectedTier.Max_Users}</strong></div>
              <div><span>Storage limit</span><strong>{selectedTier.Storage_GB} GB</strong></div>
            </div>}
            <p className="form-hint">Previously generated invoices remain unchanged.</p>
          </>
        )}
        <div className="form-actions">
          <button type="button" className="button button-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="button button-primary" disabled={loading || saving || !selectedTierId || selectedTierId === subscription.Tier_ID}>
            {saving ? 'Updating…' : 'Confirm tier change'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
