import React, { useEffect, useState } from "react";
import FileCard from "./FileCard.jsx";
import { SERVER_URL } from "../socket.js";

export default function QueueBoard({ snapshot, clientId }) {
  const jobs = [...(snapshot?.jobs || [])].reverse();

  // NAYA: purani completed files store karne ke liye state
  const [pastFiles, setPastFiles] = useState([]);
  const [loadingPast, setLoadingPast] = useState(true);

  useEffect(() => {
    const data = async () => {
      try {
        const fetchData = await fetch(`${SERVER_URL}/api/outputs`, {
          method: "GET",
        });
        const jsonPars = await fetchData.json();
        console.log(jsonPars);
        setPastFiles(jsonPars.files || []); // <-- YE LINE MISSING THI, isse state set hota hai
      } catch (err) {
        console.error("Failed to load past outputs:", err);
      } finally {
        setLoadingPast(false);
      }
    };
    data();
  }, []);

  return (
    <div className="bg-card border border-line rounded-xl p-5">
      {/* LIVE queue - naya upload turant yahan dikhega, upar */}
      <h2 className="text-sm text-gray-400 mb-4">Live queue </h2>

      <div className="flex flex-col gap-2.5">
        {jobs.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-10">Empty</p>
        )}
        {jobs.map((job) => (
          <FileCard key={job.id} job={job} mine={job.clientId === clientId} />
        ))}
      </div>

      {/* PAST files - nichay hamesha wahi rahenge, live data se disturb nahi honge */}
      <div className="mt-6 pt-5 border-t border-line">
        <h2 className="text-sm text-gray-400 mb-4">Previously completed files ({pastFiles.length})</h2>

        {loadingPast && <p className="text-gray-500 text-sm">Loading…</p>}

        {!loadingPast && pastFiles.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-6">No past files found</p>
        )}

        <div className="flex flex-col gap-2">
          {pastFiles.map((file) => (
            <div
              key={file.jobId}
              className=" border border-line rounded-lg p-3 flex justify-between items-center text-xs"
            >
              <div>
                <div className="font-medium">{file.originalName}</div>
                <div className="text-gray-500 font-mono mt-1">
                  sum = {file.sum} · {file.rows}×{file.cols}
                </div>
              </div>
              <a
                className="text-teal hover:underline font-mono"
                href={`${SERVER_URL}${file.downloadUrl}`}
              >
                ↓ download
              </a>
            </div>
          ))}
        </div>
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