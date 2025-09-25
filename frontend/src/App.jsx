import React, { useState } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import QnABox from './components/QnABox';
import './App.css';

function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDocumentUploaded, setIsDocumentUploaded] = useState(false);
  const [loading, setLoading] = useState(false);


  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleFileUpload = async (formData, file) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setUploadedFile({ name: file.name, data });
      setIsDocumentUploaded(true);
      console.log('Upload successful:', data);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async (question) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error('Question failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Question error:', error);
      return { answer: 'Sorry, I encountered an error. Please try again.' };
    }
  };

  return (
    <div className="App">
      <Header />

      <main className="main-content">
        {!isDocumentUploaded ? (
          <div className="upload-section">
            <h2>Upload your PDF document</h2>
            <FileUpload onUpload={handleFileUpload} />
            {loading && <p>Uploading and processing...</p>}
          </div>
        ) : (
          <div className="qa-section">
            <div className="document-info">
              <p>Document uploaded: <strong>{uploadedFile?.name}</strong></p>
              <button 
                onClick={() => {
                  setIsDocumentUploaded(false);
                  setUploadedFile(null);
                }}
                className="change-document-btn"
              >
                Change Document
              </button>
            </div>
            <QnABox onAskQuestion={handleAskQuestion} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
