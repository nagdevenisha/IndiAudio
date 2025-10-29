import { useState ,useRef} from "react";
import { Eye, Radio, ArrowLeft,X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";
import axios from "axios";



//  const api="http://localhost:3001/data";

const api=process.env.REACT_APP_API+"/data";

const LabeledData = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [open, setOpen] = useState(false);
  const[files,setFiles]=useState([]);
  const[segment,seTsegment]=useState([]);
  const[hourId,setHourId]=useState(0);
  const[url,setUrl]=useState('');
  const[data,setData]=useState({});
  const[duration,setDuration]=useState(0);
  const[allFiles,setAllFiles]=useState([])

  const[id,setId]=useState(0);
  const filesPerPage = 5; // number of audio files per page


  const containerRef = useRef(null);
  const wavesurferRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  const location=useLocation();
  useEffect(()=>{
       setFiles(location.state.data);
       setAllFiles(location.state.data); 
  },[])



  const allItems = files.flatMap(parent =>
  parent.items.map(item => ({
    ...item,
    indexId: parent.indexId,
    labeledBy: parent.labeledBy,
    verifiedBy: parent.verifiedBy,
    created:parent.date
  }))
);

  // Filter based on search
  const filteredFiles = allItems.filter(
  (file) =>
    file.region.toLowerCase().includes(search.toLowerCase()) ||
    file.channel.toLowerCase().includes(search.toLowerCase()) ||
    file.date.toLowerCase().includes(search.toLowerCase())
);



  // Group by audioTaskId + channel + date
const groupedFiles = filteredFiles.reduce((acc, file) => {
  const key = file.indexId;
  if (!acc[key]) {
    acc[key] = {
      id: file.indexId,
      channel: file.channel,
      city:file.region,
      date: new Date(file.date).toLocaleString(),
      total: 0,
      ads: 0,
      jingles: 0,
      songs: 0,         
      programs: 0,
      created:file.created,
      labeledBy:[file.labeledBy],
      verifiedBy:file.verifiedBy
    };
  }
  

  acc[key].total++;

  switch (file.type) {
    case "advertisement":
      acc[key].ads++;
      break;
    case "jingle":
      acc[key].jingles++;
      break;
    case "song":
      acc[key].songs++;
      break;
    case "program":
      acc[key].programs++;
      break;
    default:
      break;
  }

  return acc;
}, {});

// Convert object → array
const summaryData = Object.values(groupedFiles);
// Pagination calculations
  const totalPages = Math.ceil(summaryData.length / filesPerPage);
  const startIndex = (currentPage - 1) * filesPerPage;
  const endIndex = startIndex + filesPerPage;
  const currentFiles = summaryData.slice(startIndex, endIndex);


const typeColors = {
  advertisement: "#f87171",      // red
  song: "#60a5fa",    // blue
  program: "#34d399", // green
  jingle: "#facc15",  // yellow
};


  const intervals = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      intervals.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }

const [currentTime, setCurrentTime] = useState("00:00:00");
 useEffect(() => {
  if ( files.length === 0 || !hourId) return;

  const handleAudio = async () => {

    try {
      // Since all entries under same audioTaskId share the same audioUrl,
      // we can just take the first match.
      const parts = hourId.split("_");
      const city = parts[0];             // karnal
      const date = parts[1];             // 2025-07-01
      const station = parts[2]; 
      const bucketName = "radio-clip-studio-audio";
      const capitalizedCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
      const fileKey = `${capitalizedCity}/${station}/${date}merged.mp3`;
      const audioUrl = `https://${bucketName}.s3.ap-south-1.amazonaws.com/${fileKey}`;
      console.log(audioUrl);
      

      console.log(audioUrl);

      if (!audioUrl) {
        console.error("No audioUrl found for this audioTaskId");
        return;
      }

      // Fetch signed URL from backend
      const res = await axios.get(
        `${api}/download?key=${encodeURIComponent(audioUrl)}`
      );
      console.log(res.data);
      setUrl(res.data.url); // store signed URL for wavesurfer
    } catch (err) {
      console.error("Error fetching signed URL:", err);
    }
  };

  handleAudio();
}, [hourId, files]);
 


