export function StaffAttendanceHeader() {
  return (
    <div className="flex flex-col gap-2 mb-10">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
        Staff Attendance Dashboard
      </h1>
      <p className="text-lg text-gray-600">
        {new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
    </div>
  );
}
