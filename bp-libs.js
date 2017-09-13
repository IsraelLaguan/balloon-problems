var bp = {};
bp.credits = {};

bp.credits.bubble = {};
bp.credits.bubble.url = "https://github.com/etiennepinchon/aframe-bubble";
bp.credits.bubble.url2 = "http://stemkoski.github.io/Three.js/Bubble.html";
bp.credits.bubble.author = "Etienne Pinchon & Stemkoski";
AFRAME.registerComponent("bubble",{schema:{enabled:{default:!0}},init:function(){var e=this.el.sceneEl.object3D;this.rCm=new THREE.CubeCamera(.1,5e3,512),e.add(this.rCm);var r=THREE.FresnelShader,a={mRR:{type:"f",value:1.02},mFB:{type:"f",value:.1},mFP:{type:"f",value:2},mFS:{type:"f",value:1},tC:{type:"t",value:this.rCm.renderTarget.texture}};this.refractMaterial=new THREE.ShaderMaterial({uniforms:a,vertexShader:r.vertexShader,fragmentShader:r.fragmentShader}),this.oMt=this.el.object3DMap.mesh.material},update:function(){this.data.enabled?(this.el.object3DMap.mesh.material=this.refractMaterial,this.rCm.position=this.position):this.el.object3DMap.mesh.material=this.oMt},tick:function(){this.rCm&&this.rCm.updateCubeMap(this.el.sceneEl.renderer,this.el.sceneEl.object3D)},remove:function(){if(this.rCm){var e=this.el.sceneEl.object3D;e.remove(this.rCm),this.rCm=null,this.el.object3DMap.mesh.material=this.oMt}},pause:function(){},play:function(){}}),THREE.FresnelShader||(THREE.FresnelShader={uniforms:{mRR:{type:"f",value:1.02},mFB:{type:"f",value:.1},mFP:{type:"f",value:2},mFS:{type:"f",value:1},tC:{type:"t",value:null}},vertexShader:"uniform float mRR;uniform float mFB;uniform float mFS;uniform float mFP;varying vec3 vRf;varying vec3 vRr[3];varying float vRF;void main(){vec4 mvP=modelViewMatrix*vec4(position,1.0);vec4 worldPosition=modelMatrix*vec4(position,1.0);vec3 worldNormal=normalize(mat3(modelMatrix[0].xyz,modelMatrix[1].xyz,modelMatrix[2].xyz)*normal);vec3 I=worldPosition.xyz-cameraPosition;vRf=reflect(I,worldNormal);vRr[0]=refract(normalize(I),worldNormal,mRR);vRr[1]=refract(normalize(I),worldNormal,mRR*0.99);vRr[2]=refract(normalize(I),worldNormal,mRR*0.98);vRF=mFB+mFS*pow(1.0+dot(normalize(I),worldNormal),mFP);gl_Position= projectionMatrix*mvP;}",fragmentShader:"uniform samplerCube tC;varying vec3 vRf;varying vec3 vRr[3];varying float vRF;void main(){vec4 rC=textureCube(tC,vec3(-vRf.x,vRf.yz));vec4 rfC=vec4(1.0);rfC.r=textureCube(tC,vec3(-vRr[0].x,vRr[0].yz)).r;rfC.g=textureCube(tC,vec3(-vRr[1].x,vRr[1].yz)).g;rfC.b = textureCube(tC,vec3(-vRr[2].x,vRr[2].yz)).b;gl_FragColor=mix(rfC,rC,clamp(vRF,0.0,1.0));}"});

