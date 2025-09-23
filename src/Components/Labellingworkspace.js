import { useState,useRef,useEffect } from "react";
import { Play,  Volume2,ArrowLeft } from "lucide-react";
import WaveSurfer from "wavesurfer.js";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import CreatableSelect from 'react-select/creatable';
import { useLocation } from "react-router-dom";




export default function Labellingworkspace() {

  const location=useLocation();
  const id=location.state.audio || "";
  const [audioFile, setAudioFile] = useState(null);
  const containerRef = useRef(null);
  const wavesurferRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const[role,setRole] =useState('');
  const[error,setError]=useState('');;
  const[open,setOpen]=useState(false);
  const[content,setContent]=useState("");
  const[modal,setModal]=useState(false);
  const [toast, setToast] = useState(null);
  const [hourModalOpen, setHourModalOpen] = useState(true);  // open by default
  const [hourId, setHourId] = useState({
      id:'',
      url:''
  });
  const[audio,setAudio]=useState([]);
  const[song,setSong]=useState({
     title:"",
     artist:"",
     album:"",
     release:"",
     language:""
})
const [songOptions, setSongOptions] = useState({
  title: [],
  artist: [],
  album: [],
  language: []
});
const [adsOptions, setAdsOptions] = useState({
  brand: [],
  product: [],
  category: [],
  sector: [],
  type:[]
});
const[programOptions,setProgramoptions]=useState({
      title:[],
      language:[],
})
const[sportsOptions,setSportsoption]=useState({
       title:[],
       language:[],
})
const[meta,setMeta]=useState({
     city:'',
     date:'',
     channel:'',
     starttime:'',
     endtime:'',
     duration:'',
     contentType:'',
     program:{
     songs:{
          title:"",
          artist:"",
          album:"",
          release:"",
          language:""
     },
     ads:{
      brand:"",
      product:"",
      category:"",
      sector:"",
      type:""
     },
     jingle:'',
     program:{
      title:'',
      language:'',
      episode:'',
      season:'',
      genre:'',

     },
     error:'',
     sports:
     {
       title:'',
       language:'',
       category:'',
       type:''
     }

    }
  });
 
  // const api="https://backend-fj48.onrender.com";
  const api="http://localhost:3001";
  const startOffset = 0;
  const handleSkip = (seconds) => {
  if (!wavesurferRef.current) return;

  const ws = wavesurferRef.current;
  const current = ws.getCurrentTime();
  const duration = ws.getDuration();

  // new time (bounded between 0 and duration)
  let newTime = current + seconds;
  if (newTime < 0) newTime = 0;
  if (newTime > duration) newTime = duration;

  ws.setTime(newTime);
  setCurrentTime(formatTime(newTime+startOffset));
};

  const intervals = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      intervals.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  const formatTime = (secs) => {
    if (isNaN(secs)) return "00:00:00";
    const h = Math.floor(secs / 3600).toString().padStart(2, "0");
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0");
    const s = Math.floor(secs % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

 const [currentTime, setCurrentTime] = useState(0);
 const[url,setUrl]=useState('');
 useEffect(() => {
  if (!hourId.url) return;

  console.log(hourId.url);
  const handleAudio = async () => {
    try {
      const res = await axios.get(
        `${api}/app/download?key=${encodeURIComponent(hourId.url)}`
      );
      setUrl(res.data.url); // signed URL
    } catch (err) {
      console.error("Error fetching signed URL:", err);
    }
  };

  handleAudio();
}, [hourId.url]); 

useEffect(() => {
  if (!containerRef.current || !url) return; // wait until url is set

  const ws = WaveSurfer.create({
    container: containerRef.current,
    waveColor: "#a78bfa",
    progressColor: "#7c3aed",
    cursorColor: "#1e293b",
    barWidth: 2,
    height: 150,
    backend: "MediaElement",
  });

  const fakePeaks = new Array(2000).fill(0).map(() => Math.random() * 2 - 1);
  ws.load(url, fakePeaks); // use signed URL

  ws.on("ready", () => {
    setIsReady(true);
    ws.setTime(0);
    setCurrentTime(formatTime(startOffset));
  });

  ws.on("audioprocess", (time) => {
    setCurrentTime(formatTime(time + startOffset));
  });

  ws.on("seek", (progress) => {
    const duration = ws.getDuration();
    setCurrentTime(formatTime(progress * duration + startOffset));
  });

  wavesurferRef.current = ws;

  return () => {
    ws.destroy();
  };
}, [url]); // run only when signed URL is ready

const submitMetadata=async()=>{
  try{ 
         console.log(meta);
           if(!meta.channel || !meta.contentType || !meta.duration || !meta.endtime || !meta.starttime || !meta.program || !meta.date || !meta.city) {
             setError('Enter All Fields');
             return;
           };
          setError("");
          const res=await axios.post(`${api}/app/savemetadata`, {
          metadata: meta,
          audioId:hourId.id
        });
        console.log(res.data);
        if(res.data.success)
        {
            
             alert("Metadata saved!");
        }
       
  }
  catch(err)
  {
       console.log(err);
  }
}
useEffect(()=>{
    const token=localStorage.getItem("token");
    const decoded = jwtDecode(token);
    setRole(decoded.role);
},[])
 
const getSongFieldType = (field) => {
  switch (field) {
    case "title": return "song:title";
    case "artist": return "song:artist";
    case "album": return "song:album";
    case "language": return "song:language";
    default: return null;
  }
};
const getAdsFieldType = (field) => {
  switch (field) {
    case "brand": return "ads:brand";
    case "product": return "ads:product";
    case "category": return "ads:category";
    case "sector": return "ads:sector";
    case "type": return "ads:type";
    default: return null;
  }
};
const getProgramFieldType = (field) => {
  switch (field) {
    case "title": return "program:title";
    case "language": return "program:language";
    case "episode": return "program:episode";
    case "season": return "program:season";
    case "genre": return "program:genre";
    default: return null;
  }
};
const getSportsFieldType= (field) => {
  switch (field) {
    case "title": return "sports:title";
    case "language": return "sports:language";
    default: return null;
  }
};
useEffect(() => {
  ["brand", "product", "category", "sector","type"].forEach((field) => {
    const type = getAdsFieldType(field);
    axios.get(`${api}/suggest?type=${type}`)
      .then(res => {
        setAdsOptions(prev => ({
          ...prev,
          [field]: res.data.map(item => ({ value: item, label: item }))
        }));
      })
      .catch(err => console.error(err));
  });
}, []);
useEffect(() => {
  ["title", "artist", "album", "language"].forEach((field) => {
    const type = getSongFieldType(field);
    axios.get(`${api}/suggest?type=${type}`)
      .then(res => {
        setSongOptions(prev => ({
          ...prev,
          [field]: res.data.map(item => ({ value: item, label: item }))
        }));
      })
      .catch(err => console.error(err));
  });
}, []);
useEffect(() => {
  ["title", "language"].forEach((field) => {
    const type = getProgramFieldType(field);
    axios.get(`${api}/suggest?type=${type}`)
      .then(res => {
        setProgramoptions(prev => ({
          ...prev,
          [field]: res.data.map(item => ({ value: item, label: item }))
        }));
      })
      .catch(err => console.error(err));
  });
}, []);
useEffect(() => {
  ["title", "language"].forEach((field) => {
    const type = getSportsFieldType(field);
    axios.get(`${api}/suggest?type=${type}`)
      .then(res => {
        setSportsoption(prev => ({
          ...prev,
          [field]: res.data.map(item => ({ value: item, label: item }))
        }));
      })
      .catch(err => console.error(err));
  });
}, []);
const handleAdsChange = async (field, selected) => {
  const value = selected ? selected.value : null;

  setMeta(prev => ({
    ...prev,
    program: {
      ...prev.program,
      ads: { ...prev.program.ads, [field]: value }
    }
  }));

  const type = getAdsFieldType(field);
  if (value !== null) {
    await axios.post(`${api}/add?type=${type}&value=${value}`);
  }

  setAdsOptions(prev => {
    if (!value) return prev; // No update to options if cleared
    const exists = prev[field]?.some(opt => opt.value.toLowerCase() === value.toLowerCase());
    if (exists) return prev;

    return {
      ...prev,
      [field]: [...prev[field], { value, label: value }]
    };
  });
};

const handleSongChange = async (field, selected) => {
  const value = selected ? selected.value : null;
  setSong(prev => ({ ...prev, [field]: value }));

  // Save new entry in Redis if not already present
  const type = getSongFieldType(field);
  if (value !== null) {
    await axios.post(`${api}/add?type=${type}&value=${value}`);
  }

  setSongOptions(prev => {
    if (!value) return prev; // No update to options if cleared
    const exists = prev[field]?.some(opt => opt.value.toLowerCase() === value.toLowerCase());
    if (exists) return prev;

    return {
      ...prev,
      [field]: [...prev[field], { value, label: value }]
    };
  });
};
const handleProgramChange = async (field, selected) => {
  const value = selected ? selected.value : null;

  setMeta(prev => ({
    ...prev,
    program: {
      ...prev.program,
      program: { ...prev.program.program, [field]: value }
    }
  }));

  const type = getProgramFieldType(field);
  if (value !== null) {
    await axios.post(`${api}/add?type=${type}&value=${value}`);
  }

  setProgramoptions(prev => {
    if (!value) return prev; // No update to options if cleared
    const exists = prev[field]?.some(opt => opt.value.toLowerCase() === value.toLowerCase());
    if (exists) return prev;

    return {
      ...prev,
      [field]: [...prev[field], { value, label: value }]
    };
  });
};

const handleSportsChange = async (field, selected) => {
  const value = selected ? selected.value : null;
  console.log(field, value);
  setMeta(prev => ({
    ...prev,
    program: {
      ...prev.program,
      sports: { ...prev.program.sports, [field]: value }
    }
  }));

  const type = getSportsFieldType(field);
  if (value !== null) {
    await axios.post(`${api}/add?type=${type}&value=${value}`);
  }

  setSportsoption(prev => {
    if (!value) return prev; // No update to options if cleared
    const exists = prev[field]?.some(opt => opt.value.toLowerCase() === value.toLowerCase());
    if (exists) return prev; // skip duplicate

    return {
      ...prev,
      [field]: [...prev[field], { value, label: value }]
    };
  });
};

const handleSave = async () => {
  console.log(meta);
  if (meta.contentType === "Song") {
    setMeta(prev => ({
      ...prev,
      program: {
        ...prev.program,
        songs: {
          title: song.title,
          album: song.album,
          release: song.release,
          artist: song.artist,
          language: song.language
        }
      }
    }));
  setOpen(false);
  }
};


const handleContent=()=>{
   if(meta.contentType==="Advertisement" || meta.contentType==="Song" || meta.contentType==="Program" || meta.contentType==="Sports")
   {
     setOpen(true);
     setContent("");
     console.log(meta.contentType);
   }
   else if(meta.contentType!=="Advertisement" ||meta.contentType!=="Song"|| meta.contentType!=="Program" || meta.contentType!=="Jingle" || meta.contentType!=="Error" || meta.contentType!=="Sports")
   {
     setContent("Please Select Content Type First");
   }
   else if(meta.contentType==="Advertisement" ||meta.contentType==="Song"|| meta.contentType==="Program" || meta.contentType==="Jingle" || meta.contentType==="Error" || meta.contentType==="Sports")
   {
     setContent("");
   }
}
 useEffect(() => {
    if (meta.starttime && meta.endtime) {
      const start = new Date(`1970-01-01T${meta.starttime}`);
      const end = new Date(`1970-01-01T${meta.endtime}`);

      let diff = (end - start) / 1000; // in seconds

      if (diff < 0) {
        // if endtime is past midnight
        diff += 24 * 60 * 60;
      }

      setMeta((prev) => ({ ...prev, duration: diff.toString() }));
    }
  }, [meta.starttime, meta.endtime]);

  useEffect(()=>{
          setAudio(id);
  },[id])


  const submitAll=async()=>{
    try{
           const res=await axios.get(`${api}/app/finalSubmit`,{
             params:{id:hourId.id}
           });
           if(res.status===200)
           {
              console.log(res.data);
              setAudio(prev =>
                prev.map(ad =>
                  ad.id === hourId.id ? { ...ad, completed: true } : ad
                )
              );

              setHourId({}); 

              setToast("Metadata submitted successfully!");

            // auto-hide after 3 sec
            setModal(false);
            setTimeout(() => setToast(null), 3000);
           }
    }
    catch(err)
    {
       console.log(err);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
        <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-purple-700 font-medium hover:underline"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-purple-700">Audio Labelling</h1>
        <div className="flex gap-3">
          {/* <button className="px-4 py-2 rounded-lg border bg-white shadow-sm hover:bg-gray-100">
           Hour Id:{id}
          </button> */}
          <button className="px-4 py-2 rounded-lg border bg-white shadow-sm hover:bg-gray-100">
            Clip History
          </button>
          <button className="px-3 py-2 rounded-lg border bg-white shadow-sm hover:bg-gray-100">
            ⚙️
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audio Selection */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">Audio Selection</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Select City</label>
              <select
                className="w-full border rounded-lg p-2 mt-1"
                value={meta.city}
                onChange={(e) => setMeta(prev => ({ ...prev, city: e.target.value }))}
              >
                <option>Choose city...</option>
                <option>Delhi</option>
                <option>Mumbai</option>
                <option>Karnal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Date</label>
              <input
                type="date"
                className="w-full border rounded-lg p-2 mt-1"
                value={meta.date}
                onChange={(e) => setMeta(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
           <div className="mt-4">
            <label className="block text-sm font-medium">
              Audio File
            </label>
            <div className="mt-2 p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-800">
              {hourId?.url || "No file selected"}
            </div>
          </div>
          </div>
        </div>

        {/* Audio Playback & Clipping */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
           {!hourId.url ? (
                    <>
                    <h2 className="text-lg font-semibold mb-4">Audio Playback & Clipping</h2>
                    <div className="border rounded-lg p-6 text-center">
                        <Volume2 className="mx-auto mb-2" size={30} />
                        <p className="text-gray-500">Upload an audio file to see waveform</p>
                    </div>
                    </>
                ) : (
                    <div>
                          <div className="w-full mx-auto p-6">
                            <div
                                ref={containerRef}
                                className="w-full h-[150px] bg-gray-100 rounded-md"
                            />
                            </div>
                            </div>
                )}

          {/* Controls */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button className="bg-purple-600 text-white rounded-full p-4 shadow-lg hover:bg-purple-700"  onClick={() => wavesurferRef.current?.playPause()}>
              <Play size={28} />
            </button>
          </div>

          {/* Time Controls */}
          <div className="flex justify-center gap-4 mt-6">
            <div>
              <p className="text-sm text-gray-500 mb-4 flex justify-center">
              Current Position: {currentTime}
            </p>
              <div className="flex gap-2 mt-2">
                {[-10, -5, -1, +1, +2, +10].map((sec) => (
                  <button
                    key={sec}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-100" onClick={()=>handleSkip(sec)}
                  >
                    {sec > 0 ? `+${sec}s` : `${sec}s`}
                  </button>
                ))}
              </div>
            </div>
            <div>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata & Submission */}
      <div className="bg-white p-6 rounded-2xl shadow-md mt-6">
        <h2 className="text-lg font-semibold mb-4">Metadata & Submission</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium">Content Type</label>
            <select className="w-full border rounded-lg p-2 mt-1" onChange={(e) => setMeta(prev => ({ ...prev, contentType: e.target.value }))}>
              <option>Select type...</option>
              <option>Advertisement</option>
              <option>Song</option>
              <option>Program</option>
               <option>Error</option>
               {/* <option>Promo</option> */}
               <option>Sports</option>
               <option>Jingle</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Channel</label>
            <select className="w-full border rounded-lg p-2 mt-1" onChange={(e) => setMeta(prev => ({ ...prev, channel: e.target.value }))}>
              <option>Select Channel...</option>
              <option>Radio City</option>
              <option>Radio Tadka</option>
              <option>Fever Fm</option>
               <option>Big Fm</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Start Time</label>
            <input type="time" step={1} className="w-full border rounded-lg p-2 mt-1" onChange={(e) => setMeta(prev => ({ ...prev, starttime: e.target.value }))}/>
          </div>
          <div>
            <label className="block text-sm font-medium">End Time</label>
            <input type="time" step={1} className="w-full border rounded-lg p-2 mt-1" onChange={(e) => setMeta(prev => ({ ...prev, endtime: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium" >Duration</label>
            <input className="w-full border rounded-lg p-2 mt-1" disabled placeholder="Duration..." value={meta.duration} onChange={(e) => setMeta(prev => ({ ...prev, duration: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium" >Program</label>
      
              {meta.contentType === "Jingle" ? (
              // ✅ Jingle Dropdown
              <select
                className="w-full border rounded-lg p-2 mt-1"
                value={meta.program?.jingle || ""}
                onChange={(e) =>
                  setMeta({
                    ...meta,
                    program: { ...meta.program, jingle: e.target.value },
                  })
                }
              >
                <option value="">Select Jingle</option>
                <option value="Jingle">Jingle</option>
                {/* ✅ Add more jingles here */}
              </select>
            ) : meta.contentType === "Error" ? (
              // ✅ Error Dropdown
              <select
                className="w-full border rounded-lg p-2 mt-1"
                value={meta.program?.error || ""}
                onChange={(e) =>
                  setMeta({
                    ...meta,
                    program: { ...meta.program, error: e.target.value },
                  })
                }
              >
                <option value="">Select Error</option>
                <option value="Audio Issue">Audio Issue</option>
                <option value="No Signal">No Signal</option>
                <option value="Audio Corrupted">Audio Corrupted</option>
              </select>
            ) : (
              // ✅ Default Input
              <input
                className="w-full border rounded-lg p-2 mt-1"
                placeholder="Select or type..."
                onClick={handleContent}
                value={meta.contentType || ""}
                onChange={(e) =>
                  setMeta({
                    ...meta,
                    contentType: e.target.value,
                  })
                }
              />
            )}
            </div>
           {error && <p className="text-red-500">{error}</p>}
          {content && <p className="text-red-500">{content}</p>}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button className="px-6 py-2 rounded-lg border bg-white shadow-sm hover:bg-gray-100" onClick={()=>setModal(true)}>
            Final Submit
          </button>
          <button className="px-6 py-2 rounded-lg bg-purple-600 text-white shadow-md rounded-xl hover:bg-purple-700" onClick={submitMetadata}>
            Submit Metadata
          </button>
        </div>
      </div>


    {open && (meta.contentType==="Advertisement" || meta.contentType==="Song" || meta.contentType==="Program" || meta.contentType==="Sports") && (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-xl w-full max-w-2xl cursor-default relative">
      {/* Header */}
      <div className="modal-header flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold">Add/Edit Item</h2>
        <button
          onClick={() => setOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* Conditional Form */}
      {meta.contentType === "Advertisement" ? (
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            📢 Add Advertisement Metadata
          </h2>

          <div className="grid grid-cols-2 gap-6">
            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <CreatableSelect
                options={adsOptions.brand}
                value={
                  meta.program.ads.brand
                    ? { value: meta.program.ads.brand, label: meta.program.ads.brand }
                    : null
                }
                placeholder="Select or type brand"
                onChange={(selected) => handleAdsChange("brand", selected)}
                isClearable
                isSearchable
              />
            </div>

            {/* Product */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product
              </label>
              <CreatableSelect
                options={adsOptions.product}
                value={
                  meta.program.ads.product
                    ? { value: meta.program.ads.product, label: meta.program.ads.product }
                    : null
                }
                placeholder="Select or type product"
                onChange={(selected) => handleAdsChange("product", selected)}
                isClearable
                isSearchable
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <CreatableSelect
                options={adsOptions.category}
                value={
                  meta.program.ads.category
                    ? { value: meta.program.ads.category, label: meta.program.ads.category }
                    : null
                }
                placeholder="Select or type category"
                onChange={(selected) => handleAdsChange("category", selected)}
                isClearable
                isSearchable
              />
            </div>

            {/* Sector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sector
              </label>
              <CreatableSelect
                options={adsOptions.sector}
                value={
                  meta.program.ads.sector
                    ? { value: meta.program.ads.sector, label: meta.program.ads.sector }
                    : null
                }
                placeholder="Select or type sector"
                onChange={(selected) => handleAdsChange("sector", selected)}
                isClearable
                isSearchable
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1 ">
                Type Of Ads
              </label>
              <CreatableSelect
                options={adsOptions.type}
                value={
                  meta.program.ads.type
                    ? { value: meta.program.ads.type, label: meta.program.ads.type }
                    : null
                }
                placeholder="Select or type "
                onChange={(selected) => handleAdsChange("type", selected)}
                isClearable
                isSearchable
              />
            </div>
          </div>
        </div>
      ): meta.contentType === "Song" ?(
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            🎵 Add Song Metadata
          </h2>

          <div className="grid grid-cols-2 gap-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <CreatableSelect
                options={songOptions.title}
                value={song.title ? { value: song.title, label: song.title } : null}
                placeholder="Select or type a title"
                onChange={(selected) => handleSongChange("title", selected)}
                isClearable
                isSearchable
              />
            </div>

            {/* Artist */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Artist
              </label>
              <CreatableSelect
                options={songOptions.artist}
                value={song.artist ? { value: song.artist, label: song.artist } : null}
                placeholder="Select or type an artist"
                onChange={(selected) => handleSongChange("artist", selected)}
                isClearable
                isSearchable
              />
            </div>

            {/* Album */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Album
              </label>
              <CreatableSelect
                options={songOptions.album}
                value={song.album ? { value: song.album, label: song.album } : null}
                placeholder="Select or type an album"
                onChange={(selected) => handleSongChange("album", selected)}
                isClearable
                isSearchable
              />
            </div>

            {/* Release Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Release Year
              </label>
              <input
                type="number"
                min="1900"
                max="2099"
                step="1"
                placeholder="e.g. 2021"
                value={song.release}
                onChange={(e) => setSong({ ...song, release: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Language */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <CreatableSelect
                options={songOptions.language}
                value={song.language ? { value: song.language, label: song.language } : null}
                placeholder="Select or type a language"
                onChange={(selected) => handleSongChange("language", selected)}
                isClearable
                isSearchable
              />
            </div>
          </div>
        </div>
      ): meta.contentType === "Program" ?
       (<div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            🎬 Add Program Metadata
          </h2>

          <div className="grid grid-cols-2 gap-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <CreatableSelect
                options={programOptions.title}
                value={
                  meta.program.program.title
                    ? { value: meta.program.program.title, label: meta.program.program.title }
                    : null
                }
                onChange={(selected) => handleProgramChange("title", selected)}
                placeholder="Select or type a title"
                isClearable
                isSearchable
              />
            </div>

            {/* Artist */}
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <CreatableSelect
                options={programOptions.language}
                value={
                  meta.program.program.language
                    ? { value: meta.program.program.language, label: meta.program.program.language }
                    : null
                }
                onChange={(selected) => handleProgramChange("language", selected)}
                placeholder="Select or type a language"
                isClearable
                isSearchable
              />
            </div>

            {/* Album */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Episode Number
              </label>
              <input
                type="number"
                placeholder="e.g. 1"
                min="1"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) =>
                    setMeta((prev) => ({
                      ...prev,
                      program: {
                        ...prev.program,
                        program: {
                          ...prev.program.program,
                          episode: e.target.value,  // 👈 safely update only episode
                        },
                      },
                    }))
                  }
              />
            </div>
            {/* Release Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
               Season Number
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 1"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) =>
                    setMeta((prev) => ({
                      ...prev,
                      program: {
                        ...prev.program,
                        program: {
                          ...prev.program.program,
                          season: e.target.value,  // 👈 safely update only episode
                        },
                      },
                    }))
                  }
              />
            </div>
             <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Genre
              </label>
                  <select className="w-full border rounded-lg p-2 mt-1" 
                   onChange={(e) =>
                    setMeta((prev) => ({
                      ...prev,
                      program: {
                        ...prev.program,
                        program: {
                          ...prev.program.program,
                          genre: e.target.value,  // 👈 safely update only episode
                        },
                      },
                    }))
                  }
                  >
                     <option>Horror</option>
                      <option>Comedy</option>
                  </select>
            </div>
            {/* Language */}
            
          </div>
        </div>):
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            ⛳ Add Sports Metadata
          </h2>

          <div className="grid grid-cols-2 gap-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <CreatableSelect
                options={sportsOptions.title}
                value={
                  meta.program.sports.title
                    ? { value: meta.program.sports.title, label: meta.program.sports.title }
                    : null
                }
                onChange={(selected) => handleSportsChange("title", selected)}
                placeholder="Select or type a title"
                isClearable
                isSearchable
              />
            </div>
            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <CreatableSelect
              options={sportsOptions.language}
                value={
                  meta.program.sports.language
                    ? { value:  meta.program.sports.language, label:  meta.program.sports.language }
                    : null
                }
                onChange={(selected) => handleSportsChange("language", selected)}
                placeholder="Select or type a language"
                isClearable
                isSearchable
              />
            </div>
            
            {/* Album */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select className="w-full border rounded-lg p-2 mt-1">
                     <option>Live Match</option>
                      <option>Documentary</option>
                      <option>Highlights</option>
                      <option>Analysis</option>
                  </select>
            </div>
            {/* Artist */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sport Type
              </label>
                  <select className="w-full border rounded-lg p-2 mt-1">
                     <option>Football</option>
                      <option>Cricket</option>
                  </select>
            </div>
          </div>
        </div>
    }
      {/* Footer Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => setOpen(false)}
          className="px-4 py-2 border rounded-lg hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}
{modal &&
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={()=>setModal(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <p className="text-lg text-gray-500 mb-4">
         Do you confirm that all annotations and metadata for this hour are correct and complete?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 border rounded-md text-green-600 hover:bg-green-100"
            onClick={submitAll}
          >
            Yes
          </button>
          <button
            onClick={()=>setModal(false)}
            className="px-4 py-2 bg-red-500 hover:bg-red-700 text-white rounded-md"
          >
            No
          </button>
        </div>
      </div>
    </div>
    }
{hourModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-xl shadow-lg w-120">
      <h2 className="text-lg font-semibold mb-4">Select Hour ID</h2>

      <ul className="space-y-3">
    {audio.map((ad, idx) => (
      <li
        key={idx}
        className="flex justify-between items-center border-b pb-2"
      >
        <span className="text-sm text-gray-700 truncate">
          {ad.audioUrl}
        </span>

        {ad.completed ? (
          <button
            disabled
            className="px-4 py-1 rounded-lg text-sm bg-green-500 text-white cursor-not-allowed"
          >
            Completed
          </button>
        ) : (
          <button
            className={`px-4 py-1 rounded-lg text-sm ${
              hourId.id === ad.id
                ? "bg-purple-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
            onClick={() => setHourId({ id: ad.id, url: ad.audioUrl })}
          >
            {hourId.id === ad.id ? "Selected" : "Choose"}
          </button>
        )}
      </li>
    ))}
  </ul>


      <div className="flex justify-end gap-2 mt-4">
        <button
          className={`px-4 py-2 rounded-lg ${
            hourId
              ? "bg-gray-200 hover:bg-gray-300 cursor-pointer"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
          onClick={() => setHourModalOpen(false)}
          disabled={!hourId.id} // ❌ disabled until one hour is chosen
        >
          Cancel
        </button>

        <button
          className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
          onClick={() => {
            if (!hourId) {
              alert("Please select an Hour ID!");
              return;
            }
            console.log("Hour ID submitted:", hourId);
            setHourModalOpen(false);
          }}
        >
          Submit
        </button>
      </div>
    </div>
  </div>
)}
 {toast && (
  <div className="fixed bottom-5 right-5 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-in">
    {toast}
  </div>
)}


    </div>
  );
}
