import { ReactNode } from "react";
import { CSS_CLASSES, classNames } from "@/lib/utils";

/**
 * Reusable UI components for consistent styling across the application
 */

// ============================================================================
// Form Components
// ============================================================================

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  variant?: 'default' | 'error';
  fullWidth?: boolean;
}

export function Input({ variant = 'default', fullWidth = true, ...props }: InputProps) {
  return (
    <input
      className={classNames(
        CSS_CLASSES.input,
        variant === 'error' && 'border-red-500/60 focus:border-red-400',
        !fullWidth && 'w-auto'
      )}
      {...props}
    />
  );
}

interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  variant?: 'default' | 'error';
  fullWidth?: boolean;
}

export function Textarea({ variant = 'default', fullWidth = true, ...props }: TextareaProps) {
  return (
    <textarea
      className={classNames(
        CSS_CLASSES.textarea,
        variant === 'error' && 'border-red-500/60 focus:border-red-400',
        !fullWidth && 'w-auto'
      )}
      {...props}
    />
  );
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  variant?: 'default' | 'error';
  fullWidth?: boolean;
}

export function Select({ variant = 'default', fullWidth = true, children, ...props }: SelectProps) {
  return (
    <select
      className={classNames(
        CSS_CLASSES.select,
        variant === 'error' && 'border-red-500/60 focus:border-red-400',
        fullWidth ? 'w-full' : 'w-auto'
      )}
      {...props}
    >
      {children}
    </select>
  );
}

interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, error, required, children, className }: FormFieldProps) {
  return (
    <div className={classNames("space-y-1", className)}>
      {label && (
        <label className={CSS_CLASSES.label}>
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-red-400 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}

// ============================================================================
// Button Components
// ============================================================================

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  fullWidth = false, 
  children, 
  disabled,
  ...props 
}: ButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantClasses = {
    primary: CSS_CLASSES.buttonPrimary,
    secondary: CSS_CLASSES.buttonSecondary,
    danger: CSS_CLASSES.buttonDanger,
    ghost: 'text-zinc-300 hover:text-white hover:bg-white/5',
  };

  return (
    <button
      className={classNames(
        CSS_CLASSES.button,
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-50 cursor-not-allowed'
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}

// ============================================================================
// Layout Components
// ============================================================================

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'panel';
}

export function Card({ children, className, variant = 'default' }: CardProps) {
  const variantClass = variant === 'panel' ? CSS_CLASSES.panel : CSS_CLASSES.card;
  
  return (
    <div className={classNames(variantClass, className)}>
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  backLink?: {
    href: string;
    label: string;
  };
}

export function PageHeader({ title, subtitle, actions, backLink }: PageHeaderProps) {
  return (
    <header className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
      <div>
        {backLink && (
          <a 
            href={backLink.href}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-2 transition"
          >
            <span aria-hidden>←</span>
            {backLink.label}
          </a>
        )}
        <h1 className="font-evanescent st-title-gradient st-glow text-4xl sm:text-5xl tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-zinc-300">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  );
}

// ============================================================================
// Message Components
// ============================================================================

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  children: ReactNode;
  onDismiss?: () => void;
}

export function Alert({ variant = 'info', children, onDismiss }: AlertProps) {
  const variantClasses = {
    info: 'border-blue-500/40 bg-blue-500/10 text-blue-200',
    success: 'border-green-500/40 bg-green-500/10 text-green-200',
    warning: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-200',
    error: 'border-red-500/40 bg-red-500/10 text-red-200',
  };

  return (
    <div className={classNames(
      'rounded-lg border px-3 py-2 text-sm relative',
      variantClasses[variant]
    )}>
      {children}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 text-current opacity-70 hover:opacity-100"
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Loading Components
// ============================================================================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={classNames(
      'animate-spin rounded-full border-2 border-current border-t-transparent',
      sizeClasses[size],
      className
    )} />
  );
}

export function LoadingCard({ message = "Loading..." }: { message?: string }) {
  return (
    <Card variant="panel">
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-zinc-400">{message}</p>
        </div>
      </div>
    </Card>
  );
}