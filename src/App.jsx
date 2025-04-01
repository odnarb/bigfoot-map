import { Route, Routes, BrowserRouter } from 'react-router'
import './App.css'
import Layout from './Layout'
import GoogleMaps from './pages/GoogleMaps'
import About from './pages/About'
import Donate from './pages/Donate'
import Report from './pages/Report'
import NoPage from './pages/NoPage'

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
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
