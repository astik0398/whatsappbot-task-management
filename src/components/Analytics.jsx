import React, { useEffect, useState } from 'react'
import supabase from '../supabaseClient';
import { toast, ToastContainer } from 'react-toastify';
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
        const [isDarkMode, setIsDarkMode] = useState(false);
      
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
          .from("grouped_tasks")
          .select(
            "name, phone, tasks"
          )
          .eq("userId", userId)
          .order("id", { ascending: true });
    
        if (error) {
          throw error;
        }
    
        console.log('inside analytics page data',data);
    
        if (!data || data.length === 0) {
          toast.error("No data to display...");
          return;
        }
    
        setAllTasks(data);
        setTotalEmployee(data.length)

        data.forEach((item)=> {
          item.tasks.map(it=> it.task_done === "Pending" && count++)
        })

data.forEach((item)=> {
          item.tasks.map(it=> it.task_done === "Not Completed" && notCompleted++)
        })
  
        data.forEach((item, ind)=> {

          item.tasks.map(it=> it.task_details !== "" && tasks++)
          
        })

        data.forEach((item)=> {
          item.tasks.map(it=> it.task_done === "Completed" && completed++)
        })

        setOverdueTasks(notCompleted)
        setPendingTasks(count)
        setCompletedTasks(completed)
        setTotalTasks(tasks)
      }

      const completionPercentage = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

    const progressColor =
  completionPercentage >= 75 ? '#28a745' : completionPercentage >= 50 ? '#ffc107' : '#dc3545';

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
    <div className="dashboard-container">
      <div className="card-grid">
        <div className={`card ${isDarkMode ? 'dark' : ''}`}>
          <h3>Total Employees</h3>
          <p>{totalEmployee}</p>
        </div>
        <div className={`card ${isDarkMode ? 'dark' : ''}`}>
          <h3>Total Tasks</h3>
          <p>{totalTasks}</p>
        </div>
        <div className={`card ${isDarkMode ? 'dark' : ''} completed`}>
          <h3>Completed Tasks</h3>
          <p>{completedTasks}</p>
        </div>
        <div className={`card ${isDarkMode ? 'dark' : ''} pending`}>
          <h3>Pending Tasks</h3>
          <p>{pendingTasks}</p>
        </div>
        <div className={`card ${isDarkMode ? 'dark' : ''} overdue`}>
          <h3>Overdue Tasks</h3>
          <p>{overdueTasks}</p>
        </div>

        <div className={`card ${isDarkMode ? 'dark' : ''} progress-bar`}>
          <CircularProgressBar percentage={completionPercentage} taskCount={totalTasks} color={progressColor}/>
          </div>
      </div>
      <ToastContainer/>
    </div>
  )
}

export default Analytics