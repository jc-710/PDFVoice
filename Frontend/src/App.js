import { useState } from "react";

export default function PdfToSpeech() {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please upload a PDF file.");
    
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", language);

    try {
      const response = await fetch("http://localhost:5000/convert", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "output.wav";
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert("Error processing the PDF.");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
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
    </div>
  );
}
