import React, { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import "../styles/Table.css"; // External CSS file
import axios from "axios";
import whatsapp from "../assets/whatsapp.svg";
import { toast, ToastContainer } from "react-toastify";
import noentriestransparent from "../assets/noentry.png";
import whatsapplight from "../assets/whatsapplight.svg";
import actionEdit from "../assets/editIcon.svg";
import actionDelete from "../assets/deleteIcon.svg";
import editLight from '../assets/editlight.svg'
import deleteLight from '../assets/deletelight.svg'
import whatsappLight from '../assets/whatsapplight.svg'

import moment from "moment";
import Kanban from "./Kanban";

function Table() {
  const [allTasks, setAllTasks] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [status, setStatus] = useState(false);
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // state to track active tab
  const [searchTerm, setSearchTerm] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [expandedRows, setExpandedRows] = useState([]);
  const [taskDetails, setTaskDetails] = useState("");
  const [note, setNote] = useState("");
  const [taskId, setTaskId] = useState("");
    const [isTableView, setIsTableView] = useState(true); // default: Table view

      const handleToggle = () => {
     setIsTableView((prev) => !prev);
  };

  const toggleRow = (index) => {
    setExpandedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  useEffect(() => {
    const user_id = localStorage.getItem("user_id");
    console.log(typeof user_id);

    setUserId(user_id);
  }, []);

  useEffect(() => {
    if (userId) {
      getAllTasks();
    }
  }, [userId]);

  async function getAllTasks() {
    const { data, error } = await supabase
      .from("grouped_tasks")
      .select("name, phone, tasks, id")
      .eq("userId", userId)
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to fetch tasks.");
      return;
    }

    if (!data || data.length === 0) {
      toast.error("No data to display...");
      return;
    }

    console.log("data===>", data);

    setAllTasks(data);
  }

  function handleWhatsappClick(phone_number) {
    console.log("phone_number", phone_number);

    window.open(`https://wa.me/${phone_number}`);
  }

  async function handleUpdateReminder(
    userId,
    id,
    status,
    task_done,
    reminder_frequency
  ) {
    console.log("Reminder Toggle Clicked. New Status:", status);

    const extracted_frequency = `${reminder_frequency?.split(" ")[1]} ${
      reminder_frequency?.split(" ")[2]
    }`;

    console.log(
      "userId, taskid, status, task_done, reminder_frequency",
      userId,
      id,
      status,
      task_done,
      extracted_frequency
    );

    if (task_done === "Completed") {
      toast.error("The task is already marked as complete!");
      return;
    }

    const { data, error: fetchError } = await supabase
      .from("grouped_tasks")
      .select("tasks")
      .eq("id", userId)
      .single();

    console.log("data", data);

    if (fetchError) {
      console.error("Failed to fetch tasks", fetchError);
      return;
    }

    const updatedTasks = data.tasks.map((task) => {
      if (task.taskId === id) {
        console.log("clicked task", task);

        return { ...task, reminder: status === true ? "true" : "false" };
      }
      return task;
    });

    console.log("updatedTasks", updatedTasks);

    const { error: updateError } = await supabase
      .from("grouped_tasks")
      .update({ tasks: updatedTasks })
      .eq("id", userId);

    if (updateError) {
      console.error("Failed to update reminder", updateError);
    } else {
      console.log("Reminder updated successfully");
    }
    getAllTasks(); // Refresh table after update

    if (status) {
      axios.post(
        "https://whatsappbot-task-management-be-production.up.railway.app/update-reminder",
        {
          reminder_frequency: reminder_frequency,
          taskId: id,
        }
      );
    }
  }

  const filteredTasks = allTasks.filter((parentTask) => {
    const matchesTab =
      activeTab === "all" ||
      parentTask.tasks.some(
        (task) =>
          (activeTab === "pending" && task.task_done === "Pending") ||
          (activeTab === "incomplete" && task.task_done === "Not Completed") ||
          (activeTab === "completed" && task.task_done === "Completed")
      );

    const matchesSearch = parentTask.tasks.some((task) =>
      task.task_details.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return matchesTab && matchesSearch;
  });

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

  const hasNotes = filteredTasks.some((user) =>
    user.tasks.some((task) => task.hasOwnProperty("notes"))
  );

  console.log("hasNotes===>", hasNotes);

  function handleEdit(task) {
    console.log(task);
    console.log(task.notes);
    setShowModal(true);
    setTaskDetails(task.task_details);
    setNote(task.notes);
    setTaskId(task.taskId);
  }

  async function handleDelete(task) {
    console.log(task, "task inside handleDelete");

    try {
      // Validate taskId
      if (!task.taskId) {
        console.error("No taskId provided for deletion.");
        toast.error("Invalid task.");
        return;
      }

      // Fetch all records for the user
      const { data, error: fetchError } = await supabase
        .from("grouped_tasks")
        .select("tasks, id")
        .eq("userId", userId);

      if (fetchError) {
        console.error("Failed to fetch tasks:", fetchError);
        toast.error("Failed to fetch tasks.");
        return;
      }

      if (!data || data.length === 0) {
        console.error("No tasks found for the user.");
        toast.error("No tasks found.");
        return;
      }

      // Find the record containing the task with the matching taskId
      let updatedRecord = null;
      let recordId = null;

      for (const record of data) {
        const taskIndex = record.tasks.findIndex(
          (t) => t.taskId === task.taskId
        );
        if (taskIndex !== -1) {
          // Found the record and task
          updatedRecord = {
            ...record,
            tasks: record.tasks.filter((_, index) => index !== taskIndex),
          };
          recordId = record.id;
          break;
        }
      }

      if (!updatedRecord) {
        console.error("Task with taskId not found:", task.taskId);
        toast.error("Task not found.");
        return;
      }

      // Update the specific record in Supabase
      const { error: updateError } = await supabase
        .from("grouped_tasks")
        .update({ tasks: updatedRecord.tasks })
        .eq("id", recordId);

      if (updateError) {
        console.error("Failed to delete task:", updateError);
        toast.error("Failed to delete task.");
        return;
      }

      // Refresh the task list
      await getAllTasks();

      // Show success message
      toast.success("Task deleted successfully!");
    } catch (error) {
      console.error("Error in handleDelete:", error);
      toast.error("An unexpected error occurred.");
    }
  }

  async function handleUpdate() {
    try {
      // Validate inputs
      if (!taskDetails.trim()) {
        toast.error("Task details cannot be empty!");
        return;
      }

      // Fetch all records for the user
      const { data, error: fetchError } = await supabase
        .from("grouped_tasks")
        .select("tasks, id")
        .eq("userId", userId);

      if (fetchError) {
        console.error("Failed to fetch tasks:", fetchError);
        toast.error("Failed to fetch tasks.");
        return;
      }

      if (!data || data.length === 0) {
        console.error("No tasks found for the user.");
        toast.error("No tasks found.");
        return;
      }

      // Find the record containing the task with the matching taskId
      let updatedRecord = null;
      let recordId = null;

      for (const record of data) {
        const taskIndex = record.tasks.findIndex(
          (task) => task.taskId === taskId
        );
        if (taskIndex !== -1) {
          // Found the record and task
          updatedRecord = {
            ...record,
            tasks: record.tasks.map((task, index) => {
              if (index === taskIndex) {
                return {
                  ...task,
                  task_details: taskDetails,
                  notes: note,
                };
              }
              return task;
            }),
          };
          recordId = record.id;
          break;
        }
      }

      if (!updatedRecord) {
        console.error("Task with taskId not found:", taskId);
        toast.error("Task not found.");
        return;
      }

      // Update the specific record in Supabase
      const { error: updateError } = await supabase
        .from("grouped_tasks")
        .update({ tasks: updatedRecord.tasks })
        .eq("id", recordId);

      if (updateError) {
        console.error("Failed to update task:", updateError);
        toast.error("Failed to update task.");
        return;
      }

      // Refresh the task list
      await getAllTasks();

      // Reset modal state and show success message
      setShowModal(false);
      setTaskDetails("");
      setNote("");
      setTaskId("");
      toast.success("Task updated successfully!");
    } catch (error) {
      console.error("Error in handleUpdate:", error);
      toast.error("An unexpected error occurred.");
    }
  }

  const formatReminderDateTime = (dateTimeStr) => {
   if (!dateTimeStr) return "";

  const date = moment(dateTimeStr, "DD-MM-YYYY HH:mm");
  if (!date.isValid()) return "";

  const day = date.date();
  const month = date.format("MMMM");
  const timePart = date.format("HH:mm");

  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th";

  return `once on ${day}${suffix} ${month} at ${timePart}`;
  };

  

  return (
    <>
      <div
      className="controls-container"
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <div style={{ marginLeft: "0px" }} className="tab-buttons">
          <button
            id="btn-all"
            className={activeTab === "all" ? "active" : ""}
            onClick={() => setActiveTab("all")}
          >
            All
          </button>
          <button
            id="btn-pending"
            className={activeTab === "pending" ? "active" : ""}
            onClick={() => setActiveTab("pending")}
          >
            Pending
          </button>
          <button
            id="btn-incomplete"
            className={activeTab === "incomplete" ? "active" : ""}
            onClick={() => setActiveTab("incomplete")}
          >
            Incomplete
          </button>
          <button
            id="btn-completed"
            className={activeTab === "completed" ? "active" : ""}
            onClick={() => setActiveTab("completed")}
          >
            Completed
          </button>
        </div>

       <div>
         <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
        />
       </div>

        <div className="view-toggle">
          <span className="view-label">Board View</span>
          <label className="view-toggle-switch">
            <input
              type="checkbox"
              className="view-toggle-input"
              checked={isTableView} // Default to Table View
              onChange={handleToggle}
            />
            <span className="view-slider"></span>
          </label>
          <span className="view-label">Table View</span>
        </div>
      </div>

      <div style={{ height: "600px", overflowY: "auto", marginTop: "10px" }}>
        {isTableView ? (filteredTasks.length > 0 ? (
         <div className="table-container">
           <table className="table">
            <thead>
              <tr>
                <th style={{ textAlign: "center" }}>ID</th>

                <th style={{ textAlign: "center" }}>NAME</th>
                <th style={{ textAlign: "center" }}>PHONE</th>
                <th style={{ textAlign: "center" }}>TASKS</th>

                <th style={{ textAlign: "center" }}>WHATSAPP</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((user, index) => (
                <React.Fragment key={index}>
                  <tr onClick={() => toggleRow(index)}>
                    <td style={{ textAlign: "center" }}>{user.id}</td>

                    <td style={{ textAlign: "center" }}>{user.name}</td>
                    <td style={{ textAlign: "center" }}>{user.phone}</td>
                    <td style={{ textAlign: "center" }}>
                      {
                        user.tasks.filter(
                          (task) => task.task_details.trim() !== ""
                        ).length
                      }{" "}
                      Tasks{" "}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <img
                        onClick={() => handleWhatsappClick(user.phone)}
                        style={{ width: "20px" }}
                        src={isDarkMode ? whatsappLight :  whatsapp}
                        alt=""
                      />
                    </td>
                  </tr>
                  {expandedRows.includes(index) && (
                    <tr>
                      <td colSpan="5">
                        {user.tasks.every(
                          (task) => task.task_details.trim() === ""
                        ) ? (
                          <p style={{ textAlign: "center" }}>
                            No tasks with details available
                          </p>
                        ) : (
                          <table className="nested-table" style={{backgroundColor:'transparent'}}>
                            <thead>
                              <tr>
                                <th style={{ textAlign: "center" }}>
                                  Task Details
                                </th>
                                {hasNotes && <th style={{width:'150px'}}>Notes</th>}
                                <th>Status</th>
                                <th>Reason</th>
                                <th>Started At</th>

                                <th>Due Date</th>
                                <th>Reminder</th>
                                <th>Frequency</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {user.tasks
                                .filter(
                                  (task) => task.task_details.trim() !== ""
                                )
                                .map((task, idx) => (
                                  <tr key={idx}>
                                    <td>{task.task_details}</td>
                                    {hasNotes && (
                                      <td>
                                        {task.notes &&
                                        typeof task.notes === "object" ? (
                                          <>
                                          <p>Customer Name: <b>{task.notes.customer_name}</b></p>
                                            Order ID:{" "}
                                            {task.notes.order_id ?? "N/A"}{" "}
                                            <br />
                                            Handled By:{" "}
                                            <b>{task.notes.handled_by ??
                                              "N/A"}{" "}</b>
                                            <br />
                                            Bakery Location:{" "}
                                            {task.notes.bakery_location ??
                                              "N/A"}{" "}
                                            <br />
<p>                                            <b>Payment Summary: <br /></b>
</p>
                                            {`${task.notes.payment_summary.mode} : ${task.notes.payment_summary.amount}` ?? "N/A"}
                                          <br />
                                                Balance: <span className="font-medium">{task.notes.payment_summary.balance}</span>
                                          </>
                                        ) : (
                                          task.notes
                                        )}
                                      </td>
                                    )}
                                    <td style={{ minWidth: "120px" }}>
                                      <span
                                        style={{
                                          backgroundColor:
                                            task.task_done === "Pending"
                                              ? "orange"
                                              : task.task_done === "Completed"
                                              ? "green"
                                              : task.task_done ===
                                                "Not Completed"
                                              ? "red"
                                              : "",

                                          padding: "6px",
                                          color: "white",
                                          borderRadius: "6px",
                                        }}
                                      >
                                        {task.task_done}
                                      </span>
                                    </td>
                                    <td>{task.reason}</td>

                                    <td style={{ minWidth: "150px" }}>
                                      {task.started_at
                                        ? moment(
                                            task.started_at,
                                            "DD-MM-YYYY HH:mm"
                                          ).format("DD/MM/YYYY h:mm:ss A")
                                        : "No start time"}
                                    </td>
                                    <td style={{ minWidth: "150px" }}>
                                      {moment(
                                        task.due_date,
                                        "DD-MM-YYYY HH:mm"
                                      ).format("DD/MM/YYYY h:mm:ss A")}
                                    </td>
                                    <td>
                                      <label className="toggle-switch">
                                        <input
                                          type="checkbox"
                                          checked={task.reminder === "true"}
                                          className="toggle-input"
                                          onChange={(e) =>
                                            handleUpdateReminder(
                                              user.id,
                                              task.taskId,
                                              e.target.checked,
                                              task.task_done,
                                              task.reminder_frequency
                                            )
                                          }
                                        />
                                        <span className="slider"></span>
                                      </label>
                                    </td>
                                    <td>
                                      {task.reminder_type === "recurring"
                                        ? task.reminder_frequency
                                        : formatReminderDateTime(
                                            task.reminderDateTime
                                          )}
                                    </td>

                                    <td className="table-cell icons">
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "center",
                                          gap: "30px",
                                        }}
                                      >
                                        <span>
                                          <img
                                            src={isDarkMode ? editLight : actionEdit}
                                            style={{ width: "20px" }}
                                            onClick={() => handleEdit(task)}
                                            alt=""
                                          />
                                        </span>{" "}
                                        <span>
                                          <img
                                            src={isDarkMode ? deleteLight : actionDelete}
                                            style={{ width: "20px" }}
                                            onClick={() => handleDelete(task)}
                                            alt=""
                                          />
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
         </div>
        ) : (
          <img
            style={{ marginTop: "15vh" }}
            width={"70%"}
            src={noentriestransparent}
          />
        )) : <Kanban/>}

        {showModal && (
          <div
            className="modal-overlay"
            style={{
              position: "fixed",
              top: "0",
              left: "0",
              right: "0",
              bottom: "0",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: "1000",
            }}
          >
            <div
              className="modal"
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
                width: "500px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <h2
                style={{
                  fontSize: "18px",
                  marginBottom: "20px",
                  color: "#333",
                }}
              >
                Edit Task
              </h2>

              <input
                type="text"
                name="name"
                placeholder="Edit Task Detail"
                style={{
                  padding: "10px",
                  marginBottom: "10px",
                  width: "100%",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                }}
                value={taskDetails}
                onChange={(e) => setTaskDetails(e.target.value)}
              />

              <input
                type="text"
                name="note"
                placeholder="Add a Note"
                style={{
                  padding: "10px",
                  marginBottom: "20px",
                  width: "100%",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                }}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />

              <div
                className="btn-div"
                style={{
                  display: "flex",
                  justifyContent: "end",
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <button
                  className="button-save"
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px",
                    width: "45%",
                  }}
                  onClick={handleUpdate}
                >
                  Update
                </button>

                <span
                  onClick={() => setShowModal(false)}
                  className="modal-close"
                  style={{
                    fontSize: "24px",
                    cursor: "pointer",
                    color: "#999",
                    padding: "5px",
                    marginLeft: "10px",
                  }}
                >
                  &times;
                </span>
              </div>
            </div>
          </div>
        )}
        <ToastContainer autoClose={2000} theme="colored" />
      </div>
    </>
  );
}

export default Table;
