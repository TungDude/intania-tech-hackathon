"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { getDeathCount, incrementDeathCount } from "@/app/_utils/gameState";
import { useRouter } from "next/navigation";

// Singleton to track game instance
let gameInstance: Phaser.Game | null = null;
let hasInitialized = false;

const SceneLanding = () => {
  const router = useRouter();
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

        class SceneLandingGame extends Phaser.Scene {
          private background!: Phaser.GameObjects.Sprite;
          private doorClosed!: Phaser.GameObjects.Sprite;
          private doorTurned!: Phaser.GameObjects.Sprite;
          private doorKnocked!: Phaser.GameObjects.Sprite;
          private doorPerson!: Phaser.GameObjects.Sprite;
          private killFootage!: Phaser.GameObjects.Sprite;
          private knobArea!: Phaser.GameObjects.Zone;
          private doorArea!: Phaser.GameObjects.Zone;
          private knobTurned: number = 0;
          private knockCount: number = 0;
          private gameOverOverlay!: Phaser.GameObjects.Rectangle;
          private gameOverText!: Phaser.GameObjects.Text;
          private timerEvent?: Phaser.Time.TimerEvent;
          private timeLeft: number = 1; // Add this property to track time

          constructor() {
            super({ key: "Scene10Game" });
          }

          preload(): void {
            this.load.image("bg", "/images/0_door.PNG");
            this.load.image("door_closed", "/images/0_door_zoom.PNG");
            this.load.image("door_turned", "/images/0_door_turn.PNG");
            this.load.image("door_knocked", "/images/0_door_knock.PNG");
            this.load.image("door_person", "/images/0_door_knocktoomuch.PNG");
            this.load.image("bubble_left", '/images/ele_bubble_left.PNG');
            this.load.image("ele_punch", "/images/ele_punch.PNG");
            this.load.video("kill_footage", "/videos/video-output-119D2BEB-BFA1-42F1-8030-C5AA3D2FEB1A-1.mp4")
          }

          create(): void {
            // Initial background
            this.background = this.add.sprite(600, 600, "bg");
            this.background.setOrigin(0.5, 0.5);
            this.background.setScale(1);
            this.background.setVisible(false);

            this.doorClosed = this.add.sprite(600, 600, "door_closed");
            this.doorClosed.setOrigin(0.5, 0.5);
            this.doorClosed.setScale(0.45);
            this.doorClosed.setVisible(false); // Initially hidden

            this.doorPerson = this.add.sprite(600, 600, "door_person");
            this.doorPerson.setOrigin(0.5, 0.5);
            this.doorPerson.setScale(0.45);
            this.doorPerson.setVisible(false); // Initially hidden

            this.doorKnocked = this.add.sprite(600, 600, "door_knocked");
            this.doorKnocked.setOrigin(0.5, 0.5);
            this.doorKnocked.setScale(0.45);
            this.doorKnocked.setVisible(false); // Initially hidden

            this.doorTurned = this.add.sprite(600, 600, "door_turned");
            this.doorTurned.setOrigin(0.5, 0.5);
            this.doorTurned.setScale(0.45);
            this.doorTurned.setVisible(false); // Initially hidden

            this.killFootage = this.add.sprite(600, 600, "kill_footage");
            this.killFootage.setOrigin(0.5, 0.5);
            this.killFootage.setScale(0.45);
            this.killFootage.setVisible(false); // Initially hidden

            // Add drop zones
            this.doorArea = this.add.zone(0, 0, 1800, 2400);
            this.knobArea = this.add.zone(680, 780, 320, 100);

            // const correctZoneRect = this.add.rectangle(
            //   0,
            //   0,
            //   1800,
            //   2400,
            //   0x00ff00,
            //   0.2
            // );

            // Set loading to false once initial assets are loaded
            setIsLoading(false);

            // Make background visible for the animation
            this.background.setVisible(true);

            // Animate the background scale
            this.tweens.add({
              targets: this.background,
              scale: { from: 1, to: 8.4 }, // Scale up
              yoyo: false, // No reverse scaling
              repeat: 0, // Only play once
              duration: 4000, // Duration of animation
              ease: "Sine.easeInOut", // Smooth easing
              onComplete: () => {
                // Once the background animation is complete, hide it
                this.background.setVisible(false);

                // Now start fading in the doorClosed
                this.doorClosed.setVisible(true); // Make the door visible

                this.tweens.add({
                  targets: this.doorClosed,
                  alpha: { from: 0, to: 1 }, // Fade from invisible to visible
                  duration: 2000, // Duration of fade-in (in ms)
                  ease: "Sine.easeInOut", // Smooth easing for fade
                });
              },
            });

            // Enable input on the clickable zone
            this.knobArea.setInteractive();
            // Add an event listener for the 'pointerdown' event
            this.knobArea.on('pointerdown', () => {
              // Action to perform when the area is clicked
              this.knobAction();
            });

            // Enable input on the clickable zone
            this.doorArea.setInteractive();
            // Add an event listener for the 'pointerdown' event
            this.doorArea.on('pointerdown', () => {
              // Action to perform when the area is clicked
              this.doorAction();
            });

            // Start 10-second timer
            this.timeLeft = 1;
            this.timerEvent = this.time.addEvent({
              delay: 10000,
              callback: () => {
                this.timerEvent?.destroy();
                this.showGameOver(2);
              },
              repeat: 0,
            });
          }

          private knobAction(): void {
            this.timerEvent?.destroy();
            this.knobArea.disableInteractive();
            this.doorArea.disableInteractive();

            if (this.knockCount >= 3) {
              this.limitedVisible(this.doorTurned, 2000);
              setTimeout(() => {
                router.push('/scene/1');
              }, 2000)
            }

            if (this.knobTurned === 2) {
              this.limitedVisible(this.doorPerson, 2000);
            } else if (this.knobTurned > 2) {
              this.showGameOver(1);
            }

            this.doorTurned.setVisible(true);
            this.knobTurned = this.knobTurned + 1;
            setTimeout(() => {
              this.knobArea.setInteractive();
              this.doorArea.setInteractive();
              this.doorTurned.setVisible(false);
            }, 1000)
          }

          private doorAction(): void {
            this.timerEvent?.destroy();
            this.knobArea.disableInteractive();
            this.doorArea.disableInteractive();

            if (this.knockCount >= 10) {
              this.limitedVisible(this.doorPerson, 2000);
              setTimeout(() => {
                this.showGameOver(3);
              }, 2000)
            }

            this.doorKnocked.setVisible(true);
            this.knockCount = this.knockCount + 1;
            setTimeout(() => {
              this.knobArea.setInteractive();
              this.doorArea.setInteractive();
              this.doorKnocked.setVisible(false);
            }, 1000)
          }

          private limitedVisible(sprite: Phaser.GameObjects.Sprite, timeout: number): void {
            sprite.setVisible(true);
            setTimeout(() => {
              sprite.setVisible(false);
            }, timeout)
          }

          private showGameOver(mode: 1 | 2 | 3): void {
            incrementDeathCount();

            // Change background to lose screen
            this.background.setTexture("kill_footage");

            // Add and play the video
            const deathVideo = this.add.video(600, 500, "kill_footage"); // Center the video
            deathVideo.setOrigin(0.5, 0.5); // Center the origin
            deathVideo.setScale(1.2); // Adjust scale if needed
            deathVideo.play(false); // Play the video in a loop (set to `false` if you don't want looping)

            // Add an event listener to detect when the video ends
            deathVideo.on("complete", () => {
              // Show game over overlay after the video ends
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

              let deathMessage = "";

              if (mode === 1) {
                deathMessage = getDeathCount() < 2 ? "รบกวนมีมารยาทด้วยค่ะ" : getDeathCount() < 3 ? "เกมนี้สอนมารยาทนะครับ" : "มารยาทพื้นฐานข้อที่ 12 \nก่อนเข้าต้องเคาะประตูก่อนเสมอ";
              } else if (mode === 2) {
                deathMessage = "มายืนจ้องหน้าบ้านคนอื่นทำไมครับ";
              } else {
                deathMessage = "เคาะอะไรแยะแยะ";
              }

              this.gameOverText = this.add.text(
                600,
                500,
                deathMessage +
                "\n DEATH COUNT: " +
                getDeathCount(),
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
                location.reload();
              });

              // Automatically go home after 4 seconds
              this.time.delayedCall(4000, () => {
                location.reload();
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
          scene: SceneLandingGame,
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
  }, [router]);

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
export default dynamic(() => Promise.resolve(SceneLanding), {
  ssr: false,
});
