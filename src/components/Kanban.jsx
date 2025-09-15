import React, { useEffect, useState } from "react";
import "../styles/Kanban.css";
import supabase from "../supabaseClient";
import { toast } from "react-toastify";
import avatar from '../assets/user.png'

const Kanban = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [userId, setUserId] = useState(null);
  const [kanbanData, setKanbanData] = useState({
    Pending: [],
    Done: [],
    "Past Due": [],
  });

  useEffect(() => {
    const user_id = localStorage.getItem("user_id");
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

    // Flatten and restructure data by task_done
    const formattedData = {
      Pending: [],
      Done: [],
      "Past Due": [],
    };

    data.forEach((user) => {
      user.tasks.forEach((task) => {
        const taskObj = {
          id: task.taskId || task.id, // fallback if taskId missing
          title: task.task_details || "Untitled Task",
          tag: user.name,
          tagColor: task.task_done === 'Pending' ? "orange" : task.task_done === 'Completed' ? "green" : task.task_done === "Not Completed" ? "red" : "", // you can later generate dynamic colors
          dueDate: task.due_date || "No Date",
          assignee: user.phone || "👤",
        };

        if (task.task_done === "Pending") {
          formattedData.Pending.push(taskObj);
        } else if (task.task_done === "Completed") {
          formattedData.Done.push(taskObj);
        } else if (task.task_done === "Not Completed") {
          formattedData["Past Due"].push(taskObj);
        }
      });
    });

    setKanbanData(formattedData);
    setAllTasks(data);
  }

  return (
    <div className="kanban-container">
      {Object.keys(kanbanData).map((section) => (
        <div key={section} className="kanban-column">
          <div className="kanban-column-header">
            <span>{section}</span>
            <span className="task-count">{kanbanData[section].length}</span>
          </div>
          {kanbanData[section].map((task) => (
            <div key={task.id} className="kanban-card">
              <h4>{task.title}</h4>
              <div style={{display:'flex', justifyContent:'center', gap:'8px', marginBottom:'10px'}}>
                <img style={{width:'20px'}} src={avatar} alt="" />
                <span
                className="kanban-tag"
                style={{ backgroundColor: task.tagColor }}
              >
                {task.tag}
              </span>
              </div>
              <div className="kanban-footer">
                <span className="assignee">{task.assignee}</span>
                <span className="due-date">{task.dueDate}</span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Kanban;
