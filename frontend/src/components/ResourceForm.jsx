import { useState } from 'react';

function initialValues(fields, record) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, definition]) => {
      const value = record?.[key];
      if (value === null || value === undefined) return [key, ''];
      if (definition.type === 'date') {
        return [key, String(value).slice(0, 10)];
      }
      if (definition.type === 'select' && (value === 1 || value === true)) return [key, '1'];
      if (definition.type === 'select' && (value === 0 || value === false)) return [key, '0'];
      return [key, String(value)];
    })
  );
}

export default function ResourceForm({ resource, record, onSubmit, onCancel, saving }) {
  const [values, setValues] = useState(() => initialValues(resource.fields, record));
  const editing = Boolean(record);

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = {};
    for (const [key, definition] of Object.entries(resource.fields)) {
      if (editing && key === resource.primaryKey) continue;
      const value = values[key];
      if (value === '' && definition.nullable) {
        payload[key] = null;
      } else if (value !== '') {
        payload[key] = definition.type === 'number' ? Number(value) : value;
      }
    }
    await onSubmit(payload);
  }

  return (
    <form className="record-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        {Object.entries(resource.fields).map(([key, definition]) => {
          const disabled = editing && key === resource.primaryKey;
          const value = values[key] ?? '';
          const commonProps = {
            id: `field-${key}`,
            name: key,
            value,
            required: definition.required ?? !definition.nullable,
            disabled,
            maxLength: definition.maxLength,
            onChange: (event) => setValues((current) => ({ ...current, [key]: event.target.value }))
          };
          return (
            <div className="form-field" key={key}>
              <label htmlFor={`field-${key}`}>{definition.label}</label>
              {definition.type === 'select' ? (
                <select {...commonProps}>
                  <option value="">Select {definition.label.toLowerCase()}</option>
                  {definition.options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
                </select>
              ) : (
                <input
                  {...commonProps}
                  type={definition.type === 'number' ? 'number' : definition.type}
                  min={definition.min}
                  step={definition.step}
                  onClick={definition.type === 'date'
                    ? (event) => event.currentTarget.showPicker?.()
                    : undefined}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="form-actions">
        <button type="button" className="button button-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="button button-primary" disabled={saving}>
          {saving ? 'Saving…' : editing ? 'Save changes' : 'Create record'}
        </button>
      </div>
    </form>
  );
}
