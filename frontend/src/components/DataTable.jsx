function DataTable({ data, onEdit, onDelete }) {
    const calculateAge = (dob) => {
      const birthDate = new Date(dob);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      return age;
    };
  
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg border border-gray-200">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Age</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Date of Birth</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-100">
                <td className="px-6 py-4 text-sm text-gray-800">{item.name}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{calculateAge(item.dob)}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{item.dob}</td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => onEdit(item.id)} 
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(item.id)} 
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  
  export default DataTable;
  