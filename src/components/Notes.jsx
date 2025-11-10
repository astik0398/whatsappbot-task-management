import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import supabase from "../supabaseClient";
import '../styles/Notes.css'

export default function Notes() {
  const [tasks, setTasks] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("group_notes")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Error fetching tasks:", error);
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const toggleExpand = (taskId) => {
    setExpanded((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  return (
    <div className="tasks-container">
      <div className="tasks-wrapper">
        <h1 className="tasks-title">📋 Task Management Board</h1>

        <div className="scrollable-content">
          {loading ? (
            <p className="loading-text">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="loading-text">No tasks found.</p>
          ) : (
            <div className="tasks-list">
              {tasks.map((task, index) => (
                <div key={task.id} className="task-card">
                  <div className="task-header">
                    <div>
                      <h2 className="task-name">
                        {index+1}. {task.task_title || "Untitled Task"}
                      </h2>
                     
                     <p className="task-assignee">
  Assigned to:{" "}
  {Array.isArray(task.assignee) && task.assignee.length > 0 ? (
    task.assignee.map((name, idx) => (
      <span key={idx} className="assignee-pill">
        {name.toUpperCase()}
      </span>
    ))
  ) : (
    <span className="task-assignee-name">Unassigned</span>
  )}
</p>

                      <div style={{ display:'flex', justifyContent:'left', alignItems:'center', gap:'5px'}}>
                        <p className="task-assignee"> Status:</p>
                       
                        <p
                        className={`task-status ${
                          task.status === "open" ? "open" : "closed"
                        }`}
                      >
                        {task.status}
                      </p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleExpand(task.task_id)}
                      className="expand-btn"
                    >
                      {expanded[task.task_id] ? <ChevronUp /> : <ChevronDown />}
                    </button>
                  </div>

                  {expanded[task.task_id] && (
                    <div className="task-messages">
                      <h3 className="messages-title">Related Messages</h3>
                      {task.related_messages?.length > 0 ? (
                        <ul className="messages-list">
                          {task.related_messages.map((msg, i) => (
                            <li key={i} className="message-item">
                              {msg}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="no-messages">No messages yet.</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
