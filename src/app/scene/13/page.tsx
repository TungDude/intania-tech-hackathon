"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { getDeathCount, incrementDeathCount } from "@/app/_utils/gameState";
import { useRouter } from "next/navigation";

// Singleton to track game instance
let gameInstance: Phaser.Game | null = null;
let hasInitialized = false;

const Scene13 = () => {
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

                class Scene5Game extends Phaser.Scene {
                    private background!: Phaser.GameObjects.Sprite;
                    private boss!: Phaser.GameObjects.Sprite;
                    private openDoorBg!: Phaser.GameObjects.Sprite;
                    private closeDoorBg!: Phaser.GameObjects.Sprite;
                    private isDoorOpened: boolean = false;
                    private bubbleRight!: Phaser.GameObjects.Sprite;
                    private isAnimating: boolean = false;
                    private text!: Phaser.GameObjects.Text;
                    private currentText: string = "";
                    private typingTimer?: Phaser.Time.TimerEvent;
                    private isTyping: boolean = false;
                    private gameOverOverlay!: Phaser.GameObjects.Rectangle;
                    private gameOverText!: Phaser.GameObjects.Text;
                    private timerEvent?: Phaser.Time.TimerEvent;
                    private timeLeft: number = 5; // Add this property to track time

                    constructor() {
                        super({ key: "Scene10Game" });
                    }

                    preload(): void {
                        this.load.image('back_boss', '/images/13_Backboss.PNG');
                        this.load.image('bg_13', '/images/13_Doorclose.jpg');
                        this.load.image('open_door', '/images/13_Happyboss.jpg');
                        this.load.image('close_door', '/images/13_AngryBoss.jpg')
                        this.load.image("bubble_right", '/images/ele_bubble_right.PNG');
                        this.load.video("death", "/videos/10_DeathScene.mp4");
                    }

                    create(): void {
                        // Initial background
                        this.background = this.add.sprite(400, 500, "bg_13");
                        this.background.setOrigin(0.5, 0.5);
                        this.background.setScale(0.4);

                        // Make the background interactive
                        this.background.setInteractive();

                        // Add a click event listener
                        this.background.on("pointerdown", () => {
                            console.log("Background clicked!");
                            // Perform any action here, e.g., open a door or navigate to another scene
                            this.openDoor(); // Example function to handle door opening
                        });

                        this.boss = this.add.sprite(1000, 700, "back_boss");
                        this.boss.setOrigin(0.5, 0.5);
                        this.boss.setScale(0.7);

                        this.openDoorBg = this.add.sprite(400, 500, "open_door");
                        this.openDoorBg.setOrigin(0.5, 0.5);
                        this.openDoorBg.setScale(0.4);
                        this.openDoorBg.setVisible(false);

                        this.closeDoorBg = this.add.sprite(400, 500, "close_door");
                        this.closeDoorBg.setOrigin(0.5, 0.5);
                        this.closeDoorBg.setScale(0.4);
                        this.closeDoorBg.setVisible(false);


                        // Main diagonal movement
                        this.tweens.add({
                            targets: this.boss,
                            x: this.boss.x - 600, // Move left
                            y: this.boss.y - 600, // Move up
                            yoyo: false,
                            duration: 5000, // Total duration of movement
                            ease: "Linear",
                        });

                        // Bop effect: Moves slightly up and down repeatedly
                        this.tweens.add({
                            targets: this.boss,
                            y: this.boss.y - 25, // Moves up slightly
                            duration: 500, // Fast bounce
                            yoyo: true, // Moves back to original position
                            repeat: 5, // Repeat for the entire movement duration
                            ease: "Sine.easeInOut", // Smooth up-down motion
                        });


                        this.tweens.add({
                            targets: this.boss,
                            scale: { from: 0.7, to: 0.5 }, // Scale up and down
                            yoyo: false, // Reverse the animation
                            duration: 5000, // Duration of one pulse (in ms)
                            ease: "Sine.easeInOut", // Smooth easing
                        });

                        this.bubbleRight = this.add.sprite(800, 520, "bubble_right");
                        this.bubbleRight.setOrigin(0.5, 0.5);
                        this.bubbleRight.setScale(0.5);
                        this.bubbleRight.setVisible(false);

                        // // Add text with proper configuration
                        this.text = this.add.text(800, 520, "", {
                            fontFamily: "Torsilp-SuChat",
                            fontSize: "32px",
                            align: "center",
                            color: "#000000",
                            wordWrap: { width: 800 },
                            lineSpacing: 20,
                            padding: { x: 10, y: 10 },
                        });
                        this.text.setOrigin(0.5);

                        // Enable dragging
                        this.isAnimating = true;

                        // Set loading to false once initial assets are loaded
                        setIsLoading(false);

                        // Start 5-second timer
                        this.timeLeft = 5;
                        this.timerEvent = this.time.addEvent({
                            delay: 1000,
                            callback: () => {
                                this.timeLeft--;
                                if (this.isDoorOpened) {
                                    this.timerEvent?.destroy();
                                    this.openDoorBg.setVisible(true);
                                    this.boss.setVisible(false);
                                    setTimeout(() => {
                                        this.bubbleRight.setVisible(true);
                                        this.startTypingEffect("ขอบคุณมากครับ");
                                    }, 1000)
                                }
                                // console.log(`Time left: ${this.timeLeft}`);
                                if (this.timeLeft <= 0) {
                                    this.timerEvent?.destroy();
                                    this.closeDoorBg.setVisible(true);
                                    this.boss.setVisible(false);
                                    setTimeout(() => {
                                        this.showGameOver();
                                    }, 2000);
                                }
                            },
                            repeat: 5,
                        });
                    }

                    private openDoor(): void {
                        this.isDoorOpened = true;
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

                    private showGameOver(): void {
                        incrementDeathCount();

                        // Change background to lose screen
                        this.background.setTexture("death");

                        // Add and play the video
                        const deathVideo = this.add.video(600, 500, "death"); // Center the video
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

                            this.gameOverText = this.add.text(
                                600,
                                500,
                                "มารยาทพื้นฐานข้อที่ 16\nเปิดประตูให้ผู้ใหญ่เสมอ" +
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
                                router.push("/");
                            });

                            // Automatically go home after 4 seconds
                            this.time.delayedCall(4000, () => {
                                router.push("/");
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
export default dynamic(() => Promise.resolve(Scene13), {
    ssr: false,
});
