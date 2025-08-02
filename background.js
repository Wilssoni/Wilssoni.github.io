let fragmentShaderElem

function reloadShader() {
  console.log("called")
  let c = document.querySelector("canvas")
  let g = c.getContext("webgl2")
  let x,z
  g.viewport(0, 0, x = c.width = c.clientWidth, z = c.height = c.clientHeight)
  let fragmentShader = fragmentShaderElem.value
  c = (a, b, d = g.createShader(a)) => {
    g.shaderSource(d, b)
    g.compileShader(d)
    return d
  }
  let w = g.createProgram()
  b = (c) => { g.attachShader(w, c) }
  b(c(g.VERTEX_SHADER, `#version 300 es\nin vec4 p;void main(){gl_Position=p;}`))
  b(c(g.FRAGMENT_SHADER, fragmentShader))
  g.linkProgram(w)
  g.useProgram(w)
  u = (d) => { return g.getUniformLocation(w, d) }
  g.uniform2f(u('v'), x, z)

  g.bindBuffer(f = g.ARRAY_BUFFER, g.createBuffer())
  g.bufferData(f, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), g.STATIC_DRAW)
  g.enableVertexAttribArray(e = g.getAttribLocation(w, "p"))
  g.vertexAttribPointer(e, 2, g.FLOAT, false, 0, 0)
  h = (t) => {
    g.drawArrays(g.TRIANGLES, 0, 6);
    g.uniform1f(u('f'), t/1e3)
    requestAnimationFrame(h)
  }
  h()
}

window.onload = () => {
  fragmentShaderElem = document.querySelector("#fragmentshadertext")
  fetch("defaultFrag").then((result) => {result.text().then((text)=>{fragmentShaderElem.value = text; reloadShader();})})
}
