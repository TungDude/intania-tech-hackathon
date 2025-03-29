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
let gameInstance: Phaser.Game | null = null;
let hasInitialized = false;

const Scene8 = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
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

        class EatingScene extends Phaser.Scene {
          private background!: Phaser.GameObjects.Sprite;
          private bubble!: Phaser.GameObjects.Sprite;
          private text!: Phaser.GameObjects.Text;
          private eatButton!: Phaser.GameObjects.Rectangle;
          private eatButtonText!: Phaser.GameObjects.Text;
          private gameOverOverlay!: Phaser.GameObjects.Rectangle;
          private gameOverText!: Phaser.GameObjects.Text;
          private timerEvent?: Phaser.Time.TimerEvent;
          private timeElapsed: number = 0;
          private canEatNow: boolean = false;
          private waitingTime: number = 4; // Must wait 4 seconds
          private fullText: string = "เชิญกินได้เลยครับ";
          private currentText: string = "";
          private typingTimer?: Phaser.Time.TimerEvent;

          constructor() {
            super({ key: "EatingScene" });
          }

          preload(): void {
            // Load font
            this.load.css("Torsilp", "./Torsilp-SuChat.ttf");

            // Load images
            this.load.image("bg_8_default", "/images/8_default.png");
            this.load.image("bg_8_lose", "/images/8_lose.png");
            this.load.image("bubble", "/images/ele_bubble_top.png");
            this.load.image("ele_punch", "/images/ele_punch.PNG");
          }

          create(): void {
            // Initial background
            this.background = this.add.sprite(600, 630, "bg_8_default");
            this.background.setOrigin(0.5, 0.5);
            this.background.setScale(0.42);

            // Add speech bubble
            this.bubble = this.add.sprite(600, 250, "bubble");
            this.bubble.setScale(0.5);

            // Add text (initially empty)
            this.text = this.add.text(600, 230, "", {
              fontFamily: "Torsilp-SuChat",
              fontSize: "32px",
              align: "center",
              color: "#000000",
              wordWrap: { width: 800 },
              lineSpacing: 20,
              padding: { x: 15, y: 15 },
            });
            this.text.setOrigin(0.5);

            // Start typing effect
            this.startTypingEffect();

            // Create eat button (initially hidden)
            this.eatButton = this.add.rectangle(600, 900, 220, 70, 0x4caf50);
            this.eatButton.setStrokeStyle(3, 0x2e7d32);
            this.eatButton.setVisible(false);

            this.eatButtonText = this.add.text(600, 900, "กิน", {
              fontFamily: "Torsilp-SuChat",
              fontSize: "32px",
              color: "#FFFFFF",
              padding: { x: 5, y: 5 },
            });
            this.eatButtonText.setOrigin(0.5);
            this.eatButtonText.setVisible(false);

            // Set loading to false once initial assets are loaded
            setIsLoading(false);

            // Show eat button after 1 second
            this.time.delayedCall(1000, () => {
              this.eatButton.setVisible(true);
              this.eatButtonText.setVisible(true);

              // Button pop-in animation
              this.tweens.add({
                targets: [this.eatButton, this.eatButtonText],
                scaleX: { from: 0, to: 1 },
                scaleY: { from: 0, to: 1 },
                duration: 500,
                ease: "Back.easeOut",
              });

              // Subtle bounce animation
              this.tweens.add({
                targets: [this.eatButton, this.eatButtonText],
                y: "-=5",
                duration: 700,
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut",
              });
            });

            // Make button interactive
            this.eatButton.setInteractive();
            this.eatButton.on("pointerdown", this.handleEatButtonClick, this);

            // Start timer to track elapsed time
            this.startTimer();
          }

          private startTypingEffect(): void {
            let currentIndex = 0;

            // Clear any existing typing timer
            if (this.typingTimer) {
              this.typingTimer.destroy();
            }

            this.currentText = "";
            this.text.setText("");

            this.typingTimer = this.time.addEvent({
              delay: 100,
              callback: () => {
                if (currentIndex < this.fullText.length) {
                  this.currentText += this.fullText[currentIndex];
                  this.text.setText(this.currentText);
                  currentIndex++;
                }
              },
              callbackScope: this,
              repeat: this.fullText.length - 1,
            });
          }

          private startTimer(): void {
            this.timeElapsed = 0;
            this.canEatNow = false;

            this.timerEvent = this.time.addEvent({
              delay: 1000,
              callback: () => {
                this.timeElapsed++;
                console.log(`Time elapsed: ${this.timeElapsed}s`);

                // After waiting time, allow eating
                if (this.timeElapsed >= this.waitingTime && !this.canEatNow) {
                  this.canEatNow = true;
                  console.log("Now it's proper to eat!");
                }
              },
              callbackScope: this,
              loop: true,
            });
          }

          private handleEatButtonClick(): void {
            console.log(`Eat button clicked after ${this.timeElapsed} seconds`);

            // Stop timer
            if (this.timerEvent) {
              this.timerEvent.destroy();
            }

            // Hide button
            this.eatButton.disableInteractive();
            this.eatButton.setVisible(false);
            this.eatButtonText.setVisible(false);

            // Check if waited enough time
            if (this.canEatNow) {
              // Success - waited enough time
              console.log("Success! Waited the proper amount of time");

              // Proceed to next scene
              this.time.delayedCall(1000, () => {
                window.location.href = "/scene/9";
              });
            } else {
              // Failure - ate too quickly
              console.log("Ate too quickly! Game over");
              this.showGameOver();
            }
          }

          private showGameOver(): void {
            // Change background to lose screen
            this.background.setTexture("bg_8_lose");

            // Hide bubble and text
            this.bubble.setVisible(false);
            this.text.setVisible(false);

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

              // Start shaking animation
              this.tweens.add({
                targets: [this.background, elePunch],
                x: { from: this.background.x - 10, to: this.background.x + 10 },
                duration: 50,
                yoyo: true,
                repeat: 5,
                ease: "Sine.easeInOut",
                onComplete: () => {
                  // Show game over overlay
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
                    "มารยาทพื้นฐานข้อที่ 42 \nต้องรอให้ทุกคนพร้อมก่อนเริ่มกิน\nการรีบกินเป็นมารยาทที่ไม่ดี",
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
          scene: EatingScene,
          dom: {
            createContainer: true,
          },
        };

        if (gameInstance) {
          (gameInstance as Phaser.Game).destroy(true); // Assert that gameInstance is a Phaser.Game
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
          <p className="text-2xl font-bold">กำลังโหลด...</p>
        </div>
      )}
    </div>
  );
};

export default dynamic(() => Promise.resolve(Scene8), {
  ssr: false,
});
