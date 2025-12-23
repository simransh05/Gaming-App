import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login/Login'
import ROUTES from './constant/Route/route'
import Signup from './pages/Signup/Signup'
import HomePage from './pages/HomePage/HomePage'
import CurrentUserProvider from './context/UserContext'

function App() { 
  return (
    <CurrentUserProvider>
      <Router>
        <Routes>
          <Route path={`${ROUTES.SIGNUP}`} element={<Signup/>}/>
          <Route path={`${ROUTES.LOGIN}`} element={<Login/>}/>
          <Route path={`${ROUTES.HOME}`} element={<HomePage/>}/>
        </Routes>
      </Router>
    </CurrentUserProvider>
  )
}

export default App
