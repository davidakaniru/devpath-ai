"use client";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface InputProps extends React.ComponentProps<"input"> {
  id: string;
  type?: string;
  value?: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  info?: string;
  errorMessage?: string;
}

function Input({
  className,
  type = "text",
  label,
  placeholder,
  value,
  required,
  id,
  info,
  errorMessage,
  ...props
}: InputProps) {
  const [inputType, setInputType] = useState(type);

  return (
    <div className="flex flex-col w-full gap-1">
      <div className="flex gap-1">
        {label && (
          <label
            htmlFor={id}
            className="flex gap-0.5 text-[11px] font-bold uppercase tracking-[0.07em] text-foreground/70"
          >
            {label} {required && <span className="text-destructive">*</span>} {}
          </label>
        )}
      </div>

      <div className="relative">
        <input
          type={inputType}
          name={id}
          placeholder={placeholder}
          value={value !== undefined ? value : undefined}
          id={id}
          data-slot="input"
          className={cn(
            "h-10 w-full min-w-0 rounded-[6px] border border-input/20 bg-foreground/80 px-4 py-3 text-base transition-colors duration-300 ease-in-out outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/50 focus-visible:border-primary/50 focus-visible:bg-primary/2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
            errorMessage &&
              "border-destructive/50 ring-1 ring-destructive/20 focus-visible:border-destructive/50 focus-visible:ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40",
            className,
          )}
          {...props}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() =>
              setInputType((prev) =>
                prev === "password" ? "text" : "password",
              )
            }
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground cursor-pointer"
          >
            {inputType === "password" ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      {/* info */}
      {info && <p className="text-xs text-muted-foreground/50">{info}</p>}
      {/* error message */}
      {errorMessage && (
        <p className="text-xs text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}

export { Input };
