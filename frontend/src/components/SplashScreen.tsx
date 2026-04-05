import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Road = ({ d, glow, opacity = 1 }: { d: string; glow: boolean; opacity?: number }) => (
  <g opacity={opacity}>
    {/* Asphalt Base with inner shadow effect */}
    <path d={d} stroke="#090b14" strokeWidth="24" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} stroke="#1E293B" strokeWidth="18" fill="none" strokeLinecap="round" strokeLinejoin="round" />

    {/* Edges */}
    <path d={d} stroke="#334155" strokeWidth="20" fill="none" strokeDasharray="1 0" opacity="0.5" strokeLinecap="round" strokeLinejoin="round" />

    {/* Center dashed traffic line */}
    <path d={d} stroke={glow ? "#00F5D4" : "#5BC0EB"} strokeWidth="2" fill="none" strokeDasharray="15 25" filter={glow ? "url(#glow)" : "none"} opacity="0.8" strokeLinecap="round" strokeLinejoin="round" />

    {/* Additional traffic particles simulation if glowing */}
    {glow && <path d={d} stroke="#ffffff" strokeWidth="3" fill="none" strokeDasharray="0 50 10 40" filter="url(#glow)" opacity="0.9" strokeLinecap="round" strokeLinejoin="round" />}
  </g>
);

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    // Reveal scan success effect just after the scanner line passes
    const scanTimer = setTimeout(() => {
      setScanned(true);
    }, 7500);

    // 10s total duration plus 1s for exit transition
    const timer = setTimeout(() => {
      onComplete();
    }, 11000);

    return () => {
      clearTimeout(timer);
      clearTimeout(scanTimer);
    };
  }, [onComplete]);

  // Container fade out
  const containerVariants = {
    hidden: { opacity: 1 },
    exit: {
      opacity: 0,
      scale: 1.1,
      filter: 'blur(10px)',
      transition: { duration: 1.0, ease: 'easeIn' as const, delay: 10.0 }
    }
  };

  // Metaverse 3D Floor Grid moving forward
  const gridVariants = {
    initial: { rotateX: 65, translateY: '0%', scale: 2, opacity: 0 },
    animate: {
      translateY: ['0%', '20%'],
      opacity: [0, 0.4, 0.4],
      transition: { duration: 2, ease: 'linear' as const, repeat: Infinity, repeatType: 'loop' as const, opacity: { duration: 3, repeat: 0 } }
    }
  };

  // Central Digital Road
  const roadVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 3, ease: 'easeInOut' as const }
    }
  };

  const scanLineVariants = {
    initial: { top: '-10%' },
    scan: { top: '120%', transition: { duration: 3.5, ease: 'linear' as const, delay: 4.5 } }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-[#090b14] overflow-hidden flex flex-col justify-end font-mono"
      style={{ perspective: '1000px' }}
      variants={containerVariants}
      initial="hidden"
      animate="exit"
    >
      {/* Container wrapper for initial scale/pan down effect */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.15 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.5, ease: "easeOut" }}
      >
        {/* Realistic Interconnected Road Network Background */}
        <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <defs>
            <filter id="roadGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g opacity="0.85">
            {/* Main vertical branching axes */}
            <Road d="M 200 -100 L 200 400 L 400 600 L 400 1200" glow={false} opacity={0.7} />
            <Road d="M 800 -100 L 800 200 L 1000 400 L 1000 1200" glow={true} opacity={0.9} />
            <Road d="M 1300 -100 L 1300 500 L 1500 700 L 1500 1200" glow={false} opacity={0.5} />
            <Road d="M -50 -100 L -50 800 L 150 1000" glow={true} opacity={0.6} />

            {/* Main horizontal arteries intersecting */}
            <Road d="M -100 200 L 400 200 L 600 400 L 1600 400" glow={true} opacity={0.8} />
            <Road d="M -100 800 L 200 800 L 400 600 L 1000 600 L 1200 800 L 1700 800" glow={true} opacity={0.85} />
            <Road d="M -100 500 L 200 500 L 400 600" glow={false} opacity={0.6} />
            <Road d="M 1000 100 L 1400 100 L 1500 300" glow={false} opacity={0.5} />

            {/* Junction Hubs */}
            <g filter="url(#roadGlow)">
              <circle cx="400" cy="200" r="4" fill="#00F5D4" />
              <circle cx="400" cy="600" r="8" fill="#5BC0EB" />
              <circle cx="1000" cy="400" r="6" fill="#00F5D4" />
              <circle cx="1000" cy="600" r="10" fill="#fff" opacity="0.9" />
            </g>
          </g>
        </svg>

        {/* 3D Metaverse Moving Grid Floor */}
        <motion.div
          className="absolute left-[-100vw] bottom-[-20vh]"
          style={{
            width: '300vw',
            height: '150vh',
            transformOrigin: 'top',
            backgroundImage: 'linear-gradient(to right, #00F5D422 2px, transparent 2px), linear-gradient(to bottom, #00F5D422 2px, transparent 2px)',
            backgroundSize: '100px 100px',
            transformPerspective: '800px',
            transformStyle: 'preserve-3d',
          }}
          variants={gridVariants}
          initial="initial"
          animate="animate"
        />

        {/* Horizon Fade Out */}
        <div className="absolute top-0 w-full z-10" style={{ height: '60vh', background: 'linear-gradient(to bottom, #090b14, #090b14f2, transparent)' }} />

        {/* Central Content */}
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">

          {/* Main SVG Center Road Draws */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" preserveAspectRatio="none">
            <defs>
              <linearGradient id="roadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="100%" stopColor="#00F5D4" />
              </linearGradient>
            </defs>
            {/* Core Central Highways connecting the metaverse */}
            <motion.path
              d="M 450 300 C 250 600, 50 800, -50 1000"
              stroke="#5BC0EB" strokeWidth="4" fill="none" filter="url(#glow)"
              variants={roadVariants} initial="initial" animate="animate"
            />
            <motion.path
              d="M 550 300 C 750 600, 950 800, 1050 1000"
              stroke="#5BC0EB" strokeWidth="4" fill="none" filter="url(#glow)"
              variants={roadVariants} initial="initial" animate="animate"
            />
            <motion.path
              d="M 500 300 C 500 700, 500 900, 500 1000"
              stroke="url(#roadGrad)" strokeWidth="6" fill="none" filter="url(#glow)"
              variants={roadVariants} initial="initial" animate="animate"
            />

            {/* Interlocking city network grids */}
            <motion.path
              d="M 300 650 L 700 650"
              stroke="#00F5D4" strokeWidth="3" fill="none" filter="url(#glow)" opacity="0.5"
              variants={roadVariants} initial="initial" animate="animate"
            />
            <motion.path
              d="M 150 850 L 850 850"
              stroke="#00F5D4" strokeWidth="5" fill="none" filter="url(#glow)" opacity="0.6"
              variants={roadVariants} initial="initial" animate="animate"
            />
          </svg>

          {/* Metaverse Data Potholes (Anomalies) */}
          <motion.div
            className="absolute flex items-center justify-center"
            style={{ left: '30vw', top: '65vh', width: 24, height: 24, borderRadius: '50%', transform: 'translate(-50%, -50%)' }}
            initial={{ scale: 0, opacity: 0, backgroundColor: '#FB5607', boxShadow: '0 0 0px #FB5607' }}
            animate={
              scanned
                ? { backgroundColor: '#FF9F1C', boxShadow: '0 0 30px #FF9F1C, inset 0 0 10px #fff', scale: 1.2 }
                : { scale: [0, 1.5, 1], opacity: 1, boxShadow: '0 0 20px #FB5607' }
            }
            transition={{ delay: scanned ? 0.3 : 2, duration: 1 }}
          >
            {!scanned && <div className="absolute w-full h-full border border-[#FB5607] rounded-full animate-ping" />}
            {scanned && <div className="w-2 h-2 bg-white rounded-full" />}
          </motion.div>

          <motion.div
            className="absolute flex items-center justify-center"
            style={{ left: '70vw', top: '60vh', width: 16, height: 16, clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', transform: 'translate(-50%, -50%)' }}
            initial={{ scale: 0, opacity: 0, backgroundColor: '#FB5607', boxShadow: '0 0 0px #FB5607' }}
            animate={
              scanned
                ? { backgroundColor: '#FF9F1C', boxShadow: '0 0 20px #FF9F1C', scale: 1.5 }
                : { scale: [0, 2, 1.5], opacity: 1, boxShadow: '0 0 20px #FB5607' }
            }
            transition={{ delay: scanned ? 0.5 : 2.5, duration: 1 }}
          />

          <motion.div
            className="absolute flex items-center justify-center rounded-full border-2"
            style={{ left: '50vw', top: '85vh', width: 48, height: 48, borderColor: scanned ? '#FF9F1C' : '#FB5607', transform: 'translate(-50%, -50%)' }}
            initial={{ scale: 0, opacity: 0, backgroundColor: 'transparent' }}
            animate={
              scanned
                ? { scale: 1.1, backgroundColor: 'rgba(255,159,28,0.2)', boxShadow: '0 0 40px #FF9F1C, inset 0 0 20px #FF9F1C' }
                : { scale: [0, 1.2, 1], opacity: 1, backgroundColor: 'rgba(251,86,7,0.3)', boxShadow: '0 0 30px #FB5607, inset 0 0 15px #FB5607' }
            }
            transition={{ delay: scanned ? 0.7 : 3, duration: 1 }}
          >
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: scanned ? '#fff' : '#FB5607' }} />
            {!scanned && (
              <div
                className="absolute rounded-full border border-dashed border-[#FB5607] opacity-50"
                style={{ width: 96, height: 96, animation: 'spin 4s linear infinite' }}
              />
            )}
            {scanned && (
              <div className="absolute rounded-full border border-solid border-[#FF9F1C] animate-ping opacity-50" style={{ width: 64, height: 64 }} />
            )}
          </motion.div>

          {/* Red Laser Scanner */}
          <motion.div
            className="absolute left-0 w-full z-50 pointer-events-none"
            style={{ height: 250, background: 'linear-gradient(to bottom, transparent, rgba(255, 0, 0, 0.1) 80%, rgba(255, 0, 0, 0.8) 95%, #fff 100%)', boxShadow: '0 20px 40px rgba(255,0,0,0.5)' }}
            variants={scanLineVariants} initial="initial" animate="scan"
          />

          {/* Text Labels */}
          <div className="absolute flex flex-col items-center" style={{ top: '20%' }}>
            <motion.div
              initial={{ opacity: 0, y: -20, filter: 'blur(5px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 2, delay: 1 }}
              className="flex items-center gap-4 text-[#FF9F1C] uppercase text-xs"
              style={{ letterSpacing: '0.5em' }}
            >
              <div className="h-[1px] w-12 bg-[#FF9F1C]/50" />
              <h2>Metaverse Initialization</h2>
              <div className="h-[1px] w-12 bg-[#FF9F1C]/50" />
            </motion.div>

            <motion.h1
              className="mt-6 font-mono text-4xl md:text-7xl font-extrabold text-center"
              style={{
                letterSpacing: '0.2em',
                color: 'transparent',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                backgroundImage: 'linear-gradient(to right, #DD2D4A, #FF9F1C, #FB5607)',
                textShadow: '0 0 40px rgba(251, 86, 7, 0.5)',
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 2, delay: 2 }}
            >
              ROADPULSE TWIN
            </motion.h1>

            {/* Dynamic Status Text */}
            <motion.div className="mt-8 flex flex-col items-center" initial={{ opacity: 0 }} animate={{ opacity: scanned ? 0 : 1 }} transition={{ delay: 3 }}>
              <div
                className="px-4 py-1 border border-[#FB5607] text-[#FB5607] text-xs uppercase font-bold"
                style={{ backgroundColor: 'rgba(251,86,7,0.2)', letterSpacing: '0.3em' }}
              >
                Warning: Pothole Anomalies Detected
              </div>
            </motion.div>

            <AnimatePresence>
              {scanned && (
                <motion.div className="mt-8 flex flex-col items-center absolute w-full" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div
                    className="px-4 py-1 border border-[#FF9F1C] text-[#FF9F1C] text-sm uppercase font-bold"
                    style={{ backgroundColor: 'rgba(255,159,28,0.2)', letterSpacing: '0.3em' }}
                  >
                    Twin Sync Complete
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
