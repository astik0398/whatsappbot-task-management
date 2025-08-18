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
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>
        All Meetings
      </h2>

      {meetings.length === 0 ? (
        <p style={{ color: "#777" }}>No meetings found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {meetings.map((m) => (
            <li
              key={m.id}
              style={{
                background: "#e7e5e5ff",
                marginBottom: "15px",
                padding: "15px",
                borderRadius: "8px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              <strong style={{ fontSize: "18px", color: "#2c3e50" }}>
                {m.title}
              </strong>
              <br />
              <span style={{ display: "block", margin: "5px 0", color: "#555" }}>
                📅 {m.meeting_date} &nbsp; 🕒 {m.meeting_time}
              </span>
              <a
                href={m.meeting_link}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "#007bff",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                🔗 Join Meeting
              </a>
              <br />
              <span style={{ display: "block", marginTop: "8px", color: "#444" }}>
                👥 {m.meeting_attendees?.join(", ")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Meetings