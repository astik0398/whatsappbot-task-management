import React, { useState } from "react";
import "../styles/AddEmployee.css";
import supabase from "../supabaseClient";
import { ToastContainer, toast } from "react-toastify";

function AddEmployee({ setShowUpload }) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSubmit = async() => {
    const { data, error } = await supabase.from("tasks").insert([
        { name: name, phone: phoneNumber }
      ]);
    
      if (error) {
        console.error("Error inserting data:", error.message);
        toast.error("Failed to add employee!");
      } else {
        console.log("Added to Supabase:", data);
        toast.success("Employee added successfully!");
        setShowModal(false);
      }
  };

  return (
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
            <input
              type="number"
              name="phone"
              placeholder="Enter Phone Number"
              value={phoneNumber}
              onChange={(e)=> setPhoneNumber(e.target.value)}
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
      <ToastContainer/>
    </div>
  );
}

export default AddEmployee;
