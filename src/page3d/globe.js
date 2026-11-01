// A globe with real country shapes (Natural Earth 1:110m via world-atlas), drawn onto an
// equirectangular canvas texture. Lived/visited countries are filled and glow through the emissive map.
import * as THREE from 'three';
import { feature } from 'topojson-client';

const PAL = {
  dark: {
    ocean: '#070609',
    land: '#161318',
    landBorder: 'rgba(240,235,227,0.1)',
    graticule: 'rgba(240,235,227,0.025)',
    livedFill: 'rgba(194,59,59,0.5)',
    livedStroke: '#e63946',
    visitedFill: 'rgba(212,175,55,0.3)',
    visitedStroke: '#d4af37',
    grid: 0xf2ece4
  },
  light: {
    ocean: '#ded7ce',
    land: '#ebe3d8',
    landBorder: 'rgba(27,23,21,0.18)',
    graticule: 'rgba(27,23,21,0.035)',
    livedFill: 'rgba(180,45,45,0.6)',
    livedStroke: '#c23b3b',
    visitedFill: 'rgba(180,140,40,0.4)',
    visitedStroke: '#a88220',
    grid: 0x1b1715
  },
};

// lat/lon → point on a sphere of radius r, with lon 0 facing +Z (matches the texture offset below).
export function ll(lat, lon, r) {
  const la = THREE.MathUtils.degToRad(lat), lo = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(Math.cos(la) * Math.sin(lo) * r, Math.sin(la) * r, Math.cos(la) * Math.cos(lo) * r);
}

// Compute centroid of polygon coords to filter mainland France
function polyCentroid(coords) {
  let cx = 0, cy = 0, count = 0;
  for (const [x, y] of coords) { cx += x; cy += y; count++; }
  return [cx / count, cy / count];
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

  const mat = new THREE.MeshStandardMaterial({
    map: colorTex,
    emissiveMap: glowTex,
    emissive: 0xffffff,
    emissiveIntensity: 0.95,
    roughness: 0.8,
    metalness: 0.05
  });
  group.add(new THREE.Mesh(new THREE.SphereGeometry(R, 96, 64), mat));
  const halo = new THREE.Mesh(new THREE.SphereGeometry(R * 1.055, 48, 32), new THREE.MeshBasicMaterial({ color: 0xd24a4a, transparent: true, opacity: 0.09, side: THREE.BackSide }));
  group.add(halo);

  const livedSet = new Set(lived), visitedSet = new Set(visited);
  let countries = null, theme = 'dark';

  const x = (lon) => ((lon + 180) / 360) * W;
  const y = (lat) => ((90 - lat) / 180) * H;

  // Unwrap each ring's longitudes so polygons crossing the antimeridian stay whole,
  // then draw at three horizontal offsets so the wrap is covered.
  function trace(g, rings) {
    for (const off of [-W, 0, W]) {
      for (const ring of rings) {
        if (!ring || ring.length < 3) continue;
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

    // 1. Base ocean
    c.fillStyle = p.ocean; c.fillRect(0, 0, W, H);
    gl.fillStyle = '#000'; gl.fillRect(0, 0, W, H);

    // 2. Graticule lines on map
    c.save();
    c.lineWidth = W / 3200;
    c.strokeStyle = p.graticule;
    for (let lat = -80; lat <= 80; lat += 20) {
      c.beginPath();
      c.moveTo(0, y(lat));
      c.lineTo(W, y(lat));
      c.stroke();
    }
    for (let lon = -180; lon < 180; lon += 20) {
      c.beginPath();
      c.moveTo(x(lon), 0);
      c.lineTo(x(lon), H);
      c.stroke();
    }
    c.restore();

    // 3. Draw standard neutral land
    c.lineWidth = W / 2600;
    c.strokeStyle = p.landBorder;
    c.fillStyle = p.land;

    for (const f of countries) {
      if (livedSet.has(f.id) || visitedSet.has(f.id)) continue;
      const polys = f.geometry?.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry?.coordinates || [];
      c.beginPath();
      polys.forEach((rings) => trace(c, rings));
      c.fill('evenodd');
      c.stroke();
    }

    // 4. Draw highlighted countries with mainland filtering for France ('250')
    for (const f of countries) {
      const isLived = livedSet.has(f.id);
      const isVisited = visitedSet.has(f.id);
      if (!isLived && !isVisited) continue;

      let polys = f.geometry?.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry?.coordinates || [];

      // Filter France to European mainland (exclude French Guiana in South America)
      if (f.id === '250') {
        polys = polys.filter((ringGroup) => {
          const outerRing = ringGroup[0] || [];
          const [lon, lat] = polyCentroid(outerRing);
          return lat > 40 && lat < 55 && lon > -6 && lon < 11;
        });
      }

      const fillColor = isLived ? p.livedFill : p.visitedFill;
      const strokeColor = isLived ? p.livedStroke : p.visitedStroke;

      // Color texture
      c.save();
      c.beginPath();
      polys.forEach((rings) => trace(c, rings));
      c.fillStyle = fillColor;
      c.fill('evenodd');
      c.lineWidth = isLived ? W / 1400 : W / 1800;
      c.strokeStyle = strokeColor;
      c.stroke();
      c.restore();

      // Emissive Glow texture
      gl.save();
      gl.beginPath();
      polys.forEach((rings) => trace(gl, rings));
      gl.fillStyle = isLived ? 'rgba(255, 68, 68, 0.9)' : 'rgba(212, 175, 55, 0.7)';
      gl.fill('evenodd');
      gl.lineWidth = isLived ? W / 1200 : W / 1600;
      gl.strokeStyle = isLived ? '#ff6655' : '#e5c158';
      gl.stroke();
      gl.restore();
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
      mat.emissiveIntensity = night ? 0.95 : 0.3;
      draw();
    },
  };
}
