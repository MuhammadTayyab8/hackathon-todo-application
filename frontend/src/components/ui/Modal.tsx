'use client'

import { X } from 'lucide-react'
import { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#191A23] bg-opacity-80 z-50 transition-opacity duration-200"
        onClick={onClose}
        style={{ animation: 'fadeIn 200ms ease-out' }}
      />

      {/* Modal Card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-xl w-full max-w-[500px] max-h-[80vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          style={{
            animation: 'scaleIn 200ms ease-out',
            boxShadow: '0 8px 32px rgba(25, 26, 35, 0.2)'
          }}>

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#F3F3F3]">
            <h2
              className="text-2xl font-bold text-[#191A23]"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#191A23] hover:bg-[#B9FF66] transition-all duration-200"
              aria-label="Close modal">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  )
}
