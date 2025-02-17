import React from 'react'
import { Link } from 'react-router-dom'
import home from '../assets/home.svg'
import entry from '../assets/entry.svg'

function Navbar() {
  return (
    <div style={{height:'50px', backgroundColor:'#4CAF50', textDecoration:'none', display:'flex', justifyContent:'center', alignItems:'center', gap:'50px'}}>
      <Link style={{textDecoration:'none', color:'white', fontWeight:'bold'}} to={'/'}> <div style={{display:'flex', gap:'5px'}}> <img style={{width:'20px'}} src={home} alt="" /> <p>HOME</p> </div> </Link>
      <Link style={{textDecoration:'none', color:'white', fontWeight:'bold'}} to={'/entries'}><div style={{display:'flex', gap:'5px'}}> <img style={{width:'18px'}} src={entry} alt="" /> <p>ENTRIES</p> </div></Link>
    </div>
  )
}

export default Navbar