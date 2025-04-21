import * as React from "react"

import { cn } from "../../lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxRows?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, maxRows, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    
    React.useImperativeHandle(ref, () => textareaRef.current!);
    
    // Handle auto-resize
    React.useEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      const adjustHeight = () => {
        textarea.style.height = 'auto';
        const newHeight = Math.min(
          textarea.scrollHeight,
          maxRows ? maxRows * parseInt(getComputedStyle(textarea).lineHeight) : Infinity
        );
        textarea.style.height = `${newHeight}px`;
      };
      
      textarea.addEventListener('input', adjustHeight);
      adjustHeight();
      
      return () => {
        textarea.removeEventListener('input', adjustHeight);
      };
    }, [maxRows]);
    
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={textareaRef}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea } 