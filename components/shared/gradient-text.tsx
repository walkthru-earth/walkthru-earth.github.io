import { cn } from '@/lib/utils';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
}

export function GradientText({ children, className }: GradientTextProps) {
  return (
    <span
      className={cn(
        'bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent',
        className
      )}
    >
      {children}
    </span>
  );
}
