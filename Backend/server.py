from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import PyPDF2
from gtts import gTTS
import io
import tempfile

app = Flask(__name__)
CORS(app)
# Function to extract text from PDF
def extract_text_from_pdf(pdf_file):
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text

@app.route('/convert', methods=['POST'])
def convert_pdf_to_audio():
    pdf_file = request.files.get('file')
    language = request.form.get('language', 'en')

    if not pdf_file:
        return jsonify({"error": "No PDF file uploaded"}), 400

    if not language:
        return jsonify({"error": "No language specified"}), 400

    text = extract_text_from_pdf(pdf_file)

    if not text:
        return jsonify({"error": "Could not extract text from the PDF"}), 400

    try:
        tts = gTTS(text, lang=language)
        
        # Save to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
            tts.save(tmp.name)
            tmp_path = tmp.name

        # Read audio back into memory to send
        with open(tmp_path, "rb") as f:
            audio_data = io.BytesIO(f.read())

        audio_data.seek(0)

    except Exception as e:
        return jsonify({"error": f"Text-to-speech failed: {str(e)}"}), 500

    return send_file(audio_data, mimetype='audio/mp3', as_attachment=True, download_name='output.mp3')

if __name__ == '__main__':
    app.run(debug=True)
