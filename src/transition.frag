precision highp float;
uniform vec2 resolution;
uniform float time;
uniform vec2 mouse;

#define thickness .0
#define zoom 50.0

float A(float x, float y){
    return  x*x + y*y - 5.;
}

float B(float x, float y){
    return  x*x - y*y - 5.;
}

float fn(float x, float y){
    float ratio = abs(1. - 2.*smoothstep(0.,10.,mod(time,10.)));
 	return A(x,y)*(1.-ratio) + B(x,y) * (ratio);   
}

vec3 shade(float val){
    if (val>.0){
        return vec3(1,0.8,0);
    }
    else{
        return vec3(0,0.8,0.8);
    }
       
}

void main(void)
{
    float x = (gl_FragCoord.x - resolution.x/2.0)/zoom;
    float y = (gl_FragCoord.y - resolution.y/2.0)/zoom;
    
    float val = fn(x,y);
    gl_FragColor = vec4(shade(val),1.0);

}