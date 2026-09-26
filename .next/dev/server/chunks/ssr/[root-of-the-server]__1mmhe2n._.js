module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[project]/src/components/FluidCursorRipple.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FluidCursorRipple
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.module.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$lib$2f$shaders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/lib/shaders.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function FluidCursorRipple() {
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const container = containerRef.current;
        if (!container) return;
        // Skip the effect entirely for users who've asked for reduced motion —
        // also a free performance win since nothing mounts at all.
        if (("TURBOPACK compile-time value", "undefined") !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) //TURBOPACK unreachable
        ;
        // ─── Configuration ──────────────────────────────────────────────
        const isMobile = ("TURBOPACK compile-time value", "undefined") !== 'undefined' && (window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent));
        // Trimmed a bit further (was 256/128) — this is a soft, blurred ripple,
        // not a detail surface, so the resolution drop is not perceptible.
        const SIM_SIZE = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : 192;
        const WAVE_SPEED = 1.42;
        // Faster decay (was 0.985) so ripples settle quickly instead of lingering/building up —
        // reads as calmer and more premium rather than chaotic, per client feedback.
        const DAMPING = 0.975;
        const BRUSH_RADIUS = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : 0.04;
        // Reduced cap (was 0.35) — client asked for the mouse-driven movement to feel
        // more subtle and premium rather than intense.
        const MAX_STRENGTH = 0.2;
        const MOUSE_LERP = 0.18;
        const width = window.innerWidth;
        const height = window.innerHeight;
        // ─── Renderer ───────────────────────────────────────────────────
        const renderer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["WebGLRenderer"]({
            alpha: true,
            antialias: false,
            powerPreference: 'high-performance'
        });
        // The final composite pass is a full-viewport shader, so DPR directly
        // multiplies its fragment cost — dropped to the practical floor of 1.0
        // (native resolution, no supersampling), matching what mobile already uses.
        renderer.setPixelRatio(1.0);
        renderer.setSize(width, height);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);
        // ─── Scenes & Camera ────────────────────────────────────────────
        const simScene = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Scene"]();
        const renderScene = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Scene"]();
        const camera = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OrthographicCamera"](-1, 1, 1, -1, 0, 1);
        const planeGeo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PlaneGeometry"](2, 2);
        // ─── Render Targets (ping-pong) ─────────────────────────────────
        // Only .r/.g are ever read (see waveSimulationShader) — half-float has
        // ample precision for a damped height field and halves texture bandwidth
        // versus the previous full FloatType targets.
        const rtOptions = {
            minFilter: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LinearFilter"],
            magFilter: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LinearFilter"],
            format: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RGBAFormat"],
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HalfFloatType"],
            wrapS: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ClampToEdgeWrapping"],
            wrapT: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ClampToEdgeWrapping"]
        };
        let targetA = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WebGLRenderTarget"](SIM_SIZE, SIM_SIZE, rtOptions);
        let targetB = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WebGLRenderTarget"](SIM_SIZE, SIM_SIZE, rtOptions);
        // ─── Mouse State ────────────────────────────────────────────────
        const mouse = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"](-10, -10);
        const prevMouse = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"](-10, -10);
        const targetMouse = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"](-10, -10);
        let velocity = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"](0, 0);
        let prevTargetMouse = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"](-10, -10);
        // ─── Simulation Material ────────────────────────────────────────
        const simMaterial = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ShaderMaterial"]({
            vertexShader: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$lib$2f$shaders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseVertexShader"],
            fragmentShader: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$lib$2f$shaders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["waveSimulationShader"],
            uniforms: {
                uPrevSim: {
                    value: null
                },
                uResolution: {
                    value: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"](SIM_SIZE, SIM_SIZE)
                },
                uMouse: {
                    value: mouse
                },
                uPrevMouse: {
                    value: prevMouse
                },
                uRadius: {
                    value: BRUSH_RADIUS
                },
                uStrength: {
                    value: 0.0
                },
                uDamping: {
                    value: DAMPING
                },
                uAspect: {
                    value: width / height
                },
                uWaveSpeed: {
                    value: WAVE_SPEED
                }
            }
        });
        const simQuad = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](planeGeo, simMaterial);
        simScene.add(simQuad);
        // ─── Render Material ────────────────────────────────────────────
        const renderMaterial = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ShaderMaterial"]({
            vertexShader: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$lib$2f$shaders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseVertexShader"],
            fragmentShader: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$lib$2f$shaders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["waterRenderShader"],
            uniforms: {
                uSimTexture: {
                    value: null
                },
                uResolution: {
                    value: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"](SIM_SIZE, SIM_SIZE)
                },
                uTime: {
                    value: 0
                }
            },
            transparent: true,
            blending: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["NormalBlending"]
        });
        const renderQuad = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](planeGeo, renderMaterial);
        renderScene.add(renderQuad);
        // ─── Input Tracking ─────────────────────────────────────────────
        let isInteracting = false;
        let lastMoveTime = performance.now();
        // Wave amplitude decays ~2.5%/frame (DAMPING^SIM_STEPS_PER_FRAME, now 1
        // step) — slower than before now that steps-per-frame is halved below, so
        // this window is widened to match (fully settled within ~3s at 60fps).
        const IDLE_TIMEOUT_MS = 3000;
        const updateMousePos = (clientX, clientY)=>{
            const nx = clientX / window.innerWidth;
            const ny = 1.0 - clientY / window.innerHeight;
            prevTargetMouse.copy(targetMouse);
            targetMouse.set(nx, ny);
            lastMoveTime = performance.now();
            if (!isInteracting) {
                mouse.copy(targetMouse);
                prevMouse.copy(targetMouse);
                prevTargetMouse.copy(targetMouse);
                isInteracting = true;
            }
        };
        const handleMouseMove = (e)=>updateMousePos(e.clientX, e.clientY);
        const handleTouchMove = (e)=>{
            if (e.touches.length > 0) updateMousePos(e.touches[0].clientX, e.touches[0].clientY);
        };
        window.addEventListener('mousemove', handleMouseMove, {
            passive: true
        });
        window.addEventListener('touchmove', handleTouchMove, {
            passive: true
        });
        const handleResize = ()=>{
            const w = window.innerWidth;
            const h = window.innerHeight;
            renderer.setSize(w, h);
            simMaterial.uniforms.uAspect.value = w / h;
        };
        window.addEventListener('resize', handleResize);
        // ─── Animation Loop ─────────────────────────────────────────────
        let animationFrameId;
        const clock = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Clock"]();
        // Run simulation steps per frame. Reduced 3 -> 2 -> 1: propagation is
        // slower now, but at this point that reads as "calm" rather than
        // "laggy" — and it halves the GPU sim passes again.
        const SIM_STEPS_PER_FRAME = 1;
        let wasIdle = false;
        const animate = ()=>{
            animationFrameId = requestAnimationFrame(animate);
            if (document.hidden) return; // skip the fluid sim (4 render passes/frame) while backgrounded
            // Once the ripple has fully damped and the cursor has been still for a
            // while (e.g. the user is just scrolling), skip the 4 GPU render passes
            // entirely instead of simulating a flat, invisible ripple every frame.
            const idle = performance.now() - lastMoveTime > IDLE_TIMEOUT_MS;
            if (idle) {
                if (!wasIdle) {
                    // One last render to settle on a fully-decayed frame before pausing.
                    wasIdle = true;
                } else {
                    return;
                }
            } else {
                wasIdle = false;
            }
            const elapsed = clock.getElapsedTime();
            renderMaterial.uniforms.uTime.value = elapsed;
            // Smooth cursor tracking
            prevMouse.copy(mouse);
            mouse.lerp(targetMouse, MOUSE_LERP);
            // Velocity-based force injection (faster cursor = stronger ripple).
            // Multiplier reduced from 3.5 — normal mouse movement now injects noticeably
            // gentler force, matching the client's request for a more subtle, premium feel.
            velocity.subVectors(mouse, prevMouse);
            const speed = velocity.length();
            const strength = Math.min(speed * 2.2, MAX_STRENGTH);
            simMaterial.uniforms.uStrength.value = strength;
            // ── Multi-step simulation for better propagation distance ──
            for(let i = 0; i < SIM_STEPS_PER_FRAME; i++){
                simMaterial.uniforms.uPrevSim.value = targetA.texture;
                renderer.setRenderTarget(targetB);
                renderer.render(simScene, camera);
                // Swap
                const temp = targetA;
                targetA = targetB;
                targetB = temp;
            }
            // ── Final render pass ──
            renderMaterial.uniforms.uSimTexture.value = targetA.texture;
            renderer.setRenderTarget(null);
            renderer.render(renderScene, camera);
        };
        animate();
        // ─── Cleanup ────────────────────────────────────────────────────
        return ()=>{
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('resize', handleResize);
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            planeGeo.dispose();
            simMaterial.dispose();
            renderMaterial.dispose();
            targetA.dispose();
            targetB.dispose();
            renderer.dispose();
        };
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        className: "fixed inset-0 pointer-events-none z-[99999] overflow-hidden",
        "aria-hidden": "true"
    }, void 0, false, {
        fileName: "[project]/src/components/FluidCursorRipple.tsx",
        lineNumber: 246,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/PageTransitionProvider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PageTransitionProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/gsap/index.js [app-ssr] (ecmascript) <locals>");
'use client';
;
;
;
;
function PageTransitionProvider() {
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const columnsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])([]);
    const isTransitioningRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    // Set initial state
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // When the pathname changes, animate the columns out (reveal the new page)
        const columns = columnsRef.current.filter(Boolean);
        if (columns.length === 0) return;
        // Reset origin to bottom so it wipes out downwards
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].set(columns, {
            transformOrigin: 'bottom',
            scaleY: 1
        });
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].to(columns, {
            scaleY: 0,
            duration: 0.55,
            stagger: 0.04,
            ease: 'power4.inOut',
            onComplete: ()=>{
                isTransitioningRef.current = false;
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].set(columns, {
                    pointerEvents: 'none'
                });
            }
        });
    }, [
        pathname
    ]);
    // Global click interceptor for internal links
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleGlobalLinkClick = (e)=>{
            // Find the closest anchor element
            const target = e.target;
            const anchor = target?.closest('a');
            if (!anchor) return;
            const href = anchor.getAttribute('href');
            const targetAttr = anchor.getAttribute('target');
            // Ignore external links, mailto, tel, hash links, or new-tab clicks
            if (!href || href.startsWith('http') && !href.startsWith(window.location.origin) || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#') || targetAttr === '_blank' || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
                return;
            }
            // Convert href to relative path for check
            const url = new URL(anchor.href, window.location.origin);
            const targetPath = url.pathname;
            // If it's the exact same page, don't trigger transition
            if (targetPath === pathname) return;
            // Prevent immediate navigation
            e.preventDefault();
            if (isTransitioningRef.current) return;
            isTransitioningRef.current = true;
            const columns = columnsRef.current.filter(Boolean);
            if (columns.length === 0) {
                router.push(targetPath);
                return;
            }
            // Wipe in from top
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].set(columns, {
                transformOrigin: 'top',
                scaleY: 0,
                pointerEvents: 'auto'
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].to(columns, {
                scaleY: 1,
                duration: 0.5,
                stagger: 0.04,
                ease: 'power4.inOut',
                onComplete: ()=>{
                    router.push(targetPath);
                }
            });
        };
        document.addEventListener('click', handleGlobalLinkClick, {
            capture: true
        });
        return ()=>{
            document.removeEventListener('click', handleGlobalLinkClick, {
                capture: true
            });
        };
    }, [
        pathname,
        router
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "aria-hidden": "true",
        className: "fixed inset-0 pointer-events-none z-[99999] flex w-full h-full",
        children: [
            0,
            1,
            2,
            3,
            4
        ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: (el)=>{
                    if (el) columnsRef.current[i] = el;
                },
                className: "flex-1 h-full bg-[#080214] border-r border-purple-500/20 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden",
                style: {
                    transform: 'scaleY(0)',
                    transformOrigin: 'top'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 bg-gradient-to-b from-purple-900/30 via-[#100318]/60 to-black pointer-events-none"
                    }, void 0, false, {
                        fileName: "[project]/src/components/PageTransitionProvider.tsx",
                        lineNumber: 126,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[300px] bg-purple-600/10 blur-[60px] pointer-events-none"
                    }, void 0, false, {
                        fileName: "[project]/src/components/PageTransitionProvider.tsx",
                        lineNumber: 127,
                        columnNumber: 11
                    }, this)
                ]
            }, i, true, {
                fileName: "[project]/src/components/PageTransitionProvider.tsx",
                lineNumber: 114,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/src/components/PageTransitionProvider.tsx",
        lineNumber: 109,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/SmoothScroll.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SmoothScroll
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lenis$2f$dist$2f$lenis$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lenis/dist/lenis.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gsap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/gsap.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__ = __turbopack_context__.i("[project]/node_modules/gsap/index.js [app-ssr] (ecmascript) <locals> <export default as gsap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/gsap/ScrollTrigger.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function SmoothScroll({ children }) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const lenis = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lenis$2f$dist$2f$lenis$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
            duration: 1.2,
            easing: (t)=>Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true
        });
        lenis.on("scroll", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ScrollTrigger"].update);
        const update = (time)=>lenis.raf(time * 1000);
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].ticker.add(update);
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].ticker.lagSmoothing(0);
        return ()=>{
            lenis.destroy();
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].ticker.remove(update);
        };
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/SmoothScroll.tsx",
        lineNumber: 31,
        columnNumber: 10
    }, this);
}
}),
"[project]/src/components/lib/shaders.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/components/lib/shaders.ts
// Custom GLSL Shaders for WebGL & Three.js Water Ripple & Wave Simulation
/**
 * Shared Vertex Shader for Fullscreen Quad Rendering
 */ __turbopack_context__.s([
    "baseVertexShader",
    ()=>baseVertexShader,
    "renderFragmentShader",
    ()=>renderFragmentShader,
    "waterRenderShader",
    ()=>waterRenderShader,
    "waveSimulationShader",
    ()=>waveSimulationShader
]);
const baseVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;
const waveSimulationShader = `
  precision highp float;

  uniform sampler2D uPrevSim;
  uniform vec2  uResolution;
  uniform vec2  uMouse;
  uniform vec2  uPrevMouse;
  uniform float uRadius;
  uniform float uStrength;
  uniform float uDamping;
  uniform float uAspect;
  uniform float uWaveSpeed;

  varying vec2 vUv;

  // Distance from point p to line segment ab (for continuous cursor strokes)
  float distToSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-7), 0.0, 1.0);
    return length(pa - ba * h);
  }

  void main() {
    vec2 texel = 1.0 / uResolution;

    // 9-point Laplacian stencil for isotropic wave propagation
    float hT  = texture2D(uPrevSim, vUv + vec2(0.0,  texel.y)).r;
    float hB  = texture2D(uPrevSim, vUv + vec2(0.0, -texel.y)).r;
    float hL  = texture2D(uPrevSim, vUv + vec2(-texel.x, 0.0)).r;
    float hR  = texture2D(uPrevSim, vUv + vec2( texel.x, 0.0)).r;

    float hTL = texture2D(uPrevSim, vUv + vec2(-texel.x,  texel.y)).r;
    float hTR = texture2D(uPrevSim, vUv + vec2( texel.x,  texel.y)).r;
    float hBL = texture2D(uPrevSim, vUv + vec2(-texel.x, -texel.y)).r;
    float hBR = texture2D(uPrevSim, vUv + vec2( texel.x, -texel.y)).r;

    float laplacian = (0.5 * (hT + hB + hL + hR) + 0.25 * (hTL + hTR + hBL + hBR)) / 3.0;

    vec2 curr  = texture2D(uPrevSim, vUv).rg;
    float hCurr = curr.r;
    float hPrev = curr.g;

    // Wave equation: h(n+1) = c² * (laplacian - hCurr) + 2*hCurr - hPrev
    float c2 = uWaveSpeed * uWaveSpeed;
    float hNew = c2 * (laplacian - hCurr) + 2.0 * hCurr - hPrev;

    // Damping / dissipation
    hNew *= uDamping;

    // Force injection along cursor path
    vec2 aspectUV   = vec2(vUv.x * uAspect, vUv.y);
    vec2 aspectMPos = vec2(uMouse.x * uAspect, uMouse.y);
    vec2 aspectPrev = vec2(uPrevMouse.x * uAspect, uPrevMouse.y);

    float dist = distToSegment(aspectUV, aspectPrev, aspectMPos);

    if (uStrength > 0.0001) {
      float normalizedDist = dist / (uRadius * uAspect);
      float force = exp(-normalizedDist * normalizedDist * 4.0) * uStrength;
      hNew += force;
    }

    hNew = clamp(hNew, -3.0, 3.0);

    gl_FragColor = vec4(hNew, hCurr, 0.0, 1.0);
  }
`;
const waterRenderShader = `
  precision highp float;

  uniform sampler2D uSimTexture;
  uniform vec2  uResolution;
  uniform float uTime;

  varying vec2 vUv;

  void main() {
    vec2 texel = 1.0 / uResolution;

    // Surface gradient estimation from heightmap
    float hL = texture2D(uSimTexture, vUv - vec2(texel.x, 0.0)).r;
    float hR = texture2D(uSimTexture, vUv + vec2(texel.x, 0.0)).r;
    float hD = texture2D(uSimTexture, vUv - vec2(0.0, texel.y)).r;
    float hU = texture2D(uSimTexture, vUv + vec2(0.0, texel.y)).r;

    vec2 gradient = vec2(hR - hL, hU - hD);
    float gradLen = length(gradient);

    // Normal vector calculation from heightmap gradient
    vec3 normal = normalize(vec3(gradient * 3.2, 0.45));

    // Dual-light specular highlights (Active Theory Liquid Glass Specular)
    vec3 lightDir1 = normalize(vec3(-0.4, 0.6, 0.8));
    vec3 lightDir2 = normalize(vec3(0.5, -0.3, 0.9));

    float spec1 = pow(max(0.0, dot(normal, lightDir1)), 32.0);
    float spec2 = pow(max(0.0, dot(normal, lightDir2)), 48.0);
    float specular = spec1 * 0.65 + spec2 * 0.35;

    // Prismatic chromatic dispersion (Lavender & Soft Violet)
    vec3 cLavender  = vec3(0.733, 0.616, 0.933); // #BB9DEE
    vec3 cPastel    = vec3(0.878, 0.831, 0.988); // #E0D4FC
    vec3 cViolet    = vec3(0.659, 0.333, 0.969); // #A855F7

    // Soft liquid glass color reflection
    vec3 liquidColor = cLavender * (gradLen * 1.8) +
                       cViolet * (gradLen * 1.2) +
                       cPastel * specular;

    // Subtle, elegant opacity mask (Active Theory minimal presence)
    float mask = smoothstep(0.002, 0.045, gradLen);
    float alpha = clamp(mask * 0.22 + specular * 0.32, 0.0, 0.38);

    gl_FragColor = vec4(liquidColor, alpha);
  }
`;
const renderFragmentShader = `
  precision highp float;

  uniform sampler2D uImage;
  uniform sampler2D uDisplacement;
  varying vec2 vUv;

  void main() {
    vec4 displacement = texture2D(uDisplacement, vUv);
    vec2 distortedUv = vUv + displacement.rg * 0.05;

    vec4 color = texture2D(uImage, distortedUv);
    gl_FragColor = color;
  }
`;
}),
"[project]/src/lib/gsap.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/gsap/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/gsap/ScrollTrigger.js [app-ssr] (ecmascript)");
"use client";
;
;
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1mmhe2n._.js.map