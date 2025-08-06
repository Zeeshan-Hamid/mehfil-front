import styles from './BackButton.module.css';

export default function BackButton({ onClick, children = 'Back' }) {
  return (
    <button className={styles.backBtn} onClick={onClick} type="button">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: 8, verticalAlign: 'middle'}}>
        <path d="M11.25 14.25L6.75 9L11.25 3.75" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {children}
    </button>
  );
} 