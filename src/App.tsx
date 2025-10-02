import { useState, useEffect, useRef } from "react";
import { ChevronDown, X } from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  LayoutGroup,
  AnimatePresence,
} from "framer-motion";
import Cover from "./imports/Cover";
import { fetchNotes, createNote, type Note as DbNote } from './services/notes'

// Typing Animation Component - Optimized and Mobile Responsive
function TypingAnimation() {
  const phrases = [
    "Not every story needs a storyteller.",
    "Not every truth needs a face.",
    "Not every message needs a sender.",
    "The wall remembers, but does not ask who.",
    "Some notes are best unsigned.",
    "Say it without saying who.",
    "Anonymous, but never unheard.",
    "The wall holds your words, not your identity.",
    "A note without a name still has meaning.",
    "Notes are free when no name binds them.",
  ];

  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const currentPhrase = phrases[phraseIndex];

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const animate = () => {
      if (!isDeleting) {
        if (currentText.length < currentPhrase.length) {
          setCurrentText(currentPhrase.substring(0, currentText.length + 1));
          timeoutId = setTimeout(animate, 100);
        } else {
          timeoutId = setTimeout(() => {
            setIsDeleting(true);
            animate();
          }, 2000);
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText(currentText.substring(0, currentText.length - 1));
          timeoutId = setTimeout(animate, 50);
        } else {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
          timeoutId = setTimeout(animate, 100);
        }
      }
    };

    timeoutId = setTimeout(animate, 100);

    return () => {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [currentText, isDeleting, phraseIndex, currentPhrase]);

  const titleRef = useRef<HTMLElement | null>(null);
  const [yPos, setYPos] = useState<number | null>(null);
  const [xPos, setXPos] = useState<number | null>(null);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const el = document.querySelector('[aria-label="Whisper Wall Title"] h1') as HTMLElement | null;
      if (el) {
        titleRef.current = el;
        const rect = el.getBoundingClientRect();
        setYPos(rect.top + rect.height + Math.min(50, rect.height * 0.18));
        setXPos(rect.left + rect.width * 0.52);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const handleResize = () => {
      if (titleRef.current) {
        const r = titleRef.current.getBoundingClientRect();
        setYPos(r.top + r.height + Math.min(50, r.height * 0.18));
        setXPos(r.left + r.width * 0.52);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      className="absolute pointer-events-none z-10"
      style={{
        top: yPos ?? "60%",
        left: xPos ?? "52%",
        transform: "translateX(-10px)",
      }}
    >
      <div className="font-['Inter:Semi_Bold',_sans-serif] font-semibold text-[#f8d254] text-2xl md:text-3xl lg:text-4xl xl:text-[46px] tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] whitespace-nowrap">
        <span>{currentText}</span>
        <span className="inline-block w-[1ch] animate-blink">|</span>
      </div>
    </div>
  );
}

// Static Note Card Component - Completely non-interactive
type Note = { quote: string };

function StaticNoteCard({ delay = 0, note, onClick, noteId, size = 'sm' }: { delay?: number; note: Note; onClick?: () => void; noteId: string; size?: 'sm' | 'lg' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-100px",
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: isInView ? 1 : 0,
        scale: isInView ? 1 : 0.9,
      }}
      transition={{
        duration: 0.5,
        delay: delay,
        ease: "easeOut",
      }}
      className={`relative z-10 ${size === 'lg' ? 'lg:col-span-2' : ''}`}
    >
      <motion.div
        layoutId={`note-${noteId}`}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : -1}
        onClick={onClick}
        onKeyDown={(e) => {
          if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
          }
        }}
        aria-label={onClick ? "Open note" : undefined}
        className={`relative ${size === 'lg' ? 'p-5 sm:p-6 md:p-8' : 'p-3 sm:p-4 md:p-6'} rounded-lg bg-[#2d2e2e] border-l-4 border-[#3a3b3b] shadow-lg transform rotate-1 hover:shadow-2xl transition-shadow duration-300 cursor-pointer`}
      >
        {/* Subtle paper texture */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-50 rounded-lg" />
        {/* Small yellow dot indicator in corner */}
        <div className="absolute top-3 right-3 w-3 h-3 sm:w-4 sm:h-4 bg-[#f8d254] rounded-full opacity-60 flex-shrink-0"></div>

        <div className="relative z-10 pr-8 sm:pr-10">
          <p
            className={`text-[#f8d254] leading-relaxed font-medium ${size === 'lg' ? 'text-base sm:text-lg md:text-xl' : 'text-xs sm:text-sm md:text-base'} opacity-90`}
            style={{
              display: "-webkit-box",
              WebkitLineClamp: size === 'lg' ? 6 : 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {note.quote}
          </p>
        </div>

        {/* Static shadow effect */}
        <div className="absolute inset-0 bg-black/20 rounded-lg transform translate-y-1 translate-x-1 -z-10" />
      </motion.div>
    </motion.div>
  );
}



// Morph viewer for notes using shared layoutId with the card
function NoteMorphViewer({ note, layoutId, onClose }: { note: Note | null; layoutId: string | null; onClose: () => void }) {
  if (!note || !layoutId) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[350]"
      onClick={onClose}
    >
      <motion.div
        layoutId={layoutId}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
           className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(90vw,720px)] overscroll-contain pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-6 rounded-2xl bg-[#2d2e2e] border-l-4 border-[#3a3b3b] shadow-2xl">
          <p className="text-[#f8d254] leading-relaxed font-medium text-base sm:text-lg md:text-xl whitespace-pre-line">
            {note.quote}
          </p>
          <button onClick={onClose} className="absolute -top-3 -right-3 px-3 py-1.5 rounded-full bg-[#f8d254] text-[#2d2e2e] font-semibold shadow">Close</button>
        </div>
      </motion.div>
    </motion.div>
  );
}


