import { StaffAttendanceHeader } from "@/components/StaffAttendanceHeader";
import { StaffAttendanceTable } from "@/components/StaffAttendanceTable";
import { AttendanceSummaryCards } from "@/components/AttendanceSummaryCards";

export default function Dashboard() {
  return (
    <main className="min-h-screen w-full bg-white p-6 md:p-10">
      <div className="mx-auto max-w-8xl space-y-8">
        <StaffAttendanceHeader />
        <AttendanceSummaryCards />
        <StaffAttendanceTable />
      </div>
    </main>
  );
}
