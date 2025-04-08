import { useState } from "react";
import axios from "axios";

export default function PdfToSpeech() {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [audioList, setAudioList] = useState([]);

  const handleUpload = async () => {
    if (!file) return alert("Please upload a PDF file.");

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", language);

    try {
      const response = await axios.post("http://localhost:5000/convert", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob",
      });

      if (response.status === 200) {
        const url = URL.createObjectURL(response.data);
        const filename = file.name.replace(".pdf", "") + "_" + Date.now();
        setAudioList((prevList) => [...prevList, { url, filename }]);
        setFile(null);
      } else {
        alert("Error processing the PDF.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (audio) => {
    const link = document.createElement("a");
    link.href = audio.url;
    link.download = audio.filename + ".wav";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mt-5">
      <div
        className="card shadow p-4 mx-auto"
        style={{
          maxWidth: "600px",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: "15px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
        }}
      >
        <h3 className="card-title mb-4 text-center">PDF to Speech Converter</h3>

        <div className="mb-3">
          <label className="form-label">Upload PDF</label>
          <input
            type="file"
            accept="application/pdf"
            className="form-control"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Select Language</label>
          <select
            className="form-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
          </select>
        </div>

        <button
          className="btn btn-primary w-100"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? "Processing..." : "Convert to Audio"}
        </button>
      </div>

      {audioList.length > 0 && (
        <div className="mt-5">
          <h4 className="mb-3 text-center text-white">Converted Audios</h4>
          <div className="row row-cols-1 g-4">
            {audioList.map((audio, index) => (
              <div className="col" key={index}>
                <div
                  className="card shadow-sm p-3"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "10px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <h6 className="card-title">
                    {audio.filename.length > 30
                      ? audio.filename.slice(0, 30) + "..."
                      : audio.filename}
                  </h6>
                  <audio controls className="w-100 mb-2">
                    <source src={audio.url} type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
                  <button
                    className="btn btn-success w-100"
                    onClick={() => handleDownload(audio)}
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