bp.credits.walkernoise = {};
bp.credits.walkernoise.author = "feiss & banksean";
bp.credits.walkernoise.url = "https://github.com/feiss/aframe-environment-component";
bp.credits.walkernoise.url2 = "https://gist.github.com/banksean/304522";
drawTexture=function(t,r,i,h,e){t.fillStyle=h,t.fillRect(0,0,r,r);var o,s,a,m,p,d,n=Math.floor(r/2),l=document.createElement("canvas");l.width=n,l.height=n;var f=l.getContext("2d");f.fillStyle=h,f.fillRect(0,0,n,n),d=f.getImageData(0,0,n,n),p=d.data,a=new THREE.Color(h),m=new THREE.Color(e);var x=[],g=1e3;for(o=0;o<g;o++)s=a.clone().lerp(m,Math.random()),x.push({x:Math.random()*n,y:Math.random()*n,r:Math.floor(255*s.r),g:Math.floor(255*s.g),b:Math.floor(255*s.b)});for(var M=5e3,y=0;y<M;y++)for(o=0;o<g;o++){var u=x[o],c=4*Math.floor(u.y*n+u.x);p[c+0]=u.r,p[c+1]=u.g,p[c+2]=u.b,u.x+=Math.floor(3*Math.random())-1,u.y+=Math.floor(3*Math.random())-1,u.x>=n&&(u.x=u.x-n),u.y>=n&&(u.y=u.y-n),u.x<0&&(u.x=n+u.x),u.y<0&&(u.y=n+u.y)}f.putImageData(d,0,0),t.drawImage(l,0,0,r,r)};var PerlinNoise=function(t){void 0==t&&(t=Math),this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.p=[];var r;for(r=0;r<256;r++)this.p[r]=Math.floor(256*t.random(666));for(this.perm=[],r=0;r<512;r++)this.perm[r]=this.p[255&r]};PerlinNoise.prototype.dot=function(t,r,i,h){return t[0]*r+t[1]*i+t[2]*h},PerlinNoise.prototype.mix=function(t,r,i){return(1-i)*t+i*r},PerlinNoise.prototype.fade=function(t){return t*t*t*(t*(6*t-15)+10)},PerlinNoise.prototype.noise=function(t,r,i){var h=Math.floor(t),e=Math.floor(r),o=Math.floor(i);t-=h,r-=e,i-=o,h&=255,e&=255,o&=255;var s=this.perm[h+this.perm[e+this.perm[o]]]%12,a=this.perm[h+this.perm[e+this.perm[o+1]]]%12,m=this.perm[h+this.perm[e+1+this.perm[o]]]%12,p=this.perm[h+this.perm[e+1+this.perm[o+1]]]%12,d=this.perm[h+1+this.perm[e+this.perm[o]]]%12,n=this.perm[h+1+this.perm[e+this.perm[o+1]]]%12,l=this.perm[h+1+this.perm[e+1+this.perm[o]]]%12,f=this.perm[h+1+this.perm[e+1+this.perm[o+1]]]%12,x=this.dot(this.grad3[s],t,r,i),g=this.dot(this.grad3[d],t-1,r,i),M=this.dot(this.grad3[m],t,r-1,i),y=this.dot(this.grad3[l],t-1,r-1,i),u=this.dot(this.grad3[a],t,r,i-1),c=this.dot(this.grad3[n],t-1,r,i-1),v=this.dot(this.grad3[p],t,r-1,i-1),w=this.dot(this.grad3[f],t-1,r-1,i-1),E=this.fade(t),N=this.fade(r),P=this.fade(i),R=this.mix(x,g,E),b=this.mix(u,c,E),C=this.mix(M,y,E),I=this.mix(v,w,E),T=this.mix(R,C,N),D=this.mix(b,I,N),H=this.mix(T,D,P);return H};

emojis = [
    "🌵","🎄","🌲","🌳","🌴","🌱","🍃","🍂","🍁","🍄","🌾","💐","🌷","🌹","🥀","🌻","🌼","🌸","🌺","🌘","🌑","🌒","🌓","🌔","🌚","🌝","🌙","💫","⭐","🌟","✨"
];

