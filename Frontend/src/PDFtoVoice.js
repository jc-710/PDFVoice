import axios from "axios";
import { useState } from "react";

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
  link.download = `${audio.filename}.mp3`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


  return (
    <div className="container-fluid py-5 bg-dark text-light min-vh-100">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold">PDF to Speech</h1>
            <p className="lead opacity-75">Transform your documents into audio with one click</p>
          </div>
          
          <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="card-header text-white p-4 border-0" style={{backgroundColor:'#ff6b6b'}}>
              <h3 className="m-0 fw-bold">Upload Your Document</h3>
            </div>
            
            <div className="card-body p-4">
              <div className="row">
                <div className="col-md-8 mb-3 mb-md-0">
                  <div className="form-floating mb-3">
                    <input
                      type="file"
                      className="form-control form-control-lg"
                      id="pdfFile"
                      accept="application/pdf"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                    <label htmlFor="pdfFile" className="text-muted">Choose PDF file</label>
                  </div>
                </div>
                
                <div className="col-md-4">
                  <div className="form-floating">
                    <select
                      className="form-select form-select-lg"
                      id="languageSelect"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="fr">French</option>
                      <option value="es">Spanish</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                    </select>
                    <label htmlFor="languageSelect" className="text-muted">Language</label>
                  </div>
                </div>
              </div>
              
              <div className="d-grid mt-4">
                <button
                style={{backgroundColor:'#ff6b6b',color:'white'}}
                  className={`btn btn-lg py-3`}
                  onClick={handleUpload}
                  disabled={loading || !file}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : (
                    <>Convert to Audio</>
                  )}
                </button>
              </div>
              
              {!file && !loading && (
                <div className="text-center mt-3 text-muted">
                  <small>Supported format: PDF</small>
                </div>
              )}
              
              {file && !loading && (
                <div className="alert alert-success mt-3 d-flex align-items-center">
                  <div className="me-3">
                    <i className="bi bi-file-earmark-text h4 mb-0"></i>
                  </div>
                  <div>
                    <strong>Ready to convert:</strong> {file.name}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {audioList.length > 0 && (
            <div className="mt-5">
              <h4 className="mb-4 border-bottom pb-2">Your Audio Files</h4>
              
              {audioList.map((audio, index) => (
                <div className="card mb-3 border-0 shadow-sm bg-white bg-opacity-10 text-light" key={index}>
                  <div className="card-body p-3">
                    <div className="row align-items-center">
                      <div className="col-md-5">
                        <h6 className="text-truncate mb-0">
                          {audio.filename.split('_')[0]}
                        </h6>
                        <small style={{color:'white'}}>{new Date().toLocaleString()}</small>
                      </div>
                      
                      <div className="col-md-5">
                        <div className="rounded-3 bg-dark bg-opacity-50 p-2">
                          <audio controls className="w-100">
                            <source src={audio.url} type="audio/wav" />
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      </div>
                      
                      <div className="col-md-2 mt-2 mt-md-0 text-md-end">
                        <button
                          className="btn btn-outline-light"
                          onClick={() => handleDownload(audio)}
                        >
                          <i className="bi bi-download me-1"></i> Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}