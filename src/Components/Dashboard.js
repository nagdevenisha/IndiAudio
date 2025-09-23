import axios from "axios";
import { BarChart3, ChevronLeft, Users2,LandPlot,radio, Radio } from "lucide-react";
import { useState } from "react";
import {useNavigate} from 'react-router-dom';


function Dashboard() {

 const api="http://localhost:3001";

  const [showModal, setShowModal] = useState(false);
  const [city, setCity] = useState("");
  const [station, setStation] = useState("");
  const[label,setLabel]=useState('');
  const[error,setError]=useState({cityErr:"",stationErr:""});

  const navigate=useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("City:", city, "Station:", station);
    // ✅ You can save it to DB or state here
    // setShowModal(false);
    setCity("");
    setStation("");
  };

 const handleClick = (e) => {
   setLabel(e);
   setShowModal(true);
};

const handleSave=async()=>{
  
  try{
          if(label==="city")
          {
           const res=await axios.post('http://localhost:3001/app/setNewCity',{city});
           console.log(res.data);
           if(res.data==="City Already Present")
           {
             setError({cityErr:"City Already Present"});
           }
           else if(res.data.msg==="City saved")
           {
              alert("City Saved");
           }
           alert(res.data.msg);
          }
          else
          {
            const res=await axios.post('http://localhost:3001/app/setNewStation',{station,city})
            console.log(res.data);
            if(res)
            {
              setShowModal(false);
            }
            if(res.data.msg==="This station already exists for the city")
            {
               setError({stationErr:"This station already exists for the city"});
              //  alert("add city");
            }
          }
  }
  catch(err)
  {
          console.log(err);
  }
}

const userActivity=async()=>{
    try{
           const res=await axios.get(`${api}/app/findUsers`);
           if(res)
           {
             console.log(res.data);
             navigate('/userActivity',{state:{data:res.data}})
           }
    }
    catch(err)
    {
       console.log(err)
    }
}
const labelleddata=async()=>{
   try{
          // const res=await axios.get(`${api}/app/findData`);
          //  if(res)
          //  {
          //    console.log(res.data);
          //    if(res.data)
          //    {
              //  console.log(res.data);
              //  navigate('/labelled',{state:{data:res.data}})
              navigate('/labelled');
          //    }
          //  }
   } 
   catch(err)
   {
     console.log(err);
   }
}


const summaryData = {
  "2025-09-19": {
    clipsUploaded: 10,
    completed: 7,
    pending: 3,
    citiesDone: 4,
    fmStations: 2,
  },
  "2025-09-20": {
    clipsUploaded: 14,
    completed: 9,
    pending: 5,
    citiesDone: 6,
    fmStations: 4,
  },
  "2025-09-21": {
    clipsUploaded: 9,
    completed: 6,
    pending: 3,
    citiesDone: 3,
    fmStations: 2,
  },
  "2025-09-22": {
    clipsUploaded: 16,
    completed: 12,
    pending: 4,
    citiesDone: 7,
    fmStations: 5,
  },
  "2025-09-23": {
    clipsUploaded: 12,
    completed: 8,
    pending: 4,
    citiesDone: 5,
    fmStations: 3,
  },
};
const [selectedDate, setSelectedDate] = useState("2025-09-23"); // today by default

