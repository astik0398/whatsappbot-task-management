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

    const { error } = await supabase.auth.resetPasswordForEmail(email)

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
    <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
      <form onSubmit={handleForgotPassword} className="forgot-password-form">
        <h2>Forgot Password?</h2>
        <div>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button type="submit">Send Reset Link</button>
        <ToastContainer />
      </form>
    </div>
  );
}

export default ForgotPassword;
