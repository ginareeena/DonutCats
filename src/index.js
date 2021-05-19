import Phaser from "phaser";

let cat;
let highScore = 0;
let score = 0;
let health = 5;
let healthPercentage = 1;

class MyGame extends Phaser.Scene {
  constructor() {
    super();
    console.log(this);
    this.gameOver = false;
    this.playedBefore = false;
  }

  preload() {
    //player
    this.load.spritesheet("cat", "./assets/sprites/cat.png", {
      frameWidth: 300,
      height: 300,
    });
    //background
    this.load.image("background", "./assets/backgrounds/grass.png");
    this.load.image("ground", "./assets/backgrounds/ground.png");
    //donuts
    this.load.image("donut", "./assets/donuts/pointDonut.png");
    this.load.image("skyDonut", "./assets/donuts/pointDonut.png");
    this.load.image("fireDonut", "./assets/donuts/fireDonut.png");
    this.load.image("healthDonut", "./assets/donuts/healthDonut.png");
    //start and game over screens
    this.load.image("gameOver", "./assets/gameOver/gameOver.png");
    this.load.image("startScreen", "./assets/startScreen/startScreen.png");
    //health bar
    this.load.image("left-cap", "./assets/healthbar/barL.png");
    this.load.image("middle", "./assets/healthbar/barM.png");
    this.load.image("right-cap", "./assets/healthbar/barR.png");
    this.load.image("left-cap-shadow", "./assets/healthbar/barShadowL.png");
    this.load.image("middle-shadow", "./assets/healthbar/barShadowM.png");
    this.load.image("right-cap-shadow", "./assets/healthbar/barShadowR.png");
  }

  init() {
    this.fullWidth = 200;
  }

