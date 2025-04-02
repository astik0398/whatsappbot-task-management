import React, { useState } from 'react';
import supabase from '../supabaseClient';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/Settings.css'

function Settings() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newSecondName, setNewSecondName] = useState('');
  const [activeTab, setActiveTab] = useState('password'); // state to track active tab

  // Function to handle password change
  async function changePassword(e) {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('Password does not match!');
      return;
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      toast.error('Error updating password!');
    } else {
      toast.success('Password Changed Successfully!');
    }
  }

  // Function to handle name change
  async function changeName(e) {
    e.preventDefault()

    const { data, error } = await supabase.auth.updateUser({
      data: {
        first_name: newFirstName,
        last_name: newSecondName
      },
    });

    console.log('data',data);
    
    localStorage.setItem('name', `${data.user.user_metadata.first_name} ${data.user.user_metadata.last_name}`)

    if (error) {
      toast.error('Error updating name!');
      return
    } else {
      toast.success('Name Updated Successfully!');
      return
    }
  }

  return (
    <div>
      <div className="tab-buttons">
  <button
  id='btn-pass'
    className={activeTab === 'password' ? 'active' : ''}
    onClick={() => setActiveTab('password')}
  >
    Update Password
  </button>
  <button
  id='btn-name'
    className={activeTab === 'name' ? 'active' : ''}
    onClick={() => setActiveTab('name')}
  >
    Update Name
  </button>
</div>


      {/* Conditionally render form based on active tab */}
      {activeTab === 'password' && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
          <form onSubmit={changePassword} className="reset-password-form">
            <h3 style={{ textAlign: 'left' }}>CHANGE PASSWORD</h3>
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button type="submit">Change Password</button>
          </form>
        </div>
      )}

      {activeTab === 'name' && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
          <form onSubmit={changeName} className="reset-password-form">
            <h3 style={{ textAlign: 'left' }}>UPDATE NAME</h3>
            <div>
              <input
                type="text"
                placeholder="Enter your new first name"
                value={newFirstName}
                onChange={(e) => setNewFirstName(e.target.value)}
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Enter your new last name"
                value={newSecondName}
                onChange={(e) => setNewSecondName(e.target.value)}
              />
            </div>

            <button type="submit">Update Name</button>
          </form>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}

export default Settings;
