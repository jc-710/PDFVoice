import { useState } from "react";
import axios from "axios";

export default function PdfToSpeech() {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert("Please upload a PDF file.");
    
    setLoading(true);
    setAudioUrl(null);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", language);

    try {
      const response = await axios.post("http://localhost:5000/convert", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob", // Expect binary response
      });

      if (response.status === 200) {
        const url = URL.createObjectURL(response.data);
        setAudioUrl(url);
      } else {
        alert("Error processing the PDF.");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = "converted_audio.wav"; // Set default filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4">
      <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} />
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="fr">French</option>
        <option value="es">Spanish</option>
      </select>
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Processing..." : "Convert to Audio"}
      </button>
      
      {audioUrl && (
        <div className="mt-4">
          <audio controls>
            <source src={audioUrl} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>
          <button onClick={handleDownload} className="ml-2 bg-blue-500 text-white p-2 rounded">
            Download Audio
          </button>
        </div>
      )}
    </div>
  );
}
