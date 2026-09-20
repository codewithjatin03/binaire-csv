import React from "react";
import { downloadUrl } from "../socket.js";

const STATUS_LABEL = {
  uploading: "Uploading…",
  uploaded: "Uploaded",
  queued: "Added to queue",
  waiting: "Waiting to process",
  processing: "Processing…",
  completed: "Completed",
  failed: "Failed",
};

const STATUS_COLOR = {
  uploading: "bg-gray-700 text-gray-300",
  uploaded: "bg-gray-700 text-gray-300",
  queued: "bg-violet/20 text-violet",
  waiting: "bg-amber/20 text-amber",
  processing: "bg-amber/20 text-amber",
  completed: "bg-teal/20 text-teal",
  failed: "bg-coral/20 text-coral",
};

export default function FileCard({ job, mine }) {
  const showProgress = job.status === "processing" || job.status === "completed";
  const progress = job.status === "completed" ? 100 : job.progress || 0;
  console.log(progress)
  return (
    <div className=" border border-line rounded-lg p-4 animate-[rise_.3s_ease]">
      <div className="flex justify-between items-start gap-3">
        <div>
          <div className="font-medium text-sm truncate max-w-[220px]">
            {job.originalName || job.name}
          </div>
          <div className="flex gap-2 text-[11px] text-gray-500 font-mono mt-1">
            <span>{mine ? "you" : job.clientId}</span>
            {job.processId && <span className={job.status === "processing" ? "animate-pulse" : ""}>{job.processId}</span>}
            {job.aged && <span className="text-amber">aged ↑</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {job.priority && (
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              job.priority === "high" ? "border-coral/40 text-coral" : "border-violet/40 text-violet"
            }`}>
              {job.priority}
            </span>
          )}
          <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${STATUS_COLOR[job.status]}`}>
            {STATUS_LABEL[job.status] || job.status}
            {job.status === "processing" ? ` ${progress}%` : ""}
          </span>
        </div>
      </div>

      {showProgress && (
        <div className="h-1.5 rounded mt-3 overflow-hidden">
          <div
            className="h-full bg-yellow-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {job.status === "completed" && job.result && (
        <div className="flex justify-between items-center mt-3 text-xs font-mono">
          <span className="text-gray-400">
            Sum = <b className="text-teal">{job.result.sum}</b> · {job.result.rows}×{job.result.cols}
          </span>
          <a className="text-teal hover:underline" href={downloadUrl(job.id)}>↓ download</a>
        </div>
      )}

      {job.status === "failed" && (
        <div className="mt-3 text-xs text-coral">{job.error}</div>
      )}
    </div>
  );
}