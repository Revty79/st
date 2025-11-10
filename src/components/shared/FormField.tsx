// src/components/shared/FormField.tsx
"use client";

import React, { useEffect, useState } from "react";
import type { JSX } from "react";

interface FormFieldProps {
  label: string;
  value: string | number | null | undefined;
  onCommit: (value: string) => void;
  type?: "text" | "textarea" | "number" | "select";
  placeholder?: string;
  options?: Array<{ value: string; label: string }> | string[];
  disabled?: boolean;
  className?: string;
  rows?: number;
  maxLength?: number;
  helperText?: string;
}

export default function FormField({
  label,
  value,
  onCommit,
  type = "text",
  placeholder,
  options,
  disabled = false,
  className = "",
  rows = 3,
  maxLength,
  helperText,
}: FormFieldProps) {
  const [localValue, setLocalValue] = useState(value?.toString() ?? "");

  // Sync with prop changes
  useEffect(() => {
    setLocalValue(value?.toString() ?? "");
  }, [value]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
  };

  const handleBlur = () => {
    onCommit(localValue);
  };

  // Normalize options to always be { value, label } format
  const normalizedOptions = options
    ? options.map((opt) => (typeof opt === "string" ? { value: opt, label: opt } : opt))
    : [];

  const baseInputClass = "w-full rounded-lg bg-white/10 text-white border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-zinc-400";

  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-zinc-200">{label}</label>
      {type === "textarea" ? (
        React.createElement('textarea', {
          value: localValue,
          onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange(e.target.value),
          onBlur: handleBlur,
          placeholder: placeholder,
          disabled: disabled,
          rows: rows,
          maxLength: maxLength,
          className: `${baseInputClass} resize-y`
        })
      ) : type === "select" && normalizedOptions.length > 0 ? (
        <select
          value={localValue}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            handleChange(e.target.value);
            onCommit(e.target.value); // Commit immediately for selects
          }}
          disabled={disabled}
          className={`${baseInputClass} text-zinc-200`}
        >
          {normalizedOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-zinc-800 text-zinc-200">
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={localValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={baseInputClass}
        />
      )}
      {helperText && (
        <div className="text-xs text-zinc-400 mt-1">
          {helperText}
        </div>
      )}
      {maxLength && type === "textarea" && (
        <div className="text-xs text-zinc-400 text-right">
          {localValue.length}/{maxLength}
        </div>
      )}
    </div>
  );
}
