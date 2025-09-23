import { useState, useEffect } from "react";
import { Radio, ArrowLeft, Eye } from "lucide-react";
import summaryJson from "../User/summary.json";

const filesPerPage = 10;

const LabeledData = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState("2025-07-01");
  const [files, setFiles] = useState([]);

  // Filter by selected date
  useEffect(() => {
    const filtered = summaryJson.filter((file) => file.date === selectedDate);
    setFiles(filtered);
    setCurrentPage(1);
  }, [selectedDate]);

  // Filter by search
  const filteredFiles = files.filter((file) =>
    file.station.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredFiles.length / filesPerPage);
  const startIndex = (currentPage - 1) * filesPerPage;
  const endIndex = startIndex + filesPerPage;
  const currentFiles = filteredFiles.slice(startIndex, endIndex);

  return (
    <div className="p-6">
      <button
        className="flex items-center text-purple-600 hover:underline mb-4"
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-purple-600">Labeled Data</h1>
        <p className="text-gray-600">Hourly audio files with labels and annotations</p>
      </div>

      {/* Search and Date Picker */}
      <div className="bg-white shadow rounded-lg p-4 mb-6 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
        <input
          type="text"
          placeholder="Search by station..."
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
        <input
          type="date"
          className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="flex items-center text-lg font-semibold mb-4">
          <Radio className="w-5 h-5 mr-2 text-purple-600" /> Hourly Audio Files ({filteredFiles.length})
        </h2>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="p-3">Hour ID</th>
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
              <tr key={file.id} className="border-b hover:bg-gray-50">
                <td className="p-5 font-semibold">{String(idx + 1).padStart(3, "0")}</td>
                <td className="p-5 flex items-center">
                  <Radio className="w-4 h-4 text-purple-600 mr-2" /> {file.station}
                </td>
                <td className="p-5 text-gray-600">{file.date}</td>
                <td className="p-5">
                  <span className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700">{file.total}</span>
                </td>
                <td className="p-5">
                  <span className="px-3 py-1 rounded-full text-sm bg-red-500 text-white">{file.adsCount}</span>
                </td>
                <td className="p-5">
                  <span className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700">{file.jingleCount}</span>
                </td>
                <td className="p-5">
                  <span className="px-3 py-1 rounded-full text-sm bg-purple-500 text-white">{file.songCount}</span>
                </td>
                <td className="p-5">
                  <span className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700">{file.programCount}</span>
                </td>
                <td className="p-5 flex justify-end">
                  <button className="flex items-center bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md text-sm">
                    <Eye className="w-4 h-4 mr-1" /> View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-end mt-4 space-x-2">
            <button
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Prev
            </button>
            <span className="px-2 py-1">{currentPage} / {totalPages}</span>
            <button
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabeledData;
