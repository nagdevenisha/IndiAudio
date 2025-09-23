import React,{useEffect, useMemo, useState,useRef} from 'react';
import { Clock, MapPin ,ArrowLeft,X,Info, Loader2} from "lucide-react";
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import CreatableSelect from "react-select/creatable";
import { v4 as uuidv4 } from "uuid";
import Draggable from "react-draggable";



function Annotator() {

    //  const startHour = "06:00";
    //  const endHour = "24:00";
     const nodeRef = useRef(null);
     const [scale, setScale] = useState(1);
     const [toast, setToast] = useState(null);
     const location=useLocation();
     const[data,setData]=useState({});
     const[error,setError]=useState('');
     const[start,setStart]=useState();
     const[end,setEnd]=useState();
     const[timeline,setTimeline]=useState(true);
     const[label,setLabel]=useState([]);
     const [contentType, setContentType] = useState("");
     const [formData, setFormData] = useState({});
     const [isOpen, setIsOpen] = useState(false);
     const[clip,setClip]=useState({});
     const[audio,setAudio]=useState('');
     const[loading,setLoading]=useState(false);
     const[modal,setModal]=useState(false);
     const[time,setTime]=useState({start:'',end:''});
     const[dialog,setDialog]=useState(false);
     const [options, setOptions] = useState({});
     const[comments,setComments]=useState("");


   const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    setModal(false);
    
  };

   
function generateItemId() {
  return `ITEM-${uuidv4()}`;
}
   //  const api="https://backend-fj48.onrender.com";
   const api="http://localhost:3001";
     useEffect(()=>{
        console.log(location.state.anot)
        setData(location.state.anot);
        setStart(location.state.anot.startHour);
        setEnd(location.state.anot.endHour);
        setLabel(location.state.data);
         console.log(location.state.data)
     },[])

  const counts = {
    Ads: label.filter(e => e.type === "advertisement").length,
    Songs: label.filter(e => e.type === "song").length,
    Jingles: label.filter(e => e.type === "jingle").length,
    Programs: label.filter(e => e.type === "program").length,
  };
  

const toSeconds = (time) => {
  if (typeof time === "number") {
    // If it's just an hour like 7 or 10
    return time * 3600;
  }

  if (typeof time === "string") {
    const parts = time.split(":").map(Number);
    const [h, m = 0, s = 0] = parts;
    return h * 3600 + m * 60 + s;
  }

  return 0;
};

const startSec = start !== undefined ? toSeconds(`${start.toString().padStart(2,'0')}:00:00`) : 0;
const endSec = end !== undefined ? toSeconds(`${end.toString().padStart(2,'0')}:00:00`) : 24*3600; // default 24:00:00

const totalDuration = endSec - startSec;

// total timeline width
const timelineWidth = totalDuration * scale;

// Generate ticks every 15 minutes
const ticks = useMemo(() => {
  const arr = [];
  for (let t = startSec; t <= endSec; t += 300) {
    const hh = String(Math.floor(t / 3600)).padStart(2, "0");
    const mm = String(Math.floor((t % 3600) / 60)).padStart(2, "0");
    arr.push({
      label: `${hh}:${mm}`,
      pos: ((t - startSec) / totalDuration) * 100,
    });
  }
  return arr;
}, [startSec, endSec, totalDuration]);

