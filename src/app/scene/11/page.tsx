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

const Scene11 = () => {
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
          private thanksButton!: Phaser.GameObjects.Rectangle;
          private thanksButtonText!: Phaser.GameObjects.Text;
          private gameOverOverlay!: Phaser.GameObjects.Rectangle;
          private gameOverText!: Phaser.GameObjects.Text;
          private currentText: string = "";
          private typingTimer?: Phaser.Time.TimerEvent;
          private isTyping: boolean = false;
          private isAnimating: boolean = false;
          private textInput!: HTMLInputElement;
          private thanksButtons: {
            button: Phaser.GameObjects.Rectangle;
            text: Phaser.GameObjects.Text;
            lang: string;
            message: string;
          }[] = [];

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
            // Start with the table and boss in their "seated" position
            this.boss = this.add.sprite(600, 600, "boss");
            this.boss.setScale(0.37);

            this.table = this.add.sprite(600, 600, "table");
            this.table.setScale(0.5);

            // Add speech bubble
            this.bubble = this.add.sprite(600, 250, "bubble");
            this.bubble.setScale(0.5);

            // Add text
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

            // Create thanks button
            this.thanksButton = this.add.rectangle(600, 900, 220, 70, 0x4caf50);
            this.thanksButton.setStrokeStyle(3, 0x2e7d32);
            this.thanksButton.setVisible(true);

            this.thanksButtonText = this.add.text(600, 900, "ขอบคุณ", {
              fontFamily: "Torsilp-SuChat",
              fontSize: "36px",
              color: "#FFFFFF",
              align: "center",
              padding: { x: 5, y: 5 },
            });
            this.thanksButtonText.setOrigin(0.5);
            this.thanksButtonText.setVisible(true);

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

            // Make button interactive
            this.thanksButton.setInteractive();
            this.thanksButton.on(
              "pointerdown",
              this.handleThanksButtonClick,
              this
            );

            // Start typing effect
            this.startTypingEffect("ผมจ่ายเงินให้เรียบร้อยแล้ว ไปกันเถอะ");

            // Start the getting up animation after a short delay
            this.time.delayedCall(2500, this.animateGettingUp, [], this);

            // Create multiple thanks buttons
            const thanksData = [
              {
                text: "Thank you",
                lang: "English",
                message: "No manners!\nYou should say thank you in Thai!",
              },
              {
                text: "Merci",
                lang: "French",
                message: "Pas de manières!\nVous devez dire merci en thaï!",
              },
              {
                text: "Gracias",
                lang: "Spanish",
                message: "¡Sin modales!\n¡Debes decir gracias en tailandés!",
              },
              {
                text: "Danke",
                lang: "German",
                message: "Keine Manieren!\nSie müssen sich auf Thai bedanken!",
              },
              {
                text: "Arigato",
                lang: "Japanese",
                message:
                  "マナーがない!\nタイ語で「ありがとう」と言わなければなりません!",
              },
            ];

            // Create and position the buttons
            thanksData.forEach((data, index) => {
              const x = 200 + index * 200;
              const button = this.add.rectangle(x, 800, 180, 60, 0x4caf50);
              button.setStrokeStyle(3, 0x2e7d32);
              button.setInteractive();

              const text = this.add.text(x, 800, data.text, {
                fontFamily: "Arial",
                fontSize: "24px",
                color: "#FFFFFF",
                align: "center",
              });
              text.setOrigin(0.5);

              button.on("pointerdown", () => {
                this.handleWrongLanguageClick(data.message);
              });

              this.thanksButtons.push({
                button,
                text,
                lang: data.lang,
                message: data.message,
              });
            });

            // Create text input box
            const inputElement = document.createElement("input");
            inputElement.type = "text";
            inputElement.style.position = "absolute";
            inputElement.style.right = "20px";
            inputElement.style.bottom = "20px";
            inputElement.style.width = "200px";
            inputElement.style.padding = "10px";
            inputElement.style.fontSize = "16px";
            inputElement.placeholder = "Type ขอบคุณ here...";

            // Add input to the game container
            const gameContainer = document.getElementById("game-container");
            if (gameContainer) {
              gameContainer.appendChild(inputElement);
              this.textInput = inputElement;
            }

            // Add keypress event listener
            inputElement.addEventListener("keypress", (e) => {
              if (e.key === "Enter") {
                if (this.textInput.value === "ขอบคุณ") {
                  if (this.isAnimating) {
                    // Success only if typed during animation
                    console.log(
                      "Correct thank you typed during animation! Redirecting to scene 12..."
                    );
                    this.time.delayedCall(1000, () => {
                      // Clean up input element before redirecting
                      this.textInput.remove();
                      window.location.href = "/scene/12";
                    });
                  } else {
                    // Too late - animation already complete
                    this.showGameOver(
                      "ช้าเกินไป!\nต้องพิมพ์ 'ขอบคุณ' ระหว่างที่ลุกจากโต๊ะ"
                    );
                  }
                } else {
                  this.showGameOver("ผิด!\nต้องพิมพ์ 'ขอบคุณ' เท่านั้น");
                }
              }
            });

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
                  this.boss.setTexture("boss");
                }
              },
              callbackScope: this,
              repeat: text.length - 1,
            });
          }

          private animateGettingUp(): void {
            // Set animating flag
            this.isAnimating = true;
            console.log("Starting getting up animation...");
            this.boss.setTexture("boss_normal");

            // Animate table scale change (reverse of sitting down)
            this.tweens.add({
              targets: this.table,
              scaleX: 0.7,
              scaleY: 0.7,
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
                      this.thanksButton.disableInteractive();
                      this.thanksButton.setVisible(false);
                      this.thanksButtonText.setVisible(false);
                      this.showGameOver("ช้าเกินไป!\nลืมกล่าวขอบคุณ!");
                      timer.destroy();
                    }
                  },
                  repeat: 4,
                });
              },
            });

            // Animate boss getting up (reverse of sitting down)
            this.tweens.add({
              targets: this.boss,
              scaleX: 0.25,
              scaleY: 0.25,
              y: 530,
              duration: 4000,
              ease: "Power2",
            });
          }

          private handleThanksButtonClick(): void {
            // Remove button interactivity
            this.thanksButton.disableInteractive();

            // Hide thanks button
            this.thanksButton.setVisible(false);
            this.thanksButtonText.setVisible(false);

            // Always show game over when button is clicked
            console.log("Button clicked! Game over...");
            this.boss.setTexture("boss_wha");
            this.animateObjectsUp(() => {
              this.showGameOver(
                "มารยาทพื้นฐานข้อที่ 43\nห้ามคลิกปุ่ม! ควรพิมพ์ 'ขอบคุณ' ในช่องข้อความเท่านั้น"
              );
            });
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

          private handleWrongLanguageClick(message: string): void {
            if (!this.isAnimating) {
              this.showGameOver(message);
            } else {
              this.handleEarlyThanks();
            }
          }

          private handleEarlyThanks(): void {
            console.log("Thanks given during animation! Game over...");
            this.boss.setTexture("boss_wha");
            this.animateObjectsUp(() => {
              this.showGameOver(
                "มารยาทพื้นฐานข้อที่ 43\nต้องรอให้ลุกจากโต๊ะเรียบร้อยก่อนกล่าวขอบคุณ!"
              );
            });
          }

          private showGameOver(message: string = "GAME OVER"): void {
            incrementDeathCount();
            console.log("Showing game over screen with message:", message);

            // Show game over screen
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

            // Update game over text with custom message
            this.gameOverText.setText(message);
            this.gameOverText.setFontSize(
              message.length > 20 ? "56px" : "80px"
            );
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

            // Remove input element when showing game over
            if (this.textInput) {
              this.textInput.remove();
            }

            // Disable all thanks buttons
            this.thanksButtons.forEach(({ button, text }) => {
              button.disableInteractive();
              button.setVisible(false);
              text.setVisible(false);
            });
          }

          // Add cleanup in scene shutdown
          shutdown(): void {
            if (this.textInput) {
              this.textInput.remove();
            }
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

export default dynamic(() => Promise.resolve(Scene11), {
  ssr: false,
});
