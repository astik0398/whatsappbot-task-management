import React, { useEffect, useState } from 'react'
import supabase from '../supabaseClient';
import '../styles/Meetings.css';

function Meetings() {

    const [userNumber, setUserNumber] = useState("");
  const [meetings, setMeetings] = useState([]); // ✅ state to hold meetings

  useEffect(() => {
    const number = localStorage.getItem("employer_number");
    if (!number) return;

    const formattedNumber = `whatsapp:+${number}`;
    console.log("Fetching meetings for:", formattedNumber);

    setUserNumber(formattedNumber);

    fetchMeetings(formattedNumber);
  }, []);

  function FormatDate( dateString ) {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);

    // Extract day
    const day = date.getDate();

    // Add suffix (st, nd, rd, th)
    const getDaySuffix = (d) => {
      if (d > 3 && d < 21) return "th"; // 4-20 are always 'th'
      switch (d % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
      }
    };

    // Get short month name
    const month = date.toLocaleString("en-US", { month: "short" });

    return `${day}${getDaySuffix(day)} ${month}`;
  };

  return <span>{formatDate(dateString)}</span>;
}

function formatMeetingTime(meeting_time, meeting_duration) {
  // Parse start time
  const [time, modifier] = meeting_time.split(" "); // ["10:00", "PM"]
  let [hours, minutes] = time.split(":").map(Number);

  // Convert to 24-hour format
  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);

  // Add duration (in minutes)
  const endDate = new Date(startDate.getTime() + meeting_duration * 60000);

  // Format back to 12-hour time
  const formatOptions = { hour: "2-digit", minute: "2-digit", hour12: true };
  const startStr = startDate.toLocaleTimeString([], formatOptions);
  const endStr = endDate.toLocaleTimeString([], formatOptions);

  return `${startStr} - ${endStr}`;
}

 async function fetchMeetings(userNumber) {
  const { data, error } = await supabase
    .from("allMeetings")
    .select("*")
    .eq("user_number", userNumber)   // ✅ filter by WhatsApp number
    .order("meeting_date", { ascending: true }) // sort upcoming first

  if (error) {
    console.error("Error fetching meetings:", error);
    return ;
  }

  console.log("✅ Meetings fetched:", data);
    setMeetings(data); // ✅ update state
}

  return (
  <div className="meetings-container">
      <h2 className="meetings-title">All Meetings</h2>

      {meetings.length === 0 ? (
        <p className="meetings-empty">No meetings found.</p>
      ) : (
        <ul className="meetings-list">
          {meetings.map((m) => (
            <li key={m.id} className="meeting-item">
              <div className="meeting-date">
                <span>{FormatDate(m.meeting_date)}</span>
              </div>

              <div className="meeting-details">
                <strong className="meeting-title">{m.meeting_title}</strong>
                <span className="meeting-info">
                  🕒 {formatMeetingTime(m.meeting_time, m.meeting_duration)}
                </span>
                <span className="meeting-info">
                  🔁 Meeting Type: {m.meeting_type}
                </span>
                <span className="meeting-info">
                  👥 {m.meeting_attendees?.join(", ") || "No attendees"}
                </span>
              </div>

              <div className="meeting-link">
                <a href={m.meeting_link} target="_blank" rel="noreferrer">
                  Join Meeting
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Meetings