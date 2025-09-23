
import { Edit, CheckCircle2 } from "lucide-react";

const adjustTime = (time, seconds) => {
  const [h, m, s] = time.split(":").map(Number);
  let totalSeconds = h * 3600 + m * 60 + s + seconds;
  if (totalSeconds < 0) totalSeconds = 0;

  const newH = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const newM = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const newS = String(totalSeconds % 60).padStart(2, "0");

  return `${newH}:${newM}:${newS}`;
};

export default function EditModal({ open, setOpen, editFormData, setEditFormData, onSave,audio }) {
  if (!open) return null;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Edit className="w-5 h-5 text-indigo-600" />
            Request Changes - Edit Details
          </h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Make necessary changes to the segment details and add review notes
        </p>

        {/* Body */}
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          {/* Basic Info */}
          <div className="border rounded-xl p-4 ">
            <h3 className="font-medium mb-3">Basic Information</h3>
            <div className="space-y-3 ">
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Label / Title"
                value={editFormData.program || ""}
                onChange={(e) => setEditFormData({ ...editFormData, label: e.target.value })}
              />
              <div className="grid grid-cols-3 gap-3">
                <select
                  className="border rounded-lg px-3 py-2"
                  value={editFormData.type || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                >
                  <option value="">Select type</option>
                  <option value="music">Song</option>
                  <option value="advertisement">Advertisement</option>
                  <option value="talk">Program</option>
                  <option value="promo">Jingle</option>
                </select>
                <input
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Region"
                value={editFormData.region || ""}
                onChange={(e) => setEditFormData({ ...editFormData, label: e.target.value })}
              />
                {/* <select
                  className="border rounded-lg px-3 py-2"
                  value={editFormData.status || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                >
                  <option value="">Select status</option>
                  <option value="auto_labeled">Auto Labeled</option>
                  <option value="needs_review">Needs Review</option>
                  <option value="manually_labeled">Manually Labeled</option>
                  <option value="rejected">Rejected</option>
                </select> */}
                <input
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Region"
                value={editFormData.channel || ""}
                onChange={(e) => setEditFormData({ ...editFormData, label: e.target.value })}
              />
              </div>
            </div>
          </div>

          {/* Advertisement Details */}
          {editFormData.type === "advertisement" && (
            <div className="border rounded-xl p-4">
              <h3 className="font-medium mb-3">Advertisement Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  className="border rounded-lg px-3 py-2"
                  placeholder="Campaign"
                  value={editFormData.campaign || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, campaign: e.target.value })}
                />
                <input
                  type="text"
                  className="border rounded-lg px-3 py-2"
                  placeholder="Advertiser"
                  value={editFormData.advertiser || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, advertiser: e.target.value })}
                />
              </div>
            </div>
          )}
          {/* Time Adjustment */}
          <div className="border rounded-xl p-4">
            <h3 className="font-medium mb-3">Time Adjustment</h3>
            {["start", "end"].map((field) => (
              <div key={field} className="mb-4">
                <p className="mb-1 text-sm font-medium">
                  {field === "start" ? "Start Time" : "End Time"}
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="border rounded-lg px-3 py-2 w-32"
                    value={editFormData[field] || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, [field]: e.target.value })
                    }
                  />
                  {[-10, -2, -1, 1, 2, 10].map((sec) => (
                    <button
                      key={sec}
                      className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
                      onClick={() =>
                        setEditFormData({
                          ...editFormData,
                          [field]: adjustTime(editFormData[field], sec),
                        })
                      }
                    >
                      {sec > 0 ? `+${sec}s` : `${sec}s`}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
       <div className="flex flex-col items-center w-full">
          {/* Audio Player */}
          <div className="w-full max-w-md mt-4">
            <audio src={audio} controls className="w-full"></audio>
          </div>
        </div>
        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2 rounded-lg border hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-orange-500 text-white flex items-center gap-2 hover:bg-orange-600"
            onClick={() => {
              onSave();
              setOpen(false);
            }}
          >
            <CheckCircle2 className="w-4 h-4" />
            Save Changes & Submit
          </button>
        </div>
      </div>
    </div>
  );
}
