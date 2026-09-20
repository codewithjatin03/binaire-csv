import React, { useEffect, useState } from "react";
import { socket, getClientId } from "./socket.js";
import UploadPanel from "./components/UploadPanel.jsx";
import QueueBoard from "./components/QueueBoard.jsx";


export default function App() {
  const [clientId] = useState(getClientId);
  const [connected, setConnected] = useState(socket.connected);
  const [snapshot, setSnapshot] = useState({ jobs: [], poolSize: 0, idleWorkers: 0, pendingHigh: 0, pendingLow: 0 });
  const [myUploads, setMyUploads] = useState([]);

  useEffect(() => {
    socket.on("queue:update", (snap) => setSnapshot(snap));

    socket.on("job:progress", ({ jobId, percent }) => {
      setSnapshot((prev) => ({
        ...prev,
        jobs: prev.jobs.map((j) =>
          j.id === jobId ? { ...j, progress: percent, status: "processing" } : j
        ),
      }));
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("queue:update");
      socket.off("job:progress");
    };
  }, []);

  useEffect(() => {
    const knownIds = new Set(snapshot.jobs.map((j) => j.id));
    setMyUploads((prev) => prev.filter((j) => !knownIds.has(j.id)));
  }, [snapshot]);

  const merged = { ...snapshot, jobs: [...myUploads, ...snapshot.jobs] };

  return (
    <div className="min-h-screen ">
      <div className="max-w-5xl mx-auto px-6 py-7">
        <div className="flex justify-between  items-baseline border-b border-line pb-4 mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-5xl font-semibold">Binaire</h1>
            <h1 className="text-2xl text-gray-600 font-semibold">CSV file Analyzer</h1>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-5">
          <UploadPanel clientId={clientId} myUploads={myUploads} setMyUploads={setMyUploads} />
          <QueueBoard snapshot={merged} clientId={clientId} />
        </div>
      </div>
    </div>
  );
}