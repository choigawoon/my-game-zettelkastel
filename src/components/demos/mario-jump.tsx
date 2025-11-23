'use client'

import { useEffect, useRef, useState } from 'react'
import * as Phaser from 'phaser'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Play, RotateCcw, Keyboard } from 'lucide-react'

interface MarioJumpDemoProps {
  className?: string
}

type JumpType = 'basic' | 'variable' | 'coyote' | 'buffered'

interface JumpTypeInfo {
  name: string
  description: string
  code: string
}

const JUMP_TYPES: Record<JumpType, JumpTypeInfo> = {
  basic: {
    name: '기본 점프',
    description: '점프 버튼을 누르면 고정된 속도로 점프합니다. 가장 단순한 구현이지만 조작감이 딱딱합니다.',
    code: `// Basic Jump
if (cursors.space.isDown && player.body.onFloor()) {
  player.setVelocityY(-jumpVelocity);
}`,
  },
  variable: {
    name: '가변 높이 점프',
    description: '버튼을 길게 누를수록 높이 점프합니다. 슈퍼마리오의 핵심 메커니즘입니다.',
    code: `// Variable Height Jump
if (cursors.space.isDown && player.body.onFloor()) {
  player.setVelocityY(-jumpVelocity);
  jumpTime = 0;
}

// 버튼을 계속 누르고 있으면 상승력 추가
if (cursors.space.isDown && jumpTime < maxJumpTime) {
  player.setVelocityY(player.body.velocity.y - jumpBoost);
  jumpTime += delta;
}

// 버튼을 떼면 즉시 상승 중단
if (cursors.space.isUp && player.body.velocity.y < 0) {
  player.setVelocityY(player.body.velocity.y * 0.5);
}`,
  },
  coyote: {
    name: '코요테 타임',
    description: '플랫폼을 벗어난 후에도 짧은 시간 동안 점프할 수 있습니다. 관대한 조작감을 제공합니다.',
    code: `// Coyote Time
if (player.body.onFloor()) {
  coyoteTimer = coyoteTime; // 플랫폼 위면 타이머 리셋
} else {
  coyoteTimer -= delta; // 공중이면 타이머 감소
}

// 코요테 타임 내에 점프 가능
if (cursors.space.isDown && coyoteTimer > 0) {
  player.setVelocityY(-jumpVelocity);
  coyoteTimer = 0; // 점프 후 타이머 초기화
}`,
  },
  buffered: {
    name: '점프 버퍼링',
    description: '착지 직전에 점프를 입력하면 착지 시 자동으로 점프합니다. 연속 점프가 쉬워집니다.',
    code: `// Jump Buffering
if (cursors.space.isDown) {
  jumpBufferTimer = jumpBufferTime; // 점프 입력 기록
}

jumpBufferTimer -= delta; // 타이머 감소

// 착지 시 버퍼된 점프 실행
if (player.body.onFloor() && jumpBufferTimer > 0) {
  player.setVelocityY(-jumpVelocity);
  jumpBufferTimer = 0;
}`,
  },
}

