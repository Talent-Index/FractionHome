import { useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {


  return (
    <>
      <Routes>
        <Route path="/" element={<h1>Home Page</h1>} />
        
      </Routes>
    </>
  )
}

export default App
