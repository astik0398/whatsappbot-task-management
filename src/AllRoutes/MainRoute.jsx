import React from 'react'
import { Route, Routes } from 'react-router'
import UploadFile from '../components/UploadFile'
import Table from '../components/Table'

function MainRoute() {
  return (
    <div>
        <Routes>
            <Route path='/' element={<UploadFile/>}/>
            <Route path='/entries' element={<Table/>}/>
        </Routes>
    </div>
  )
}

export default MainRoute