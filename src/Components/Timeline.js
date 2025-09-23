import React,{useState,useRef, useEffect} from "react";
import { Info, Play, X, RefreshCcwDot} from "lucide-react";
import EditModal from "./EditModal";
import axios from "axios";
import UnlabelledData from "./UnlabelledData";


export default function Timeline({audio,starts,data,date,city,station}) {
const allGapsTemp = [];
let allStartsGapLength="";
const typeColors = {
  jingle: "bg-yellow-300",
  program: "bg-blue-300",
  advertisement: "bg-red-300",
  song: "bg-green-300",
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

  // Generate 15-min intervals
  const intervals = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      intervals.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
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

 const dataBlocks = records.map(seg => ({
  ...seg, // keep all properties
  label: seg.program.charAt(0) + "..." // short label for the bar
}));

const handleBarClick = (segment) => {
  setSelectedSegment(segment);
  setIsModalOpen(true);
};
  
    const timeToSeconds = (time) => {
    const [h, m, s = 0] = time.split(":").map(Number); // default s=0
  return h * 3600 + m * 60 + s;
  };
const handleAudio = async(start, end) => {
  console.log(audio);
  console.log(starts);
  console.log(start,end);
  try{
    const response = await axios.get("http://localhost:3001/clips", {
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
    const response = await axios.get("http://localhost:3001/clips", {
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
        const res=await axios.get('http://localhost:3001/app/getlabel',{
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

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full">
      <RefreshCcwDot className="w-5 h-5 text-purple-600" onClick={handleRecords}/>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-sm">24-Hour Timeline Grid</h3>
        <span className="text-xs text-red-600 border border-red-300 px-2 py-0.5 rounded-full">
         {data.length}{" "}Total Fingerprint Matches
        </span>
      </div>

      {/* Top Timeline */}
      <div className="overflow-x-auto">
        <div className="flex">
          {intervals.map((time, idx) => (
            <div
              key={idx}
              className="min-w-[240px] h-6 flex items-center justify-center text-[10px] text-gray-600 border-r border-gray-200"
            >
              {time}
            </div>
          ))}
        </div>
          
        {/* Bottom Data Bar */}
        <div className="relative flex">
    {intervals.map((slotStart, idx) => {
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
        className="relative min-w-[240px] h-20 border-r border-gray-200 bg-gray-100 cursor-pointer"
      >
        {/* ✅ Grey Gaps */}
        {gaps.map((gap, i) => {
          const slotDurationSec = slotEndSec - slotStartSec;
          const slotWidthPx = 240;

          const leftPx = ((gap.start - slotStartSec) / slotDurationSec) * slotWidthPx;
          const widthPx = ((gap.end - gap.start) / slotDurationSec) * slotWidthPx;

          return (
            <div
              key={`gap-${i}`}
              className="absolute top-0 h-full bg-gray-400 opacity-60 cursor-pointer"
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
          const slotWidthPx = 240;

          const leftPx =
            ((blockStartSec - slotStartSec) / slotDurationSec) * slotWidthPx;
          const widthPx =
            ((blockEndSec - blockStartSec) / slotDurationSec) * slotWidthPx;
            // console.log(block);

          return (
            <div
              key={`block-${i}`}
              className="absolute top-0 h-full bg-green-500 text-white text-[10px] flex items-center justify-center rounded-sm"
              style={{
                left: `${leftPx}px`,
                width: `${Math.max(widthPx, 2)}px`,
              }}
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
            <p>
              <strong>Confidence:</strong>{" "}
              <span className="text-green-600">75%</span>
            </p>
            <p><strong>Start Time:</strong> {selectedSegment.start}</p>
            <p><strong>End Time:</strong> {selectedSegment.end}</p>
          </div>
        </div>

        {/* Content Details */}
        <div className="border rounded-lg mx-6 mb-4 p-4">
          <h3 className="font-semibold mb-2">Content Details</h3>
          <div className="grid grid-cols-2">
            <p><strong>Program:</strong> {selectedSegment.program || "-"}</p>
          </div>
        </div>

        {/* Analysis Information */}
        <div className="border rounded-lg mx-6 mb-6 p-4">
          <h3 className="font-semibold mb-2">Analysis Information</h3>
          <div className="grid grid-cols-2">
            <p><strong>Detection Method:</strong>Autolabelled</p>
            <p><strong>Clip ID:</strong> {selectedSegment.id}</p>
          </div>
        </div>
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
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-300"
          >
           Save
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded flex items-center gap-2 hover:bg-gray-100">
            <Play size={16} className="text-blue-500" onClick={()=>handleAudio(selectedSegment.start,selectedSegment.end)}/>
            Play Audio
          </button>
          <button onClick={() => {
                 setEditFormData(selectedSegment); // pre-fill with segment data
                 setEditModalOpen(true);
                  }}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
            Request Changes
          </button>
      </div>
    </div>
   
  </div>
    )}
         <EditModal open={editModalOpen}
         setOpen={setEditModalOpen}
         editFormData={editFormData}
         setEditFormData={setEditFormData}
         audio={files}
         onSave={() => console.log("Saved:", editFormData)}/>

            {
              greyblock && <UnlabelledData open={greyblock} setOpen={setGreyBlock} slotStart={slotStart} slotEnd={slotEnd} audio={file}/>
            }
    
      </div>
  );
}
