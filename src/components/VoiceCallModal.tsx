"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Phone, PhoneOff, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  userId: string;
  role: "STUDENT" | "ADMIN";
  peerId?: string;
  peerName?: string;
};

export function VoiceCallModal({
  open,
  onClose,
  userId,
  role,
  peerId,
  peerName,
}: Props) {
  const [status, setStatus] = useState<
    "idle" | "calling" | "ringing" | "connected" | "ended"
  >("idle");
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState("");
  const localStream = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<import("socket.io-client").Socket | null>(null);
  const remoteAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function setup() {
      try {
        const { io } = await import("socket.io-client");
        const socket = io({ path: "/api/socketio" });
        socketRef.current = socket;
        socket.emit("join", { userId, role });

        socket.on(
          "call:incoming",
          async (payload: { from: string; offer: RTCSessionDescriptionInit }) => {
            setStatus("ringing");
            await ensurePc();
            await pcRef.current!.setRemoteDescription(payload.offer);
          }
        );

        socket.on(
          "call:answer",
          async (payload: { answer: RTCSessionDescriptionInit }) => {
            await pcRef.current?.setRemoteDescription(payload.answer);
            setStatus("connected");
          }
        );

        socket.on(
          "call:ice",
          async (payload: { candidate: RTCIceCandidateInit }) => {
            try {
              await pcRef.current?.addIceCandidate(payload.candidate);
            } catch {
              /* ignore */
            }
          }
        );

        socket.on("call:ended", () => {
          cleanup();
          setStatus("ended");
        });

        if (!cancelled && role === "STUDENT") {
          await startCall();
        }
      } catch {
        setError(
          "Voice signaling unavailable. Run `npm run dev:socket` for WebRTC."
        );
      }
    }

    setup();

    return () => {
      cancelled = true;
      cleanup();
      socketRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function ensurePc() {
    if (pcRef.current) return pcRef.current;
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcRef.current = pc;

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current?.emit("call:ice", {
          to: peerId || "admin",
          candidate: e.candidate,
        });
      }
    };

    pc.ontrack = (e) => {
      if (remoteAudio.current) {
        remoteAudio.current.srcObject = e.streams[0];
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStream.current = stream;
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    return pc;
  }

  async function startCall() {
    setStatus("calling");
    setError("");
    try {
      const pc = await ensurePc();
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current?.emit("call:offer", {
        to: peerId || "admin",
        from: userId,
        offer,
      });
    } catch {
      setError("Microphone permission denied or unavailable.");
      setStatus("idle");
    }
  }

  async function acceptCall() {
    try {
      const pc = await ensurePc();
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketRef.current?.emit("call:answer", {
        to: peerId,
        answer,
      });
      setStatus("connected");
    } catch {
      setError("Could not answer call.");
    }
  }

  function toggleMute() {
    const track = localStream.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMuted(!track.enabled);
    }
  }

  function hangUp() {
    socketRef.current?.emit("call:ended", { to: peerId || "admin" });
    cleanup();
    setStatus("ended");
    onClose();
  }

  function cleanup() {
    localStream.current?.getTracks().forEach((t) => t.stop());
    localStream.current = null;
    pcRef.current?.close();
    pcRef.current = null;
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="card-surface relative w-full max-w-sm p-6 text-center">
        <button
          type="button"
          onClick={hangUp}
          className="absolute right-3 top-3 text-muted hover:text-ink"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-trace/40 bg-trace/10 text-trace animate-glow">
          <Phone className="h-8 w-8" />
        </div>
        <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl font-bold">
          Voice call
        </h3>
        <p className="mt-1 text-sm text-muted">
          {peerName || (role === "STUDENT" ? "Instructor" : "Student")}
        </p>
        <p className="mt-4 text-sm capitalize text-trace">{status}</p>
        {error && <p className="mt-2 text-xs text-danger">{error}</p>}

        <audio ref={remoteAudio} autoPlay playsInline />

        <div className="mt-8 flex items-center justify-center gap-4">
          {status === "ringing" && role === "ADMIN" && (
            <button
              type="button"
              onClick={acceptCall}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-trace text-bg"
            >
              <Phone className="h-5 w-5" />
            </button>
          )}
          {status === "idle" && role === "ADMIN" && peerId && (
            <button
              type="button"
              onClick={startCall}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-trace text-bg"
            >
              <Phone className="h-5 w-5" />
            </button>
          )}
          <button
            type="button"
            onClick={toggleMute}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-elevated"
          >
            {muted ? (
              <MicOff className="h-5 w-5 text-danger" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>
          <button
            type="button"
            onClick={hangUp}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-danger text-white"
          >
            <PhoneOff className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-6 text-xs text-muted">
          Browser-to-browser WebRTC — your phone number stays private.
        </p>
      </div>
    </div>
  );
}
