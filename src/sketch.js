import rawFrag from "./transition.frag"
import vert from "./generic.vert"

var program
var paused = false
var time = 0
var oldTimestamp = -1
var updateShader = true
let input, button, greeting
let showAxes = true
let signPlot = true
let tickEvery = 4
let zoom = 50
let fuzzy = 5

function setup() {
    pixelDensity(1)

    createCanvas(windowWidth, windowHeight, WEBGL)
    gl = this.canvas.getContext("webgl")
    rectMode(CENTER)
    noStroke()
    fill(1)

    input = createInput()
    input.value("x*x - y*y - 5.")
    input.position(20, 65)

    button = createButton("ok")
    button.position(input.x + input.width, 65)
    button.mousePressed(() => {
        updateShader = true
    })

    axesCheckbox = createCheckbox("Show axes", showAxes)
    axesCheckbox.changed(() => {
        showAxes = axesCheckbox.checked()
    })
    axesCheckbox.position(20, 90)

    signCheckbox = createCheckbox("Sign plot", signPlot)
    signCheckbox.changed(() => {
        signPlot = signCheckbox.checked()
    })
    signCheckbox.position(20, 115)

    tickInput = createInput(tickEvery, "number")
    tickInput.position(20, 140)
    tickInput.changed(() => {
        tickEvery = tickInput.value()
    })
}

function draw() {
    if (updateShader) {
        program = createShader(vert, frag(input.value()))
        updateShader = false
    }
    if (oldTimestamp == -1) oldTimestamp = millis()
    if (!paused) {
        currentTimestamp = millis()
        time += currentTimestamp - oldTimestamp
        oldTimestamp = currentTimestamp
    }

    shader(program)
    let mx = map(mouseX, 0, width, 0, 1)
    let my = map(mouseY, 0, height, 0, 1)
    background(0)

    program.setUniform("mouse", [mx, my])
    program.setUniform("resolution", [width, height])
    program.setUniform("time", time / 1000)
    program.setUniform("signPlot", signPlot)
    program.setUniform("showAxes", showAxes)
    program.setUniform("tick", tickEvery)
    program.setUniform("zoom", zoom)
    program.setUniform("fuzzy", fuzzy)

    rect(0, 0, width, height)
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
}

function mouseClicked() {
    if (paused) oldTimestamp = millis()
    paused = !paused
}

window.onwheel = function(e) {
    e.preventDefault()

    zoom *= 1 - e.deltaY * 0.003
    fuzzy *= 1 - e.deltaX * 0.003
}

function frag(fn) {
    return rawFrag.replace("external_function", fn)
}
