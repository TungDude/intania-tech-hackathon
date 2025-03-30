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
                    private background!: Phaser.GameObjects.Sprite;
                    private lose!: Phaser.GameObjects.Sprite;
                    private bubble!: Phaser.GameObjects.Sprite;
                    private text!: Phaser.GameObjects.Text;
                    private cloth!: Phaser.GameObjects.Sprite;
                    private hang!: Phaser.GameObjects.Sprite;
                    private clothSpread!: Phaser.GameObjects.Sprite;
                    private isClothDragged: boolean = false;
                    private correctZone!: Phaser.GameObjects.Zone;
                    private clothPlaced: boolean = false;
                    private gameOverOverlay!: Phaser.GameObjects.Rectangle;
                    private gameOverText!: Phaser.GameObjects.Text;
                    private currentText: string = "";
                    private typingTimer?: Phaser.Time.TimerEvent;
                    private isTyping: boolean = false;
                    private isAnimating: boolean = false;
                    private timerEvent?: Phaser.Time.TimerEvent;
                    private timeLeft: number = 5; // Add this property to track time

                    constructor() {
                        super({ key: "TableScene" });
                    }

                    preload(): void {
                        // Load font
                        this.load.css("Torsilp", "./Torsilp-SuChat.ttf");

                        // Load all boss images and table
                        this.load.image("bg", "/images/3_table_water_empty.PNG");
                        this.load.image("lose", "/images/3_lose.PNG");
                        this.load.image("hang", "/images/3_hang.PNG");
                        this.load.image("cloth", "/images/IMG_5214.PNG");
                        this.load.image("cloth_spread", "/images/IMG_5215.PNG");
                        this.load.image("table", "/images/2_table_only.png");
                        this.load.image("hang", "/images/3_hang.png");
                        this.load.image("bubble", "/images/ele_bubble_top.png");
                    }

                    create(): void {

                        this.background = this.add.sprite(600, 600, "bg");
                        this.background.setOrigin(0.5, 0.5);
                        this.background.setScale(0.4);

                        this.lose = this.add.sprite(600, 600, "lose");
                        this.lose.setOrigin(0.5, 0.5);
                        this.lose.setScale(0.4);
                        this.lose.setVisible(false);

                        this.hang = this.add.sprite(600, 600, "hang");
                        this.hang.setOrigin(0.5, 0.5);
                        this.hang.setScale(0.4);
                        this.hang.setVisible(false);

                        this.cloth = this.add.sprite(580, 780, "cloth");
                        this.cloth.setOrigin(0.5, 0.5);
                        this.cloth.setScale(0.4);

                        this.clothSpread = this.add.sprite(580, 980, "cloth_spread");
                        this.clothSpread.setOrigin(0.5, 0.5);
                        this.clothSpread.setScale(0.2);
                        this.clothSpread.setVisible(false);

                        // Add speech bubble
                        this.bubble = this.add.sprite(600, 250, "bubble");
                        this.bubble.setScale(0.5);

                        this.correctZone = this.add.zone(580, 990, 400, 200);

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

                        this.isAnimating = true;
                        this.setupClothDragging();

                        this.startTypingEffect("ผมเรียกพนักงานให้เรียบร้อยแล้วนะครับ");
                        setTimeout(() => {
                            this.startTypingEffect("เชฟร้านนี้ทำเร็วและอร่อยมากนะ");
                        }, 5000)

                        // Mark as loaded
                        setIsLoading(false);

                        // Start 5-second timer
                        this.timeLeft = 1;
                        this.timerEvent = this.time.addEvent({
                            delay: 10000,
                            callback: () => {
                                this.bubble.setVisible(false);
                                this.text.setVisible(false);

                                if (this.clothPlaced) {
                                    window.location.href = "/scene/4";
                                    return;
                                }

                                this.lose.setVisible(true);
                                this.background.setVisible(false);
                                // this.background.setVisible(false);
                                if (this.isAnimating) {
                                    this.background.setTexture("hang");
                                    this.background.setVisible(true);

                                    this.tweens.add({
                                        targets: this.background,
                                        alpha: { from: 0, to: 1 },
                                        yoyo: false,
                                        repeat: 0,
                                        ease: "Sine.easeInOut",
                                    })
                                    // Make all objects move up infinitely before game over
                                    this.animateObjectsUp(() => {
                                        this.showGameOver("มารยาทพื้นฐานข้อที่ 11\nควรเอาผ้าคลุมตักก่อนรับประทานอาหาร");
                                    });
                                  }
                            },
                            repeat: 0,
                        });
                    }

                    private animateObjectsUp(callback: () => void): void {
                        console.log("Animating all objects moving up...");
            
                        // Array of all objects to animate
                        const objectsToAnimate = [
                          this.lose,
                          this.clothSpread,
                          this.cloth,
                        ];
            
                        // Initial small shake
                        this.tweens.add({
                          targets: objectsToAnimate,
                          y: "-=10",
                          duration: 100,
                          yoyo: true,
                          repeat: 1,
                          ease: "Sine.easeInOut",
                          onComplete: () => {
                            // After shake, move objects up rapidly
                            this.tweens.add({
                              targets: objectsToAnimate,
                              y: "+=2000",
                              duration: 1500,
                              ease: "Cubic.easeIn",
                              onComplete: () => {
                                callback();
                              },
                            });
                          },
                        });
                      }

                    private setupClothDragging(): void {
                        // Make cloth draggable
                        this.cloth.setInteractive({ draggable: true });

                        // Track if currently dragging
                        // let isDragging = false;

                        this.input.on(
                            "dragstart",
                            (
                                pointer: Phaser.Input.Pointer,
                                gameObject: Phaser.GameObjects.GameObject
                            ) => {
                                if (gameObject === this.cloth && this.isAnimating) {
                                    // isDragging = true;
                                    // Tilt cloth 45 degrees when starting to drag
                                    // this.cloth.setRotation(Math.PI / 4); // 45 degrees in radians
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
                                if (gameObject === this.cloth && this.isAnimating) {
                                    this.cloth.x = dragX;
                                    this.cloth.y = dragY;
                                }
                            }
                        );

                        this.input.on(
                            "dragend",
                            (
                                pointer: Phaser.Input.Pointer,
                                gameObject: Phaser.GameObjects.GameObject
                            ) => {
                                if (gameObject === this.cloth && this.isAnimating) {
                                    // isDragging = false;
                                    this.isClothDragged = true;

                                    // Reset cloth rotation when dropped
                                    if (this.cloth.rotation !== 0) {
                                        this.cloth.setRotation(0);
                                    }

                                    // Check if cloth is dropped in correct zone
                                    const inCorrectZone = Phaser.Geom.Rectangle.Contains(
                                        this.correctZone.getBounds(),
                                        this.cloth.x,
                                        this.cloth.y
                                    );

                                    if (inCorrectZone) {
                                        this.handleCorrectClothPlacement();
                                    }
                                }
                            }
                        );
                    }

                    private handleCorrectClothPlacement(): void {
                        this.clothPlaced = true;
                        this.cloth.disableInteractive();
                        this.cloth.setVisible(false);
                        this.clothSpread.setVisible(true);
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
