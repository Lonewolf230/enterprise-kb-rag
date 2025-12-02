import './App.css'
import Auth from './pages/Auth.tsx'
import Chat from './pages/Chat.tsx'
import EmptyChat from './pages/EmptyChat.tsx'
import Home from './pages/Home.tsx'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Auth />} />
            <Route path='/home' element={<Home />} >
              <Route index element={<EmptyChat />} />
              <Route path='chat/:groupId' element={<Chat />} />
            </Route>
            <Route path='*' element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
