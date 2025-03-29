"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { getDeathCount, incrementDeathCount } from "@/app/_utils/gameState";


// Add font-face declaration
const fontFaceStyle = `
  @font-face {
    font-family: 'Torsilp-SuChat';
    src: url('./Torsilp-SuChat.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
`;

// Singleton to track game instance
let gameInstance: any = null;
let hasInitialized = false;

const Scene4 = () => {
  const gameRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add font-face style to document
    const style = document.createElement("style");
    style.textContent = fontFaceStyle;
    document.head.appendChild(style);

    const initGame = async () => {
      if (typeof window === "undefined" || gameInstance || hasInitialized)
        return;
      hasInitialized = true;

      try {
        setIsLoading(true);
        const Phaser = await import("phaser");

        class WaterScene extends Phaser.Scene {
          private table!: Phaser.GameObjects.Sprite;
          private boss!: Phaser.GameObjects.Sprite;
          private bubble!: Phaser.GameObjects.Sprite;
          private jar!: Phaser.GameObjects.Sprite;
          private hand!: Phaser.GameObjects.Sprite;
          private text!: Phaser.GameObjects.Text;
          private currentText: string = "";
          private typingTimer?: Phaser.Time.TimerEvent;
          private isTyping: boolean = false;
          private isAnimating: boolean = false;
          private isJarDragged: boolean = false;
          private hasVisitedCorrectZone: boolean = false;
          private correctZone!: Phaser.GameObjects.Zone;
          private wrongZone!: Phaser.GameObjects.Zone;
          private gameOverOverlay!: Phaser.GameObjects.Rectangle;
          private gameOverText!: Phaser.GameObjects.Text;

          constructor() {
            super({ key: "WaterScene" });
          }

          preload(): void {
            // Load font
            this.load.css("Torsilp", "./Torsilp-SuChat.ttf");

            // Load all necessary images
            this.load.image(
              "table_water_empty",
              "/images/3_table_water_empty.png"
            );
            this.load.image(
              "table_water_first",
              "/images/4_table_water_first.png"
            );
            this.load.image(
              "table_water_second",
              "/images/4_table_water_second.png"
            );
            this.load.image(
              "table_water_wrong",
              "/images/4_table_water_wrong.png"
            );
            this.load.image("boss_hand", "/images/4_boss_hand.png");
            this.load.image("jar", "/images/3_jar.png");
            this.load.image("boss_with_arm", "/images/4_boss_with_arm.png");
            this.load.image("bubble", "/images/ele_bubble_top.png");
          }

          create(): void {
            // Create background elements first
            this.table = this.add.sprite(600, 650, "table_water_empty");
            this.table.setScale(0.45);

            // Add hand sprite (initially hidden)
            this.hand = this.add.sprite(400, 600, "boss_hand");
            this.hand.setScale(0.55);
            this.hand.setVisible(false);

            // Add jar sprite (make it interactive)
            this.jar = this.add.sprite(340, 820, "jar");
            this.jar.setScale(0.43);

            // Add drop zones
            this.correctZone = this.add.zone(250, 660, 200, 200);
            this.wrongZone = this.add.zone(780, 800, 200, 200);

            // // Debug visualization of zones (remove in production)
            // const wrongZoneRect = this.add.rectangle(
            //   780,
            //   800,
            //   200,
            //   200,
            //   0xff0000,
            //   0.2
            // );
            // const correctZoneRect = this.add.rectangle(
            //   250,
            //   660,
            //   200,
            //   200,
            //   0x00ff00,
            //   0.2
            // );

            // Add speech bubble
            this.bubble = this.add.sprite(600, 250, "bubble");
            this.bubble.setScale(0.5);

            // Add text with proper configuration
            this.text = this.add.text(600, 230, "", {
              fontFamily: "Torsilp-SuChat",
              fontSize: "32px",
              align: "center",
              color: "#000000",
              wordWrap: { width: 800 },
              lineSpacing: 20,
              padding: { x: 10, y: 10 },
            });
            this.text.setOrigin(0.5);

            // Create game over overlay (initially hidden)
            this.gameOverOverlay = this.add.rectangle(
              600,
              500,
              1200,
              1000,
              0x000000,
              0.8
            );
            this.gameOverOverlay.setVisible(false);

            this.gameOverText = this.add.text(600, 500, "GAME OVER", {
              fontFamily: "Torsilp-SuChat",
              fontSize: "80px",
              color: "#FFFFFF",
              align: "center",
              lineSpacing: 30,
              padding: { x: 20, y: 20 },
            });
            this.gameOverText.setOrigin(0.5);
            this.gameOverText.setVisible(false);

            // Start the scene
            this.startTypingEffect("มาๆ ผมเติมน้ำให้ครับ");

            // Make scene interactive
            this.input.on("pointerdown", () => {
              if (this.isTyping) {
                // Complete typing if still in progress
                if (this.typingTimer) {
                  this.typingTimer.destroy();
                  this.isTyping = false;
                }
                this.text.setText(this.currentText);

                if (this.currentText === "มาๆ ผมเติมน้ำให้ครับ") {
                  this.table.setTexture("boss_with_arm");
                  this.hand.setVisible(true);
                  // Change boss texture

                  this.time.delayedCall(1000, () => {
                    this.startArmAnimation();
                    this.setupJarDragging();
                  });
                }
              }
            });

            setIsLoading(false);
          }

          private setupJarDragging(): void {
            // Make jar draggable
            this.jar.setInteractive({ draggable: true });

            // Track if currently dragging
            let isDragging = false;

            this.input.on(
              "dragstart",
              (
                pointer: Phaser.Input.Pointer,
                gameObject: Phaser.GameObjects.GameObject
              ) => {
                if (gameObject === this.jar && this.isAnimating) {
                  isDragging = true;
                  // Tilt jar 45 degrees when starting to drag
                  this.jar.setRotation(Math.PI / 4); // 45 degrees in radians
                }
              }
            );

            this.input.on(
              "drag",
              (
                pointer: Phaser.Input.Pointer,
                gameObject: Phaser.GameObjects.GameObject,
                dragX: number,
                dragY: number
              ) => {
                if (gameObject === this.jar && this.isAnimating) {
                  this.jar.x = dragX;
                  this.jar.y = dragY;
                }
              }
            );

            this.input.on(
              "dragend",
              (
                pointer: Phaser.Input.Pointer,
                gameObject: Phaser.GameObjects.GameObject
              ) => {
                if (gameObject === this.jar && this.isAnimating) {
                  isDragging = false;
                  this.isJarDragged = true;

                  // Reset jar rotation when dropped
                  if (this.jar.rotation !== 0) {
                    this.jar.setRotation(0);
                  }

                  // Check if jar is dropped in correct zone
                  const inCorrectZone = Phaser.Geom.Rectangle.Contains(
                    this.correctZone.getBounds(),
                    this.jar.x,
                    this.jar.y
                  );

                  // Check if jar is dropped in wrong zone
                  const inWrongZone = Phaser.Geom.Rectangle.Contains(
                    this.wrongZone.getBounds(),
                    this.jar.x,
                    this.jar.y
                  );

                  if (inCorrectZone) {
                    this.handleCorrectJarPlacement();
                  } else if (inWrongZone) {
                    this.handleWrongJarPlacement();
                  }
                }
              }
            );
          }

          private handleCorrectJarPlacement(): void {
            // Show correct water pouring
            this.table.setTexture("table_water_first");
            this.startTypingEffect("โอ๊ะ ขอบคุณครับ");
            this.hand.setVisible(false);
            this.hasVisitedCorrectZone = true;
          }

          private handleWrongJarPlacement(): void {
            this.jar.disableInteractive();

            if (this.hasVisitedCorrectZone) {
              this.table.setTexture("table_water_second");
              console.log(
                "Pass! Redirecting to scene ..."
              );
              // Redirect to scene 3
              this.time.delayedCall(1000, () => {
                window.location.href = "/scene/5";
              });
            } else {
              this.table.setTexture("table_water_wrong");
              this.hand.setVisible(false);
              this.time.delayedCall(1000, () => {
                this.showGameOver(
                  "มารยาทพื้นฐานข้อที่ 38\nการเทน้ำให้ผู้ใหญ่ถือเป็นการให้เกียรติกัน!"
                );
              });
            }
          }

          private showGameOver(message: string = "GAME OVER"): void {
            incrementDeathCount();
            console.log("Showing game over screen with message:", message);

            // Show game over screen
            this.gameOverOverlay.setVisible(true);

            // Update game over text with custom message
            this.gameOverText.setText(message +  "\n DEATH COUNT: " + getDeathCount());
            this.gameOverText.setFontSize(
              message.length > 20 ? "56px" : "80px"
            );
            this.gameOverText.setVisible(true);

            // Make game over screen clickable to go home
            this.gameOverOverlay.setInteractive();
            this.gameOverOverlay.once("pointerdown", () => {
              window.location.href = "/";
            });

            // Automatically redirect after 4 seconds
            this.time.delayedCall(4000, () => {
              window.location.href = "/";
            });
          }

          private startTypingEffect(text: string): void {
            this.currentText = text;
            let charIndex = 0;
            let displayText = "";
            this.text.setText("");
            this.isTyping = true;

            if (this.typingTimer) {
              this.typingTimer.destroy();
            }

            this.typingTimer = this.time.addEvent({
              delay: 50,
              callback: () => {
                if (charIndex < text.length) {
                  displayText += text.charAt(charIndex);
                  this.text.setText(displayText);
                  charIndex++;
                } else {
                  if (this.typingTimer) {
                    this.typingTimer.destroy();
                  }
                  this.isTyping = false;
                }
              },
              callbackScope: this,
              repeat: text.length - 1,
            });
          }

          private startArmAnimation(): void {
            this.isAnimating = true;

            // Change boss texture
            this.table.setTexture("boss_with_arm");

            // Show and animate the hand
            this.hand.setVisible(true);

            // Animate hand getting bigger and moving right
            this.tweens.add({
              targets: this.hand,
              scaleX: 0.8,
              scaleY: 0.8,
              x: 200,
              y: 750,
              duration: 8000,
              ease: "Power1",
              onComplete: () => {
                this.isAnimating = false;
                console.log("Hand animation complete");
                this.hand.setVisible(false);
                // gameover
                this.showGameOver(
                  "ช้ามาก!\nคุณมั่วทำอะไรอยู่นะจ๊ะ"
                );
              },
            });
          }
        }

        const config = {
          type: Phaser.AUTO,
          width: 1200,
          height: 1000,
          backgroundColor: "#FFFFFF",
          parent: "game-container",
          scene: WaterScene,
          dom: {
            createContainer: true,
          },
        };

        if (gameInstance) {
          gameInstance.destroy(true);
        }

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
    <div
      id="game-container"
      className="w-full h-screen flex items-center justify-center bg-white"
    >
      {isLoading && <div className="text-2xl">Loading...</div>}
    </div>
  );
};

export default dynamic(() => Promise.resolve(Scene4), {
  ssr: false,
});
