import React, { useEffect, useState } from "react";
import "../styles/Dashboard.css";
import Table from "./Table";
import UploadFile from "./UploadFile";
import employeesIcon from "../assets/employees.svg";
import entriesIcon from "../assets/entry.svg";
import AddEmployee from "./AddEmployee";
import { useNavigate } from "react-router-dom";
import settings from '../assets/settings.svg'
import Settings from "./Settings";
import {FaBars, FaTimes, FaSun, FaMoon } from "react-icons/fa"; // at the top of your file
import Analytics from "./Analytics";
import analyticsIcon from '../assets/analytics.svg'
import meeting from '../assets/meeting.svg'
import Meetings from "./Meetings";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [showUpload, setShowUpload] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false)
  const [theme, setTheme] = useState('light'); // 'light' or 'dark'
  const [name, setName] = useState('')
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // NEW
  const navigate = useNavigate()
  
  const dummyAnalyticsData = {
    totalEmployees: 20,
    totalTasks: 100,
    completedTasks: 60,
    pendingTasks: 30,
    overdueTasks: 10,
  };

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

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) setTheme(savedTheme);
  }, []);
  
  useEffect(() => {
    localStorage.setItem("theme", theme);
    window.dispatchEvent(new Event("storage")); // <== manually trigger
      }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };
  

  return (
      <div className="dashboard">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <h2 className="logo">TASK MANAGER</h2>
        <span style={{ marginTop: "-10px" }}>
          {`(+${localStorage.getItem("employer_number")})`}
        </span>
        <ul>
          <li
            className={activeSection === "Dashboard" ? "active" : ""}
            onClick={() => {
              setActiveSection("Dashboard");
              setShowUpload(false);
              setIsSidebarOpen(false); // close sidebar after selection
            }}
          >
            <img width={"20px"} src={analyticsIcon} alt="" />
            <p>Dashboard</p>
          </li>
          <li
            className={activeSection === "Employees" ? "active" : ""}
            onClick={() => {
              setActiveSection("Employees");
              setShowUpload(false);
              setIsSidebarOpen(false);
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
              setIsSidebarOpen(false);
            }}
          >
            <img width={"20px"} src={entriesIcon} alt="" />
            <p>All Tasks</p>
          </li>
          <li
            className={activeSection === "Meetings" ? "active" : ""}
            onClick={() => {
              setActiveSection("Meetings");
              setShowUpload(false);
              setIsSidebarOpen(false);
            }}
          >
            <img width={"20px"} src={meeting} alt="" />
            <p>All Meetings</p>
          </li>
          <li
            className={activeSection === "Settings" ? "active" : ""}
            onClick={() => {
              setActiveSection("Settings");
              setShowUpload(false);
              setIsSidebarOpen(false);
            }}
          >
            <img width={"20px"} src={settings} alt="" />
            <p>Settings</p>
          </li>
        </ul>

          <div className="mobile-logout">
    <button className="logout-btn" onClick={handleLogout}>
      Log out
    </button>
  </div>
      </div>

      {/* Content */}
      <div className={`content ${theme}`}>
        {/* Top bar */}
        <div
        className="topbar"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Burger icon only on mobile */}
          <div className={`burger-icon ${isSidebarOpen ? "active" : ""}`} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </div>

          <div
           
            className="name-initials-div"
          >
            <h3>Hello! {getFirstName(name)}</h3>
            <span
              style={{
                backgroundColor: "#1e293b",
                color: "white",
                padding: "8px",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {getNameInitials(name)}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "50px",
            }}
          >
            <div
              onClick={toggleTheme}
              className="theme-toggle"
              style={{ cursor: "pointer", fontSize: "24px", display: "flex" }}
            >
              {theme === "light" ? <FaMoon /> : <FaSun color="yellow" />}
            </div>

            <button className="logout-btn desktop-only" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>

        <hr
          style={{
            marginBottom: "20px",
            border: "0",
            height: "1px",
            backgroundColor: "#ccc",
          }}
        />

        {/* Sections */}
        {activeSection === "Dashboard" && <Analytics data={dummyAnalyticsData} />}
        {activeSection === "Employees" &&
          (showUpload ? (isUploaded ? <Table /> : <UploadFile setIsUploaded={setIsUploaded} />) : <AddEmployee setShowUpload={setShowUpload} />)}
        {activeSection === "Entries" && <Table />}
        {activeSection === "Settings" && <Settings />}
        {activeSection === "Meetings" && <Meetings />}
      </div>
    </div>
  );
};

export default Dashboard;
