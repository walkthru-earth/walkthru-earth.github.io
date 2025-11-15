import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn('mx-auto max-w-7xl px-6 md:px-12 lg:px-24', className)}>
      {children}
    </div>
  );
}
