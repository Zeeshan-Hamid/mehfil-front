import React, { useState, useEffect } from 'react';
import styles from './NamePanel.module.css';
import SaveButton from './SaveButton';
import BackButton from './BackButton';
import { useListingEditStore } from '../../state/listingEditStore';

function NamePanel({ onBack }) {
  const name = useListingEditStore(state => state.draft.name);
  const setField = useListingEditStore(state => state.setField);
  const [input, setInput] = useState(name);

  useEffect(() => {
    if (name !== input) {
      setInput(name);
    }
    // eslint-disable-next-line
  }, [name]);

  const handleCancel = () => {
    setInput(name); // Reset to last saved value
    if (onBack) onBack();
  };

  const handleSave = () => {
    setField('name', input);
    if (onBack) onBack();
  };

  return (
    <div className={styles.namePanel}>
      <BackButton onClick={onBack} />
      <div className={styles.nameContent}>
        <div className={styles.nameHeading}>Listing name</div>
        <div className={styles.nameDesc}>This will be the name of your listing.</div>
        <input
          className={styles.nameInput}
          type="text"
          placeholder="Enter listing name"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
      </div>
      <SaveButton onCancel={handleCancel} onSave={handleSave} />
    </div>
  );
}

export default NamePanel; 