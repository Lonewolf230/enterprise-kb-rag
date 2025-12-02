import './App.css'
import Auth from './pages/Auth'
import Chat from './pages/Chat'
import EmptyChat from './pages/EmptyChat'
import Home from './pages/Home'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { SocketProvider } from './context/SocketContext'

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Auth />} />
          <SocketProvider>
            <Route path='/home' element={<Home />} >
              <Route index element={<EmptyChat />} />
              <Route path='chat/:groupId' element={<Chat />} />
            </Route>
            <Route path='*' element={<Navigate to="/" replace />} />
          </SocketProvider>
        </Routes>
      </Router>
    </>
  )
}

export default App
