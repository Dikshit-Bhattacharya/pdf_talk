import React, { useState } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import QnABox from './components/QnABox';
import './App.css';

function App() {
  const [qaData, setQaData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const BACKEND_URL = 'http://localhost:5000'; 

  const handleFileUpload = async (formData, rawFile) => {
    setLoading(true);
    setError(null);
    setMessage(null);
    setPdfFile(rawFile);
    setQaData([]);

    try {
      const response = await fetch(`${BACKEND_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Upload failed");
        setPdfFile(null);
      } else {
        setQaData(data.questions || []);
      }
    } catch (err) {
      setError("Upload failed: " + err.message);
      setPdfFile(null);
    }

    setLoading(false);
  };

  const handleAskQuestion = async (question) => {
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`${BACKEND_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await response.json();
      return data;
    } catch (err) {
      setError("Question failed: " + err.message);
      return { answer: "Error occurred" };
    }
  };

  return (
    <div className="App">
      <Header />
      <FileUpload onUpload={handleFileUpload} />

      {pdfFile && (
        <div style={{ margin: '1rem auto', maxWidth: '700px', textAlign: 'center' }}>
          <p>
            <strong>Uploaded PDF:</strong> {pdfFile.name}
          </p>
        </div>
      )}

      {loading && (
        <div className="loader-container">
          <div className="loader"></div>
          <p>Processing your PDF...</p>
        </div>
      )}

      {error && (
        <div style={{ color: 'red', maxWidth: '700px', margin: '1rem auto', textAlign: 'center' }}>
          ⚠️ {error}
        </div>
      )}

      {message && (
        <div style={{ color: 'green', maxWidth: '700px', margin: '1rem auto', textAlign: 'center' }}>
          ✅ {message}
        </div>
      )}

      {!loading && !error && qaData.length > 0 && (
        <QnABox qaData={qaData} onAskQuestion={handleAskQuestion} />
      )}

      <div
        style={{
          maxWidth: '700px',
          margin: '20px auto',
          fontSize: '0.85rem',
          color: '#555',
          textAlign: 'center',
        }}
      >
        ⚠️ <strong>Disclaimer:</strong>
        <br />
        This is a personal project and may not handle large, scanned, or complex PDFs accurately.
        <br />
        Outputs are based on a basic model and should be interpreted with care.
      </div>
    </div>
  );
}

export default App;
