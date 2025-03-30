"use client";

import { useEffect, useRef, useState } from "react";
import { getDeathCount, incrementDeathCount } from "@/app/_utils/gameState";
import dynamic from "next/dynamic";

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
let gameInstance: Phaser.Game | null = null;
let hasInitialized = false;

const Scene2 = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add font-face style to document
    const style = document.createElement("style");
    style.textContent = fontFaceStyle;
    document.head.appendChild(style);

    const initGame = async () => {
      // Prevent multiple initializations
      if (typeof window === "undefined" || gameInstance || hasInitialized)
        return;

      hasInitialized = true;

      try {
        setIsLoading(true);
        const Phaser = await import("phaser");

        class TableScene extends Phaser.Scene {
          private table!: Phaser.GameObjects.Sprite;
          private boss!: Phaser.GameObjects.Sprite;
          private bubble!: Phaser.GameObjects.Sprite;
          private text!: Phaser.GameObjects.Text;
          private sitButton!: Phaser.GameObjects.Rectangle;
          private sitButtonText!: Phaser.GameObjects.Text;
          private gameOverOverlay!: Phaser.GameObjects.Rectangle;
          private gameOverText!: Phaser.GameObjects.Text;
          private currentText: string = "";
          private typingTimer?: Phaser.Time.TimerEvent;
          private isTyping: boolean = false;
          private isAnimating: boolean = false;

          constructor() {
            super({ key: "TableScene" });
          }

          preload(): void {
            // Load font
            this.load.css("Torsilp", "./Torsilp-SuChat.ttf");

            // Load all boss images and table
            this.load.image("table", "/images/2_table_only.png");
            this.load.image("boss_unhappy", "/images/2_boss_unhappy.png");
            this.load.image("boss", "/images/2_boss.png");
            this.load.image("boss_normal", "/images/2_boss_normal.png");
            this.load.image("boss_speak", "/images/2_boss_speak.png");
            this.load.image("boss_wha", "/images/2_boss_wha.png");
            this.load.image("bubble", "/images/ele_bubble_top.png");
          }

          create(): void {
            this.boss = this.add.sprite(600, 530, "boss");
            this.boss.setScale(0.25);

            this.table = this.add.sprite(600, 600, "table");
            this.table.setScale(0.7);

            // Add speech bubble
            this.bubble = this.add.sprite(600, 250, "bubble");
            this.bubble.setScale(0.5);

            // Add welcome text with Torsilp font
            this.text = this.add.text(600, 250, "", {
              fontFamily: "Torsilp-SuChat",
              fontSize: "32px",
              align: "center",
              color: "#000000",
              wordWrap: { width: 800 },
              lineSpacing: 20,
              padding: { x: 10, y: 10 },
            });
            this.text.setOrigin(0.5);

            // Create sit button (initially hidden)
            this.sitButton = this.add.rectangle(600, 900, 220, 70, 0x4caf50);
            this.sitButton.setStrokeStyle(3, 0x2e7d32);
            this.sitButton.setVisible(false);

            this.sitButtonText = this.add.text(600, 900, "นั่งลง", {
              fontFamily: "Torsilp-SuChat",
              fontSize: "36px",
              color: "#FFFFFF",
              align: "center",
              padding: { x: 5, y: 5 },
            });
            this.sitButtonText.setOrigin(0.5);
            this.sitButtonText.setVisible(false);

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

            // Make the scene interactive
            this.input.on("pointerdown", () => {
              if (this.isTyping) {
                // Skip typing animation if still typing
                if (this.typingTimer) {
                  this.typingTimer.destroy();
                  this.isTyping = false;
                }

                // Show the full text immediately
                if (
                  this.currentText ===
                  "มาถึงแล้วครับ ที่นี่คือร้านของเชฟกอร์ดัม"
                ) {
                  this.text.setText("มาถึงแล้วครับ ที่นี่คือร้านของเชฟกอร์ดัม");
                  this.time.delayedCall(1000, this.showSecondDialog, [], this);
                } else if (this.currentText === "นั่งกันเลย") {
                  this.text.setText("นั่งกันเลย");
                  this.time.delayedCall(
                    500,
                    this.animateTableAndBoss,
                    [],
                    this
                  );
                }
              }
            });

            // Start animations
            this.startBounceAnimation();
            this.startTypingEffect("มาถึงแล้วครับ ที่นี่คือร้านของเชฟกอร์ดัม");

            // Mark as loaded
            setIsLoading(false);
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

            // Change to speaking expression
            this.boss.setTexture("boss_speak");

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

                  // Change back to normal expression
                  this.boss.setTexture("boss");

                  // Proceed to next step based on current text
                  if (
                    this.currentText ===
                    "มาถึงแล้วครับ ที่นี่คือร้านของเชฟกอร์ดัม"
                  ) {
                    this.time.delayedCall(
                      1000,
                      this.showSecondDialog,
                      [],
                      this
                    );
                  } else if (this.currentText === "นั่งกันเลย") {
                    this.time.delayedCall(
                      500,
                      this.animateTableAndBoss,
                      [],
                      this
                    );
                  }
                }
              },
              callbackScope: this,
              repeat: text.length - 1,
            });
          }

          private showSecondDialog(): void {
            // Change boss expression
            this.boss.setTexture("boss_speak");

            // Start typing the second dialog
            this.startTypingEffect("นั่งกันเลย");
          }

          private animateTableAndBoss(): void {
            // Set animating flag
            this.isAnimating = true;
            console.log("Starting table and boss animation...");
            this.boss.setTexture("boss_normal");

            // Stop bounce animation
            this.tweens.killTweensOf(this.boss);

            // Animate table scale change
            this.tweens.add({
              targets: this.table,
              scaleX: 0.5,
              scaleY: 0.5,
              duration: 4000,
              ease: "Power2",
              onComplete: () => {
                this.isAnimating = false;
                console.log("Animation complete, starting 5s timer...");
                // Start 5s timer after animation completes
                let timeLeft = 5;
                const timer = this.time.addEvent({
                  delay: 1000,
                  callback: () => {
                    timeLeft--;
                    console.log(`Time left: ${timeLeft}s`);
                    if (timeLeft <= 0) {
                      console.log("Timer expired! Showing game over...");
                      // Show game over if timer expires without clicking
                      this.sitButton.disableInteractive();
                      this.sitButton.setVisible(false);
                      this.sitButtonText.setVisible(false);
                      this.showGameOver("ช้าเกินไป!\nเป็นลมตายย");
                      timer.destroy();
                    }
                  },
                  repeat: 4,
                });
              },
            });

            // Animate boss scale change
            this.tweens.add({
              targets: this.boss,
              scaleX: 0.37,
              scaleY: 0.37,
              y: 600,
              duration: 4000,
              ease: "Power2",
            });

            // Show sit button with animation
            this.sitButton.setVisible(true);
            this.sitButtonText.setVisible(true);

            // Make button interactive
            this.sitButton.setInteractive();
            this.sitButton.on("pointerdown", this.handleSitButtonClick, this);

            // Button pop-in animation
            this.tweens.add({
              targets: [this.sitButton, this.sitButtonText],
              scaleX: { from: 0, to: 1 },
              scaleY: { from: 0, to: 1 },
              duration: 500,
              ease: "Back.easeOut",
            });
          }

          private handleSitButtonClick(): void {
            // Remove button interactivity
            this.sitButton.disableInteractive();

            // Hide sit button
            this.sitButton.setVisible(false);
            this.sitButtonText.setVisible(false);

            // Check if animation is still running
            if (this.isAnimating) {
              console.log("Button clicked during animation! Game over...");
              this.boss.setTexture("boss_wha");
              // Make all objects move up infinitely before game over
              this.animateObjectsUp(() => {
                this.showGameOver(
                  "มารยาทพื้นฐานข้อที่ 54\nควรให้ผู้ใหญ่ นั่งลงก่อนค่อยนั่งตาม!"
                );
              });
            } else {
              console.log(
                "Button clicked after animation! Redirecting to scene 3..."
              );
              // Redirect to scene 3
              this.time.delayedCall(1000, () => {
                window.location.href = "/scene/3";
              });
            }
          }

          private animateObjectsUp(callback: () => void): void {
            console.log("Animating all objects moving up...");

            // Array of all objects to animate
            const objectsToAnimate = [
              this.boss,
              this.table,
              this.bubble,
              this.text,
            ];

            // Initial small shake
            this.tweens.add({
              targets: objectsToAnimate,
              y: "+=10",
              duration: 100,
              yoyo: true,
              repeat: 1,
              ease: "Sine.easeInOut",
              onComplete: () => {
                // After shake, move objects up rapidly
                this.tweens.add({
                  targets: objectsToAnimate,
                  y: "-=2000",
                  duration: 1500,
                  ease: "Cubic.easeIn",
                  onComplete: () => {
                    callback();
                  },
                });
              },
            });
          }

          private showGameOver(message: string = "GAME OVER"): void {
            incrementDeathCount();
            console.log("Showing game over screen with message:", message);

            // Show game over screen
            this.gameOverOverlay.setVisible(true);

            // Add death count text in top left
            const deathCountText = this.add.text(880, 50, `💀: ${getDeathCount()}`, {
              fontSize: "48px",
              color: "#FFFFFF",
              align: "left",
              lineSpacing: 30,
              padding: { x: 20, y: 20 },
            });
            deathCountText.setOrigin(0, 0); // Align to top left

            // Update game over text with custom message
            this.gameOverText.setText(message);
            this.gameOverText.setFontSize(
              message.length > 20 ? "56px" : "80px"
            ); // Increased font size for better readability
            this.gameOverText.setVisible(true);

            // Make game over screen clickable to go home
            this.gameOverOverlay.setInteractive();
            this.gameOverOverlay.once("pointerdown", () => {
              window.location.href = "/";
            });

            // Automatically go home after 4 seconds
            this.time.delayedCall(4000, () => {
              window.location.href = "/";
            });
          }

          private startBounceAnimation(): void {
            this.tweens.add({
              targets: this.boss,
              y: this.boss.y - 10,
              duration: 1000,
              yoyo: true,
              repeat: -1,
              ease: "Sine.easeInOut",
            });
          }
        }

        const config: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          width: 1200,
          height: 1000,
          parent: "game-container",
          backgroundColor: "#ffffff",
          scene: TableScene,
          dom: {
            createContainer: true,
          },
        };

        // Clean up any existing game instance
        if (gameInstance) {
          (gameInstance as Phaser.Game).destroy(true); // Assert that gameInstance is a Phaser.Game
        }

        // Create new game instance
        gameInstance = new Phaser.Game(config);
        gameRef.current = gameInstance;
      } catch (error) {
        console.error("Failed to initialize Phaser:", error);
        setIsLoading(false);
      }
    };

    initGame();

    return () => {
      // Don't destroy game instance on component unmount
      // to prevent recreation when React re-renders
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

// Prevent SSR and ensure single instance
export default dynamic(() => Promise.resolve(Scene2), {
  ssr: false,
});
