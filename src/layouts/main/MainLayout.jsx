import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
function MainLayout() {
  return (
    <div>
        <Header/>
        <Outlet></Outlet>
        <Footer/>
    </div>
  )
}

export default MainLayout