'use client'

import React from 'react'
import { motion } from 'motion/react'
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'

export interface AmbientBackgroundProps {
  color1?: string
  color2?: string
  color3?: string
  opacity?: number
  brightness?: number
  uSpeed?: number
  cSpeed?: number
  className?: string
  [key: string]: any
}

export function AmbientBackground({
  color1 = '#09090B', // Deepest background
  color2 = '#152518', // Deep Emerald Green (Brand Profit Dim)
  color3 = '#10151C', // Deep Slate Blue (Brand Accent Dim)
  opacity = 0.85,
  brightness = 0.6, // slightly darker
  uSpeed = 0.01,
  cSpeed = 0.01,
  className = '',
  ...customProps
}: AmbientBackgroundProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
      className={`fixed inset-0 w-screen h-screen pointer-events-none z-[-1] overflow-hidden ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    >
      <ShaderGradientCanvas
        fov={45}
        pixelDensity={1}
        pointerEvents="none"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        <ShaderGradient
          {...({
            animate: 'on',
            axesHelper: 'off',
            brightness,
            cAzimuthAngle: 180,
            cDistance: 3.6,
            cPolarAngle: 90,
            cameraZoom: 1,
            color1,
            color2,
            color3,
            destination: 'onCanvas',
            embedMode: 'off',
            envPreset: 'city',
            format: 'gif',
            fov: 45,
            frameRate: 10,
            gizmoHelper: 'hide',
            grain: 'on',
            grainBlending: 0.25,
            lightType: '3d',
            pixelDensity: 1,
            positionX: -1.4,
            positionY: 0,
            positionZ: 0,
            range: 'disabled',
            rangeEnd: 40,
            rangeStart: 0,
            reflection: 0.1,
            rotationX: 0,
            rotationY: 10,
            rotationZ: 50,
            shader: 'defaults',
            type: 'plane',
            uAmplitude: 1,
            uDensity: 1.3,
            uFrequency: 5.5,
            uSpeed,
            cSpeed,
            uStrength: 4,
            uTime: 0,
            wireframe: false,
            ...customProps,
          } as any)}
        />
      </ShaderGradientCanvas>
    </motion.div>
  )
}

export default AmbientBackground

