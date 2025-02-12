import React, { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import "../components/Table.css";
import axios from "axios";

function Table() {
  const [allTasks, setAllTasks] = useState([]);
  const [headers, setHeaders] = useState([]);

  const [status, setStatus] = useState(false)
  
  async function getAllTasks() {
    const { data, error } = await supabase.from("tasks").select("*");

    if (error) {
      throw error;
    }

    console.log(data);

    setAllTasks(data);
    setHeaders(Object.keys(data[0]));
  }

  useEffect(() => {
    getAllTasks();
  }, []);

  function handleWhatsappClick(phone_number) {
    window.open(`https://wa.me/${phone_number}`);
  }

  async function handleUpdateReminder(id, status, task_done) {
    console.log("Reminder Toggle Clicked. New Status:", status);
  
    if (task_done === "Yes") {
      alert("The task is already marked as complete");
      return;
    }
  
    const { error } = await supabase.from("tasks").update({ reminder: status }).eq("id", id);
  
    if (error) {
      console.error("Error updating reminder:", error);
      return;
    }
  
    console.log("Reminder updated successfully");
  
    getAllTasks(); // Refresh table after update
  
    // Only call backend if reminder is turned ON
    if (status) {
      axios.post("https://whatsappbot-task-management-be-production.up.railway.app/update-reminder");
    }
  }  

console.log(allTasks);



  return (
    <div>
      <table style={tableStyle}>
        <thead>
          <tr>
            {/* Render header row */}
            {headers.map((header, index) => (
              <th key={index} style={tableHeaderStyle}>
                {header}
              </th>
            ))}
            <th style={tableHeaderStyle}>Whatsapp</th>
          </tr>
        </thead>
        <tbody>
          {/* Render each data row */}
          {allTasks.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td style={tableCellStyle}> {row.id}</td>
              <td style={tableCellStyle}>
                {" "}
                {
                  new Date(row.created_at)
                    .toLocaleDateString("en-GB")
                    .split("T")[0]
                }
              </td>
              <td style={tableCellStyle}> {row.name}</td>
              <td style={tableCellStyle}> {row.phone}</td>
              <td style={tableCellStyle}> {row.tasks}</td>
              <td style={tableCellStyle}> {row.task_done}</td>
              <td style={tableCellStyle}>
                {row.due_date && new Date(row.due_date).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </td>{" "}
              <td style={tableCellStyle}>
              <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={row.reminder === "true" ? true : false}
                      className="toggle-input"
                      onChange={(e)=>handleUpdateReminder(row.id, e.target.checked, row.task_done)}
                    />
                    <span className="slider"></span>
                  </label>
              </td>
              <td
                onClick={() => handleWhatsappClick(row.phone)}
                style={tableCellStyle}
              >
                📞
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const tableStyle = {
  width: "90%",
  borderCollapse: "collapse",
  boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.1)",
  margin: "auto",
  marginTop: "50px",
};

const tableHeaderStyle = {
  backgroundColor: "#4CAF50",
  color: "white",
  padding: "12px 15px",
  textAlign: "center",
  fontWeight: "bold",
};

const tableCellStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  textAlign: "center",
};

export default Table;
