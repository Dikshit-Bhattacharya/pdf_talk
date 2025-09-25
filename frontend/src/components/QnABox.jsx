import React, { useState } from 'react';
import './QnABox.css';

const sampleQuestions = [
  "What is the main topic of the document?",
  "What is the objective or purpose of the document?",
  "What are the key findings or conclusions?",
  "What methods or approaches are discussed?",
  "What recommendations or future steps are suggested?"
];

function QnABox({ onAskQuestion }) {
  const [inputQuestion, setInputQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [typing, setTyping] = useState(false);

  const simulateTyping = (fullAnswer, index) => {
    let currentText = '';
    let i = 0;
    setTyping(true);

    const interval = setInterval(() => {
      if (i < fullAnswer.length) {
        currentText += fullAnswer[i];
        setChatHistory((prev) =>
          prev.map((item, idx) =>
            idx === index ? { ...item, a: currentText } : item
          )
        );
        i++;
      } else {
        clearInterval(interval);
        setTyping(false);
      }
    }, 20); 
  };

  const handleAsk = async (question) => {
    if (!question.trim()) return;
    const newChatIndex = chatHistory.length;
    setChatHistory((prev) => [...prev, { q: question, a: '' }]);

    const res = await onAskQuestion(question);
    const answer = res?.answer || "Sorry, I couldn't find an answer.";

    simulateTyping(answer, newChatIndex);
    setInputQuestion('');
  };

  const handleSubmit = () => {
    handleAsk(inputQuestion);
  };

  return (
    <div className="qna-container">
      {}
      <div className="suggestions-container">
        {sampleQuestions.map((q, i) => (
          <button
            key={i}
            className="suggestion-button"
            onClick={() => handleAsk(q)}
            disabled={typing}
          >
            {q}
          </button>
        ))}
      </div>

      {}
      <div className="chat-box">
        {chatHistory.map((chat, index) => (
          <div key={index} className="chat-item">
            <p><strong>🧑 You:</strong> {chat.q}</p>
            <p><strong>🤖 Bot:</strong> {chat.a}</p>
          </div>
        ))}
        {typing && <p className="typing-indicator">🤖 Bot is typing...</p>}
      </div>

      {}
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a question..."
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          disabled={typing}
        />
        <button onClick={handleSubmit} disabled={typing}>Send</button>
      </div>
    </div>
  );
}

export default QnABox;
