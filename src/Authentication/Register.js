import React from 'react';

import { User, Lock, UserPlus } from "lucide-react";
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function Register() {

const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [fullname,setFullname]=useState("");
  const [errors, setErrors] = useState({ username: "", password: "", confirm: "" , role: "",fullname:""});
   
  const navigate=useNavigate();
  // const api="https://backend-urlk.onrender.com";
  // const api="http://localhost:3001/auth";
  const api=process.env.REACT_APP_API;

  const validateForm = (e) => {
    e.preventDefault();
    let valid = true;
    const newErrors = { username: "", password: "", confirm: "",  role: "",fullname:""};


    if (!username.endsWith("inditronics@gmail.com")) {
      newErrors.username = "Email must end with inditronics@gmail.com";
      valid = false;
    }
    const passwordRegex =
       /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(password)) {
      newErrors.password =
        "Password must include 1 uppercase, 1 lowercase, 1 number, 1 special character, and be at least 8 characters.";
      valid = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirm = "Passwords do not match";
      valid = false;
    }
    
    if (!role) {
      newErrors.role = "Please select a role.";
      valid = false;
    }
    if(!fullname)
    {
       newErrors.fullname="Please Enter Full Name"
    }

    setErrors(newErrors);
    if (valid) {
      const saveToDb=async()=>{
                const data={
                  fullname:fullname,
                  username:username,
                  password:password,
                  role:role
                }
                console.log(data);
                const res=await axios.post(`${api}/auth/register`,data);
                console.log(res.status);
                if(res.status===200)
                {
                    alert("Registration Successful ✅");
                    //  navigate('/login');
                    
                }
      }
      saveToDb();
    }
  };
  const fechRecords=async()=>{
     try{
         const res=await axios.get(`${api}/auth/findUsers`);
         if(res.data)
         {
           navigate('/userActivity',{state:{data:res.data}})
         }
     }
     catch(err)
     {
      console.log(err);
     }
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-200 overflow-hidden">
      {/* Register Card */}
      <form
        onSubmit={validateForm}
        className="relative z-10 w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-purple-100"
      >
        <div className="flex flex-col items-center mb-6">
          <UserPlus className="w-12 h-12 text-purple-600 mb-3" />
          <h2 className="text-2xl font-bold text-gray-800">Register</h2>
          <p className="text-gray-500 text-sm text-center">
            Create your account to get started
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-600 text-sm font-medium mb-1">
           Full Name (First Name Last Name)
          </label>
          <div className="flex items-center border rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-purple-400">
            <User className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Choose a username"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="w-full outline-none border-none bg-transparent text-gray-700"
            />
          </div>
          {errors.fullname && (
            <p className="text-red-500 text-sm mt-1">{errors.fullname}</p>
          )}
        </div>

        {/* Username */}
        <div className="mb-4">
          <label className="block text-gray-600 text-sm font-medium mb-1">
            Username (Company Email)
          </label>
          <div className="flex items-center border rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-purple-400">
            <User className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full outline-none border-none bg-transparent text-gray-700"
            />
          </div>
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username}</p>
          )}
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block text-gray-600 text-sm font-medium mb-1">
            Password
          </label>
          <div className="flex items-center border rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-purple-400">
            <Lock className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full outline-none border-none bg-transparent text-gray-700"
            />
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="mb-4">
          <label className="block text-gray-600 text-sm font-medium mb-1">
            Confirm Password
          </label>
          <div className="flex items-center border rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-purple-400">
            <Lock className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full outline-none border-none bg-transparent text-gray-700"
            />
          </div>
          {errors.confirm && (
            <p className="text-red-500 text-sm mt-1">{errors.confirm}</p>
          )}
        </div>
         <div className="mb-6">
          <label className="block text-gray-600 text-sm font-medium mb-1">
            Role
          </label>
          <select className="w-full border rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:ring-purple-400 outline-none text-gray-700" value={role}
            onChange={(e) => setRole(e.target.value)}>
            <option value="" disabled>Select your role</option>
            <option>Admin</option>
            <option>Team Lead</option>
            <option value="Member">Annotator</option>
            <option>QA</option>
          </select>
           {errors.role && (
            <p className="text-red-500 text-sm mt-1">{errors.role}</p>
          )}
        </div>

        {/* Register Button */}
        <button className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg shadow-md transition">
          <UserPlus className="w-5 h-5" />
          Register
        </button>

        {/* Links */}
        {/* <p className="text-sm text-gray-600 mt-4 text-center">
          Already have an account?{" "}
          <a href="/login" className="text-purple-600 hover:underline">
            Login here
          </a>
        </p> */}

        <div className="mt-4 flex justify-center">
         <button
          type="button"
          className="bg-white border border-gray-300 px-5 py-2 rounded-lg shadow hover:bg-gray-100 transition"
          onClick={fechRecords}
        >
          Back to Home
        </button>
        </div>
      </form>
    </div>
  )
}

export default Register
