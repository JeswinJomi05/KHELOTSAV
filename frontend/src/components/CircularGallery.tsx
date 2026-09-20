import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform, Raycast, Vec2 } from 'ogl';
import { useEffect, useRef } from 'react';

type GL = Renderer['gl'];

function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
    let timeout: number;
    return function (this: any, ...args: Parameters<T>) {
        window.clearTimeout(timeout);
        timeout = window.setTimeout(() => func.apply(this, args), wait);
    };
}

function lerp(p1: number, p2: number, t: number): number {
    return p1 + (p2 - p1) * t;
}

function autoBind(instance: any): void {
    const proto = Object.getPrototypeOf(instance);
    Object.getOwnPropertyNames(proto).forEach(key => {
        if (key !== 'constructor' && typeof instance[key] === 'function') {
            instance[key] = instance[key].bind(instance);
        }
    });
}

const DEFAULT_FONT = 'bold 30px Figtree';
const DEFAULT_FONT_URL = 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;700&display=swap';

function deriveFontFamilyFromUrl(url: string): string {
    const fileName = (url.split('/').pop() || 'custom-font').split('?')[0];
    const base = fileName.replace(/\.(woff2?|ttf|otf|eot)$/i, '');
    return base.replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'CircularGalleryFont';
}

async function loadFontFromStylesheet(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch font stylesheet (${response.status})`);
    const cssText = await response.text();
    const faceBlocks = cssText.match(/@font-face\s*{[^}]*}/g) || [];
    let family: string | null = null;
    const fontFaces: FontFace[] = [];
    for (const block of faceBlocks) {
        const familyMatch = block.match(/font-family:\s*['"]?([^;'"]+)['"]?/);
        const urlMatch = block.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/);
        if (!familyMatch || !urlMatch) continue;
        family = familyMatch[1].trim();
        const descriptors: FontFaceDescriptors = {};
        const weightMatch = block.match(/font-weight:\s*([^;]+);/);
        const styleMatch = block.match(/font-style:\s*([^;]+);/);
        const rangeMatch = block.match(/unicode-range:\s*([^;]+);/);
        if (weightMatch) descriptors.weight = weightMatch[1].trim();
        if (styleMatch) descriptors.style = styleMatch[1].trim();
        if (rangeMatch) descriptors.unicodeRange = rangeMatch[1].trim();
        fontFaces.push(new FontFace(family, `url(${urlMatch[1]})`, descriptors));
    }
    if (!family) throw new Error('No @font-face rule found in the stylesheet');
    await Promise.allSettled(
        fontFaces.map(async face => {
            await face.load();
            document.fonts.add(face);
        })
    );
    return family;
}

async function loadFontFromFile(url: string): Promise<string> {
    const family = deriveFontFamilyFromUrl(url);
    const fontFace = new FontFace(family, `url(${url})`);
    await fontFace.load();
    document.fonts.add(fontFace);
    return family;
}

async function loadCustomFont(fontUrl: string): Promise<string> {
    const isStylesheet = fontUrl.includes('fonts.googleapis.com') || /\.css(\?.*)?$/i.test(fontUrl);
    return isStylesheet ? loadFontFromStylesheet(fontUrl) : loadFontFromFile(fontUrl);
}

async function resolveFont(font: string, fontUrl?: string): Promise<string> {
    const effectiveUrl = fontUrl || (font === DEFAULT_FONT ? DEFAULT_FONT_URL : null);
    if (!effectiveUrl) {
        if (document.fonts && document.fonts.load) {
            try {
                await document.fonts.load(font);
                await document.fonts.ready;
            } catch {
                // Ignore – fall back
            }
        }
        return font;
    }
    try {
        const family = await loadCustomFont(effectiveUrl);
        const sizeMatch = font.match(/^\s*(.*?\d+px)/);
        const prefix = sizeMatch ? sizeMatch[1].trim() : 'bold 30px';
        const resolved = `${prefix} "${family}"`;
        if (document.fonts && document.fonts.load) {
            try {
                await document.fonts.load(resolved);
            } catch {
                // Ignore
            }
        }
        return resolved;
    } catch (error) {
        console.error('CircularGallery: unable to load font from', fontUrl, error);
        return font;
    }
}

function getFontSize(font: string): number {
    const match = font.match(/(\d+)px/);
    return match ? parseInt(match[1], 10) : 30;
}

function createTextTexture(
    gl: GL,
    text: string,
    font: string = 'bold 30px monospace',
    color: string = 'black'
): { texture: Texture; width: number; height: number } {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2d context');

    context.font = font;
    const metrics = context.measureText(text);
    const textWidth = Math.ceil(metrics.width);
    const fontSize = getFontSize(font);
    const textHeight = Math.ceil(fontSize * 1.2);

    canvas.width = textWidth + 30;
    canvas.height = textHeight + 20;

    context.font = font;
    context.fillStyle = color;
    context.textBaseline = 'middle';
    context.textAlign = 'center';
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new Texture(gl, { generateMipmaps: false });
    texture.image = canvas;
    return { texture, width: canvas.width, height: canvas.height };
}

interface TitleProps {
    gl: GL;
    plane: Mesh;
    renderer: Renderer;
    text: string;
    textColor?: string;
    font?: string;
}

class Title {
    gl: GL;
    plane: Mesh;
    renderer: Renderer;
    text: string;
    textColor: string;
    font: string;
    mesh!: Mesh;
    program!: Program;

    constructor({ gl, plane, renderer, text, textColor = '#ffffff', font = '30px sans-serif' }: TitleProps) {
        autoBind(this);
        this.gl = gl;
        this.plane = plane;
        this.renderer = renderer;
        this.text = text;
        this.textColor = textColor;
        this.font = font;
        this.createMesh();
    }

    createMesh() {
        const { texture, width, height } = createTextTexture(this.gl, this.text, this.font, this.textColor);

        const geometry = new Plane(this.gl);
        const program = new Program(this.gl, {
            vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
            fragment: `
        precision highp float;
        uniform sampler2D tMap;
        uniform float uFocus;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.05) discard;
          float alpha = color.a * (0.4 + 0.6 * uFocus);
          gl_FragColor = vec4(color.rgb, alpha);
        }
      `,
            uniforms: {
                tMap: { value: texture },
                uFocus: { value: 1.0 }
            },
            transparent: true,
            cullFace: null
        });
        this.program = program;
        this.mesh = new Mesh(this.gl, { geometry, program });
        const aspect = width / height;
        const textHeightScaled = this.plane.scale.y * 0.15;
        const textWidthScaled = textHeightScaled * aspect;
        this.mesh.scale.set(textWidthScaled, textHeightScaled, 1);
        this.mesh.position.y = -0.51 - textHeightScaled * 0.3;
        this.mesh.setParent(this.plane);
    }
}

interface ScreenSize {
    width: number;
    height: number;
}

interface Viewport {
    width: number;
    height: number;
}

export interface GalleryItem {
    image: string;
    text: string;
    guideline?: string;
}

interface MediaProps {
    geometry: Plane;
    gl: GL;
    image: string;
    guideline?: string;
    index: number;
    length: number;
    renderer: Renderer;
    scene: Transform;
    screen: ScreenSize;
    text: string;
    viewport: Viewport;
    bend: number;
    textColor: string;
    borderRadius?: number;
    font?: string;
}

class Media {
    extra: number = 0;
    geometry: Plane;
    gl: GL;
    image: string;
    guideline?: string;
    index: number;
    length: number;
    renderer: Renderer;
    scene: Transform;
    screen: ScreenSize;
    text: string;
    viewport: Viewport;
    bend: number;
    textColor: string;
    borderRadius: number;
    font?: string;
    program!: Program;
    plane!: Mesh;
    title!: Title;
    scale!: number;
    padding!: number;
    width!: number;
    widthTotal!: number;
    x!: number;
    speed: number = 0;
    isBefore: boolean = false;
    isAfter: boolean = false;
    baseScaleX: number = 0;
    baseScaleY: number = 0;
    focus: number = 0;
    isFlipped: boolean = false;
    flipProgress: number = 0;
    flipTarget: number = 0;

    constructor({
        geometry,
        gl,
        image,
        guideline,
        index,
        length,
        renderer,
        scene,
        screen,
        text,
        viewport,
        bend,
        textColor,
        borderRadius = 0,
        font
    }: MediaProps) {
        this.geometry = geometry;
        this.gl = gl;
        this.image = image;
        this.guideline = guideline;
        this.index = index;
        this.length = length;
        this.renderer = renderer;
        this.scene = scene;
        this.screen = screen;
        this.text = text;
        this.viewport = viewport;
        this.bend = bend;
        this.textColor = textColor;
        this.borderRadius = borderRadius;
        this.font = font;
        this.createShader();
        this.createMesh();
        this.createTitle();
        this.onResize();
    }

    toggleFlip() {
        if (!this.guideline) return;
        this.isFlipped = !this.isFlipped;
        this.flipTarget = this.isFlipped ? 1 : 0;
    }

    createShader() {
        const texture = new Texture(this.gl, {
            generateMipmaps: true
        });
        const guidelineTexture = new Texture(this.gl, {
            generateMipmaps: true
        });
        this.program = new Program(this.gl, {
            depthTest: false,
            depthWrite: false,
            cullFace: null,
            vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.1 + uSpeed * 0.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
            fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uGuidelineSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform sampler2D tGuideline;
        uniform float uBorderRadius;
        uniform float uFocus;
        uniform float uFlipProgress;
        uniform float uHasGuideline;
        varying vec2 vUv;
        
        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }
        
        void main() {
          bool isBack = !gl_FrontFacing || uFlipProgress > 0.5;
          vec2 currentUv = vUv;
          if (isBack) {
            currentUv.x = 1.0 - currentUv.x;
          }

          vec2 activeSizes = (isBack && uHasGuideline > 0.5 && uGuidelineSizes.x > 0.0) ? uGuidelineSizes : uImageSizes;
          
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (activeSizes.x / activeSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (activeSizes.y / activeSizes.x), 1.0)
          );
          vec2 uv = vec2(
            currentUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            currentUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );

          vec4 color;
          if (isBack && uHasGuideline > 0.5) {
            color = texture2D(tGuideline, uv);
          } else {
            color = texture2D(tMap, uv);
          }
          
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          
          float edgeSmooth = 0.002;
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);
          
          float brightness = 0.60 + 0.40 * uFocus;
          float finalAlpha = alpha * (0.65 + 0.35 * uFocus);
          
          vec3 focusedColor = color.rgb * brightness;

          float borderDist = abs(d + 0.007);
          float border = (1.0 - smoothstep(0.0, 0.008, borderDist)) * uFocus;
          vec3 finalColor = mix(focusedColor, vec3(1.0, 0.88, 0.4), border * 0.75);

          gl_FragColor = vec4(finalColor, finalAlpha);
        }
      `,
            uniforms: {
                tMap: { value: texture },
                tGuideline: { value: guidelineTexture },
                uPlaneSizes: { value: [0, 0] },
                uImageSizes: { value: [0, 0] },
                uGuidelineSizes: { value: [0, 0] },
                uSpeed: { value: 0 },
                uTime: { value: 100 * Math.random() },
                uBorderRadius: { value: this.borderRadius },
                uFocus: { value: 0 },
                uFlipProgress: { value: 0 },
                uHasGuideline: { value: this.guideline ? 1.0 : 0.0 }
            },
            transparent: true
        });

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = this.image;
        img.onload = () => {
            texture.image = img;
            this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
        };

        if (this.guideline) {
            const gImg = new Image();
            gImg.crossOrigin = 'anonymous';
            gImg.src = this.guideline;
            gImg.onload = () => {
                guidelineTexture.image = gImg;
                this.program.uniforms.uGuidelineSizes.value = [gImg.naturalWidth, gImg.naturalHeight];
            };
        }
    }

    createMesh() {
        this.plane = new Mesh(this.gl, {
            geometry: this.geometry,
            program: this.program
        });
        this.plane.setParent(this.scene);
    }

    createTitle() {
        this.title = new Title({
            gl: this.gl,
            plane: this.plane,
            renderer: this.renderer,
            text: this.text,
            textColor: this.textColor,
            font: this.font
        });
    }

    update(scroll: { current: number; last: number }, direction: 'right' | 'left') {
        this.plane.position.x = this.x - scroll.current - this.extra;

        const x = this.plane.position.x;
        const H = this.viewport.width / 2;

        if (this.bend === 0) {
            this.plane.position.y = 0;
            this.plane.rotation.z = 0;
        } else {
            const B_abs = Math.abs(this.bend);
            const R = (H * H + B_abs * B_abs) / (2 * B_abs);
            const effectiveX = Math.min(Math.abs(x), H);

            const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
            if (this.bend > 0) {
                this.plane.position.y = -arc;
                this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
            } else {
                this.plane.position.y = arc;
                this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
            }
        }

        // Animate flip rotation
        this.flipProgress = lerp(this.flipProgress, this.flipTarget, 0.12);
        if (Math.abs(this.flipProgress - this.flipTarget) < 0.001) {
            this.flipProgress = this.flipTarget;
        }
        if (this.program.uniforms.uFlipProgress) {
            this.program.uniforms.uFlipProgress.value = this.flipProgress;
        }

        // Turn around Y axis by 180 deg when flipped
        this.plane.rotation.y = this.flipProgress * Math.PI;

        // Counter-rotate title so it stays facing the camera directly
        if (this.title && this.title.mesh) {
            this.title.mesh.rotation.y = -this.plane.rotation.y;
        }

        // Middle / Focus effect:
        const distNorm = Math.min(Math.abs(x) / (this.width * 1.25), 1.0);
        const focus = 0.5 * (1.0 + Math.cos(Math.PI * distNorm));
        this.focus = focus;

        // Dynamic scale: middle item is ~35% larger and commanding attention
        const scaleFactor = 0.88 + 0.34 * focus;
        this.plane.scale.x = this.baseScaleX * scaleFactor;
        this.plane.scale.y = this.baseScaleY * scaleFactor;
        if (this.program.uniforms.uPlaneSizes) {
            this.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
        }
        if (this.program.uniforms.uFocus) {
            this.program.uniforms.uFocus.value = focus;
        }
        if (this.title && this.title.program && this.title.program.uniforms.uFocus) {
            this.title.program.uniforms.uFocus.value = focus;
        }

        // Bring middle item forward in Z towards camera (camera.position.z = 20)
        // Add subtle elevation during flip to prevent clipping
        const flipLift = Math.sin(this.flipProgress * Math.PI) * 0.6;
        this.plane.position.z = focus * 1.8 + flipLift;

        // Render order ensures focused card and its title render in front of neighboring cards
        this.plane.renderOrder = Math.round(focus * 100);
        if (this.title && this.title.mesh) {
            this.title.mesh.renderOrder = this.plane.renderOrder + 1;
        }

        this.speed = scroll.current - scroll.last;
        this.program.uniforms.uTime.value += 0.04;
        this.program.uniforms.uSpeed.value = this.speed;

        const planeOffset = this.plane.scale.x / 2;
        const viewportOffset = this.viewport.width / 2;
        this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
        this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
        if (direction === 'right' && this.isBefore) {
            this.extra -= this.widthTotal;
            this.isBefore = this.isAfter = false;
        }
        if (direction === 'left' && this.isAfter) {
            this.extra += this.widthTotal;
            this.isBefore = this.isAfter = false;
        }
    }

    onResize({ screen, viewport }: { screen?: ScreenSize; viewport?: Viewport } = {}) {
        if (screen) this.screen = screen;
        if (viewport) {
            this.viewport = viewport;
            if (this.plane.program.uniforms.uViewportSizes) {
                this.plane.program.uniforms.uViewportSizes.value = [this.viewport.width, this.viewport.height];
            }
        }
        this.scale = this.screen.height / 1500;
        this.baseScaleY = (this.viewport.height * (900 * this.scale)) / this.screen.height;
        this.baseScaleX = (this.viewport.width * (700 * this.scale)) / this.screen.width;
        this.plane.scale.y = this.baseScaleY;
        this.plane.scale.x = this.baseScaleX;
        this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
        this.padding = 2;
        this.width = this.baseScaleX + this.padding;
        this.widthTotal = this.width * this.length;
        this.x = this.width * this.index;
    }
}

