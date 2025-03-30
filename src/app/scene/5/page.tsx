"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { getDeathCount, incrementDeathCount } from "@/app/_utils/gameState";


// Singleton to track game instance
let gameInstance: Phaser.Game | null = null;
let hasInitialized = false;

const Scene5 = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initGame = async () => {
      if (typeof window === "undefined" || gameInstance || hasInitialized)
        return;

      hasInitialized = true;

      try {
        setIsLoading(true);
        const Phaser = await import("phaser");

        class Scene5Game extends Phaser.Scene {
          private background!: Phaser.GameObjects.Sprite;
          private thankYouButton!: Phaser.GameObjects.Rectangle;
          private thankYouButtonText!: Phaser.GameObjects.Text;
          private gameOverOverlay!: Phaser.GameObjects.Rectangle;
          private gameOverText!: Phaser.GameObjects.Text;
          private timerEvent?: Phaser.Time.TimerEvent;
          private timeLeft: number = 5; // Add this property to track time

          constructor() {
            super({ key: "Scene5Game" });
          }

          preload(): void {
            this.load.image("bg_5_1", "/images/5_1.PNG");
            this.load.image("bg_5_2", "/images/5_2.PNG");
            this.load.image("bg_5_lose", "/images/5_lose.PNG");
            this.load.image("ele_punch", "/images/ele_punch.PNG");
          }

          create(): void {
            // Initial background
            this.background = this.add.sprite(600, 600, "bg_5_1");
            this.background.setOrigin(0.5, 0.5);
            this.background.setScale(0.4);

            // Set loading to false once initial assets are loaded
            setIsLoading(false);

            // Transition to second background after 2 seconds
            this.time.delayedCall(2000, () => {
              this.background.setTexture("bg_5_2");
              this.background.setScale(0.4);

              // Show the "Thank You" button after the background changes
              this.thankYouButton.setVisible(true);
              this.thankYouButtonText.setVisible(true);
            });

            // Create thank you button (initially hidden)
            this.thankYouButton = this.add.rectangle(
              600,
              900,
              220,
              70,
              0x4caf50
            );
            this.thankYouButton.setStrokeStyle(3, 0x2e7d32);
            this.thankYouButton.setVisible(false); // Initially hidden

            this.thankYouButtonText = this.add.text(600, 900, "Thank You", {
              fontFamily: "Arial",
              fontSize: "36px",
              color: "#FFFFFF",
              align: "center",
              padding: { x: 5, y: 5 },
            });
            this.thankYouButtonText.setOrigin(0.5);
            this.thankYouButtonText.setVisible(false); // Initially hidden

            // Make button interactive
            this.thankYouButton.setInteractive();
            this.thankYouButton.on(
              "pointerdown",
              this.handleThankYouClick,
              this
            );

            // Start 5-second timer
            this.timeLeft = 5;
            this.timerEvent = this.time.addEvent({
              delay: 1000,
              callback: () => {
                this.timeLeft--;
                console.log(`Time left: ${this.timeLeft}`);
                if (this.timeLeft <= 0) {
                  this.timerEvent?.destroy();
                  this.showGameOver();
                }
              },
              repeat: 4,
            });
          }

          private handleThankYouClick(): void {
            console.log(
              `Button clicked with ${this.timeLeft} seconds remaining`
            );

            // Check if there's enough time left (more than 2 seconds)
            if (this.timeLeft > 2) {
              // Stop timer
              this.timerEvent?.destroy();

              // Hide button
              this.thankYouButton.disableInteractive();
              this.thankYouButton.setVisible(false);
              this.thankYouButtonText.setVisible(false);

              // Proceed to next scene
              this.time.delayedCall(1000, () => {
                window.location.href = "/scene/6";
              });
            } else {
              // Not enough time left, show game over instead
              console.log("Not enough time left! Game over!");
              this.timerEvent?.destroy();
              this.showGameOver();
            }
          }

          private showGameOver(): void {
            incrementDeathCount();
            // Change background to lose screen
            this.background.setTexture("bg_5_lose");

            // Delay the punch animation by 2 seconds
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

                  // Add death count text in top left
                  const deathCountText = this.add.text(880, 50, `💀: ${getDeathCount()}`, {
                    fontSize: "48px",
                    color: "#FFFFFF",
                    align: "left",
                    lineSpacing: 30,
                    padding: { x: 20, y: 20 },
                  });
                  deathCountText.setOrigin(0, 0); // Align to top left

                  this.gameOverText = this.add.text(
                    600,
                    500,
                    "มารยาทพื้นฐานข้อที่ 1 \n ขอบคุณเมื่อมีคนมอบของให้ \n เป็นมารยาทไทย" + "\n DEATH COUNT: " + getDeathCount(),
                    {
                      fontFamily: "Torsilp-SuChat", // Use the same font as in scene 2
                      fontSize: "56px", // Adjust font size for readability
                      color: "#FFFFFF", // White text color
                      align: "center", // Center alignment
                      lineSpacing: 30, // Add line spacing for better readability
                      padding: { x: 20, y: 20 }, // Add padding around the text
                    }
                  );
                  this.gameOverText.setOrigin(0.5); // Center the text
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
        const config: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          width: 1200,
          height: 1000,
          parent: "game-container",
          backgroundColor: "#ffffff",
          scene: Scene5Game,
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
export default dynamic(() => Promise.resolve(Scene5), {
  ssr: false,
});
