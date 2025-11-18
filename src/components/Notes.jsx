import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Trash2, CircleX, Link  } from "lucide-react";
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


  // 🔥 Handle drag and drop between tasks (for messages)
  const handleDragEnd = async (result) => {
    const { source, destination, type } = result;


    if (!destination) return;


    // Handle assignee drag and drop
    if (type === "assignee") {
      return handleAssigneeDragEnd(result);
    }


    // Handle message drag and drop
    // Prevent dropping into same list
    if (source.droppableId === destination.droppableId) return;


    const sourceTaskIndex = tasks.findIndex(
      (task) => task.id.toString() === source.droppableId.replace("task-messages-", "")
    );
    const destTaskIndex = tasks.findIndex(
      (task) => task.id.toString() === destination.droppableId.replace("task-messages-", "")
    );


    if (sourceTaskIndex === -1 || destTaskIndex === -1) return;


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


  // 🔥 NEW: Handle assignee drag and drop between tasks
  const handleAssigneeDragEnd = async (result) => {
    const { source, destination } = result;


    if (!destination) return;


    // Prevent dropping assignee in the same task
    const sourceTaskId = parseInt(source.droppableId.replace("task-assignees-", ""));
    const destTaskId = parseInt(destination.droppableId.replace("task-assignees-", ""));


    if (sourceTaskId === destTaskId) return;


    const sourceTaskIndex = tasks.findIndex((task) => task.id === sourceTaskId);
    const destTaskIndex = tasks.findIndex((task) => task.id === destTaskId);


    if (sourceTaskIndex === -1 || destTaskIndex === -1) return;


    const sourceTask = tasks[sourceTaskIndex];
    const destTask = tasks[destTaskIndex];


    const draggedAssignee = sourceTask.assignee?.[source.index];


    if (!draggedAssignee) return;


    // Remove assignee from source task
    const updatedSourceAssignees = sourceTask.assignee.filter(
      (_, i) => i !== source.index
    );


    // Add assignee to destination task (at the specified index)
    const updatedDestAssignees = Array.from(destTask.assignee || []);
    updatedDestAssignees.splice(destination.index, 0, draggedAssignee);


    // Update local state first for smooth UI
    const updatedTasks = tasks.map((task, i) => {
      if (i === sourceTaskIndex)
        return { ...task, assignee: updatedSourceAssignees };
      if (i === destTaskIndex)
        return { ...task, assignee: updatedDestAssignees };
      return task;
    });
    setTasks(updatedTasks);


    // Sync with Supabase
    try {
      const { error: srcError } = await supabase
        .from("group_notes")
        .update({ assignee: updatedSourceAssignees })
        .eq("id", sourceTask.id);


      const { error: destError } = await supabase
        .from("group_notes")
        .update({ assignee: updatedDestAssignees })
        .eq("id", destTask.id);


      if (srcError || destError) {
        console.error("Error updating Supabase after assignee drag:", srcError || destError);
      }
    } catch (err) {
      console.error("Unexpected error updating assignees after drag:", err);
    }
  };


  const handleDeleteAssignee = async (taskId, assigneeName) => {
    try {
      const taskToUpdate = tasks.find((t) => t.id === taskId);
      if (!taskToUpdate) return;


      const updatedAssignees = (taskToUpdate.assignee || []).filter(
        (a) => a !== assigneeName
      );


      const { error } = await supabase
        .from("group_notes")
        .update({ assignee: updatedAssignees })
        .eq("id", taskId);


      if (error) {
        console.error("Error deleting assignee:", error);
        return;
      }


      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, assignee: updatedAssignees } : task
      );
      setTasks(updatedTasks);


      console.log(`Assignee "${assigneeName}" deleted successfully from task ${taskId}`);
    } catch (err) {
      console.error("Unexpected error deleting assignee:", err);
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
                          <Droppable
                            droppableId={`task-assignees-${task.id}`}
                            type="assignee"
                            direction="horizontal"
                          >
                            {(provided, snapshot) => (
                              <span
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                style={{
                                  gap: "5px",
                                  minHeight: "24px",
                                  padding: "2px 4px",
                                  borderRadius: "4px",
                                  backgroundColor: snapshot.isDraggingOver
                                    ? "rgba(59, 130, 246, 0.1)"
                                    : "transparent"                                }}
                              >
                                {Array.isArray(task.assignee) &&
                                task.assignee.length > 0 ? (
                                  task.assignee.map((name, idx) => (
                                    <Draggable
                                      key={`assignee-${task.id}-${idx}`}
                                      draggableId={`assignee-${task.id}-${idx}`}
                                      index={idx}
                                    >
                                      {(provided, snapshot) => (
                                        <span
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className="assignee-pill"
                                          style={{
                                            ...provided.draggableProps.style,
                                            opacity: snapshot.isDragging ? 0.5 : 1,
                                                                                padding:'4px 6px'

                                          }}
                                        >
                                          {name.toUpperCase()}

                                          <button
                                            onClick={() =>
                                              handleDeleteAssignee(task.id, name)
                                            }
                                            className="delete-assignee-btn"
                                            title="Remove Assignee"
                                            style={{
                                              background: "transparent",
                                              border: "none",
                                              cursor: "pointer",
                                              marginLeft: "5px",
                                              verticalAlign: "middle",
                                            }}
                                          >
                                            <CircleX size={14} color="red" />
                                          </button>
                                        </span>
                                      )}
                                    </Draggable>
                                  ))
                                ) : (
                                  <span className="task-assignee-name">
                                    Unassigned
                                  </span>
                                )}
                                {provided.placeholder}
                              </span>
                            )}
                          </Droppable>
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
                      <Droppable
                        droppableId={`task-messages-${task.id}`}
                        type="message"
                      >
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

                                         <div style={{display:'flex', justifyContent:'space-between'}}>
                                          <div style={{  display:'flex', alignItems:'center', gap:'30px'}}>
                                           <div>{msg.split("\n")[0]}</div>

                                            {/* Attachment Section */}
  {msg.split("\n")[1] && (
    <div>
      <a style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:'4px'}} href={msg.split("\n")[1]} target="_blank" rel="noopener noreferrer">
      <Link width={'12px'}/>  Attachment
      </a>
    </div>
  )}
                                         </div>

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
                                         </div>
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
