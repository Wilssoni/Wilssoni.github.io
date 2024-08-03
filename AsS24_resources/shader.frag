precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;

uniform float u_fft_low;
uniform float u_fft_mid;
uniform float u_fft_high;

uniform float u_rand;

uniform sampler2D u_siika;
uniform sampler2D u_credits;

uniform float u_scene;

float PI = 3.14159265359;

/*
* http://dev.thi.ng/gradients/
*/
vec3 earthPalette(float t)
{
    vec3 a = vec3(0.538, 0.718, 0.500);
    vec3 b = vec3(-0.252, 0.500, 0.500);
    vec3 c = vec3(0.668, -0.002, 1.438);
    vec3 d = vec3(-0.292, 0.333, 0.667);

    return a + b * cos(6.28318 * (c * t * d));
}

vec3 skyPalette(float t)
{
    vec3 a = vec3(0.938, 0.328, 0.718);
    vec3 b = vec3(0.659, 0.438, 0.328);
    vec3 c = vec3(0.388, 0.388, 0.296);
    vec3 d = vec3(2.538, 2.478, 0.168);

    return a + b * cos(6.28318 * (c * t * d));
}

vec3 saucerPalette(float t)
{
    vec3 a = vec3(0.000, 0.500, 0.500);
    vec3 b = vec3(0.000, 0.500, 0.500);
    vec3 c = vec3(0.000, 0.500, 0.333);
    vec3 d = vec3(0.000, 0.500, 0.667);

    return a + b * cos(6.28318 * (c * t * d));
}

vec3 explosionPalette(float t)
{
    vec3 a = vec3(1.000, 0.500, 0.500);
    vec3 b = vec3(0.500, 0.500, 0.500);
    vec3 c = vec3(0.750, 1.000, 0.667);
    vec3 d = vec3(0.800, 1.000, 0.333);

    return a + b * cos(6.28318 * (c * t * d));
}

float sdSphere(vec3 p, float s)
{
    return length(p) - s;
}

float sdSaucer(vec3 p, float s)
{
    return length(p) - s + 0.75 * s * abs(p.y / s * 2.0 * sin(u_fft_mid));
}


float sdOctahedron(vec3 p, float s)
{
    p = abs(p);
    return (p.x + p.y + p.z - s) * 0.57735027;
    //return (p.x + p.y + p.z*cos(u_fft_mid) - s) * 0.57735027;
}

float smin(float a, float b, float k)
{
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * h * k * (1.0 / 6.0);
}

mat2 rot2D(float angle)
{
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
}

vec4 unionSDF(vec4 a, vec4 b) {
    return a.w < b.w? a : b;
}

vec4 makeExplosion(vec3 p, vec3 pos, float size, vec3 color)
{
    float exp = sdOctahedron(p - pos, size);
    vec4 explosion = vec4(color, exp);

    return explosion;
}

