'use client'

import React, { useRef, useState } from 'react'
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react'

interface ScreenshotUploadProps {
  file: File | null
  setFile: (file: File | null) => void
  error?: string
}

export function ScreenshotUpload({ file, setFile, error }: ScreenshotUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [localError, setLocalError] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (selectedFile: File) => {
    setLocalError('')
    if (!selectedFile.type.startsWith('image/')) {
      setLocalError('Please upload an image file.')
      return
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setLocalError('File size must be less than 5MB.')
      return
    }
    setFile(selectedFile)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const previewUrl = file ? URL.createObjectURL(file) : null

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[var(--color-muted)] block font-body">
        Attach Screenshot (Optional)
      </span>
      
      {file && previewUrl ? (
        <div className="relative w-full h-32 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden flex items-center justify-center group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Trade screenshot preview" className="object-cover w-full h-full" />
          <button
            type="button"
            onClick={() => setFile(null)}
            className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
            dragActive
              ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
              : 'border-[var(--color-border-soft)] bg-[var(--color-surface)] hover:border-[var(--color-muted-dark)] hover:bg-[var(--color-surface-hover)] text-[var(--color-muted)]'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
          <div className="p-2.5 rounded-full bg-[var(--color-surface-alt)] shadow-sm">
            {dragActive ? <UploadCloud size={20} /> : <ImageIcon size={20} />}
          </div>
          <div className="text-xs font-medium text-center">
            {dragActive ? 'Drop image here' : 'Drag & drop or click to upload'}
          </div>
        </div>
      )}

      {(localError || error) && (
        <span className="text-[10px] text-[var(--color-loss)] mt-1">
          {localError || error}
        </span>
      )}
    </div>
  )
}