interface AppConfig {
    items?: GalleryItem[];
    bend?: number;
    textColor?: string;
    borderRadius?: number;
    font?: string;
    scrollSpeed?: number;
    scrollEase?: number;
    onCardFlipped?: (item: GalleryItem | null) => void;
}

class App {
    container: HTMLElement;
    scrollSpeed: number;
    scroll: {
        ease: number;
        current: number;
        target: number;
        last: number;
        position?: number;
    };
    onCheckDebounce: (...args: any[]) => void;
    renderer!: Renderer;
    gl!: GL;
    camera!: Camera;
    scene!: Transform;
    planeGeometry!: Plane;
    medias: Media[] = [];
    mediasImages: GalleryItem[] = [];
    screen!: { width: number; height: number };
    viewport!: { width: number; height: number };
    raf: number = 0;
    onCardFlipped?: (item: GalleryItem | null) => void;

    boundOnResize!: () => void;
    boundOnWheel!: (e: Event) => void;
    boundOnTouchDown!: (e: MouseEvent | TouchEvent) => void;
    boundOnTouchMove!: (e: MouseEvent | TouchEvent) => void;
    boundOnTouchUp!: (e: MouseEvent | TouchEvent) => void;
    boundOnKeyDown!: (e: KeyboardEvent) => void;

