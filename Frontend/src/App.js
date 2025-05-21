import Landing from './Landing';
import PdfToSpeech from './PDFtoVoice';
import {BrowserRouter as Router, Route,Routes} from 'react-router-dom'
export default function App(){
  return(
    <Router>
      <Routes>
        <Route path='/' element={<Landing/>}/>
        <Route path='/pdftovoice' element={<PdfToSpeech/>}/>
    </Routes>
    </Router>
  )
}