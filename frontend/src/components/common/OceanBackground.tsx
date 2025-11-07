import { useEffect, useState } from "react";

interface OceanBackgroundProps {
  isDark?: boolean;
}

const OceanBackground = ({ isDark = false }: OceanBackgroundProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Background wrapper */}
      <div
        className={`fixed inset-0 -z-10 transition-all duration-1000 ${
          isDark ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Dark mode - Deep Ocean Theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d3d56] to-[#115e67]">
          {/* Animated waves overlay */}
          <div className="absolute inset-0 opacity-30">
            <div className="ocean-wave-dark absolute top-0 left-0 w-full h-full bg-gradient-to-br from-teal-400/20 via-cyan-500/10 to-blue-500/20"></div>
          </div>

          {/* Large glowing orbs */}
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-radial from-teal-400/30 via-teal-500/10 to-transparent rounded-full filter blur-3xl ocean-float"></div>
          <div className="absolute bottom-[-15%] left-[-10%] w-[700px] h-[700px] bg-gradient-radial from-cyan-400/25 via-blue-500/10 to-transparent rounded-full filter blur-3xl ocean-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-radial from-emerald-400/15 via-teal-500/5 to-transparent rounded-full filter blur-3xl ocean-pulse-slow"></div>

          {/* Sparkle effects */}
          <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-cyan-300 rounded-full ocean-sparkle"></div>
          <div
            className="absolute top-2/3 right-1/4 w-2 h-2 bg-teal-300 rounded-full ocean-sparkle"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/4 w-2 h-2 bg-blue-300 rounded-full ocean-sparkle"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute bottom-1/4 right-2/3 w-2 h-2 bg-emerald-300 rounded-full ocean-sparkle"
            style={{ animationDelay: "1.5s" }}
          ></div>

          {/* Mesh gradient overlay */}
          <div className="absolute inset-0 opacity-40 bg-gradient-to-t from-teal-900/20 via-transparent to-blue-900/20"></div>
        </div>
      </div>

      <div
        className={`fixed inset-0 -z-10 transition-all duration-1000 ${
          isDark ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* Light mode - Fresh Ocean Breeze */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 opacity-50">
            <div className="ocean-wave-light absolute inset-0 bg-gradient-to-br from-teal-200/30 via-cyan-200/20 to-blue-200/30"></div>
          </div>

          {/* Soft glowing orbs */}
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-radial from-teal-300/40 via-teal-200/20 to-transparent rounded-full filter blur-3xl ocean-float"></div>
          <div className="absolute bottom-[-15%] left-[-10%] w-[700px] h-[700px] bg-gradient-radial from-cyan-300/35 via-blue-200/15 to-transparent rounded-full filter blur-3xl ocean-float-delayed"></div>
          <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-gradient-radial from-emerald-200/30 via-teal-200/10 to-transparent rounded-full filter blur-3xl ocean-pulse-slow"></div>

          {/* Light sparkles */}
          <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-white/80 rounded-full ocean-sparkle shadow-lg shadow-teal-300/50"></div>
          <div
            className="absolute top-2/3 left-1/4 w-2 h-2 bg-white/70 rounded-full ocean-sparkle shadow-lg shadow-cyan-300/50"
            style={{ animationDelay: "1.2s" }}
          ></div>
          <div
            className="absolute top-1/2 right-1/4 w-3 h-3 bg-white/80 rounded-full ocean-sparkle shadow-lg shadow-blue-300/50"
            style={{ animationDelay: "2.5s" }}
          ></div>
          <div
            className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-white/70 rounded-full ocean-sparkle shadow-lg shadow-emerald-300/50"
            style={{ animationDelay: "0.8s" }}
          ></div>

          {/* Mesh gradient overlay */}
          <div className="absolute inset-0 opacity-30 bg-gradient-to-t from-teal-100/40 via-transparent to-blue-100/30"></div>
        </div>
      </div>
    </>
  );
};

export default OceanBackground;