    isDown: boolean = false;
    start: number = 0;
    startX: number = 0;
    startY: number = 0;
    hasMoved: boolean = false;

    constructor(
        container: HTMLElement,
        {
            items,
            bend = 1,
            textColor = '#ffffff',
            borderRadius = 0,
            font = 'bold 30px Figtree',
            scrollSpeed = 2,
            scrollEase = 0.05,
            onCardFlipped
        }: AppConfig
    ) {
        document.documentElement.classList.remove('no-js');
        this.container = container;
        this.scrollSpeed = scrollSpeed;
        this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
        this.onCardFlipped = onCardFlipped;
        this.onCheckDebounce = debounce(this.onCheck.bind(this), 200);
        this.createRenderer();
        this.createCamera();
        this.createScene();
        this.onResize();
        this.createGeometry();
        this.createMedias(items, bend, textColor, borderRadius, font);
        this.update();
        this.addEventListeners();
    }

    createRenderer() {
        this.renderer = new Renderer({
            alpha: true,
            antialias: true,
            dpr: Math.min(window.devicePixelRatio || 1, 2)
        });
        this.gl = this.renderer.gl;
        this.container.appendChild(this.gl.canvas as HTMLCanvasElement);
    }

    createCamera() {
        this.camera = new Camera(this.gl);
        this.camera.fov = 45;
        this.camera.position.z = 20;
    }

