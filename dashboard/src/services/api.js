const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://absu-girl-project-1.onrender.com/api";
export async function fetchStaffList() {
  const response = await fetch(`${API_URL}/staff`);
  if (!response.ok) throw new Error("Failed to fetch staff");
  return response.json();
}

export async function fetchTodayAttendance() {
  const response = await fetch(`${API_URL}/attendance/today`);
  if (!response.ok) throw new Error("Failed to fetch attendance");
  return response.json();
}

export async function markAttendance(staffId, status, checkIn) {
  const formattedCheckIn =
    checkIn ||
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const response = await fetch(`${API_URL}/attendance`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      staffId,
      status,
      checkIn: formattedCheckIn,
      date: new Date().toISOString().split("T")[0],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export async function createStaff(staffData) {
  const response = await fetch(`${API_URL}/staff`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(staffData),
  });

  if (!response.ok) throw new Error("Failed to create staff");
  return response.json();
}
