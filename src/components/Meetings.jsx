import React, { useEffect, useState } from 'react'
import supabase from '../supabaseClient';

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
 <div style={{
  fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
  maxWidth: "900px",
  margin: "0 auto"
}}>
  <h2 style={{
    fontSize: "24px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "24px",
    textAlign: "center"
  }}>
    All Meetings
  </h2>

  {meetings.length === 0 ? (
    <p style={{
      color: "#6b7280",
      fontSize: "16px",
      textAlign: "center"
    }}>
      No meetings found.
    </p>
  ) : (
    <ul style={{
      listStyle: "none",
      padding: "0",
      margin: "0",
      maxHeight: "80vh", // Set a maximum height for the scrollable area
      overflowY: "auto", // Enable vertical scrolling
      scrollbarWidth: "thin", // For Firefox
      scrollbarColor: "#6b7280 #e5e7eb", // Custom scrollbar color
      WebkitOverflowScrolling: "touch", // Smooth scrolling on touch devices
      "&::-webkit-scrollbar": { // Custom scrollbar for Webkit browsers
        width: "8px"
      },
      "&::-webkit-scrollbar-track": {
        background: "#e5e7eb",
        borderRadius: "4px"
      },
      "&::-webkit-scrollbar-thumb": {
        background: "#6b7280",
        borderRadius: "4px"
      },
      "&::-webkit-scrollbar-thumb:hover": {
        background: "#4b5563"
      }
    }}>
      {meetings.map((m) => (
        <li
          key={m.id}
          style={{
            backgroundColor: "#ffffffff",
            marginBottom: "16px",
            padding: "16px",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            display: "flex",
            alignItems: "flex-start",
            gap: "16px",
            transition: "box-shadow 0.2s ease",
            cursor: "default"
          }}
        >
          <div style={{
            width: "100px",
            height: "100px",
            backgroundColor: "#2563eb",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "8px",
            flexShrink: 0
          }}>
            <span style={{
              fontSize: "30px",
              fontWeight: "600",
              color: "#ffffff"
            }}>
              {FormatDate(m.meeting_date)}
            </span>
          </div>

          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "6px"
          }}>
            <strong style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#1e293b",
              textAlign:'start'
            }}>
              {m.meeting_title}
            </strong>
            <span style={{
              display: "flex",
              alignItems: "center",
              color: "#4b5563",
              fontSize: "14px"
            }}>
              🕒 {formatMeetingTime(m.meeting_time, m.meeting_duration)}
            </span>

             <span style={{
              display: "flex",
              alignItems: "center",
              color: "#4b5563",
              fontSize: "14px"
            }}>
             🔁 Meeting Type: {m.meeting_type}
            </span>
            
            <span style={{
              display: "flex",
              alignItems: "center",
              color: "#4b5563",
              fontSize: "14px"
            }}>
              👥 {m.meeting_attendees?.join(", ") || "No attendees"}
            </span>

            
          </div>

          <div style={{
            flexShrink: 0
          }}>
            <a
              href={m.meeting_link}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-block",
                padding: "15px 18px",
                marginTop:'25px',
                backgroundColor: "#22c55e",
                color: "#ffffff",
                fontWeight: "600",
                fontSize: "14px",
                textDecoration: "none",
                borderRadius: "8px",
                border: "none",
                transition: "background-color 0.2s ease, box-shadow 0.2s ease",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)"
              }}
                          >
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