import { cn } from '@/lib/utils';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
}

export function GradientText({ children, className }: GradientTextProps) {
  return (
    <span
      className={cn(
        'gradient-text from-primary via-primary/80 to-secondary bg-gradient-to-r bg-clip-text text-transparent',
        className
      )}
    >
      {children}
    </span>
  );
}
