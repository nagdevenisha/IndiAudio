import React,{useState,useRef, useEffect} from "react";
import { Info, Play, X, RefreshCcwDot,Loader2} from "lucide-react";
// import EditModal from "./EditModal";
import axios from "axios";
// import UnlabelledData from "./UnlabelledData";
import { io } from "socket.io-client";
import Draggable from "react-draggable";
import CreatableSelect from "react-select/creatable";


export default function Timeline({audio,starts,data,date,city,station}) {


   //  const api="https://backend-urlk.onrender.com";
  //  const api="http://localhost:3001/timeline";
  const api=process.env.REACT_APP_API+"/timeline";


  const [selectedSegment, setSelectedSegment] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const[greyblock,setGreyBlock]=useState(false);
  const[file,setFile]=useState("");
  const[files,setFiles]=useState("");
  const[slotStart,setSlotStart]=useState("");
  const[slotEnd,setSlotEnd]=useState("");
  const audioRef = useRef(null);
  const [records, setRecords] = useState(() => data || []);
  const [detail, setDetail] = useState([]);     
  const[error,setError]=useState('');
  const[start,setStart]=useState();
  const[end,setEnd]=useState();
  const [contentType, setContentType] = useState("");
  const [options, setOptions] = useState({});
  const [formData, setFormData] = useState({});
  const[loading,setLoading]=useState(false);
  const[time,setTime]=useState({start:'',end:''});
  const [toast, setToast] = useState(null);
   const[sector,setSector]=useState("");

  const allGapsTemp = [];
  let allStartsGapLength="";

    const socket = io(process.env.REACT_APP_API);
    const nodeRef = useRef(null);

  const fieldMap = {
    Song: ["title", "artist", "album","label","year","language"],
    Ads: ["brand", "product", "sector", "category","type"],
    Program: ["title", "language", "episode", "season", "genre"],
    Sports: ["title","sportType" ,"language"],
    Error:["type"]
  };
  useEffect(() => {
      const handleSegmentSelected = () => {
        const item = localStorage.getItem("selectedSegment");
        if (item) {
          setSelectedSegment(JSON.parse(item));
          setIsModalOpen(true);
        }
      };

    // listen to custom event
    window.addEventListener("segmentSelected", handleSegmentSelected);

    return () => {
      window.removeEventListener("segmentSelected", handleSegmentSelected);
    };
  }, []);


  const startHour = start != null ? start : 0;
  const endHour = end != null ? end : 24;
  // Generate 15-min intervals
 const filteredIntervals = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += 15) {
      filteredIntervals.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }

  useEffect(() => {
  // Listen for updates
        socket.on("recordsUpdated", (updatedRecords) => {
        setRecords(updatedRecords); // replace entire state
  });
  return () => socket.off("recordsUpdated");
}, [city, station, date]);



const startSeconds = start != null ? start * 3600 : 0;
const endSeconds = end != null ? end * 3600 : 24 * 3600;

const timeToSeconds = (time) => {
const [h, m, s = 0] = time.split(":").map(Number); // default s=0
return h * 3600 + m * 60 + s;
 };
// Filter records to only include segments that overlap selected period
const filteredRecords = records.filter((seg) => {
  const segStart = timeToSeconds(seg.start);
  const segEnd = timeToSeconds(seg.end);
  return segEnd > startSeconds && segStart < endSeconds;
});

// Map filtered records to dataBlocks for timeline
const dataBlocks = filteredRecords.map((seg) => ({
  ...seg,
  label: seg.program?.charAt(0) || "•",
}));

const handleBarClick = (segment) => {
  setSelectedSegment(segment);
  setIsModalOpen(true);
  setTime({start:segment.start,end:segment.end});
};
  
const handleAudio = async(start, end) => {
  console.log(audio);
  console.log(starts);
  console.log(start,end);
  setLoading(true);
  try{
    const response = await axios.get(`${api}/clips`, {
      params: {
        filePath: audio,  // full path or relative name
        startTime: start,
        endTime: end,
        mergedStart:starts
      },
      responseType: "blob", // 👈 important for audio
    });

    // Convert blob to URL
    const audioBlob = new Blob([response.data], { type: "audio/mp3" });
    const audioUrl = URL.createObjectURL(audioBlob);
    setFiles(audioUrl); // <-- ensures <audio src={file} /> is visible
    setError('');
    if(response)
    {
       setLoading(false);
    }

    if (audioRef.current) {
      audioRef.current.onloadedmetadata = () => {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((err) => {
          console.warn("Autoplay blocked:", err);
        });
      };
    }
  }
  catch(err)
  {
     setError("Audio Not Available");
     console.log(err);
  }
};

