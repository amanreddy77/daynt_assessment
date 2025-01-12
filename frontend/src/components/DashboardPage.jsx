import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "./DataTable";
import { toast } from "react-toastify";

function DashboardPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

  const navigate = useNavigate();

  function decodeToken(token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000; 
  }

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("You must be logged in to access the dashboard");
      navigate("/login");
      return;
    }

    const expiry = decodeToken(token);
    const now = Date.now();
    if (now >= expiry) {
      toast.error("Session expired. Please log in again.");
      localStorage.removeItem("authToken");
      navigate("/login");
      return;
    }

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:3001/api/data", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch data");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [navigate]);

  const handleAddItem = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`, 
        },
        body: JSON.stringify({ name: "New User", dob: "2000-01-01" }), 
      });
  
      if (!response.ok) {
        throw new Error("Failed to add item"); 
      }
  
      const newItem = await response.json();
      setData((prevData) => [...prevData, newItem]);
      toast.success("Item added!");
    } catch (err) {
      setError(err.message || "An error occurred while adding the item"); 
    }
  };
  

  const handleEditItem = (id) => {
    const updatedData = data.map((item) =>
      item.id === id ? { ...item, name: item.name + " (edited)" } : item
    );
    setData(updatedData);
    toast.success("Item edited!");
  };

  const handleDeleteItem = (id) => {
    const updatedData = data.filter((item) => item.id !== id);
    setData(updatedData);
    toast.success("Item deleted!");
  };

  if (loading) return <div className="text-center p-4 text-lg">Loading...</div>;
  if (error) return <div className="text-center p-4 text-lg text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Dashboard</h2>
        <p className="text-gray-600 mb-6">Welcome to your dashboard. Here you can manage your data.</p>
        <button
          onClick={handleAddItem}
          className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Add Item
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <DataTable data={data} onEdit={handleEditItem} onDelete={handleDeleteItem} />
      </div>
    </div>
  );
}

export default DashboardPage;
