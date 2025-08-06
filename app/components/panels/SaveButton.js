import React from 'react';
import styles from './SaveButton.module.css';

function SaveButton({ onCancel, onSave, cancelText = "Cancel", saveText = "Save" }) {
  return (
    <div className={styles.saveButtonActions}>
      <button className={styles.saveButtonCancel} onClick={onCancel}>
        {cancelText}
      </button>
      <button className={styles.saveButtonSave} onClick={onSave} data-save-button>
        {saveText}
      </button>
    </div>
  );
}

export default SaveButton; 