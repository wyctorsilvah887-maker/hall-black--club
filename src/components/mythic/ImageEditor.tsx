
"use client"

import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { getCroppedImg } from '@/lib/image-utils'
import { Check, X, RotateCw, ZoomIn } from 'lucide-react'

interface ImageEditorProps {
  image: string
  cropShape?: 'rect' | 'round'
  onCancel: () => void
  onConfirm: (croppedImageDataUrl: string) => void
}

export function ImageEditor({ image, cropShape = 'rect', onCancel, onConfirm }: ImageEditorProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleConfirm = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation)
      onConfirm(croppedImage)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="relative w-full aspect-square bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={1}
          cropShape={cropShape}
          showGrid={false}
          onCropChange={setCrop}
          onRotationChange={setRotation}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
          style={{
            containerStyle: { background: '#000' },
            cropAreaStyle: { border: '2px solid hsl(var(--primary))' }
          }}
        />
      </div>

      <div className="space-y-4 px-1">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-2">
              <ZoomIn className="w-3 h-3" /> Zoom
            </Label>
            <span className="text-[10px] font-mono text-zinc-600">{Math.round(zoom * 100)}%</span>
          </div>
          <Slider
            value={[zoom]}
            min={1}
            max={3}
            step={0.1}
            onValueChange={(vals) => setZoom(vals[0])}
            className="py-2"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-2">
              <RotateCw className="w-3 h-3" /> Inclinação
            </Label>
            <span className="text-[10px] font-mono text-zinc-600">{rotation}°</span>
          </div>
          <Slider
            value={[rotation]}
            min={0}
            max={360}
            step={1}
            onValueChange={(vals) => setRotation(vals[0])}
            className="py-2"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="flex-1 h-12 rounded-full border-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-900 hover:text-white"
        >
          <X className="w-4 h-4 mr-2" /> Cancelar
        </Button>
        <Button 
          onClick={handleConfirm}
          className="flex-1 h-12 rounded-full bg-primary hover:bg-accent text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
        >
          <Check className="w-4 h-4 mr-2" /> Aplicar
        </Button>
      </div>
    </div>
  )
}