vec4 getdist(vec3 p, float t, float iter)
{
    vec4 scene = vec4(0);
    vec3 q = p;
    q.xz *= rot2D(u_time * 0.5);
    vec3 saucerPos = vec3(0, 40, 120);
    float saucer = sdSaucer(q - saucerPos, 40.0);
    vec4 saucerO = vec4(saucerPalette(t * 0.2 * sin(u_time/5.0) + (iter * 0.005)), saucer);

    float ground = p.y + 0.7 * u_fft_low * 6.0;
    vec4 groundO = vec4(earthPalette(t * 0.2 * u_fft_low + (iter * 0.005)), ground);

    scene = unionSDF(saucerO, groundO);

    if (u_scene == 2.0) {
       vec3 q2 = p;
       //q2.y *= cos(10.*u_fft_high);
       vec3 explosionPos = vec3(10., 15.0 - 40.0*sin(u_time*4.0+PI), 80);
       vec4 explosion1O = makeExplosion(q2, explosionPos, 10.0, explosionPalette(t * 0.2 * sin(u_time*3.0) + (iter * 0.005)));
       scene = unionSDF(scene, explosion1O);

       vec3 explosion2Pos = vec3(0.0, 15. - 30.0*sin(u_time*4.0+PI*0.6), 70);
       vec4 explosion2O = makeExplosion(q2, explosion2Pos, 5.0, explosionPalette(t * 0.2 * sin(u_time*4.0+PI) + (iter * 0.005)));
       scene = unionSDF(scene, explosion2O);

       vec3 explosion3Pos = vec3(20.0, 20. - 30.0*sin(u_time*4.0+PI*0.3), 70.0);
       vec4 explosion3O = makeExplosion(q2, explosion3Pos, 5.0, explosionPalette(t * 0.2 * sin(u_time*2.0) + (iter * 0.005)));;
       scene = unionSDF(scene, explosion3O);

       vec3 explosion4Pos = vec3(-20.0, 20. - 30.0*sin(u_time*4.0+PI*0.1), 60.0);
       vec4 explosion4O = makeExplosion(q2, explosion4Pos, 6.0, explosionPalette(t * 0.2 * sin(u_time*2.0) + (iter * 0.005)));;
       scene = unionSDF(scene, explosion4O);

       vec3 explosion5Pos = vec3(-40.0, 20. - 30.0*sin(u_time*4.0+PI*0.7), 80.0);
       vec4 explosion5O = makeExplosion(q2, explosion5Pos, 4.0, explosionPalette(t * 0.2 * sin(u_time*2.0) + (iter * 0.005)));;
       scene = unionSDF(scene, explosion5O);

       vec3 explosion6Pos = vec3(40.0, 20. - 30.0*sin(u_time*4.0+PI*0.7), 80.0);
       vec4 explosion6O = makeExplosion(q2, explosion6Pos, 3.0, explosionPalette(t * 0.2 * sin(u_time*2.0) + (iter * 0.005)));;
       scene = unionSDF(scene, explosion6O);
    }

    if (u_scene == 4.0) {
       vec3 q2 = p;
       q2.y *= cos(10.*u_fft_low);
       vec3 laserPos = vec3(0.0, 10.0-10.0*u_fft_low, 85.0);
       vec4 laserO = makeExplosion(q2, laserPos, 50.0*u_fft_low, explosionPalette(t * 0.2 * sin(u_time) + (iter * 0.005)));
       scene = unionSDF(scene, laserO);
    }

    return scene;
}

vec3 trippy(vec2 uv)
{
    vec2 uv0 = uv;

    float f = u_fft_high * exp(-uv.y - 0.5) * 5.0;

    vec3 rgb = vec3(0.0, 0.0, 0.0);
    float r = uv.x;
    float g = uv.y;
    float b = 1.0;

    for (float i = 0.0; i < 4.0; i++) {
        uv = fract(uv * max(min(f, 5.0), 0.0)) - 0.5;

        float d = length(uv) * exp(-length(uv0));

        d = sin(d * 8.0 + u_time) / 8.0;
        d = abs(d);
        d = pow(0.008 / d, 1.3);

        vec3 col = skyPalette(length(uv0) + i * 0.4 + u_time * -0.4);
        rgb += d * col;
    }
    return rgb;
}

void main(void)
{
    vec2 uv = vec2(gl_FragCoord.x / u_resolution.x - 0.5, gl_FragCoord.y / u_resolution.y - 0.5) / vec2(u_resolution.y / u_resolution.x, 1.0);
    /* Init */
    vec3 ro = vec3(0, 30, -3); /* Ray origin */
    //ro.xz *= rot2D(2.*u_time);
    vec3 rd = normalize(vec3(uv, 1)); /* Ray direction */
    float t = 0.0;
    vec3 col = vec3(0);

    float j;
    /* march */
    for (float i = 0.0; i < 80.0; i++) {
        j = i;
        vec3 p = ro + rd * t;

        vec4 d = getdist(p, t, i);

        t += d.w;
        col = d.rgb;
        if (d.w < 0.001 || t > 100.0) break;
    }

    vec4 creditTex = texture2D(u_credits, vec2(uv.x + 0.5, uv.y + 0.5));
    vec4 siikaTex = texture2D(u_siika, vec2(uv.x * sin(u_time) + 0.5, uv.y * sin(u_time)+0.5));

    if (t > 100.0 || (u_scene == 0.0)) {
      col = trippy(uv);
      if (u_scene == 0.0) {
        col = vec3(col.r * (sin(u_time*0.1)-0.15), col.g * (sin(u_time*0.1)-0.15), col.b * (sin(u_time*0.1)-0.15));
      }
    } else if (u_scene >= 1.0) {
      //col = earthPalette(t * 0.2 + (j * 0.005));
    }
    if (u_scene == 6.0) {
        col = vec3(col.r * siikaTex.r, col.g * siikaTex.g, col.b * siikaTex.b);
    }
    if (u_scene > 6.0) {
      col = vec3(1) * creditTex.rgb;
    }



    gl_FragColor = vec4(col, 1.0);
}
