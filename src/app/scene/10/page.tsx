"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { getDeathCount, incrementDeathCount } from "@/app/_utils/gameState";
import { useRouter } from "next/navigation";

// Singleton to track game instance
let gameInstance: Phaser.Game | null = null;
let hasInitialized = false;

const Scene10 = () => {
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
                    private fork!: Phaser.GameObjects.Sprite;
                    private knife!: Phaser.GameObjects.Sprite;
                    private bubbleLeft!: Phaser.GameObjects.Sprite;
                    private correctZone!: Phaser.GameObjects.Zone;
                    private isAnimating: boolean = false;
                    private isForkDragged: boolean = false;
                    private isKnifeDragged: boolean = false;
                    private forkPlaced: boolean = false;
                    private knifePlaced: boolean = false;
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
                        this.load.image("bg_10_1", "/images/10_default.PNG");
                        this.load.image("fork", "/images/3_fork.PNG");
                        this.load.image("knife", "/images/3_knife.PNG");
                        this.load.image("bubble_left", '/images/ele_bubble_left.PNG');
                        this.load.image("ele_punch", "/images/ele_punch.PNG");
                        this.load.video("death", "/videos/10_DeathScene.mp4")
                    }

                    create(): void {
                        // Initial background
                        this.background = this.add.sprite(600, 600, "bg_10_1");
                        this.background.setOrigin(0.5, 0.5);
                        this.background.setScale(0.4);

                        this.fork = this.add.sprite(380, 800, "fork");
                        this.fork.setOrigin(0.5, 0.5); // Center the origin
                        this.fork.setScale(0.5);

                        // this.tweens.add({
                        //     targets: this.fork,
                        //     scale: { from: 0.5, to: 0.6 }, // Scale up and down
                        //     yoyo: true, // Reverse the animation
                        //     repeat: -1, // Infinite loop
                        //     duration: 800, // Duration of one pulse (in ms)
                        //     ease: "Sine.easeInOut", // Smooth easing
                        // });

                        this.knife = this.add.sprite(780, 820, "knife");
                        this.knife.setOrigin(0.5, 0.5);
                        this.knife.setScale(0.5);

                        this.bubbleLeft = this.add.sprite(320, 520, "bubble_left");
                        this.bubbleLeft.setOrigin(0.5, 0.5);
                        this.bubbleLeft.setScale(0.5);
                        this.bubbleLeft.setVisible(false);

                        // Add text with proper configuration
                        this.text = this.add.text(310, 500, "", {
                            fontFamily: "Torsilp-SuChat",
                            fontSize: "32px",
                            align: "center",
                            color: "#000000",
                            wordWrap: { width: 800 },
                            lineSpacing: 20,
                            padding: { x: 10, y: 10 },
                        });
                        this.text.setOrigin(0.5);

                        // Add drop zones
                        this.correctZone = this.add.zone(600, 850, 200, 120);
                        // const correctZoneRect = this.add.rectangle(
                        //   600,
                        //   850,
                        //   200,
                        //   120,
                        //   0x00ff00,
                        //   0.2
                        // );

                        // Make scene interactive
                        // Enable dragging
                        this.isAnimating = true;
                        this.setupForkDragging()
                        this.setupKnifeDragging();

                        // Set loading to false once initial assets are loaded
                        setIsLoading(false);

                        // Start 5-second timer
                        this.timeLeft = 5;
                        this.timerEvent = this.time.addEvent({
                            delay: 1000,
                            callback: () => {
                                this.timeLeft--;
                                if (this.checkPlacement()) {
                                    this.timerEvent?.destroy();
                                    setTimeout(() => {
                                        this.bubbleLeft.setVisible(true);
                                        this.startTypingEffect("เดี๋ยวผม\nไปจ่ายเงินให้");
                                    }, 1000);
                                    setTimeout(() => {
                                        router.push('/scene/11');
                                    }, 4000)
                                }
                                // console.log(`Time left: ${this.timeLeft}`);
                                if (this.timeLeft <= 0) {
                                    this.timerEvent?.destroy();
                                    this.showGameOver();
                                }
                            },
                            repeat: 4,
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

                    private checkPlacement(): boolean {
                        return this.knifePlaced && this.forkPlaced;
                    }

                    private setupKnifeDragging(): void {
                        // Make Knife draggable
                        this.knife.setInteractive({ draggable: true });

                        // Track if currently dragging
                        // let isDragging = false;

                        this.input.on(
                            "dragstart",
                            (
                                pointer: Phaser.Input.Pointer,
                                gameObject: Phaser.GameObjects.GameObject
                            ) => {
                                if (gameObject === this.knife && this.isAnimating) {
                                    // isDragging = true;
                                    // Tilt Knife 45 degrees when starting to drag
                                    this.knife.setRotation(Math.PI / 4); // 45 degrees in radians
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
                                if (gameObject === this.knife && this.isAnimating) {
                                    this.knife.x = dragX;
                                    this.knife.y = dragY;
                                }
                            }
                        );

                        this.input.on(
                            "dragend",
                            (
                                pointer: Phaser.Input.Pointer,
                                gameObject: Phaser.GameObjects.GameObject
                            ) => {
                                if (gameObject === this.knife && this.isAnimating) {
                                    // isDragging = false;
                                    this.isKnifeDragged = true;

                                    // Reset Knife rotation when dropped
                                    if (this.knife.rotation !== 0) {
                                        this.knife.setRotation(0);
                                    }

                                    // Check if Knife is dropped in correct zone
                                    const inCorrectZone = Phaser.Geom.Rectangle.Contains(
                                        this.correctZone.getBounds(),
                                        this.knife.x,
                                        this.knife.y
                                    );

                                    if (inCorrectZone) {
                                        this.handleCorrectKnifePlacement();
                                    }
                                }
                            }
                        );
                    }

                    private handleCorrectKnifePlacement(): void {
                        this.knifePlaced = true;
                        this.knife.disableInteractive();
                    }

                    private setupForkDragging(): void {
                        // Make fork draggable
                        this.fork.setInteractive({ draggable: true });

                        // Track if currently dragging
                        // let isDragging = false;

                        this.input.on(
                            "dragstart",
                            (
                                pointer: Phaser.Input.Pointer,
                                gameObject: Phaser.GameObjects.GameObject
                            ) => {
                                if (gameObject === this.fork && this.isAnimating) {
                                    // isDragging = true;
                                    // Tilt fork 45 degrees when starting to drag
                                    this.fork.setRotation(Math.PI / 4); // 45 degrees in radians
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
                                if (gameObject === this.fork && this.isAnimating) {
                                    this.fork.x = dragX;
                                    this.fork.y = dragY;
                                }
                            }
                        );

                        this.input.on(
                            "dragend",
                            (
                                pointer: Phaser.Input.Pointer,
                                gameObject: Phaser.GameObjects.GameObject
                            ) => {
                                if (gameObject === this.fork && this.isAnimating) {
                                    // isDragging = false;
                                    this.isForkDragged = true;

                                    // Reset fork rotation when dropped
                                    if (this.fork.rotation !== 0) {
                                        this.fork.setRotation(0);
                                    }

                                    // Check if fork is dropped in correct zone
                                    const inCorrectZone = Phaser.Geom.Rectangle.Contains(
                                        this.correctZone.getBounds(),
                                        this.fork.x,
                                        this.fork.y
                                    );

                                    if (inCorrectZone) {
                                        this.handleCorrectForkPlacement();
                                    }
                                }
                            }
                        );
                    }

                    private handleCorrectForkPlacement(): void {
                        this.forkPlaced = true;
                        this.fork.disableInteractive();
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
                                "มารยาทพื้นฐานข้อที่ 110\nกินข้าวเสร็จแล้วต้องรวบช้อนให้เรียบร้อย" +
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
export default dynamic(() => Promise.resolve(Scene10), {
    ssr: false,
});
