import { useState } from 'react';
import BackButton from './BackButton';
import SaveButton from './SaveButton';
import styles from './LocationPanel.module.css';
import { useListingEditStore } from '../../state/listingEditStore';

export default function LocationPanel({ onBack }) {
  const location = useListingEditStore(state => state.draft.location) || { street: '', city: '', state: '', zip: '' };
  const setField = useListingEditStore(state => state.setField);
  const [fields, setFields] = useState({
    city: location.city || '',
    state: location.state || '',
    zip: location.zip || location.zipCode || ''
  });

  const handleChange = (e) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // Ensure zipCode is set correctly for backend compatibility
    const locationData = {
      city: fields.city,
      state: fields.state,
      zipCode: fields.zip || fields.zipCode || ''
    };
    setField('location', locationData);
    if (onBack) onBack();
  };

  const handleCancel = () => {
    setFields(location);
    if (onBack) onBack();
  };

  return (
    <div className={styles.locationPanel}>
      <BackButton onClick={onBack} />
      <div className={styles.locationContent}>
        <div className={styles.heading}>Location</div>
        <div className={styles.subheading}>Tell us a bit about your business</div>
        <div className={styles.formBox}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              City <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="city"
              className={styles.textInput}
              value={fields.city}
              onChange={handleChange}
              placeholder="City"
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              State <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="state"
              className={styles.textInput}
              value={fields.state}
              onChange={handleChange}
              placeholder="State"
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              Zip Code <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="zip"
              className={styles.textInput}
              value={fields.zip}
              onChange={handleChange}
              placeholder="Zip code"
            />
          </div>
        </div>
      </div>
      {/* Save Button - positioned at bottom */}
      <div style={{ padding: '16px 24px', marginTop: 'auto' }}>
        <SaveButton onSave={handleSave} onCancel={handleCancel} saveText="Save" />
      </div>
    </div>
  );
} 