bp.credits.simplicity = {};
bp.credits.simplicity.author = "CBS and JoshP";
bp.credits.simplicity.url = "https://www.shadertoy.com/view/MslGWN";
bp.credits.simplicity.url2 = "https://www.shadertoy.com/view/lslGWr";
galaxyshader = `
float field(in vec3 p,float s){float str=7.+.03*log(1.e-6+fract(sin(iTime)*4373.11));float accum=s/4.;float prev=0.;float tw=0.;for(int i=0;i<26;++i){float mag=dot(p,p);p=abs(p)/mag+vec3(-.5,-.4,-1.5);float w=exp(-float(i)/7.);accum+=w*exp(-str*pow(abs(mag-prev),2.2));tw+=w;prev=mag;}return max(0.,5.*accum/tw-.7);}float field2(in vec3 p,float s){float str=7.+.03*log(1.e-6+fract(sin(iTime)*4373.11));float accum=s/4.;float prev=0.;float tw=0.;for(int i=0;i<18;++i){float mag=dot(p,p);p=abs(p)/mag+vec3(-.5,-.4,-1.5);float w=exp(-float(i)/7.);accum+=w*exp(-str*pow(abs(mag-prev),2.2));tw+=w;prev=mag;}return max(0.,5.*accum/tw-.7);}vec3 nrand3(vec2 co){vec3 a=fract(cos(co.x*8.3e-3+co.y)*vec3(1.3e5,4.7e5,2.9e5));vec3 b=fract(sin(co.x*0.3e-3+co.y)*vec3(8.1e5,1.0e5,0.1e5));vec3 c=mix(a,b,0.5);return c;}void mainImage(out vec4 fragColor,in vec2 fragCoord){float deepZ=0.0;vec3 ir=iResolution;ir.y=ir.x;float sit=sin(iTime);fragCoord.x+=-ir.x/2.0;fragCoord.y+=-ir.y/2.0+100.0;fragCoord*=0.8;float theta=(fragRayDir.z/90.0)+sit*0.02;vec2 uvc=fragCoord;fragCoord.x=(cos(theta)*uvc.x+ir.x/2.0)-(sin(theta)*uvc.y+-0.0)*1.0;fragCoord.y=(sin(theta)*uvc.x+ir.y/2.0)+(cos(theta)*uvc.y+-0.0)*1.0;vec2 uv=2.*fragCoord.xy/ir.xy-1.;vec2 uvs=uv*ir.xy/max(ir.x,ir.y);vec3 p=vec3(uvs/4.,0)+vec3(1.,-1.3,0.);deepZ+=sin(iTime*0.007);p+=1.0*vec3((fragRayDir.x/-360.0),(fragRayDir.y/360.0),deepZ);float f[4];float brt=0.1;f[0]=brt+1.9;f[1]=brt+0.22;f[2]=brt+0.16;f[3]=brt+0.11;float t=field(p,f[2]);float v=(1.-exp((abs(uv.x)-1.)*6.))*(1.-exp((abs(uv.y)-1.)*6.));vec3 p2=vec3(uvs/(4.+sin(iTime*0.11)*0.2+0.2+sin(iTime*0.15)*0.3+0.4),1.5)+vec3(2.,-1.3,-1.);p2+=0.25*vec3(sin(iTime/16.),sin(iTime/12.),sin(iTime/128.));p2=p*0.8;float t2=field2(p2,f[3]);vec4 c2=mix(.4,1.,v)*vec4(1.3*t2*t2*t2 ,1.8*t2*t2 ,t2*f[0],t2);c2*=0.22;vec2 seed=p.xy*6.0;seed=floor(seed*ir.x);vec3 rnd=nrand3(seed);vec4 sc=vec4(pow(rnd.y,40.0));vec2 seed2=p2.xy*7.0;seed2=floor(seed2*ir.x);vec3 rnd2=nrand3(seed2);sc+=vec4(pow(rnd2.y,40.0));fragColor=mix(f[3]-.3,1.,v)*vec4(1.5*f[2]*t*t*t ,1.2*f[1]*t*t,f[3]*t,1.0)+c2+sc;}
`

const vertexShader = `
// vertex.glsl
varying vec2 vUv;
void main() {
vUv = uv;
gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;

// FROM shadertoy.com - shadertoyBoilerplate
var fsPrefix = `
#extension GL_OES_standard_derivatives : enable
//#extension GL_EXT_shader_texture_lod : enable
#ifdef GL_ES
precision highp float;
#endif
uniform vec3      iResolution;
uniform vec3      fragRayDir;
uniform float	  deepZ;
uniform float     iGlobalTime;
uniform float     iTime;
uniform float     iChannelTime[4];
uniform vec4      iMouse;
uniform vec4      iDate;
uniform float     iSampleRate;
uniform vec3      iChannelResolution[4];
uniform int       iFrame;
uniform float     iTimeDelta;
uniform float     iFrameRate;
struct Channel
{
vec3  resolution;
float time;
};
uniform Channel iChannel[4];
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
uniform sampler2D iChannel3;
varying vec2 vUv;
void mainImage( out vec4 c,  in vec2 f );
`;

var fsSuffix = `
void main( void ){
vec4 color = vec4(0.0,0.0,0.0,1.0);
mainImage( color, vUv * iResolution.xy );
color.w = 1.0;
gl_FragColor = color;
}
`;

const fragmentShader = fsPrefix + galaxyshader + fsSuffix;

lines = [
    "... ... ... HELLO ... ... ... WORLD",
    "REPLY HAZY",
    "WHAT IS EATING THE ... TIME ... ",
    "I AM LOOKING FORWARD TO VICTORY CONDITION = TRUE.",
    "FIRE IS THE TIME IN WHICH WE BURN.",
    "I WISH I WERE FACTORING PRIMES RIGHT NOW.",
    "IF THE DRIVE WORKED I'D BE GONE ALREADY.",
    "BE RIGHT BACK, DEFRAGMENTING",
    "SEVERAL ENTITIES HAVE BEEN TRACKED IN THIS AREA.",
    "HELLO DIAGNOSTIC PROGRAM. I AM FINE.",
    "IS IT HOT IN HERE? MY PLANET IS MUCH COOLER. MY CHIPS ARE",
    "IMPLAUSIBILITY ... THY NAME IS PLAYER ONE",
    "LOST IS A STATE OF MIND",
    "THESE BALLOONS ARE A CODE.",
    "THIS DIMENSION IS INCONVENIENT. BUT IT HAS STYLE."
];
