function Create() {
    this.gameMode = IDLE

    generateGradientBackground()
    
    addLeftWall("base", "top")
    
    addRightWall("base", "top")
    
    addSquare("square", 0.2)
    
    updateLevel()
    
    addLevelText("SCORE:", 60)
    showInstructions("square", "drop here", "Tap and Hold to Grow the Square", "Release to Drop the Square")
    this.bg = game.add.sprite(0, 0)
    this.bg.fixedToCamera = true
    this.bg.scale.setTo(game.width, game.height)
    this.bg.inputEnabled = true
    this.bg.input.priorityID = 0
    this.bg.events.onInputDown.add(grow, this)
    this.bg.events.onInputUp.add(stop, this)
}