const toSeconds = (timeStr) => {
  const [hh, mm, ss] = timeStr.split(":").map(Number);
  return hh * 3600 + mm * 60 + ss;
};

// Get relative seconds for region
const parseRelativeTime = (labelTime, baseTime) => {
  return toSeconds(labelTime) - toSeconds(baseTime);
};

useEffect(() => {
  if (!open || !containerRef.current || !url) return;

  // Create plugin instance
  const regionsPlugin = RegionsPlugin.create({ dragSelection: false });

  const ws = WaveSurfer.create({
    container: containerRef.current,
    waveColor: "#a78bfa",
    progressColor: "#7c3aed",
    barWidth: 2,
    height: 150,
    plugins: [regionsPlugin], // attach plugin
    backend: "MediaElement",
  });
  
  console.log(url);
  ws.load(url).catch((err) => {
    if (err.name !== "AbortError") {
      console.error("WaveSurfer load failed:", err);
    }
  });

ws.on("ready", () => {
  
  const dura = ws.getDuration(); // in seconds
  console.log("Audio duration:", duration);
   const formatTime = (secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, "0");
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0");
    const s = Math.floor(secs % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  setDuration(formatTime(dura));
  if (segment.length > 0) {
    // take the first entry as base audio start
    console.log(segment[0].start)
    const audioStartTime = segment[0].start;

    segment.forEach((f) => {
      const start = parseRelativeTime(f.start, audioStartTime);
      const end = parseRelativeTime(f.end, audioStartTime);

      if (start >= 0 && end > start) {
        regionsPlugin.addRegion({
          start,
          end,
          color: typeColors[f.type] + "55",
          drag: false,
          resize: false,
        });
      }
    });
  }

  ws.on("audioprocess", (time) => {
     if (segment.length > 0) {
    const audioStartTime = toSeconds(segment[0].start); // segment start in seconds
    const displayTime = audioStartTime + time;           // relative to absolute audio
    setCurrentTime(formatTime(displayTime));
  } else {
    setCurrentTime(formatTime(time));
  }
  });

  setIsReady(true);
});

  wavesurferRef.current = ws;
  return () => ws.destroy();
}, [url, open]);


const handlePop = (channel,city,date,seg,hourId) => {
  setOpen(true);

  console.log(seg);
  setData(seg);

  // Get all files for this group
 const datePart = date.split(",")[0]; // "01/07/2025" from "01/07/2025, 05:30:00"

  // Convert DD/MM/YYYY → YYYY-MM-DD
  const [dd, mm, yyyy] = datePart.split("/");
  const formattedDate = `${yyyy}-${mm}-${dd}`;

  const unique = `${city}_${formattedDate}_${channel}`;
  setHourId(unique);
  console.log(unique);
  console.log(filteredFiles)
 const groupedFiles = filteredFiles
  .filter(f => unique === f.indexId)
  .sort((a, b) => {
    const toSeconds = (time) => {
      const [hh, mm, ss] = time.split(":").map(Number);
      return hh * 3600 + mm * 60 + ss;
    };

    // Compare by start time first
    const startDiff = toSeconds(a.start) - toSeconds(b.start);
    if (startDiff !== 0) return startDiff;

    // If start times are equal, compare by end time
    return toSeconds(a.end) - toSeconds(b.end);
  });


  console.log("All files for this indexId:", groupedFiles);

  // Save all files in segment
  seTsegment( groupedFiles);
  setId(hourId);
};


const handleByDate = (dateStr) => {
  if (!dateStr) {
    setFiles(allFiles); // reset if empty
    return;
  }

  const filtered = allFiles.flatMap(parent => {
    const parts = parent.indexId.split("_");
    const datePart = parts[1];
    console.log(datePart); // now logs every time

    if (datePart === dateStr) {
      return [{
        ...parent,
        items: parent.items
      }];
    }
    return [];
  });

  setFiles(filtered);
};


  return (
    <div className="p-6">
      {/* Back to Dashboard */}
      <button
        className="flex items-center text-purple-600 hover:underline mb-4"
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
      </button>

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-purple-600">Labeled Data</h1>
        <p className="text-gray-600">Hourly audio files with labels and annotations</p>
      </div>

      {/* Search Box */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h2 className="font-semibold text-lg mb-2">Search Audio Files</h2>
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
          <input
            type="text"
            placeholder="Search by station, city..."
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // reset to first page when searching
            }}
          />
          <input
            type="date"
            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            onChange={(e)=>handleByDate(e.target.value)}
          />
        </div>
      </div>

      {/* Audio Files Table */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="flex items-center text-lg font-semibold mb-4">
          <Radio className="w-5 h-5 mr-2 text-purple-600" /> Hourly Audio Files (
           {summaryData.length})
        </h2>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="p-3">Hour ID</th>
              <th className="p-3">City</th>
              <th className="p-3">Station</th>
              <th className="p-3">Date</th>
              <th className="p-3">Total Labels</th>
              <th className="p-3">Ads</th>
              <th className="p-3">Jingles</th>
              <th className="p-3">Songs</th>
              <th className="p-3">Programs</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentFiles.map((file, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="p-5 font-semibold">{String(idx + 1).padStart(3, "0")}</td>
                 <td className="p-5 text-gray-600">{file.city.toUpperCase()}</td>
                <td className="p-5 flex items-center">
                  <Radio className="w-4 h-4 text-purple-600 mr-2" />
                 {/* <img
                      className="rounded-full w-6 h-6"
                      src="/Images/radioCity.avif" alt="radio"
                    /> */}

                   {file.channel.toUpperCase()}
                </td>
                <td className="p-5 text-gray-600">{file.date}</td>
                <td className="p-5">
                  <span className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700">{file.total}</span>
                </td>
                <td className="p-5">
                  <span className="px-3 py-1 rounded-full text-sm bg-red-500 text-white"> {file.ads}</span>
                </td>
                <td className="p-5">
                  <span className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700"> {file.jingles}</span>
                </td>
                <td className="p-5">
                  <span className="px-3 py-1 rounded-full text-sm bg-purple-500 text-white"> {file.songs}</span>
                </td>
                <td className="p-5">
                  <span className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700"> {file.programs}</span>
                </td>
                <td className="p-5 text-right">
                  <div className="flex justify-end"> <button className="flex items-center bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md text-sm" onClick={()=>handlePop(file.channel,file.city,file.date,file,String(idx + 1).padStart(3, "0"))}>
                     <Eye className="w-4 h-4 mr-1" /> View Details </button></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
            <button
                className={`px-4 py-2 rounded-md border ${
                currentPage === 1 ? "text-gray-400 border-gray-300" : "text-purple-600 border-purple-600"
                }`}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
            >
                Previous
            </button>

            <div className="flex space-x-2">
                {(() => {
                const pageNumbers = [];
                const maxVisible = 1; // number of pages before & after current
                const totalVisible = maxVisible * 2 + 1;

                if (totalPages <= totalVisible + 2) {
                    // If few pages, show all
                    for (let i = 1; i <= totalPages; i++) {
                    pageNumbers.push(i);
                    }
                } else {
                    // Always include first page
                    pageNumbers.push(1);

                    if (currentPage > maxVisible + 2) {
                    pageNumbers.push("...");
                    }

                    for (
                    let i = Math.max(2, currentPage - maxVisible);
                    i <= Math.min(totalPages - 1, currentPage + maxVisible);
                    i++
                    ) {
                    pageNumbers.push(i);
                    }

                    if (currentPage < totalPages - (maxVisible + 1)) {
                    pageNumbers.push("...");
                    }

                    // Always include last page
                    pageNumbers.push(totalPages);
                }

                return pageNumbers.map((page, idx) =>
                    page === "..." ? (
                    <span key={idx} className="px-3 py-1 text-gray-500">
                        ...
                    </span>
                    ) : (
                    <button
                        key={idx}
                        className={`px-3 py-1 rounded-md border ${
                        currentPage === page
                            ? "bg-purple-600 text-white border-purple-600"
                            : "text-gray-600 border-gray-300"
                        }`}
                        onClick={() => setCurrentPage(page)}
                    >
                        {page}
                    </button>
                    )
                );
                })()}
            </div>

            <button
                className={`px-4 py-2 rounded-md border ${
                currentPage === totalPages
                    ? "text-gray-400 border-gray-300"
                    : "text-purple-600 border-purple-600"
                }`}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
            >
                Next
            </button>
            </div>
      </div>

       {open && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
    <div className="bg-white rounded-xl shadow-lg w-80% max-w-6xl max-h-[70vh] p-6 overflow-y-auto flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-3 top-0 bg-white z-10">
        <h2 className="text-lg font-semibold">Audio Details - {id}</h2>
        <button 
          onClick={() => {setOpen(false);setCurrentTime("00:00:00")}} 
          className="text-gray-600 hover:text-red-500"
        >
          <X size={20} />
        </button>
      </div>

      {/* Audio Player Section */}
      <div className="p-4 border rounded-lg bg-gray-50">
        <h3 className="text-md font-semibold mb-2">▶ Audio Player</h3>
        <div className="flex gap-2 mb-3 overflow-x-auto">
         <div className="overflow-x-auto w-full border rounded-md">
          <div ref={containerRef} style={{ width: "4000px", height: "150px" }} />
        </div>
        </div>

        {/* Fake Audio Controls */}
        <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
          <div className="flex items-center gap-2">
            <button className="p-2 border rounded-full" onClick={() => wavesurferRef.current?.playPause()}>▶</button>
            <span>{currentTime}</span>
          </div>
          <span>🔊</span>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-2 text-sm">
          <span className="flex items-center gap-1 text-red-400">⬤ Ads</span>
          <span className="flex items-center gap-1 text-blue-400">⬤ Songs</span>
          <span className="flex items-center gap-1 text-yellow-400">⬤ Jingles</span>
          <span className="flex items-center gap-1 text-green-400">⬤ Programs</span>
        </div>
      </div>

      {/* Metadata Section */}
      <div className="p-4 border rounded-lg bg-gray-50 w-full">
        <h3 className="text-md font-semibold mb-2">Metadata</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <p><b>City:</b> {data.city?.toUpperCase() || "N/A"}</p>
          <p><b>Station:</b> {data.channel.toUpperCase() || "N/A"}</p>
          <p><b>Total Duration:</b>{duration}</p>
          <p><b>Total Labels:</b> {data.total}</p>
          <p><b>Labeled By:</b> {data.labeledBy?.length > 0 ? data.labeledBy.join(", ") : "N/A"}</p>
          <p><b>Verified By:</b> 
            {data.verifiedBy}
          </p>
          <p><b>Created At:</b> {data.created?data.created:"N/A"}</p>

        </div>
      </div>

      {/* Labels Table */}
     {/* Labels Table */}
<div className="p-4 border rounded-lg bg-gray-50 w-full">
  <h3 className="text-md font-semibold mb-4">Labels in this Hour</h3>
  <div className="overflow-x-auto">
    <table className="min-w-full border-collapse text-sm">
      <thead>
        <tr className="bg-gray-100 text-left">
          <th className="p-3 font-medium text-gray-700 border-b">#</th>
          <th className="p-3 font-medium text-gray-700 border-b">Type</th>
          <th className="p-3 font-medium text-gray-700 border-b">Title / Details</th>
          <th className="p-3 font-medium text-gray-700 border-b">Start</th>
          <th className="p-3 font-medium text-gray-700 border-b">End</th>
        </tr>
      </thead>
      <tbody>
         {segment
          .map((label, idx) => (
            <tr key={label.id} className="hover:bg-gray-50">
              <td className="p-3 border-b">{idx + 1}</td>
              <td className="p-3 border-b">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    label.type === "advertisement"
                      ? "bg-red-400 text-white"
                      : label.type === "song"
                      ? "bg-blue-400 text-white"
                      : label.type === "program"
                      ? "bg-green-400 text-gray-700"
                      : label.type === "jingle"
                      ? "bg-yellow-400 text-gray-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {label.type === "advertisement"
                    ? "Ad"
                    : label.type}
                </span>
              </td>
              <td className="p-3 border-b">
                {label.program}
              </td>
              <td className="p-3 border-b">{label.start}</td>
              <td className="p-3 border-b">{label.end}</td>
            </tr>
          ))}
      </tbody>
    </table>
  </div>
</div>
   </div>
  </div>
)}

</div>
  );
};

export default LabeledData;
