'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { X, Loader2 } from 'lucide-react'
import { getTradeScreenshotUrl } from '@/actions/trades'

interface ScreenshotLightboxProps {
  screenshotPath: string
  onClose: () => void
}

export function ScreenshotLightbox({ screenshotPath, onClose }: ScreenshotLightboxProps) {
  const [mounted, setMounted] = useState(false)
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    const fetchUrl = async () => {
      const res = await getTradeScreenshotUrl(screenshotPath)
      if (res.url) setUrl(res.url)
      setLoading(false)
    }
    fetchUrl()
  }, [screenshotPath])

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

        {loading ? (
          <div className="flex flex-col items-center text-white/70 gap-3">
            <Loader2 size={32} className="animate-spin" />
            <span className="text-sm font-medium">Loading screenshot...</span>
          </div>
        ) : url ? (
          <motion.img
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            src={url}
            alt="Trade Screenshot"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="text-white/70 text-sm bg-white/10 px-4 py-2 rounded-lg">
            Failed to load screenshot
          </div>
        )}
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
