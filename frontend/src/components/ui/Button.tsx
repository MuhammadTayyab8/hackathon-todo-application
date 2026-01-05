import * as React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";

    const variants = {
      primary: "bg-secondary text-background hover:bg-secondary/90 rounded-md",
      secondary: "bg-transparent border border-secondary text-secondary hover:bg-secondary/5 rounded-md",
      outline: "border border-foreground bg-background text-foreground hover:bg-accent hover:text-accent-foreground rounded-md",
      ghost: "text-secondary hover:bg-secondary/5 rounded-md",
      link: "text-secondary underline-offset-4 hover:underline",
    };

    const sizes = {
      sm: "h-9 px-4 py-2 text-sm",
      md: "h-10 px-6 py-2.5 text-sm",
      lg: "h-12 px-8 py-3 text-base",
      icon: "h-10 w-10",
    };

    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ""}`;

    return (
      <button
        className={combinedClassName}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
