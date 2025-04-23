import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Table from "./Table";
import supabase from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "../styles/UploadFile.css"; // Import external CSS
import downloadIcon from '../assets/downloadIcon.svg'
import csvIcon from '../assets/csvIcon.svg'
import uploadIcon from '../assets/uploadIcon.svg'

function UploadFile({setIsUploaded}) {
  const [allData, setAllData] = useState([]);
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null)

   useEffect(()=> {
      const user_id = localStorage.getItem('user_id')
      console.log(user_id);
      
      setUserId(user_id)
    }, [])

  function handleFileUpload(e) {

    console.log('inside handleFileUpload...');
    
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    console.log("reader", reader);

    reader.onerror = (error) => {
      console.error("Error reading file:", error);
    };

    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      console.log("arraybuffer", arrayBuffer);

      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      console.log("workbook", workbook);

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const headers = jsonData[0];

      const formattedData = jsonData.slice(1).map((row) => {
        let obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || ""; // if there's no value, set it as an empty string
        });
        return obj;
      });

      console.log('formattedData',formattedData);

      setAllData(formattedData);

      setTimeout(() => addTask(formattedData), 500);
    };

    reader.readAsArrayBuffer(file);
  }

  async function addTask(dataArray) {
    if (!dataArray || dataArray.length === 0) {
      console.error("No data to insert!");
      return;
    }

    const tasksWithUserId = dataArray.map(task=> ({
      ...task,
      userId: userId
    }))

    for (let task of tasksWithUserId) {
      const { name, phone } = task; 
  
      const { data, error } = await supabase
        .from("tasks")
        .select("id") 
        .eq("phone", phone)  
        .single(); 
  
      if (data) {
        console.log(`Skipping task with phone number: ${phone} because it already exists.`);
        continue;
      }
  
      const { data: insertData, error: insertError } = await supabase
        .from("tasks")
        .insert([task]);
  
      if (insertError) {
        console.error("Error inserting task:", insertError);
      } else {
        console.log("Inserted task:", insertData);
      }
    }  

    await refreshTasks();

    // navigate("/entries");
    // setIsUploaded(true)
    window.location.reload()
  }

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
    <div className="upload-container">
      <h2 className="section-title">Bulk Import</h2>

      <div className="bulk-import-steps">
        <div className="step">
          <img src={downloadIcon} alt="Excel Icon" className="step-icon" />
          <p><strong>Step 1:</strong> <a target="blank" href="https://docs.google.com/spreadsheets/d/1O2vQNxZylgppKYeBsE6Dc_7eXRiVls-bKFwzCvQThKw/edit?usp=sharing" className="download-link">Download</a> the sample Excel sheet format</p>
        </div>

        <div className="step">
          <img src={csvIcon} alt="Excel Icon" className="step-icon" />
          <p><strong>Step 2:</strong> Upload your Excel sheet with customer details</p>
        </div>

        <div className="step">
        <img src={uploadIcon} alt="Excel Icon" className="step-icon" />
          <p><strong>Step 3:</strong> Click on <span className="highlight-text">"Upload Button"</span></p>
        </div>
      </div>

      <label htmlFor="file-upload" className="upload-label">
        Upload a file
        <input
          onChange={handleFileUpload}
          accept=".csv, .xls, .xlsx"
          type="file"
          id="file-upload"
          name="file"
          className="upload-input"
        />
      </label>
      <p className="file-support-text">Supports .csv, .xls, .xlsx</p>
    </div>
  );
}

export default UploadFile;
