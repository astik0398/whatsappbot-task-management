import React, { useEffect, useState } from 'react'
import supabase from '../supabaseClient';
import { toast } from 'react-toastify';
import '../styles/Analytics.css'
import CircularProgressBar from './CircularProgressBar';

function Analytics({data}) {
      const [userId, setUserId] = useState(null);
      const [totalEmployee, setTotalEmployee] = useState(null)
      const [pendingTasks, setPendingTasks] = useState(null)
      const [completedTasks, setCompletedTasks] = useState(null)
      const [overdueTasks, setOverdueTasks] = useState(null)
      const [tasks, setAllTasks] = useState([])
      const [totalTasks, setTotalTasks] = useState(null)

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

        let count = 0
        let completed = 0
        let notCompleted = 0
        let tasks = 0

        console.log(typeof userId);
    
        const { data, error } = await supabase
          .from("tasks")
          .select(
            "name, phone, tasks, task_done, due_date, reminder, id, reminder_frequency, reason"
          )
          .eq("userId", userId)
          .order("id", { ascending: true });
    
        if (error) {
          throw error;
        }
    
        console.log(data);
    
        if (!data || data.length === 0) {
          toast.error("No data to display...");
          return;
        }
    
        setAllTasks(data);
        setTotalEmployee(data.length)

        data.forEach(item=> item.task_done === 'Pending' && count++)
        data.forEach(item=> item.task_done ==='Completed' && completed++)
        data.forEach(item=> item.task_done === "Not Completed" && notCompleted++)
        data.forEach(item=> item.tasks !== "" && tasks++)

        setOverdueTasks(notCompleted)
        setPendingTasks(count)
        setCompletedTasks(completed)
        setTotalTasks(tasks)
      }

  return (
    <div className="dashboard-container">
      <div className="card-grid">
        <div className="card">
          <h3>Total Employees</h3>
          <p>{totalEmployee}</p>
        </div>
        <div className="card">
          <h3>Total Tasks</h3>
          <p>{totalTasks}</p>
        </div>
        <div className="card completed">
          <h3>Completed Tasks</h3>
          <p>{completedTasks}</p>
        </div>
        <div className="card pending">
          <h3>Pending Tasks</h3>
          <p>{pendingTasks}</p>
        </div>
        <div className="card overdue">
          <h3>Overdue Tasks</h3>
          <p>{overdueTasks}</p>
        </div>

        <div className="card progress-bar">
          <CircularProgressBar percentage={60} taskCount={18} />
          </div>
      </div>
    </div>
  )
}

export default Analytics