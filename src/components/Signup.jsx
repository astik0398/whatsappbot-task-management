import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs'; // Install this package
import { toast, ToastContainer } from 'react-toastify';
import '../styles/Signup.css'
import supabase from '../supabaseClient';
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  async function handleSignup(e) {
    e.preventDefault();

    if (!firstName || !lastName || !email || !password) {
      toast.error('All fields are required!');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long!');
      return;
    }
  
    


    const { user, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        }
      }
    });

    console.log(user);
    

    if (error) {
      toast.error(error.message);
      console.error(error);
      return
    } else {
      toast.success('Signup successful!');

      setTimeout(() => {
        navigate('/login')
      }, 2000);
    }
  }

  return (
    <div style={{display:'flex'}}>
        <div style={{backgroundColor:'#1e293b', height:'100vh', width:'40%', color:'white', display:'flex', flexDirection:'column', justifyContent:'center'}}>
            <h1 style={{color:'#f39c12'}}>REGISTER NOW!</h1>
            <h1 style={{marginTop:'0px', fontSize:'35px', letterSpacing:'4px'}}>TASK MANAGEMENT</h1>
            <p style={{marginTop:'0px', fontSize:'20px', letterSpacing:'2px'}}>Manage all your tasks at one place!</p>
        </div>
        <form onSubmit={handleSignup} className="signup-div">
      <div className="input-div">
        <div>
          <label>First Name</label>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value.trim())} type="text" placeholder='Your first name'/>
        </div>
        <div>
          <label>Last Name</label>
          <input value={lastName} onChange={(e) => setLastName(e.target.value.trim())} type="text" placeholder='Your last name'/>
        </div>
      </div>
      <div>
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value.trim())} type="email" placeholder='Your email goes here'/>
      </div>
      <div style={{ position: "relative" }}>
        <label>Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder='Set your password'/>
        <span
          onClick={handleTogglePassword}
          style={{
            position: "absolute",
            right: "20px",
            top: "55%",
            transform: "translateY(-50%)",
            cursor: "pointer",
          }}
        >
          {showPassword ? <FaEyeSlash color='grey'/> : <FaEye color='grey'/>}
        </span>
      </div>
      <label>
        Already have an account? <Link className="newuser-label" to="/login">Login</Link>
      </label>
      <button type="submit">Sign Up</button>
    </form>
    <ToastContainer />

    </div>
  );
}

export default Signup;