    createScene() {
        this.scene = new Transform();
    }

    createGeometry() {
        this.planeGeometry = new Plane(this.gl, {
            heightSegments: 50,
            widthSegments: 100
        });
    }

    createMedias(
        items?: GalleryItem[],
        bend: number = 1,
        textColor: string = '#ffffff',
        borderRadius: number = 0,
        font: string = 'bold 30px Figtree'
    ) {
        const defaultItems: GalleryItem[] = [
            { image: 'https://picsum.photos/seed/1/800/600?grayscale', text: 'Bridge' },
            { image: 'https://picsum.photos/seed/2/800/600?grayscale', text: 'Desk Setup' },
            { image: 'https://picsum.photos/seed/3/800/600?grayscale', text: 'Waterfall' },
            { image: 'https://picsum.photos/seed/4/800/600?grayscale', text: 'Strawberries' }
        ];
        const galleryItems = items && items.length ? items : defaultItems;
        this.mediasImages = galleryItems.concat(galleryItems);
        this.medias = this.mediasImages.map((data, index) => {
            return new Media({
                geometry: this.planeGeometry,
                gl: this.gl,
                image: data.image,
                guideline: data.guideline,
                index,
                length: this.mediasImages.length,
                renderer: this.renderer,
                scene: this.scene,
                screen: this.screen,
                text: data.text,
                viewport: this.viewport,
                bend,
                textColor,
                borderRadius,
                font
            });
        });
    }

