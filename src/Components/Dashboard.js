import axios from "axios";
import { BarChart3, ChevronLeft, Users2,LandPlot,radio, Radio,Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import {useNavigate} from 'react-router-dom';
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";



function Dashboard() {
  
  //const api="https://backend-urlk.onrender.com";
//  const api="http://localhost:3001/dashboard";
    const api=process.env.REACT_APP_API+"/dashboard";

  const [showModal, setShowModal] = useState(false);
  const [city, setCity] = useState("");
  const [station, setStation] = useState("");
  const[label,setLabel]=useState('');
  const[error,setError]=useState({cityErr:"",stationErr:""});
  const[count,setCount]=useState(0);
  const[total,setTotal]=useState(0);
  const[allUsers,setAllUsers]=useState([]);
  const[activeUsers,setActiveUsers]=useState([]);
  const [uniqueActiveUsers, setUniqueActiveUsers] = useState([]);
  const [hover, setHover] = useState(false);
  const[activity,setActivity]=useState(false);
  const[cities,setCities]=useState(false);
  const[allCities,setAllCities]=useState([]);
  const[radio,setRadio]=useState(false);
  const[allStations,setAllStations]=useState([]);
  const navigate=useNavigate();
  const location=useLocation();
  const socket = io(process.env.REACT_APP_API);
  const[scroll,setScroll]=useState({city:false,station:false});


  const images = {
        aplafm: '/Images/aplafm.jpg',
        redfm: '/Images/redfm.png',
        bigfm: '/Images/bigfm.png',
        feverfm: '/Images/feverfm.jpg',
        hellofm: '/Images/hellofm.png',
        myfm: '/Images/myfm.jpg',
        radiocity: '/Images/radiocity.png',
        radiodhamaal: '/Images/radiodhamal.png',
        radiodhoom: '/Images/radiodhoom.avif',
        radiomirchi: '/Images/radiomirchi.webp',
        radioorange: '/Images/radioorange.png',
        radiotomato: '/Images/radiotomato.jpg',
        suriyanfm: '/Images/suriyanfm.png',
        tadkafm: '/Images/tadkafm.jpg',
};

  useEffect(()=>{

      setCount(location.state.count);
      setTotal(location.state.total);
  },[])

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
            const res=await axios.post(`${api}/setNewStation`,{station,city})
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
  catch(err)
  {
          console.log(err);
  }
}

const userActivity=async()=>{
    try{
          //  const res=await axios.get(`${api}/findUsers`);
          //  if(res)
          //  {
          //    console.log(res.data);
             navigate('/userActivity');
          //  }
    }
    catch(err)
    {
       console.log(err)
    }
}
const labelleddata=async()=>{
   try{
          // const res=await axios.get(`${api}/findData`);
          //  if(res)
          //  {
          //    console.log(res.data);
          //    if(res.data)
          //    {
          //      console.log(res.data);
               navigate('/labelleddata')
            
          //    }
          //  }
          // navigate('/labelleddata');
   } 
   catch(err)
   {
     console.log(err);
   }
}


useEffect(() => {
  // 1. Get total users from DB
  axios.get(`${api}/allUsers`).then((res) => setAllUsers(res.data));

  // 2. Listen to socket updates (active users)
  const handleUpdateUsers = (activeUsers) => {
    setActiveUsers(activeUsers);
  };
  socket.on("updateUsers", handleUpdateUsers);

  return () => {
    socket.off("updateUsers", handleUpdateUsers); // ✅ cleanup only the event
  };
}, []);


 const inactiveUsers = allUsers.filter(
  (user) => !activeUsers.some((active) => active.userId === user.username)
);

useEffect(() => {
  const uniqueUsers = Array.from(
    new Map(
      activeUsers
        .filter(u => u && u.userId && u.name)
        .map(u => [u.userId, u])
    ).values()
  );
  setUniqueActiveUsers(uniqueUsers);
}, [activeUsers]);


const handleCities = async () => {
  try {
    // If cities are already fetched, just toggle display
    if (allCities.length > 0) {
      setCities(true);
      setScroll({ city: true, station: false });
      return;
    }

    // Otherwise, fetch from backend
    setCities(true);
    setScroll({ city: false, station: false }); // show loader

    const res = await axios.get(`${api}/getCities`);
    if (res) {
      setAllCities(res.data);
      setScroll({ city: true, station: false }); // hide loader
    }
  } catch (err) {
    console.log(err);
  }
};

const handleStations = async () => {
  try {
    // If stations are already fetched, just show them instantly
    if (allStations.length > 0) {
      setRadio(true);
      setScroll({ city: false, station: true });
      return;
    }

    // Otherwise, fetch new data
    setRadio(true);
    setScroll({ city: false, station: false }); // show loader

    const res = await axios.get(`${api}/getStations`);
    if (res) {
      setAllStations(res.data);
      setScroll({ city: false, station: true }); // hide loader
    }
  } catch (err) {
    console.log(err);
  }
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
      <h1 className="text-2xl font-bold mb-6 text-purple-700">Indi Radio Dashboard</h1>
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  {/* Total Cities */}
  <div className="p-6 bg-white rounded-2xl shadow-md flex items-center gap-4 
                  transition-transform duration-300 ease-in-out 
                  hover:shadow-xl hover:-translate-y-1">
    <div className="bg-purple-100 p-3 rounded-xl"><LandPlot/></div>
    <div>
      <p className="text-sm text-gray-500 font-semibold">TOTAL CITIES</p>
      <h2 className="text-xl font-semibold"  onClick={handleCities}>{count}</h2>
    </div>
  </div>

  {/* Total Stations */}
  <div className="p-6 bg-white rounded-2xl shadow-md flex items-center gap-4 
                  transition-transform duration-300 ease-in-out 
                  hover:shadow-xl hover:-translate-y-1">
    <div className="bg-pink-100 p-3 rounded-xl"><Radio/></div>
    <div>
      <p className="text-sm text-gray-500 font-semibold">TOTAL STATIONS</p>
      <h2 className="text-xl"  onClick={handleStations}>{total}</h2>
    </div>
  </div>

  {/* Users */}
  <div className="p-6 bg-white rounded-2xl shadow-md flex items-center gap-4 relative 
                  transition-transform duration-300 ease-in-out 
                  hover:shadow-xl hover:-translate-y-1">
    <div className="bg-pink-100 p-3 rounded-xl">👥</div>
    <div>
      <p className="text-sm text-gray-500 font-semibold">USERS</p>

      {/* Active Users */}
      <p
        className="font-semibold text-2xl cursor-pointer"
        onClick={() => {setHover(true); setActivity(false)}}
      >
        {uniqueActiveUsers.length} Active
      </p>

      {/* Inactive Users */}
      <p
        className="text-gray-600 cursor-pointer"
        onClick={() => {setActivity(true); setHover(false)}}
      >
        {inactiveUsers.length} InActive
      </p>
    </div>

    {/* Active Hover Block */}
    {hover && (
      <div className="absolute top-0 ml-4 w-56 bg-green-50 shadow-lg rounded-lg border border-green-100 p-3 z-50"
           onMouseLeave={() => setHover(false)}>
        <p className="font-semibold text-green-700 mb-2">
          Active Users ({uniqueActiveUsers.length})
        </p>
        <ul className="space-y-1">
          {uniqueActiveUsers.map((user, idx) => (
            <li key={idx} className="flex items-center space-x-2 text-gray-700 text-sm">
              <span className="h-2 w-2 bg-green-500 rounded-full"></span>
              <span>{user.name}</span>
            </li>
          ))}
        </ul>
      </div>
    )}

    {/* Inactive Hover Block */}
    {activity && (
      <div className="absolute top-20 ml-4 w-84 bg-gray-50 shadow-lg rounded-lg border border-gray-200 p-4 z-50"
           onMouseLeave={() => setActivity(false)}>
        <p className="font-semibold text-gray-700 mb-2">
          Inactive Users ({inactiveUsers.length})
        </p>
        <ul className="space-y-1 max-h-60 overflow-y-auto overflow-x-hidden">
          {inactiveUsers.map((user, idx) => (
            <li key={idx} className="flex items-center space-x-2 text-gray-600 text-sm">
              <span className="h-2 w-2 bg-gray-400 rounded-full"></span>
              <span>{user.fullname}</span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
   
   {cities && (
      <div className="absolute top-15 ml-4 w-56 bg-green-50 shadow-lg rounded-lg border border-green-100 p-3 z-50"
           onMouseLeave={() => setCities(false)}>
        <p className="font-semibold text-green-700 mb-2">
          Cities ({count})
        </p>
        { !scroll.city && (
          <div className="flex items-center justify-center py-10">
                      <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
                      <span className="ml-2 text-gray-600">Getting Cities...</span>
                    </div>
        )}
        <ul className="space-y-1 max-h-60 overflow-y-auto overflow-x-hidden">
          {allCities.map((city, idx) => (
            <li key={idx} className="flex items-center space-x-2 text-gray-700 text-sm">
              <span className="h-2 w-2 bg-green-500 rounded-full"></span>
              <span>{city.city}</span>
            </li>
          ))}
        </ul>
      </div>
    )}

  {radio && (
  <div
    className="absolute top-[240px] ml-[650px] w-64 bg-green-50 shadow-lg rounded-lg border border-green-100 p-3 z-50"
    onMouseLeave={() => setRadio(false)}
  >
    <p className="font-semibold text-green-700 mb-3">
      Stations ({total})
    </p>
    {!scroll.station && (
          <div className="flex items-center justify-center py-10">
                      <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
                      <span className="ml-2 text-gray-600">Getting Stations...</span>
                    </div>
        )}
    <ul className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto overflow-x-hidden">
      {allStations.map((s, idx) => {
        // normalize the name, e.g. "Radio City" → "radiocity"
        const key = s.radio.replace(/\s+/g, "").toLowerCase();
        const imgSrc = images[key];

        return (
          <li key={idx} className="flex flex-col items-center text-gray-700 text-sm">
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={s.radio}
                className="w-12 h-12 object-contain rounded-full border border-gray-200 shadow-sm"
              />
            ) : (
              <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full text-xs text-gray-400">
                N/A
              </div>
            )}
            <span className="mt-1 text-center">{s.radio}</span>
          </li>
        );
      })}
    </ul>
  </div>
)}



  {/* This Week */}
  {/* <div className="p-6 bg-white rounded-2xl shadow-md flex items-center gap-4 
                  transition-transform duration-300 ease-in-out 
                  hover:shadow-xl hover:-translate-y-1">
    <div className="bg-yellow-100 p-3 rounded-xl">📊</div>
    <div>
      <p className="text-sm text-gray-500">This Week</p>
      <h2 className="text-xl font-semibold">156</h2>
    </div>
  </div> */}
</div>


      {/* Middle Section */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> */}
  {/* Calendar */}
  {/* <div className="p-6 bg-white rounded-2xl shadow-md">
    <h3 className="text-lg font-semibold mb-4">Select Date</h3>
    <input
      type="date"
      value={selectedDate}
      onChange={handleDateChange}
      className="w-full border rounded-lg p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
    />
  </div>

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
        <p className="text-sm text-gray-600">Total Tasks</p>
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
</div> */}

      
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
  <div
    className="p-6 bg-white rounded-2xl shadow-md 
               transition-transform duration-300 ease-in-out 
               hover:shadow-xl hover:-translate-y-1"
    onClick={userActivity}
  >
    <div className="flex items-center gap-2 mb-4">
      <Users2 className="text-purple-600" />
      <h3 className="text-lg font-semibold">User Management</h3>
    </div>
    <p className="text-gray-600">
      Manage all user roles, permissions, and access controls for your platform.
    </p>
  </div>

  <div
    className="p-6 bg-white rounded-2xl shadow-md 
               transition-transform duration-300 ease-in-out 
               hover:shadow-xl hover:-translate-y-1"
    onClick={labelleddata}
  >
    <div className="flex items-center gap-2 mb-4">
      <BarChart3 className="text-purple-600" />
      <h3 className="text-lg font-semibold">Reports</h3>
    </div>
    <p className="text-gray-600">
      View and manage hourly audio files with their labels and annotations.
    </p>
  </div>
</div>

   {/* Footer Image */}
      <footer className="mt-12  border rounded-lg">
        <div className="flex flex-col items-center py-20">
          <img
            src="/Images/music-group.gif"
            alt="Listening to Music"
            className="h-42 w-auto"
          />
          <p className="text-center text-gray-500 text-sm mt-4">
            © 2025 Indi Radio Dashboard | Enjoy the Rhythm 🎶
          </p>
        </div>
      </footer>

    </div>
    
  )
}

export default Dashboard;
