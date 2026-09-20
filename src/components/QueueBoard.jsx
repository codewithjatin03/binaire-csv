import React from "react";
import FileCard from "./FileCard.jsx";

export default function QueueBoard({ snapshot, clientId }) {
  const jobs = [...(snapshot?.jobs || [])].reverse();

  return (
    <div className="bg-card border border-line rounded-xl p-5">
      <h2 className="text-sm text-gray-400 mb-4">Live queue </h2>

      <div className="flex flex-col gap-2.5">
        {jobs.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-10">Empty</p>
        )}
        {jobs.map((job) => (
          <FileCard key={job.id} job={job} mine={job.clientId === clientId} />
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="bg-[#161b25] border border-line rounded-lg px-3 py-2">
      <div className="text-[10px] font-mono text-gray-500">{label}</div>
      <div className={`text-lg font-mono font-semibold ${color || "text-white"}`}>{value}</div>
    </div>
  );
}