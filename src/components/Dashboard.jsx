import React, { useEffect, useState } from "react";
import "../styles/Dashboard.css";
import Table from "./Table";
import UploadFile from "./UploadFile";
import employeesIcon from "../assets/employees.svg";
import entriesIcon from "../assets/entry.svg";
import AddEmployee from "./AddEmployee";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("Employees");
  const [showUpload, setShowUpload] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false)

  useEffect(() => {
    if (isUploaded) {
      setActiveSection("Entries");
    }
  }, [isUploaded]);

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
