const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://absu-girl-project-1.onrender.com/api";
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
  const response = await fetch(`${API_URL}/attendance`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      staffId,
      status,
      checkIn,
    }),
  });
  if (!response.ok) throw new Error("Failed to mark attendance");
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
