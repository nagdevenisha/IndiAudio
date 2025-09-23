import  { useState,useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, MapPin,Users, Crown,ArrowUp } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Select from 'react-select';
import { useRef } from "react";
import axios from "axios";

function Teams() {

  //  const api="https://backend-fj48.onrender.com";
   const api="http://localhost:3001";


  const [selectedCity, setSelectedCity] = useState("");
  const[cities,setCities]=useState([]);
  const[stations,setStations]=useState([]);
  const [teams, setTeams] = useState([]);
  const[hide,setHide]=useState(false);
  const[members,setMembers]=useState([]);
  const[username,setUsername]=useState('');
  const [errors, setErrors] = useState({ fields: ""});
  const[tasks,setTasks]=useState([]);
  const[selectedMembers, setSelectedMembers] = useState([]);
  const [newTeam, setNewTeam] = useState({
    teamName: "",
    teamLead: "",
    radioStation: "",
    city: "",
    members:[]
  });
  const teamTypes = ["Quality Team", "Labelling Team"];
  const users=localStorage.getItem('data');
  const navigate=useNavigate();
  const handleCities=async()=>{
  try{
      const res=await axios.get(`${api}/app/city`);
      const response=await axios.get(`${api}/app/login`,{
         params:{username:users}
      });
      const { user } = response.data;
      console.log(user.fullname);
      setUsername(user.fullname);
      if(res.status===200)
     {
       console.log(res.data);
       const city=res.data.map(item=>item.city);
       setCities(city);
       }
     }
    catch(err)
    {
     console.log(err);
    }
  }

  const handleTeams=async(city)=>{
  try{
    console.log(city);
      const res=await axios.get(`${api}/app/station`,{
      params:{city}
     });
     const response=await axios.get(`${api}/app/teamspercity`,{
      params:{city}
     })
     console.log(response.data);
     if(response.data) setTeams(response.data);
     if(res.status===200)
     {
        console.log(res.data);
        setStations(res.data);
     }
    }
   catch(err)
   {
      console.log(err);
   } 

  }
   const handleCreateTeam = async() => {

     console.log(selectedMembers);
     const newErrors = { fields: ""};
    if (!newTeam.teamName  || !newTeam.radioStation || selectedMembers.length===0) {
      // alert("Please fill all fields!");
      newErrors.fields="Please fill all fields!";
      setErrors(newErrors);
      return;
    }
     newErrors.fields="";
      setErrors(newErrors);
      
      console.log(selectedCity);
        const payload = {
        teamName: newTeam.teamName,
        leadName: username,
        station: newTeam.radioStation,
        city: selectedCity,
        members: selectedMembers, // extract names only
      };
     try {
      const res = await axios.post(`${api}/app/saveteam`,payload);
    alert('Team Created');
    console.log(res.data);
    setTeams([...teams, res.data.team]);
    setNewTeam({ teamName: "", teamLead: "", radioStation: "", city: "", members: [] });
  } catch (err) {
    console.error("Error creating team:", err);
  }
  };
  const handleMembers=async()=>{
           try{
                const res= await axios.get(`${api}/app/getmembers`);
                if(res.data)
                {
                    console.log(res.data);

                     const formatted = res.data.map(m => ({
                      value: m.fullname,           // or `${m.fullname}-${m.role}` if you need uniqueness
                      label: `${m.fullname} (${m.role==="Member"?"Annotator":m.role})`, // show both in dropdown
                      role: m.role                 // keep role separately if you need later
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
   const scrollRefs = useRef({});

  // Mouse dragging state
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e, station) => {
    isDragging.current = true;
    startX.current = e.pageX - scrollRefs.current[station].offsetLeft;
    scrollLeft.current = scrollRefs.current[station].scrollLeft;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e, station) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRefs.current[station].offsetLeft;
    const walk = (x - startX.current) * 1.5; // scroll speed multiplier
    scrollRefs.current[station].scrollLeft = scrollLeft.current - walk;
  }

  
const fetchtasks=async(team)=>{
         console.log(team);
         const res=await axios.post(`${api}/app/getTasks`, {
                  leadName: team.leadName,
                  teamName: team.teamName,
                  station: team.station,
                  city: team.city,
                });;
         setTasks(res.data);
         navigate("/leadspace",{state:{team:team,tasks:res.data}});
      }
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      {/* Back Button */}
      <button
        onClick={() => window.history.back()}
        className="flex items-center text-purple-600 font-medium hover:text-purple-800 transition"
      >
        <ChevronLeft className="mr-1 w-5 h-5" />
        Back to Workstation
      </button>

      {/* Title */}
      <h1 className="text-3xl font-bold text-purple-700 mt-4">
        Team Collaboration
      </h1>
      <p className="text-gray-600 mt-2">
        Manage teams, assign clips, and track progress
      </p>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white shadow-md rounded-2xl p-6 mt-8 border border-gray-200"
      >
        <div className="flex items-center mb-4">
          <MapPin className="text-purple-600 w-6 h-6 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">Select City</h2>
        </div>

        {/* Dropdown */}
        <label className="block text-gray-600 mb-2 font-medium">
          Choose City to View Teams
        </label>
        <select
          value={selectedCity} 
          // onChange={(e) => setSelectedCity(e.target.value)}
           onFocus={handleCities} 
            onChange={(e) => {
              const city = e.target.value;
              setSelectedCity(city);
              if (city) handleTeams(city); 
            }}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-700"
        >
          <option value="">Select city...</option>
          {cities.map((city, idx) => (
            <option key={idx} value={city}>
              {city}
            </option>
          ))}
        </select>

        {/* Dynamic Content */}
        {selectedCity && (
          <div className="mt-6 bg-purple-50 border border-purple-200 rounded-xl p-4">
            <h3 className="text-purple-700 font-semibold">
              Teams in {selectedCity}
            </h3>
            <p className="text-gray-600 mt-2">
              Display team members, assign clips, and track progress here.
            </p>
          </div>
        )}
      </motion.div>

      {selectedCity &&<motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white shadow-md rounded-2xl p-6 mt-8 border border-gray-200"
      >
      <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold text-purple-700">
        + Create New Team
      </h2>
      <ArrowUp className="w-6 h-6 text-purple-700 cursor-pointer" onClick={()=>setHide(!hide)} />
    </div>


       {hide && 
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[300px]">
          {/* Team Name */}
          <div>
            <label className="block text-gray-700 mb-1">Team Name</label>
            <select
              value={newTeam.teamName}
              onChange={(e) =>
                setNewTeam({ ...newTeam, teamName: e.target.value })
              }
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
            >
              <option value="" disabled>Select team type...</option>
              {teamTypes.map((t, i) => (
                <option key={i} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Team Lead */}
          <div>
            <label className="block text-gray-700 mb-1">Team Lead</label>
            <input
              type="text"
              value={username}
              placeholder="Enter Team Lead"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
              readOnly
            />
          </div>

          {/* Radio Station */}
          <div>
            <label className="block text-gray-700 mb-1">Radio Station</label>
            <select
              value={newTeam.radioStation}
              onChange={(e) =>
                setNewTeam({ ...newTeam, radioStation: e.target.value })
              }
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select station...</option>
              {stations.map((s, i) => (
                <option key={i} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={selectedCity}
              placeholder="Enter Team Lead"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
              readOnly
            />
            
          </div>
          <div className="col-span-2">
      <label className="block text-gray-700 mb-1">Members</label>
          <Select
            isMulti
            options={members}
            value={selectedMembers}
            onChange={setSelectedMembers} // react-select gives array directly
            className="basic-multi-select"
            classNamePrefix="select"
            placeholder="Select Members..."
            onFocus={handleMembers}
          />
        </div>
           {errors.fields &&<p className="text-red-500">{errors.fields}</p>}
       <div className="flex justify-end">
      <button
        onClick={handleCreateTeam}
        className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transition"
      >
    Create Team
  </button>
</div>
        </div>}
      </motion.div>}

      {stations.length>0 && stations.map((station, idx) => {
        const stationTeams = teams.filter((t) => t.station === station);
        if (stationTeams.length === 0) return null;

        return (
          <div key={idx} className="mt-10">
            <h2 className="text-2xl font-semibold text-purple-700 mb-4">
              {station}
            </h2>
            <div
              ref={(el) => (scrollRefs.current[station] = el)}
              className="overflow-x-auto cursor-grab scroll-smooth active:cursor-grabbing"
              onMouseDown={(e) => handleMouseDown(e, station)}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={(e) => handleMouseMove(e, station)}
            >
              <div className="flex gap-6 min-w-full py-2">
                {stationTeams.map((team, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="min-w-[700px] bg-white rounded-2xl shadow p-6 border border-gray-200"
                    onDoubleClick={()=>fetchtasks(team)}
                  >
                    {/* Team Card Content */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Users className="text-purple-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-800">
                          {team.teamName}
                        </h3>
                      </div>
                      <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                        {team.members?.length} members
                      </span>
                    </div>

                    <div className="flex items-center mt-3">
                      <Crown className="text-yellow-500 mr-2" />
                      <p className="text-gray-700 font-medium">
                        {team.leadName}
                        <span className="ml-2 bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                          Team Lead
                        </span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-purple-50 rounded-lg p-3 text-center">
                        <p className="text-xl font-bold text-purple-700">
                          {team.pendingtask}
                        </p>
                        <p className="text-sm text-gray-600">Pending</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <p className="text-xl font-bold text-green-700">
                          {team.completedtask}
                        </p>
                        <p className="text-sm text-gray-600">
                          Completed Today
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


export default Teams;
