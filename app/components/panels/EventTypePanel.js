import React from 'react';
import styles from './EventTypePanel.module.css';
import SaveButton from './SaveButton';
import BackButton from './BackButton';
import { useListingEditStore } from '../../state/listingEditStore';

const eventTypes = [
  "Wedding",
  "Birthday",
  "Corporate Event",
  "Engagement",
  "Anniversary",
  "Baby Shower",
  "Conference",
  "Workshop",
  "Other"
];

function EventTypePanel({ onBack }) {
  const selected = useListingEditStore(state => state.draft.eventType || []);
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
    setField('eventType', updated);
  };

  const handleCancel = () => {
    if (onBack) onBack();
  };

  const handleSave = () => {
    if (onBack) onBack();
  };

  return (
    <div className={styles.eventTypePanel}>
      <BackButton onClick={onBack} />
      <div className={styles.eventTypeContent}>
        <div className={styles['name-heading']}>Your details and description</div>
        <div className={styles['name-desc']}>Add relevant information</div>
        <div className={styles.eventTypeBox}>
          <div className={styles['event-type-title-row']}>
            <span className={styles['event-type-title']}>Event Types</span>
          </div>
          <div className={styles.eventTypeList}>
            {eventTypes.map((type) => (
              <label key={type} className={styles.eventTypeOption}>
                <input
                  type="checkbox"
                  checked={selected.includes(type)}
                  onChange={() => handleToggle(type)}
                  disabled={!selected.includes(type) && selected.length >= 6}
                  className={styles.eventTypeOptionCheckbox}
                />
                {type}
              </label>
            ))}
          </div>
          <div className={styles.eventTypeNote}>
            Note: You cannot select more than 6
          </div>
        </div>
      </div>
      <SaveButton onCancel={handleCancel} onSave={handleSave} />
    </div>
  );
}

export default EventTypePanel; 