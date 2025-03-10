export function AttendanceSummaryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <SummaryCard
        title="Total Staff"
        value={24}
        valueClassName="text-blue-600"
      />
      <SummaryCard
        title="Present Today"
        value={18}
        valueClassName="text-green-600"
      />
      <SummaryCard
        title="Absent Today"
        value={6}
        valueClassName="text-red-600"
      />
    </div>
  );
}

function SummaryCard({ title, value, valueClassName = "" }) {
  return (
    <div className="p-8 rounded-xl border border-gray-200 bg-white shadow-sm">
      <p className="text-base font-medium text-gray-600">{title}</p>
      <p className={`text-4xl font-bold mt-3 ${valueClassName}`}>{value}</p>
    </div>
  );
}
