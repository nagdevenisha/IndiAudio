import React from 'react';
import { Upload, Play, Edit2, ArrowLeft,Crown,X, User,  Music,FileText ,Trash,Trash2} from "lucide-react";
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';
import { io } from "socket.io-client";
import Select from 'react-select';


function LeadSpace() {

 //const api="https://backend-fj48.onrender.com";
  // const api="http://localhost:3001/leadspace";
   const api=process.env.REACT_APP_API+"/leadspace";

const [team,setTeam]=useState(null);
const[instructions,setInstructions]=useState('');
const[memberassign,setMember]=useState('');
const[file,setFile]=useState([]);
const[error,setError]=useState('');
const navigate = useNavigate();
const[open,setOpen]=useState(false);
const location=useLocation();
const [openEdit, setOpenEdit] = useState(false);
const [selectedTask, setSelectedTask] = useState(null);
const [newFiles, setNewFiles] = useState([]);
const[files,setFiles]=useState([]);
const[date,setDate]=useState('');
const [members,setMembers]=useState([]);
const [selectedMembers, setSelectedMembers] = useState([]);
const [showMembers, SetshowMembers] = useState(false);




function timeAgo(dateString) {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past; // difference in milliseconds

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
}
useEffect(()=>{
      setTeam(location.state.team);  
      console.log(location.state.team); 
      console.log(location.state.tasks)
      const formattedTasks = location.state.tasks.map(task => ({
                  file: task.audio,
                  station: task.team.station,
                  assignedTo: task.assignto,
                  time: timeAgo(task.createdAt),
                  instructions: task.instructions,
                }));
                setTasks(formattedTasks);
},[location.state])


  const [tasks, setTasks] = useState([
    {
      file: "",
      station: "",
      assignedTo: "",
      time: "",
      instructions:"",
      createdAt:""
    },
  ]);
const handleFileChange = (e) => {
  console.log(e.target.files);
  const selectedFiles = Array.from(e.target.files); // array of File objects
  setFiles(selectedFiles);
  const fileNames = Array.from(e.target.files).map(file => file.name);
  setFile(fileNames); // store array of file names
  console.log(fileNames);
  
};

  const handleTask = async () => {
  if (!memberassign || !instructions || !files || files.length === 0) {
    setError("*Fill All Fields*");
    return;
  }

  setError('');

  try {
    const formData = new FormData();

    // Append all files
    files.forEach(file => formData.append("audio", file));

    // Append other metadata
    const name = memberassign.split('(')[0].trim();
    formData.append("assignto", name);
    formData.append("instructions", instructions);
    formData.append("leadName", team.leadName);
    formData.append("teamName", team.teamName);
    formData.append("station", team.station);
    formData.append("city", team.city);
    formData.append("date",date);
     console.log(formData);
    const res = await axios.post(`${api}/tasks`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

     console.log(res.data);
    if (res.status === 200) {
      const formattedTasks = res.data.map(task => ({
        file: task.audio,
        station: task.team.station,
        assignedTo: task.assignto,
        time: timeAgo(task.createdAt),
        instructions: task.instructions,
        createdAt: task.createdAt,
      }));
      setTasks(formattedTasks);
    }
  } catch (err) {
    console.log(err);
  }
};

const handleDashboard=async()=>{

         try{
               const res=await axios.get(`${api}/city`);
               const station=await axios.get(`${api}/totalStations`);
               const count=res.data.length;
               navigate("/dashboard",{state:{count:count,total:station.data}});
          }
           catch(err)
        { 
          console.log(err);
        }
}
 const handleMembers=async()=>{
           try{
                const res= await axios.get(`${api}/getmembers`);
                if(res.data)
                {
                    console.log(res.data);

                     const formatted = res.data.map(m => ({
                      value: m.fullname,           // or `${m.fullname}-${m.role}` if you need uniqueness
                      label: `${m.fullname} (${m.role==="Member"?"Annotator":m.role})`, // show both in dropdown
                      role: m.role  ,
                      email:m.username               // keep role separately if you need later
                    }));

                  console.log(formatted);
                  
                  setMembers(formatted);
                }
           }
           catch(err)
           {
              console.log(err);
           }
  }
// Suppose this is your API call
const handleAddMembers = async () => {

  console.log(selectedMembers)
  try {
    const res = await axios.post(`${api}/addMembers`, {
      id: team.id,
      members: selectedMembers, // from react-select
    });

    if (res.status === 200) {
      console.log(res.data); // API response

      // Update team state with new members
      setTeam((prevTeam) => ({
        ...prevTeam, // keep existing team data
        members: [
          ...prevTeam.members,   // existing members
          ...selectedMembers.map((m) => ({
            name: m.value, // or m.value if coming from select
            role: m.role || "Member",
          })),
        ],
      }));

      // Optionally clear selected members
      setSelectedMembers([]);
    }
  } catch (err) {
    console.error("Error adding members:", err);
  }
};

const handleRemoveMember = async (memberId) => {
  try {

     console.log(memberId);
    const res = await axios.delete(`${api}/removeMember`, {
      data: { id: memberId }, 
    });     
    if (res.status === 200) {
      console.log(res.data); // API response
      setTeam((prevTeam) => ({
        ...prevTeam,
        members: prevTeam.members.filter((m) => m.id !== memberId),
      }));
    }
  } catch (err) {
    console.error("Error removing member:", err);
  }
};



  return (
    <div>
     <div className="p-6 space-y-8">
      {/* Back to Teams Button */}
      <button
        onClick={() => navigate("/teams")}
        className="flex items-center gap-2 text-purple-700 font-medium hover:underline"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Teams
      </button>

      {/* Header */}
     {team && <div className="bg-white shadow rounded-xl p-6 border">
  <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2 text-purple-700">
    🎧 {team.station} {team.teamName}
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
    {/* Team Lead */}
    <div>
      <p className="text-black font-semibold mb-1">Team Lead</p>
      <div className="flex items-center">
        <Crown className="text-yellow-500 w-5 h-5 mr-2" />
        <p className="text-gray-700">{team.leadName}</p>
      </div>
    </div>

    {/* Total Members */}
   <div>
  <p className="text-black font-semibold mb-1">Total Members</p>
  <p
    className="font-semibold text-purple-700 text-xl cursor-pointer"
    onClick={() => SetshowMembers(true)}
  >
    {team.members.length}
  </p>

  {showMembers && (
    <div
      className="absolute top-15 ml-2 w-64 bg-white shadow-lg rounded-lg border border-green-100 p-3 z-50"
      onMouseLeave={() => SetshowMembers(false)}
    >
      <p className="font-semibold  mb-2">
        Members ({team.members.length})
      </p>
      <ul className="space-y-1 max-h-60 overflow-y-auto overflow-x-hidden">
        {team?.members?.map((member, idx) => (
          <li
            key={idx}
            className="flex items-center justify-between space-x-2 text-gray-700 text-sm"
          >
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 bg-black rounded-full"></span>
              <span>{member.name}</span>
            </div>

            {/* Trash button */}
            <button
              className="text-red-500 hover:text-red-700"
              onClick={() => handleRemoveMember(member.id)}
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )}
</div>

    {/* Performance Today */}
    {/* <div>
      <p className="font-semibold mb-1">Performance Today</p>
      <p className="flex flex-wrap gap-2">
        <span className="bg-green-400 text-xs px-2 py-1 rounded-full">
          {team.completedtask} Completed
        </span>
        <span className="bg-red-300 text-xs px-2 py-1 rounded-full">
          {team.pendingtask} Pending
        </span>
      </p>
    </div> */}
     <div>
      <p className="text-black font-semibold mb-1">Dashboard</p>
      <button
        className="bg-purple-500 rounded-full w-full sm:w-32 px-2 py-1 text-white"
        onClick={handleDashboard}
      >
      Dashboard
      </button>
    </div>
    {/* Workspace */}
    {/* <div>
      <p className="text-black font-semibold mb-1">Workspace</p>
      <button
        className="bg-purple-500 rounded-full w-full sm:w-32 px-2 py-1 text-white"
        onClick={() => navigate("/workspace")}
      >
        Start Work
      </button>
    </div> */}
   <div>
  <p className="text-black font-semibold mb-1">Add Members</p>
  
  <div className="flex items-center gap-2">
    <Select
      isMulti
      options={members}
      value={selectedMembers}
      onChange={setSelectedMembers} // react-select gives array directly
      className="flex-1 basic-multi-select"
      classNamePrefix="select"
      placeholder="Select Members..."
      onFocus={handleMembers}
    />

    <button className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md transition" onClick={handleAddMembers}>
      Add
    </button>
  </div>
</div>

  </div>
</div>
}
      {/* Assign New Task */}
      <div className="bg-white shadow rounded-xl p-6 border">
        <h3 className="text-lg font-semibold text-purple-700 mb-4">
          ➤ Assign New Task
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
           <input type='text'  value={team?.station || ""} className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"></input>
          <select className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500" onChange={(e)=>setMember(e.target.value)}>
            <option >Assigned to ..</option>
            {team?.members?.map((member)=>
              (
                     <option>{member.name} ({member.role==="Member"?"Annotator":member.role})</option>
              )
            )}
          </select>
           <input
            type="text"
            placeholder="Instructions..."
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
            onChange={(e)=>setInstructions(e.target.value)}
            ></input>
            <input
            type="date"
            placeholder="select date"
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
            onChange={(e)=>setDate(e.target.value)}
            ></input>
          <label className="flex items-center justify-center gap-2 border rounded-lg px-4 py-2 cursor-pointer hover:bg-purple-50">
            <Upload className="w-5 h-5 text-purple-600" />
            <span>{file ? file : "Upload Audio"}</span>
            <input type="file" multiple accept="audio/*" className="hidden" onChange={handleFileChange}/>
          </label>
        </div>
        <button className="mt-6 w-full bg-purple-600 text-white py-3 rounded-lg shadow hover:bg-purple-700 transition" onClick={handleTask}>
          Assign Task
        </button>
        {error && <p className='text-red-700'>{error}</p>}
      </div>

      {/* Pending Clip Assignments */}
      <div className="bg-white shadow rounded-xl p-6 border">
        <h3 className="text-lg font-semibold text-purple-700 mb-4">
          ⏱ Pending Clip Assignments
        </h3>
        {tasks.length>0 &&<div className="space-y-4">
          {tasks.map((task,index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition"
            >
  
              <div className="flex items-center gap-3">
                <Play className="w-6 h-6 text-purple-600" />
                <div>
                  {/* <p className="font-semibold">{task.file}</p> */}
                  <p className="text-sm text-gray-600">
                    Station: {task.station} • Total files:{task.file.length}
                  </p>
                  <p className="text-xs text-gray-500">
                    Assigned to: {task.assignedTo} • {task.time}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg flex items-center gap-1"   onClick={()=>{setOpen(true); setSelectedTask(task);}}>
                  Review
                </button>
                <button className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded-lg" onClick={() => {
                        setSelectedTask(task);
                        setNewFiles([]);
                        setOpenEdit(true);}}>
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>}


        {open && selectedTask &&(
          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[50vh] p-6 relative overflow-y-auto">

              {/* Close Button */}
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
                <button
                  className="absolute top-8 right-12 text-red-500 hover:text-red-700"
                  title="Delete Task"
                >
                  <Trash className="w-5 h-5" />
                </button>
              {/* Title */}
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {selectedTask.station} Task
              </h2>
              <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-purple-600" />
              <span className="font-medium">Instructions</span>
            </div>
            <p className="text-gray-700">{selectedTask.instructions}</p>
            </div>
      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-purple-600" />
          <span className="font-medium">{selectedTask.assignedTo}</span>
        </div>
        <div className="flex  gap-2 col-span-2">
          <Music className="w-7 h-7 text-purple-600" />
          <div className="flex flex-col overflow-y-auto">
            {selectedTask.file?.map((file, idx) => (
              <span key={idx} className="text-gray-600">{file}</span>
            ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
      {openEdit && selectedTask && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
      <button
        onClick={() => setOpenEdit(false)}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
      >
        <X className="w-5 h-5" />
      </button>
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
        Add Audio to {selectedTask.station} Task
      </h2>

      {/* File Upload */}
      <input
        type="file"
        multiple
        accept="audio/*"
        onChange={handleFileChange}
        className="mb-4"
      />

      {/* Show Selected Files */}
      {newFiles.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium">Files Selected:</p>
          {newFiles.map((file, i) => (
            <p key={i} className="text-gray-600 text-sm">{file.name}</p>
          ))}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={() => {
          console.log("Files to upload:", newFiles);
          setOpenEdit(false);
        }}
        className="bg-purple-600 text-white px-4 py-2 rounded"
      >
        Upload Files
      </button>
    </div>
        </div>
      )}
    </div>
    </div>
  )
}

export default LeadSpace
