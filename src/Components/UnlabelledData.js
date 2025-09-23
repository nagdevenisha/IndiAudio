import { useState,useRef } from "react";
import axios from 'axios';


function UnlabelledData({greyblock,setOpen,slotStart,slotEnd,audio}) {
       // const api="https://backend-fj48.onrender.com";
  const api="http://localhost:3001";
      const [formData, setFormData] = useState({
      channel: "",
      date: "",
      start: slotStart,
      end: slotEnd,
      program: "",
      region: "",
      type: "",
      id: generateItemId(),
      audio:audio
    });
  const modalRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [modalPos, setModalPos] = useState({ x: 0, y: 0 });

  function generateItemId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomStr = '';
  for (let i = 0; i < 8; i++) { // 8 characters
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ITEM-${randomStr}`;
}
  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = modalRef.current.getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setModalPos({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name,value)
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

 const saveForm=async()=>{
     try{
          console.log(formData);
          const res=await axios.post(`${api}/app/savedata`,{formData});
          if(res.status===200)
          {
             alert('Label Done!!');
             setOpen(false);
          }
     }
     catch(err)
     {
       console.log(err);
     }
 }


  return (
    <div>
      
   <div
        className="fixed inset-0 bg-black/50 z-50"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div
          ref={modalRef}
          className="bg-white p-6 rounded-xl w-96 cursor-default absolute"
          style={{ left: modalPos.x, top: modalPos.y }}
        >
          <div
            className="modal-header flex justify-between items-center mb-4 cursor-move"
            onMouseDown={handleMouseDown}
          >
            <h2 className="text-lg font-bold">Add/Edit Item</h2>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              name="channel"
              placeholder="Channel"
              value={formData.channel}
              onChange={handleChange}
              className="border px-3 py-2 rounded"
            />
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="border px-3 py-2 rounded"
            />
            <input
              type="time"
              name="start"
              value={formData.start}
              onChange={handleChange}
              step={1}
              className="border px-3 py-2 rounded"
            />
            <input
              type="time"
              name="end"
              value={formData.end}
              onChange={handleChange}
              step={1}
              className="border px-3 py-2 rounded"
            />
            <input
              type="text"
              name="program"
              placeholder="Program"
              value={formData.program}
              onChange={handleChange}
              className="border px-3 py-2 rounded"
            />
            <input
              type="text"
              name="region"
              placeholder="Region"
              value={formData.region}
              onChange={handleChange}
              className="border px-3 py-2 rounded"
            />
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="border px-3 py-2 rounded"
            >
              <option value="">Select Type</option>
              <option value="advertisement">Advertisement</option>
              <option value="program">Program</option>
              <option value="jingle">Jingle</option>
            </select>
            <audio src={audio} 
            controls 
            className="w-full max-w-md"></audio>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setOpen(false)} className="px-4 py-2 border rounded">
              Cancel
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded" onClick={saveForm}>Save</button>
          </div>
        </div>
      </div>
      </div>
  )
}

export default UnlabelledData;
