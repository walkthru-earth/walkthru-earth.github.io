import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        'flex items-center gap-3 transition-opacity hover:opacity-80',
        className
      )}
    >
      <div className={cn('relative flex-shrink-0', sizeClasses[size])}>
        <Image
          src="/icon.svg"
          alt="Walkthru Logo"
          width={48}
          height={48}
          className="h-full w-full object-contain"
          priority
        />
      </div>
      {showText && (
        <span className="text-2xl font-semibold tracking-tight">
          walkthru<span className="text-muted-foreground">.earth</span>
        </span>
      )}
    </Link>
  );
}
