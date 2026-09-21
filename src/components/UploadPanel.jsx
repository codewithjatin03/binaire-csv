import React, { useState } from "react";
import { socket, uploadFile } from "../socket.js";
import FileCard from "./FileCard.jsx";

export default function UploadPanel({ clientId, myUploads, setMyUploads }) {

  const [staged, setStaged] = useState([]);

  function addFiles(fileList) {
    const newOnes = Array.from(fileList).map((file) => ({
      localId: `local_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      file,
      priority: "low",
    }));
    setStaged((prev) => [...prev, ...newOnes]);
  }

  function setPriorityFor(localId, priority) {
    setStaged((prev) => prev.map((s) => (s.localId === localId ? { ...s, priority } : s)));
  }

  function removeStaged(localId) {
    setStaged((prev) => prev.filter((s) => s.localId !== localId));
  }

  async function handleUploadAll() {
    const toUpload = [...staged].sort((a, b) => {
      if (a.priority === "high" && b.priority !== "high") return -1;
      if (a.priority !== "high" && b.priority === "high") return 1;
      return 0;
    });

    setStaged([]);

    for (const item of toUpload) {
      const tempId = `temp_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 6)}`;

      setMyUploads((prev) => {
        const updated = [
          {
            id: tempId,
            originalName: item.file.name,
            status: "uploading",
            priority: item.priority,
          },
          ...prev,
        ];

        return updated.sort((a, b) => {
          if (a.priority === "high" && b.priority !== "high") return -1;
          if (a.priority !== "high" && b.priority === "high") return 1;
          return 0;
        });
      });

      socket.emit("file:uploading", {
        clientId,
        tempId,
        name: item.file.name,
      });

      try {
        const { jobId } = await uploadFile(
          item.file,
          item.priority,
          clientId
        );

        setMyUploads((prev) =>
          prev
            .map((j) =>
              j.id === tempId
                ? {
                  ...j,
                  id: jobId,
                  status: "uploaded",
                }
                : j
            )
            .sort((a, b) => {
              if (a.priority === "high" && b.priority !== "high") return -1;
              if (a.priority !== "high" && b.priority === "high") return 1;
              return 0;
            })
        );
      } catch (err) {
        setMyUploads((prev) =>
          prev.map((j) =>
            j.id === tempId
              ? {
                ...j,
                status: "failed",
                error: err.message,
              }
              : j
          )
        );
      }
    }
  }

  return (
    <div className="bg-card border border-line rounded-xl p-5">

      <label className="block border-1 border-line rounded-lg p-7 text-center text-sm cursor-pointer text-gray-500 transition-colors">
        Click to choose CSV files
        <input
          type="file"
          accept=".csv"
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files.length) addFiles(e.target.files); e.target.value = ""; }}
        />
      </label>

      {staged.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {staged.map((item) => (
            <div key={item.localId} className="bg-gray-400 border border-line rounded-lg p-3 flex items-center justify-between gap-2">
              <span className="text-sm truncate text-white font-semibold  max-w-[140px]">{item.file.name}</span>
              <div className="flex items-center gap-1.5">
                <select
                  value={item.priority}
                  onChange={(e) => setPriorityFor(item.localId, e.target.value)}
                  className=" border border-line rounded text-xs px-2 py-1 bg-white"
                >
                  <option value="low">Low</option>
                  <option value="high">High</option>
                </select>
                <button onClick={() => removeStaged(item.localId)} className="text-red-800 font-semibold hover:text-coral text-xs">
                  ✕
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={handleUploadAll}
            className="mt-1 w-full py-2.5 border cursor-pointer rounded-lg bg-teal text-[#08201d] font-semibold text-sm hover:opacity-90 transition"
          >
            Upload {staged.length} file{staged.length > 1 ? "s" : ""}
          </button>
        </div>
      )}

      {myUploads.length > 0 && (
        <div className="flex flex-col gap-2.5 mt-4">
          {myUploads.slice(0, 6).map((job) => (
            <FileCard key={job.id} job={job} mine />
          ))}
        </div>
      )}
    </div>
  );
}