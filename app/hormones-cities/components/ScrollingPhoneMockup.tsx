import { motion, MotionValue } from 'framer-motion';
import Image from 'next/image';

interface Screenshot {
  src: string;
  alt: string;
  width: number;
  height: number;
  hasFade: boolean;
}

interface ScrollingPhoneMockupProps {
  screenshots: Screenshot[];
  screenshotOpacities: MotionValue<number>[];
  dotOpacities: MotionValue<number>[];
  showIndicator?: boolean;
}

export function ScrollingPhoneMockup({
  screenshots,
  screenshotOpacities,
  dotOpacities,
  showIndicator = true,
}: ScrollingPhoneMockupProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="relative flex justify-center items-center mx-auto lg:mx-0"
    >
      <div className="relative w-[240px] sm:w-[280px] lg:w-[320px]">
        {/* Phone Frame */}
        <div className="relative w-full aspect-[9/21] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-foreground/10 bg-background">
          {/* Rotating Screenshots */}
          {screenshots.map((screenshot, index) => (
            <motion.div
              key={screenshot.src}
              className="absolute inset-0"
              style={{
                opacity: screenshotOpacities[index],
              }}
            >
              <div
                className="w-full h-full relative"
                style={
                  screenshot.hasFade
                    ? {
                        maskImage: 'linear-gradient(to bottom, black 75%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, black 75%, transparent 100%)',
                      }
                    : {}
                }
              >
                <Image
                  src={screenshot.src}
                  alt={screenshot.alt}
                  width={screenshot.width}
                  height={screenshot.height}
                  className="w-full h-auto object-cover object-top"
                  priority={index === 0}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Scroll Indicator */}
        {showIndicator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center text-xs text-muted-foreground hidden lg:block"
          >
            <div className="flex gap-1.5 mb-2 justify-center">
              {screenshots.map((_, index) => (
                <motion.div
                  key={index}
                  className="w-1.5 h-1.5 rounded-full bg-secondary"
                  style={{
                    opacity: dotOpacities[index],
                  }}
                />
              ))}
            </div>
            Scroll to explore
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
