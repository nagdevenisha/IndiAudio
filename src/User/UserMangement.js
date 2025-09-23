import {  useState } from "react";
import { MoreVertical, Users, ArrowLeft, Plus, Edit, Trash } from "lucide-react";
import { useNavigate,useLocation } from "react-router-dom";
import axios from 'axios';

const UserManagement = () => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const[role,setRole]=useState('');
  const[username,setUsername]=useState('');
  const[modal,setModal]=useState(false);
  const[name,setName]=useState('');
  const[deleteuser,setdeleteUser]=useState(false);
  const navigate=useNavigate();
  const location=useLocation();
  const usersPerPage = 8; // show 10 users per page
  


 const api="http://localhost:3001";

  const toggleMenu = (idx) => {
    setOpen(open === idx ? null : idx);
  };


 const [users, setUsers] = useState(location.state.data.users || []);

  // Filter users based on search
  const filteredUsers = users.filter(
    (user) =>
      user.fullname.toLowerCase().includes(search.toLowerCase()) ||
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.role.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  
  const handleEdit=(username,role,name)=>{
       setModal(true);
       setOpen(false)
       setRole(role);
       setUsername(username);
       setName(name);
  }
  const handleDelete=async()=>{
      try{
           const res=await axios.get(`${api}/app/deleteUser`,{
              params:{username:username}
           });
           if(res.status===200)
           {
              console.log("user deleted");
              setdeleteUser(false);
              setUsers((prev) => prev.filter((u) => u.username !== username));
           }
      }
      catch(err)
      {
         console.log(err);
      }
  }

  const updateUser=async()=>{
      try{
             const res=await axios.post(`${api}/app/updateUser`,{username,role});
             if(res.status===200)
           {
               console.log(res.data);
               setUsers((prev) =>
                prev.map((u) =>
                u.username === username ? { ...u, role: res.data.role } : u
                )
            );

              setModal(false);
           }
      }
      catch(err)
      {
         console.log(err);
      }
  }

  return (
    <div className="p-6">
      {/* Back to Dashboard */}
      <button
        className="flex items-center text-purple-600 hover:underline mb-4"
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
      </button>

      {/* Page Title */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-purple-600">User Management</h1>
          <p className="text-gray-600">Manage all user roles and permissions</p>
        </div>
      </div>

      {/* Search Box */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h2 className="font-semibold text-lg mb-4">Search Users</h2>
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // reset to first page on search
            }}
          />
          {/* <select className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="" disabled selected>
              All Roles
            </option>
            <option>Admin</option>
            <option>Team Lead</option>
            <option>Annotator</option>
          </select> */}
          <button className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md shadow" onClick={()=>navigate('/register')}>
            <Plus className="w-4 h-4 mr-2" /> Add New User
          </button>
        </div>
      </div>

      {/* User List */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="flex items-center text-lg font-semibold mb-4">
          <Users className="w-5 h-5 mr-2 text-purple-600" /> All Users ({filteredUsers.length})
        </h2>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              {/* <th className="p-3">Status</th> */}
              <th className="p-3">Created At</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="p-3 font-semibold">{user.fullname}</td>
                <td className="p-3 text-gray-600">{user.username}</td>
                <td className="p-3">
                  <span className={`px-3 py-1 rounded-full text-sm ${user.role==="Admin"?"bg-red-500 text-white": user.role === "Team Lead" ? "bg-purple-500 text-white": user.role==="QA"?"bg-green-500 text-white"  : "bg-gray-200 text-gray-700"}`}>
                    {user.role==="Member"?"Annotator":user.role}
                  </span>
                </td>
                <td className="p-3 text-gray-600"> {new Date(user.createdAt).toLocaleDateString("en-GB")}</td>
                <td className="p-3 text-right relative">
                  <button className="p-2 hover:bg-gray-200 rounded-full">
                    <MoreVertical
                      className="w-5 h-5 text-gray-600"
                      onClick={() => toggleMenu(idx)}
                    />
                  </button>
                  {open === idx && (
                    <div className="absolute right-5 mt-2 w-40 bg-white border rounded-md shadow-lg z-10">
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={()=>handleEdit(user.username,user.role,user.fullname)}
                      >
                        <Edit className="w-4 h-4 mr-2"/> Edit User
                      </button>
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        onClick={() =>{setdeleteUser(true);setOpen(false);setUsername(user.username)}}
                      >
                        <Trash className="w-4 h-4 mr-2" /> Delete User
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
    {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
            <button
                className={`px-4 py-2 rounded-md border ${
                currentPage === 1 ? "text-gray-400 border-gray-300" : "text-purple-600 border-purple-600"
                }`}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
            >
                Previous
            </button>

            <div className="flex space-x-2">
                {(() => {
                const pageNumbers = [];
                const maxVisible = 1; // number of pages before & after current
                const totalVisible = maxVisible * 2 + 1;

                if (totalPages <= totalVisible + 2) {
                    // If few pages, show all
                    for (let i = 1; i <= totalPages; i++) {
                    pageNumbers.push(i);
                    }
                } else {
                    // Always include first page
                    pageNumbers.push(1);

                    if (currentPage > maxVisible + 2) {
                    pageNumbers.push("...");
                    }

                    for (
                    let i = Math.max(2, currentPage - maxVisible);
                    i <= Math.min(totalPages - 1, currentPage + maxVisible);
                    i++
                    ) {
                    pageNumbers.push(i);
                    }

                    if (currentPage < totalPages - (maxVisible + 1)) {
                    pageNumbers.push("...");
                    }

                    // Always include last page
                    pageNumbers.push(totalPages);
                }

                return pageNumbers.map((page, idx) =>
                    page === "..." ? (
                    <span key={idx} className="px-3 py-1 text-gray-500">
                        ...
                    </span>
                    ) : (
                    <button
                        key={idx}
                        className={`px-3 py-1 rounded-md border ${
                        currentPage === page
                            ? "bg-purple-600 text-white border-purple-600"
                            : "text-gray-600 border-gray-300"
                        }`}
                        onClick={() => setCurrentPage(page)}
                    >
                        {page}
                    </button>
                    )
                );
                })()}
            </div>

            <button
                className={`px-4 py-2 rounded-md border ${
                currentPage === totalPages
                    ? "text-gray-400 border-gray-300"
                    : "text-purple-600 border-purple-600"
                }`}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
            >
                Next
            </button>
            </div>
      </div>

     {modal &&
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        {/* Close Button */}
        <button
          onClick={()=>setModal(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Edit User</h2>
        <p className="text-sm text-gray-500 mb-4">
          Update the user's role. You can only modify these
          fields.
        </p>
        {/* User Info */}
        <div className="mb-4">
          <div className="bg-gray-100 p-3 rounded-md text-sm text-gray-700">
            <p>
              <strong>Name:</strong> {name}
            </p>
            <p>
              <strong>Email:</strong> {username}
            </p>
          </div>
        </div>
        {/* Role */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            value={role==="Member"?"Annotator":role}
            onChange={(e) => setRole(e.target.value==="Annotator"?"Member":e.target.value)}
            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            <option>Admin</option>
            <option>Team Lead</option>
            <option>Annotator</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={()=>setModal(false)}
            className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            // onClick={() => onUpdate({ ...user, role, recorderId })}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-700 text-white rounded-md"
            onClick={updateUser}
          >
            Update User
          </button>
        </div>
      </div>
    </div>}

    {deleteuser &&
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={()=>setdeleteUser(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <p className="text-lg text-gray-500 mb-4">
          Are You sure you want to delete the user?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 border rounded-md text-green-600 hover:bg-green-100"
            onClick={handleDelete}
          >
            Yes
          </button>
          <button
            onClick={()=>setdeleteUser(false)}
            className="px-4 py-2 bg-red-500 hover:bg-red-700 text-white rounded-md"
          >
            No
          </button>
        </div>
      </div>
    </div>
    }
    </div>
  );
};

export default UserManagement;
