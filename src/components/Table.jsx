import React, { useEffect, useState } from 'react'
import supabase from '../supabaseClient';

function Table() {

  const [allTasks, setAllTasks] = useState([])
  const [headers, setHeaders] = useState([])

  async function getAllTasks(){
    const {data, error} = await supabase
    .from('tasks')
    .select('*')

    if(error){
      throw error
    }

    console.log(data);
    
    setAllTasks(data)
    setHeaders(Object.keys(data[0]))

  }

  useEffect(()=> {
    getAllTasks()
  }, [])

  // const rows = allData.slice(1);

  // const whatsappIndex = headers.indexOf('whatsapp')  
  
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
            <th style={tableHeaderStyle}>
              Whatsapp
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Render each data row */}
          {allTasks.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td style={tableCellStyle}> {row.id}</td>
              <td style={tableCellStyle}> {new Date(row.created_at).toISOString().split("T")[0]}</td>
              <td style={tableCellStyle}> {row.name}</td>
              <td style={tableCellStyle}> {row.phone}</td>
              <td style={tableCellStyle}> {row.tasks}</td>
              <td style={tableCellStyle}> {row.task_done}</td>
              <td style={tableCellStyle}> {row.due_date}</td>
              <td style={tableCellStyle}> {row.reminder}</td>
              <td style={tableCellStyle}>📞</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const tableStyle = {
  width: '90%',
  borderCollapse: 'collapse',
  boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.1)',
  margin:'auto',
  marginTop:'50px'
};

const tableHeaderStyle = {
  backgroundColor: '#4CAF50',
  color: 'white',
  padding: '12px 15px',
  textAlign: 'left',
  fontWeight: 'bold',
};

const tableCellStyle = {
  border: '1px solid #ddd',
  padding: '8px',
  textAlign: 'left',
};

export default Table;
