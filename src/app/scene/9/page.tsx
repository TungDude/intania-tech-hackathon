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

const Scene9 = () => {
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

        class ImageSequenceScene extends Phaser.Scene {
          private background!: Phaser.GameObjects.Sprite;
          private gameOverOverlay!: Phaser.GameObjects.Rectangle;
          private gameOverText!: Phaser.GameObjects.Text;
          private sequenceIndex: number = 0;
          private imageSequence: string[] = [
            "8_default",
            "8_default",
            "9_double_munch",
            "9_double_default",
            "9_single_munch",
            "9_single_default",
            "9_finish",
          ];
          private sequenceTimer?: Phaser.Time.TimerEvent;
          private rice!: Phaser.GameObjects.Sprite;
          private munchButton!: Phaser.GameObjects.Rectangle;
          private munchButtonText!: Phaser.GameObjects.Text;
          private swallowButton!: Phaser.GameObjects.Rectangle;
          private swallowButtonText!: Phaser.GameObjects.Text;
          private munchCount: number = 0;
          private riceStages: string[] = ["9_rice_1", "9_rice_2", "9_rice_3"];
          private canMunch: boolean = false;
          private sequenceFinished: boolean = false;
          private finalCountdown?: Phaser.Time.TimerEvent;
          private finalCountdownText!: Phaser.GameObjects.Text;

          constructor() {
            super({ key: "ImageSequenceScene" });
          }

          preload(): void {
            // Load font
            this.load.css("Torsilp", "./Torsilp-SuChat.ttf");

            // Load all images
            this.load.image("8_default", "/images/8_default.png");
            this.load.image("9_double_munch", "/images/9_double_munch.png");
            this.load.image("9_double_default", "/images/9_double_default.png");
            this.load.image("9_single_munch", "/images/9_single_munch.png");
            this.load.image("9_single_default", "/images/9_single_default.png");
            this.load.image("9_finish", "/images/9_finish.png");
            this.load.image("9_rice", "/images/9_rice_1.png");
            this.load.image("9_rice_1", "/images/9_rice_2.png");
            this.load.image("9_rice_2", "/images/9_rice_3.png");
            this.load.image("9_rice_3", "/images/9_rice_4.png");
            this.load.image("9_DeathScene", "/images/9_DeathScene.jpg");
          }

          create(): void {
            // Initial background
            this.background = this.add.sprite(600, 550, "8_default");
            this.background.setOrigin(0.5, 0.5);
            this.background.setScale(0.45);

            this.rice = this.add.sprite(590, 812, "9_rice");
            this.rice.setOrigin(0.5, 0.5);
            this.rice.setScale(0.46);

            // Create munch button
            this.munchButton = this.add.rectangle(450, 900, 180, 70, 0x4caf50);
            this.munchButton.setStrokeStyle(3, 0x2e7d32);
            this.munchButton.setInteractive();

            this.munchButtonText = this.add.text(450, 900, "เคี้ยว", {
              fontFamily: "Torsilp-SuChat",
              fontSize: "32px",
              color: "#FFFFFF",
              align: "center",
              padding: { x: 5, y: 5 },
            });
            this.munchButtonText.setOrigin(0.5);

            // Create swallow button
            this.swallowButton = this.add.rectangle(
              750,
              900,
              180,
              70,
              0x2196f3
            );
            this.swallowButton.setStrokeStyle(3, 0x1565c0);
            this.swallowButton.setInteractive();

            this.swallowButtonText = this.add.text(750, 900, "กลืน", {
              fontFamily: "Torsilp-SuChat",
              fontSize: "32px",
              color: "#FFFFFF",
              align: "center",
              padding: { x: 5, y: 5 },
            });
            this.swallowButtonText.setOrigin(0.5);

            // Add button event handlers
            this.munchButton.on("pointerdown", this.handleMunchClick, this);
            this.swallowButton.on("pointerdown", this.handleSwallowClick, this);

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

            // Start image sequence
            this.startImageSequence();

            setIsLoading(false);
          }

          private startImageSequence(): void {
            // Reset sequence index
            this.sequenceIndex = 0;
            this.munchCount = 0; // Reset munch count
            this.canMunch = false; // Reset munch permission

            // Set initial image
            this.background.setTexture(this.imageSequence[this.sequenceIndex]);

            // If there's an existing timer, destroy it
            if (this.sequenceTimer) {
              this.sequenceTimer.destroy();
            }

            // Create timer to change image every 3 seconds
            this.sequenceTimer = this.time.addEvent({
              delay: 2500,
              callback: this.updateImage,
              callbackScope: this,
              loop: true,
            });
          }

          private updateImage(): void {
            // Increment sequence index
            this.sequenceIndex++;

            // Check if we've reached the end of the sequence
            if (this.sequenceIndex >= this.imageSequence.length) {
              // We've reached the end, stop the timer
              if (this.sequenceTimer) {
                this.sequenceTimer.destroy();
              }
              this.sequenceFinished = true;
              // Stay on last image
              this.sequenceIndex = this.imageSequence.length - 1;

              // Start the final 2-second countdown
              this.startFinalCountdown();
            }

            // Update background texture with fade effect
            this.tweens.add({
              targets: this.background,
              alpha: { from: 1, to: 0.8 },
              duration: 50,
              yoyo: true,
              onComplete: () => {
                this.background.setTexture(
                  this.imageSequence[this.sequenceIndex]
                );

                // Update canMunch based on current image - once true, stays true
                if (
                  this.imageSequence[this.sequenceIndex] === "9_double_munch"
                ) {
                  this.canMunch = true;
                }
                console.log(`Can munch: ${this.canMunch}`);
              },
            });

            console.log(
              `Changed to image: ${this.imageSequence[this.sequenceIndex]}`
            );
          }

          private startFinalCountdown(): void {
            console.log("Starting final 2-second countdown!");

            // Set up a 2-second countdown (invisible to player)
            let remainingTime = 2;
            this.finalCountdown = this.time.addEvent({
              delay: 1000,
              callback: () => {
                remainingTime--;
                console.log(`Time remaining: ${remainingTime}s`);

                if (remainingTime <= 0) {
                  // Time's up - show game over without animation
                  this.showGameOver(
                    "มารยาทพื้นฐานข้อที่ 19\nใช้เวลากินนานเกินไป! \nต้องกลืนให้ทันภายใน 2 วินาที",
                    false
                  );
                }
              },
              callbackScope: this,
              repeat: 1,
            });
          }

          // Add a method to animate all objects moving down before game over
          private animateObjectsDown(callback: () => void): void {
            console.log("Animating all objects moving down...");

            // Array of all objects to animate
            const objectsToAnimate = [
              this.background,
              this.rice,
              this.munchButton,
              this.munchButtonText,
              this.swallowButton,
              this.swallowButtonText,
            ];

            // Initial small shake
            this.tweens.add({
              targets: objectsToAnimate,
              y: "-=10",
              duration: 50,
              yoyo: true,
              repeat: 2,
              ease: "Sine.easeInOut",
              onComplete: () => {
                // After shake, move objects down rapidly
                this.tweens.add({
                  targets: objectsToAnimate,
                  y: "+=2000",
                  duration: 1200,
                  ease: "Cubic.easeIn",
                  onComplete: () => {
                    // Show death scene image - set depth to a low value to ensure it's in the background
                    const deathScene = this.add.sprite(
                      600,
                      500,
                      "9_DeathScene"
                    );
                    deathScene.setOrigin(0.5);
                    deathScene.setScale(0.70);
                    deathScene.setAlpha(0);
                    deathScene.setDepth(-1); // Set to a negative depth to ensure it's behind everything

                    // Fade in death scene
                    this.tweens.add({
                      targets: deathScene,
                      alpha: 1,
                      duration: 800,
                      onComplete: () => {
                        callback();
                      },
                    });
                  },
                });
              },
            });
          }

          // Modify the showGameOver method to accept an animation flag parameter
          private showGameOver(
            message: string = "GAME OVER",
            useAnimation: boolean = false
          ): void {
            incrementDeathCount();
            console.log("Showing game over screen with message:", message);

            // Stop sequence timer
            if (this.sequenceTimer) {
              this.sequenceTimer.destroy();
            }

            // Stop final countdown
            if (this.finalCountdown) {
              this.finalCountdown.destroy();
            }

            // Disable buttons to prevent further interaction
            this.munchButton.disableInteractive();
            this.swallowButton.disableInteractive();

            if (useAnimation) {
              // Use the special animation only for specific game over condition
              this.animateObjectsDown(() => {
                // Show game over screen after animation completes
                this.showGameOverOverlay(message);
              });
            } else {
              // For other game over conditions, just show the overlay immediately
              this.showGameOverOverlay(message);
            }
          }

          // Extract the game over overlay display logic to a separate method
          private showGameOverOverlay(message: string): void {
            // Ensure game over overlay is at a higher depth
            this.gameOverOverlay.setDepth(10);
            this.gameOverOverlay.setVisible(true);

            // Add death count text in top left
            const deathCountText = this.add.text(
              880,
              50,
              `💀: ${getDeathCount()}`,
              {
                fontSize: "48px",
                color: "#FFFFFF",
                align: "left",
                lineSpacing: 30,
                padding: { x: 20, y: 20 },
              }
            );
            deathCountText.setOrigin(0, 0);
            deathCountText.setDepth(11); // Set to a high depth

            // Update game over text with custom message
            this.gameOverText.setText(message);
            this.gameOverText.setFontSize(
              message.length > 20 ? "56px" : "80px"
            );
            this.gameOverText.setDepth(11); // Set to a high depth
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

          private handleMunchClick(): void {
            // Check if we can munch right now based on the current image
            if (!this.canMunch) {
              this.showGameOver(
                "มารยาทพื้นฐานข้อที่ 17\nไม่ควรเคี้ยวตอนนี้! ต้องรอคำอนุญาตก่อน",
                false
              );
              return;
            }

            // Rest of munch click handler
            this.munchCount++;
            console.log(`Munch count: ${this.munchCount}`);

            // Play a subtle button press animation
            this.tweens.add({
              targets: [this.munchButton, this.munchButtonText],
              duration: 50,
            });

            // Check if we need to update rice image (every 8 munches)
            if (this.munchCount % 8 === 0 && this.munchCount < 32) {
              const riceIndex = this.munchCount / 8 - 1;
              if (riceIndex < this.riceStages.length) {
                // Fade out current rice
                this.tweens.add({
                  targets: this.rice,
                  alpha: 0,
                  duration: 300,
                  onComplete: () => {
                    // Switch to new rice texture and make it immediately visible
                    this.rice.setTexture(this.riceStages[riceIndex]);
                    this.rice.setAlpha(1);
                  },
                });
                console.log(`Rice updated to stage ${riceIndex + 1}`);
              }
            }

            // When reaching 32 munches, remove the rice
            if (this.munchCount === 32) {
              // Fade out rice and remove it
              this.tweens.add({
                targets: this.rice,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                  this.rice.setVisible(false);
                },
              });
              console.log("Rice finished and removed!");
            }

            // Check if player has munched too many times
            if (this.munchCount > 32) {
              this.showGameOver(
                "มารยาทพื้นฐานข้อที่ 15\nเคี้ยวมากเกินไป! \nเคี้ยว 32 ครั้งก็พอแล้ว",
                false
              );
            }
          }

          private handleSwallowClick(): void {
            console.log(`Swallow clicked after ${this.munchCount} munches`);

            // Play a subtle button press animation
            this.tweens.add({
              targets: [this.swallowButton, this.swallowButtonText],
              scaleX: 0.95,
              scaleY: 0.95,
              duration: 100,
              yoyo: true,
            });

            // Check if player has munched exactly 32 times
            if (this.munchCount === 32) {
              // Check if we've reached the last sequence
              if (!this.sequenceFinished) {
                // Game over - tried to swallow too early in the sequence
                // This is the specific case where we want the special animation
                this.showGameOver(
                  "มารยาทพื้นฐานข้อที่ 18\nต้องรอให้ถึงเวลาที่เหมาะสมก่อนกลืน!",
                  true // Use the special animation
                );
                return;
              }

              // Success - redirect to next scene
              console.log("Perfect! Exactly 32 munches before swallowing");

              // Disable buttons
              this.munchButton.disableInteractive();
              this.swallowButton.disableInteractive();

              // Redirect to next scene after a short delay
              this.time.delayedCall(1000, () => {
                window.location.href = "/scene/10";
              });
            } else {
              // Game over - either too few or too many munches
              let message = "";
              if (this.munchCount < 32) {
                message = `มารยาทพื้นฐานข้อที่ 16\nเคี้ยวน้อยเกินไป! \nเคี้ยวเพียง ${this.munchCount} ครั้งจาก 32 ครั้ง`;
              } else {
                message = `มารยาทพื้นฐานข้อที่ 15\nเคี้ยวมากเกินไป! \nเคี้ยว ${this.munchCount} ครั้งแทนที่จะเป็น 32 ครั้ง`;
              }
              this.showGameOver(message, false); // No special animation
            }
          }
        }

        const config: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          width: 1200,
          height: 1000,
          parent: "game-container",
          backgroundColor: "#ffffff",
          scene: ImageSequenceScene,
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
          <p className="text-2xl font-bold">Loading...</p>
        </div>
      )}
    </div>
  );
};

export default dynamic(() => Promise.resolve(Scene9), {
  ssr: false,
});
