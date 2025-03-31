import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/Login.css'
import supabase from '../supabaseClient';
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false);
  
    const handleTogglePassword = () => {
      setShowPassword((prev) => !prev);
    };

  async function handleLogin(e) {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Email and password are required!');
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    console.log('user-data',data);

    if (error || !data) {
      toast.error('Invalid Credentials!');
      return;
    }    

    toast.success('Login successful!');
    localStorage.setItem('user_id', data.user.id);
    localStorage.setItem('name', `${data.user.user_metadata.first_name} ${data.user.user_metadata.last_name}`)
    window.dispatchEvent(new Event("userLoggedIn"));

    setTimeout(() => {
      navigate('/')
    }, 2000);
  }

  return (
    <div style={{display:'flex', gap:'220px'}}>
        <div style={{backgroundColor:'#1e293b', height:'100vh', width:'40%', color:'white', display:'flex', flexDirection:'column', justifyContent:'center'}}>
            <h1 style={{color:'#f39c12'}}>WELCOME BACK!</h1>
        <h1 style={{marginTop:'0px', fontSize:'35px', letterSpacing:'4px'}}>TASK MANAGEMENT</h1>
        <p style={{marginTop:'0px', fontSize:'20px', letterSpacing:'2px'}}>Manage all your tasks at one place!</p>
        </div>
        <div>
        <form onSubmit={handleLogin} className="login-div">
      <div>
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder='Enter your email'/>
      </div>
      <div style={{ position: "relative" }}>
        <label>Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder='Enter your password'/>
        <span
                  onClick={handleTogglePassword}
                  style={{
                    position: "absolute",
                    right: "20px",
                    top: "60%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                  }}
                >
                  {showPassword ? <FaEyeSlash color='grey'/> : <FaEye color='grey'/>}
                </span>
      </div>
     <div style={{display:'flex', flexDirection:'row-reverse', justifyContent:'space-between'}}>
     <label>
  <Link className="forgot-password-label" target='blank' to="/forgot-password">Forgot Password?</Link>
</label>
      <label>
        Are you a new user? <Link className="newuser-label" to="/register">Signup</Link>
      </label>
     </div>
      <button type="submit">Login</button>
    </form>
        </div>
        <ToastContainer />
    </div>
  );
}

export default Login;