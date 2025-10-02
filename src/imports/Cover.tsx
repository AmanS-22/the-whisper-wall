import { motion } from 'framer-motion';

function Frame41124522() {
  return (
    <div
      className="absolute top-1/2 left-0 right-0 -translate-y-1/2 px-8 md:px-16 pointer-events-none z-10"
      aria-label="Whisper Wall Title"
    >
      <h1
        className="font-['Inter:Black',_sans-serif] font-black text-[#f8d254] leading-none tracking-tight text-[80px] sm:text-[110px] md:text-[140px] lg:text-[170px] xl:text-[190px] whitespace-nowrap drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
        style={{ lineHeight: 0.9 }}
      >
        Whisper Wall
      </h1>
    </div>
  );
}

// Static Background Sticky Note Component - No interactions
type StickyPos = { top?: string; right?: string; bottom?: string; left?: string };
function BackgroundStickyNote({ text, position, rotation, scale = 1, delay = 0 }: { text: string; position: StickyPos; rotation: number; scale?: number; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: scale, rotate: rotation }}
      animate={{ opacity: 0.7, scale: scale, rotate: rotation }}
      transition={{
        duration: 0.3,
        delay: delay,
        ease: "easeOut"
      }}
      className="absolute z-[5] pointer-events-none"
      style={position}
    >
      <div 
        className="relative p-3 rounded-lg bg-[#f8d254] border-l-4 border-[#e6c045] shadow-lg select-none"
        style={{ transform: `rotate(${rotation}deg) scale(${scale})` }}
      >
        {/* Subtle paper texture */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-50 rounded-lg" />
        
        <div className="relative z-10 max-w-[180px] pr-6">
          <p 
            className="text-black leading-relaxed font-medium text-sm opacity-90"
            style={{
               display: '-webkit-box',
               WebkitLineClamp: 3,
               WebkitBoxOrient: 'vertical',
               overflow: 'hidden',
               textOverflow: 'ellipsis'
             }}>
            {text}
          </p>
          
          {/* Small black dot indicator in corner */}
          <div className="absolute top-1 right-1 w-3 h-3 bg-black rounded-full opacity-60" />
        </div>
        
        {/* Static shadow effect */}
        <div className="absolute inset-0 bg-black/10 rounded-lg transform translate-y-1 translate-x-1 -z-10" />
      </div>
    </motion.div>
  );
}

// Collection of static background sticky notes - no interactions
function MarkedBackgroundStickyNotes() {
  const markedNotes = [
    {
      text: "Sometimes the bravest thing you can do is speak your truth when no one is listening...",
      position: { top: '20%', left: '12%' },
      rotation: -8,
      scale: 0.9,
      delay: 0.2
    },
    {
      text: "Freedom tastes like anonymity and feels like truth unbound by identity...",
      position: { top: '15%', right: '8%' },
      rotation: 5,
      scale: 1.0,
      delay: 0.4
    },
    {
      text: "Identity can be a prison. Here, my thoughts fly free without chains...",
      position: { bottom: '20%', right: '15%' },
      rotation: -6,
      scale: 1.1,
      delay: 0.6
    },
    {
      text: "Your voice matters and your thoughts find their home among others...",
      position: { top: '75%', left: '20%' },
      rotation: 7,
      scale: 1.0,
      delay: 0.8
    },
    {
      text: "Raw humanity meets digital space, creating connections more authentic than profiles...",
      position: { top: '8%', right: '25%' },
      rotation: -4,
      scale: 0.85,
      delay: 1.0
    }
  ];

  return (
    <>
      {markedNotes.map((note, index) => (
        <BackgroundStickyNote
          key={index}
          text={note.text}
          position={note.position}
          rotation={note.rotation}
          scale={note.scale}
          delay={note.delay}
        />
      ))}
    </>
  );
}





export default function Cover() {
  return (
    <div className="bg-[#2d2e2e] relative size-full overflow-hidden" data-name="Cover">
      <Frame41124522 />
      
      {/* Static yellow sticky notes - no interactions */}
      <MarkedBackgroundStickyNotes />
      
      {/* Floating particles for atmosphere - Reduced for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#f8d254]/10 rounded-full"
            initial={{
              x: Math.random() * 1200,
              y: Math.random() * 800,
              opacity: 0,
            }}
            animate={{
              y: [null, Math.random() * 800],
              x: [null, Math.random() * 1200],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: Math.random() * 20 + 15,
              delay: Math.random() * 8,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>
    </div>
  );
}