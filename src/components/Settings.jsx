import React, { useState } from 'react'
import supabase from '../supabaseClient'
import { toast, ToastContainer } from 'react-toastify';

function Settings() {

    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    async function changePassword(){

        if(newPassword !== confirmPassword){
            toast.error('Password does not match!')
            return
        }
        
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
          })
          

          setTimeout(() => {
            toast.success('Password Changed Successfully!')
          }, 2000);
        }

  return (
    <div>
            <div style={{ height:'fit-content', display:'flex', justifyContent:'center', marginTop:'180px' }}>
                  <form onSubmit={changePassword} className="reset-password-form">
                    <h3 style={{textAlign:'left'}}>CHANGE PASSWORD</h3>
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
            
                    <button type="submit" >
                      Change Password
                    </button>
                  </form>            
                </div>
        <ToastContainer/>
    </div>
  )
}

export default Settings