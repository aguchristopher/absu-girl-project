export function AddStaffModal({ isOpen, onClose, onAdd }) {
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const staffData = {
      staffId: formData.get("staffId"),
      name: formData.get("name"),
      department: formData.get("department"),
      position: formData.get("position"),
      email: formData.get("email"),
      phoneNumber: formData.get("phoneNumber"),
    };

    try {
      await onAdd(staffData);
      onClose();
    } catch (error) {
      console.error("Failed to add staff:", error);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add New Staff</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-base font-medium text-gray-900 mb-2">
              Staff ID
            </label>
            <input
              type="text"
              name="staffId"
              required
              className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-base font-medium text-gray-900 mb-2">
              Name
            </label>
            <input
              type="text"
              name="name"
              required
              className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">
                Department
              </label>
              <input
                type="text"
                name="department"
                required
                className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">
                Position
              </label>
              <input
                type="text"
                name="position"
                required
                className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-base font-medium text-gray-900 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-base font-medium text-gray-900 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              required
              className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-base font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Add Staff
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