// Phaser scene for each jump type
class JumpScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite
  private platforms!: Phaser.Physics.Arcade.StaticGroup
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private jumpType: JumpType
  private debugText!: Phaser.GameObjects.Text

  // Jump parameters
  private jumpVelocity = 400
  private gravity = 800
  private moveSpeed = 200

  // Variable height jump
  private jumpTime = 0
  private maxJumpTime = 150
  private jumpBoost = 15
  private isJumping = false

  // Coyote time
  private coyoteTimer = 0
  private coyoteTime = 100
  private wasOnFloor = false

  // Jump buffering
  private jumpBufferTimer = 0
  private jumpBufferTime = 150

  constructor(jumpType: JumpType) {
    super({ key: `JumpScene_${jumpType}` })
    this.jumpType = jumpType
  }

  create() {
    // Background
    this.cameras.main.setBackgroundColor('#1e293b')

    // Create platforms
    this.platforms = this.physics.add.staticGroup()

    // Ground
    const ground = this.add.rectangle(200, 280, 400, 20, 0x475569)
    this.platforms.add(ground)

    // Floating platforms for testing
    const platform1 = this.add.rectangle(100, 200, 80, 15, 0x475569)
    this.platforms.add(platform1)

    const platform2 = this.add.rectangle(300, 150, 80, 15, 0x475569)
    this.platforms.add(platform2)

    // Create player texture (red rectangle representing Mario)
    const playerGraphics = this.add.graphics()
    playerGraphics.fillStyle(0xef4444, 1)
    playerGraphics.fillRect(0, 0, 24, 32)
    playerGraphics.generateTexture('player', 24, 32)
    playerGraphics.destroy()

    // Create player
    this.player = this.physics.add.sprite(50, 240, 'player')
    this.player.setBounce(0)
    this.player.setCollideWorldBounds(true)
    this.player.setGravityY(this.gravity)

    // Enable physics body
    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setSize(24, 32)

    // Collisions
    this.physics.add.collider(this.player, this.platforms)

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys()

    // Debug text
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '10px',
      color: '#94a3b8',
    })

    // Instructions
    this.add.text(200, 295, '← → 이동 / SPACE 점프', {
      fontSize: '9px',
      color: '#64748b',
    }).setOrigin(0.5)
  }

  update(_time: number, delta: number) {
    const body = this.player.body as Phaser.Physics.Arcade.Body

    // Horizontal movement
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.moveSpeed)
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.moveSpeed)
    } else {
      this.player.setVelocityX(0)
    }

    // Jump logic based on type
    switch (this.jumpType) {
      case 'basic':
        this.basicJump(body)
        break
      case 'variable':
        this.variableJump(body, delta)
        break
      case 'coyote':
        this.coyoteJump(body, delta)
        break
      case 'buffered':
        this.bufferedJump(body, delta)
        break
    }

    // Update debug info
    this.updateDebugText(body)
    this.wasOnFloor = body.onFloor()
  }

  private basicJump(body: Phaser.Physics.Arcade.Body) {
    if (Phaser.Input.Keyboard.JustDown(this.cursors.space!) && body.onFloor()) {
      this.player.setVelocityY(-this.jumpVelocity)
    }
  }

  private variableJump(body: Phaser.Physics.Arcade.Body, delta: number) {
    // Start jump
    if (Phaser.Input.Keyboard.JustDown(this.cursors.space!) && body.onFloor()) {
      this.player.setVelocityY(-this.jumpVelocity)
      this.jumpTime = 0
      this.isJumping = true
    }

    // Continue jump while holding
    if (this.cursors.space!.isDown && this.isJumping && this.jumpTime < this.maxJumpTime) {
      this.player.setVelocityY(body.velocity.y - this.jumpBoost)
      this.jumpTime += delta
    }

    // Cut jump short when released
    if (this.cursors.space!.isUp) {
      if (body.velocity.y < 0) {
        this.player.setVelocityY(body.velocity.y * 0.5)
      }
      this.isJumping = false
    }

    // Reset on landing
    if (body.onFloor()) {
      this.isJumping = false
      this.jumpTime = 0
    }
  }

  private coyoteJump(body: Phaser.Physics.Arcade.Body, delta: number) {
    // Update coyote timer
    if (body.onFloor()) {
      this.coyoteTimer = this.coyoteTime
    } else if (this.wasOnFloor && !body.onFloor()) {
      // Just left ground, start counting
      this.coyoteTimer = this.coyoteTime
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - delta)
    }

    // Jump if within coyote time
    if (Phaser.Input.Keyboard.JustDown(this.cursors.space!) && this.coyoteTimer > 0) {
      this.player.setVelocityY(-this.jumpVelocity)
      this.coyoteTimer = 0
    }
  }

  private bufferedJump(body: Phaser.Physics.Arcade.Body, delta: number) {
    // Buffer jump input
    if (Phaser.Input.Keyboard.JustDown(this.cursors.space!)) {
      this.jumpBufferTimer = this.jumpBufferTime
    }

    // Decrease buffer timer
    this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - delta)

    // Execute buffered jump on landing
    if (body.onFloor() && this.jumpBufferTimer > 0) {
      this.player.setVelocityY(-this.jumpVelocity)
      this.jumpBufferTimer = 0
    }
  }

  private updateDebugText(body: Phaser.Physics.Arcade.Body) {
    let debugInfo = `바닥: ${body.onFloor() ? '✓' : '✗'}\n`
    debugInfo += `Y속도: ${Math.round(body.velocity.y)}\n`

    switch (this.jumpType) {
      case 'variable':
        debugInfo += `점프시간: ${Math.round(this.jumpTime)}ms`
        break
      case 'coyote':
        debugInfo += `코요테: ${Math.round(this.coyoteTimer)}ms`
        break
      case 'buffered':
        debugInfo += `버퍼: ${Math.round(this.jumpBufferTimer)}ms`
        break
    }

    this.debugText.setText(debugInfo)
  }

  resetPlayer() {
    this.player.setPosition(50, 240)
    this.player.setVelocity(0, 0)
    this.jumpTime = 0
    this.coyoteTimer = 0
    this.jumpBufferTimer = 0
    this.isJumping = false
  }
}

