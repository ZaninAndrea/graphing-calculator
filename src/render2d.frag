  precision highp float;
  uniform vec2 resolution;
  uniform float time;
  uniform vec2 mouse;
  uniform bool signPlot;
  uniform bool showAxes;
  uniform float tick;
  uniform float zoom;
  uniform float fuzzy;
  
  #define thickness .0
  
  float fn(float x, float y){
      return external_function;
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