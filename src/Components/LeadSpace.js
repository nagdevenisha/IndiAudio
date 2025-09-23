import React from 'react';
import { Upload, Play, Edit2, ArrowLeft,Crown,X, User,  Music,FileText ,Trash} from "lucide-react";
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';


function LeadSpace() {

 //const api="https://backend-fj48.onrender.com";
   const api="http://localhost:3001";

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
    formData.append("assignto", memberassign);
    formData.append("instructions", instructions);
    formData.append("leadName", team.leadName);
    formData.append("teamName", team.teamName);
    formData.append("station", team.station);
    formData.append("city", team.city);
     console.log(formData);
    const res = await axios.post(`${api}/app/tasks`, formData, {
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
        <h2 className="text-xl font-semibold flex items-center gap-2 text-purple-700">
          🎧 {team.station}{" "}{team.teamName}{/*Radio City Quality Team*/}
        </h2>
        <div className="grid grid-cols-4 gap-6 mt-4">
          <div>
            <p className="text-500 font-semibold mb-1">Team Lead</p>
            <div className="flex items-center">
                <Crown className="text-yellow-500 w-5 h-5 mr-2" />
                <p className="text-700">{team.leadName}</p>
            </div>
            </div>
          <div>
            <p className="text-500 font-semibold">Total Members</p>
            <p className="font-semibold text-purple-700 text-xl">{team.members.length}</p>
          </div>
          <div>
            <p className=" font-semibold">Performance Today</p>
            <p>
              <span className="bg-green-400 text-xs px-2 py-1 rounded-full">
                       {team.completedtask }{" "}Completed
                      </span>{" "}
              |<span className="ml-2 bg-red-300 text-xs px-2 py-1 rounded-full">
                        {team.pendingtask }{" "}Pending
                      </span>
            </p>
          </div>
           <div>
            <p className="text-500 font-semibold">Workspace</p>
            <button className=' bg-purple-500 rounded-full w-30 px-2 py-1 '  onClick={() => ((team.teamName==="Quality Team"?navigate("/workspace"):navigate('/labelling')))}>Start Work</button>
          </div>
        </div>
      </div>}
      {/* Assign New Task */}
      <div className="bg-white shadow rounded-xl p-6 border">
        <h3 className="text-lg font-semibold text-purple-700 mb-4">
          ➤ Assign New Task
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <Play className="w-12 h-12 text-purple-600" />
                <div>
                  <p className="font-semibold">{task.file}</p>
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
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">

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
        <div className="flex items-center gap-2 col-span-2">
          <Music className="w-7 h-7 text-purple-600" />
          <div className="flex flex-col">
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