export function MarioJumpDemo({ className = '' }: MarioJumpDemoProps) {
  const [selectedType, setSelectedType] = useState<JumpType>('basic')
  const [isRunning, setIsRunning] = useState(false)
  const gameRef = useRef<Phaser.Game | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<JumpScene | null>(null)

  // Cleanup game on unmount
  useEffect(() => {
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [])

  const startDemo = () => {
    if (gameRef.current) {
      gameRef.current.destroy(true)
      gameRef.current = null
    }

    if (!containerRef.current) return

    const scene = new JumpScene(selectedType)
    sceneRef.current = scene

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 400,
      height: 300,
      parent: containerRef.current,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scene: scene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    }

    gameRef.current = new Phaser.Game(config)
    setIsRunning(true)
  }

  const resetDemo = () => {
    if (sceneRef.current) {
      sceneRef.current.resetPlayer()
    }
  }

  const stopDemo = () => {
    if (gameRef.current) {
      gameRef.current.destroy(true)
      gameRef.current = null
    }
    setIsRunning(false)
  }

  const currentTypeInfo = JUMP_TYPES[selectedType]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg">점프 방식 선택</CardTitle>
          <CardDescription>
            다양한 점프 구현 방식을 비교해보세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>점프 타입</Label>
            <Select
              value={selectedType}
              onValueChange={(v) => {
                setSelectedType(v as JumpType)
                if (isRunning) {
                  stopDemo()
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(JUMP_TYPES) as [JumpType, JumpTypeInfo][]).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    {info.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={isRunning ? stopDemo : startDemo}
              className="flex-1"
              variant={isRunning ? 'destructive' : 'default'}
            >
              <Play className="w-4 h-4 mr-2" />
              {isRunning ? '정지' : '데모 시작'}
            </Button>
            {isRunning && (
              <Button variant="outline" onClick={resetDemo}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Type Description */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg">{currentTypeInfo.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-300">{currentTypeInfo.description}</p>

          <div>
            <Label className="text-xs text-slate-400">구현 코드</Label>
            <pre className="mt-2 p-3 bg-slate-900 rounded-lg text-xs overflow-x-auto">
              <code className="text-green-400">{currentTypeInfo.code}</code>
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Game Container */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            게임 데모
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={containerRef}
            className="w-full aspect-[4/3] bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center"
          >
            {!isRunning && (
              <div className="text-center text-slate-500">
                <p className="text-sm">위의 "데모 시작" 버튼을 클릭하세요</p>
                <p className="text-xs mt-2">화살표 키로 이동, 스페이스바로 점프</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg">점프 방식 비교</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-3">방식</th>
                  <th className="text-left py-2 px-3">특징</th>
                  <th className="text-left py-2 px-3">사용 예</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-700/50">
                  <td className="py-2 px-3 font-medium">기본 점프</td>
                  <td className="py-2 px-3 text-slate-300">단순, 일정한 높이</td>
                  <td className="py-2 px-3 text-slate-400">단순한 아케이드 게임</td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="py-2 px-3 font-medium">가변 높이</td>
                  <td className="py-2 px-3 text-slate-300">버튼 누르는 시간으로 높이 조절</td>
                  <td className="py-2 px-3 text-slate-400">슈퍼마리오, 셀레스테</td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="py-2 px-3 font-medium">코요테 타임</td>
                  <td className="py-2 px-3 text-slate-300">플랫폼 이탈 후 유예 시간</td>
                  <td className="py-2 px-3 text-slate-400">대부분의 플랫포머</td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="py-2 px-3 font-medium">점프 버퍼링</td>
                  <td className="py-2 px-3 text-slate-300">착지 전 입력 저장</td>
                  <td className="py-2 px-3 text-slate-400">할로우 나이트, 셀레스테</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
