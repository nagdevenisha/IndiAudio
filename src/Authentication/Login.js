import React, { useState } from "react";
import { LogIn, User, Lock, Music, Waves, Headphones } from "lucide-react";
import axios from "axios";
import { data, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";



export default function Login() {


    // const api="https://backend-fj48.onrender.com";
  const api="http://localhost:3001";

    const[username,setUsername]=useState('');
    const[password,setPassword]=useState('');
    const[field,setField]=useState('');
    const[validate,setValidate]=useState('');
    const navigate=useNavigate();

    const handleLogin=async()=>{
  
      if(username && password)
      {
      try {
        const res = await axios.post(`${api}/app/login`, {
          username,
          password
        }, {
          headers: { "Content-Type": "application/json" }
        });
        if(res.status===200)
        {
           localStorage.setItem("token", res.data.token);
            const decoded = jwtDecode(res.data.token);
            console.log(decoded.role);
           alert("✅ Login Successful");
           if (decoded.role === "Admin") {
          navigate("/dashboard");
        } else if (decoded.role === "Team Lead") {
          localStorage.setItem("data",username);
          navigate("/teams");
        } else if (decoded.role === "Member") { 
          try{
               const getdata=async()=>{
                  const res=await axios.get(`${api}/app/alltasks`);
                  const response=await axios.get(`${api}/app/getAnotTask`);
                  console.log(res.data);
                  console.log("task",response.data)
                  if(res.data && response.data)
                  {    
                      navigate("/taskbar",{state:{data:res.data,task:response.data}});
                  }
               }
               getdata();
          }
          catch(err)
          {
             console.log(err)
          }
        }

      }
      } catch (err) {
        console.error("❌ Login failed:", err.response?.data || err.message);
        setField('Invalid Credentials');
        setUsername('');setPassword('');setValidate('');
      }
    }
    else
    {
        setValidate('Enter Required Fields');
        setField('');
    }
        }

  return (
     <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-200 overflow-hidden">
      
      {/* Background Animated Icons */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Top Left */}
        <Headphones className="absolute top-10 left-10 w-16 h-16 text-purple-300 animate-pulse" />
        <Music className="absolute top-32 left-1/5 w-10 h-10 text-purple-200  animate-bounce" />
        <Waves className="absolute top-20 left-1/3 w-14 h-14 text-purple-300  animate-spin-slow" />

        {/* Bottom Left */}
        <Music className="absolute bottom-16 left-20 w-12 h-12 text-purple-200  animate-bounce" />
        <Waves className="absolute bottom-32 left-1/4 w-16 h-16 text-purple-300 animate-float" />

        {/* Top Right */}
        <Headphones className="absolute top-24 right-16 w-14 h-14 text-purple-200  animate-pulse" />
        <Music className="absolute top-40 right-32 w-12 h-12 text-purple-300  animate-bounce" />
        <Waves className="absolute top-10 right-1/3 w-16 h-16 text-purple-200  animate-spin-slow" />

        {/* Bottom Right */}
        <Music className="absolute bottom-20 right-10 w-12 h-12 text-purple-300  animate-float" />
        <Headphones className="absolute bottom-32 right-28 w-14 h-14 text-purple-200  animate-pulse" />
        <Waves className="absolute bottom-10 right-1/4 w-20 h-20 text-purple-300 0 animate-spin-slow" />

        {/* Center Floating */}
        <Music className="absolute top-1/3 left-1/4 w-16 h-16 text-purple-200 animate-float" />
         {/* Sound Ripples */}
        <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2">
          <div className="w-32 h-32 rounded-full border-2 border-primary/20 animate-ping" />
          <div className="absolute inset-4 w-24 h-24 rounded-full border border-primary/30 animate-ping" style={{ animationDelay: '0.5s' }} />
          <div className="absolute inset-8 w-16 h-16 rounded-full border border-primary/40 animate-ping" style={{ animationDelay: '1s' }} />
        </div>

        <div className="absolute bottom-1/3 right-1/4">
          <div className="w-24 h-24 rounded-full border-2 border-primary/25 animate-ping" style={{ animationDelay: '1.5s' }} />
          <div className="absolute inset-3 w-18 h-18 rounded-full border border-primary/35 animate-ping" style={{ animationDelay: '2s' }} />
        </div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-purple-100">
        <div className="flex flex-col items-center mb-6">
          <Headphones className="w-12 h-12 text-purple-600 mb-3" />
          <h2 className="text-2xl font-bold text-gray-800">Audio Studio Login</h2>
          <p className="text-gray-500 text-sm text-center">
            Access your professional audio management dashboard
          </p>
        </div>

        {/* Username */}
         {field &&<p className="text-red-500">{field}</p>}
         {validate && <p className="text-red-500">{validate}</p>}
        <div className="mb-4">
          <label className="block text-gray-600 text-sm font-medium mb-1">
            Username
          </label>
          <div className="flex items-center border rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-purple-400">
            <User className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              value={username}
              placeholder="Enter your username"
              className="w-full outline-none border-none bg-transparent text-gray-700"
              onChange={(e)=>setUsername(e.target.value)}
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-gray-600 text-sm font-medium mb-1">
            Password
          </label>
          <div className="flex items-center border rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-purple-400">
            <Lock className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="password"
              value={password}
              placeholder="Enter your password"
              className="w-full outline-none border-none bg-transparent text-gray-700"
              onChange={(e)=>setPassword(e.target.value)}
            />
          </div>
        </div>

        {/* Login Button */}
        <button onClick={handleLogin} className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg shadow-md transition">
          <LogIn className="w-5 h-5" />
          Access Studio
        </button>

        {/* Links */}
        <div className="mt-6 flex justify-between text-sm text-gray-600">
          {/* <Link to="/register" className="hover:text-purple-600 font-medium">
            Create Your Studio Account
          </Link> */}
          <a href="/" className="hover:text-purple-600">
            Back to Home
          </a>
        </div>
      </div>

      {/* Custom Animations */}
      <style>
        {`
          @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 25s linear infinite;
          }

          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
            100% { transform: translateY(0px); }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
}
