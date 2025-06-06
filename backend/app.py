from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
import fitz  # PyMuPDF
import io

app = Flask(__name__)
CORS(app)

qa_pipeline = pipeline("question-answering", model="deepset/roberta-base-squad2")

pdf_text_context = ""

@app.route("/upload", methods=["POST"])
def upload():
    global pdf_text_context

    if "pdf" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["pdf"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    try:
        # Read the PDF file bytes into memory
        pdf_bytes = file.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
    except Exception as e:
        return jsonify({"error": f"Error reading PDF: {str(e)}"}), 500

    if not text.strip():
        return jsonify({"error": "Empty or unreadable PDF"}), 400

    pdf_text_context = text

    sample_questions = [
        "What is the main topic of the document?",
        "What is the objective or purpose of the document?",
        "What are the key findings or conclusions?",
        "What methods or approaches are discussed?",
        "What recommendations or future steps are suggested?",
    ]

    results = []
    for question in sample_questions:
        try:
            result = qa_pipeline(question=question, context=text)
            answer = result["answer"].strip()
            if answer == "":
                answer = "Not enough information provided in the document."
            results.append({"question": question, "answer": answer})
        except Exception:
            results.append({"question": question, "answer": "Could not extract answer"})

    return jsonify({"questions": results})


@app.route("/ask", methods=["POST"])
def ask():
    global pdf_text_context
    data = request.get_json()
    question = data.get("question", "")

    if not question:
        return jsonify({"answer": "No question provided"}), 400
    if not pdf_text_context:
        return jsonify({"answer": "No document context available. Please upload a PDF first."}), 400

    try:
        result = qa_pipeline(question=question, context=pdf_text_context)
        answer = result["answer"].strip()
        if answer == "":
            answer = "Not enough information provided in the document."
        return jsonify({"answer": answer})
    except Exception:
        return jsonify({"answer": "Could not find answer"}), 500


if __name__ == "__main__":
    app.run(debug=True)