// Filter + position clips only in selected range
const positionedClips = useMemo(() => {
  return label
    .filter((clip) => {
      const clipStart = toSeconds(clip.start);
      const clipEnd = toSeconds(clip.end);
      return clipStart < endSec && clipEnd > startSec; // overlap with window
    })
    .map((clip) => {
      const clipStart = Math.max(toSeconds(clip.start), startSec);
      const clipEnd = Math.min(toSeconds(clip.end), endSec);
      const left = ((clipStart - startSec) / totalDuration) * 100;
      const width = ((clipEnd - clipStart) / totalDuration) * 100;
      return { ...clip, left, width };
    });
}, [label, startSec, endSec, totalDuration]);
// 🔹 Compute gaps (unlabeled regions)
const gaps = useMemo(() => {
  if (!positionedClips.length) {
    return [
      { start: startSec, end: endSec, left: 0, width: 100 }
    ];
  }

  let result = [];
  let sorted = [...positionedClips].sort((a, b) => a.left - b.left);

  // Gap before the first clip
  if (sorted[0].left > 0) {
    result.push({
      start: startSec,
      end: toSeconds(sorted[0].start),
      left: 0,
      width: sorted[0].left,
    });
  }

  // Gaps between clips
  for (let i = 0; i < sorted.length - 1; i++) {
    const gapStart = toSeconds(sorted[i].end);
    const gapEnd = toSeconds(sorted[i + 1].start);

    if (gapEnd > gapStart) {
      const left = ((gapStart - startSec) / totalDuration) * 100;
      const width = ((gapEnd - gapStart) / totalDuration) * 100;
      result.push({ start: gapStart, end: gapEnd, left, width });
    }
  }

  // Gap after the last clip
  const lastClipEnd = toSeconds(sorted[sorted.length - 1].end);
  if (lastClipEnd < endSec) {
    const left = ((lastClipEnd - startSec) / totalDuration) * 100;
    const width = ((endSec - lastClipEnd) / totalDuration) * 100;
    result.push({ start: lastClipEnd, end: endSec, left, width });
  }

  return result;
}, [positionedClips, startSec, endSec, totalDuration]);

     const colors = {
     advertisement: "border-red-500 bg-red-100 text-red-600",
     song: "border-green-500 bg-green-100 text-green-600",
     jingle: "border-blue-500 bg-blue-100 text-blue-600",
     program: "border-yellow-500 bg-yellow-100 text-yellow-600", 
     unlabeled: "border-black bg-black text-black italic"
    };

   const handleTimeline=(start,end)=>{
       if(end===start)
       {
         setError("*Select End Hour Greater than Start Hour");
       }
       else{
              setError('');
       }
      try{
                
      }
      catch(err)
      {
         console.log(err);
      }
   }
   useEffect(()=>{
         if(end<=start)
         {
             setError("*Select End Hour Greater than Start Hour");
             setTimeline(false);
         }

          else{
              setError('');
              setTimeline(true)
           }
   },[start,end])

