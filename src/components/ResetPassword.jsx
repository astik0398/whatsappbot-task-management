import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import '../styles/ResetPassword.css'

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const errorCode = urlParams.get('error_code');
    
    if (errorCode) {
      toast.error('Invalid or expired reset link');
      
      setTimeout(() => {
        navigate('/login'); 
      }, 2000);
    }
  }, [location, navigate]);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
        toast.error('Passwords do not match!');
        return;
      }
  
      // Check if password is valid (e.g., length check)
      if (newPassword.length < 6) {
        toast.error('Password must be at least 6 characters long!');
        return;
      }
    
    if (!newPassword) {
      toast.error('Please enter a new password!');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser( { password: newPassword });
      
      if (error) throw error;

      toast.success('Password reset successful!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      toast.error('Error resetting password. Please try again later!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
   <div style={{display:'flex', gap:'240px'}}>
    <div className='left-div'>
    <h1>TASK MANAGEMENT</h1>
    </div>

    <div style={{ marginTop:'250px', height:'fit-content' }}>
      <form onSubmit={handleResetPassword} className="reset-password-form">
        <h3 style={{textAlign:'left'}}>RESET PASSWORD</h3>
        <div>
          <input
            type="password"
            placeholder="Enter your new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div>
          <input
            type="password"
            placeholder="Confirm your new password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Resetting...' : 'Confirm Password'}
        </button>
      </form>
              <ToastContainer />

    </div>
   </div>
  );
}

export default ResetPassword;
