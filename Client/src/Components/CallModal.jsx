import React from 'react';
import styles from '../Styles/CallModal.module.css';

const CallModal = ({ isOpen, caller, onAccept, onReject }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Incoming Call</h2>
        <p>{caller} is calling you!</p>
        <div>
          <button onClick={onAccept} className={styles.btnAccept}>Accept</button>
          <button onClick={onReject} className={styles.btnReject}>Reject</button>
        </div>
      </div>
    </div>
  );
};

export default CallModal;
