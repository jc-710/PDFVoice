import os
import torch
import pdfplumber
import numpy as np
import soundfile as sf
from flask import Flask, request, jsonify, send_file
from transformers import SpeechT5Processor, SpeechT5ForTextToSpeech
from torchaudio.pipelines import TACOTRON2_WAVERNN_PHONE_LJSPEECH
from speechbrain.pretrained import EncoderClassifier  
from transformers import SpeechT5HifiGan


app = Flask(__name__)

# Load AI-based TTS model
device = "cuda" if torch.cuda.is_available() else "cpu"
processor = SpeechT5Processor.from_pretrained("microsoft/speecht5_tts")
model = SpeechT5ForTextToSpeech.from_pretrained("microsoft/speecht5_tts").to(device)
vocoder = SpeechT5HifiGan.from_pretrained("microsoft/speecht5_hifigan").to(device)

# Load SpeechBrain speaker embedding model
spk_emb_model = EncoderClassifier.from_hparams(
    source="speechbrain/spkrec-xvect-voxceleb", 
    run_opts={"device": device}
)

# Generate random speaker embeddings (for now, no real audio input)
def get_speaker_embeddings():
    return torch.randn(1, 512).to(device)  # Shape: (1, 512) required by SpeechT5

# Extract text from PDF
def extract_text_from_pdf(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()

# Convert text to speech
def text_to_speech(text, output_path):
    try:
        inputs = processor(text=text, return_tensors="pt").to(device)
        speaker_embeddings = get_speaker_embeddings()  # Get speaker embeddings

        with torch.no_grad():
            speech = model.generate(**inputs, speaker_embeddings=speaker_embeddings)

        print(f"Generated spectrogram shape: {speech.shape}")

        # Convert spectrogram to waveform using vocoder
        audio = vocoder(speech).squeeze().detach().cpu().numpy()

        print(f"Generated audio shape: {audio.shape}")

        # Ensure output directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # Convert stereo to mono if needed
        if len(audio.shape) > 1:
            audio = audio[:, 0]  

        # Save audio file
        sf.write(output_path, audio, 22050)
        print(f"Audio file saved at: {output_path}")
        
        return output_path

    except Exception as e:
        print(f"Error during TTS: {e}")
        return None

@app.route('/convert', methods=['POST'])
def convert_pdf_to_audio():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    file_path = os.path.join("uploads", file.filename)
    output_audio = os.path.join("outputs", "output.wav")

    os.makedirs("uploads", exist_ok=True)
    os.makedirs("outputs", exist_ok=True)
    file.save(file_path)
    
    text = extract_text_from_pdf(file_path)
    if not text:
        return jsonify({"error": "No text found in PDF"}), 400

    audio_path = text_to_speech(text, output_audio)
    if not audio_path:
        return jsonify({"error": "Failed to generate audio"}), 500

    return send_file(audio_path, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)
