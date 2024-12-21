import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';  // Import PapaParse for parsing CSV
import styles from '../Styles/ModerateContent.module.css';

const ModerateContent = () => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPrediction, setFilterPrediction] = useState(''); // Filter state

  const fetchThreads = async () => {
    setLoading(true);
    try {
      const response = await fetch('/threads.csv');
      const text = await response.text();
      const parsedData = Papa.parse(text, { header: true, skipEmptyLines: true });
      setThreads(parsedData.data);
    } catch (error) {
      console.error("Error fetching threads: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when the component mounts
  useEffect(() => {
    fetchThreads();
  }, []);

  // Delete thread by ThreadId
  const deleteThread = (threadId) => {
    setThreads((prevThreads) => prevThreads.filter(thread => thread.ThreadId !== threadId));
  };

  // Delete all Hate Speech threads
  const deleteAllHateSpeechThreads = () => {
    setThreads((prevThreads) => prevThreads.filter(thread => thread.Prediction !== 'Hate Speech'));
  };

  // Filter threads based on prediction (Hate Speech or Not Hate Speech)
  const filteredThreads = filterPrediction
    ? threads.filter((thread) => thread.Prediction === filterPrediction)
    : threads;

  // Render table rows
  const renderTableRows = () => {
    return filteredThreads.map((thread) => (
      <tr key={thread.ThreadId}>
        <td>{thread.ThreadId}</td>
        <td>{thread.Title}</td>
        <td>{thread.Content}</td>
        <td>{thread.Prediction}</td>
        <td>
          <button
            className={styles.deleteButton}
            onClick={() => deleteThread(thread.ThreadId)}
          >
            Delete
          </button>
        </td>
      </tr>
    ));
  };

  return (
    <div className={styles.container}>
      <h2>Moderate Content</h2>
      
      {/* Prediction filter */}
      <div className={styles.filter}>
        <label htmlFor="predictionFilter">Filter by Prediction: </label>
        <select
          id="predictionFilter"
          value={filterPrediction}
          onChange={(e) => setFilterPrediction(e.target.value)}
        >
          <option value="">All</option>
          <option value="Hate Speech">Hate Speech</option>
          <option value="Not Hate Speech">Not Hate Speech</option>
        </select>
      </div>

      {loading ? (
        <p>Loading threads...</p>
      ) : (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ThreadId</th>
                <th>Title</th>
                <th>Content</th>
                <th>Prediction</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {renderTableRows()}
            </tbody>
          </table>
          
          {/* Delete All button */}
          {filterPrediction === "Hate Speech" && (
            <div className={styles.deleteAllButtonContainer}>
              <button
                className={styles.deleteButton}
                onClick={deleteAllHateSpeechThreads}
              >
                Delete All Hate Speech Threads
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ModerateContent;