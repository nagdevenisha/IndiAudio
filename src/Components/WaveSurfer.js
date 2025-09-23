import  { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js"
import {SkipBack, SkipForward} from 'lucide-react';

export default function AudioWaveform({audio,start,end}) {
  const containerRef = useRef(null);
  const wavesurferRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
 
  const timeToSeconds = (timeStr) => {
  const parts = timeStr.split(":").map(Number);
  return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
};
const startOffset = timeToSeconds(start);
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

 const [currentTime, setCurrentTime] = useState(formatTime(timeToSeconds(start)));
  useEffect(() => {
    if (!containerRef.current) return;
    // Create WaveSurfer
    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#a78bfa",
      progressColor: "#7c3aed",
      cursorColor: "#1e293b",
      barWidth: 2,
      height: 150,
      backend: "MediaElement", 
      mediaControls: false, 
    });
  console.log(audio);
    const fakePeaks = new Array(2000).fill(0).map(() => Math.random() * 2 - 1);
    // Important: wait a tick before loading (fix AbortError)
     if (audio) {
      ws.load(audio,fakePeaks);
    }

    ws.on("ready", () => {
      console.log("✅ Waveform loaded");
      setIsReady(true);
      ws.setTime(0); // start of audio file
      setCurrentTime(formatTime(startOffset));
    });

      ws.on("audioprocess", (time) => {
      setCurrentTime(formatTime(time+startOffset));
    });
    // when seeking, also update time immediately
    ws.on("seek", (progress) => {
      const duration = ws.getDuration();
      setCurrentTime(formatTime(progress * duration+startOffset));
    });

    wavesurferRef.current = ws;

    return () => ws.destroy();
  }, [audio]);

  return (
    <div  className=" bg-white p-6 rounded-2xl shadow-md mb-6">
    <div className="w-full mx-auto p-6">
      <div
        ref={containerRef}
        className="w-full h-[150px] bg-gray-100 rounded-md"
      />

      {!isReady && (
        <p className="text-sm text-gray-500 mt-2">Loading waveform...</p>
      )}

      <div className="flex gap-3 mt-4 flex justify-center">
        <button
          onClick={() => wavesurferRef.current?.playPause()}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg"
        >
          Play / Pause
        </button>
        <button
          onClick={() => wavesurferRef.current?.stop()}
          className="px-4 py-2 bg-gray-200 rounded-lg flex justify-center"
        >
          Restart
        </button>
      </div>
    </div>
    <h3 className="font-semibold text-gray-800 flex justify-center">
              24-Hour Interactive Timeline Grid
            </h3>
            <p className="text-sm text-gray-500 mb-4 flex justify-center">
              Current Position: {currentTime}
            </p>
    
            {/* Buttons */}
            <div className="flex justify-center flex-wrap gap-2">
              <button
                className="flex items-center gap-1 border px-3 py-1 rounded-lg hover:bg-gray-100"
                onClick={() => handleSkip(-10)}
              >
                <SkipBack size={16} /> -10s
              </button>
              <button
                className="flex items-center gap-1 border px-3 py-1 rounded-lg hover:bg-gray-100"
                onClick={() => handleSkip(-2)}
              >
                <SkipBack size={16} /> -2s
              </button>
              <button
                className="border px-3 py-1 rounded-lg hover:bg-gray-100"
                onClick={() => handleSkip(-1)}
              >
                -1s
              </button>
              <button className="border px-3 py-1 rounded-lg bg-purple-100 text-purple-800">
                {currentTime}
              </button>
              <button
                className="border px-3 py-1 rounded-lg hover:bg-gray-100"
                onClick={() => handleSkip(1)}
              >
                +1s
              </button>
              <button
                className="flex items-center gap-1 border px-3 py-1 rounded-lg hover:bg-gray-100"
                onClick={() => handleSkip(2)}
              >
                <SkipForward size={16} /> +2s
              </button>
              <button
                className="flex items-center gap-1 border px-3 py-1 rounded-lg hover:bg-gray-100"
                onClick={() => handleSkip(10)}
              >
                <SkipForward size={16} /> +10s
              </button>
            </div>
            </div>
           
  );
}
