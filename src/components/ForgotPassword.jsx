import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import '../styles/ForgotPassword.css';
import supabase from '../supabaseClient';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  async function handleForgotPassword(e) {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email!');
      return;
    }

    const redirectUrl = `${window.location.origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl, 
    })

    if (error) {
      toast.error('Error sending reset email. Please try again later!');
      console.error(error);
      return;
    }

    toast.success('Password reset email sent! Please check your inbox.');
    setTimeout(() => {
        navigate('/login');
    }, 3000);
  }

  return (
    <div style={{display:'flex', gap:'240px'}}>
      <div className='left-div' >
        <h1>TASK MANAGEMENT</h1>
      </div>

      <div style={{display:'flex', height:'fit-content', marginTop:'250px'}}>
      <form onSubmit={handleForgotPassword} className="forgot-password-form">
        <h3 style={{textAlign:'left'}}>Forgot Password?</h3>
        <div>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button type="submit">Send Reset Link</button>
      </form>
    </div>
    <ToastContainer autoClose={2000}/>

    </div>
  );
}

export default ForgotPassword;