  create() {
    this.cameras.main.backgroundColor.setTo(255, 255, 255);

    // CREATES ELEMENTS:

    // Grass
    this.add.image(400, 300, "background");

    // Health Bar Shadow
    let leftShadowCap = this.add
      .image(18, 75, "left-cap-shadow")
      .setOrigin(0, 0.5);
    let middleShadowCap = this.add
      .image(leftShadowCap.x + leftShadowCap.width, 75, "middle-shadow")
      .setOrigin(0, 0.5);
    middleShadowCap.displayWidth = this.fullWidth;

    this.add
      .image(
        middleShadowCap.x + middleShadowCap.displayWidth,
        75,
        "right-cap-shadow"
      )
      .setOrigin(0, 0.5);

    // Health Bar Color
    this.leftCap = this.add.image(18, 75, "left-cap").setOrigin(0, 0.5);

    this.middle = this.add
      .image(this.leftCap.x + this.leftCap.width, 75, "middle")
      .setOrigin(0, 0.5);

    this.rightCap = this.add
      .image(this.middle.x + this.middle.displayWidth, 75, "right-cap")
      .setOrigin(0, 0.5);

    this.setMeterPercentage(1);

    // Player/Cat

    cat = this.physics.add.sprite(400, 300, "cat", 0);

    // Fire Donuts
    let fireDonuts = this.physics.add.group();
    // Health Donuts
    let healthDonuts = this.physics.add.group();
    //Regular Donuts
    let donuts = this.physics.add.group();

    // Sky Donuts
    let skyDonuts = this.physics.add.group();

    //Initial Donut
    let firstDonut = this.physics.add.sprite(100, 255, "donut").setScale(0.3);

    // Ground
    let ground = this.physics.add.staticSprite(400, 525, "ground");
    ground.displayWidth = this.sys.game.config.width;

    this.startScreen = this.add.image(400, 300, "startScreen");

    // Score Text
    this.scoreText = this.add.text(18, 16, "score: 0", {
      fontSize: "32px",
      fill: "#000",
    });
    this.highScoreText = this.add.text(620, 16, "high score: " + highScore, {
      fontSize: "18px",
      fill: "#000",
    });

    this.highScoreText.setVisible(false);
    this.scoreText.setVisible(false);

    if (this.playedBefore === false) {
      this.input.on("pointerdown", () => {
        this.startScreen.visible = false;
        this.highScoreText.setVisible(true);
        this.scoreText.setVisible(true);
        healthPercentage = 1;
        health = 5;
      });
    } else {
      this.startScreen.visible = false;
      this.highScoreText.setVisible(true);
      this.scoreText.setVisible(true);
      healthPercentage = 1;
      health = 5;
    }

    // Cat Settings:

    // hitbox size
    cat.setBodySize(185, 123);
    // hitbox center
    cat.setOffset(45, 125);
    // placement
    cat.setOrigin(0.5, 0.58);
    // can't walk off screen
    cat.setCollideWorldBounds(true);
    cat.setGravityY(-600);
    cat.setImmovable();

    // Cat Animations
    this.anims.create({
      key: "sit",
      repeat: 4,
      frameRate: 2.5,
      frames: this.anims.generateFrameNumbers("cat", {
        start: 0,
        end: 1,
      }),
    });
    this.anims.create({
      key: "sleep",
      repeat: -1,
      frameRate: 2.5,
      frames: this.anims.generateFrameNumbers("cat", {
        start: 2,
        end: 3,
      }),
    });

    this.anims.create({
      key: "leftWalk",
      repeat: -1,
      frameRate: 2.5,
      frames: this.anims.generateFrameNumbers("cat", {
        start: 4,
        end: 5,
      }),
    });

    this.anims.create({
      key: "rightWalk",
      repeat: -1,
      frameRate: 2.5,
      frames: this.anims.generateFrameNumbers("cat", {
        start: 6,
        end: 7,
      }),
    });

    //keyboard input listeners:

    this.cursors = this.input.keyboard.createCursorKeys();

    this.asleep = true;
    this.clickNum = 0;

    // initial animation cycle
    // game begins with cat asleep
    cat.on("animationcomplete", () => {
      cat.anims.play("sleep");
      this.asleep = true;
      this.clickNum = 0;
    });

    cat.play("sleep");
    cat.setInteractive();
    this.input.on("gameobjectdown", this.wakeUp, this);

    // creates more donuts

    donuts.children.iterate(function (child) {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    function collectDonut(cat, donut) {
      donut.disableBody(true, true);
      if (health > 3) {
        cat.clearTint();
      }
      score += 5;
      this.scoreText.setText("Score: " + score);

      if (donuts.countActive(true) === 0 && !this.gameOver) {
        let b =
          cat.x < 400
            ? Phaser.Math.Between(400, 800)
            : Phaser.Math.Between(0, 400);

        let a =
          cat.x < 400
            ? Phaser.Math.Between(400, 800)
            : Phaser.Math.Between(0, 400);

        let c =
          cat.x < 400
            ? Phaser.Math.Between(400, 800)
            : Phaser.Math.Between(0, 400);

        let fireDonut = fireDonuts.create(a, 2, "fireDonut").setScale(0.3);
        let skyDonut = skyDonuts.create(b, 3, "skyDonut").setScale(0.3);
        let healthDonut = healthDonuts
          .create(c, 1, "healthDonut")
          .setScale(0.3);

        fireDonut.setBounce(1);
        skyDonut.setBounce(1);
        healthDonut.setBounce(1);
        skyDonut.setCollideWorldBounds(true);
        fireDonut.setCollideWorldBounds(true);
        healthDonut.setCollideWorldBounds(true);
        fireDonut.setVelocity(Phaser.Math.Between(-200, 200, 20));
        skyDonut.setVelocity(Phaser.Math.Between(-200, 200, 20));
        healthDonut.setVelocity(Phaser.Math.Between(-200, 200, 20));
      }
    }

    // Gameover
    let gameOverPic = this.add.image(400, 300, "gameOver");
    gameOverPic.visible = false;

    function addHealth(cat, healthDonut) {
      healthDonut.disableBody(true, true);
      cat.clearTint();
      if (health < 5) {
        health += 1;
        healthPercentage += 0.2;
        console.log("addedHealth!");
        console.log("health is now:", health);
        console.log("healthpercentage is now:", healthPercentage);

        this.setMeterPercentage(healthPercentage);
      } else {
        score += 2;
      }
    }

    function donutBurn(cat, fireDonut) {
      console.log("donut burn!");
      cat.setTint(0xff0000);
      if (health <= 3) {
        fireDonut.disableBody(true, true);
        cat.setTint(0xff0000);
      }

      health -= 1;
      healthPercentage -= 0.2;
      console.log("health:", health);
      console.log("healthPercentage:", healthPercentage);

      this.setMeterPercentage(healthPercentage);

      if (health <= 0) {
        cat.setTint(0xff0000);
        healthPercentage = 0;
        health = 0;

        this.setMeterPercentage(0);
        this.setMeterPercentageAnimated(0);
        this.physics.pause();
        cat.anims.stop();
        this.gameOver = true;

        highScore = highScore > score ? highScore : score;
        score = 0;
        this.highScoreText.setText("high score: " + highScore);

        gameOverPic.visible = true;
        this.playedBefore = true;
        this.input.on("pointerdown", () => {
          this.scene.start(this);
        });
      } else if (health >= 1) {
        this.setMeterPercentage(healthPercentage);
      }
    }

    // Adds collision to the ground:

    this.physics.add.collider(donuts, ground);
    // adding first donut
    this.physics.add.collider(firstDonut, ground);

    //Adds collision behavior between cat and assets
    this.physics.add.overlap(cat, firstDonut, collectDonut, null, this);
    this.physics.add.overlap(cat, donuts, collectDonut, null, this);
    this.physics.add.overlap(cat, skyDonuts, collectDonut, null, this);
    this.physics.add.collider(cat, healthDonuts, addHealth, null, this);

    this.physics.add.collider(cat, fireDonuts, donutBurn, null, this);

    if (!gameOverPic.visible) {
      this.gameOver = false;
    }

    this.setMeterPercentage(1);
  }

  //hit bar animations
  makeBar(x, y, color) {
    //draw the bar
    let bar = this.add.graphics();

    //color the bar
    bar.fillStyle(color, 1);

    //fill the bar with a rectangle
    bar.fillRect(0, 0, 200, 50);

    //position the bar
    bar.x = x;
    bar.y = y;

    //return the bar
    return bar;
  }
  setValue(bar, percentage) {
    //scale the bar
    bar.scaleX = percentage / 100;
  }

  setMeterPercentage(percent = 1) {
    const width = this.fullWidth * percent;

    this.middle.displayWidth = width;
    this.rightCap.x = this.middle.x + this.middle.displayWidth;
  }

  setMeterPercentageAnimated(percent = 1, duration = 1000) {
    const width = this.fullWidth * percent;

    this.tweens.add({
      targets: this.middle,
      displayWidth: width,
      duration,
      ease: Phaser.Math.Easing.Sine.Out,
      onUpdate: () => {
        this.rightCap.x = this.middle.x + this.middle.displayWidth;
        this.leftCap.visible = this.middle.displayWidth > 0;
        this.middle.visible = this.middle.displayWidth > 0;
        this.rightCap.visible = this.middle.displayWidth > 0;
      },
    });
  }

  update() {
    if (!this.asleep && !this.gameOver) {
      if (this.cursors.left.isDown) {
        cat.x -= 5;
        cat.anims.play("leftWalk", true);
      } else if (this.cursors.right.isDown) {
        cat.anims.play("rightWalk", true);
        cat.x += 5;
      } else if (this.cursors.up.isDown) {
        cat.y -= 5;
      } else if (this.cursors.down.isDown) {
        cat.y += 5;
      } else {
      }
    }
  }

  wakeUp(pointer, cat) {
    if (this.clickNum === 3) {
      cat.anims.play("leftWalk");
    }
    if (!this.asleep) {
      this.clickNum += 1;
    }
    if (this.asleep) {
      cat.anims.play("sit");
      this.asleep = false;
    }
  }
}

let game = new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "phaser-game",
  scene: [MyGame],
  physics: { default: "arcade", arcade: { gravity: { y: 600 }, debug: false } },
  parent: "canvas-container",
});

game.play;
