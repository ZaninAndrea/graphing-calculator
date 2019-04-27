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
    input.position(20, 40)

    input2 = createInput()
    input2.value("x*x + y*y - 5.")
    input2.position(20, 65)

    button = createButton("ok")
    button.position(input.x + input.width + 10, 52)
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
        program = createShader(
            vert,
            transitionFrag(input.value(), input2.value())
        )
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

var vert = `
attribute vec3 aPosition;
precision highp float;
uniform vec2 resolution;
uniform float time;

void main() {
  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
  gl_Position = positionVec4;
}
`

function frag(fn) {
    return `
  precision highp float;
  uniform vec2 resolution;
  uniform float time;
  uniform vec2 mouse;
  uniform bool signPlot;
  uniform bool showAxes;
  uniform float tick;
  uniform float zoom;
  uniform float fuzzy;
  
  float fn(float x, float y){
      return ${fn};
  }
  
  vec3 shade(float val){
      if (val>.0){
          if(!signPlot){
            return vec3(val,val,val)*fuzzy;
          }else{
            if (log(val)>4.0){
              return vec3(1,0.3,0);
            } else if (log(val)>2.0){
              return vec3(1,0.5,0);
            }else{
              return vec3(1,0.8,0);
            }
          }
      }
      else{
        if(!signPlot){
          return abs(vec3(val,val,val))*fuzzy;
        }else{
          if (log(-val)>4.0){
            return vec3(0,0.3,1);
          }else if (log(-val)>2.0){
            return vec3(0,0.5,1);
          }else{
            return vec3(0,0.8,1);
          }          
        }
      }
         
  }
  
  void main(void)
  {
      float x = (gl_FragCoord.x - resolution.x/2.0)/zoom;
      float y = (gl_FragCoord.y - resolution.y/2.0)/zoom;
      
      // axes
      if (showAxes && (abs(x*zoom) < 1. || abs(y*zoom) < 1.)){
        gl_FragColor = vec4(0.,0.,0.,1.0);
      }
      // ticks on axes
      else if (showAxes && ((mod(x + 1./zoom, tick) < 2./zoom && abs(y*zoom)<5.) || (mod(y + 1./zoom, tick) < 2./zoom && abs(x*zoom)<5.))){
        gl_FragColor = vec4(0.,0.,0.,1.0);
      }
      else{
        float val = fn(x,y);
        gl_FragColor = vec4(shade(val),1.0);
      }
  
  }
`
}

function transitionFrag(fn, fn2) {
    return `
    precision highp float;
    uniform vec2 resolution;
    uniform float time;
    uniform vec2 mouse;
    uniform bool signPlot;
    uniform bool showAxes;
    uniform float tick;
    uniform float zoom;
    uniform float fuzzy;

float A(float x, float y){
    return  ${fn};
}

float B(float x, float y){
  return  ${fn2};  
}

float fn(float x, float y){
    float ratio = abs(1. - 2.*smoothstep(0.,10.,mod(time,10.)));
 	return A(x,y)*(1.-ratio) + B(x,y) * (ratio);   
}

vec3 shade(float val){
  if (val>.0){
      if(!signPlot){
        return vec3(val,val,val)*fuzzy;
      }else{
        if (log(val)>4.0){
          return vec3(1,0.3,0);
        } else if (log(val)>2.0){
          return vec3(1,0.5,0);
        }else{
          return vec3(1,0.8,0);
        }
      }
  }
  else{
    if(!signPlot){
      return abs(vec3(val,val,val))*fuzzy;
    }else{
      if (log(-val)>4.0){
        return vec3(0,0.3,1);
      }else if (log(-val)>2.0){
        return vec3(0,0.5,1);
      }else{
        return vec3(0,0.8,1);
      }          
    }
  }
     
}

void main(void)
{
    float x = (gl_FragCoord.x - resolution.x/2.0)/zoom;
    float y = (gl_FragCoord.y - resolution.y/2.0)/zoom;
    
    // axes
    if (showAxes && (abs(x*zoom) < 1. || abs(y*zoom) < 1.)){
      gl_FragColor = vec4(0.,0.,0.,1.0);
    }
    // ticks on axes
    else if (showAxes && ((mod(x + 1./zoom, tick) < 2./zoom && abs(y*zoom)<5.) || (mod(y + 1./zoom, tick) < 2./zoom && abs(x*zoom)<5.))){
      gl_FragColor = vec4(0.,0.,0.,1.0);
    }
    else{
      float val = fn(x,y);
      gl_FragColor = vec4(shade(val),1.0);
    }

}
`
}
