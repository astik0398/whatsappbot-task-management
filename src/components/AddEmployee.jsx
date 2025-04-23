import React, { useEffect, useState } from "react";
import "../styles/AddEmployee.css";
import supabase from "../supabaseClient";
import { ToastContainer, toast } from "react-toastify";
import EmployeeTable from "./EmployeeTable";
import 'react-phone-input-2/lib/style.css';  // Required for flags
import PhoneInput from "react-phone-input-2";

function AddEmployee({ setShowUpload }) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [flag, setFlag] = useState(false)
  const [userId, setUserId] = useState(null)

     useEffect(()=> {
        const user_id = localStorage.getItem('user_id')
        console.log(user_id);
        
        setUserId(user_id)
      }, [])

  const handleSubmit = async() => {

    const { data: existingUser, error: fetchError } = await supabase
    .from("tasks")
    .select("id")
    .eq("phone", phoneNumber)
    .maybeSingle(); 

  if (fetchError) {
    console.error("Error checking phone number:", fetchError.message);
    toast.error("Failed to check phone number!");
    return;
  }

  if (existingUser) {

    toast.error("Phone number already exists in the database!");
    return;
  }
  
    const { data, error } = await supabase.from("tasks").insert([
        { name: name, phone: phoneNumber,  userId: userId}
      ])
    
      if (error) {
        console.error("Error inserting data:", error.message);
        toast.error("Failed to add employee!");
      } else {
        console.log("Added to Supabase:", data);
        toast.success("Employee added successfully!");
        setShowModal(false);
        setName("");  // Reset name
    setPhoneNumber("");  // Reset phone number
        setFlag(!flag)
        await refreshTasks()
      }
  };

  async function refreshTasks() {
    try {
      const response = await fetch(
        "https://whatsappbot-task-management-be-production.up.railway.app/refresh"
      );
      const result = await response.json();
      console.log("Tasks refreshed:", result);
    } catch (error) {
      console.error("Error refreshing tasks:", error);
    }
  }

  return (
    <>
    <EmployeeTable setFlag={setFlag} flag={flag}/>

    <div className="container">
      <button onClick={() => setShowUpload(true)} className="button bulk-upload">
        Bulk Upload Employees
      </button>
      <span className="or-text">OR</span>
      <button onClick={() => setShowModal(true)} className="button add-customer">
        Add Employee
      </button>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add Employee</h2>
            <input
              type="text"
              name="name"
              placeholder="Enter Name"
              value={name}
              onChange={(e)=> setName(e.target.value)}
            />
       <PhoneInput
        country="in"  // Default country
        value={phoneNumber}
        onChange={(e)=> setPhoneNumber(e)}
      />
            <div className="btn-div">
            <button onClick={handleSubmit} className="button-save">
              Save
            </button>
            <span
                onClick={() => setShowModal(false)}
                className="modal-close"
              >
                &times;
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
    <ToastContainer/>
    </>
  );
}

export default AddEmployee;
