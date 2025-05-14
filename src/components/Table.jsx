import React, { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import "../styles/Table.css"; // External CSS file
import axios from "axios";
import whatsapp from "../assets/whatsapp.svg";
import { toast, ToastContainer } from "react-toastify";
import noentriestransparent from "../assets/noentry.png";
import whatsapplight from "../assets/whatsapplight.svg";

function Table() {
  const [allTasks, setAllTasks] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [status, setStatus] = useState(false);
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // state to track active tab
  const [searchTerm, setSearchTerm] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [expandedRows, setExpandedRows] = useState([]);

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
      axios.post("http://localhost:8000/update-reminder", {
        reminder_frequency: reminder_frequency,
        taskId: id,
      });
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

  return (
    <>
      <div
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

        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "12px",
            width: "400px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            marginRight: "350px",
          }}
        />
      </div>

      <div style={{ height: "600px", overflowY: "auto", marginTop: "10px" }}>
        {filteredTasks.length > 0 ? (
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
                        src={whatsapp}
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
                          <table className="nested-table">
                            <thead>
                              <tr>
                                <th style={{ textAlign: "center" }}>
                                  Task Details
                                </th>
                                <th>Status</th>
                                <th>Reason</th>
                                <th>Started At</th>

                                <th>Due Date</th>
                                <th>Reminder</th>
                                <th>Frequency</th>
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
                                    <td>{task.task_done}</td>
                                    <td>{task.reason}</td>

                                    <td>
                                      {task.started_at
                                        ? new Date(
                                            task.started_at
                                          ).toLocaleString()
                                        : "No start time"}
                                    </td>
                                    <td>
                                      {new Date(task.due_date).toLocaleString()}
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
                                    <td>{task.reminder_frequency}</td>
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
        ) : (
          <img
            style={{ marginTop: "15vh" }}
            width={"70%"}
            src={noentriestransparent}
          />
        )}
        <ToastContainer position="bottom-center" theme="colored" />
      </div>
    </>
  );
}

export default Table;
