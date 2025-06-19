"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

export default function Component() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<"playing" | "paused" | "gameOver" | "levelComplete">("playing")
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [currentLevel, setCurrentLevel] = useState(1)
  const [barneyImage, setBarneyImage] = useState<HTMLImageElement | null>(null)
  const [showBaconGermer, setShowBaconGermer] = useState(false)

  // Load Barney image
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => setBarneyImage(img)
    img.src = "/barney-head.webp"
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Game variables
    let animationId: number
    const gravity = 0.8
    const jumpPower = -15
    const speed = 5
    let baconGermerTimer = 0
    let wolfTimer = 150

    // Player (Barney)
    const player = {
      x: 100,
      y: 300,
      width: 50,
      height: 50,
      velocityX: 0,
      velocityY: 0,
      onGround: false,
    }

    // Bacon Germer NPC
    const baconGermer = {
      x: 0,
      y: 0,
      width: 40,
      height: 30,
      visible: false,
    }

    // Wolf NPC
    const wolf = {
      x: 0,
      y: 0,
      width: 45,
      height: 35,
      visible: false,
    }

    // Extended level configurations with more platforms
    const levels = {
      1: {
        name: "Caerleon Gardens - Entrada",
        background: "#87CEEB",
        platforms: [
          { x: 0, y: 550, width: 800, height: 50 },
          { x: 120, y: 480, width: 120, height: 15 },
          { x: 250, y: 420, width: 130, height: 15 },
          { x: 380, y: 360, width: 120, height: 15 },
          { x: 520, y: 300, width: 140, height: 15 },
          { x: 150, y: 240, width: 120, height: 15 },
          { x: 350, y: 180, width: 160, height: 15 },
          { x: 550, y: 120, width: 120, height: 15 },
          { x: 50, y: 120, width: 120, height: 15 },
        ],
        crystals: [
          { x: 140, y: 450, width: 20, height: 20, collected: false },
          { x: 270, y: 390, width: 20, height: 20, collected: false },
          { x: 400, y: 330, width: 20, height: 20, collected: false },
          { x: 540, y: 270, width: 20, height: 20, collected: false },
          { x: 170, y: 210, width: 20, height: 20, collected: false },
          { x: 370, y: 150, width: 20, height: 20, collected: false },
        ],
        enemies: [{ x: 270, y: 400, width: 30, height: 20, direction: 1, speed: 1.5 }],
        theme: "forest",
        baconGermerPos: { x: 600, y: 500 },
        wolfPos: { x: 50, y: 450 },
      },
      2: {
        name: "Caerleon Gardens - Bosque Profundo",
        background: "#228B22",
        platforms: [
          { x: 0, y: 550, width: 150, height: 50 },
          { x: 200, y: 550, width: 600, height: 50 },
          { x: 80, y: 480, width: 110, height: 15 },
          { x: 180, y: 420, width: 120, height: 15 },
          { x: 300, y: 380, width: 130, height: 15 },
          { x: 450, y: 320, width: 120, height: 15 },
          { x: 600, y: 280, width: 140, height: 15 },
          { x: 200, y: 240, width: 160, height: 15 },
          { x: 400, y: 180, width: 120, height: 15 },
          { x: 100, y: 160, width: 120, height: 15 },
          { x: 550, y: 140, width: 130, height: 15 },
        ],
        crystals: [
          { x: 100, y: 450, width: 20, height: 20, collected: false },
          { x: 200, y: 390, width: 20, height: 20, collected: false },
          { x: 320, y: 350, width: 20, height: 20, collected: false },
          { x: 470, y: 290, width: 20, height: 20, collected: false },
          { x: 620, y: 250, width: 20, height: 20, collected: false },
          { x: 220, y: 210, width: 20, height: 20, collected: false },
          { x: 420, y: 150, width: 20, height: 20, collected: false },
        ],
        enemies: [
          { x: 200, y: 400, width: 30, height: 20, direction: 1, speed: 1.5 },
          { x: 470, y: 300, width: 30, height: 20, direction: -1, speed: 2 },
        ],
        theme: "forest",
        baconGermerPos: { x: 50, y: 500 },
        wolfPos: { x: 700, y: 450 },
      },
      3: {
        name: "Bridgewatch Cliffs - Deserto Inicial",
        background: "#D2B48C",
        platforms: [
          { x: 0, y: 550, width: 200, height: 50 },
          { x: 300, y: 550, width: 500, height: 50 },
          { x: 120, y: 480, width: 100, height: 15 },
          { x: 220, y: 430, width: 110, height: 15 },
          { x: 350, y: 400, width: 120, height: 15 },
          { x: 480, y: 350, width: 130, height: 15 },
          { x: 620, y: 300, width: 120, height: 15 },
          { x: 200, y: 280, width: 140, height: 15 },
          { x: 400, y: 220, width: 160, height: 15 },
          { x: 100, y: 180, width: 120, height: 15 },
          { x: 550, y: 160, width: 140, height: 15 },
          { x: 300, y: 120, width: 120, height: 15 },
        ],
        crystals: [
          { x: 140, y: 450, width: 20, height: 20, collected: false },
          { x: 240, y: 400, width: 20, height: 20, collected: false },
          { x: 370, y: 370, width: 20, height: 20, collected: false },
          { x: 500, y: 320, width: 20, height: 20, collected: false },
          { x: 640, y: 270, width: 20, height: 20, collected: false },
          { x: 220, y: 250, width: 20, height: 20, collected: false },
          { x: 420, y: 190, width: 20, height: 20, collected: false },
          { x: 320, y: 90, width: 20, height: 20, collected: false },
        ],
        enemies: [
          { x: 240, y: 410, width: 30, height: 20, direction: 1, speed: 2 },
          { x: 500, y: 330, width: 30, height: 20, direction: -1, speed: 2 },
          { x: 420, y: 200, width: 30, height: 20, direction: 1, speed: 1.5 },
        ],
        theme: "desert",
        baconGermerPos: { x: 250, y: 500 },
        wolfPos: { x: 150, y: 450 },
      },
      4: {
        name: "Bridgewatch Cliffs - Oásis Perdido",
        background: "#F4A460",
        platforms: [
          { x: 0, y: 550, width: 800, height: 50 },
          { x: 60, y: 490, width: 100, height: 15 },
          { x: 150, y: 450, width: 110, height: 15 },
          { x: 250, y: 410, width: 120, height: 15 },
          { x: 370, y: 370, width: 130, height: 15 },
          { x: 500, y: 330, width: 120, height: 15 },
          { x: 620, y: 290, width: 140, height: 15 },
          { x: 180, y: 250, width: 160, height: 15 },
          { x: 350, y: 210, width: 120, height: 15 },
          { x: 500, y: 170, width: 130, height: 15 },
          { x: 100, y: 130, width: 140, height: 15 },
          { x: 400, y: 90, width: 120, height: 15 },
        ],
        crystals: [
          { x: 80, y: 460, width: 20, height: 20, collected: false },
          { x: 170, y: 420, width: 20, height: 20, collected: false },
          { x: 270, y: 380, width: 20, height: 20, collected: false },
          { x: 390, y: 340, width: 20, height: 20, collected: false },
          { x: 520, y: 300, width: 20, height: 20, collected: false },
          { x: 640, y: 260, width: 20, height: 20, collected: false },
          { x: 200, y: 220, width: 20, height: 20, collected: false },
          { x: 370, y: 180, width: 20, height: 20, collected: false },
          { x: 420, y: 60, width: 20, height: 20, collected: false },
        ],
        enemies: [
          { x: 170, y: 430, width: 30, height: 20, direction: 1, speed: 2 },
          { x: 390, y: 350, width: 30, height: 20, direction: -1, speed: 2.5 },
          { x: 520, y: 310, width: 30, height: 20, direction: 1, speed: 2 },
          { x: 370, y: 190, width: 30, height: 20, direction: -1, speed: 1.5 },
        ],
        theme: "desert",
        baconGermerPos: { x: 700, y: 500 },
        wolfPos: { x: 650, y: 450 },
      },
      5: {
        name: "Thetford Mines - Entrada das Cavernas",
        background: "#2F2F2F",
        platforms: [
          { x: 0, y: 550, width: 800, height: 50 },
          { x: 80, y: 490, width: 100, height: 15 },
          { x: 180, y: 450, width: 110, height: 15 },
          { x: 280, y: 410, width: 120, height: 15 },
          { x: 400, y: 370, width: 130, height: 15 },
          { x: 530, y: 330, width: 120, height: 15 },
          { x: 650, y: 290, width: 140, height: 15 },
          { x: 150, y: 250, width: 160, height: 15 },
          { x: 350, y: 210, width: 120, height: 15 },
          { x: 500, y: 170, width: 130, height: 15 },
          { x: 200, y: 130, width: 140, height: 15 },
          { x: 450, y: 90, width: 120, height: 15 },
          { x: 50, y: 90, width: 120, height: 15 },
        ],
        crystals: [
          { x: 100, y: 460, width: 20, height: 20, collected: false },
          { x: 200, y: 420, width: 20, height: 20, collected: false },
          { x: 300, y: 380, width: 20, height: 20, collected: false },
          { x: 420, y: 340, width: 20, height: 20, collected: false },
          { x: 550, y: 300, width: 20, height: 20, collected: false },
          { x: 670, y: 260, width: 20, height: 20, collected: false },
          { x: 170, y: 220, width: 20, height: 20, collected: false },
          { x: 370, y: 180, width: 20, height: 20, collected: false },
          { x: 520, y: 140, width: 20, height: 20, collected: false },
          { x: 470, y: 60, width: 20, height: 20, collected: false },
        ],
        enemies: [
          { x: 200, y: 430, width: 30, height: 20, direction: 1, speed: 1.5 },
          { x: 420, y: 350, width: 30, height: 20, direction: -1, speed: 2 },
          { x: 550, y: 310, width: 30, height: 20, direction: 1, speed: 2.5 },
          { x: 370, y: 190, width: 30, height: 20, direction: -1, speed: 2 },
        ],
        theme: "cave",
        baconGermerPos: { x: 400, y: 500 },
        wolfPos: { x: 100, y: 450 },
      },
      6: {
        name: "Thetford Mines - Coração da Montanha",
        background: "#1C1C1C",
        platforms: [
          { x: 0, y: 550, width: 800, height: 50 },
          { x: 50, y: 490, width: 90, height: 15 },
          { x: 130, y: 450, width: 100, height: 15 },
          { x: 220, y: 410, width: 110, height: 15 },
          { x: 320, y: 370, width: 120, height: 15 },
          { x: 430, y: 330, width: 110, height: 15 },
          { x: 530, y: 290, width: 120, height: 15 },
          { x: 640, y: 250, width: 130, height: 15 },
          { x: 120, y: 210, width: 140, height: 15 },
          { x: 280, y: 170, width: 160, height: 15 },
          { x: 450, y: 130, width: 120, height: 15 },
          { x: 180, y: 90, width: 130, height: 15 },
          { x: 350, y: 50, width: 140, height: 15 },
        ],
        crystals: [
          { x: 70, y: 460, width: 20, height: 20, collected: false },
          { x: 150, y: 420, width: 20, height: 20, collected: false },
          { x: 240, y: 380, width: 20, height: 20, collected: false },
          { x: 340, y: 340, width: 20, height: 20, collected: false },
          { x: 450, y: 300, width: 20, height: 20, collected: false },
          { x: 550, y: 260, width: 20, height: 20, collected: false },
          { x: 660, y: 220, width: 20, height: 20, collected: false },
          { x: 140, y: 180, width: 20, height: 20, collected: false },
          { x: 300, y: 140, width: 20, height: 20, collected: false },
          { x: 470, y: 100, width: 20, height: 20, collected: false },
          { x: 200, y: 60, width: 20, height: 20, collected: false },
          { x: 370, y: 20, width: 20, height: 20, collected: false },
        ],
        enemies: [
          { x: 150, y: 430, width: 30, height: 20, direction: 1, speed: 2 },
          { x: 340, y: 350, width: 30, height: 20, direction: -1, speed: 2.5 },
          { x: 450, y: 310, width: 30, height: 20, direction: 1, speed: 3 },
          { x: 550, y: 270, width: 30, height: 20, direction: -1, speed: 2 },
          { x: 300, y: 150, width: 30, height: 20, direction: 1, speed: 2.5 },
        ],
        theme: "cave",
        baconGermerPos: { x: 100, y: 500 },
        wolfPos: { x: 600, y: 450 },
      },
      7: {
        name: "Martlock Swamps - Pântano Sombrio",
        background: "#2F4F2F",
        platforms: [
          { x: 0, y: 550, width: 120, height: 50 },
          { x: 180, y: 550, width: 140, height: 50 },
          { x: 380, y: 550, width: 120, height: 50 },
          { x: 560, y: 550, width: 240, height: 50 },
          { x: 60, y: 480, width: 100, height: 15 },
          { x: 200, y: 440, width: 110, height: 15 },
          { x: 350, y: 400, width: 120, height: 15 },
          { x: 500, y: 360, width: 130, height: 15 },
          { x: 650, y: 320, width: 120, height: 15 },
          { x: 150, y: 280, width: 140, height: 15 },
          { x: 320, y: 240, width: 160, height: 15 },
          { x: 500, y: 200, width: 120, height: 15 },
          { x: 100, y: 160, width: 130, height: 15 },
          { x: 400, y: 120, width: 140, height: 15 },
          { x: 250, y: 80, width: 120, height: 15 },
        ],
        crystals: [
          { x: 80, y: 450, width: 20, height: 20, collected: false },
          { x: 220, y: 410, width: 20, height: 20, collected: false },
          { x: 370, y: 370, width: 20, height: 20, collected: false },
          { x: 520, y: 330, width: 20, height: 20, collected: false },
          { x: 670, y: 290, width: 20, height: 20, collected: false },
          { x: 170, y: 250, width: 20, height: 20, collected: false },
          { x: 340, y: 210, width: 20, height: 20, collected: false },
          { x: 520, y: 170, width: 20, height: 20, collected: false },
          { x: 120, y: 130, width: 20, height: 20, collected: false },
          { x: 420, y: 90, width: 20, height: 20, collected: false },
          { x: 270, y: 50, width: 20, height: 20, collected: false },
        ],
        enemies: [
          { x: 220, y: 420, width: 30, height: 20, direction: 1, speed: 2.5 },
          { x: 520, y: 340, width: 30, height: 20, direction: -1, speed: 3 },
          { x: 340, y: 220, width: 30, height: 20, direction: 1, speed: 2.5 },
          { x: 420, y: 100, width: 30, height: 20, direction: -1, speed: 3 },
        ],
        theme: "swamp",
        baconGermerPos: { x: 700, y: 500 },
        wolfPos: { x: 30, y: 450 },
      },
      8: {
        name: "Martlock Swamps - Coração do Pântano",
        background: "#1C3A1C",
        platforms: [
          { x: 0, y: 550, width: 800, height: 50 },
          { x: 40, y: 490, width: 80, height: 15 },
          { x: 140, y: 450, width: 90, height: 15 },
          { x: 250, y: 410, width: 100, height: 15 },
          { x: 370, y: 370, width: 110, height: 15 },
          { x: 500, y: 330, width: 100, height: 15 },
          { x: 620, y: 290, width: 120, height: 15 },
          { x: 180, y: 250, width: 140, height: 15 },
          { x: 350, y: 210, width: 100, height: 15 },
          { x: 480, y: 170, width: 110, height: 15 },
          { x: 200, y: 130, width: 120, height: 15 },
          { x: 400, y: 90, width: 100, height: 15 },
          { x: 100, y: 50, width: 110, height: 15 },
          { x: 550, y: 50, width: 120, height: 15 },
        ],
        crystals: [
          { x: 60, y: 460, width: 20, height: 20, collected: false },
          { x: 160, y: 420, width: 20, height: 20, collected: false },
          { x: 270, y: 380, width: 20, height: 20, collected: false },
          { x: 390, y: 340, width: 20, height: 20, collected: false },
          { x: 520, y: 300, width: 20, height: 20, collected: false },
          { x: 640, y: 260, width: 20, height: 20, collected: false },
          { x: 200, y: 220, width: 20, height: 20, collected: false },
          { x: 370, y: 180, width: 20, height: 20, collected: false },
          { x: 500, y: 140, width: 20, height: 20, collected: false },
          { x: 220, y: 100, width: 20, height: 20, collected: false },
          { x: 420, y: 60, width: 20, height: 20, collected: false },
          { x: 120, y: 20, width: 20, height: 20, collected: false },
          { x: 570, y: 20, width: 20, height: 20, collected: false },
        ],
        enemies: [
          { x: 160, y: 430, width: 30, height: 20, direction: 1, speed: 3 },
          { x: 390, y: 350, width: 30, height: 20, direction: -1, speed: 3.5 },
          { x: 520, y: 310, width: 30, height: 20, direction: 1, speed: 3 },
          { x: 370, y: 190, width: 30, height: 20, direction: -1, speed: 3.5 },
          { x: 220, y: 110, width: 30, height: 20, direction: 1, speed: 3 },
        ],
        theme: "swamp",
        baconGermerPos: { x: 300, y: 500 },
        wolfPos: { x: 500, y: 450 },
      },
      9: {
        name: "Fort Sterling - Fortaleza Gelada",
        background: "#B0E0E6",
        platforms: [
          { x: 0, y: 550, width: 800, height: 50 },
          { x: 50, y: 490, width: 80, height: 15 },
          { x: 150, y: 450, width: 90, height: 15 },
          { x: 260, y: 410, width: 100, height: 15 },
          { x: 380, y: 370, width: 90, height: 15 },
          { x: 490, y: 330, width: 100, height: 15 },
          { x: 610, y: 290, width: 110, height: 15 },
          { x: 120, y: 250, width: 120, height: 15 },
          { x: 280, y: 210, width: 140, height: 15 },
          { x: 450, y: 170, width: 100, height: 15 },
          { x: 180, y: 130, width: 110, height: 15 },
          { x: 350, y: 90, width: 120, height: 15 },
          { x: 500, y: 50, width: 100, height: 15 },
          { x: 50, y: 50, width: 90, height: 15 },
        ],
        crystals: [
          { x: 70, y: 460, width: 20, height: 20, collected: false },
          { x: 170, y: 420, width: 20, height: 20, collected: false },
          { x: 280, y: 380, width: 20, height: 20, collected: false },
          { x: 400, y: 340, width: 20, height: 20, collected: false },
          { x: 510, y: 300, width: 20, height: 20, collected: false },
          { x: 630, y: 260, width: 20, height: 20, collected: false },
          { x: 140, y: 220, width: 20, height: 20, collected: false },
          { x: 300, y: 180, width: 20, height: 20, collected: false },
          { x: 470, y: 140, width: 20, height: 20, collected: false },
          { x: 200, y: 100, width: 20, height: 20, collected: false },
          { x: 370, y: 60, width: 20, height: 20, collected: false },
          { x: 520, y: 20, width: 20, height: 20, collected: false },
          { x: 70, y: 20, width: 20, height: 20, collected: false },
        ],
        enemies: [
          { x: 170, y: 430, width: 30, height: 20, direction: 1, speed: 3.5 },
          { x: 400, y: 350, width: 30, height: 20, direction: -1, speed: 4 },
          { x: 510, y: 310, width: 30, height: 20, direction: 1, speed: 3.5 },
          { x: 300, y: 190, width: 30, height: 20, direction: -1, speed: 4 },
          { x: 200, y: 110, width: 30, height: 20, direction: 1, speed: 3.5 },
          { x: 370, y: 70, width: 30, height: 20, direction: -1, speed: 4 },
        ],
        theme: "snow",
        baconGermerPos: { x: 650, y: 500 },
        wolfPos: { x: 150, y: 450 },
      },
      10: {
        name: "Avalon - Portal Final",
        background: "#4B0082",
        platforms: [
          { x: 0, y: 550, width: 800, height: 50 },
          { x: 60, y: 490, width: 70, height: 15 },
          { x: 150, y: 450, width: 80, height: 15 },
          { x: 250, y: 410, width: 90, height: 15 },
          { x: 360, y: 370, width: 80, height: 15 },
          { x: 460, y: 330, width: 90, height: 15 },
          { x: 570, y: 290, width: 100, height: 15 },
          { x: 680, y: 250, width: 110, height: 15 },
          { x: 100, y: 210, width: 120, height: 15 },
          { x: 240, y: 170, width: 130, height: 15 },
          { x: 390, y: 130, width: 100, height: 15 },
          { x: 510, y: 90, width: 110, height: 15 },
          { x: 150, y: 50, width: 120, height: 15 },
          { x: 350, y: 10, width: 100, height: 15 },
        ],
        crystals: [
          { x: 80, y: 460, width: 20, height: 20, collected: false },
          { x: 170, y: 420, width: 20, height: 20, collected: false },
          { x: 270, y: 380, width: 20, height: 20, collected: false },
          { x: 380, y: 340, width: 20, height: 20, collected: false },
          { x: 480, y: 300, width: 20, height: 20, collected: false },
          { x: 590, y: 260, width: 20, height: 20, collected: false },
          { x: 700, y: 220, width: 20, height: 20, collected: false },
          { x: 120, y: 180, width: 20, height: 20, collected: false },
          { x: 260, y: 140, width: 20, height: 20, collected: false },
          { x: 410, y: 100, width: 20, height: 20, collected: false },
          { x: 530, y: 60, width: 20, height: 20, collected: false },
          { x: 170, y: 20, width: 20, height: 20, collected: false },
          { x: 370, y: -20, width: 20, height: 20, collected: false },
        ],
        enemies: [
          { x: 170, y: 430, width: 30, height: 20, direction: 1, speed: 4 },
          { x: 380, y: 350, width: 30, height: 20, direction: -1, speed: 4.5 },
          { x: 480, y: 310, width: 30, height: 20, direction: 1, speed: 4 },
          { x: 590, y: 270, width: 30, height: 20, direction: -1, speed: 4.5 },
          { x: 120, y: 190, width: 30, height: 20, direction: 1, speed: 4 },
          { x: 260, y: 150, width: 30, height: 20, direction: -1, speed: 4.5 },
          { x: 410, y: 110, width: 30, height: 20, direction: 1, speed: 4 },
          { x: 530, y: 70, width: 30, height: 20, direction: -1, speed: 4.5 },
        ],
        theme: "avalon",
        baconGermerPos: { x: 400, y: 500 },
        wolfPos: { x: 200, y: 450 },
      },
    }

    const currentLevelData = levels[currentLevel as keyof typeof levels]
    if (!currentLevelData) return

    // Set Bacon Germer position
    baconGermer.x = currentLevelData.baconGermerPos.x
    baconGermer.y = currentLevelData.baconGermerPos.y

    // Set Wolf position
    wolf.x = currentLevelData.wolfPos.x
    wolf.y = currentLevelData.wolfPos.y

    // Input handling
    const keys: { [key: string]: boolean } = {}

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("keyup", handleKeyUp)

    // Collision detection
    const checkCollision = (rect1: any, rect2: any) => {
      return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
      )
    }

    // Draw themed background with Albion elements
    const drawBackground = (theme: string) => {
      ctx.fillStyle = currentLevelData.background
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (theme === "forest") {
        // Trees
        ctx.fillStyle = "#228B22"
        for (let i = 0; i < 6; i++) {
          const x = i * 130 + 30
          ctx.fillRect(x, 400, 15, 150)
          ctx.beginPath()
          ctx.arc(x + 7, 400, 25, 0, Math.PI * 2)
          ctx.fill()
        }

        // Albion runes on trees
        ctx.fillStyle = "#FFD700"
        ctx.font = "16px Arial"
        ctx.fillText("⚡", 50, 420)
        ctx.fillText("🔮", 180, 430)
        ctx.fillText("⭐", 310, 425)

        // Clouds
        ctx.fillStyle = "#FFFFFF"
        ctx.beginPath()
        ctx.arc(150, 80, 30, 0, Math.PI * 2)
        ctx.arc(170, 80, 35, 0, Math.PI * 2)
        ctx.arc(190, 80, 30, 0, Math.PI * 2)
        ctx.fill()
      } else if (theme === "desert") {
        // Sand dunes
        ctx.fillStyle = "#F4A460"
        ctx.beginPath()
        ctx.moveTo(0, 500)
        ctx.quadraticCurveTo(200, 450, 400, 500)
        ctx.quadraticCurveTo(600, 550, 800, 500)
        ctx.lineTo(800, 600)
        ctx.lineTo(0, 600)
        ctx.fill()

        // Albion obelisks
        ctx.fillStyle = "#8B7355"
        ctx.fillRect(100, 300, 20, 200)
        ctx.fillRect(600, 350, 20, 150)

        // Runes on obelisks
        ctx.fillStyle = "#00FFFF"
        ctx.font = "12px Arial"
        ctx.fillText("◊", 105, 350)
        ctx.fillText("◊", 605, 400)

        // Sun
        ctx.fillStyle = "#FFD700"
        ctx.beginPath()
        ctx.arc(700, 100, 40, 0, Math.PI * 2)
        ctx.fill()
      } else if (theme === "cave") {
        // Stalactites
        ctx.fillStyle = "#696969"
        for (let i = 0; i < 8; i++) {
          const x = i * 100 + 50
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x - 10, 50 + Math.random() * 30)
          ctx.lineTo(x + 10, 50 + Math.random() * 30)
          ctx.closePath()
          ctx.fill()
        }

        // Glowing Albion crystals on walls
        ctx.fillStyle = "#9400D3"
        ctx.shadowColor = "#9400D3"
        ctx.shadowBlur = 20
        for (let i = 0; i < 5; i++) {
          const x = i * 150 + 75
          const y = 200 + Math.random() * 200
          ctx.beginPath()
          ctx.arc(x, y, 6, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.shadowBlur = 0

        // Ancient Albion symbols
        ctx.fillStyle = "#FFD700"
        ctx.font = "20px Arial"
        ctx.fillText("⚔", 50, 300)
        ctx.fillText("🛡", 750, 250)
        ctx.fillText("👑", 400, 100)
      } else if (theme === "swamp") {
        // Árvores mortas do pântano
        ctx.fillStyle = "#2F2F2F"
        for (let i = 0; i < 4; i++) {
          const x = i * 200 + 100
          ctx.fillRect(x, 350, 10, 200)
          // Galhos mortos
          ctx.fillRect(x - 15, 400, 20, 3)
          ctx.fillRect(x + 5, 420, 15, 3)
        }

        // Névoa do pântano
        ctx.fillStyle = "rgba(169, 169, 169, 0.3)"
        for (let i = 0; i < 6; i++) {
          ctx.beginPath()
          ctx.arc(i * 130 + 65, 300 + Math.sin(i) * 50, 40, 0, Math.PI * 2)
          ctx.fill()
        }

        // Runas sombrias
        ctx.fillStyle = "#9400D3"
        ctx.font = "16px Arial"
        ctx.fillText("☠", 150, 380)
        ctx.fillText("🕷", 350, 390)
        ctx.fillText("🦇", 550, 375)
      } else if (theme === "snow") {
        // Montanhas nevadas
        ctx.fillStyle = "#FFFFFF"
        ctx.beginPath()
        ctx.moveTo(0, 400)
        ctx.lineTo(200, 200)
        ctx.lineTo(400, 350)
        ctx.lineTo(600, 150)
        ctx.lineTo(800, 300)
        ctx.lineTo(800, 600)
        ctx.lineTo(0, 600)
        ctx.fill()

        // Flocos de neve
        ctx.fillStyle = "#FFFFFF"
        for (let i = 0; i < 20; i++) {
          const x = Math.random() * 800
          const y = Math.random() * 400
          ctx.beginPath()
          ctx.arc(x, y, 2, 0, Math.PI * 2)
          ctx.fill()
        }

        // Cristais de gelo
        ctx.fillStyle = "#87CEEB"
        ctx.font = "20px Arial"
        ctx.fillText("❄", 100, 250)
        ctx.fillText("❄", 400, 200)
        ctx.fillText("❄", 700, 180)
      } else if (theme === "avalon") {
        // Portal mágico de fundo
        ctx.fillStyle = "#9400D3"
        ctx.shadowColor = "#9400D3"
        ctx.shadowBlur = 30
        ctx.beginPath()
        ctx.arc(400, 300, 150, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

        // Runas mágicas flutuantes
        ctx.fillStyle = "#FFD700"
        ctx.shadowColor = "#FFD700"
        ctx.shadowBlur = 15
        ctx.font = "24px Arial"
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2
          const x = 400 + Math.cos(angle) * 200
          const y = 300 + Math.sin(angle) * 100
          ctx.fillText("✦", x, y)
        }
        ctx.shadowBlur = 0

        // Estrelas mágicas
        ctx.fillStyle = "#FFFFFF"
        for (let i = 0; i < 30; i++) {
          const x = Math.random() * 800
          const y = Math.random() * 600
          ctx.beginPath()
          ctx.arc(x, y, 1, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    // Draw Bacon Germer NPC
    const drawBaconGermer = () => {
      if (!baconGermer.visible) return

      // Bacon shape - wavy like real bacon
      ctx.fillStyle = "#D2691E"
      ctx.beginPath()
      ctx.moveTo(baconGermer.x, baconGermer.y + 5)
      ctx.quadraticCurveTo(baconGermer.x + 10, baconGermer.y, baconGermer.x + 20, baconGermer.y + 3)
      ctx.quadraticCurveTo(baconGermer.x + 30, baconGermer.y + 7, baconGermer.x + 40, baconGermer.y + 2)
      ctx.lineTo(baconGermer.x + 40, baconGermer.y + 25)
      ctx.quadraticCurveTo(baconGermer.x + 30, baconGermer.y + 30, baconGermer.x + 20, baconGermer.y + 27)
      ctx.quadraticCurveTo(baconGermer.x + 10, baconGermer.y + 25, baconGermer.x, baconGermer.y + 28)
      ctx.closePath()
      ctx.fill()

      // Bacon fat stripes (white/pink)
      ctx.fillStyle = "#FFB6C1"
      ctx.beginPath()
      ctx.moveTo(baconGermer.x + 2, baconGermer.y + 8)
      ctx.quadraticCurveTo(baconGermer.x + 12, baconGermer.y + 6, baconGermer.x + 22, baconGermer.y + 9)
      ctx.quadraticCurveTo(baconGermer.x + 32, baconGermer.y + 12, baconGermer.x + 38, baconGermer.y + 8)
      ctx.lineTo(baconGermer.x + 38, baconGermer.y + 12)
      ctx.quadraticCurveTo(baconGermer.x + 32, baconGermer.y + 16, baconGermer.x + 22, baconGermer.y + 13)
      ctx.quadraticCurveTo(baconGermer.x + 12, baconGermer.y + 10, baconGermer.x + 2, baconGermer.y + 12)
      ctx.closePath()
      ctx.fill()

      // Another fat stripe
      ctx.beginPath()
      ctx.moveTo(baconGermer.x + 3, baconGermer.y + 18)
      ctx.quadraticCurveTo(baconGermer.x + 13, baconGermer.y + 16, baconGermer.x + 23, baconGermer.y + 19)
      ctx.quadraticCurveTo(baconGermer.x + 33, baconGermer.y + 22, baconGermer.x + 37, baconGermer.y + 18)
      ctx.lineTo(baconGermer.x + 37, baconGermer.y + 22)
      ctx.quadraticCurveTo(baconGermer.x + 33, baconGermer.y + 26, baconGermer.x + 23, baconGermer.y + 23)
      ctx.quadraticCurveTo(baconGermer.x + 13, baconGermer.y + 20, baconGermer.x + 3, baconGermer.y + 22)
      ctx.closePath()
      ctx.fill()

      // Eyes
      ctx.fillStyle = "#000000"
      ctx.fillRect(baconGermer.x + 12, baconGermer.y + 8, 3, 3)
      ctx.fillRect(baconGermer.x + 25, baconGermer.y + 10, 3, 3)

      // Smile
      ctx.strokeStyle = "#000000"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(baconGermer.x + 20, baconGermer.y + 18, 6, 0, Math.PI)
      ctx.stroke()

      // Speech bubble
      ctx.fillStyle = "#FFFFFF"
      ctx.fillRect(baconGermer.x - 80, baconGermer.y - 40, 120, 30)
      ctx.strokeStyle = "#000000"
      ctx.strokeRect(baconGermer.x - 80, baconGermer.y - 40, 120, 30)

      // Speech bubble tail
      ctx.fillStyle = "#FFFFFF"
      ctx.beginPath()
      ctx.moveTo(baconGermer.x - 10, baconGermer.y - 10)
      ctx.lineTo(baconGermer.x - 20, baconGermer.y - 15)
      ctx.lineTo(baconGermer.x - 15, baconGermer.y - 25)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = "#000000"
      ctx.font = "10px Arial"
      ctx.fillText("BARNEY VOCÊ QUER", baconGermer.x - 75, baconGermer.y - 25)
      ctx.fillText("ENTRAR NA NEVE?", baconGermer.x - 75, baconGermer.y - 15)
    }

    // Draw Wolf NPC
    const drawWolf = () => {
      if (!wolf.visible) return

      // Wolf body (gray)
      ctx.fillStyle = "#696969"
      ctx.fillRect(wolf.x, wolf.y + 10, wolf.width - 5, wolf.height - 10)

      // Wolf head
      ctx.fillStyle = "#808080"
      ctx.beginPath()
      ctx.arc(wolf.x + 15, wolf.y + 8, 12, 0, Math.PI * 2)
      ctx.fill()

      // Wolf ears
      ctx.fillStyle = "#696969"
      ctx.beginPath()
      ctx.moveTo(wolf.x + 8, wolf.y + 2)
      ctx.lineTo(wolf.x + 12, wolf.y - 3)
      ctx.lineTo(wolf.x + 16, wolf.y + 2)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(wolf.x + 14, wolf.y + 2)
      ctx.lineTo(wolf.x + 18, wolf.y - 3)
      ctx.lineTo(wolf.x + 22, wolf.y + 2)
      ctx.fill()

      // Wolf snout
      ctx.fillStyle = "#A9A9A9"
      ctx.beginPath()
      ctx.arc(wolf.x + 15, wolf.y + 12, 6, 0, Math.PI * 2)
      ctx.fill()

      // Wolf nose
      ctx.fillStyle = "#000000"
      ctx.beginPath()
      ctx.arc(wolf.x + 15, wolf.y + 10, 2, 0, Math.PI * 2)
      ctx.fill()

      // Wolf eyes
      ctx.fillStyle = "#FFD700" // Golden eyes
      ctx.beginPath()
      ctx.arc(wolf.x + 11, wolf.y + 6, 2, 0, Math.PI * 2)
      ctx.arc(wolf.x + 19, wolf.y + 6, 2, 0, Math.PI * 2)
      ctx.fill()

      // Wolf pupils
      ctx.fillStyle = "#000000"
      ctx.beginPath()
      ctx.arc(wolf.x + 11, wolf.y + 6, 1, 0, Math.PI * 2)
      ctx.arc(wolf.x + 19, wolf.y + 6, 1, 0, Math.PI * 2)
      ctx.fill()

      // Wolf tail
      ctx.fillStyle = "#696969"
      ctx.beginPath()
      ctx.arc(wolf.x + wolf.width - 5, wolf.y + 15, 8, 0, Math.PI * 2)
      ctx.fill()

      // Speech bubble
      ctx.fillStyle = "#FFFFFF"
      ctx.fillRect(wolf.x - 90, wolf.y - 50, 140, 35)
      ctx.strokeStyle = "#000000"
      ctx.strokeRect(wolf.x - 90, wolf.y - 50, 140, 35)

      // Speech bubble tail
      ctx.fillStyle = "#FFFFFF"
      ctx.beginPath()
      ctx.moveTo(wolf.x - 5, wolf.y - 15)
      ctx.lineTo(wolf.x - 15, wolf.y - 20)
      ctx.lineTo(wolf.x - 10, wolf.y - 30)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = "#000000"
      ctx.font = "10px Arial"
      ctx.fillText("NEVE A MELHOR", wolf.x - 85, wolf.y - 35)
      ctx.fillText("GUILDA DO BRASIL", wolf.x - 85, wolf.y - 25)
    }

    // Game loop
    const gameLoop = () => {
      if (gameState !== "playing") return

      // Clear canvas and draw background
      drawBackground(currentLevelData.theme)

      // Bacon Germer timer
      baconGermerTimer++
      if (baconGermerTimer > 300) {
        // Show every 5 seconds
        baconGermer.visible = true
        setShowBaconGermer(true)
      }
      if (baconGermerTimer > 450) {
        // Hide after 2.5 seconds
        baconGermer.visible = false
        setShowBaconGermer(false)
        baconGermerTimer = 0
      }

      // Wolf timer
      wolfTimer++
      if (wolfTimer > 400) {
        // Show every 6.7 seconds (offset from bacon)
        wolf.visible = true
      }
      if (wolfTimer > 550) {
        // Hide after 2.5 seconds
        wolf.visible = false
        wolfTimer = 0
      }

      // Handle input
      if (keys["a"] || keys["arrowleft"]) {
        player.velocityX = -speed
      } else if (keys["d"] || keys["arrowright"]) {
        player.velocityX = speed
      } else {
        player.velocityX *= 0.8 // Friction
      }

      if ((keys["w"] || keys["arrowup"] || keys[" "]) && player.onGround) {
        player.velocityY = jumpPower
        player.onGround = false
      }

      // Apply gravity
      player.velocityY += gravity

      // Update player position
      player.x += player.velocityX
      player.y += player.velocityY

      // Keep player in bounds
      if (player.x < 0) player.x = 0
      if (player.x + player.width > canvas.width) player.x = canvas.width - player.width

      // Platform collision
      player.onGround = false
      for (const platform of currentLevelData.platforms) {
        if (checkCollision(player, platform)) {
          if (player.velocityY > 0 && player.y < platform.y) {
            player.y = platform.y - player.height
            player.velocityY = 0
            player.onGround = true
          }
        }
      }

      // Crystal collection
      let allCrystalsCollected = true
      currentLevelData.crystals.forEach((crystal) => {
        if (!crystal.collected) {
          allCrystalsCollected = false
          if (checkCollision(player, crystal)) {
            crystal.collected = true
            setScore((prev) => prev + 100)
          }
        }
      })

      // Check level completion
      if (allCrystalsCollected) {
        setGameState("levelComplete")
      }

      // Enemy movement and collision
      currentLevelData.enemies.forEach((enemy) => {
        enemy.x += enemy.direction * enemy.speed

        // Bounce off platform edges
        const currentPlatform = currentLevelData.platforms.find(
          (p) =>
            enemy.x + enemy.width / 2 >= p.x &&
            enemy.x + enemy.width / 2 <= p.x + p.width &&
            enemy.y + enemy.height >= p.y - 5 &&
            enemy.y + enemy.height <= p.y + 5,
        )

        if (currentPlatform) {
          if (enemy.x <= currentPlatform.x || enemy.x + enemy.width >= currentPlatform.x + currentPlatform.width) {
            enemy.direction *= -1
          }
        }

        // Player collision with enemy
        if (checkCollision(player, enemy)) {
          // Morte instantânea ao tocar no inimigo
          setLives(0)
          setGameState("gameOver")
        }
      })

      // Game over if player falls
      if (player.y > canvas.height) {
        setLives((prev) => {
          const newLives = prev - 1
          if (newLives <= 0) {
            setGameState("gameOver")
          }
          return newLives
        })
        // Reset player to a safer position (not beginning)
        const safeX = Math.max(100, player.x - 100) // Voltar um pouco, mas não muito
        player.x = Math.min(safeX, canvas.width - 200) // Não muito perto da borda direita
        player.y = 200 // Altura segura
        player.velocityX = 0
        player.velocityY = 0
      }

      // Draw platforms with enhanced Albion styling
      currentLevelData.platforms.forEach((platform) => {
        if (currentLevelData.theme === "cave") {
          ctx.fillStyle = "#4A4A4A"
        } else if (currentLevelData.theme === "desert") {
          ctx.fillStyle = "#CD853F"
        } else {
          ctx.fillStyle = "#8B7355"
        }

        ctx.fillRect(platform.x, platform.y, platform.width, platform.height)

        // Add Albion-style texture and runes
        if (currentLevelData.theme === "forest") {
          ctx.fillStyle = "#A0916B"
          ctx.fillRect(platform.x + 2, platform.y + 2, platform.width - 4, platform.height - 4)
          // Add small runes
          if (platform.width > 80) {
            ctx.fillStyle = "#FFD700"
            ctx.font = "8px Arial"
            ctx.fillText("◊", platform.x + platform.width / 2, platform.y + 8)
          }
        } else if (currentLevelData.theme === "desert") {
          ctx.fillStyle = "#DEB887"
          ctx.fillRect(platform.x + 1, platform.y + 1, platform.width - 2, platform.height - 2)
        } else if (currentLevelData.theme === "cave") {
          ctx.fillStyle = "#696969"
          ctx.fillRect(platform.x + 1, platform.y + 1, platform.width - 2, platform.height - 2)
          // Glowing edges
          ctx.strokeStyle = "#9400D3"
          ctx.lineWidth = 1
          ctx.strokeRect(platform.x, platform.y, platform.width, platform.height)
        }
      })

      // Draw crystals with enhanced Albion effects
      currentLevelData.crystals.forEach((crystal) => {
        if (!crystal.collected) {
          const time = Date.now() * 0.005
          const glow = Math.sin(time) * 0.3 + 0.7
          const pulse = Math.sin(time * 2) * 2

          ctx.fillStyle = currentLevelData.theme === "cave" ? "#9400D3" : "#00FFFF"
          ctx.shadowColor = currentLevelData.theme === "cave" ? "#9400D3" : "#00FFFF"
          ctx.shadowBlur = 15 * glow

          // Enhanced crystal shape
          ctx.beginPath()
          ctx.moveTo(crystal.x + crystal.width / 2, crystal.y - pulse)
          ctx.lineTo(crystal.x + crystal.width + pulse, crystal.y + crystal.height / 2)
          ctx.lineTo(crystal.x + crystal.width / 2, crystal.y + crystal.height + pulse)
          ctx.lineTo(crystal.x - pulse, crystal.y + crystal.height / 2)
          ctx.closePath()
          ctx.fill()

          // Inner glow
          ctx.fillStyle = "#FFFFFF"
          ctx.beginPath()
          ctx.moveTo(crystal.x + crystal.width / 2, crystal.y + 4)
          ctx.lineTo(crystal.x + crystal.width - 4, crystal.y + crystal.height / 2)
          ctx.lineTo(crystal.x + crystal.width / 2, crystal.y + crystal.height - 4)
          ctx.lineTo(crystal.x + 4, crystal.y + crystal.height / 2)
          ctx.closePath()
          ctx.fill()

          ctx.shadowBlur = 0
        }
      })

      // Draw enemies with enhanced Albion styling
      currentLevelData.enemies.forEach((enemy) => {
        if (currentLevelData.theme === "cave") {
          ctx.fillStyle = "#8B0000" // Dark red cave monsters
        } else if (currentLevelData.theme === "desert") {
          ctx.fillStyle = "#CD853F" // Sandy desert creatures
        } else {
          ctx.fillStyle = "#2F2F2F" // Dark forest creatures
        }

        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height)

        // Enhanced enemy details
        ctx.fillStyle = "#FF0000"
        ctx.fillRect(enemy.x + 5, enemy.y + 5, 4, 4)
        ctx.fillRect(enemy.x + enemy.width - 9, enemy.y + 5, 4, 4)

        // Spikes or horns
        ctx.fillStyle = "#FFFFFF"
        ctx.beginPath()
        ctx.moveTo(enemy.x + 10, enemy.y)
        ctx.lineTo(enemy.x + 12, enemy.y - 5)
        ctx.lineTo(enemy.x + 14, enemy.y)
        ctx.fill()
        ctx.beginPath()
        ctx.moveTo(enemy.x + 16, enemy.y)
        ctx.lineTo(enemy.x + 18, enemy.y - 5)
        ctx.lineTo(enemy.x + 20, enemy.y)
        ctx.fill()
      })

      // Draw Bacon Germer
      drawBaconGermer()

      // Draw Wolf
      drawWolf()

      // Draw Barney using the uploaded image
      if (barneyImage) {
        ctx.drawImage(barneyImage, player.x, player.y, player.width, player.height)
      } else {
        // Fallback if image hasn't loaded
        ctx.fillStyle = "#FF69B4"
        ctx.beginPath()
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width / 2, 0, Math.PI * 2)
        ctx.fill()
      }

      animationId = requestAnimationFrame(gameLoop)
    }

    gameLoop()

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("keyup", handleKeyUp)
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [gameState, currentLevel, barneyImage])

  const resetGame = () => {
    setScore(0)
    setLives(3)
    setCurrentLevel(1)
    setGameState("playing")
  }

  const restartCurrentLevel = () => {
    setLives(3)
    setGameState("playing")
    // Force re-render to reset crystals and player position for current level
    setCurrentLevel((prev) => prev)
  }

  const nextLevel = () => {
    if (currentLevel < 10) {
      setCurrentLevel((prev) => prev + 1)
      setGameState("playing")
    } else {
      // Game completed
      setGameState("gameOver")
    }
  }

  const togglePause = () => {
    setGameState((prev) => (prev === "playing" ? "paused" : "playing"))
  }

  const levelNames = {
    1: "Caerleon Gardens - Entrada",
    2: "Caerleon Gardens - Bosque Profundo",
    3: "Bridgewatch Cliffs - Deserto Inicial",
    4: "Bridgewatch Cliffs - Oásis Perdido",
    5: "Thetford Mines - Entrada das Cavernas",
    6: "Thetford Mines - Coração da Montanha",
    7: "Martlock Swamps - Pântano Sombrio",
    8: "Martlock Swamps - Coração do Pântano",
    9: "Fort Sterling - Fortaleza Gelada",
    10: "Avalon - Portal Final",
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-gradient-to-b from-purple-200 to-blue-200 min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-purple-800 mb-2">Barney's Albion Adventure</h1>
        <p className="text-lg text-gray-700">Explore as terras místicas de Albion com o Barney!</p>
      </div>

      <div className="flex gap-6 text-lg font-semibold flex-wrap justify-center">
        <div className="bg-white px-4 py-2 rounded-lg shadow">Score: {score}</div>
        <div className="bg-white px-4 py-2 rounded-lg shadow">Lives: {lives}</div>
        <div className="bg-white px-4 py-2 rounded-lg shadow text-center">
          Level {currentLevel}/10: {levelNames[currentLevel as keyof typeof levelNames]}
        </div>
      </div>

      <div className="relative">
        <canvas ref={canvasRef} width={800} height={600} className="border-4 border-purple-600 rounded-lg shadow-lg" />

        {gameState === "paused" && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="bg-white p-6 rounded-lg text-center">
              <h2 className="text-2xl font-bold mb-4">Jogo Pausado</h2>
              <Button onClick={togglePause}>Continuar</Button>
            </div>
          </div>
        )}

        {gameState === "levelComplete" && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="bg-white p-6 rounded-lg text-center">
              <h2 className="text-2xl font-bold mb-2 text-green-600">Fase Completa!</h2>
              <p className="mb-4">Todos os cristais coletados!</p>
              {currentLevel < 10 ? (
                <Button onClick={nextLevel}>Próxima Fase</Button>
              ) : (
                <div>
                  <p className="mb-4 text-xl font-bold text-yellow-600">🎉 Você completou toda a aventura! 🎉</p>
                  <p className="mb-4">Barney explorou todo o mundo de Albion!</p>
                  <Button onClick={resetGame}>Jogar Novamente</Button>
                </div>
              )}
            </div>
          </div>
        )}

        {gameState === "gameOver" && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="bg-white p-6 rounded-lg text-center">
              <div className="text-6xl mb-4">❄️</div>
              <h2 className="text-2xl font-bold mb-2 text-blue-600">Você foi convidado para a Neve Eterna.</h2>
              <p className="mb-4 text-gray-600">Pontuação Final: {score}</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={restartCurrentLevel} variant="outline">
                  Reiniciar Fase
                </Button>
                <Button onClick={resetGame}>Voltar ao Início</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Button onClick={togglePause} variant="outline">
          {gameState === "playing" ? "Pausar" : "Continuar"}
        </Button>
        <Button onClick={resetGame} variant="outline">
          Reiniciar
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow max-w-3xl text-center">
        <h3 className="font-bold mb-2">Controles & Objetivo:</h3>
        <p className="text-sm text-gray-600">
          Use <kbd className="bg-gray-200 px-2 py-1 rounded">A/D</kbd> ou{" "}
          <kbd className="bg-gray-200 px-2 py-1 rounded">Setas</kbd> para mover •
          <kbd className="bg-gray-200 px-2 py-1 rounded">W</kbd>,{" "}
          <kbd className="bg-gray-200 px-2 py-1 rounded">Seta ↑</kbd> ou{" "}
          <kbd className="bg-gray-200 px-2 py-1 rounded">Espaço</kbd> para pular
        </p>
        <p className="text-sm text-gray-600 mt-2">
          🔮 Colete TODOS os cristais para completar cada fase • ⚔️ Evite inimigos • 🥓 Converse com Bacon Germer
        </p>
        <div className="mt-3 text-xs text-gray-500">
          <p>
            <strong>10 Fases Épicas:</strong> Jardins de Caerleon → Penhascos de Bridgewatch → Minas de Thetford →
            Pântanos de Martlock → Fortaleza de Sterling → Portal de Avalon
          </p>
          <p className="mt-1">
            💬 <strong>Barney fala frases motivacionais!</strong> • 🥓{" "}
            <strong>Bacon Germer pergunta sobre a neve!</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
