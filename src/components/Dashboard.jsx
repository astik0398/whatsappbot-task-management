import React, { useEffect, useState } from "react";
import "../styles/Dashboard.css";
import Table from "./Table";
import UploadFile from "./UploadFile";
import employeesIcon from "../assets/employees.svg";
import entriesIcon from "../assets/entry.svg";
import AddEmployee from "./AddEmployee";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("Employees");
  const [showUpload, setShowUpload] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false)
  const [name, setName] = useState('')
  const navigate = useNavigate()
  
  useEffect(() => {
    if (isUploaded) {
      setActiveSection("Entries");
    }
  }, [isUploaded]);

  useEffect(()=> {
    const name = localStorage.getItem('name')
    if(name){
      setName(name)
    }
    else{
      navigate('/login')
    }
  }, [])

  const getFirstName = (fullName)=> {
    const firstName = fullName ? fullName.split(" ") : []
    return firstName[0] || ''
  }

  const getNameInitials = (name)=> {
    const nameInitials = name ? name.split(' ') : []
    return nameInitials.length >= 2 ? `${nameInitials[0][0]}${nameInitials[1][0]}` : ''
  }

  function handleLogout(){
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="dashboard">
    
      <div className="sidebar">
        <h2 className="logo">TASK MANAGER</h2>
        <ul>
          <li
            className={activeSection === "Employees" ? "active" : ""}
            onClick={() => {
              setActiveSection("Employees");
              setShowUpload(false);
            }}
          >
            <img width={"20px"} src={employeesIcon} alt="" />
            <p>Employees</p>
          </li>
          <li
            className={activeSection === "Entries" ? "active" : ""}
            onClick={() => {
              setActiveSection("Entries");
              setShowUpload(false);
            }}
          >
            <img width={"20px"} src={entriesIcon} alt="" />
            <p>All Task</p>
          </li>
        </ul>
      </div>

      <div className="content">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{margin:'-12px 0px', display:'flex', justifyContent:'end', alignItems:'center', gap:'10px'}}>
          <h3>Hello! {getFirstName(name)}</h3>
          <span style={{backgroundColor:'#1e293b', color:'white', padding:'8px', borderRadius:'50%', width:'20px', height:'20px', display:'flex', justifyContent:'center', alignItems:'center'}}>{getNameInitials(name)}</span>
          </div>

          <div><button className="logout-btn" onClick={handleLogout} style={{
  color: 'white',              
  padding: '8px 20px',
  border: 'none',        
  borderRadius: '5px',         
  cursor: 'pointer', 
  fontSize: '16px', 
  fontWeight: 'bold', 
  transition: 'background-color 0.3s',
  outline: 'none',
}}>Log out</button></div>
        </div>
        <hr style={{marginBottom:'20px', border:'0', height:'1px', backgroundColor:'#ccc'}}/>

        {activeSection === "Employees" && (
          <div>
            {showUpload ? (
              isUploaded ? <Table/> : <UploadFile setIsUploaded={setIsUploaded}/>
            ) : (
              <AddEmployee setShowUpload={setShowUpload} />
            )}
          </div>
        )}
        {activeSection === "Entries" && (
          <div>
            <Table />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
