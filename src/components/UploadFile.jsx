import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Table from "./Table";
import supabase from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "../styles/UploadFile.css"; // Import external CSS
import downloadIcon from '../assets/downloadIcon.svg'
import csvIcon from '../assets/csvIcon.svg'
import uploadIcon from '../assets/uploadIcon.svg'
import downloadlight from '../assets/downloadlight.svg'
import csvlight from '../assets/csvlight.svg'
import uploadlight from '../assets/uploadlight.svg'

function UploadFile({setIsUploaded}) {
  const [allData, setAllData] = useState([]);
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null)
  const [employerNumber, setEmployerNumber] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false);

   useEffect(()=> {
      const user_id = localStorage.getItem('user_id')
      const employer_number = localStorage.getItem('employer_number')
      console.log(`whatsapp:+${employerNumber}`);
      
      setUserId(user_id)
      setEmployerNumber(employer_number)
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

          let value = row[index] || ""; // if there's no value, set it as an empty string

          if (header.toLowerCase() === 'name' && typeof value === 'string') {
            value = value.trim(); // Trim leading and trailing spaces
          }

        obj[header] = value;

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

  // Add userId and employerNumber
  const tasksWithUserId = dataArray.map(task => ({
    ...task,
    userId,
    employerNumber: `whatsapp:+${employerNumber}`,
  }));

  // Group by name
  const grouped = {};

  tasksWithUserId.forEach(task => {
    const name = task.name;
    if (!grouped[name]) {
      grouped[name] = {
        name: task.name,
        phone: task.phone,
        userId: task.userId,
        employerNumber: task.employerNumber,
        tasks: [],
      };
    }

    grouped[name].tasks.push({
      task_details: task.tasks || '', // assumes column is 'tasks' in CSV
      reminder: task.reminder || '',
      reminder_frequency: task.reminder_frequency || '',
      reason: task.reason || '',
      task_done: task.task_done || '',
      reminder: task.reminder || '',
      due_date: task.due_date
    });
  });

  console.log('grouped', grouped);
  

  // Convert grouped object to array
  const groupedTasksArray = Object.values(grouped);

  // Upsert grouped tasks by name instead of phone
  for (let groupedTask of groupedTasksArray) {
    const { name } = groupedTask;

    const { data, error } = await supabase
      .from("grouped_tasks")
      .select("id, tasks")
      .eq("name", name)
      .single();

    if (data) {
      // Update existing
      const { error: updateError } = await supabase
        .from("grouped_tasks")
        .update({
          tasks: [...data.tasks, ...groupedTask.tasks], // append new tasks
        })
        .eq("name", name);

      if (updateError) {
        console.error("Error updating tasks:", updateError);
      } else {
        console.log(`Updated tasks for ${name}`);
      }
    } else {
      // Insert new
      const { error: insertError } = await supabase
        .from("grouped_tasks")
        .insert([groupedTask]);

      if (insertError) {
        console.error("Error inserting grouped task:", insertError);
      } else {
        console.log("Inserted new grouped task:", groupedTask);
      }
    }
  }

  await refreshTasks();
  // window.location.reload();
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
    <div className={`upload-container ${isDarkMode ? 'dark' : 'light'}`}>
      <h2 className="section-title">Bulk Import</h2>

      <div className="bulk-import-steps">
        <div className="step">
          <img src={isDarkMode ? downloadlight  : downloadIcon} alt="Excel Icon" className="step-icon" />
          <p><strong>Step 1:</strong> <a target="blank" href="https://docs.google.com/spreadsheets/d/1O2vQNxZylgppKYeBsE6Dc_7eXRiVls-bKFwzCvQThKw/edit?usp=sharing" className="download-link">Download</a> the sample Excel sheet format</p>
        </div>

        <div className="step">
          <img src={isDarkMode ? csvlight : csvIcon} alt="Excel Icon" className="step-icon" />
          <p><strong>Step 2:</strong> Upload your Excel sheet with customer details</p>
        </div>

        <div className="step">
        <img src={isDarkMode ? uploadlight : uploadIcon} alt="Excel Icon" className="step-icon" />
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