const handleDateChange = (e) => {
  setSelectedDate(e.target.value);
};


  return (
     <div className="min-h-screen bg-white px-6 py-8">
      {/* Header */}
       <button
      onClick={() => window.history.back()}
      className="flex items-center text-purple-600 font-medium hover:text-purple-800 transition mb-4"
    >
      <ChevronLeft className="mr-1 w-5 h-5" />
      Back
    </button>
      <h1 className="text-2xl font-bold mb-6 text-purple-700">Audio Clipping Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Manage your audio clips and collaborate with your team
      </p>
       <div className="flex justify-end mb-2">
        <button
          className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition"
          value="station"
          onClick={(e) => handleClick(e.target.value)}
        >
          + Add Station
        </button>
      </div>
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 bg-white rounded-2xl shadow-md flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-xl"><LandPlot/></div>
          <div>
            <p className="text-sm text-gray-500">Total Cities</p>
            <h2 className="text-xl font-semibold">28</h2>
          </div>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-md flex items-center gap-4">
          <div className="bg-pink-100 p-3 rounded-xl"><Radio/></div>
          <div>
            <p className="text-sm text-gray-500">Total Stations</p>
            <h2 className="text-xl font-semibold">45</h2>
          </div>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-md flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-xl">👥</div>
           <div className="grid grid-cols-2 gap-4 mt-2">
           <div className="space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm text-gray-600">Active Users</span>
              <span className="text-green-600 font-semibold text-lg ml-6">120</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Inactive Users</span>
              <span className="text-red-600 font-semibold text-lg ml-6">12</span>
            </div>
          </div>
        </div>

        </div>
        <div className="p-6 bg-white rounded-2xl shadow-md flex items-center gap-4">
          <div className="bg-yellow-100 p-3 rounded-xl">📊</div>
          <div>
            <p className="text-sm text-gray-500">This Week</p>
            <h2 className="text-xl font-semibold">156</h2>
          </div>
        </div>
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Calendar */}
  <div className="p-6 bg-white rounded-2xl shadow-md">
    <h3 className="text-lg font-semibold mb-4">Select Date</h3>
    <input
      type="date"
      value={selectedDate}
      onChange={handleDateChange}
      className="w-full border rounded-lg p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
    />
  </div>

  {/* Daily Stats */}
  <div className="p-6 bg-white rounded-2xl shadow-md">
    <h3 className="text-lg font-semibold mb-4">
      {new Date(selectedDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })}{" "}
      Executive Summary
    </h3>

    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <div className="p-4 bg-purple-100 rounded-lg text-center">
        <h2 className="text-lg font-bold text-purple-700">
          {summaryData[selectedDate]?.clipsUploaded ?? "-"}
        </h2>
        <p className="text-sm text-gray-600">Clips Uploaded</p>
      </div>
      <div className="p-4 bg-green-100 rounded-lg text-center">
        <h2 className="text-lg font-bold text-green-700">
          {summaryData[selectedDate]?.completed ?? "-"}
        </h2>
        <p className="text-sm text-gray-600">Completed</p>
      </div>
      <div className="p-4 bg-yellow-100 rounded-lg text-center">
        <h2 className="text-lg font-bold text-yellow-700">
          {summaryData[selectedDate]?.pending ?? "-"}
        </h2>
        <p className="text-sm text-gray-600">Pending</p>
      </div>
      <div className="p-4 bg-gray-200 rounded-lg text-center">
        <h2 className="text-lg font-bold text-gray-700">
          {summaryData[selectedDate]?.citiesDone ?? "-"}
        </h2>
        <p className="text-sm text-gray-600">Cities Done</p>
      </div>
      <div className="p-4 bg-pink-100 rounded-lg text-center">
        <h2 className="text-lg font-bold text-pink-700">
          {summaryData[selectedDate]?.fmStations ?? "-"}
        </h2>
        <p className="text-sm text-gray-600">FM Stations</p>
      </div>
    </div>
  </div>
</div>

      
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96 relative">
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ✖
            </button>

            <h2 className="text-xl font-semibold mb-4 text-purple-700">
              Add {label} 
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* City */}
              <div>
                <label className="block text-gray-700">{label.toLocaleUpperCase()}</label>
                <input
                  type="text"
                  value={label==="city"?city:station}
                  onChange={(e) => {label==="city"?setCity(e.target.value):setStation(e.target.value)}}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-purple-500 outline-none"
                />
                {label==="station" &&
                <div>
                 <label className="block text-gray-700">CITY</label>
                 <input
                  type="text"
                  value={city}
                  onChange={(e)=>setCity(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-purple-500 outline-none"
                />
                </div>
                }
                {label==="station" && error.stationErr && <p className="text-red-500">{error.stationErr}</p>}
              </div>
              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
                onClick={handleSave}
              >
                Save
              </button>
            </form>
          </div>
        </div>
      )}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-6 mt-4 cursor-pointer">
      <div className="p-6 bg-white rounded-2xl shadow-md" onClick={userActivity}>
        <div className="flex items-center gap-2 mb-4">
          <Users2 className="text-purple-600" />
          <h3 className="text-lg font-semibold">User Management</h3>
        </div>
        <p className="text-gray-600">
          Manage all user roles, permissions, and access controls for your platform.
        </p>
      </div>

      <div className="p-6 bg-white rounded-2xl shadow-md" onClick={labelleddata}>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-purple-600" />
          <h3 className="text-lg font-semibold">Reports</h3>
        </div>
        <p className="text-gray-600">
          View and manage hourly audio files with their labels and annotations.
        </p>
      </div>
    </div>


    </div>
  )
}

export default Dashboard;
