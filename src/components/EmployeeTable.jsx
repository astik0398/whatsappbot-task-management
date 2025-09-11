import React, { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import axios from "axios";
import whatsapp from "../assets/whatsapp.svg";
import editIcon from '../assets/editIcon.svg'
import deleteIcon from '../assets/deleteIcon.svg'
import { ToastContainer, toast } from "react-toastify";
import noemployee from '../assets/noemployee.png'
import whatsapplight from '../assets/whatsapplight.svg'
import editlight from '../assets/editlight.svg'
import deletelight from '../assets/deletelight.svg'
import PhoneInput from "react-phone-input-2";
import '../styles/EmployeeTable.css'

function EmployeeTable({flag, setFlag}) {
  const [allTasks, setAllTasks] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [id, setId] = useState('')
  const [searchText, setSearchText] = useState("")
  const [userId, setUserId] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(()=> {
        const user_id = localStorage.getItem('user_id')
        console.log('EMPLOYEE TABLE user_id',user_id);
        
        setUserId(user_id)
      }, [])

      useEffect(() => {
        if (userId) {  // Ensure userId is set before fetching
          getAllTasks();
        }
      }, [userId, flag]);

  async function getAllTasks() {
    const { data, error } = await supabase
      .from("grouped_tasks")
      .select("name, id ,phone").eq('userId', userId)

    if (error) {
      throw error;
    }

    console.log(data);

    if (!data || data.length === 0) {
      toast.error('No data to display...')
      return;
    }

    setAllTasks(data);
    setHeaders(Object.keys(data[0]));
  }

  function handleWhatsappClick(phone_number) {
    window.open(`https://wa.me/${phone_number}`);
  }

  async function handleDelete(id){
    const {error} = await supabase.from('grouped_tasks').delete().eq("id", id)
   
    if(error){
        toast.error('Failed to delete the employee!')
    }
    else{
        toast.success('Employee Deleted Successfully!')
        await refreshTasks()
        setFlag(!flag)
    }
  }

  function handleEdit(name, number, id){
    console.log('edit btn clicked');
    setName(name)
    setPhoneNumber(number)
    setId(id)
    setShowModal(true)
  }

  async function handleUpdate(){

    if(!phoneNumber || !name){
      toast.error('Name and number fields cannot be empty!')
      return
    }
    const {error} = await supabase.from('grouped_tasks').update({name: name, phone: phoneNumber}).eq('id', id)

    if(error){
        toast.error('Failed to update the details!')
    }
    else{
        toast.success('Details updated successfully!')
        setShowModal(false)
        await refreshTasks()
        setFlag(!flag)
    }
  }

  const filteredTasks = allTasks.filter(item=> item.name.toLowerCase().includes(searchText.toLowerCase()))

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

  useEffect(() => {
    const updateTheme = () => {
      const storedTheme = localStorage.getItem("theme");
      setIsDarkMode(storedTheme === "dark");
    };
  
    // Run initially
    updateTheme();
  
    // Listen for changes to localStorage
    window.addEventListener("storage", updateTheme);
  
    return () => {
      window.removeEventListener("storage", updateTheme);
    };
  }, []);  
  

  return (
    <>
      
      <div  className="search-container">
      <input className="search-input" type="text" name="" id="" placeholder="Search Employee" onChange={(e)=> setSearchText(e.target.value)}/>
      </div>
    {filteredTasks.length > 0 ? <div>

      <div  className="table-wrapper">
      <table className="table">
        <thead style={{color:'red'}}>
          <tr >
            <th style={{textAlign:'center'}} className="table-header">NAME</th>
            <th style={{textAlign:'center'}} className="table-header">PHONE</th>
            <th style={{textAlign:'center'}} className="table-header">WHATSAPP</th>
            <th style={{textAlign:'center'}} className="table-header">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.length > 0 &&
            filteredTasks.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td style={{textAlign:'center'}} className="table-cell">{row.name}</td>
                <td style={{textAlign:'center'}} className="table-cell">{row.phone}</td>
                <td style={{textAlign:'center'}} className="table-cell whatsapp-icon" onClick={() => handleWhatsappClick(row.phone)}>
                  <img style={{width:'20px'}} src={isDarkMode ? whatsapplight : whatsapp} alt="WhatsApp" />
                </td>
                <td className="table-cell icons" ><div style={{display:'flex', justifyContent:'center', gap:'50px'}}>
                  
                <span><img style={{width:'20px'}} onClick={()=> handleEdit(row.name, row.phone, row.id)} src={isDarkMode? editlight :editIcon} alt="" /></span> <span><img style={{width:'20px'}} onClick={()=> handleDelete(row.id)} src={isDarkMode ? deletelight: deleteIcon} alt="" /></span></div></td>
              </tr>
            ))}
        </tbody>
      </table>
      </div>

    {showModal && (
  <div className="modal-overlay">
    <div className="modal">
      <h2>Update Details</h2>
      <input
        type="text"
        name="name"
        placeholder="Enter Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <PhoneInput
        country="in"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e)}
      />
      <div className="btn-div">
        <button className="button-save" onClick={handleUpdate}>
          Update
        </button>
        <span onClick={() => setShowModal(false)} className="modal-close">
          &times;
        </span>
      </div>
    </div>
  </div>
)}

    </div> : <img src={noemployee} width={'60%'}/>}

    <ToastContainer autoClose={2000}/>

    </>
  );
}

export default EmployeeTable;
