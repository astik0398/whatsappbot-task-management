import React, { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import "../styles/Table.css"; // External CSS file
import axios from "axios";
import whatsapp from "../assets/whatsapp.svg";
import { toast } from "react-toastify";

function Table() {
  const [allTasks, setAllTasks] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [status, setStatus] = useState(false);

  async function getAllTasks() {
    const { data, error } = await supabase
      .from("tasks")
      .select("name, phone, tasks, task_done, due_date, reminder, id, reminder_frequency, reason");

    if (error) {
      throw error;
    }

    console.log(data);

    if (!data || data.length === 0) {
      alert("No data to display...");
      return;
    }

    setAllTasks(data);
    setHeaders(Object.keys(data[0]));
  }

  useEffect(() => {
    getAllTasks();
  }, []);

  function handleWhatsappClick(phone_number) {
    window.open(`https://wa.me/${phone_number}`);
  }

  async function handleUpdateReminder(id, status, task_done, reminder_frequency) {
    console.log("Reminder Toggle Clicked. New Status:", status);
    
    const extracted_frequency = `${reminder_frequency?.split(" ")[1]} ${reminder_frequency?.split(" ")[2]}`

    console.log('id, status, task_done, reminder_frequency',id, status, task_done, extracted_frequency);


    if (task_done === "Yes") {
      toast.error('The task is already marked as complete!')
      return;
    }

    const { error } = await supabase
      .from("tasks")
      .update({ reminder: status })
      .eq("id", id);

    if (error) {
      console.error("Error updating reminder:", error);
      return;
    }

    console.log("Reminder updated successfully");

    getAllTasks(); // Refresh table after update

    if (status) {
      axios.post(
        "https://whatsappbot-task-management-be-production.up.railway.app/update-reminder", {reminder_frequency: reminder_frequency}
      );
    }
  }

  return (
    <div style={{height:'700px', overflowY:'auto', marginTop:'-40px'}}>
      <table className="table">
        <thead>
          <tr>
            <th className="table-header">NAME</th>
            {/* <th className="table-header">PHONE</th> */}
            <th className="table-header">TASKS</th>
            <th className="table-header">STATUS</th>
            <th className="table-header">REASON</th>
            <th className="table-header">TIMELINE</th>
            <th className="table-header">SEND REMINDER</th>
            <th className="table-header">WHATSAPP</th>
          </tr>
        </thead>
        <tbody>
          {allTasks.length > 0 &&
            allTasks.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className="table-cell">{row.name}</td>
                {/* <td className="table-cell">{row.phone}</td> */}
                <td className="table-cell">{row.tasks}</td>
                <td className="table-cell"><span style={{backgroundColor:`${row.task_done === 'Pending' ? 'orange' : row.task_done === 'Not Completed' ? 'red' : 'green'}`, padding:'5px', borderRadius:'5px', color:'white'}} >{row.task_done}</span></td>
                <td className="table-cell">{row.reason}</td>
                <td className="table-cell">
                  {row.due_date &&
                    new Date(row.due_date).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                </td>
                <td className="table-cell">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={row.reminder === "true"}
                      className="toggle-input"
                      onChange={(e) =>
                        handleUpdateReminder(
                          row.id,
                          e.target.checked,
                          row.task_done,
                          row.reminder_frequency
                        )
                      }
                    />
                    <span className="slider"></span>
                  </label>
                </td>
                <td className="table-cell whatsapp-icon" onClick={() => handleWhatsappClick(row.phone)}>
                  <img src={whatsapp} alt="WhatsApp" />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
