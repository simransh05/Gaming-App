import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login/Login'
import ROUTES from './constant/Route/route'
import Signup from './pages/Signup/Signup'
import HomePage from './pages/HomePage/HomePage'
import CurrentUserProvider from './context/UserContext'
import SocketProvider from './context/SocketContext'
import GameRoom from './pages/GameRoom/GameRoom'
import RankModal from './components/Modals/RankModal'
import { ToastContainer } from 'react-toastify';
import History from './pages/History/History'

function App() {
  return (
    <CurrentUserProvider>
      <SocketProvider>
        <Router>
          <Routes>
            <Route path={`${ROUTES.SIGNUP}`} element={<Signup />} />
            <Route path={`${ROUTES.LOGIN}`} element={<Login />} />
            <Route path={`${ROUTES.HOME}`} element={<HomePage />} />
            <Route path={`/:roomId`} element={<GameRoom />} />
            <Route path={`${ROUTES.TOP_RANKING}`} element={<RankModal />} />
            <Route path={`${ROUTES.HISTORY}`} element={<History />} />
          </Routes>
        </Router>
        <ToastContainer position='top-right' autoClose={2000} />
      </SocketProvider>
    </CurrentUserProvider>
  )
}

export default App
