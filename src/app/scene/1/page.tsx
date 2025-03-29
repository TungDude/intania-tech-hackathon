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

// Singleton to track game instance and global state
let gameInstance: any = null;
let hasInitialized = false;
let hasChoiceMade = false;

const Scene1 = () => {
  const gameRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add font-face style to document
    const style = document.createElement("style");
    style.textContent = fontFaceStyle;
    document.head.appendChild(style);

    const initGame = async () => {
      // Prevent multiple initializations globally, not just within this component instance
      if (typeof window === "undefined" || gameInstance || hasInitialized)
        return;

      hasInitialized = true; // Mark as initialized globally

      try {
        setIsLoading(true);
        const Phaser = await import("phaser");

        class DialogScene extends Phaser.Scene {
          private boss!: Phaser.GameObjects.Sprite;
          private bubble!: Phaser.GameObjects.Sprite;
          private text!: Phaser.GameObjects.Text;
          private choiceBox1!: Phaser.GameObjects.Rectangle;
          private choiceBox2!: Phaser.GameObjects.Rectangle;
          private choiceText1!: Phaser.GameObjects.Text;
          private choiceText2!: Phaser.GameObjects.Text;
          private gameOverOverlay!: Phaser.GameObjects.Rectangle;
          private gameOverText!: Phaser.GameObjects.Text;
          private texts: string[] = [
            "วันนี้คุณทำได้ดีมาก เดี๋ยวเราไปกินข้าวกันเถอะ ผมเลี้ยงเอง",
            "กินอะไรดีละ ซูชิเรอะ หรือ ชาบู มิมิ",
          ];
          private currentTextIndex: number = 0;
          private currentText: string = "";
          private typingTimer?: Phaser.Time.TimerEvent;
          private choiceTimer?: Phaser.Time.TimerEvent;
          private isShowingChoices: boolean = false;
          private isTyping: boolean = false;

          constructor() {
            super({ key: "DialogScene" });
          }

          preload(): void {
            // Load font
            this.load.css("Torsilp", "./Torsilp-SuChat.ttf");

            this.load.image("boss", "/images/1_boss_happy.png");
            this.load.image("boss_unhappy", "/images/2_boss_unhappy.png");
            this.load.image("boss_happier", "/images/2_boss.png");
            this.load.image("bubble", "/images/ele_bubble_top.png");
          }

          create(): void {
            // Create and position the boss sprite
            this.boss = this.add.sprite(0, 0, "boss");
            this.boss.setScale(0.5);
            this.boss.setPosition(600, 700);

            // Create and position the speech bubble
            this.bubble = this.add.sprite(0, 0, "bubble");
            this.bubble.setScale(0.6);
            this.bubble.setPosition(600, 350);

            // Add text with proper configuration
            this.text = this.add.text(600, 330, "", {
              fontFamily: "Torsilp-SuChat",
              fontSize: "36px",
              color: "#000000",
              align: "center",
              wordWrap: { width: 1000 },
              lineSpacing: 20,
              padding: { x: 15, y: 15 },
            });
            this.text.setOrigin(0.5);

            // Create choice boxes (initially hidden)
            this.choiceBox1 = this.add.rectangle(400, 500, 220, 70, 0xffffff);
            this.choiceBox2 = this.add.rectangle(800, 500, 220, 70, 0xffffff);
            this.choiceBox1.setStrokeStyle(2, 0x000000);
            this.choiceBox2.setStrokeStyle(2, 0x000000);
            this.choiceBox1.setVisible(false);
            this.choiceBox2.setVisible(false);

            // Create choice texts (initially hidden)
            this.choiceText1 = this.add
              .text(400, 500, "ซูชิ", {
                fontFamily: "Torsilp-SuChat",
                fontSize: "32px",
                color: "#000000",
                padding: { x: 10, y: 10 },
              })
              .setOrigin(0.5);

            this.choiceText2 = this.add
              .text(800, 500, "ชาบู", {
                fontFamily: "Torsilp-SuChat",
                fontSize: "32px",
                color: "#000000",
                padding: { x: 10, y: 10 },
              })
              .setOrigin(0.5);

            this.choiceText1.setVisible(false);
            this.choiceText2.setVisible(false);

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
              color: "#ffffff",
              align: "center",
              lineSpacing: 30,
              padding: { x: 20, y: 20 },
            });
            this.gameOverText.setOrigin(0.5);
            this.gameOverText.setVisible(false);

            // Add interactivity to choice boxes
            this.choiceBox1.setInteractive();
            this.choiceBox2.setInteractive();

            this.choiceBox1.on("pointerdown", () => {
              if (this.isShowingChoices && !hasChoiceMade) {
                hasChoiceMade = true; // Set global choice flag
                this.handleChoice("ซูชิ");
              }
            });

            this.choiceBox2.on("pointerdown", () => {
              if (this.isShowingChoices && !hasChoiceMade) {
                hasChoiceMade = true; // Set global choice flag
                this.handleChoice("ชาบู");
              }
            });

            // Make the entire scene clickable to advance text
            this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
              // Ignore clicks on choice boxes
              if (this.isShowingChoices) {
                const clickedChoice1 = this.choiceBox1
                  .getBounds()
                  .contains(pointer.x, pointer.y);
                const clickedChoice2 = this.choiceBox2
                  .getBounds()
                  .contains(pointer.x, pointer.y);
                if (!clickedChoice1 && !clickedChoice2) {
                  return;
                }
              }

              if (this.isTyping) {
                // If still typing, complete the current text immediately
                if (this.typingTimer) {
                  this.typingTimer.destroy();
                }
                this.isTyping = false;
                this.currentText = this.texts[this.currentTextIndex];
                this.text.setText(this.currentText);
                this.handleTextComplete();
              } else if (!this.isShowingChoices) {
                // If not typing and not showing choices, advance to next text
                this.advanceText();
              }
            });

            // Start animations
            this.startBounceAnimation();
            this.startTypingEffect();

            // Mark as loaded
            setIsLoading(false);
          }

          private startBounceAnimation(): void {
            this.tweens.add({
              targets: this.boss,
              y: this.boss.y - 20,
              duration: 500,
              yoyo: true,
              repeat: -1,
              ease: "Sine.easeInOut",
            });
          }

          private startTypingEffect(): void {
            let charIndex = 0;
            this.currentText = "";
            this.text.setText("");
            this.isTyping = true;

            if (this.typingTimer) {
              this.typingTimer.destroy();
            }

            const currentFullText = this.texts[this.currentTextIndex];

            this.typingTimer = this.time.addEvent({
              delay: 100,
              callback: () => {
                if (charIndex < currentFullText.length) {
                  this.currentText += currentFullText.charAt(charIndex);
                  this.text.setText(this.currentText);
                  charIndex++;
                } else {
                  if (this.typingTimer) {
                    this.typingTimer.destroy();
                  }
                  this.isTyping = false;
                  this.handleTextComplete();
                }
              },
              callbackScope: this,
              repeat: currentFullText.length - 1,
            });
          }

          private handleTextComplete(): void {
            console.log("Text complete, current index:", this.currentTextIndex);
            // Text is complete, wait for user click to advance
            // No automatic advancement - will advance on click
          }

          private advanceText(): void {
            if (this.currentTextIndex < this.texts.length - 1) {
              this.currentTextIndex++;
              console.log(
                "Moving to next text, new index:",
                this.currentTextIndex
              );
              this.startTypingEffect();
            } else {
              console.log("All texts complete, showing choices");
              this.showChoices();
            }
          }

          private showChoices(): void {
            // Don't show choices again if already made a choice
            if (hasChoiceMade) {
              console.log("Choice already made, not showing choices again");
              return;
            }

            this.isShowingChoices = true;
            console.log("Showing choices, hasChoiceMade:", hasChoiceMade);
            this.choiceBox1.setVisible(true);
            this.choiceBox2.setVisible(true);
            this.choiceText1.setVisible(true);
            this.choiceText2.setVisible(true);

            // Start a timer - if player doesn't choose within 5 seconds, proceed automatically
            if (this.choiceTimer) {
              this.choiceTimer.remove();
            }

            this.choiceTimer = this.time.delayedCall(5000, () => {
              console.log("Timer elapsed, hasChoiceMade:", hasChoiceMade);
              if (this.isShowingChoices && !hasChoiceMade) {
                this.autoChoose();
              } else {
                console.log(
                  "Skipping autoChoose because choice was made or choices not showing"
                );
              }
            });
          }

          private autoChoose(): void {
            if (hasChoiceMade) {
              console.log("Choice already made, not auto-choosing");
              return;
            }

            hasChoiceMade = true;
            this.isShowingChoices = false;
            this.choiceBox1.setVisible(false);
            this.choiceBox2.setVisible(false);
            this.choiceText1.setVisible(false);
            this.choiceText2.setVisible(false);

            // Switch to happier boss image
            this.boss.setTexture("boss_happier");
            this.boss.setScale(0.38);
            this.boss.setPosition(600, 700);

            // Change text to chef table message
            this.currentText =
              "งั้นไปกิน Chef Table ของเชฟกอร์ดัม แรมมูซีนดีกว่า";
            this.text.setText(this.currentText);

            // Stop any animations
            this.tweens.killTweensOf(this.boss);

            // Wait a bit and then redirect to scene 2
            this.time.delayedCall(4000, () => {
              window.location.href = "/scene/2";
            });
          }

          private showGameOver(text: string = "GAME OVER"): void {
            this.gameOverOverlay.setVisible(true);
            this.gameOverText.setText(text);
            this.gameOverText.setVisible(true);

            // Make the game over screen clickable to return home
            this.gameOverOverlay.setInteractive();
            this.gameOverOverlay.once("pointerdown", () => {
              window.location.href = "/";
            });
            // Automatically go home after 4 seconds
            this.time.delayedCall(4000, () => {
              window.location.href = "/";
            });
          }

          private handleChoice(choice: string): void {
            console.log("Choice made:", choice);

            // Cancel the auto-choice timer if it exists
            if (this.choiceTimer) {
              this.choiceTimer.remove();
              this.choiceTimer = undefined;
            }

            console.log("handleChoice called, hasChoiceMade:", hasChoiceMade);
            this.isShowingChoices = false;
            this.choiceBox1.setVisible(false);
            this.choiceBox2.setVisible(false);
            this.choiceText1.setVisible(false);
            this.choiceText2.setVisible(false);

            // Switch to unhappy boss image
            this.boss.setTexture("boss_unhappy");
            this.boss.setPosition(600, 620);

            // Change text to final message
            this.currentText = "แต่ผมไม่ชอบอาหารญี่ปุ่นเท่าไร";
            this.text.setText(this.currentText);

            // Stop any animations
            this.tweens.killTweensOf(this.boss);

            // Wait a bit and then show game over with custom text
            this.time.delayedCall(3000, () => {
              this.showGameOver(
                "มารยาทพื้นฐานข้อที่ 31\nควรให้เกียรติผู้ใหญ่ในการตัดสินใจ!"
              );
            });
          }
        }

        const config: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          width: 1200,
          height: 1000,
          parent: "game-container",
          backgroundColor: "#ffffff",
          scene: DialogScene,
          dom: {
            createContainer: true,
          },
        };

        // Clean up any existing game instance
        if (gameInstance) {
          gameInstance.destroy(true);
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
export default dynamic(() => Promise.resolve(Scene1), {
  ssr: false,
});
