function Create() {
    this.gameMode = IDLE

    generateGradientBackground()

    this.background=game.add.sprite(0, 0, "deadlightbg")
    
    addLeftWall("base", "top")
    
    addRightWall("base", "top")
    
    addSquare("LockSquare", 0.2)

    

    
    updateLevel()
    
    addLevelText("SCORE:", 60)
    showInstructions("LockSquare", "drop here", "Tap and Hold to Grow the Square", "Release to Drop the Square")
    this.bg = game.add.sprite(0, 0)
    this.bg.fixedToCamera = true
    this.bg.scale.setTo(game.width, game.height)
    this.bg.inputEnabled = true
    this.bg.input.priorityID = 0
    this.bg.events.onInputDown.add(grow, this)
    this.bg.events.onInputUp.add(stop, this)
}