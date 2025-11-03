import React,{useEffect, useState,useRef} from 'react';
import { ChevronLeft,MapPin ,Radio,Upload,Loader2,X} from "lucide-react";
import Timeline from './Timeline';
import axios from 'axios';
import { motion, AnimatePresence } from "framer-motion";
import AudioWaveform from './WaveSurfer';
import { useLocation } from 'react-router-dom';



export default function Workspace() {
    const [file, setFile] = useState([]);
    const [count, setCount] = useState(0);
     const [recordings, setRecordings] = useState("");
    const [loading, setLoading] = useState(false);
    const[audio,setAudio]=useState("");   
    const[loader,setLoader]=useState({"loader1":false,"loader2":false});       
    const[station,setStation]=useState("");
    const[city,setCity]=useState("");
    const[date,setDate]=useState("");
    const[error,setError]=useState({recordError:"",fpError:"",labelError:""});
    const[load,setLoad]=useState(false);
    const[givenBy,setGivenby]=useState('');
    const[task,setTask]=useState({});
    const [showForm, setShowForm] = useState(false);
    const[users,setUsers]=useState([]);
    const [assignee, setAssignee] = useState("");
    const [fromHour, setFromHour] = useState("");
    const [toHour, setToHour] = useState("");
    const counterRef = useRef(parseInt(localStorage.getItem("annotatorCounter") || "100"));
    const[check,setCheck]=useState(false);
    const[id,setId]=useState('');
    const [activeButton, setActiveButton] = useState('');

 
   const [modalOpen, setModalOpen] = useState(false);

  const location=useLocation();
//  const api="https://backend-urlk.onrender.com";
  //  const api="http://localhost:3001/timeline";
   const api=process.env.REACT_APP_API+"/timeline";

 
  
 useEffect(()=>{
     setGivenby(location.state.by);
     setId(location.state.id);
     setTask(location.state.task);
     console.log(location.state.task);
     setDate(location.state.task.audioDate);
     const station=location.state.task.team.station.toLowerCase().replace(/\s+/g, '-');
     setStation(station);
     setCity(location.state.task.team.city);
 },[])
  const handleUploads = async (e) => {

    if(!city || !date || !station)
    {
       setError({labelError:"Please select date/city/station"});
       return;
    }
    setError({labelError:""});
     if (file.length===0) 
    {
      setError({recordError:"Please select files"});
      return;
    }
    setLoading(true);
    console.log(file)
    const formData = new FormData();
    file.forEach((fil) => {
    formData.append("files", fil); 
    formData.append("city",city);
    formData.append("date",date);
    formData.append("station",station);
  });
    formData.append("type", "recording");

    try {
      const res = await axios.post(`${api}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if(res.data) setLoading(false);
      console.log(res.data);
      setAudio(res.data.mergedFile);
      setRecordings(res.data); // add uploaded file info
      setFile([]);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

   
  const intervals = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      intervals.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  
  const[data,setData]=useState([]);
  const handleMatching=async()=>{
               
            try{
                  //  const res=await axios.post("http://localhost:3001/audiomatching");
                  //  console.log(res.data);
                  // if(file.length>=0)
                  // {
                  //    setError({recordError:"Please select files"});
                  //    return;
                  // }
                  
                  const res=await axios.get(`${api}/getlabel`,{
                    params:{
                      city:city,
                      station:station,
                      date:date
                    }
                  });
                  if(res.data)
                  {
                       console.log(res.data)
                        setData(res.data);
                        setLoad(true);
                        setModalOpen(true);
                  }
                   const response=await axios.get(`${api}/getUsers`);
                   if(response)
                   {
                      console.log(response.data);
                      const users=response.data.map((u)=>u.fullname);
                      setUsers(users);
                   }
          
               }
            catch(err)
            {
                 console.log(err);
                 
            }
  }
  const handleclips=async()=>{
    try{
            setLoader({loader2:true});
            console.log(recordings);

            const res=await axios.post(`${api}/minuteclip`,{audio:recordings.record.filePath,city:city,date:date,station:station});
            console.log(res.data);
            if(res.status)
            {
               setLoader({loader2:false});
            }
          }
    catch(err)
    {
       console.log(err)
    }
  }
function generateAnnotatorId() {
  counterRef.current++;
    localStorage.setItem("annotatorCounter", counterRef.current);
  return `A-${counterRef.current}`;
}
  const handleSubmit=async()=>{

       try{  
             const task={
                 id:generateAnnotatorId(),
                 city:city,
                 audioDate:date,
                 station:station,
                 startHour:fromHour,
                 endHour:toHour,
                 givenTo:assignee,
                 givenBy:givenBy,
                 audio:recordings.record.filePath,
                 starts:recordings.startTime

             }
             console.log(task);
             const res=await axios.post(`${api}/annotator`,{task});
             if(res)
             {
                setModalOpen(false);
             }
       }
       catch(err)
       {
         console.log(err);
       }
  }


  const submitAll=async()=>{
     try{
           const res=await axios.get(`${api}/submitTask`,{params:{id:id}});
           if(res.status===200)
           {
             console.log(res.data);
             setCheck(false);
           }
     }
     catch(err)
     {
       console.log(err);
     }

  }

  const handleClick = async(buttonName) => {
    setActiveButton(buttonName);
    if(buttonName==="ads")
    {
         const res=await axios.get(`${api}/getSongfp`,{params:{name:"ads"}});
    }
    if(buttonName==="songs")
    {
        const res=await axios.get(`${api}/getSongfp`,{params:{name:"ads"}});
    }
  };

  return (
   <div className="min-h-screen bg-white px-6 py-8">
     <button
      onClick={() => window.history.back()}
      className="flex items-center text-purple-600 font-medium hover:text-purple-800 transition mb-4"
    >
      <ChevronLeft className="mr-1 w-5 h-5" />
      Back to Teams
    </button>

    {/* Heading */}
   <div className="text-left mb-6">
  <h1 className="text-3xl font-bold text-purple-700 mb-1">
    Quality Review Workspace
  </h1>
  <p className="text-gray-600">
    Radio City Quality Team - Review auto-labeled segments from fingerprint matching system
  </p>
</div>
    <div className="bg-gradient-to-br from-purple-50 to-white px-6 py-8">
  {/* Transparent Wrapper */}
  <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-6">
    
    {/* Back Button */}


    {/* Filters Section */}
    {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex items-center mb-4">
          <MapPin className="w-5 h-5 text-purple-600 mr-2" />
          <h2 className="text-lg font-semibold">Select City</h2>
        </div>
        <label className="block text-sm text-gray-700 mb-2">
          Choose city
        </label>
        <select className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"onChange={(e)=>setCity(e.target.value)}>
          <option value="">Select city...</option>
          <option value="mumbai">Mumbai</option>
          <option value="delhi">Delhi</option>
          <option value="bangalore">Bangalore</option>
          <option value="pune">Pune</option>
          <option value="karnal">Karnal</option>
        </select>
      </div>

     
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex items-center mb-4">
          <Calendar className="w-5 h-5 text-purple-600 mr-2" />
          <h2 className="text-lg font-semibold">Select Date</h2>
        </div>
        <label className="block text-sm text-gray-700 mb-2">
          Choose date to review
        </label>
        <input
          type="date"
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          onChange={(e)=>setDate(e.target.value)}
        />
      </div> */}
    <div className="border rounded-lg p-6 shadow-sm bg-white w-full max-w-8xl">
  {/* Header */}
      <div className="flex items-center mb-6">
        <MapPin className="w-5 h-5 text-purple-600 mr-2" />
        <h2 className="text-lg font-semibold">Session Details</h2>
      </div>

  {/* Session Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-4 items-center">
          <div>
            <p className="text-lg text-gray-500">City</p>
            <p className="font-medium text-gray-800 text-lg" >{task?.team?.city}</p>
          </div>

          <div>
            <p className="text-lg text-gray-500">Station</p>
            <p className="font-medium text-gray-800 text-lg">{task?.team?.station}</p>
          </div>

          <div>
            <p className="text-lg text-gray-500">Date</p>
            <p className="font-medium text-gray-800 text-lg">{task?.audioDate}</p>
          </div>

        </div>


     
      {/* <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex items-center mb-4">
          <Clock className="w-5 h-5 text-purple-600 mr-2" />
          <h2 className="text-lg font-semibold">Select Radio Station</h2>
        </div>
        <label className="block text-sm text-gray-700 mb-2">
          Choose station
        </label>
        <select className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500" onChange={(e)=>setStation(e.target.value)}>
          <option value="">Select Radio Station</option>
          <option value="radio-city">Radio City</option>
          <option value="red-fm">Red Fm</option>
          <option value="radio-mirchi">Radio Mirchi</option>
          <option value="radio-tadka">Radio Tadka</option>
        </select>
      </div> */}
    </div>

    {/* Upload Section */}
    <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-8">
      {/* Master Fingerprints */}
      {/* <div className="bg-white rounded-xl border shadow-sm p-6"> */}
        {/* <div className="flex items-center mb-4">
          <Radio className="w-5 h-5 text-purple-600 mr-2" />
          <h2 className="text-lg font-semibold">Master Fingerprints</h2>
        </div> */}
        {error.fpError && <p className='text-red-500'>*{error.fpError}</p>}
        {/* <input
        type="file"
        multiple accept="audio/*"
        onChange={handleFileChange}
        className="mb-3"
      /> */}
       {/* {loader.loader1 &&  <div className="flex items-center justify-center py-10">
            <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
            <span className="ml-2 text-gray-600">Loading segment...</span>
          </div>} */}
        {/* <button onClick={handleUpload} className="flex items-center justify-center w-full border border-gray-300 rounded-md p-3 hover:bg-gray-50 transition">
          <Upload className="w-4 h-4 mr-2" /> Add Master Fingerprint
        </button> */}
       {/* <div className="gap-12 mt-14 flex justify-center">
      <button
        className="w-64 px-8 h-[50px]  bg-purple-500 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        onClick={() => handleClick("ads")}
        disabled={activeButton === "songs"}
      >
        Add Advertisements
      </button>

      <button
        className="w-64 px-8 h-[50px] bg-purple-500 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        onClick={() => handleClick("songs")}
        disabled={activeButton === "ads"}
      >
        Add Songs
      </button>
    </div> */}
        {/* <p className="text-sm text-gray-500 mt-2">{count}{" "}fingerprints uploaded</p> */}
      {/* </div> */}

      {/* Recordings */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex items-center mb-4">
          <Upload className="w-5 h-5 text-purple-600 mr-2" />
          <h2 className="text-lg font-semibold">Recordings</h2>
        </div>
        <input
         type="file"
          webkitdirectory="true"
          directory=""
          multiple
          onChange={(e) => setFile(Array.from(e.target.files))}
         className="mb-3"
      />
      {loading &&  <div className="flex items-center justify-center py-10">
            <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
            <span className="ml-2 text-gray-600">Loading segment...</span>
          </div>}
        <button onClick={handleUploads} className="flex items-center justify-center w-full border border-gray-300 rounded-md p-3 hover:bg-gray-50 transition">
          <Upload className="w-4 h-4 mr-2" /> Add Recording
        </button>
          {error.recordError && <p className='text-red-500'>*{error.recordError}</p>}
        {/* <p className="text-sm text-gray-500 mt-2">{recordings.length} recordings uploaded</p> */}
        {recordings && <p className='font-semibold'>do you want to create 5 min clip? <span><button className='border border-gray-300 rounded-md p-2 hover:bg-gray-50 transition bg-green-200 mt-2' onClick={handleclips}>Yes</button></span><button className='ml-4 border border-gray-300 rounded-md p-2 hover:bg-gray-50 transition bg-red-200'>No</button>{loader.loader2 && <Loader2 className="animate-spin text-blue-500 w-8 h-8" />}</p>}
      </div>
    </div>
    {error.labelError && <p className='text-red-500'>{error.labelError}</p>}
    <div className='flex justify-center'>
         <button className="px-8 py-2 bg-purple-500 text-white rounded mt-8 " onClick={handleMatching}>
    Audio Matching
  </button>
    </div>

</div>
</div>

{load &&
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      
      <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">Audio Review Details</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-purple-100 text-purple-800 p-4 rounded-xl text-center">
            <p className="text-sm font-medium">Date</p>
            <p className="text-xl font-bold">{date}</p>
          </div>
          <div className="bg-green-100 text-green-800 p-4 rounded-xl text-center">
            <p className="text-sm font-medium">Station</p>
            <p className="text-xl font-bold">{station.toUpperCase()}, {city.toUpperCase()}</p>
          </div>
          <div className="bg-teal-100 text-teal-800 p-4 rounded-xl text-center">
            <p className="text-sm font-medium">Fingerprint Uploaded</p>
            <p className="text-xl font-bold">{count}</p>
          </div>
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded-xl text-center">
            <p className="text-sm font-medium">Total Segments</p>
            <p className="text-xl font-bold">2</p>
          </div>
        </div>
      </div>

      {/* Automatic Labeling */}
     {load && <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
  <h3 className="font-semibold mb-3">Automatic Labeling Results</h3>
  
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
      ✅ Fingerprint Matching
    </div>
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-2 rounded-lg">
      📍 Timeline Mapping
    </div>
    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg">
      📄 JSON Records
    </div>
  </div>
</div>}
        
      {/* {recordings && load &&(
      <AudioWaveform
        audio={audio} 
        start={recordings.startTime} 
        // end={recordings.endTime} 
      />
    )} */}

   {recordings && load && (
  <>
    {console.log(recordings.startTime)}
    <Timeline audio={audio} starts={recordings.startTime} data={data} date={date} city={city} station={station} />
  </>
)}
    {/* <SegmentList/> */}
    <div className="flex justify-end">
  <button className="px-8 py-2 bg-purple-500 text-white rounded mt-8" onClick={()=>setCheck(true)}>
    Submit Changes
  </button>
  </div>
      </div>}


    <AnimatePresence>
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-semibold mb-4">Do You Want To Assign Task?</h2>
            
            {!showForm ? (
              <div className="flex justify-end gap-4">
                <button
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                  onClick={() => setShowForm(true)}
                >
                  Yes
                </button>
                <button
                  className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400"
                  onClick={()=>setModalOpen(false)}
                >
                  No
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Assign To */}
                 <button
                  onClick={() => {setModalOpen(false);setShowForm(false)}}
                  className="absolute top-5 right-3 text-gray-500 hover:text-gray-700"
                >
                  <X size={25} />
                </button>
                <label><strong>Start Hour:</strong>{recordings.startTime}</label>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Assign To
                  </label>
                  <select
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="">Select user</option>
                    {users.map((u, idx) => (
                      <option key={idx} value={u.value}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      From Hour
                    </label>
                    <input
                      type="number"
                      min={parseInt(recordings.startTime?.split(":")[0] || "0", 10)} 
                      max="23"
                      value={fromHour}
                      onChange={(e) => setFromHour(e.target.value)}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      To Hour
                    </label>
                    <input
                      type="number"
                       max="24"
                       min={parseInt(recordings.startTime?.split(":")[0] || "0", 10)+1}
                      value={toHour}
                      onChange={(e) => setToHour(e.target.value)}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Submit
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
{
    check && 
    <div>
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={()=>setCheck(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <p className="text-lg text-gray-500 mb-4">
         Do you confirm that all annotations and metadata for this hour are correct and complete?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 border rounded-md bg-green-500 hover:bg-green-700"
            onClick={submitAll}
          >
            Yes
          </button>
          <button
            onClick={()=>setCheck(false)}
            className="px-4 py-2 bg-red-500 hover:bg-red-700 text-white rounded-md"
          >
            No
          </button>
        </div>
      </div>
    </div>
      </div>
  }
</div>
  )
}