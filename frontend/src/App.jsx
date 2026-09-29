import { useState } from 'react';
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import './App.css';
import Home from './pages/Home';
import Login from './pages/Login';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import Navbar from "./components/Navbar";
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword'
import Footer from './components/Footer'

function App() {

  return (
    <div className="h-full flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/setup" element={<Setup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
            <Footer/>
        </div>
        
    </div>
  )
}

export default App
