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
      className="relative mx-auto flex items-center justify-center lg:mx-0"
    >
      <div className="relative w-[240px] sm:w-[280px] lg:w-[320px]">
        {/* Phone Frame */}
        <div className="border-foreground/10 bg-background relative aspect-[9/21] w-full overflow-hidden rounded-[2.5rem] border-4 shadow-2xl">
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
                className="relative h-full w-full"
                style={
                  screenshot.hasFade
                    ? {
                        maskImage:
                          'linear-gradient(to bottom, black 75%, transparent 100%)',
                        WebkitMaskImage:
                          'linear-gradient(to bottom, black 75%, transparent 100%)',
                      }
                    : {}
                }
              >
                <Image
                  src={screenshot.src}
                  alt={screenshot.alt}
                  width={screenshot.width}
                  height={screenshot.height}
                  className="h-auto w-full object-cover object-top"
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
            className="text-muted-foreground absolute -bottom-12 left-1/2 hidden -translate-x-1/2 text-center text-xs lg:block"
          >
            <div className="mb-2 flex justify-center gap-1.5">
              {screenshots.map((_, index) => (
                <motion.div
                  key={index}
                  className="bg-secondary h-1.5 w-1.5 rounded-full"
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
