import React from 'react'
import { Route, Routes } from 'react-router'
import UploadFile from '../components/UploadFile'
import Table from '../components/Table'
import Dashboard from '../components/Dashboard'
import Signup from '../components/Signup'
import Login from '../components/Login'
import ForgotPassword from '../components/ForgotPassword'
import ResetPassword from '../components/ResetPassword'
import Settings from '../components/Settings'

function MainRoute() {
  return (
    <div>
        <Routes>
            <Route path='/upload' element={<UploadFile/>}/>
            {/* <Route path='/entries' element={<Table/>}/> */}
            <Route path='/login' element={<Login/>}/>
            <Route path='/register' element={<Signup/>}/>
            <Route path='/' element={<Dashboard/>}/>

            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path='/reset-password' element={<ResetPassword/>}/>
            
            <Route path='/settings' element={<Settings/>}/>
        </Routes>
    </div>
  )
}

export default MainRoute