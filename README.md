![Demo Screenshot](https://github.com/Dikshit-Bhattacharya/pdf_talk/blob/main/pics(not%20required%20for%20project)/Screenshot%202025-06-06%20141212.png?raw=true)


📝 Project Title: PDF Talk – Ask Questions to Your PDFs
📌 Introduction
PDF Talk is a personal project that allows users to upload a PDF document and interact with it through natural language questions. It uses NLP (Natural Language Processing) techniques to extract relevant answers from the PDF content.

🚀 Technologies Used
Frontend: React.js (with file upload UI and dynamic Q&A interface)

Backend: Flask (Python)

Model: Hugging Face's deepset/roberta-base-squad2 for Question Answering

PDF Parsing: PyMuPDF (fitz)

CORS Handling: Flask-CORS

Deployment-ready: Can be self-hosted or deployed with services like Render, Railway, etc.

⚙️ How It Works
User uploads a PDF file.

Backend extracts text using PyMuPDF.

User can then ask custom questions via the frontend.

Responses are generated using the pre-trained RoBERTa QA model.

🚧 Limitations
The responses are generated using a pre-trained question-answering model, which may sometimes produce overly simplified or repetitive answers, especially when the document contains limited or abstract information.

Since the model is not fine-tuned for domain-specific documents (like medical or technical reports), contextual understanding can be shallow in some cases.

Answers depend entirely on the content of the uploaded document — if a topic is not clearly explained, the model may guess or respond inaccurately.

Scanned or image-based PDFs are not supported, as the app currently processes only text-based PDFs.
