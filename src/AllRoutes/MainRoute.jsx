import React from 'react'
import { Route, Routes } from 'react-router'
import UploadFile from '../components/UploadFile'
import Table from '../components/Table'
import Dashboard from '../components/Dashboard'
import Signup from '../components/Signup'
import Login from '../components/Login'

function MainRoute() {
  return (
    <div>
        <Routes>
            <Route path='/upload' element={<UploadFile/>}/>
            {/* <Route path='/entries' element={<Table/>}/> */}
            <Route path='/login' element={<Login/>}/>
            <Route path='/register' element={<Signup/>}/>
            <Route path='/' element={<Dashboard/>}/>
        </Routes>
    </div>
  )
}

export default MainRoute