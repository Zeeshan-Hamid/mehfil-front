import { useState, useEffect } from 'react';
import BackButton from './BackButton';
import SaveButton from './SaveButton';
import styles from './DescriptionPanel.module.css';
import { useListingEditStore } from '../../state/listingEditStore';

export default function DescriptionPanel({ onBack }) {
  const description = useListingEditStore(state => state.draft.description);
  const setField = useListingEditStore(state => state.setField);
  const [input, setInput] = useState(description);

  useEffect(() => {
    if (description !== input) {
      setInput(description);
    }
    // eslint-disable-next-line
  }, [description]);

  const handleSave = () => {
    setField('description', input);
    if (onBack) onBack();
  };

  const handleCancel = () => {
    setInput(description);
    if (onBack) onBack();
  };

  return (
    <div className={styles.descriptionPanel}>
      <BackButton onClick={onBack} />
      <div className={styles.descriptionContent}>
        <div className={styles.heading}>Description</div>
        <div className={styles.formBox}>
          <label className={styles.inputLabel}>
            Description
            <span className={styles.vectorIcon}>
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L6 6L1 11" stroke="#000" strokeWidth="1"/></svg>
            </span>
          </label>
          <textarea
            className={styles.textareaInput}
            value={input}
            onChange={e => setInput(e.target.value)}
            minLength={20}
            placeholder="Write your business description here..."
            rows={8}
          />
          <div className={styles.helperText}>
            Minimum 20 characters
          </div>
        </div>
      </div>
      <SaveButton onSave={handleSave} onCancel={handleCancel} saveText="Save" />
    </div>
  );
} 