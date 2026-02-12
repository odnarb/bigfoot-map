import { Route, Routes, BrowserRouter } from 'react-router'
import './App.css'
import GoogleMaps from './pages/GoogleMaps'
import About from './pages/About'
import Donate from './pages/Donate'
import Report from './pages/Report'
import NoPage from './pages/NoPage'
import HiddenMenu from './pages/components/HiddenMenu'

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HiddenMenu />}>
            <Route index element={<GoogleMaps />} />
            <Route path="about" element={<About />} />
            <Route path="submit-report" element={<Report />} />
            <Route path="donate" element={<Donate />} />
            <Route path="*" element={<NoPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}
