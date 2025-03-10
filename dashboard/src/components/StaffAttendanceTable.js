"use client";
import { useState } from "react";
import { staffData } from "@/data/staffData";
import { QRModal } from "./QRModal";

export function StaffAttendanceTable() {
  const [selectedStaff, setSelectedStaff] = useState(null);

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Check In
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white text-base">
            {staffData.map((person) => (
              <tr
                key={person.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedStaff(person)}
              >
                <td className="px-6 py-5 whitespace-nowrap font-medium text-gray-900">
                  {person.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  {person.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs rounded-full font-medium
                    ${
                      person.status === "Present"
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {person.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  {person.checkIn}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <QRModal
        isOpen={!!selectedStaff}
        onClose={() => setSelectedStaff(null)}
        staff={selectedStaff}
      />
    </>
  );
}
