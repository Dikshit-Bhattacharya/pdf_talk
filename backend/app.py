from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
import fitz
import io
import os

app = Flask(__name__)
CORS(app)

# Initialize the QA pipeline
try:
    # qa_pipeline = pipeline("question-answering", model="deepset/roberta-base-squad2")
     qa_pipeline = pipeline("question-answering", model="distilbert-base-cased-distilled-squad")
except Exception as e:
    print(f"Error loading model: {e}")
    qa_pipeline = None

pdf_text_context = ""

@app.route("/", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "message": "PDF Q&A API is running"})

@app.route("/upload", methods=["POST"])
def upload():
    global pdf_text_context

    if "pdf" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["pdf"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if not file.filename.lower().endswith('.pdf'):
        return jsonify({"error": "Only PDF files are allowed"}), 400

    try:
        pdf_bytes = file.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text = ""

        for page in doc:
            text += page.get_text()

        doc.close()

    except Exception as e:
        return jsonify({"error": f"Error reading PDF: {str(e)}"}), 500

    if not text.strip():
        return jsonify({"error": "Empty or unreadable PDF"}), 400

    pdf_text_context = text

    # Generate sample questions
    sample_questions = [
        "What is the main topic of the document?",
        "What is the objective or purpose of the document?",
        "What are the key findings or conclusions?",
        "What methods or approaches are discussed?",
        "What recommendations or future steps are suggested?",
    ]

    results = []

    if qa_pipeline:
        for question in sample_questions:
            try:
                result = qa_pipeline(question=question, context=text[:2000])  # Limit context length
                answer = result["answer"].strip()
                if answer == "":
                    answer = "Not enough information provided in the document."
                results.append({"question": question, "answer": answer})
            except Exception as e:
                results.append({"question": question, "answer": "Could not extract answer"})
    else:
        for question in sample_questions:
            results.append({"question": question, "answer": "Model not available"})

    return jsonify({"questions": results, "message": "PDF uploaded successfully"})

@app.route("/ask", methods=["POST"])
def ask():
    global pdf_text_context

    try:
        data = request.get_json()
        if not data:
            return jsonify({"answer": "Invalid request format"}), 400

        question = data.get("question", "")

        if not question:
            return jsonify({"answer": "No question provided"}), 400

        if not pdf_text_context:
            return jsonify({"answer": "No document context available. Please upload a PDF first."}), 400

        if not qa_pipeline:
            return jsonify({"answer": "Question answering model not available"}), 500

        try:
            # Limit context length to prevent memory issues
            context = pdf_text_context[:2000]
            result = qa_pipeline(question=question, context=context)
            answer = result["answer"].strip()

            if answer == "":
                answer = "Not enough information provided in the document."

            return jsonify({"answer": answer})

        except Exception as e:
            print(f"QA Pipeline error: {e}")
            return jsonify({"answer": "Could not find answer"}), 500

    except Exception as e:
        print(f"Request processing error: {e}")
        return jsonify({"answer": "Error processing request"}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))

    app.run(host='0.0.0.0', port=port, debug=False)
