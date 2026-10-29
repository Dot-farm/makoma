import * as THREE from 'three';

const BEAD_COUNT = 6;
const PALETTE = [0xb9ccd7, 0x141a18, 0xd8e2e0, 0x111716, 0xc5d7de, 0x18201e];

export class BeadScene {
  constructor(canvas, onSelect) {
    this.canvas = canvas;
    this.onSelect = onSelect;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.visible = true;
    this.dragging = false;
    this.pointer = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.pickables = [];
    this.beads = [];
    this.activeIndex = 0;
    this.targetRotationX = -0.16;
    this.targetRotationY = -0.08;
    this.frame = 0;
    this.lastFrame = 0;
    this.animationClock = new THREE.Clock();

    try {
      this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch (error) {
      canvas.closest('.viewer-stage')?.classList.add('viewer-stage--fallback');
      return;
    }

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
    this.camera.position.set(0, 0.1, 8.8);
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.addLighting();
    this.addAtmosphere();
    this.addBracelet();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas.parentElement);
    this.resize();
    this.bindPointer();
    this.observer = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      if (this.visible) this.requestRender();
    }, { rootMargin: '100px' });
    this.observer.observe(canvas);
    this.requestRender();
  }

  addLighting() {
    this.scene.add(new THREE.HemisphereLight(0xe8f2f3, 0x151c1a, 2.0));
    const key = new THREE.DirectionalLight(0xfff4df, 3.2);
    key.position.set(-3.5, 5, 6);
    this.scene.add(key);
    const rim = new THREE.PointLight(0x8ab5cc, 24, 15, 2);
    rim.position.set(4, 1.8, -2.5);
    this.scene.add(rim);
    const warm = new THREE.PointLight(0xc59863, 12, 12, 2);
    warm.position.set(-4, -2.2, 1);
    this.scene.add(warm);
  }

  addAtmosphere() {
    const dustGeometry = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < 56; i += 1) {
      const angle = (i / 56) * Math.PI * 2;
      const radius = 2.75 + (i % 5) * 0.17;
      positions.push(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.72, -0.55 - (i % 4) * 0.25);
    }
    dustGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const dustMaterial = new THREE.PointsMaterial({ color: 0xc7d9d5, size: 0.018, transparent: true, opacity: 0.58, sizeAttenuation: true });
    this.scene.add(new THREE.Points(dustGeometry, dustMaterial));

    const ambientRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.45, 0.006, 5, 144),
      new THREE.MeshBasicMaterial({ color: 0xa6bcb7, transparent: true, opacity: 0.2 }),
    );
    ambientRing.scale.y = 0.73;
    ambientRing.position.z = -0.4;
    this.group.add(ambientRing);
  }

  addBracelet() {
    const curvePoints = [];
    const radiusX = 2.05;
    const radiusY = 1.38;
    for (let i = 0; i <= 120; i += 1) {
      const angle = (i / 120) * Math.PI * 2;
      curvePoints.push(new THREE.Vector3(Math.cos(angle) * radiusX, Math.sin(angle) * radiusY, 0));
    }
    const cordCurve = new THREE.CatmullRomCurve3(curvePoints);
    const cord = new THREE.Mesh(
      new THREE.TubeGeometry(cordCurve, 180, 0.075, 10, false),
      new THREE.MeshStandardMaterial({ color: 0x222725, roughness: 0.92, metalness: 0.02 }),
    );
    this.group.add(cord);

    for (let index = 0; index < BEAD_COUNT; index += 1) {
      const angle = (index / BEAD_COUNT) * Math.PI * 2 - Math.PI / 2;
      const beadGroup = new THREE.Group();
      beadGroup.position.set(Math.cos(angle) * radiusX, Math.sin(angle) * radiusY, Math.sin(angle * 2) * 0.06);
      beadGroup.rotation.z = angle + Math.PI / 2;
      beadGroup.userData.beadIndex = index;

      const bead = new THREE.Mesh(
        new THREE.SphereGeometry(0.365, 48, 32),
        new THREE.MeshPhysicalMaterial({
          color: PALETTE[index],
          roughness: index % 2 === 0 ? 0.28 : 0.36,
          metalness: 0.04,
          clearcoat: 0.76,
          clearcoatRoughness: 0.24,
          emissive: new THREE.Color(0x000000),
        }),
      );
      bead.scale.set(1, 0.92, 0.78);
      bead.userData.beadIndex = index;
      beadGroup.add(bead);
      this.pickables.push(bead);

      const inset = new THREE.Mesh(
        new THREE.CircleGeometry(0.105, 36),
        new THREE.MeshStandardMaterial({ color: 0xc6a36f, roughness: 0.55, metalness: 0.62, emissive: 0x291e0e, emissiveIntensity: 0.28 }),
      );
      inset.position.z = 0.286;
      beadGroup.add(inset);
      const fineRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.129, 0.009, 6, 40),
        new THREE.MeshStandardMaterial({ color: 0xe1c18d, roughness: 0.42, metalness: 0.72 }),
      );
      fineRing.position.z = 0.28;
      beadGroup.add(fineRing);

      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(0.47, 0.015, 6, 48),
        new THREE.MeshBasicMaterial({ color: 0xd9bf95, transparent: true, opacity: 0 }),
      );
      halo.position.z = -0.08;
      beadGroup.add(halo);
      beadGroup.userData.halo = halo;
      beadGroup.userData.bead = bead;
      this.beads.push(beadGroup);
      this.group.add(beadGroup);
    }
    this.setActive(0);
  }

  bindPointer() {
    this.pointerDown = (event) => {
      this.dragging = true;
      this.canvas.classList.add('is-dragging');
      this.dragStartX = event.clientX;
      this.dragStartY = event.clientY;
      this.dragMoved = false;
      this.previousX = event.clientX;
      this.previousY = event.clientY;
      this.canvas.setPointerCapture?.(event.pointerId);
    };
    this.pointerMove = (event) => {
      this.setPointerFromEvent(event);
      if (this.dragging) {
        const dx = event.clientX - this.previousX;
        const dy = event.clientY - this.previousY;
        if (Math.abs(event.clientX - this.dragStartX) + Math.abs(event.clientY - this.dragStartY) > 5) this.dragMoved = true;
        this.targetRotationY += dx * 0.008;
        this.targetRotationX += dy * 0.006;
        this.targetRotationX = THREE.MathUtils.clamp(this.targetRotationX, -0.8, 0.8);
        this.previousX = event.clientX;
        this.previousY = event.clientY;
      }
      this.setHoverState();
      this.requestRender();
    };
    this.pointerUp = (event) => {
      if (!this.dragging) return;
      this.dragging = false;
      this.canvas.classList.remove('is-dragging');
      if (!this.dragMoved) {
        this.setPointerFromEvent(event);
        const bead = this.intersectedBead();
        if (bead) this.onSelect?.(bead.userData.beadIndex);
      }
      this.requestRender();
    };
    this.pointerLeave = () => {
      if (!this.dragging) this.canvas.classList.remove('is-hovering');
    };
    this.canvas.addEventListener('pointerdown', this.pointerDown);
    this.canvas.addEventListener('pointermove', this.pointerMove);
    this.canvas.addEventListener('pointerup', this.pointerUp);
    this.canvas.addEventListener('pointercancel', this.pointerUp);
    this.canvas.addEventListener('pointerleave', this.pointerLeave);
  }

  setPointerFromEvent(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  intersectedBead() {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const matches = this.raycaster.intersectObjects(this.pickables, false);
    return matches[0]?.object ?? null;
  }

  setHoverState() {
    const bead = this.intersectedBead();
    this.canvas.classList.toggle('is-hovering', Boolean(bead));
  }

  setActive(index) {
    this.activeIndex = index;
    this.beads.forEach((beadGroup, beadIndex) => {
      const isActive = beadIndex === index;
      beadGroup.userData.halo.material.opacity = isActive ? 0.78 : 0;
      beadGroup.userData.halo.scale.setScalar(isActive ? 1 : 0.9);
      beadGroup.userData.bead.material.emissive.setHex(isActive ? 0x11170f : 0x000000);
    });
    this.requestRender();
  }

  resize() {
    if (!this.renderer) return;
    const width = Math.max(1, this.canvas.parentElement.clientWidth);
    const height = Math.max(1, this.canvas.parentElement.clientHeight);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.position.z = width < 500 ? 9.9 : 8.8;
    this.camera.updateProjectionMatrix();
    this.requestRender();
  }

  requestRender() {
    if (!this.renderer || !this.visible || this.frame) return;
    this.frame = requestAnimationFrame((time) => this.render(time));
  }

  render(time = 0) {
    this.frame = 0;
    if (!this.renderer || !this.visible) return;
    const elapsed = this.animationClock.getElapsedTime();
    const delta = Math.min((time - this.lastFrame) / 1000 || 0, 0.05);
    this.lastFrame = time;

    if (!this.reducedMotion && !this.dragging) {
      this.targetRotationY -= delta * 0.055;
    }
    this.group.rotation.y = THREE.MathUtils.damp(this.group.rotation.y, this.targetRotationY, 2.8, delta);
    this.group.rotation.x = THREE.MathUtils.damp(this.group.rotation.x, this.targetRotationX + (this.reducedMotion ? 0 : Math.sin(elapsed * 0.42) * 0.025), 2.8, delta);
    this.group.position.y = this.reducedMotion ? 0 : Math.sin(elapsed * 0.64) * 0.045;
    this.beads.forEach((bead, index) => {
      const isActive = index === this.activeIndex;
      const targetScale = isActive ? 1.045 : 1;
      bead.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.06);
    });
    this.renderer.render(this.scene, this.camera);
    if (!this.reducedMotion) this.requestRender();
  }
}
