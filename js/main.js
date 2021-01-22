let bgColor
let saveScore = 0
let gameOptions = {
    holeWidthRange: [50, 250],
    wallRange: [10, 50],
    growTime: 1500
}
const IDLE = 0
const WAITING = 1
const GROWING = 2
let holeWidth
let wallWidth

let GameState = {}
let game


setUpCanvas()
gameInitialization()

function setUpCanvas(){
    GameState = {
        init: function() {
            scaleManager()
        },
        preload: function () {
            loadAssets()
        },
        create: function () {
            Create()
        }
    }
    game = new Phaser.Game(640, 960, Phaser.CANVAS)
}

function gameInitialization() {
    game.state.add('GameState', GameState)
    game.state.start('GameState')
}

function scaleManager() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
    game.scale.pageAlignHorizontally = true
    game.scale.pageAlignVertically = true
}

function loadAssets() {
    game.load.image("base", "assets/images/base.png")
    game.load.image("square", "assets/images/square.png")
    game.load.image("LockSquare", "assets/images/LockSquare.png")
    game.load.image("moonbg", "assets/images/moonbg.png")
    game.load.image("deadlightbg", "assets/images/deadlightbg.png")
    game.load.image("top", "assets/images/top.png")
    game.load.image("gameover", "assets/images/gameover.png")
    game.load.bitmapFont("font", "assets/images/font.png", "assets/font/font.fnt")
}

function generateGradientBackground() {
    game.stage.backgroundColor = '#FFF'
    let myBitmap = game.add.bitmapData(game.width, game.height)
    bgColor = myBitmap.context.createLinearGradient(0, 0, 0, 500)
    addGradientColors()
    myBitmap.context.fillStyle = bgColor
    myBitmap.context.fillRect(0, 0, game.width, game.height)

    let bitmapSprite = game.add.sprite(0, 0, myBitmap)
    bitmapSprite.alpha = 0
    game.add.tween(bitmapSprite).to({ alpha: 1 }, 1000).start()
}

function addGradientColors() {
    let colorArr = [
        { top: '#FF0099', bottom: '#493240' }, //0
        { top: '#7F00FF', bottom: '#E100FF' },//1
        { top: '#d9a7c7', bottom: '#fffcdc' }//2/ 4
    ]
    let index = colorArr[Phaser.Math.between(0, colorArr.length - 1)]
    this.color1 = index.top
    this.color2 = index.bottom
    bgColor.addColorStop(0, this.color1)
    bgColor.addColorStop(1, this.color2)
}

function addLeftWall(base, top) {
    this.leftSquare = game.add.sprite(0, game.height, base)
    this.leftSquare.anchor.setTo(1, 1)
    this.leftWall = game.add.sprite(0, game.height - this.leftSquare.height, top)
    this.leftWall.anchor.setTo(1, 1)
}

function addRightWall(base, top) {
    this.rightSquare = game.add.sprite(game.width, game.height, base)
    this.rightSquare.anchor.setTo(0, 1)
    this.rightWall = game.add.sprite(game.width, game.height - this.rightSquare.height, top)
    this.rightWall.anchor.setTo(0, 1)
}

function addSquare(square, size) {
    this.square = game.add.sprite(game.width / 2, -400, square)
    this.square.scale.setTo(size)
    this.square.anchor.setTo(0.5)
}

function updateLevel() {
    holeWidth = Phaser.Math.between(gameOptions.holeWidthRange[0], gameOptions.holeWidthRange[1])
    wallWidth = Phaser.Math.between(gameOptions.wallRange[0], gameOptions.wallRange[1])

    placeWall(this.leftSquare, (game.width - holeWidth) / 2)
    placeWall(this.rightSquare, (game.width + holeWidth) / 2)
    placeWall(this.leftWall, (game.width - holeWidth) / 2 - wallWidth)
    placeWall(this.rightWall, (game.width + holeWidth) / 2 + wallWidth)

    if (this.square) {
        let squareTween = game.add.tween(this.square).to({ y: 150, angle: 50 }, 500, Phaser.Easing.Cubic.Out, true)
        squareTween.onComplete.add(() => {
            game.add.tween(square).to({ angle: 40 }, 500, true)
            gameMode = WAITING
        })
    }
}

