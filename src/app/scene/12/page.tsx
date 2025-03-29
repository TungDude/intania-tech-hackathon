"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { getDeathCount, incrementDeathCount } from '@/app/_utils/gameState';

// Singleton to track game instance
let gameInstance: any = null;
let hasInitialized = false;

const Scene12 = () => {
  const gameRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initGame = async () => {
      if (typeof window === "undefined" || gameInstance || hasInitialized) return;
      hasInitialized = true;

      try {
        setIsLoading(true);
        const Phaser = await import("phaser");

        class Scene12Game extends Phaser.Scene {
          private background!: Phaser.GameObjects.Sprite;
          private chair!: Phaser.GameObjects.Sprite;
          private boss!: Phaser.GameObjects.Sprite;
          private bubble!: Phaser.GameObjects.Sprite;
          private tableOverlay!: Phaser.GameObjects.Sprite;
          private text!: Phaser.GameObjects.Text;
          private gameOverOverlay!: Phaser.GameObjects.Rectangle;
          private gameOverText!: Phaser.GameObjects.Text;
          private timerEvent?: Phaser.Time.TimerEvent;
          private timeLeft: number = 5;
          private fullText: string = "เดี๋ยวกลับด้วยกันกับผมก็ได้ ติดรถผมไปกัน";
          private currentText: string = "";
          private typingTimer?: Phaser.Time.TimerEvent;
          private isTyping: boolean = false;
          private isChairInPlace: boolean = false;
          private isTextComplete: boolean = false;
          private canProceed: boolean = false;

          constructor() {
            super({ key: "Scene12Game" });
          }

          preload(): void {
            this.load.image("bg_12_table", "/images/12_table.PNG");
            this.load.image("bg_12_chair", "/images/12_chair.PNG");
            this.load.image("bg_12_table_only", "/images/12_table_only.PNG");
            this.load.image("boss", "/images/2_boss.PNG");
            this.load.image("bubble", "/images/ele_bubble_top.png");
            this.load.image("ele_punch", "/images/ele_punch.PNG");
          }

          create(): void {
            // Add background 
            this.background = this.add.sprite(600, 500, "bg_12_table");
            this.background.setOrigin(0.5, 0.5);
            this.background.setScale(0.48);
            this.background.setDepth(0); // Set lowest depth
          
            // Add boss character
            this.boss = this.add.sprite(600, 500, "boss");
            this.boss.setScale(0.48);
            this.boss.setDepth(1); // Middle depth
          
            // Add table overlay
            this.tableOverlay = this.add.sprite(600, 500, "bg_12_table_only");
            this.tableOverlay.setOrigin(0.5, 0.5);
            this.tableOverlay.setScale(0.48);
            this.tableOverlay.setDepth(2); // Above boss, below chair
          
            // Add draggable chair
            this.chair = this.add.sprite(600, 800, "bg_12_chair");
            this.chair.setScale(0.55);
            this.chair.setDepth(3);
            this.chair.setInteractive({ draggable: true });

              // Add drag end handler
            this.input.on('dragend', (pointer: any, gameObject: any) => {
                if (this.isChairInPlace) {
                window.location.href = "/scene/13";
                }
            });

            // Update drag handler without debug visualization
            this.input.on('drag', (pointer: any, gameObject: any, dragX: number, dragY: number) => {
                gameObject.x = dragX;
                gameObject.y = dragY;
                
                // Check if chair is in correct position using tolerances
                const targetX = 600;
                const targetY = 600;
                const toleranceX = 160;
                const toleranceY = 80;
                
                if (Math.abs(gameObject.x - targetX) < toleranceX && 
                    Math.abs(gameObject.y - targetY) < toleranceY) {
                  this.isChairInPlace = true;
                } else {
                  this.isChairInPlace = false;
                }
              });

            // Add speech bubble
            this.bubble = this.add.sprite(600, 100, "bubble");
            this.bubble.setScale(0.42);

            // Add text
            this.text = this.add.text(600, 100, "", {
                fontFamily: "Arial",
                fontSize: "32px",
                align: "center",
                color: "#000000",
                wordWrap: { width: 800 },
                lineSpacing: 20,
              });
              this.text.setOrigin(0.5);
          
              // Start typing effect
              this.startTypingEffect();
          
              // Add click handler for the whole scene
              this.input.on("pointerdown", () => {
                if (this.isTyping) {
                  // If still typing, complete the current text immediately
                  if (this.typingTimer) {
                    this.typingTimer.destroy();
                  }
                  this.isTyping = false;
                  this.currentText = this.fullText;
                  this.text.setText(this.currentText);
                  this.isTextComplete = true;
                } else if (this.isTextComplete && !this.canProceed) {
                  this.canProceed = true;
                  this.startBossWalkingAnimation();
                }
              });
            }
          
            // Modify typing effect method
            private startTypingEffect(): void {
              let currentIndex = 0;
              if (this.typingTimer) this.typingTimer.destroy();
          
              this.currentText = "";
              this.text.setText("");
              this.isTextComplete = false;
              this.isTyping = true;
          
              this.typingTimer = this.time.addEvent({
                delay: 100,
                callback: () => {
                  if (currentIndex < this.fullText.length) {
                    this.currentText += this.fullText[currentIndex];
                    this.text.setText(this.currentText);
                    currentIndex++;
                  } else {
                    this.isTyping = false;
                    this.isTextComplete = true;
                  }
                },
                repeat: this.fullText.length - 1,
              });
            }

          private startBossWalkingAnimation(): void {
            // Hide bubble and text
            this.bubble.setVisible(false);
            this.text.setVisible(false);

            // Animate boss walking left
            this.tweens.add({
                targets: this.boss,
                x: -250,
                y: {
                  value: `+=${50}`,
                  yoyo: true,
                  repeat: 4,
                  duration: 250,
                },
                duration: 2000,
                ease: 'Linear',
                onComplete: () => {
                  // Start countdown after boss leaves
                  this.startCountdown();
                }
              });
          }

          private startCountdown(): void {
            this.timeLeft = 4;
            this.timerEvent = this.time.addEvent({
              delay: 1000,
              callback: () => {
                this.timeLeft--;
                if (this.timeLeft <= 0) {
                  this.timerEvent?.destroy();
                  if (!this.isChairInPlace) {
                    this.showGameOver();
                  } else {
                    window.location.href = "/scene/13";
                  }
                }
              },
              repeat: 3
            });
          }

          private showGameOver(): void {
            incrementDeathCount();
            
            // Show game over overlay with highest depth
            this.gameOverOverlay = this.add.rectangle(600, 500, 1200, 1000, 0x000000, 0.8);
            this.gameOverOverlay.setDepth(1000); // Very high depth to ensure it's on top
            this.gameOverOverlay.setVisible(true);
          
            // Add rapid zoom-in animation for ele_punch
            const elePunch = this.add.sprite(600, 500, "ele_punch");
            elePunch.setScale(0);
            elePunch.setDepth(1001); // Above overlay
          
            this.tweens.add({
              targets: elePunch,
              scale: { from: 0, to: 1.5 },
              duration: 1000,
              ease: "Back.easeOut",
              onComplete: () => {
                // Add death count in top left with high depth
                const deathCountText = this.add.text(880, 50, `💀: ${getDeathCount()}`, {
                  fontFamily: "Arial",
                  fontSize: "48px",
                  color: "#FFFFFF",
                  align: "left",
                });
                deathCountText.setOrigin(0, 0);
                deathCountText.setDepth(1002);
          
                // Game over text with high depth
                this.gameOverText = this.add.text(600, 500,
                  "มารยาทพื้นฐานข้อที่ 12\nเก็บเก้าอี้เข้าที่ทุกครั้ง\nหลังใช้งานเสร็จ", {
                  fontFamily: "Arial",
                  fontSize: "56px",
                  color: "#FFFFFF",
                  align: "center",
                  lineSpacing: 30,
                });
                this.gameOverText.setOrigin(0.5);
                this.gameOverText.setDepth(1002);
    
          
                // Make clickable to return home
                this.gameOverOverlay.setInteractive();
                this.gameOverOverlay.once("pointerdown", () => {
                  window.location.href = "/";
                });

                // Auto return after 4 seconds
                this.time.delayedCall(4000, () => {
                  window.location.href = "/";
                });
              }
            });
          }
        }

        const config = {
          type: Phaser.AUTO,
          width: 1200,
          height: 1000,
          backgroundColor: "#FFFFFF",
          parent: "game-container",
          scene: Scene12Game,
        };

        if (gameInstance) gameInstance.destroy(true);
        gameInstance = new Phaser.Game(config);
        gameRef.current = gameInstance;

      } catch (error) {
        console.error("Failed to initialize Phaser:", error);
        setIsLoading(false);
      }
    };

    initGame();
    return () => {
      if (gameInstance) {
        gameInstance.destroy(true);
        gameInstance = null;
        hasInitialized = false;
      }
    };
  }, []);

  return (
    <div id="game-container" className="w-full h-screen flex items-center justify-center bg-white">
      {isLoading && <div className="text-2xl">Loading...</div>}
    </div>
  );
};

export default dynamic(() => Promise.resolve(Scene12), { ssr: false });