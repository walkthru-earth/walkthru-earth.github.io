import { motion, MotionValue } from 'framer-motion';
import Image from 'next/image';
import { useTheme } from 'next-themes';

interface Screenshot {
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface FeatureScreenshot {
  title: string;
  description: string;
  lightScreenshot: Screenshot;
  darkScreenshot: Screenshot;
}

interface ScrollingDesktopMockupProps {
  features: FeatureScreenshot[];
  screenshotOpacities: MotionValue<number>[];
  dotOpacities: MotionValue<number>[];
  showIndicator?: boolean;
}

export function ScrollingDesktopMockup({
  features,
  screenshotOpacities,
  dotOpacities,
  showIndicator = true,
}: ScrollingDesktopMockupProps) {
  const { theme, systemTheme } = useTheme();

  // Determine effective theme
  const effectiveTheme = theme === 'system' ? systemTheme : theme;
  const isDark = effectiveTheme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="relative w-full"
    >
      {/* Container for screenshots - no background, no shadow */}
      <div className="relative w-full overflow-hidden rounded-lg">
        {/* Rotating Screenshots */}
        {features.map((feature, index) => {
          const screenshot = isDark
            ? feature.darkScreenshot
            : feature.lightScreenshot;
          return (
            <motion.div
              key={screenshot.src}
              className="w-full"
              style={{
                opacity: screenshotOpacities[index],
                position: index === 0 ? 'relative' : 'absolute',
                top: index === 0 ? 'auto' : 0,
                left: index === 0 ? 'auto' : 0,
                right: index === 0 ? 'auto' : 0,
              }}
            >
              <Image
                src={screenshot.src}
                alt={screenshot.alt}
                width={screenshot.width}
                height={screenshot.height}
                className="h-auto w-full"
                priority={index === 0}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Scroll Indicator */}
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-muted-foreground absolute -bottom-10 left-1/2 hidden -translate-x-1/2 text-center text-xs sm:-bottom-12 sm:text-sm lg:block"
        >
          <div className="mb-2 flex justify-center gap-1.5 sm:mb-3 sm:gap-2">
            {features.map((_, index) => (
              <motion.div
                key={index}
                className="bg-primary h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2"
                style={{
                  opacity: dotOpacities[index],
                }}
              />
            ))}
          </div>
          Scroll to explore features
        </motion.div>
      )}
    </motion.div>
  );
}
