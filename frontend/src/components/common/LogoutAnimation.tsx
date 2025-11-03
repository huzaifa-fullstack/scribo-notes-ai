import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Sparkles } from "lucide-react";

interface LogoutAnimationProps {
  isVisible: boolean;
}

const LogoutAnimation = ({ isVisible }: LogoutAnimationProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative"
          >
            {/* Main Content */}
            <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
              {/* Animated Background Circles */}
              <motion.div
                className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-xl"
                animate={{
                  x: [0, 30, 0],
                  y: [0, -20, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute bottom-0 right-0 w-40 h-40 bg-cyan-300/20 rounded-full blur-2xl"
                animate={{
                  x: [0, -25, 0],
                  y: [0, 15, 0],
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center">
                {/* Icon with Animation */}
                <motion.div
                  className="relative mb-6"
                  animate={{
                    rotate: [0, -10, 10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <LogOut className="h-16 w-16 text-white" strokeWidth={2.5} />

                  {/* Sparkles */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      style={{
                        top: `${i * 20}%`,
                        left: `${i * 30}%`,
                      }}
                      animate={{
                        scale: [0, 1.5, 0],
                        opacity: [0, 1, 0],
                        rotate: [0, 180, 360],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeInOut",
                      }}
                    >
                      <Sparkles className="h-4 w-4 text-yellow-200" />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Text */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold text-white mb-2"
                >
                  See you soon!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/90 text-lg"
                >
                  Logging you out safely...
                </motion.p>

                {/* Loading Dots */}
                <div className="flex gap-2 mt-6">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-3 h-3 bg-white rounded-full"
                      animate={{
                        y: [0, -15, 0],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.15,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LogoutAnimation;
