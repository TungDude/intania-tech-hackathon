"use client";

import { useEffect, useRef, useState } from "react";
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
let gameInstance: any = null;
let hasInitialized = false;

const Scene7 = () => {
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

        class Scene7Game extends Phaser.Scene {
          private background!: Phaser.GameObjects.Sprite;
          private thanksButton!: Phaser.GameObjects.Rectangle;
          private thanksButtonText!: Phaser.GameObjects.Text;
          private gameOverOverlay!: Phaser.GameObjects.Rectangle;
          private gameOverText!: Phaser.GameObjects.Text;
          private timerEvent?: Phaser.Time.TimerEvent;
          private timeLeft: number = 5;
          private timerText!: Phaser.GameObjects.Text;

          constructor() {
            super({ key: "Scene7Game" });
          }

          preload(): void {
            // Load font
            this.load.css("Torsilp", "./Torsilp-SuChat.ttf");

            // Load images
            this.load.image("bg_7_1", "/images/7_default.png");
            this.load.image("bg_7_2", "/images/7_default.png");
            this.load.image("bg_7_serve_1", "/images/7_serve.png");
            this.load.image("bg_7_serve_2", "/images/7_serve_2.png");
            this.load.image("bg_7_lose", "/images/7_lose.png");
            this.load.image("ele_punch", "/images/ele_punch.PNG");
          }

          create(): void {
            // Initial background
            this.background = this.add.sprite(600, 600, "bg_7_serve_1");
            this.background.setOrigin(0.5, 0.5);
            this.background.setScale(0.45);

            // Set loading to false once initial assets are loaded
            setIsLoading(false);

            // Create thanks button (initially hidden)
            this.thanksButton = this.add.rectangle(600, 900, 220, 70, 0x4caf50);
            this.thanksButton.setStrokeStyle(3, 0x2e7d32);
            this.thanksButton.setVisible(false);

            this.thanksButtonText = this.add.text(600, 900, "ขอบคุณครับ", {
              fontFamily: "Torsilp-SuChat",
              fontSize: "32px",
              color: "#FFFFFF",
              padding: { x: 5, y: 5 },
            });
            this.thanksButtonText.setOrigin(0.5);
            this.thanksButtonText.setVisible(false);

            // Make button interactive
            this.thanksButton.setInteractive();
            this.thanksButton.on("pointerdown", this.handleThanksClick, this);

            // Add subtle bounce animation to button
            this.tweens.add({
              targets: [this.thanksButton, this.thanksButtonText],
              y: "-=5",
              duration: 700,
              yoyo: true,
              repeat: -1,
              ease: "Sine.easeInOut",
            });

            // Sequence of background changes
            this.time.delayedCall(2000, () => {
              // First transition: bg_7_serve_1 -> bg_7_serve_2
              this.background.setTexture("bg_7_serve_2");

              this.time.delayedCall(2000, () => {
                // Second transition: bg_7_serve_2 -> bg_7_1
                this.background.setTexture("bg_7_1");

                this.time.delayedCall(2000, () => {
                  // Third transition: bg_7_1 -> bg_7_2
                  this.background.setTexture("bg_7_2");

                  // Show the "ขอบคุณครับ" button after the final background change
                  this.thanksButton.setVisible(true);
                  this.thanksButtonText.setVisible(true);

                  // Button pop-in animation
                  this.tweens.add({
                    targets: [this.thanksButton, this.thanksButtonText],
                    scaleX: { from: 0, to: 1 },
                    scaleY: { from: 0, to: 1 },
                    duration: 500,
                    ease: "Back.easeOut",
                  });

                  // Start timer after the final background change
                  this.startTimer();
                });
              });
            });
          }

          private startTimer(): void {
            // Start 5-second timer
            this.timeLeft = 5;
            this.timerText = this.add.text(1100, 100, "5", {
              fontFamily: "Torsilp-SuChat",
              fontSize: "48px",
              color: "#FF0000",
              fontStyle: "bold",
            });

            // Make timer text invisible but keep functionality
            this.timerText.setVisible(false);

            this.timerEvent = this.time.addEvent({
              delay: 1000,
              callback: () => {
                this.timeLeft--;
                this.timerText.setText(this.timeLeft.toString());
                console.log(`Time left: ${this.timeLeft}`);

                // No need for visual effects since timer is invisible
                // But keep functionality for debugging
                if (this.timeLeft <= 0) {
                  this.timerEvent?.destroy();
                  this.showGameOver();
                }
              },
              repeat: 4,
            });
          }

          private handleThanksClick(): void {
            console.log(
              `Button clicked with ${this.timeLeft} seconds remaining`
            );

            // Check if there's enough time left (more than 2 seconds)
            if (this.timeLeft > 2) {
              // Stop timer
              this.timerEvent?.destroy();

              // Hide timer text (redundant but for safety)
              if (this.timerText) this.timerText.setVisible(false);

              // Hide button
              this.thanksButton.disableInteractive();
              this.thanksButton.setVisible(false);
              this.thanksButtonText.setVisible(false);

              // Proceed to home screen with delay
              this.time.delayedCall(4000, () => {
                window.location.href = "/scene/8";
              });
            } else {
              // Not enough time left, show game over instead
              console.log("Too late! Game over!");
              this.timerEvent?.destroy();
              this.showGameOver();
            }
          }

          private showGameOver(): void {
            // Hide timer

            // Change background to lose screen
            this.background.setTexture("bg_7_lose");

            // Hide button if visible
            this.thanksButton.setVisible(false);
            this.thanksButtonText.setVisible(false);

            // Delay the punch animation
            this.time.delayedCall(750, () => {
              // Add rapid zoom-in animation for ele_punch
              const elePunch = this.add.sprite(600, 500, "ele_punch");
              elePunch.setScale(0);

              // Start punch scaling animation
              this.tweens.add({
                targets: elePunch,
                scale: { from: 0, to: 1.5 },
                duration: 1000,
                ease: "Back.easeOut",
              });

              // Start shaking animation immediately
              this.tweens.add({
                targets: [this.background, elePunch],
                x: { from: this.background.x - 10, to: this.background.x + 10 },
                duration: 50,
                yoyo: true,
                repeat: 5,
                ease: "Sine.easeInOut",
                onComplete: () => {
                  // Show game over overlay after shaking animation
                  this.gameOverOverlay = this.add.rectangle(
                    600,
                    500,
                    1200,
                    1000,
                    0x000000,
                    0.8
                  );
                  this.gameOverOverlay.setVisible(true);

                  this.gameOverText = this.add.text(
                    600,
                    500,
                    "มารยาทพื้นฐานข้อที่ 27 \n ต้องขอบคุณเมื่อได้รับของ\nและต้องขอบคุณให้ทันเวลา",
                    {
                      fontFamily: "Torsilp-SuChat",
                      fontSize: "56px",
                      color: "#FFFFFF",
                      align: "center",
                      lineSpacing: 30,
                      padding: { x: 20, y: 20 },
                    }
                  );
                  this.gameOverText.setOrigin(0.5);
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
                },
              });
            });
          }
        }

        const config = {
          type: Phaser.AUTO,
          width: 1200,
          height: 1000,
          backgroundColor: "#FFFFFF",
          parent: "game-container",
          scene: Scene7Game,
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
      {isLoading && (
        <div className="text-center">
          <p className="text-2xl font-bold">Loading...</p>
        </div>
      )}
    </div>
  );
};

export default dynamic(() => Promise.resolve(Scene7), {
  ssr: false,
});
