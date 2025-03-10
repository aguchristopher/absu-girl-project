import QRCode, { QRCodeCanvas } from "qrcode.react";

export function QRModal({ isOpen, onClose, staff }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50 transition-all">
      <div className="bg-white/90 backdrop-blur rounded-xl p-6 max-w-sm w-full shadow-xl transform transition-all">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-600">
              {staff.name}
            </h3>
            <p className="text-sm text-gray-600">{staff.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="flex justify-center mb-4">
          <QRCodeCanvas
            value={JSON.stringify({
              id: staff.id,
              name: staff.name,
              email: staff.email,
              department: staff.department,
              position: staff.position,
              phoneNumber: staff.phoneNumber,
            })}
            size={200}
          />
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <p>Department: {staff.department}</p>
          <p>Position: {staff.position}</p>
          <p>Email: {staff.email}</p>
          <p>Phone: {staff.phoneNumber}</p>
        </div>
      </div>
    </div>
  );
}