const handleGreyBlock = async (gap) => {
  // gap already has start & end in seconds
  const startSec = gap.start;
  const endSec = gap.end;

  // format back to HH:MM:SS
  const formatTime = (sec) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const startTime = formatTime(startSec);
  const endTime = formatTime(endSec);

  console.log("Grey Clip:", startTime, "->", endTime);

  try {
    const response = await axios.get(`${api}/clips`, {
      params: {
        filePath: audio,
        startTime,
        endTime,
        mergedStart: starts, // if you need original merged clip start
      },
      responseType: "blob",
    });

    const audioBlob = new Blob([response.data], { type: "audio/mp3" });
    const audioUrl = URL.createObjectURL(audioBlob);

    if (response.data) {
      setGreyBlock(true);
      setSlotStart(startTime);
      setSlotEnd(endTime);
      setFile(audioUrl);
    }
  } catch (err) {
    console.error("Clip fetch error", err);
  }
};
 
const handleRecords=async()=>{
  try{
        console.log(data);
        const res=await axios.get(`${api}/getlabel`,{
          params:{
             city:city,
             date:date,
             station:station
          }
        });
        setDetail(res.data);       // store fetched data
        setRecords(res.data);  

  }
  catch(err)
  {
     console.log(err);
  }
}
const getFieldType = (contentType, field) => {
  return `${contentType.toLowerCase()}:${field}`;
};
const handleType = async (field, selected) => {
    if(field==="sector")
    {     
        setSector(`sector:${selected?.value}`);
    }
    if (field === "category" && sector) {
      await axios.post(`${api}/addCategoryToSector`, {
        sector,
        category: selected?.value
      });
    }
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
  const toTitleCase = (str) =>{
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  }
  useEffect(() => {
    if (!contentType) return;
  
    fieldMap[contentType]?.forEach((field) => {
      const type = getFieldType(contentType, field);
      // If it's ads:category, use the sector-dependent endpoint
      if (type === 'ads:category') {
        axios.get(`${api}/suggest?type=ads:${sector}:category`)
          .then(res => {
            setOptions(prev => ({
              ...prev,
              [field]: res.data.map(item => ({ value: item, label: item }))
            }));
          })
          .catch(err => console.error(err));
      } 
      // For all other types
      else {
        axios.get(`${api}/suggest?type=${type}`)
          .then(res => {
            setOptions(prev => ({
              ...prev,
              [field]: res.data.map(item => ({ value: item, label: item }))
            }));
          })
          .catch(err => console.error(err));
      }
    });
  }, [contentType, sector]);

    useEffect(() => {
    if (!contentType) return;
  
    // Keep only the fields for the selected content type
    const newFormData = {};
    fieldMap[contentType]?.forEach((field) => {
      if (formData[field]) newFormData[field] = formData[field];
    });
  
    setFormData(newFormData);
  
  }, [contentType]);


    const submitForm=async(id,channel,region,date,file)=>{
      try{   
             console.log(time.start,time.end,id,contentType,formData);
             const res=await axios.post(`${api}/forms`,{id:id,start:time.start,end:time.end,content:contentType,form:formData,channel:channel,city:region,date:date,audio:file,role:"QA"})
              if(res)
              {
                    console.log(res.data);
                    setRecords(res.data);
                    setEditModalOpen(false);
                    setIsModalOpen(false);


                   setToast("Metadata submitted successfully!");
                   setTimeout(() => setToast(null), 3000);
          
              }
      }
      catch(err)
      {
         console.log(err);
      }
  }

  const handleVerify = async (id) => {
  try {
    const res = await axios.get(`${api}/verifydata`, { params: { id } });
    if (res.status === 200) {
      console.log("verified", res.data);

      // Update current modal segment to QA
      setSelectedSegment((prev) =>
        prev && prev.id === id ? { ...prev, createdBy: "QA" } : prev
      );

       setRecords((prevRecords) =>
        prevRecords.map((seg) =>
          seg.id === id ? { ...seg, createdBy: "QA" } : seg
        )
      );

    }
  } catch (err) {
    console.log(err);
  }
};


  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full">
      <RefreshCcwDot className="w-5 h-5 text-purple-600" onClick={handleRecords}/>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-sm">24-Hour Timeline Grid</h3>
        <span className="text-xs text-red-600 border border-red-300 px-2 py-0.5 rounded-full">
         {data.length}{" "}Total Fingerprint Matches
        </span>
      </div>   
        <div className="flex justify-center items-center gap-8 mb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Start Hour</p>
                <input
                  type="number"
                  defaultValue="0"
                  min="0"
                  max="23"
                  onChange={(e) => setStart(Number(e.target.value))}
                  onKeyDown={(e) => e.preventDefault()}
                  className="border border-gray-400 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-20 text-center"
                />
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">End Hour</p>
                <input
                  type="number"
                  defaultValue="0"
                   min={start + 1 || 1}
                   max={24}
                  onChange={(e) => setEnd(Number(e.target.value))}
                  onKeyDown={(e) => e.preventDefault()}
                  className="border border-gray-400 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-20 text-center"
                />
              </div>
            </div>

        
      {/* Top Timeline */}
      <div className="overflow-x-auto">
        <div className="flex">
          {filteredIntervals.map((time, idx) => (
            <div
              key={idx}
              className="min-w-[500px] h-6 flex items-center justify-center text-[10px] text-gray-600 border-r border-gray-200"
            >
              {time}
            </div>
          ))}
        </div>
          
        {/* Bottom Data Bar */}
    <div className="relative flex">
    {filteredIntervals.map((slotStart, idx) => {
    const [sh, sm] = slotStart.split(":").map(Number);
    const slotStartSec = sh * 3600 + sm * 60;
    const slotEndSec = slotStartSec + 15 * 60;

    // ✅ Pick green blocks overlapping this slot
    const slotBlocks = dataBlocks.filter((block) => {
      const startSec = timeToSeconds(block.start);
      const endSec = timeToSeconds(block.end);
      return startSec < slotEndSec && endSec > slotStartSec;
    });

    // ✅ Compute gaps for this slot
    const gaps = [];
    const sortedBlocks = [...slotBlocks].sort(
      (a, b) => timeToSeconds(a.start) - timeToSeconds(b.start)
    );

    // 1. Gap before the first block (inside this slot)
    if (sortedBlocks.length > 0 && timeToSeconds(sortedBlocks[0].start) > slotStartSec) {
      gaps.push({
        start: slotStartSec,
        end: timeToSeconds(sortedBlocks[0].start),
      });
    }

    // 2. Gaps between blocks
    for (let i = 0; i < sortedBlocks.length - 1; i++) {
      const currEnd = timeToSeconds(sortedBlocks[i].end);
      const nextStart = timeToSeconds(sortedBlocks[i + 1].start);
      if (currEnd < nextStart) {
        gaps.push({ start: currEnd, end: nextStart });
      }
    }

    // 3. Gap after last block (inside this slot)
    if (
      sortedBlocks.length > 0 &&
      timeToSeconds(sortedBlocks[sortedBlocks.length - 1].end) < slotEndSec
    ) {
      gaps.push({
        start: timeToSeconds(sortedBlocks[sortedBlocks.length - 1].end),
        end: slotEndSec,
      });
    }

    // 4. If slot has NO blocks at all, whole slot is grey
    if (sortedBlocks.length === 0) {
      gaps.push({ start: slotStartSec, end: slotEndSec });
    }
  allGapsTemp.push(...gaps);
  const startHour = Number(starts.split(":")[0]); // e.g., 06 → 6
  const startSlotIndex = startHour * 4; // each hour has 4 slots of 15 min
  allStartsGapLength = (startSlotIndex - allGapsTemp.length);


    return (
      <div
        key={idx}
        className="relative min-w-[500px] h-20 border-r border-gray-200 bg-gray-100 cursor-pointer"
      >
        {/* ✅ Grey Gaps */}
        {gaps.map((gap, i) => {
          const slotDurationSec = slotEndSec - slotStartSec;
          const slotWidthPx = 500;

          const leftPx = ((gap.start - slotStartSec) / slotDurationSec) * slotWidthPx;
          const widthPx = ((gap.end - gap.start) / slotDurationSec) * slotWidthPx;

          return (
            <div
              key={`gap-${i}`}
              className="absolute top-0 h-full bg-gray-400 opacity-60 cursor-pointer"
              title="Unlabeled"
              style={{
                left: `${leftPx}px`,
                width: `${Math.max(widthPx, 2)}px`,
              }}
              onClick={(e) => {
                e.stopPropagation(); // prevent slot click
                handleGreyBlock(gap); // 🔥 pass gap details
              }}
            />
          );
        })}

        {/* ✅ Green Blocks */}
        {slotBlocks.map((block, i) => {
          const startSec = timeToSeconds(block.start);
          const endSec = timeToSeconds(block.end);

          const blockStartSec = Math.max(startSec, slotStartSec);
          const blockEndSec = Math.min(endSec, slotEndSec);

          const slotDurationSec = slotEndSec - slotStartSec;
          const slotWidthPx = 500;

          const leftPx =
            ((blockStartSec - slotStartSec) / slotDurationSec) * slotWidthPx;
          const widthPx =
            ((blockEndSec - blockStartSec) / slotDurationSec) * slotWidthPx;
            // console.log(block);
            const color={
              new:"bg-blue-500",
              annotator:"bg-yellow-500",
              QA:"bg-green-500"
            }
            

          return (
            <div
            key={`block-${i}`}
            className={`absolute top-0 h-full ${color[block.createdBy]} text-white text-[10px] flex items-center justify-center rounded-sm`}
            style={{
              left: `${leftPx}px`,
              width: `${Math.max(widthPx, 2)}px`,
            }}
           title={
              block.createdBy === "Annotator"
                ? "Annotator"
                : block.createdBy === "new"
                ? "Autolabelled"
                : block.createdBy
            }
            onClick={(e) => {
              e.stopPropagation();
              handleBarClick(block);
            }}
          >
            {block.label}
          </div>
          );
        })}
      </div>
    );
  })}
</div>
</div>
 <div className="flex gap-4 justify-end mt-6 text-sm">
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded"></span>Autolabeled</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-500 rounded"></span>Annotator</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded"></span>QA</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-500 rounded"></span>Unlabeled</div>
      </div>
        <div className="flex items-center gap-6 mb-4 mt-4">
            {/* Matching Segments */}
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                <span className="text-sm text-gray-700 font-medium">Matching Segments</span>
            </div>

            {/* No Content */}
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-300 rounded-sm"></div>
                <span className="text-sm text-gray-700 font-medium" 
                >No Content</span>
            </div>
            </div>
        <h4 className="flex items-center gap-2 font-medium text-green-700 mb-2">
          ✅ Matching Segments ({data.length})
        </h4>
          {/* <h4 className="flex items-center gap-2 font-medium text-green-700 mb-2">
          ❌ UnMatched Segments ({-allStartsGapLength})
        </h4> */}
       
        {isModalOpen && selectedSegment && (
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
          onClick={() => {
            setIsModalOpen(false);
            setFiles("");
            localStorage.removeItem("selectedSegment");
          }}
          className="text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <X size={22} />
        </button>
      </div>
        <p className="text-sm text-gray-500 px-6 mb-4 text-left pt-2 ">
          Detailed information for segment at {selectedSegment.start}
        </p>

        {/* Segment Overview */}
        <div className="border rounded-lg mx-6 mb-4 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-orange-500">⚠️</span>
            <h3 className="font-semibold">Segment Overview</h3>
          </div>
          <div className="grid grid-cols-3 gap-y-2">
            <p><strong>Channel:</strong>{selectedSegment.channel}</p>
            <p><strong>Region:</strong> {selectedSegment.region}</p>
            <p>
              <strong>Type:</strong>{" "}
              <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                {selectedSegment.type}
              </span>
            </p>
            {/* <p>
              <strong>Confidence:</strong>{" "}
              <span className="text-green-600">75%</span>
            </p> */}
            <p><strong>Start Time:</strong> {selectedSegment.start}</p>
            <p><strong>End Time:</strong> {selectedSegment.end}</p>
          </div>
        </div>

        {/* Content Details */}
        <div className="border rounded-lg mx-6 mb-4 p-4">
          <h3 className="font-semibold mb-2">Content Details</h3>
          <div>
            <p><strong>Program:</strong> {selectedSegment.program || "-"}</p>
          </div>
        </div>

        {/* Analysis Information */}
        <div className="border rounded-lg mx-6 mb-6 p-4">
          <h3 className="font-semibold mb-2">Analysis Information</h3>
          <div className="grid grid-cols-2">
            <p><strong>Detection Method:</strong><span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">{selectedSegment.createdBy==="new"?"AUTOLABELED":selectedSegment.createdBy.toUpperCase()}</span></p>
            <p><strong>Clip ID:</strong> {selectedSegment.id}</p>
          </div>
        </div>
       {selectedSegment.comments!=="-" && 
      <div className="border rounded-lg mx-6 mb-6 p-4">
            <p><strong>Comments:</strong>{" "}{selectedSegment.comments.toUpperCase()}</p>
          </div>}
        {files &&  <div className="mt-4 flex justify-center mb-4">
          <audio 
            ref={audioRef} 
            src={files} 
            controls 
            className="w-full max-w-md"
          />
          </div>
          }

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50">
          <button
            className={`px-4 py-2 rounded border ${
            selectedSegment.createdBy === "QA"
              ? "bg-green-500 text-white border-green-500"
              : "border-gray-300 hover:bg-gray-300"
          }`}
            onClick={()=>handleVerify(selectedSegment.id)}
          >
          {selectedSegment.createdBy === "QA" ? "Verified" : "Verify"}
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded flex items-center gap-2 hover:bg-gray-100">
            <Play size={16} className="text-blue-500" onClick={()=>handleAudio(selectedSegment.start,selectedSegment.end)}/>
            Play Audio
          </button>
          <button onClick={() => {
                 setEditFormData(selectedSegment); // pre-fill with segment data
                 setEditModalOpen(true);
                 handleAudio(selectedSegment.start,selectedSegment.end)
                  }}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
            Request Changes
          </button>
      </div>
    </div>
   
  </div>
    )}
{editModalOpen && 
       <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
             <Draggable nodeRef={nodeRef} handle=".drag-handle" bounds="parent">
           <div ref={nodeRef}className=" bg-white rounded-2xl shadow-xl p-6 w-full max-w-xl relative max-h-[90vh] overflow-y-auto">
             {/* Close Button */}
             <button
               onClick={() =>setEditModalOpen(false)}
               className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
             >
               <X />
             </button>
       
             <h2 className="drag-handle text-xl font-semibold mb-4 text-center cursor-grab">Add New Clip</h2>
               <div className="mb-4 grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                <div>
                <label className="block text-gray-600 text-xs mb-1">Channel</label>
                <input
                  type="text"
                  value={editFormData.channel}
                  onChange={(e) => setEditFormData({ ...editFormData, station: e.target.value })}
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
             <div>
           <label className="block text-gray-600 text-xs mb-1">Region</label>
           <input
             type="text"
             value={editFormData.region}
             onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
             className="border rounded px-2 py-1 w-full"
           />
         </div>
       
         <div>
           <label className="block text-gray-600 text-xs mb-1">Start Time</label>
           <input
             type="text"
             value={editFormData.start}
             onChange={(e) => setTime({ ...time, start: e.target.value })}
             className="border rounded px-2 py-1 w-full"
           />
         </div>
       
         <div>
           <label className="block text-gray-600 text-xs mb-1">End Time</label>
           <input
             type="text"
             value={editFormData.end}
             onChange={(e) => setTime({ ...time, end: e.target.value })}
             className="border rounded px-2 py-1 w-full"
           />
         </div>
       
         <div className="col-span-2">
           <label className="block text-gray-600 text-xs mb-1">Date</label>
           <input
             type="text"
             value={new Date(editFormData.date).toLocaleDateString()}
             className="border rounded px-2 py-1 w-full"
           />
         </div>
       </div>
             {/* Audio Player */}
           {loading? 
               <div className="flex justify-center items-center">
                       <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
                       </div> :
               <div className="mt-4 flex justify-center mb-4"> 
                 <audio 
                   src={files} 
                   controls 
                   className="w-full max-w-md"
                 />
                 </div>}
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
               {contentType && (
                 <div className='flex justify-end'>
                  <button
                   type="submit"
                   className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-700 mt-2 col-span-full"
                   onClick={()=>submitForm(editFormData.id,editFormData.channel,editFormData.region,new Date(editFormData.date).toLocaleDateString(),files)}
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

{/* 
         <EditModal open={editModalOpen}
         setOpen={setEditModalOpen}
         editFormData={editFormData}
         setEditFormData={setEditFormData}
         audio={files}
         onSave={() => console.log("Saved:", editFormData)}/>

            {
              greyblock && <UnlabelledData open={greyblock} setOpen={setGreyBlock} slotStart={slotStart} slotEnd={slotEnd} audio={file}/>
            } */}
    
      </div>
  );
} 