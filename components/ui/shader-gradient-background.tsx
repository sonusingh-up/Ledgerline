'use client'

import React from 'react'
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'

export interface ShaderGradientBackgroundProps {
  className?: string
  style?: React.CSSProperties
  [key: string]: any
}

export default function ShaderGradientBackground({
  className,
  style,
  ...customProps
}: ShaderGradientBackgroundProps) {
  return (
    <div className={`relative w-full h-full overflow-hidden ${className || ''}`} style={style}>
      <ShaderGradientCanvas
        fov={45}
        pixelDensity={1}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <ShaderGradient
          {...({
            animate: "on",
            brightness: 1.2,
            cAzimuthAngle: 180,
            cDistance: 3.6,
            cPolarAngle: 90,
            cameraZoom: 1,
            color1: "#ff5005",
            color2: "#dbba95",
            color3: "#d0bce1",
            envPreset: "city",
            grain: "on",
            lightType: "3d",
            positionX: -1.4,
            positionY: 0,
            positionZ: 0,
            range: "disabled",
            rangeEnd: 40,
            rangeStart: 0,
            reflection: 0.1,
            rotationX: 0,
            rotationY: 10,
            rotationZ: 50,
            shader: "defaults",
            type: "plane",
            uAmplitude: 1,
            uDensity: 1.3,
            uFrequency: 5.5,
            uSpeed: 0.4,
            uStrength: 4,
            uTime: 0,
            wireframe: false,
            ...customProps,
          } as any)}
        />
      </ShaderGradientCanvas>
    </div>
  )
}