function placeWall(target, posX) {
    if (target)
        game.add.tween(target).to({ x: posX }, 500, Phaser.Easing.Cubic.Out, true)
}

function grow() {
    if (this.gameMode == WAITING) {
        this.gameMode = GROWING
        this.infoGroup.visible= false
        this.growTween = game.add.tween(this.square.scale).to({ x: 1, y: 1 }, gameOptions.growTime, Phaser.Easing.Cubic.Out, true)
    }
}

function stop() {
    if (this.gameMode == GROWING) {
        this.gameMode = IDLE
        this.growTween.stop()

        let newRotateTween = game.add.tween(this.square).to({ angle: 0 }, 300, Phaser.Easing.Cubic.Out, true)
        newRotateTween.onComplete.add(() => {
            if (this.square.width <= this.rightSquare.x - this.leftSquare.x) {
                this.gameoverTween = game.add.tween(this.square).to({ y: game.height + this.square.width }, 600, Phaser.Easing.Cubic.In, true)
                gameoverTween.onComplete.add(function () {
                    gameOver()
                    saveScore = 0
                })
            }
            else {
                if (this.square.width <= this.rightWall.x - this.leftWall.x) {
                    fallAndBounce(true)
                }
                else {
                    fallAndBounce(false)
                }
            }
        })
    }
}

function fallAndBounce(success) {
    let destY
    let message

    if (success) {
        destY = game.height - this.leftSquare.height - this.square.height / 2
        message = "Yes!"
    }
    else {
        destY = game.height - this.leftSquare.height - this.leftWall.height - this.square.height / 2;
        message = "No!"
    }

    let fallTween = game.add.tween(this.square).to({ y: destY }, 600, Phaser.Easing.Bounce.Out, true)
    fallTween.onComplete.add(() => {
        if (!success) {
            gameOver()
            saveScore = 0
        }
        else {
             saveScore++
             this.levelText.text="SCORE:"+saveScore
            updateLevel()
            game.add.tween(this.square.scale).to({ x: 0.2, y: 0.2 }, 500, Phaser.Easing.Cubic.Out, true)
        }
    })
}

function addLevelText(text,textsize){
    this.levelText = game.add.bitmapText(game.width/2, 10, "font", `${text} ${saveScore}`, textsize)
    this.levelText.anchor.setTo(0.5,0)

}

function gameOver() {
    this.gameover = game.add.sprite(game.width / 2, game.height / 2, "gameover")
    this.gameover.anchor.setTo(0.5, 0.5)
    this.gameover.alpha = 0.7
    this.gameover.inputEnabled = true
    this.gameover.events.onInputDown.add(this.restartGame, this)

    this.gameoverText = game.add.bitmapText(game.width / 2, game.height / 3, "font", "GAME OVER", 60)
    this.gameoverText.anchor.setTo(0.5, 0.5)

    this.restartText = game.add.bitmapText(game.width / 2, game.height / 2, "font", "TAP TO RESTART", 40)
    this.restartText.anchor.setTo(0.5, 0.5)

    game.world.bringToTop(this.gameover)
    game.world.bringToTop(this.gameoverText)
    game.world.bringToTop(this.restartText)
}

function restartGame() {
    game.state.start("GameState")
}

function showInstructions(targetImage, targetDropText, instruction1, instruction2){
    this.infoGroup= game.add.group()
    let targetSquare= game.add.sprite(game.width/2, game.height-this.leftSquare.height, targetImage)
    targetSquare.width= holeWidth+wallWidth
    targetSquare.height= holeWidth+wallWidth
    targetSquare.alpha= 0.3
    targetSquare.anchor.setTo(0.5, 1)
    this.infoGroup.add(targetSquare)

    let targetText= game.add.bitmapText(game.width / 2, targetSquare.y-targetSquare.height, "font", targetDropText, 50)
    targetText.anchor.setTo(0.5, 1)
    this.infoGroup.add(targetText)
    let holeText1= game.add.bitmapText(game.width / 2, 350,  "font", instruction1, 40)
    holeText1.anchor.setTo(0.5, 1)
    this.infoGroup.add(holeText1)
    let releaseText1= game.add.bitmapText(game.width / 2, 400,  "font", instruction2, 40)
    releaseText1.anchor.setTo(0.5, 1)
    this.infoGroup.add(releaseText1)
}