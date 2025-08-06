"use client";
import { useState, useEffect } from 'react';
import SaveButton from './SaveButton';
import BackButton from './BackButton';
import styles from './PackagesPanel.module.css';
import { useListingEditStore } from '../../state/listingEditStore';

function DeleteConfirm({ onConfirm, onCancel }) {
  return (
    <div className={styles.deleteConfirmOverlay}>
      <div className={styles.deleteConfirmBox}>
        <div className={styles.deleteConfirmText}>Are you sure you want to delete this package?</div>
        <div className={styles.deleteConfirmActions}>
          <button className={styles.deleteConfirmBtn} onClick={onConfirm}>Delete</button>
          <button className={styles.deleteCancelBtn} onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function PackagesPanel({ onBack }) {
  const packages = useListingEditStore(state => state.draft.packages || []);
  const setField = useListingEditStore(state => state.setField);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentPackage, setCurrentPackage] = useState({
    name: '',
    price: '',
    description: '',
    features: []
  });
  // For new, unsaved feature inputs
  const [featureInputs, setFeatureInputs] = useState(['']);
  const [localPackages, setLocalPackages] = useState(packages);
  const [editIndex, setEditIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setLocalPackages(packages);
  }, [packages]);

  const handleCreatePackage = () => {
    const allFeatures = featureInputs.map(f => f.trim()).filter(f => f.length > 0);
    const newPackage = { ...currentPackage, includes: allFeatures };
    let updatedPackages;
    if (editIndex !== null) {
      updatedPackages = localPackages.map((pkg, idx) => idx === editIndex ? newPackage : pkg);
    } else {
      updatedPackages = [...localPackages, newPackage];
    }
    setLocalPackages(updatedPackages);
    setField('packages', updatedPackages);
    setShowCreateForm(false);
    setCurrentPackage({ name: '', price: '', description: '', features: [] });
    setFeatureInputs(['']);
    setEditIndex(null);
  };

  const handleEditPackage = (idx) => {
    const pkg = localPackages[idx];
    
    setCurrentPackage({
      name: pkg.name,
      price: pkg.price || pkg.fixedPrice || '',
      description: pkg.description,
      features: pkg.includes || []
    });
    setFeatureInputs(pkg.includes && pkg.includes.length > 0 ? pkg.includes : ['']);
    setEditIndex(idx);
    setShowCreateForm(true);
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setCurrentPackage({ name: '', price: '', description: '', features: [] });
    setFeatureInputs(['']);
    setLocalPackages(packages);
    setEditIndex(null);
    if (onBack) onBack();
  };

  const handleFeatureInputChange = (idx, value) => {
    setFeatureInputs(inputs => inputs.map((f, i) => (i === idx ? value : f)));
  };

  const addFeatureInput = () => {
    setFeatureInputs(inputs => [...inputs, '']);
  };

  const removeFeatureInput = (idx) => {
    setFeatureInputs(inputs => inputs.length === 1 ? [''] : inputs.filter((_, i) => i !== idx));
  };

  const handleDeletePackage = (idx) => {
    setDeleteIndex(idx);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deleteIndex !== null) {
      const updatedPackages = localPackages.filter((_, idx) => idx !== deleteIndex);
      setLocalPackages(updatedPackages);
      setField('packages', updatedPackages);
      setDeleteIndex(null);
      setShowDeleteConfirm(false);
    }
  };

  const cancelDelete = () => {
    setDeleteIndex(null);
    setShowDeleteConfirm(false);
  };

  return (
    <div className={styles.packagesPanel}>
      <BackButton onClick={onBack} />

      {!showCreateForm ? (
        <div className={styles.packagesContent}>
          <h3 className={styles.packagesHeading}>Packages</h3>
          <p className={styles.packagesDescription}>
            Add any all-inclusive wedding packages or optional add-ons you offer.
          </p>
          <div className={styles.createPackageSection}>
            <ul className={styles.packageList}>
              {localPackages.map((pkg, idx) => (
                <li key={idx} className={styles.packageListItem}>
                  <div className={styles.packageButtonWrapper}>
                    <button className={styles.packageButton} type="button" onClick={() => handleEditPackage(idx)}>
                      <div className={styles.packageName}>{pkg.name}</div>
                      <div className={styles.packagePrice}>
                        ${pkg.price || pkg.fixedPrice || pkg.minPrice || '0'}
                      </div>
                      <div className={styles.packageDescription}>{pkg.description.length > 60 ? pkg.description.slice(0, 60) + '...' : pkg.description}</div>
                    </button>
                    <button
                      className={styles.deleteBinBtn}
                      type="button"
                      title="Delete package"
                      onClick={e => { e.stopPropagation(); handleDeletePackage(idx); }}
                    >
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 10V16" stroke="#AF8EBA" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M11 10V16" stroke="#AF8EBA" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M15 10V16" stroke="#AF8EBA" strokeWidth="2" strokeLinecap="round"/>
                        <rect x="4" y="6" width="14" height="12" rx="2" stroke="#AF8EBA" strokeWidth="2"/>
                        <path d="M2 6H20" stroke="#AF8EBA" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M8 6V4C8 2.89543 8.89543 2 10 2H12C13.1046 2 14 2.89543 14 4V6" stroke="#AF8EBA" strokeWidth="2"/>
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <button 
              className={styles.createPackageButton}
              onClick={() => setShowCreateForm(true)}
            >
              <div className={styles.plusIcon}>
                <div className={styles.plusLine1}></div>
                <div className={styles.plusLine2}></div>
              </div>
              <span>Add a Package</span>
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.packagesContent}>
          <h3 className={styles.packagesHeading}>Packages</h3>
          <div className={styles.formContainer}>
            <div className={styles.formSection}>
              <h3 className={styles.formTitle}>
                Add any all-inclusive wedding packages or optional add-ons you offer.
              </h3>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>
                  Name of package <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.textInput}
                  value={currentPackage.name}
                  onChange={(e) => setCurrentPackage({...currentPackage, name: e.target.value})}
                  placeholder="Enter package name"
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>
                  Price per person <span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  className={styles.textInput}
                  value={currentPackage.price}
                  onChange={(e) => setCurrentPackage({...currentPackage, price: e.target.value})}
                  placeholder="Price per person"
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>
                  Description <span className={styles.required}>*</span>
                </label>
                <textarea
                  className={styles.textareaInput}
                  value={currentPackage.description}
                  onChange={(e) => setCurrentPackage({...currentPackage, description: e.target.value})}
                  placeholder="Write a brief description of this package..."
                  rows={4}
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>
                  What's included
                </label>
                <p className={styles.featuresDescription}>
                  List all the services and amenities included in the price of this package.
                </p>
                <div className={styles.featuresList}>
                  {featureInputs.map((value, idx) => (
                    <div key={idx} className={styles.featureInputRow}>
                      <input
                        type="text"
                        className={styles.featureInput}
                        value={value}
                        onChange={e => handleFeatureInputChange(idx, e.target.value)}
                        placeholder="Example: Custom tiered wedding cake"
                      />
                      {featureInputs.length > 1 && (
                        <button
                          className={styles.removeFeatureBtn}
                          type="button"
                          onClick={() => removeFeatureInput(idx)}
                          title="Remove feature"
                        >
                          <div className={styles.removeIcon}>×</div>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  className={styles.addFeatureButton}
                  type="button"
                  onClick={addFeatureInput}
                >
                  <div className={styles.plusIcon}>
                    <div className={styles.plusLine1}></div>
                    <div className={styles.plusLine2}></div>
                  </div>
                  <span>Add a feature</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showCreateForm && (
        <SaveButton
          onSave={handleCreatePackage}
          onCancel={handleCancel}
          saveText="Save"
        />
      )}
      {showDeleteConfirm && (
        <DeleteConfirm onConfirm={confirmDelete} onCancel={cancelDelete} />
      )}
    </div>
  );
} 