import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import axios from 'axios';
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

  // Delete thread(s) by ThreadId(s) using POST
  const deleteThread = async (threadIds) => {
    try {
      const url = `${url}/threads/deletethreads`;

      // Ensure threadIds is always an array
      const response = await axios.post(url, { threads: threadIds }, { withCredentials: true });

      console.log('Deleted threads:', response.data);
      setThreads((prevThreads) =>
        prevThreads.filter(thread => !threadIds.includes(thread.ThreadId))
      );
    } catch (error) {
      console.error("Error deleting thread: ", error);
    }
  };

  // Delete all Hate Speech threads
  const deleteAllHateSpeechThreads = () => {
    const hateSpeechThreads = threads
      .filter(thread => thread.Prediction === 'Hate Speech')
      .map(thread => thread.ThreadId);

    if (hateSpeechThreads.length > 0) {
      deleteThread(hateSpeechThreads);
    }
  };

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
            onClick={() => deleteThread([thread.ThreadId])} // Always pass as array
          >
            Hide
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
          
          {filterPrediction === "Hate Speech" && (
            <div className={styles.deleteAllButtonContainer}>
              <button
                className={styles.deleteButton}
                onClick={deleteAllHateSpeechThreads}
              >
                Hide All Hate Speech Threads
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ModerateContent;