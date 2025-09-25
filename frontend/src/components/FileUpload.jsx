import React, { useState } from 'react';
import './FileUpload.css';

function FileUpload({ onUpload}) {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUploadClick = () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);
    onUpload(formData, file);  
  };


  return (
    <div className="upload">
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      <button onClick={handleUploadClick}>Upload</button>
    </div>
  );
}

export default FileUpload;
