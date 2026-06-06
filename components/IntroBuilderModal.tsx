"use client"

import React, { useState, useRef, useEffect } from "react"
import { X, Image as ImageIcon, Type, Download, Trash2, Check, ArrowRight } from "lucide-react"

export interface IntroElement {
  id: string
  type: "image" | "text"
  content: string // Base64 for image, string for text
  x: number
  y: number
  width: number
  height: number
  fontSize?: number
  color?: string
}

interface IntroBuilderModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (base64Png: string | null) => void
  format: "landscape" | "portrait"
}

export default function IntroBuilderModal({ isOpen, onClose, onExport, format }: IntroBuilderModalProps) {
  const [elements, setElements] = useState<IntroElement[]>([])
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [resizingId, setResizingId] = useState<string | null>(null)
  const [activeElementId, setActiveElementId] = useState<string | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const dragStartPos = useRef({ x: 0, y: 0 })
  const elementStartPos = useRef({ x: 0, y: 0, w: 0, h: 0 })

  if (!isOpen) return null

  // Canvas dimensions based on format
  const canvasWidth = format === "portrait" ? 360 : 640
  const canvasHeight = format === "portrait" ? 640 : 360

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new window.Image()
      img.src = event.target?.result as string
      img.onload = () => {
        // Calculate initial size preserving aspect ratio
        let w = img.width
        let h = img.height
        const maxW = canvasWidth * 0.5
        if (w > maxW) {
          h = (maxW / w) * h
          w = maxW
        }
        const newId = `img-${Date.now()}`
        setElements([...elements, {
          id: newId,
          type: "image",
          content: event.target?.result as string,
          x: canvasWidth / 2 - w / 2,
          y: canvasHeight / 2 - h / 2,
          width: w,
          height: h
        }])
        setActiveElementId(newId)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleAddText = () => {
    const newId = `txt-${Date.now()}`
    setElements([...elements, {
      id: newId,
      type: "text",
      content: "EDIT TEKS\nDISINI",
      x: 50,
      y: canvasHeight / 2,
      width: 250,
      height: 100,
      fontSize: 32,
      color: "#ffffff"
    }])
    setActiveElementId(newId)
  }

  // Drag and Drop Logic
  const onPointerDown = (e: React.PointerEvent, id: string, isResize: boolean = false) => {
    e.stopPropagation()
    const el = elements.find(el => el.id === id)
    if (!el) return
    
    setActiveElementId(id)
    if (isResize) {
      setResizingId(id)
    } else {
      setDraggingId(id)
    }
    dragStartPos.current = { x: e.clientX, y: e.clientY }
    elementStartPos.current = { x: el.x, y: el.y, w: el.width, h: el.height }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingId && !resizingId) return
    
    const dx = e.clientX - dragStartPos.current.x
    const dy = e.clientY - dragStartPos.current.y

    setElements(elements.map(el => {
      if (el.id === draggingId) {
        return { ...el, x: elementStartPos.current.x + dx, y: elementStartPos.current.y + dy }
      }
      if (el.id === resizingId) {
        // Simple uniform resize for images, width resize for text
        const newW = Math.max(20, elementStartPos.current.w + dx)
        const ratio = el.height / el.width
        const newH = el.type === "image" ? newW * ratio : elementStartPos.current.h + dy
        return { ...el, width: newW, height: newH }
      }
      return el
    }))
  }

  const onPointerUp = () => {
    setDraggingId(null)
    setResizingId(null)
  }

  const updateText = (id: string, text: string) => {
    setElements(elements.map(el => el.id === id ? { ...el, content: text } : el))
  }

  const updateColor = (id: string, color: string) => {
    setElements(elements.map(el => el.id === id ? { ...el, color } : el))
  }

  const updateFontSize = (id: string, size: number) => {
    setElements(elements.map(el => el.id === id ? { ...el, fontSize: size } : el))
  }

  const removeElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id))
    if (activeElementId === id) setActiveElementId(null)
  }

  // Export to Canvas Base64
  const handleFinalExport = () => {
    const canvas = document.createElement("canvas")
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Draw Transparent Background (we just leave it blank, so it's transparent)
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    // Wait for all images to load before rendering
    let loadedCount = 0
    const imgElements = elements.filter(el => el.type === "image")
    
    const drawElements = () => {
      elements.forEach(el => {
        if (el.type === "image") {
          const img = new window.Image()
          img.src = el.content
          ctx.drawImage(img, el.x, el.y, el.width, el.height)
        } else if (el.type === "text") {
          ctx.font = `bold ${el.fontSize || 28}px Arial Black, sans-serif`
          ctx.fillStyle = el.color || "#ffffff"
          ctx.strokeStyle = "#000000"
          ctx.lineWidth = (el.fontSize || 28) * 0.15
          ctx.textAlign = "left"
          ctx.textBaseline = "top"
          // Stroke then fill for outline effect
          ctx.strokeText(el.content, el.x, el.y)
          ctx.fillText(el.content, el.x, el.y)
        }
      })
      onExport(canvas.toDataURL("image/png"))
    }

    if (imgElements.length === 0) {
      drawElements()
    } else {
      let currentLoaded = 0
      elements.forEach(el => {
        if (el.type === "image") {
          const img = new window.Image()
          img.src = el.content
          img.onload = () => {
            currentLoaded++
            if (currentLoaded === imgElements.length) {
              drawElements()
            }
          }
        }
      })
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl flex-shrink-0 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-brand" />
              Intro Hook Builder <span className="px-2 py-0.5 rounded-full bg-brand/10 text-brand text-[10px] uppercase tracking-wider">Opsional</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Desain stiker atau teks yang akan muncul di <b className="text-brand">1 detik pertama</b> video Anda.
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left: Toolbar & Properties */}
          <div className="w-72 bg-slate-50 border-r border-slate-200 p-5 overflow-y-auto flex flex-col gap-6">
            
            <div className="flex flex-col gap-3">
              <label className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-brand/40 bg-brand/5 hover:bg-brand/10 text-brand rounded-2xl cursor-pointer transition-all hover:border-brand">
                <ImageIcon className="w-5 h-5" />
                <span className="font-bold text-sm">Upload Cutout / Image</span>
                <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleImageUpload} />
              </label>

              <button onClick={handleAddText} className="flex items-center justify-center gap-2 w-full p-4 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 rounded-2xl transition-all shadow-sm">
                <Type className="w-5 h-5" />
                <span className="font-bold text-sm">Add Text</span>
              </button>
            </div>

            {/* Active Element Properties */}
            {activeElementId && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Edit Element</h3>
                  <button onClick={() => removeElement(activeElementId)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {elements.find(e => e.id === activeElementId)?.type === "text" && (
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Text Content</label>
                      <textarea 
                        value={elements.find(e => e.id === activeElementId)?.content}
                        onChange={(e) => updateText(activeElementId, e.target.value)}
                        className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand focus:border-brand"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Size</label>
                        <input 
                          type="number" 
                          value={elements.find(e => e.id === activeElementId)?.fontSize || ""}
                          onChange={(e) => updateFontSize(activeElementId, parseInt(e.target.value) || 0)}
                          className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Color</label>
                        <input 
                          type="color" 
                          value={elements.find(e => e.id === activeElementId)?.color}
                          onChange={(e) => updateColor(activeElementId, e.target.value)}
                          className="w-full h-[38px] mt-1 p-1 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {elements.find(e => e.id === activeElementId)?.type === "image" && (
                  <p className="text-xs text-slate-500 font-medium">
                    Drag the image to move, or drag the bottom-right handle to resize.
                  </p>
                )}
              </div>
            )}

          </div>

          {/* Right: Canvas Stage */}
          <div 
            className="flex-1 bg-slate-200/50 flex items-center justify-center p-8 overflow-hidden checkerboard-bg relative"
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            {/* Checkerboard Pattern for transparent background hint */}
            <style dangerouslySetInnerHTML={{__html: `
              .checkerboard-bg {
                background-image: linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%);
                background-size: 20px 20px;
                background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
              }
            `}} />

            <div 
              ref={containerRef}
              className="bg-transparent border border-slate-300 relative shadow-2xl overflow-hidden ring-4 ring-white/50"
              style={{ width: canvasWidth, height: canvasHeight }}
              onPointerDown={() => setActiveElementId(null)}
            >
              {elements.map(el => (
                <div
                  key={el.id}
                  className={`absolute cursor-move group ${activeElementId === el.id ? 'ring-2 ring-brand' : 'hover:ring-2 hover:ring-brand/50'}`}
                  style={{
                    left: el.x,
                    top: el.y,
                    width: el.width,
                    height: el.height,
                  }}
                  onPointerDown={(e) => onPointerDown(e, el.id)}
                >
                  {el.type === "image" ? (
                    <img src={el.content} alt="element" className="w-full h-full object-contain pointer-events-none" />
                  ) : (
                    <div 
                      className="w-full h-full flex items-start"
                      style={{ 
                        color: el.color, 
                        fontSize: el.fontSize, 
                        fontFamily: "'Arial Black', sans-serif",
                        fontWeight: "900",
                        WebkitTextStroke: `${(el.fontSize || 28) * 0.15}px black`,
                        paintOrder: "stroke fill"
                      }}
                    >
                      <span className="pointer-events-none leading-tight drop-shadow-md whitespace-pre-wrap">{el.content}</span>
                    </div>
                  )}

                  {/* Resize Handle */}
                  {activeElementId === el.id && (
                    <div 
                      className="absolute -right-2 -bottom-2 w-5 h-5 bg-white border-2 border-brand rounded-full shadow-sm cursor-nwse-resize z-10"
                      onPointerDown={(e) => onPointerDown(e, el.id, true)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-white">
          <button 
            onClick={() => onExport(null)}
            className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-bold transition-all"
          >
            Lewati, Export Tanpa Intro
          </button>
          <button 
            onClick={handleFinalExport}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl text-sm font-extrabold shadow-brand/20 shadow-lg transition-all active:scale-95"
          >
            Lanjutkan Export <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  )
}
