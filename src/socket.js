import { io } from "socket.io-client";

export const SERVER_URL = "https://binaire-server.onrender.com";
export const socket = io(SERVER_URL, { autoConnect: true });

export function getClientId() {
  let id = sessionStorage.getItem("binaire_client_id");
  if (!id) {
    id = `client_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem("binaire_client_id", id);
  }
  return id;
}

export async function uploadFile(file, priority, clientId) {
  const form = new FormData();
  form.append("file", file);
  form.append("priority", priority);
  form.append("clientId", clientId);

  const res = await fetch(`${SERVER_URL}/api/upload`, { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data;
}

export function downloadUrl(jobId) {
  return `${SERVER_URL}/api/download/${jobId}`;
}
