const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

app.use(cors());
app.use(express.json());


const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});


let documentText = '';
let documentName = '';


app.get('/', (req, res) => {
  res.json({ 
    message: 'PDF Talk Backend is running!', 
    status: 'active',
    endpoints: ['/upload', '/ask']
  });
});


app.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    console.log('File received:', req.file.originalname);


    const pdfBuffer = req.file.buffer;
    const pdfData = await pdfParse(pdfBuffer);


    documentText = pdfData.text;
    documentName = req.file.originalname;

    console.log('PDF processed successfully. Text length:', documentText.length);

    res.json({
      success: true,
      message: 'PDF uploaded and processed successfully',
      filename: req.file.originalname,
      textLength: documentText.length,
      pages: pdfData.numpages
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to process PDF',
      details: error.message 
    });
  }
});


app.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (!documentText) {
      return res.status(400).json({ error: 'No document uploaded. Please upload a PDF first.' });
    }

    console.log('Question received:', question);


    const prompt = `Based on the following document content, please answer the question accurately and concisely:

Document: ${documentName}

Content:
${documentText}

Question: ${question}

Please provide a clear and helpful answer based only on the information in the document. If the answer cannot be found in the document, please say so.`;

   
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();

    console.log('Answer generated successfully');

    res.json({
      success: true,
      question: question,
      answer: answer,
      document: documentName
    });

  } catch (error) {
    console.error('Question processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process question',
      details: error.message,
      answer: 'Sorry, I encountered an error while processing your question. Please try again.'
    });
  }
});


app.use((error, req, res, next) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ error: 'File size too large. Maximum size is 10MB.' });
  } else if (error.message === 'Only PDF files are allowed!') {
    res.status(400).json({ error: 'Only PDF files are allowed!' });
  } else {
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Gemini API Key configured: ${process.env.GEMINI_API_KEY ? 'Yes' : 'No'}`);
});