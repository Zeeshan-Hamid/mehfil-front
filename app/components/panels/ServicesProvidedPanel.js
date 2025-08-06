import React from 'react';
import styles from './ServicesProvidedPanel.module.css';
import SaveButton from './SaveButton';
import BackButton from './BackButton';
import { useListingEditStore } from '../../state/listingEditStore';

const serviceTypes = [
  "Photography",
  "Catering",
  "Decoration",
  "Music",
  "Lighting",
  "Venue",
  "Transportation",
  "Planning",
  "Other"
];

function ServicesProvidedPanel({ onBack }) {
  const selected = useListingEditStore(state => state.draft.servicesProvided || []);
  const setField = useListingEditStore(state => state.setField);

  const handleToggle = (type) => {
    let updated;
    if (selected.includes(type)) {
      updated = selected.filter(t => t !== type);
    } else if (selected.length < 6) {
      updated = [...selected, type];
    } else {
      updated = selected;
    }
    setField('servicesProvided', updated);
  };

  const handleCancel = () => {
    if (onBack) onBack();
  };

  const handleSave = () => {
    if (onBack) onBack();
  };

  return (
    <div className={styles.servicesProvidedPanel}>
      <BackButton onClick={onBack} />
      <div className={styles.servicesProvidedContent}>
        <div className={styles['name-heading']}>Services Provided</div>
        <div className={styles['name-desc']}>Select the services you offer</div>
        <div className={styles.servicesProvidedBox}>
          <div className={styles['services-provided-title-row']}>
            <span className={styles['services-provided-title']}>Services</span>
          </div>
          <div className={styles.servicesProvidedList}>
            {serviceTypes.map((type) => (
              <label key={type} className={styles.servicesProvidedOption}>
                <input
                  type="checkbox"
                  checked={selected.includes(type)}
                  onChange={() => handleToggle(type)}
                  disabled={!selected.includes(type) && selected.length >= 6}
                  className={styles.servicesProvidedOptionCheckbox}
                />
                {type}
              </label>
            ))}
          </div>
          <div className={styles.servicesProvidedNote}>
            Note: You cannot select more than 6
          </div>
        </div>
      </div>
      <SaveButton onCancel={handleCancel} onSave={handleSave} />
    </div>
  );
}

export default ServicesProvidedPanel; 