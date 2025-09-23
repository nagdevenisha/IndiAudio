import { useState } from "react";
import { ChevronDown, ChevronUp, AlertCircle, Volume2 } from "lucide-react";

import EditModal from "./EditModal";



const Segment = ({ segment }) => {
  const [open, setOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});


  return (
    <div>
      
    <div className="bg-gray-50 rounded-xl mb-3 shadow-sm border">
      {/* Collapsed Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center space-x-3">
          {segment.type === "advertisement" ? (
            <AlertCircle className="text-orange-500" size={18} />
          ) : (
            <Volume2 className="text-blue-500" size={18} />
          )}
          <div>
            <p className="font-semibold">
              {segment.start} - {segment.end}
            </p>
            <p className="text-sm text-gray-500">{segment.label}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
            {segment.status}
          </span>
          <span className="text-gray-700 text-sm font-medium">
            {segment.confidence}%
          </span>
          <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs">
            Fingerprint
          </span>
          {open ? (
            <ChevronUp size={18} className="text-gray-500" />
          ) : (
            <ChevronDown size={18} className="text-gray-500" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {open && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 border-t bg-white text-left">
          {/* JSON Data */}
          <div>
            <h3 className="font-semibold mb-2">Auto-Labeling Data (JSON)</h3>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto ml-10">
              {JSON.stringify(segment, null, 2)}
            </pre>
          </div>

          {/* Content Details */}
          <div>
            <h3 className="font-semibold mb-2">Content Details</h3>
            <p>Type: {segment.type}</p>
            <p>Confidence: {segment.confidence}%</p>
            <p>Campaign: {segment.campaign}</p>
            <p>Advertiser: {segment.advertiser}</p>

            {/* <h3 className="font-semibold mt-4 mb-1">Review Notes</h3>
            <p className="text-gray-500 text-sm">No review notes yet...</p> */}

            <div className="flex space-x-3 mt-4">
              <button className="px-4 py-1 rounded bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100" onClick={() => {
                  localStorage.setItem("selectedSegment", JSON.stringify(segment));
                  window.dispatchEvent(new Event("segmentSelected")); // custom event
                }}>
                Review
              </button>
              <button  onClick={() => {
                 setEditFormData(segment); // pre-fill with segment data
                 setEditModalOpen(true);
                  }}
                className="px-4 py-1 rounded bg-yellow-50 text-yellow-600 border border-yellow-200 hover:bg-yellow-100">
                Request Changes
              </button>
              <button className="px-4 py-1 rounded bg-green-50 text-green-600 border border-green-200 hover:bg-green-100">
                Verify Segment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    <EditModal open={editModalOpen}
      setOpen={setEditModalOpen}
      editFormData={editFormData}
      setEditFormData={setEditFormData}
      onSave={() => console.log("Saved:", editFormData)}/>
    </div>
  )}

// Example usage:
export default function SegmentList() {
  const segments = [
    {
      clip_id: "Ad_1",
      start: "08:15:30",
      end: "08:16:00",
      label: "Brand XYZ Product Launch",
      type: "advertisement",
      status: "auto-labelled",
      confidence: 98.5,
      campaign: "Summer Sale 2025",
      advertiser: "Brand XYZ Corp",
      fingerprint_match: true
    },
    {
      clip_id: "Song_1",
      start: "08:16:00",
      end: "08:19:30",
      label: "Bollywood Hit Song",
      type: "music",
      status: "auto-labelled",
      confidence: 99.1,
      campaign: "Summer Sale 2025",
      advertiser: "Brand XYZ Corp",
      fingerprint_match: true
    }
  ];

  return (
    <div>
      <h2 className="font-semibold text-lg mb-4 flex items-center mt-6">
        <span role="img" aria-label="search" className="mr-2">🔍</span>
        Detailed Segment Analysis
      </h2>
      {segments.map((s, i) => (
        <Segment key={i} segment={s} />
      ))}
    </div>
  );
}