    updateHoverCursor(clientX: number, clientY: number) {
        if (!this.container) return;
        const rect = this.container.getBoundingClientRect();
        if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) return;

        const clickWorldX = (((clientX - rect.left) / rect.width) * 2 - 1) * (this.viewport.width / 2);
        const isOverCard = this.medias.some(m => {
            const dist = Math.abs(m.plane.position.x - clickWorldX);
            return dist < (m.plane.scale.x * 0.9) / 2;
        });
        this.container.style.cursor = isOverCard ? 'pointer' : 'grab';
    }

    onClick(clientX: number, clientY: number) {
        if (!this.medias || this.medias.length === 0) return;

        const rect = this.container.getBoundingClientRect();
        if (
            clientX < rect.left ||
            clientX > rect.right ||
            clientY < rect.top ||
            clientY > rect.bottom
        ) {
            return;
        }

        const mouse = new Vec2(
            ((clientX - rect.left) / rect.width) * 2 - 1,
            -((clientY - rect.top) / rect.height) * 2 + 1
        );

        let clickedMedia: Media | undefined;

        try {
            const raycast = new Raycast();
            raycast.castMouse(this.camera, mouse);

            const meshes: Mesh[] = [];
            this.medias.forEach(m => {
                if (m.plane) meshes.push(m.plane);
                if (m.title && m.title.mesh) meshes.push(m.title.mesh);
            });

            const hits = raycast.intersectMeshes(meshes);
            if (hits && hits.length > 0) {
                const hitMesh = hits[0];
                clickedMedia = this.medias.find(
                    m => m.plane === hitMesh || (m.title && m.title.mesh === hitMesh)
                );
            }
        } catch (e) {
            // fallback if raycast throws
        }

        // Fallback: screen proximity
        if (!clickedMedia) {
            const clickWorldX = (mouse[0] * this.viewport.width) / 2;
            let closestDist = Infinity;
            this.medias.forEach(m => {
                const dist = Math.abs(m.plane.position.x - clickWorldX);
                const halfWidth = (m.plane.scale.x * 1.1) / 2;
                if (dist < halfWidth && dist < closestDist) {
                    closestDist = dist;
                    clickedMedia = m;
                }
            });

            if (!clickedMedia) {
                this.medias.forEach(m => {
                    const dist = Math.abs(m.plane.position.x - clickWorldX);
                    if (dist < closestDist) {
                        closestDist = dist;
                        clickedMedia = m;
                    }
                });
            }
        }

        if (!clickedMedia) return;

        const willBeFlipped = !clickedMedia.isFlipped;

        // Sync all duplicates of this sport & flip back other sports
        this.medias.forEach(m => {
            if (m.text === clickedMedia!.text) {
                if (m.isFlipped !== willBeFlipped) {
                    m.toggleFlip();
                }
            } else if (m.isFlipped) {
                m.toggleFlip();
            }
        });

        // Smoothly center the clicked card
        this.scroll.target = clickedMedia.x - clickedMedia.extra;

        if (this.onCardFlipped) {
            this.onCardFlipped(willBeFlipped ? {
                image: clickedMedia.image,
                text: clickedMedia.text,
                guideline: clickedMedia.guideline
            } : null);
        }
    }

    onTouchDown(e: MouseEvent | TouchEvent) {
        this.isDown = true;
        this.hasMoved = false;
        this.scroll.position = this.scroll.current;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        this.start = clientX;
        this.startX = clientX;
        this.startY = clientY;
        this.container.style.cursor = 'grabbing';
    }

    onTouchMove(e: MouseEvent | TouchEvent) {
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        if (this.isDown) {
            if (Math.hypot(clientX - this.startX, clientY - this.startY) > 6) {
                this.hasMoved = true;
            }
            const distance = (this.start - clientX) * (this.scrollSpeed * 0.025);
            this.scroll.target = (this.scroll.position ?? 0) + distance;
        } else {
            this.updateHoverCursor(clientX, clientY);
        }
    }

    onTouchUp(e: MouseEvent | TouchEvent) {
        if (!this.isDown) return;
        this.isDown = false;
        this.container.style.cursor = 'grab';

        const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
        const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY;

        if (!this.hasMoved) {
            this.onClick(clientX ?? this.startX, clientY ?? this.startY);
        } else {
            this.onCheck();
        }
    }

    onWheel(e: Event) {
        const wheelEvent = e as WheelEvent;
        const delta = wheelEvent.deltaY || (wheelEvent as any).wheelDelta || (wheelEvent as any).detail;
        this.scroll.target += (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2;
        this.onCheckDebounce();
    }

    onKeyDown(e: KeyboardEvent) {
        switch (e.key) {
            case 'ArrowRight':
                e.preventDefault();
                this.scroll.target += this.scrollSpeed * 5;
                this.onCheckDebounce();
                break;

            case 'ArrowLeft':
                e.preventDefault();
                this.scroll.target -= this.scrollSpeed * 5;
                this.onCheckDebounce();
                break;
        }
    }

    onCheck() {
        if (!this.medias || !this.medias[0]) return;
        const width = this.medias[0].width;
        const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
        const item = width * itemIndex;
        this.scroll.target = this.scroll.target < 0 ? -item : item;
    }

    onResize() {
        this.screen = {
            width: this.container.clientWidth,
            height: this.container.clientHeight
        };
        this.renderer.setSize(this.screen.width, this.screen.height);
        this.camera.perspective({
            aspect: this.screen.width / this.screen.height
        });
        const fov = (this.camera.fov * Math.PI) / 180;
        const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
        const width = height * this.camera.aspect;
        this.viewport = { width, height };
        if (this.medias) {
            this.medias.forEach(media => media.onResize({ screen: this.screen, viewport: this.viewport }));
        }
    }

    update() {
        this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
        const direction = this.scroll.current > this.scroll.last ? 'right' : 'left';
        if (this.medias) {
            this.medias.forEach(media => media.update(this.scroll, direction));
        }
        this.renderer.render({ scene: this.scene, camera: this.camera });
        this.scroll.last = this.scroll.current;
        this.raf = window.requestAnimationFrame(this.update.bind(this));
    }

    addEventListeners() {
        this.boundOnResize = this.onResize.bind(this);
        this.boundOnWheel = this.onWheel.bind(this);
        this.boundOnTouchDown = this.onTouchDown.bind(this);
        this.boundOnTouchMove = this.onTouchMove.bind(this);
        this.boundOnTouchUp = this.onTouchUp.bind(this);
        this.boundOnKeyDown = this.onKeyDown.bind(this);

        window.addEventListener('resize', this.boundOnResize);
        window.addEventListener('mousewheel', this.boundOnWheel);
        window.addEventListener('wheel', this.boundOnWheel);
        window.addEventListener('mousedown', this.boundOnTouchDown);
        window.addEventListener('mousemove', this.boundOnTouchMove);
        window.addEventListener('mouseup', this.boundOnTouchUp);
        window.addEventListener('touchstart', this.boundOnTouchDown);
        window.addEventListener('touchmove', this.boundOnTouchMove);
        window.addEventListener('touchend', this.boundOnTouchUp);

        this.container?.addEventListener('keydown', this.boundOnKeyDown);
    }

    destroy() {
        window.cancelAnimationFrame(this.raf);
        window.removeEventListener('resize', this.boundOnResize);
        window.removeEventListener('mousewheel', this.boundOnWheel);
        window.removeEventListener('wheel', this.boundOnWheel);
        window.removeEventListener('mousedown', this.boundOnTouchDown);
        window.removeEventListener('mousemove', this.boundOnTouchMove);
        window.removeEventListener('mouseup', this.boundOnTouchUp);
        window.removeEventListener('touchstart', this.boundOnTouchDown);
        window.removeEventListener('touchmove', this.boundOnTouchMove);
        window.removeEventListener('touchend', this.boundOnTouchUp);
        if (this.renderer && this.renderer.gl && this.renderer.gl.canvas.parentNode) {
            this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas as HTMLCanvasElement);
        }
        if (this.container) {
            this.container.removeEventListener('keydown', this.boundOnKeyDown);
        }
    }
}

