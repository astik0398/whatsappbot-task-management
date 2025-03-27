import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/Login.css'
import supabase from '../supabaseClient';


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Email and password are required!');
      return;
    }

    const { data, error } = await supabase.from('users').select('id, password, name').eq('email', email).single();

    if (error || !data) {
      toast.error('Invalid Credentials!');
      return;
    }
    
    const passwordMatch = bcrypt.compareSync(password, data.password);

    if (!passwordMatch) {
      toast.error('Invalid Credentials!');
      return;
    }

    toast.success('Login successful!');
    localStorage.setItem('user_id', data.id);
    localStorage.setItem('name', data.name)
    window.dispatchEvent(new Event("userLoggedIn"));
    navigate('/')
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
      <div>
        <label>Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder='Enter your password'/>
      </div>
      <label>
        Are you a new user? <Link className="newuser-label" to="/register">Signup</Link>
      </label>
      <button type="submit">Login</button>
      <ToastContainer />
    </form>
        </div>
    </div>
  );
}

export default Login;