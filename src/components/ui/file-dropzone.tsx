import React, { useId, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import { formatBytes } from '@/utils/format';
import { cn } from './cn';

export interface FileDropzoneProps {
  label?: string;
  hint?: string;
  error?: string;
  accept?: string;
  multiple?: boolean;
  files: ReadonlyArray<File>;
  onFilesChange: (files: File[]) => void;
  buttonText?: string;
  dropHint?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Custom drag-and-drop FileDropzone replacing browser-native file inputs.
 */
export function FileDropzone({
  label,
  hint,
  error,
  accept,
  multiple = false,
  files,
  onFilesChange,
  buttonText = 'Choose file',
  dropHint = 'or drag and drop here',
  disabled = false,
  className,
}: FileDropzoneProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const acceptFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const picked = Array.from(list);
    onFilesChange(multiple ? [...files, ...picked] : [picked[0]]);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    acceptFiles(e.dataTransfer.files);
  };

  const removeAt = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <label htmlFor={id} className="text-[13px] font-medium text-ink">
          {label}
        </label>
      )}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onClick={() => {
          if (!disabled) inputRef.current?.click();
        }}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center transition-colors duration-150 cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed bg-canvas',
          error
            ? 'border-tone-red-fg bg-tone-red-bg/20'
            : dragging
              ? 'border-teal-ink bg-tint-mint'
              : 'border-line-input bg-surface-soft hover:border-teal-ink hover:bg-tint-mint/50',
        )}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => {
            acceptFiles(e.target.files);
            e.target.value = '';
          }}
          className="sr-only"
        />
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-teal-ink">
          <Upload className="w-4 h-4" strokeWidth={1.5} />
        </span>
        <p className="m-0 text-sm text-ink-secondary">
          <span className="font-medium text-teal-ink underline underline-offset-2">{buttonText}</span>{' '}
          {dropHint}
        </p>
        {hint && <p className="m-0 text-xs text-ink-muted">{hint}</p>}
      </div>

      {files.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${index}`}
              className="flex items-center justify-between gap-3 rounded-[10px] border border-line bg-surface px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <FileText className="w-4 h-4 shrink-0 text-teal-ink" strokeWidth={1.5} />
                <span className="truncate text-sm font-medium text-ink">{file.name}</span>
                <span className="shrink-0 font-mono text-xs text-ink-muted tabular-nums">
                  {formatBytes(file.size)}
                </span>
              </div>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  removeAt(index);
                }}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-muted hover:bg-canvas hover:text-ink transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="m-0 text-xs text-tone-red-ink">{error}</p>}
    </div>
  );
}
