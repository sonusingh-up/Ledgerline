'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { X, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface ImageLightboxProps {
  imageUrl: string
  onClose: () => void
}

export function ImageLightbox({ imageUrl, onClose }: ImageLightboxProps) {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-lg backdrop-blur-md transition-all z-10"
        >
          <X size={24} />
        </button>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-5xl h-[85vh] flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70 gap-3 z-0">
              <Loader2 size={32} className="animate-spin" />
              <span className="text-sm font-medium">Loading image...</span>
            </div>
          )}
          <Image
            src={imageUrl}
            alt="Zoomed Journal Image"
            fill
            className={`object-contain rounded-lg shadow-2xl transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setLoading(false)}
            unoptimized
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