const handleClips=async(clips)=>{
       setIsOpen(true);
       setLoading(true);
       setClip(clips);
       console.log(clips);
       try{
            const res=await axios.get(`${api}/clips`,{
                params:{
                    filePath:data.audio,
                    startTime:clips.start,
                    endTime:clips.end,
                    mergedStart:data.starts
                },
                responseType: "blob",
            });
            // console.log(res.data);
            if(res.data)
            {
                 const url = URL.createObjectURL(res.data);
                 setAudio(url);
                 setLoading(false);
            }
       }
       catch(err)
       {
         console.log(err);
       }
    
}
const secondsToHMS = (seconds) => {
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${h}:${m}:${s}`;
};

const handleUnlabel=async(start,end)=>{
     try{
           const res=await axios.get(`${api}/clips`,{
                params:{
                    filePath:data.audio,
                    startTime:secondsToHMS(start),
                    endTime:secondsToHMS(end),
                    mergedStart:data.starts
                },
                responseType: "blob",
            });
             if(res.data)
            {
                 const url = URL.createObjectURL(res.data);
                 setAudio(url);
                 setLoading(false);
            }
          setModal(true);
          setTime({start:secondsToHMS(start),end:secondsToHMS(end)});
     }
     catch(err)
     {
         console.log(err)
     }
}

 const handleChanges=(clip)=>{
          setDialog(true);
          setTime({start:clip.start,end:clip.end})
 }

 const fieldMap = {
  Song: ["label","title", "artist", "album", "language","year"],
  Ads: ["brand", "product", "category", "sector", "type"],
  Program: ["title", "language", "episode", "season", "genre"],
  Sports: ["title","sportType" ,"language"],
  Error:["type"]
};

const getFieldType = (contentType, field) => {
  return `${contentType.toLowerCase()}:${field}`;
};

  useEffect(() => {
    if (!contentType) return;

    fieldMap[contentType]?.forEach((field) => {
      const type = getFieldType(contentType, field);
      axios.get(`${api}/suggest?type=${type}`)
        .then(res => {
          setOptions(prev => ({
            ...prev,
            [field]: res.data.map(item => ({ value: item, label: item }))
          }));
        })
        .catch(err => console.error(err));
    });
  }, [contentType]);

  const handleType = async (field, selected) => {
    const value = selected ? selected.value : null;

    setFormData(prev => ({ ...prev, [field]: value }));

    if (value) {
      const type = getFieldType(contentType, field);
      await axios.post(`${api}/add?type=${type}&value=${value}`);
      // update local options if new
      setOptions(prev => {
        const exists = prev[field]?.some(opt => opt.value.toLowerCase() === value.toLowerCase());
        if (exists) return prev;
        return {
          ...prev,
          [field]: [...(prev[field] || []), { value, label: value }]
        };
      });
    }
  };

  const submitForm=async(id)=>{
      try{   
             console.log(time.start,time.end,id,contentType,formData);
             const res=await axios.post(`${api}/app/form`,{id:id,start:time.start,end:time.end,content:contentType,form:formData,channel:data.station,city:data.city,date:data.audioDate,audio:data.audio})
              if(res)
              {
                 console.log(res.data);
                  setLabel((prev) => {
                  // check if item exists (update) or not (add new)
                  const exists = prev.find((item) => item.id === id);
                  if (exists) {
                    return prev.map((item) =>
                      item.id === id ? { ...item, ...res.data } : item
                    );
                  } else {
                    return [...prev, res.data];
                  }
                });
                   setToast("Metadata submitted successfully!");

                  // auto-hide after 3 sec
                  setModal(false);
                  setTimeout(() => setToast(null), 3000);
                  setDialog(false);
                  setIsOpen(false);
              }
      }
      catch(err)
      {
         console.log(err);
      }
  }
  const toTitleCase = (str) =>{
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  }

  useEffect(() => {
  if (!contentType) return;

  // Keep only the fields for the selected content type
  const newFormData = {};
  fieldMap[contentType]?.forEach((field) => {
    if (formData[field]) newFormData[field] = formData[field];
  });

  setFormData(newFormData);

}, [contentType]);

    
  return (
        <div className="p-6">
      {/* Back to Dashboard */}
      <button
        className="flex items-center text-purple-600 hover:underline mb-4"
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>
       <div className="mb-6">
        <h1 className="text-2xl font-bold text-purple-600">Labeled Data</h1>
        <p className="text-gray-600">Hourly audio files with labels and annotations</p>
      </div>


      <div className="border rounded-lg p-6 shadow-sm bg-white w-full max-w-8xl">
      {/* Header */}
      <div className="flex items-center mb-6">
        <MapPin className="w-5 h-5 text-purple-600 mr-2" />
        <h2 className="text-lg font-semibold">Session Details</h2>
      </div>

      {/* Session Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
        <div>
          <p className="text-sm text-gray-500">City</p>
          <p className="font-medium text-gray-800">{data.city}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Station</p>
          <p className="font-medium text-gray-800">{data.station}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Date</p>
          <p className="font-medium text-gray-800">{data.audioDate}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Start Hour</p>
          {/* <p className="font-medium text-gray-800">{data.startHour}</p> */}
         <input
                type="number"
                defaultValue={data.startHour}
                min={data.startHour}
                max={data.endHour-1}
                onChange={(e)=>setStart(Number(e.target.value))}
                onKeyDown={(e) => e.preventDefault()} 
                className="border border-gray-400 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
        </div>
        <div>
          <p className="text-sm text-gray-500">End Hour</p>
          <input type='number' onChange={(e)=>setEnd(Number(e.target.value))}
            onKeyDown={(e) => e.preventDefault()} 
           defaultValue={data.endHour}className="border border-gray-400 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500" min={data.startHour+1} max={data.endHour}></input>
        </div>
      </div>

      {/* Button */}
      <div className="flex justify-end mt-6">
        <button onClick={()=>handleTimeline(start,end)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg">
          <Clock className="w-4 h-4" />
          Load Timeline
        </button>
      </div>
      {error && <p className='text-red-500'>{error}</p>}
    </div>
      

      {timeline &&<div className="border rounded-lg p-6 shadow-sm bg-white w-full  mt-6">
  {/* Header */}
  <div className="border rounded-lg p-6 shadow-sm bg-white w-full overflow-x-auto">
    <div className="flex items-center justify-between mb-4">
      {/* Left: Title */}
      <div>
        <h2 className="text-lg font-semibold">Audio Timeline</h2>
        <p className="text-sm text-gray-600">Duration: {start} - {end}</p>
      </div>

      {/* Right: Zoom buttons */}
      <div className="flex gap-2 items-center">
        <button
          className="bg-gray-200 px-3 py-1 rounded"
          onClick={() => setScale(prev => Math.min(prev + 2, 50))} // max zoom
        >
          +
        </button>
        <button
          className="bg-gray-200 px-3 py-1 rounded"
          onClick={() => setScale(prev => Math.max(prev - 2, 1))} // min zoom
        >
          -
        </button>
        <span className="ml-2 text-sm text-gray-500">Zoom: {scale} px/sec</span>
      </div>
    </div>

      {/* Timeline container */}
{/* Timeline container */}
<div className="relative h-28 border rounded-lg bg-gray-50 overflow-x-auto ">
  {/* Inner scrolling track */}
  <div
    className="relative h-full"
    style={{
      // Either full width or scaled min width
       width: `${timelineWidth}px`,
      minWidth: `${(totalDuration / 300) *400}px` // 80px per 15 min block
    }}
  >
    {/* Time ticks */}
  {ticks.map((tick, idx) => (
  <div
    key={idx}
    className={`absolute top-0 text-xs text-gray-500 ${
      idx === 0 || idx === ticks.length - 1 ? "" : "-translate-x-1/2"
    }`}
    style={{ left: `${tick.pos}%` }}
  >
    | <br /> {tick.label}
  </div>
))}

    {/* Clips */}
   {positionedClips.map((clip, idx) => {
  const calculatedWidth = clip.width; // in %
  const minWidthPercent = 0.5; // ~0.5% of track width minimum (adjust as needed)

  return (
    <div
  key={idx}
  className={`absolute top-10 px-3 py-1 rounded-lg border text-sm font-medium overflow-visible whitespace-nowrap ${colors[clip.type]}`}
  style={{
    left: `${clip.left}%`,
    width: `${Math.max(calculatedWidth, minWidthPercent)}%`,
  }}
  title={`${clip.type} (${clip.start} - ${clip.end})`}
  onClick={() => handleClips(clip)}
>
  {clip.type}
  {clip.createdBy?.trim().toLowerCase() === "annotator" && (
    <span
      className="absolute -top-2 right-2 w-4 h-4 bg-green-600 text-white text-[10px] flex items-center justify-center rounded-full shadow"
      title="Verified"
    >
      ✔
    </span>
  )}
</div>

  );
})}
{gaps.map((gap, idx) => (
  <div
    key={`gap-${idx}`}
    className={`absolute top-10 bg-gray-700 border border-dashed border-gray-400 rounded-md overflow-hidden whitespace-nowrap text-ellipsis text-center ${colors["unlabeled"]}`}
    style={{
      left: `${gap.left}%`,
      width: `${gap.width}%`,
      height: "2rem",
      lineHeight: "2rem", // center text vertically
      fontSize: "0.8rem", // optional, smaller text
    }}
    title={`Unlabeled (${gap.start}s → ${gap.end}s)`}
     onClick={()=>handleUnlabel(gap.start,gap.end)}
  >
    unlabeled
  </div>
))}

  </div>
</div>

</div>

      {/* Legend */}
      <div className="flex gap-4 justify-end mt-6 text-sm">
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-700 rounded"></span>Unlabeled</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded"></span> Ads</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded"></span> Songs</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded"></span> Jingles</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-500 rounded"></span> Programs</div>
      </div>

      {/* Counts */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="border rounded-lg p-4 text-center">
          <p className="text-lg font-bold text-red-600">{counts.Ads}</p>
          <p className="text-sm text-gray-600">Ads</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-lg font-bold text-green-600">{counts.Songs}</p>
          <p className="text-sm text-gray-600">Songs</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-lg font-bold text-blue-600">{counts.Jingles}</p>
          <p className="text-sm text-gray-600">Jingles</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-lg font-bold text-yellow-600">{counts.Programs}</p>
          <p className="text-sm text-gray-600">Programs</p>
        </div>
      </div>
    </div>
}

  {isOpen && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[700px] shadow-lg overflow-hidden">
        
        {/* Header */}
       <div className="flex items-center justify-between px-6 pt-6 border-b pb-4">
        {/* Left side: Info + Title */}
        <div className="flex items-center gap-2">
          <Info className="text-blue-500" size={20} />
          <h2 className="text-lg font-semibold">Timeline Segment Details</h2>
        </div>

        {/* Right side: Close button */}
        <button
          onClick={()=>setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <X size={22} />
        </button>
      </div>
        <p className="text-sm text-gray-500 px-6 mb-4 text-left pt-2 ">
          Detailed information for segment at {clip.start}
        </p>

        {/* Segment Overview */}
        <div className="border rounded-lg mx-6 mb-4 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-orange-500">⚠️</span>
            <h3 className="font-semibold">Segment Overview</h3>
          </div>
          <div className="grid grid-cols-3 gap-y-2">
            <p><strong>Channel:</strong>{clip.channel}</p>
            <p><strong>Region:</strong>{clip.region}</p>
            <p>
              <strong>Type:</strong>{" "}
              <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                {clip.type}
              </span>
            </p>
            <p><strong>Start Time:</strong>{clip.start}</p>
            <p><strong>End Time:</strong>{clip.end}</p>
            <p><strong>Date:</strong>{new Date(clip.date).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Content Details */}
        <div className="border rounded-lg mx-6 mb-4 p-4">
          <h3 className="font-semibold mb-2">Content Details</h3>
          <div className="grid">
            <p><strong>Program:</strong>{clip.program}</p>
          </div>
        </div>

        {/* Analysis Information */}
        <div className="border rounded-lg mx-6 mb-6 p-4">
          <h3 className="font-semibold mb-2">Analysis Information</h3>
          <div className="grid grid-cols-2">
            <p><strong>Detection Method:</strong>Autolabelled</p>
            <p><strong>Clip ID:</strong>{clip.id} </p>
          </div>
        </div>
     {/* {files &&   */}
       {loading?
        <div className="flex justify-center items-center">
                <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
                </div>:
        <div className="mt-4 flex justify-center mb-4"> 
          <audio 
            // ref={audioRef} 
            src={audio} 
            controls 
            className="w-full max-w-md"
          />
          </div>
      }
          {/* } */}

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50">
          <button
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-300"
          >
           Save
          </button>
          {/* <button className="px-4 py-2 bg-white border border-gray-300 rounded flex items-center gap-2 hover:bg-gray-100">
            <Play size={16} className="text-blue-500"/>
            Play Audio
          </button> */}
          <button onClick={()=>handleChanges(clip)}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
            Request Changes
          </button>
      </div>
    </div>
   
  </div>
    )}
  {(modal || dialog) &&
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
      <Draggable nodeRef={nodeRef} handle=".drag-handle" bounds="parent">
    <div ref={nodeRef}className=" bg-white rounded-2xl shadow-xl p-6 w-full max-w-xl relative max-h-[90vh] overflow-y-auto">
      {/* Close Button */}
      <button
        onClick={() =>{ setModal(false);setDialog(false)}}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
      >
        <X />
      </button>

      <h2 className="drag-handle text-xl font-semibold mb-4 text-center cursor-grab">Add New Clip</h2>

      {/* Common Clip Info - 2 Columns */}
      {
        dialog?
        <div className="mb-4 grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
  <div>
    <label className="block text-gray-600 text-xs mb-1">Channel</label>
    <input
      type="text"
      value={data.station}
      onChange={(e) => setData({ ...data, station: e.target.value })}
      className="border rounded px-2 py-1 w-full"
    />
  </div>

  <div>
    <label className="block text-gray-600 text-xs mb-1">Region</label>
    <input
      type="text"
      value={data.city}
      onChange={(e) => setData({ ...data, city: e.target.value })}
      className="border rounded px-2 py-1 w-full"
    />
  </div>

  <div>
    <label className="block text-gray-600 text-xs mb-1">Start Time</label>
    <input
      type="text"
      value={time.start}
      onChange={(e) => setTime({ ...time, start: e.target.value })}
      className="border rounded px-2 py-1 w-full"
    />
  </div>

  <div>
    <label className="block text-gray-600 text-xs mb-1">End Time</label>
    <input
      type="text"
      value={time.end}
      onChange={(e) => setTime({ ...time, end: e.target.value })}
      className="border rounded px-2 py-1 w-full"
    />
  </div>

  <div className="col-span-2">
    <label className="block text-gray-600 text-xs mb-1">Date</label>
    <input
      type="text"
      value={new Date(data.audioDate).toLocaleDateString()}
      className="border rounded px-2 py-1 w-full"
    />
  </div>
</div>
:
        <div className="mb-4 grid grid-cols-3 gap-y-2 gap-x-4 text-sm border rounded-lg p-6 shadow-sm bg-white w-full">
        <p><strong>Channel:</strong> {data.station}</p>
        <p><strong>Region:</strong> {data.city}</p>
         <p><strong>Date:</strong> {new Date(data.audioDate).toLocaleDateString()}</p>
      </div>
      }
    {modal && <div className="mb-4 grid grid-cols-2 gap-y-2 gap-x-4 text-sm border rounded-lg p-6 shadow-sm bg-white w-full">
       <div>
          <label className="block text-black font-bold text-xs mb-1">Start Time:</label>
          <input
            type="text"
            value={time.start}
            onChange={(e) => setTime({ ...time, start: e.target.value })}
            className="border rounded px-2 py-1 w-full"
          />
          </div>
        <div>
          <label className="block text-black font-bold text-xs mb-1">End Time:</label>
          <input
            type="text"
            value={time.end}
             onChange={(e) => setTime({ ...time, end: e.target.value })}
            className="border rounded px-2 py-1 w-full"
          />
          </div>
      </div>}
      

      {/* Audio Player */}
     {loading?
        <div className="flex justify-center items-center">
                <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
                </div>:
        <div className="mt-4 flex justify-center mb-4"> 
          <audio 
            src={audio} 
            controls 
            className="w-full max-w-md"
          />
          </div>
      }

      {/* Content Type Selector */}
      <select
        value={contentType}
        onChange={(e) => setContentType(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      >
        <option value="">Select Content Type</option>
        <option value="Song">Song</option>
        <option value="Ads">Ad</option>
        <option value="Program">Program</option>
        <option value="Jingle">Jingle</option>
        <option value="Sports">Sports</option>
        <option value="Error">Error</option>
      </select>

      {/* Dynamic Fields */}
       <form className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {fieldMap[contentType]?.map((field) => (
            <CreatableSelect
              key={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              options={options[field] || []}
              onChange={(selected) => handleType(field, selected)}
              onCreateOption={(inputValue) => {
                const titleValue = toTitleCase(inputValue); // capitalize first letter of each word
                const newOption = { value: titleValue, label: titleValue };

                // Add new option to state
                setOptions(prev => ({
                  ...prev,
                  [field]: [...(prev[field] || []), newOption],
                }));

                // Also update formData
                handleType(field, newOption);
              }}
              formatCreateLabel={(input) => `Add "${toTitleCase(input)}"`}
              className="text-sm"
              isClearable
              maxMenuHeight={100}
            />
          ))}

       </form>
       {contentType==="Jingle" && <input type='text' placeholder='Description....' className='border rounded px-2 py-1 w-full mt-2 h-10' onChange={(e) => handleType("Jdesc", e.target)}></input>}
        {(contentType && dialog) && 
        <div>
           <textarea type='text' placeholder='Add Comments' className='border rounded px-2 py-1 w-full mt-4'/> 
           </div> 
           }
        {contentType && (
          <div className='flex justify-end'>
           <button
            type="submit"
            onChange={(e)=>setComments(e.target.value)}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-700 mt-2 col-span-full"
            onClick={()=>submitForm(dialog?clip.id:generateItemId())}
          >
        Submit
      </button>
      </div>
        )}
  
      </div>
      </Draggable>
    </div>}

     {toast && (
  <div className="fixed bottom-5 right-5 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-in">
    {toast}
  </div>
)}

    </div>
    
  )
}

export default Annotator;
