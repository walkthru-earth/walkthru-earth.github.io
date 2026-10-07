import { motion, MotionValue } from 'framer-motion';
import Image from 'next/image';
import { Localized } from '@/lib/i18n/i18n-provider';

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
    <Localized>
      <div className="relative mx-auto flex items-center justify-center lg:mx-0">
        <div className="relative w-[240px] max-w-full motion-safe:!w-[min(320px,calc((100svh_-_10rem)*9/21))] sm:w-[280px] lg:w-[320px]">
          {/* Phone Frame */}
          <div className="border-foreground bg-background relative aspect-[9/21] w-full overflow-hidden rounded-[2.5rem] border-[6px] shadow-2xl">
            {/* Rotating Screenshots */}
            {screenshots.map((screenshot, index) => (
              <motion.div
                key={screenshot.src}
                className={`absolute inset-0 ${index === 0 ? 'motion-reduce:!opacity-100' : 'motion-reduce:!opacity-0'}`}
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
            <div className="absolute -bottom-12 left-1/2 hidden -translate-x-1/2 text-center text-sm font-bold motion-reduce:!hidden lg:block">
              <div className="mb-2 flex justify-center gap-1.5">
                {screenshots.map((_, index) => (
                  <motion.div
                    key={index}
                    className="h-2 w-2 rounded-full bg-current"
                    style={{
                      opacity: dotOpacities[index],
                    }}
                  />
                ))}
              </div>
              Scroll to explore
            </div>
          )}
        </div>
      </div>
    </Localized>
  );
}
