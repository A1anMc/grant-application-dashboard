import React, { useState, useEffect, useRef, ReactNode } from 'react';

// Fade In Animation Component
interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({ 
  children, 
  delay = 0, 
  duration = 500, 
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-opacity ease-in-out ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transitionDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
};

// Slide In Animation Component
interface SlideInProps {
  children: ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  duration?: number;
  className?: string;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 500,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const getTransform = () => {
    const distance = '2rem';
    switch (direction) {
      case 'left': return `translateX(-${distance})`;
      case 'right': return `translateX(${distance})`;
      case 'up': return `translateY(${distance})`;
      case 'down': return `translateY(-${distance})`;
      default: return `translateY(${distance})`;
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${className}`}
      style={{
        transform: isVisible ? 'translate(0)' : getTransform(),
        opacity: isVisible ? 1 : 0,
        transitionDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
};

// Pulse Animation Component
interface PulseProps {
  children: ReactNode;
  color?: string;
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

export const Pulse: React.FC<PulseProps> = ({
  children,
  intensity = 'medium',
  className = ''
}) => {
  const getIntensityClass = () => {
    switch (intensity) {
      case 'low': return 'animate-pulse opacity-70';
      case 'medium': return 'animate-pulse';
      case 'high': return 'animate-pulse opacity-50';
      default: return 'animate-pulse';
    }
  };

  return (
    <div className={`${getIntensityClass()} ${className}`}>
      {children}
    </div>
  );
};

// Loading Skeleton Component
interface SkeletonProps {
  height?: string;
  width?: string;
  className?: string;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  height = '1rem',
  width = '100%',
  className = '',
  lines = 1
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse bg-gray-200 rounded"
          style={{
            height: height,
            width: lines > 1 && index === lines - 1 ? '75%' : width
          }}
        />
      ))}
    </div>
  );
};

// Bounce Animation Component
interface BounceProps {
  children: ReactNode;
  trigger?: boolean;
  className?: string;
}

export const Bounce: React.FC<BounceProps> = ({
  children,
  trigger = false,
  className = ''
}) => {
  return (
    <div
      className={`transition-transform duration-300 ${
        trigger ? 'animate-bounce' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

// Scale Animation Component
interface ScaleProps {
  children: ReactNode;
  hover?: boolean;
  scale?: number;
  className?: string;
}

export const Scale: React.FC<ScaleProps> = ({
  children,
  hover = false,
  scale = 1.05,
  className = ''
}) => {
  return (
    <div
      className={`transition-transform duration-300 ${
        hover ? 'hover:scale-105' : ''
      } ${className}`}
      style={{
        transform: hover ? undefined : `scale(${scale})`
      }}
    >
      {children}
    </div>
  );
};

// Stagger Animation Container
interface StaggerProps {
  children: ReactNode[];
  delay?: number;
  className?: string;
}

export const Stagger: React.FC<StaggerProps> = ({
  children,
  delay = 100,
  className = ''
}) => {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <FadeIn key={index} delay={index * delay}>
          {child}
        </FadeIn>
      ))}
    </div>
  );
};

// Progress Bar Component with Animation
interface AnimatedProgressProps {
  progress: number;
  color?: string;
  height?: string;
  showPercentage?: boolean;
  className?: string;
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
  progress,
  color = 'blue',
  height = '0.5rem',
  showPercentage = false,
  className = ''
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);

    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className={`w-full ${className}`}>
      <div
        className="bg-gray-200 rounded-full overflow-hidden"
        style={{ height }}
      >
        <div
          className={`bg-${color}-500 rounded-full transition-all duration-1000 ease-out`}
          style={{
            width: `${Math.min(100, Math.max(0, animatedProgress))}%`,
            height: '100%'
          }}
        />
      </div>
      {showPercentage && (
        <div className="text-sm text-gray-600 mt-1 text-center">
          {Math.round(animatedProgress)}%
        </div>
      )}
    </div>
  );
};

// Floating Action Button with Animation
interface FloatingButtonProps {
  onClick: () => void;
  icon: ReactNode;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({
  onClick,
  icon,
  className = '',
  position = 'bottom-right'
}) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right': return 'bottom-6 right-6';
      case 'bottom-left': return 'bottom-6 left-6';
      case 'top-right': return 'top-6 right-6';
      case 'top-left': return 'top-6 left-6';
      default: return 'bottom-6 right-6';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`
        fixed ${getPositionClasses()} 
        w-14 h-14 bg-blue-600 hover:bg-blue-700 
        text-white rounded-full shadow-lg 
        transition-all duration-300 
        hover:scale-110 hover:shadow-xl
        focus:outline-none focus:ring-4 focus:ring-blue-300
        z-50
        ${className}
      `}
    >
      {icon}
    </button>
  );
};

// Card with Hover Animation
interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'none';
  onClick?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  hoverEffect = 'lift',
  onClick
}) => {
  const getHoverClasses = () => {
    switch (hoverEffect) {
      case 'lift': return 'hover:shadow-lg hover:-translate-y-1';
      case 'glow': return 'hover:shadow-xl hover:ring-2 hover:ring-blue-300';
      case 'scale': return 'hover:scale-105';
      case 'none': return '';
      default: return 'hover:shadow-lg hover:-translate-y-1';
    }
  };

  return (
    <div
      className={`
        transition-all duration-300 ease-in-out
        ${getHoverClasses()}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Notification Toast with Animation
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  isVisible,
  onClose,
  duration = 5000
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getTypeClasses = () => {
    switch (type) {
      case 'success': return 'bg-green-500 text-white';
      case 'error': return 'bg-red-500 text-white';
      case 'warning': return 'bg-yellow-500 text-black';
      case 'info': return 'bg-blue-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return 'ℹ';
    }
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-50
        transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div
        className={`
          flex items-center px-4 py-3 rounded-lg shadow-lg
          ${getTypeClasses()}
        `}
      >
        <span className="mr-2 text-lg">{getIcon()}</span>
        <span className="flex-1">{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-lg hover:opacity-75 transition-opacity"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Spinner Component
interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'medium',
  color = 'blue',
  className = ''
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small': return 'w-4 h-4';
      case 'medium': return 'w-8 h-8';
      case 'large': return 'w-12 h-12';
      default: return 'w-8 h-8';
    }
  };

  return (
    <div
      className={`
        ${getSizeClasses()}
        border-2 border-${color}-200 border-t-${color}-600
        rounded-full animate-spin
        ${className}
      `}
    />
  );
}; 