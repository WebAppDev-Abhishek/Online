export function PcbBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="pcb-grid absolute inset-0 opacity-80" />
      <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-trace/10 blur-3xl animate-glow" />
      <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl animate-glow" />
      <svg
        className="absolute inset-0 h-full w-full opacity-35"
        viewBox="0 0 1200 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          className="animate-trace"
          d="M40 120 H280 V240 H520 V160 H760 V320 H980 V200 H1160"
          stroke="#0a2540"
          strokeWidth="2"
          strokeLinecap="square"
        />
        <path
          className="animate-trace"
          style={{ animationDelay: "0.4s" }}
          d="M80 480 H220 V360 H440 V520 H680 V400 H900 V560 H1120"
          stroke="#163a5f"
          strokeWidth="2"
          strokeLinecap="square"
        />
        <path
          className="animate-trace"
          style={{ animationDelay: "0.8s" }}
          d="M160 80 V200 H340 V420 H560 V280 H820"
          stroke="#1e3a5f"
          strokeWidth="1.5"
          strokeLinecap="square"
        />
        <circle cx="280" cy="120" r="5" fill="#0a2540" className="animate-glow" />
        <circle cx="520" cy="240" r="5" fill="#163a5f" className="animate-glow" />
        <circle cx="760" cy="160" r="5" fill="#1e3a5f" className="animate-glow" />
        <circle cx="440" cy="360" r="5" fill="#0a2540" className="animate-glow" />
        <rect
          x="500"
          y="300"
          width="48"
          height="28"
          rx="2"
          stroke="#0a2540"
          strokeWidth="1.5"
          fill="#ffffff"
        />
        <rect
          x="860"
          y="380"
          width="64"
          height="36"
          rx="2"
          stroke="#163a5f"
          strokeWidth="1.5"
          fill="#ffffff"
        />
      </svg>
    </div>
  );
}