interface CircularGalleryProps {
    items?: GalleryItem[];
    bend?: number;
    textColor?: string;
    borderRadius?: number;
    font?: string;
    fontUrl?: string;
    scrollSpeed?: number;
    scrollEase?: number;
}

export default function CircularGallery({
    items,
    bend = 3,
    textColor = '#ffffff',
    borderRadius = 0.05,
    font = 'bold 30px Figtree',
    fontUrl,
    scrollSpeed = 2,
    scrollEase = 0.05
}: CircularGalleryProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        let app: App | undefined;
        let isMounted = true;
        resolveFont(font, fontUrl).then(resolvedFont => {
            if (!isMounted || !containerRef.current) return;
            app = new App(containerRef.current, {
                items,
                bend,
                textColor,
                borderRadius,
                font: resolvedFont,
                scrollSpeed,
                scrollEase
            });
        });
        return () => {
            isMounted = false;
            if (app) app.destroy();
        };
    }, [items, bend, textColor, borderRadius, font, fontUrl, scrollSpeed, scrollEase]);

    return (
        <div
            className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
            ref={containerRef}
            tabIndex={0}
            role="region"
            aria-label="Circular image gallery. Click any card to turn and view guidelines. Use Left and Right Arrow keys to navigate."
        />
    );
}
