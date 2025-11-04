import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'flat' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'elevated',
      padding = 'md',
      hover = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'bg-white rounded-xl transition-all duration-150';

    const variants = {
      elevated: 'shadow-md hover:shadow-lg',
      flat: 'shadow-none',
      bordered: 'border border-gray-200',
    };

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const hoverStyles = hover ? 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]' : '';

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], paddings[padding], hoverStyles, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
