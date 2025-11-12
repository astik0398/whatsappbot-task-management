import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import supabase from "../supabaseClient";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "../styles/Notes.css";

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

  const handleDeleteTask = async (taskId) => {
    try {
      const { error } = await supabase
        .from("group_notes")
        .delete()
        .eq("id", taskId);

      if (error) {
        console.error("Error deleting task:", error);
        return;
      }

      const updatedTasks = tasks.filter((task) => task.id !== taskId);
      setTasks(updatedTasks);
      console.log(`Task ${taskId} deleted successfully from Supabase`);
    } catch (err) {
      console.error("Unexpected error deleting task:", err);
    }
  };

  const handleDeleteMessage = async (taskId, msgIndex) => {
    try {
      const taskToUpdate = tasks.find((t) => t.id === taskId);
      if (!taskToUpdate) return;

      const updatedMessages = taskToUpdate.related_messages.filter(
        (_, i) => i !== msgIndex
      );

      const { error } = await supabase
        .from("group_notes")
        .update({ related_messages: updatedMessages })
        .eq("id", taskId);

      if (error) {
        console.error("Error deleting message:", error);
        return;
      }

      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, related_messages: updatedMessages } : task
      );
      setTasks(updatedTasks);

      console.log(`Message ${msgIndex} deleted successfully from Supabase`);
    } catch (err) {
      console.error("Unexpected error deleting message:", err);
    }
  };

  // 🔥 Handle drag and drop between tasks
  const handleDragEnd = async (result) => {
    const { source, destination } = result;

    if (!destination) return;

    // Prevent dropping into same list
    if (source.droppableId === destination.droppableId) return;

    const sourceTaskIndex = tasks.findIndex(
      (task) => task.id.toString() === source.droppableId
    );
    const destTaskIndex = tasks.findIndex(
      (task) => task.id.toString() === destination.droppableId
    );

    const sourceTask = tasks[sourceTaskIndex];
    const destTask = tasks[destTaskIndex];

    const draggedMsg = sourceTask.related_messages[source.index];

    // Update source and destination arrays
    const updatedSourceMsgs = Array.from(sourceTask.related_messages);
    updatedSourceMsgs.splice(source.index, 1);

    const updatedDestMsgs = Array.from(destTask.related_messages || []);
    updatedDestMsgs.splice(destination.index, 0, draggedMsg);

    // Update local state first for smooth UI
    const updatedTasks = tasks.map((task, i) => {
      if (i === sourceTaskIndex)
        return { ...task, related_messages: updatedSourceMsgs };
      if (i === destTaskIndex)
        return { ...task, related_messages: updatedDestMsgs };
      return task;
    });
    setTasks(updatedTasks);

    // Sync with Supabase
    try {
      const { error: srcError } = await supabase
        .from("group_notes")
        .update({ related_messages: updatedSourceMsgs })
        .eq("id", sourceTask.id);

      const { error: destError } = await supabase
        .from("group_notes")
        .update({ related_messages: updatedDestMsgs })
        .eq("id", destTask.id);

      if (srcError || destError) {
        console.error("Error updating Supabase after drag:", srcError || destError);
      }
    } catch (err) {
      console.error("Unexpected error updating after drag:", err);
    }
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
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="tasks-list">
                {tasks.map((task, index) => (
                  <div key={task.id} className="task-card">
                    <div className="task-header">
                      <div>
                        <h2 className="task-name">
                          {index + 1}. {task.task_title || "Untitled Task"}
                        </h2>

                        <p style={{textAlign:'left'}} className="task-assignee">
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

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "left",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
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

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column-reverse",
                          marginTop: "auto",
                          marginBottom: "auto",
                          gap: "65px",
                        }}
                      >
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="delete-task-btn"
                          title="Delete Task"
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={20} color="gray" />
                        </button>

                        <button
                          onClick={() => toggleExpand(task.task_id)}
                          className="expand-btn"
                        >
                          {expanded[task.task_id] ? <ChevronUp /> : <ChevronDown />}
                        </button>
                      </div>
                    </div>

                    {expanded[task.task_id] && (
                      <Droppable droppableId={task.id.toString()}>
                        {(provided, snapshot) => (
                          <div
                            className={`task-messages ${
                              snapshot.isDraggingOver ? "drag-over" : ""
                            }`}
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            <h3 className="messages-title">Related Messages</h3>
                            {task.related_messages?.length > 0 ? (
                              <ul className="messages-list">
                                {task.related_messages.map((msg, i) => (
                                  <Draggable
                                    key={`${task.id}-${i}`}
                                    draggableId={`${task.id}-${i}`}
                                    index={i}
                                  >
                                    {(provided, snapshot) => (
                                      <li
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          background: snapshot.isDragging
                                            ? "#dbeafe"
                                            : "white",
                                          borderRadius: "6px",
                                          padding: "6px",
                                          marginBottom: "5px",
                                        }}
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="message-item"
                                      >
                                        {msg}
                                        <button
                                          onClick={() =>
                                            handleDeleteMessage(task.id, i)
                                          }
                                          className="delete-message-btn"
                                          title="Delete Message"
                                          style={{
                                            background: "transparent",
                                            cursor: "pointer",
                                            border: "none",
                                          }}
                                        >
                                          <Trash2 size={16} color="red" />
                                        </button>
                                      </li>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </ul>
                            ) : (
                              <p className="no-messages">No messages yet.</p>
                            )}
                          </div>
                        )}
                      </Droppable>
                    )}
                  </div>
                ))}
              </div>
            </DragDropContext>
          )}
        </div>
      </div>
    </div>
  );
}
