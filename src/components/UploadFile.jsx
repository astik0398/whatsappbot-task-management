import React, { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import Table from './Table'
import supabase from '../supabaseClient'

function UploadFile() {

  const [allData, setAllData] = useState([])

  function handleFileUpload(e){
    const file = e.target.files[0]

    if(!file){
      return
    }
    
    const reader = new FileReader()

    console.log('reader', reader);

    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    }

    reader.onload = (e)=> {
      const arrayBuffer = e.target.result
      console.log('arraybuffer', arrayBuffer);

      const workbook = XLSX.read(arrayBuffer, {type: 'array'})
      console.log('workbook', workbook);

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const headers = jsonData[0];

      const formattedData = jsonData.slice(1).map(row => {
        let obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || ''; // if there's no value, set it as an empty string
        });
        return obj;
      });
      
      console.log(formattedData);

      setAllData(formattedData)

      setTimeout(() => addTask(formattedData), 500);

    }

    reader.readAsArrayBuffer(file)
  }

  // useEffect(()=> {
  //   if(allData.length> 0){
  //     addTask(allData)
  //   }
  // }, [allData])

  async function addTask(dataArray) {
    if (!dataArray || dataArray.length === 0) {
      console.error("No data to insert!");
      return;
    }
  
    const { data, error } = await supabase
      .from('tasks')
      .insert(dataArray); // Pass the entire array for bulk insertion
  
    if (error) {
      console.error('Error inserting tasks:', error);
      throw error;
    }
  
    console.log('Inserted tasks:', data);
  }
  

  return (
    <>
    <div style={containerStyle}>
        <label htmlFor="file-upload" style={labelStyle}>
          Choose a file
          <input onChange={handleFileUpload} accept='.csv, .xls, .xlsx' type="file" id="file-upload" name="file" style={inputStyle} />
        </label>
    </div>
    </>
  )
}

// Inline styles box-shadow:
const containerStyle = {
  boxShadow: 'rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px',
  height: '250px',
  margin: 'auto',
  marginTop: '200px',
  width: '35%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column', // Centering the button vertically and horizontally
  textAlign: 'center',
};

const labelStyle = {
  backgroundColor: '#00ff55',
  color: 'white',
  padding: '10px 20px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '16px',
  display: 'inline-block',
  boxShadow:'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px'
};

const inputStyle = {
  display: 'none', // Hide the default file input
};

export default UploadFile;
