import React from "react";
import "./Landing.css"; // You'll create this CSS file separately

export default function Landing() {
  return (
    <div className="landing">
      <header className="hero">
        <div className="overlay">
          <h1>Turn PDFs into Beautiful Voice</h1>
          <p>Convert any PDF into natural-sounding audio in seconds.</p>
          <a href="/pdftovoice" className="cta-button">Get Started</a>
        </div>
      </header>

      <section className="features">
        <div className="feature">
          <h2>✨ Smooth Listening</h2>
          <p>Enjoy your PDFs on the go with high-quality voice conversion.</p>
        </div>
        <div className="feature">
          <h2>⚡ Fast & Easy</h2>
          <p>Upload, convert, and listen in just a few clicks.</p>
        </div>
        <div className="feature">
          <h2>🔒 Privacy First</h2>
          <p>Your documents are processed securely and never stored.</p>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} PDF to Voice. All rights reserved.</p>
      </footer>
    </div>
  );
}
