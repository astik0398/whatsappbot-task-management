import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs'; // Install this package
import { toast, ToastContainer } from 'react-toastify';
import '../styles/Signup.css'
import supabase from '../supabaseClient';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import PhoneInput from 'react-phone-input-2';

function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

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
  
    


    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phoneNumber // stored in user_metadata
        }
      }
    });
    
    const user = data?.user;
   
    if (user) {
  const { data: userDetails, error: insertError } = await supabase
    .from("user_details")
    .insert([
      {
        userId: user.id,   // auth user id
        phone: `whatsapp:+${phoneNumber}`, // custom column
        email: user.email,
        full_name: user.user_metadata.first_name + " " + user.user_metadata.last_name
      }
    ]);

  if (insertError) {
    console.error("Error inserting into user_details:", insertError);
  } else {
    console.log("Inserted into user_details:", userDetails);
  }
} 
    
    if (error) {
      toast.error(error.message);
      console.error(error);
      return
    } else {
      toast.success('Signup successful! Please verify your gmail');

      setTimeout(() => {
        navigate('/login')
      }, 5000);
    }
  }

  return (
      <div className="signup-page">
      {/* Left section */}
      <div className="signup-left">
        <h1 className="highlight">REGISTER NOW!</h1>
        <h1 id='title-text' className="title">TASK MANAGEMENT</h1>
        <p id='subtitle' className="subtitle">Manage all your tasks at one place!</p>
      </div>

      {/* Form section */}
      <form onSubmit={handleSignup} className="signup-div">
        <div className="input-div">
          <div>
            <label>First Name</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value.trim())} type="text" placeholder="Your first name" />
          </div>
          <div>
            <label>Last Name</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value.trim())} type="text" placeholder="Your last name" />
          </div>
        </div>

        <div className="phone-wrapper">
          <label>Whatsapp Number</label>
          <PhoneInput
            country="in"
            value={phoneNumber}
            onChange={(e)=> setPhoneNumber(e)}
          />
        </div>

        <div>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value.trim())} type="email" placeholder="Your email goes here" />
        </div>

        <div className="password-wrapper">
          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder="Set your password" />
          <span onClick={handleTogglePassword} className="password-toggle">
            {showPassword ? <FaEyeSlash color="grey" /> : <FaEye color="grey" />}
          </span>
        </div>

        <label className='login-label'>
          Already have an account? <Link className="newuser-label" to="/login">Login</Link>
        </label>
        <button type="submit">Sign Up</button>
      </form>
      <ToastContainer />
    </div>
  );
}

export default Signup;