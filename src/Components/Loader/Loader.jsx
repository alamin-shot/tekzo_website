import React from "react";

export default function Loader() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        backdropFilter: "blur(5px)",
        WebkitBackdropFilter: "blur(5px)",
        zIndex: 1000,
      }}
    >
      <div style={{ position: "relative" }}>
        {/* Spinning rings loader */}
        <div style={{ position: "relative", width: "120px", height: "120px" }}>
          {/* Outer ring */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              border: "6px solid transparent",
              borderTopColor: "#18AC8F",
              borderRightColor: "#18AC8F",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>

          {/* Middle ring */}
          <div
            style={{
              position: "absolute",
              inset: "10px",
              border: "6px solid transparent",
              borderBottomColor: "#f79904",
              borderLeftColor: "#f79904",
              borderRadius: "50%",
              animation: "spinReverse 1.5s linear infinite",
            }}
          ></div>

          {/* Inner ring */}
          <div
            style={{
              position: "absolute",
              inset: "20px",
              border: "5px solid transparent",
              borderTopColor: "#18AC8F",
              borderRadius: "50%",
              animation: "spin 2s linear infinite",
            }}
          ></div>

          {/* Center pulsing dot */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "16px",
                height: "16px",
                background: "linear-gradient(135deg, #18AC8F 0%, #f79904 100%)",
                borderRadius: "50%",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            ></div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes spinReverse {
          to {
            transform: rotate(-360deg);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.7;
          }
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  );
}