// Note Writing Interface Component - Mobile Responsive
function NoteWritingInterface({
  onClose,
  noteText,
  setNoteText,
  onPost,
}: { onClose: () => void; noteText: string; setNoteText: (t: string) => void; onPost: (text: string) => Promise<void> | void }) {
  const maxCharacters = 300;

  const handlePost = async () => {
    if (noteText.trim()) {
      await onPost(noteText);
      setNoteText("");
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] overscroll-contain flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        layoutId="compose-card"
        initial={{ borderRadius: 999, backgroundColor: "#f8d254", opacity: 0 }}
        animate={{ borderRadius: 16, backgroundColor: "#2d2e2e", opacity: 1 }}
        exit={{ opacity: 0 }}
      transition={{
          type: "spring",
          stiffness: 300,
          damping: 28,
        }}
        className="bg-[#2d2e2e] rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 max-w-sm sm:max-w-md md:max-w-2xl w-full relative shadow-2xl border border-[#4a4b4b] max-h-[90vh] overflow-y-auto overscroll-contain pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#f8d254] mb-2">
            The Whisper Wall
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Write anything you like. No login. Max{" "}
            <span className="text-[#f8d254] font-semibold">
              {maxCharacters}
            </span>{" "}
            characters.
          </p>
        </div>

        <div className="mb-4">
          <motion.textarea
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            value={noteText}
            onChange={(e) =>
              setNoteText(
                e.target.value.slice(0, maxCharacters),
              )
            }
            placeholder="Write your note..."
            className="w-full h-24 sm:h-32 p-3 sm:p-4 bg-[#3a3b3b] border border-[#4a4b4b] rounded-xl sm:rounded-2xl text-gray-300 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-[#f8d254]/50 focus:border-[#f8d254]/50 transition-all duration-300 text-sm sm:text-base"
            autoFocus
          />
        </div>

        <div className="flex items-center justify-between">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 text-xs sm:text-sm"
          >
            {noteText.length}/{maxCharacters}
          </motion.span>

          <div className="flex gap-2 sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-4 sm:px-6 py-2 text-gray-400 hover:text-white transition-colors duration-300 text-sm sm:text-base min-h-[44px]"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePost}
              disabled={!noteText.trim()}
              className="px-6 sm:px-8 py-2 bg-[#7c7cf8] text-white rounded-full font-semibold hover:bg-[#6b6bf7] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm sm:text-base min-h-[44px]"
            >
              Post
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Animated Card Component for other sections
function AnimatedCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-100px",
  });

  return (
    <motion.div
      ref={ref}
      initial={{ y: 60, opacity: 0 }}
      animate={
        isInView ? { y: 0, opacity: 1 } : { y: 60, opacity: 0 }
      }
      transition={{
        duration: 0.6,
        delay: delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}

// View More button with pulse/ripple + shared layoutId for morph
function ViewMoreButton({ onClick, hidden, count }: { onClick: () => void; hidden?: boolean; count?: number }) {
  const [ripples, setRipples] = useState<Array<{ id: number }>>([]);

  const triggerRipple = () => {
    const id = Date.now();
    setRipples((r) => [...r, { id }]);
    setTimeout(() => {
      setRipples((r) => r.filter((x) => x.id !== id));
    }, 600);
  };

  return (
    <motion.button
      layoutId="all-notes-card"
      initial={false}
      animate={{
        borderRadius: 999,
        backgroundColor: '#3a3b3b',
        opacity: hidden ? 0 : 1,
        scale: hidden ? 0.98 : 1,
      }}
      transition={{
        type: 'spring', stiffness: 300, damping: 28,
        opacity: { duration: 0.2, delay: hidden ? 0 : 0.1 },
        scale: { duration: 0.2, delay: hidden ? 0 : 0.1 },
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => { triggerRipple(); onClick(); }}
      className="relative overflow-hidden bg-[#3a3b3b] hover:bg-[#4a4b4b] text-[#f8d254] px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold transition-all duration-300 border border-[#4a4b4b] hover:border-[#f8d254]/30 min-h-[44px] text-sm sm:text-base w-full sm:w-auto"
      style={{ pointerEvents: hidden ? 'none' as const : 'auto' as const }}
    >
      <motion.span
        initial={{ y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        View All Notes{typeof count === 'number' ? ` (${count} total)` : ''}
      </motion.span>

      {/* Pulse/Ripple */}
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          className="pointer-events-none absolute inset-[-25%] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(248,210,84,0.35) 0%, rgba(248,210,84,0.15) 40%, rgba(248,210,84,0) 70%)' }}
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
    </motion.button>
  );
}

// All Notes morph overlay (similar window like share button)
function AllNotesMorphOverlay({ open, onClose, notes, onNoteClick }: { open: boolean; onClose: () => void; notes: Note[]; onNoteClick: (n: Note, id: string) => void }) {
  if (!open) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[300] p-4"
      onClick={onClose}
    >
      <motion.div
        layoutId="all-notes-card"
        initial={{ borderRadius: 999, backgroundColor: "#3a3b3b", opacity: 0 }}
        animate={{ borderRadius: 0, backgroundColor: "#2d2e2e", opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="fixed inset-0 bg-[#2d2e2e]/95 p-4 sm:p-6 md:p-8 shadow-2xl border-t border-[#4a4b4b] flex flex-col overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#f8d254] mb-1">All Notes</h2>
            <p className="text-gray-400 text-sm sm:text-base">Browse every whisper on the wall</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-8 h-8 sm:w-10 sm:h-10 bg-[#3a3b3b] hover:bg-[#4a4b4b] rounded-full flex items-center justify-center text-[#f8d254] transition-all duration-300"
          >
            <X size={20} />
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 content-start">
            {notes.map((note: Note, index: number) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.02, duration: 0.22 }}>
                <StaticNoteCard
                  note={note}
                  delay={0}
                  noteId={`overlay-${index}`}
                  onClick={() => onNoteClick(note, `overlay-${index}`)}
                  size={index % 7 === 0 || index % 11 === 0 ? 'lg' : 'sm'}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function App() {
  const [showScrollIndicator, setShowScrollIndicator] =
    useState(true);
  const [showNoteInterface, setShowNoteInterface] =
    useState(false);
  const [showNoteViewer, setShowNoteViewer] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteText, setNoteText] = useState("");
  const [showAllNotes, setShowAllNotes] = useState(false);
  const containerRef = useRef(null);



  // Static notes data for the grey cards (fallback)
  const stickyNotes = [
    {
      quote:
        "Sometimes the bravest thing you can do is speak your truth when no one is listening. But here, someone always is. In this space, your voice matters and your thoughts find their home among others who understand the weight of words unspoken.",
    },
    {
      quote:
        "I never realized how much weight names carry until I learned to speak without one. Freedom tastes like anonymity.",
    },
    {
      quote:
        "The most honest conversations happen when you remove everything except the words themselves. Without the burden of identity, we can express our deepest truths and connect on a level that transcends the superficial layers of who we pretend to be in our daily lives.",
    },
    {
      quote:
        "Every whisper on this wall is a reminder that we're not alone in our thoughts, fears, and dreams.",
    },
    {
      quote:
        "Identity can be a prison. Here, my thoughts fly free without the chains of who I'm supposed to be. In anonymity, I find liberation from expectations, judgments, and the constant pressure to maintain a curated version of myself.",
    },
    {
      quote:
        "In a world of profiles and personas, there's something magical about pure, unfiltered human expression. This is where raw humanity meets digital space, creating connections that feel more authentic than anything we share with our names attached.",
    },
  ];

  // Additional notes for the full view-more overlay (fallback)
  const moreNotes: Note[] = [
    { quote: "Some days, the loudest battles are the ones no one sees." },
    { quote: "I write here because the words feel lighter when I set them down." },
    { quote: "There’s comfort in knowing a stranger might understand." },
    { quote: "I’m not looking for advice—just a place for this feeling to exist." },
    { quote: "I keep smiles ready for everyone. I wish I kept one for myself." },
    { quote: "Healing is slow, and that’s okay. I’m still here." },
    { quote: "If you’re reading this, I hope today is kinder to you." },
    { quote: "I’m learning that silence can be a form of strength, not defeat." },
    { quote: "Maybe honesty is the first step to finding peace." },
    { quote: "I’m proud of the small things I kept going, even when no one noticed." },
    { quote: "I forgive myself for not knowing what I didn’t know before." },
    { quote: "I’m scared of change, but I’m more scared of never trying." },
  ];

  const [remoteNotes, setRemoteNotes] = useState<DbNote[] | null>(null)
  const allNotes: Note[] = (remoteNotes && remoteNotes.length > 0)
    ? remoteNotes.map(n => ({ quote: n.quote }))
    : [...stickyNotes, ...moreNotes];

  // Parallax scroll effects - Optimized
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", "15%"],
  );

  useEffect(() => {
    // Load notes from Supabase if configured
    (async () => {
      try {
        const data = await fetchNotes(60)
        if (data.length) setRemoteNotes(data)
      } catch (e) {
        console.warn('Failed loading remote notes, using fallback.', e)
      }
    })()

    const handleScroll = () => {
      // Hide scroll indicator when user scrolls down
      if (window.scrollY > 100) {
        setShowScrollIndicator(false);
      } else {
        setShowScrollIndicator(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () =>
      window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background (body) scroll when any overlay is open
  const anyOverlayOpen = showNoteInterface || showAllNotes || showNoteViewer;
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (anyOverlayOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalOverflow || '';
    }
    return () => {
      document.body.style.overflow = originalOverflow || '';
    };
  }, [anyOverlayOpen]);
  const handleStartSharing = () => {
    // Morph/expand animation handled via shared layoutId
    setShowNoteInterface(true);
  };

  const scrollToContent = () => {
    const contentSection = document.getElementById(
      "content-section",
    );
    if (contentSection) {
      contentSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const [activeNoteLayoutId, setActiveNoteLayoutId] = useState<string | null>(null);
  const handleNoteClick = (note: Note, id: string) => {
    setSelectedNote(note);
    setActiveNoteLayoutId(`note-${id}`);
    setShowNoteViewer(true);
  };

  const handleCloseNoteViewer = () => {
    setShowNoteViewer(false);
    setSelectedNote(null);
  };

  async function handlePostNote(text: string) {
    if (!text.trim()) return
    const created = await createNote(text.trim())
    if (created) {
      // Optimistically prepend to local list
      setRemoteNotes(prev => [{ id: created.id!, quote: created.quote, created_at: created.created_at! }, ...(prev ?? [])])
    }
  }



  return (
    <LayoutGroup>
    <div
      ref={containerRef}
      className="min-h-screen bg-[#2d2e2e]"
    >
      {/* Hero Section with imported Cover and Parallax */}
      <section className="h-screen relative overflow-hidden">
        <motion.div
          style={{ y: backgroundY }}
          className="absolute inset-0"
        >
          <Cover />
        </motion.div>

        <div className="relative z-10 h-full">
          <TypingAnimation />
        </div>

        {/* Scroll Down Indicator */}
        {showScrollIndicator && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="absolute bottom-6 sm:bottom-8 md:bottom-12 left-1/2 transform -translate-x-1/2 z-30"
          >
            <button
              onClick={scrollToContent}
              className="group flex flex-col items-center text-[#f8d254] hover:text-white transition-colors duration-300 min-h-[44px] min-w-[44px] justify-center p-2"
              aria-label="Scroll down to content"
            >
              <div className="text-xs sm:text-sm mb-1 sm:mb-2 opacity-80 group-hover:opacity-100 font-medium">
                Scroll Down
              </div>
              <div className="animate-bounce">
                <ChevronDown
                  size={20}
                  className="sm:w-6 sm:h-6 md:w-8 md:h-8"
                />
              </div>
            </button>
          </motion.div>
        )}
      </section>

      

      {/* Content Section with Smooth Transition */}
      <motion.section
        id="content-section"
        initial={{ y: 100 }}
        whileInView={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        viewport={{ once: true }}
        className="min-h-screen bg-[#2d2e2e] py-8 sm:py-12 md:py-16 lg:py-20 relative z-20"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Background Particles - Reduced for performance */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-[#f8d254]/15 rounded-full"
                initial={{
                  x: Math.random() * 1200,
                  y: Math.random() * 800 + 100,
                  opacity: 0,
                }}
                animate={{
                  y: [null, Math.random() * 800 - 100],
                  x: [null, Math.random() * 1200],
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  duration: Math.random() * 15 + 10,
                  delay: Math.random() * 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16 relative z-10"
          >
            <motion.h2
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-[#f8d254] mb-3 sm:mb-4 md:mb-6 px-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              Share Your Thoughts Anonymously
            </motion.h2>
            <motion.p
              className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto px-4 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: "easeOut",
              }}
              viewport={{ once: true }}
            >
              Whisper Wall is a platform where thoughts flow
              freely without the weight of identity. Express
              yourself, connect with others, and discover
              perspectives that matter.
            </motion.p>
          </motion.div>

          <AnimatedCard delay={0.3}>
            <div className="bg-[#3a3b3b] rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 text-center mb-8 sm:mb-12 md:mb-20 mx-0">
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-[#f8d254] mb-3 sm:mb-4 md:mb-6">
                Ready to Share Your Thoughts?
              </h3>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 mb-4 sm:mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed">
                Join thousands of others who have found freedom
                in anonymous expression. Your thoughts matter,
                your thoughts count.
              </p>
              <motion.button
                layoutId="compose-card"
                initial={false}
                animate={{
                  borderRadius: 999,
                  backgroundColor: '#f8d254',
                  opacity: showNoteInterface ? 0 : 1,
                  scale: showNoteInterface ? 0.98 : 1,
                }}
                transition={{
                  type: 'spring', stiffness: 300, damping: 28,
                  opacity: { duration: 0.2, delay: showNoteInterface ? 0 : 0.2 },
                  scale: { duration: 0.2, delay: showNoteInterface ? 0 : 0.2 },
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartSharing}
                className="bg-[#f8d254] text-[#2d2e2e] px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base md:text-lg font-semibold hover:bg-yellow-300 transition-colors duration-300 relative overflow-hidden min-h-[44px] w-full sm:w-auto max-w-xs sm:max-w-none"
                style={{ pointerEvents: showNoteInterface ? 'none' as const : 'auto' as const }}
              >
                <motion.span
                  initial={{ y: 0 }}
                  whileHover={{ y: -2 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                  }}
                >
                  <span>Start Sharing</span>
                </motion.span>

                {/* Button sheen on hover */}
                <motion.div
                  className="absolute inset-0 bg-white/20 transform scale-x-0 origin-left"
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </div>
          </AnimatedCard>

          {/* Static Note Cards Grid - Mobile Responsive */}
          <div className="mb-8 sm:mb-12 md:mb-20">
            {/* Show first 6 notes (remote if available, else fallback) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
              {allNotes.slice(0, 6).map((note, index) => (
                <StaticNoteCard
                  key={index}
                  delay={index * 0.1}
                  note={note}
                  noteId={`grid-${index}`}
                  onClick={() => handleNoteClick(note, `grid-${index}`)}
                />
              ))}
            </div>

            {/* View More Button - Always visible; morphs to overlay with pulse/ripple */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              viewport={{ once: true }}
              className="text-center mt-4 sm:mt-6 md:mt-8"
            >
              <ViewMoreButton hidden={showAllNotes} onClick={() => setShowAllNotes(true)} count={allNotes.length} />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Why Whisper Wall Section - Mobile Responsive */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        viewport={{ once: true }}
        className="bg-[#2d2e2e] py-8 sm:py-12 md:py-16 lg:py-20"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-[#f8d254] mb-4 sm:mb-6 md:mb-8"
          >
            Why Whisper Wall?
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <AnimatedCard delay={0}>
              <div className="flex flex-col items-center p-3 sm:p-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-[#f8d254] rounded-full flex items-center justify-center text-[#2d2e2e] text-base sm:text-lg md:text-xl font-black mb-2 sm:mb-3 md:mb-4">
                  1
                </div>
                <h4 className="text-sm sm:text-base md:text-lg font-semibold text-[#f8d254] mb-1 sm:mb-2">
                  Freedom
                </h4>
                <p className="text-gray-300 text-xs sm:text-sm md:text-base text-center">
                  Share openly without the weight of identity.
                </p>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.2}>
              <div className="flex flex-col items-center p-3 sm:p-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-[#f8d254] rounded-full flex items-center justify-center text-[#2d2e2e] text-base sm:text-lg md:text-xl font-black mb-2 sm:mb-3 md:mb-4">
                  2
                </div>
                <h4 className="text-sm sm:text-base md:text-lg font-semibold text-[#f8d254] mb-1 sm:mb-2">
                  Discover
                </h4>
                <p className="text-gray-300 text-xs sm:text-sm md:text-base text-center">
                  Read and learn from diverse perspectives
                  worldwide.
                </p>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.4}>
              <div className="flex flex-col items-center p-3 sm:p-4 sm:col-span-2 md:col-span-1 mx-auto max-w-xs sm:max-w-sm">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-[#f8d254] rounded-full flex items-center justify-center text-[#2d2e2e] text-base sm:text-lg md:text-xl font-black mb-2 sm:mb-3 md:mb-4">
                  3
                </div>
                <h4 className="text-sm sm:text-base md:text-lg font-semibold text-[#f8d254] mb-1 sm:mb-2">
                  Deeper Bonds
                </h4>
                <p className="text-gray-300 text-xs sm:text-sm md:text-base text-center">
                  Connect with raw humanity, not profiles.
                </p>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </motion.section>

      {/* Note Writing Interface with exit animation */}
      <AnimatePresence>
        {showNoteInterface && (
          <NoteWritingInterface
            onClose={() => setShowNoteInterface(false)}
            noteText={noteText}
            setNoteText={setNoteText}
            onPost={handlePostNote}
          />
        )}
      </AnimatePresence>

      {/* Note morph overlay */}
      <AnimatePresence>
        {showNoteViewer && (
          <NoteMorphViewer
            note={selectedNote}
            layoutId={activeNoteLayoutId}
            onClose={handleCloseNoteViewer}
          />
        )}
      </AnimatePresence>

      {/* All Notes Morph Overlay */}
      <AnimatePresence>
        {showAllNotes && (
          <AllNotesMorphOverlay
            open={showAllNotes}
            onClose={() => setShowAllNotes(false)}
            notes={allNotes}
            onNoteClick={handleNoteClick}
          />
        )}
      </AnimatePresence>


  </div>
  </LayoutGroup>
  );
}