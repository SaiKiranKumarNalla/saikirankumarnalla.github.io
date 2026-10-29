// A globe with real country shapes (Natural Earth 1:110m via world-atlas), drawn onto an
// equirectangular canvas texture. Lived/visited countries are filled and glow through the emissive map.
import * as THREE from 'three';
import { feature } from 'topojson-client';

const PAL = {
  dark: { ocean: '#0d0a10', land: '#2a2128', border: 'rgba(242,236,228,0.28)', visited: '#b8483f', lived: '#ff6a4a', grid: 0xf2ece4 },
  light: { ocean: '#d8cdbf', land: '#f4ede3', border: 'rgba(27,23,21,0.28)', visited: '#d77a63', lived: '#b02a20', grid: 0x1b1715 },
};

// lat/lon → point on a sphere of radius r, with lon 0 facing +Z (matches the texture offset below).
export function ll(lat, lon, r) {
  const la = THREE.MathUtils.degToRad(lat), lo = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(Math.cos(la) * Math.sin(lo) * r, Math.sin(la) * r, Math.cos(la) * Math.cos(lo) * r);
}

export function makeGlobe({ R = 3.6, lived = [], visited = [], lowPower = false } = {}) {
  const group = new THREE.Group();
  const W = lowPower ? 2048 : 4096, H = W / 2;
  const colorCanvas = document.createElement('canvas');
  const glowCanvas = document.createElement('canvas');
  colorCanvas.width = glowCanvas.width = W;
  colorCanvas.height = glowCanvas.height = H;
  const colorTex = new THREE.CanvasTexture(colorCanvas);
  const glowTex = new THREE.CanvasTexture(glowCanvas);
  for (const t of [colorTex, glowTex]) {
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    t.offset.x = 0.25; // SphereGeometry puts u=0.25 at +Z; shift so lon 0 lands there
    t.anisotropy = 8;
  }

  const mat = new THREE.MeshStandardMaterial({ map: colorTex, emissiveMap: glowTex, emissive: 0xffffff, emissiveIntensity: 0.9, roughness: 0.85, metalness: 0.05 });
  group.add(new THREE.Mesh(new THREE.SphereGeometry(R, 96, 64), mat));
  const halo = new THREE.Mesh(new THREE.SphereGeometry(R * 1.06, 48, 32), new THREE.MeshBasicMaterial({ color: 0xd24a4a, transparent: true, opacity: 0.08, side: THREE.BackSide }));
  group.add(halo);

  const grid = [];
  for (let lat = -60; lat <= 60; lat += 30) for (let lon = 0; lon < 360; lon += 4) grid.push(ll(lat, lon, R * 1.003), ll(lat, lon + 4, R * 1.003));
  for (let lon = 0; lon < 360; lon += 30) for (let lat = -84; lat < 84; lat += 4) grid.push(ll(lat, lon, R * 1.003), ll(lat + 4, lon, R * 1.003));
  const gridMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.06 });
  group.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(grid), gridMat));

  const livedSet = new Set(lived), visitedSet = new Set(visited);
  let countries = null, theme = 'dark';

  const x = (lon) => ((lon + 180) / 360) * W;
  const y = (lat) => ((90 - lat) / 180) * H;
  // Unwrap each ring's longitudes so polygons crossing the antimeridian stay whole,
  // then draw at three horizontal offsets so the wrap is covered.
  function trace(g, rings) {
    for (const off of [-W, 0, W]) {
      for (const ring of rings) {
        let prev = ring[0][0], acc = 0;
        ring.forEach(([lon, lat], i) => {
          if (i) { const d = lon - prev; if (d > 180) acc -= 360; else if (d < -180) acc += 360; }
          prev = lon;
          const px = x(lon + acc) + off, py = y(lat);
          i ? g.lineTo(px, py) : g.moveTo(px, py);
        });
        g.closePath();
      }
    }
  }
  function draw() {
    if (!countries) return;
    const p = PAL[theme];
    const c = colorCanvas.getContext('2d'), gl = glowCanvas.getContext('2d');
    c.fillStyle = p.ocean; c.fillRect(0, 0, W, H);
    gl.fillStyle = '#000'; gl.fillRect(0, 0, W, H);
    c.lineWidth = W / 2400; c.strokeStyle = p.border;
    for (const f of countries) {
      const polys = f.geometry?.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry?.coordinates || [];
      const fill = livedSet.has(f.id) ? p.lived : visitedSet.has(f.id) ? p.visited : p.land;
      c.beginPath(); polys.forEach((rings) => trace(c, rings));
      c.fillStyle = fill; c.fill('evenodd'); c.stroke();
      if (livedSet.has(f.id) || visitedSet.has(f.id)) {
        gl.beginPath(); polys.forEach((rings) => trace(gl, rings));
        gl.fillStyle = livedSet.has(f.id) ? 'rgba(255,90,60,0.55)' : 'rgba(200,70,55,0.3)';
        gl.fill('evenodd');
      }
    }
    colorTex.needsUpdate = glowTex.needsUpdate = true;
  }

  // Map data is a separate chunk so the page paints before it arrives.
  import('world-atlas/countries-110m.json').then((m) => {
    const topo = m.default || m;
    countries = feature(topo, topo.objects.countries).features;
    draw();
  });

  return {
    group, halo, R,
    ll: (lat, lon, r = R) => ll(lat, lon, r),
    setTheme(night) {
      theme = night ? 'dark' : 'light';
      gridMat.color.set(PAL[theme].grid);
      mat.emissiveIntensity = night ? 0.9 : 0.25;
      draw();
    },
  };
}
