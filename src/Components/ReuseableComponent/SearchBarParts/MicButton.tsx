import type { MicButtonProps, MicIconProps } from "@/types/search";
const MicIcon = ({ size = 22, isListening }: MicIconProps) => (
  <>
    <style>{`
      @keyframes slowBlink {
        0% { color: #1D9E75;  }
        50% { color: #f97316;  }
        100% { color: #1D9E75;  }
      }
      .mic-listening {
        animation: slowBlink 2s infinite ease-in-out;
      }
    `}</style>
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={isListening ? "currentColor" : "#52525b"}
      className={isListening ? "mic-listening" : ""}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  </>
);

// Voice-search toggle. Declared at module scope (it used to be defined inside
// SearchBar's render, which remounted both buttons on every keystroke).
export default function MicButton({ className, isListening, onClick, micRef }: MicButtonProps) {
  return (
    <button
      ref={micRef}
      onClick={onClick}
      className={`${className} cursor-pointer active:scale-95 transition-transform`}
      style={{ pointerEvents: "auto" }}
      aria-label={isListening ? "Stop voice input" : "Start voice input"}
      title={isListening ? "Stop voice input" : "Start voice input"}
    >
      <MicIcon size={22} isListening={isListening} />
    </button>
  );
}
