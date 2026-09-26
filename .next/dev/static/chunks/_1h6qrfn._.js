(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/node_modules/three/examples/jsm/misc/GPUComputationRenderer.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GPUComputationRenderer",
    ()=>GPUComputationRenderer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$postprocessing$2f$Pass$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/examples/jsm/postprocessing/Pass.js [app-client] (ecmascript)");
;
;
/**
 * GPUComputationRenderer, based on SimulationRenderer by @zz85.
 *
 * The GPUComputationRenderer uses the concept of variables. These variables are RGBA float textures that hold 4 floats
 * for each compute element (texel).
 *
 * Each variable has a fragment shader that defines the computation made to obtain the variable in question.
 * You can use as many variables you need, and make dependencies so you can use textures of other variables in the shader
 * (the sampler uniforms are added automatically) Most of the variables will need themselves as dependency.
 *
 * The renderer has actually two render targets per variable, to make ping-pong. Textures from the current frame are used
 * as inputs to render the textures of the next frame.
 *
 * The render targets of the variables can be used as input textures for your visualization shaders.
 *
 * Variable names should be valid identifiers and should not collide with THREE GLSL used identifiers.
 * a common approach could be to use 'texture' prefixing the variable name; i.e texturePosition, textureVelocity...
 *
 * The size of the computation (sizeX * sizeY) is defined as 'resolution' automatically in the shader. For example:
 * ```
 * #DEFINE resolution vec2( 1024.0, 1024.0 )
 * ```
 * Basic use:
 * ```js
 * // Initialization...
 *
 * // Create computation renderer
 * const gpuCompute = new GPUComputationRenderer( 1024, 1024, renderer );
 *
 * // Create initial state float textures
 * const pos0 = gpuCompute.createTexture();
 * const vel0 = gpuCompute.createTexture();
 * // and fill in here the texture data...
 *
 * // Add texture variables
 * const velVar = gpuCompute.addVariable( "textureVelocity", fragmentShaderVel, vel0 );
 * const posVar = gpuCompute.addVariable( "texturePosition", fragmentShaderPos, pos0 );
 *
 * // Add variable dependencies
 * gpuCompute.setVariableDependencies( velVar, [ velVar, posVar ] );
 * gpuCompute.setVariableDependencies( posVar, [ velVar, posVar ] );
 *
 * // Add custom uniforms
 * velVar.material.uniforms.time = { value: 0.0 };
 *
 * // Check for completeness
 * const error = gpuCompute.init();
 * if ( error !== null ) {
 *		console.error( error );
  * }
 *
 * // In each frame...
 *
 * // Compute!
 * gpuCompute.compute();
 *
 * // Update texture uniforms in your visualization materials with the gpu renderer output
 * myMaterial.uniforms.myTexture.value = gpuCompute.getCurrentRenderTarget( posVar ).texture;
 *
 * // Do your rendering
 * renderer.render( myScene, myCamera );
 * ```
 *
 * Also, you can use utility functions to create ShaderMaterial and perform computations (rendering between textures)
 * Note that the shaders can have multiple input textures.
 *
 * ```js
 * const myFilter1 = gpuCompute.createShaderMaterial( myFilterFragmentShader1, { theTexture: { value: null } } );
 * const myFilter2 = gpuCompute.createShaderMaterial( myFilterFragmentShader2, { theTexture: { value: null } } );
 *
 * const inputTexture = gpuCompute.createTexture();
 *
 * // Fill in here inputTexture...
 *
 * myFilter1.uniforms.theTexture.value = inputTexture;
 *
 * const myRenderTarget = gpuCompute.createRenderTarget();
 * myFilter2.uniforms.theTexture.value = myRenderTarget.texture;
 *
 * const outputRenderTarget = gpuCompute.createRenderTarget();
 *
 * // Now use the output texture where you want:
 * myMaterial.uniforms.map.value = outputRenderTarget.texture;
 *
 * // And compute each frame, before rendering to screen:
 * gpuCompute.doRenderTarget( myFilter1, myRenderTarget );
 * gpuCompute.doRenderTarget( myFilter2, outputRenderTarget );
 * ```
 *
 * @three_import import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js';
 */ class GPUComputationRenderer {
    /**
	 * Constructs a new GPU computation renderer.
	 *
	 * @param {number} sizeX - Computation problem size is always 2d: sizeX * sizeY elements.
 	 * @param {number} sizeY - Computation problem size is always 2d: sizeX * sizeY elements.
 	 * @param {WebGLRenderer} renderer - The renderer.
	 */ constructor(sizeX, sizeY, renderer){
        this.variables = [];
        this.currentTextureIndex = 0;
        let dataType = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FloatType"];
        const passThruUniforms = {
            passThruTexture: {
                value: null
            }
        };
        const passThruShader = createShaderMaterial(getPassThroughFragmentShader(), passThruUniforms);
        const quad = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$postprocessing$2f$Pass$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FullScreenQuad"](passThruShader);
        /**
		 * Sets the data type of the internal textures.
		 *
		 * @param {(FloatType|HalfFloatType)} type - The type to set.
		 * @return {GPUComputationRenderer} A reference to this renderer.
		 */ this.setDataType = function(type) {
            dataType = type;
            return this;
        };
        /**
		 * Adds a compute variable to the renderer.
		 *
		 * @param {string} variableName - The variable name.
		 * @param {string} computeFragmentShader - The compute (fragment) shader source.
		 * @param {Texture} initialValueTexture - The initial value texture.
		 * @return {Object} The compute variable.
		 */ this.addVariable = function(variableName, computeFragmentShader, initialValueTexture) {
            const material = this.createShaderMaterial(computeFragmentShader);
            const variable = {
                name: variableName,
                initialValueTexture: initialValueTexture,
                material: material,
                dependencies: null,
                renderTargets: [],
                wrapS: null,
                wrapT: null,
                minFilter: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NearestFilter"],
                magFilter: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NearestFilter"]
            };
            this.variables.push(variable);
            return variable;
        };
        /**
		 * Sets variable dependencies.
		 *
		 * @param {Object} variable - The compute variable.
		 * @param {Array<Object>} dependencies - Other compute variables that represents the dependencies.
		 */ this.setVariableDependencies = function(variable, dependencies) {
            variable.dependencies = dependencies;
        };
        /**
		 * Initializes the renderer.
		 *
		 * @return {?string} Returns `null` if no errors are detected. Otherwise returns the error message.
		 */ this.init = function() {
            if (renderer.capabilities.maxVertexTextures === 0) {
                return 'No support for vertex shader textures.';
            }
            for(let i = 0; i < this.variables.length; i++){
                const variable = this.variables[i];
                // Creates rendertargets and initialize them with input texture
                variable.renderTargets[0] = this.createRenderTarget(sizeX, sizeY, variable.wrapS, variable.wrapT, variable.minFilter, variable.magFilter);
                variable.renderTargets[1] = this.createRenderTarget(sizeX, sizeY, variable.wrapS, variable.wrapT, variable.minFilter, variable.magFilter);
                this.renderTexture(variable.initialValueTexture, variable.renderTargets[0]);
                this.renderTexture(variable.initialValueTexture, variable.renderTargets[1]);
                // Adds dependencies uniforms to the ShaderMaterial
                const material = variable.material;
                const uniforms = material.uniforms;
                if (variable.dependencies !== null) {
                    for(let d = 0; d < variable.dependencies.length; d++){
                        const depVar = variable.dependencies[d];
                        if (depVar.name !== variable.name) {
                            // Checks if variable exists
                            let found = false;
                            for(let j = 0; j < this.variables.length; j++){
                                if (depVar.name === this.variables[j].name) {
                                    found = true;
                                    break;
                                }
                            }
                            if (!found) {
                                return 'Variable dependency not found. Variable=' + variable.name + ', dependency=' + depVar.name;
                            }
                        }
                        uniforms[depVar.name] = {
                            value: null
                        };
                        material.fragmentShader = '\nuniform sampler2D ' + depVar.name + ';\n' + material.fragmentShader;
                    }
                }
            }
            this.currentTextureIndex = 0;
            return null;
        };
        /**
		 * Executes the compute. This method is usually called in the animation loop.
		 */ this.compute = function() {
            const currentTextureIndex = this.currentTextureIndex;
            const nextTextureIndex = this.currentTextureIndex === 0 ? 1 : 0;
            for(let i = 0, il = this.variables.length; i < il; i++){
                const variable = this.variables[i];
                // Sets texture dependencies uniforms
                if (variable.dependencies !== null) {
                    const uniforms = variable.material.uniforms;
                    for(let d = 0, dl = variable.dependencies.length; d < dl; d++){
                        const depVar = variable.dependencies[d];
                        uniforms[depVar.name].value = depVar.renderTargets[currentTextureIndex].texture;
                    }
                }
                // Performs the computation for this variable
                this.doRenderTarget(variable.material, variable.renderTargets[nextTextureIndex]);
            }
            this.currentTextureIndex = nextTextureIndex;
        };
        /**
		 * Returns the current render target for the given compute variable.
		 *
		 * @param {Object} variable - The compute variable.
		 * @return {WebGLRenderTarget} The current render target.
		 */ this.getCurrentRenderTarget = function(variable) {
            return variable.renderTargets[this.currentTextureIndex];
        };
        /**
		 * Returns the alternate render target for the given compute variable.
		 *
		 * @param {Object} variable - The compute variable.
		 * @return {WebGLRenderTarget} The alternate render target.
		 */ this.getAlternateRenderTarget = function(variable) {
            return variable.renderTargets[this.currentTextureIndex === 0 ? 1 : 0];
        };
        /**
		 * Frees all internal resources. Call this method if you don't need the
		 * renderer anymore.
		 */ this.dispose = function() {
            quad.dispose();
            const variables = this.variables;
            for(let i = 0; i < variables.length; i++){
                const variable = variables[i];
                if (variable.initialValueTexture) variable.initialValueTexture.dispose();
                const renderTargets = variable.renderTargets;
                for(let j = 0; j < renderTargets.length; j++){
                    const renderTarget = renderTargets[j];
                    renderTarget.dispose();
                }
                variable.material.dispose();
            }
        };
        function addResolutionDefine(materialShader) {
            materialShader.defines.resolution = 'vec2( ' + sizeX.toFixed(1) + ', ' + sizeY.toFixed(1) + ' )';
        }
        /**
		 * Adds a resolution defined for the given material shader.
		 *
		 * @param {Object} materialShader - The material shader.
		 */ this.addResolutionDefine = addResolutionDefine;
        // The following functions can be used to compute things manually
        function createShaderMaterial(computeFragmentShader, uniforms) {
            uniforms = uniforms || {};
            const material = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ShaderMaterial"]({
                name: 'GPUComputationShader',
                uniforms: uniforms,
                vertexShader: getPassThroughVertexShader(),
                fragmentShader: computeFragmentShader
            });
            addResolutionDefine(material);
            return material;
        }
        this.createShaderMaterial = createShaderMaterial;
        /**
		 * Creates a new render target from the given parameters.
		 *
		 * @param {number} sizeXTexture - The width of the render target.
		 * @param {number} sizeYTexture - The height of the render target.
		 * @param {number} wrapS - The wrapS value.
		 * @param {number} wrapT - The wrapS value.
		 * @param {number} minFilter - The minFilter value.
		 * @param {number} magFilter - The magFilter value.
		 * @return {WebGLRenderTarget} The new render target.
		 */ this.createRenderTarget = function(sizeXTexture, sizeYTexture, wrapS, wrapT, minFilter, magFilter) {
            sizeXTexture = sizeXTexture || sizeX;
            sizeYTexture = sizeYTexture || sizeY;
            wrapS = wrapS || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ClampToEdgeWrapping"];
            wrapT = wrapT || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ClampToEdgeWrapping"];
            minFilter = minFilter || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NearestFilter"];
            magFilter = magFilter || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NearestFilter"];
            const renderTarget = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WebGLRenderTarget"](sizeXTexture, sizeYTexture, {
                wrapS: wrapS,
                wrapT: wrapT,
                minFilter: minFilter,
                magFilter: magFilter,
                format: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RGBAFormat"],
                type: dataType,
                depthBuffer: false
            });
            return renderTarget;
        };
        /**
		 * Creates a new data texture.
		 *
		 * @return {DataTexture} The new data texture.
		 */ this.createTexture = function() {
            const data = new Float32Array(sizeX * sizeY * 4);
            const texture = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DataTexture"](data, sizeX, sizeY, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RGBAFormat"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FloatType"]);
            texture.needsUpdate = true;
            return texture;
        };
        /**
		 * Renders the given texture into the given render target.
		 *
		 * @param {Texture} input - The input.
		 * @param {WebGLRenderTarget} output - The output.
		 */ this.renderTexture = function(input, output) {
            passThruUniforms.passThruTexture.value = input;
            this.doRenderTarget(passThruShader, output);
            passThruUniforms.passThruTexture.value = null;
        };
        /**
		 * Renders the given material into the given render target
		 * with a full-screen pass.
		 *
		 * @param {Material} material - The material.
		 * @param {WebGLRenderTarget} output - The output.
		 */ this.doRenderTarget = function(material, output) {
            const currentRenderTarget = renderer.getRenderTarget();
            const currentXrEnabled = renderer.xr.enabled;
            const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;
            renderer.xr.enabled = false; // Avoid camera modification
            renderer.shadowMap.autoUpdate = false; // Avoid re-computing shadows
            quad.material = material;
            renderer.setRenderTarget(output);
            quad.render(renderer);
            quad.material = passThruShader;
            renderer.xr.enabled = currentXrEnabled;
            renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;
            renderer.setRenderTarget(currentRenderTarget);
        };
        // Shaders
        function getPassThroughVertexShader() {
            return 'void main()	{\n' + '\n' + '	gl_Position = vec4( position, 1.0 );\n' + '\n' + '}\n';
        }
        function getPassThroughFragmentShader() {
            return 'uniform sampler2D passThruTexture;\n' + '\n' + 'void main() {\n' + '\n' + '	vec2 uv = gl_FragCoord.xy / resolution.xy;\n' + '\n' + '	gl_FragColor = texture2D( passThruTexture, uv );\n' + '\n' + '}\n';
        }
    }
}
;
}),
"[project]/src/components/hero/Emblem.tsx [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EMBLEM_MODEL_PATH",
    ()=>EMBLEM_MODEL_PATH,
    "Emblem",
    ()=>Emblem,
    "PlaceholderEmblem",
    ()=>PlaceholderEmblem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Gltf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/Gltf.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$MeshTransmissionMaterial$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/MeshTransmissionMaterial.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useIntroTimeline$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useIntroTimeline.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useEmblemGlowTexture$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useEmblemGlowTexture.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
const EMBLEM_MODEL_PATH = "/models/emblem-opt.glb";
;
/**
 * Glass properties for the outer refractive ring/housing.
 */ const GLASS_PROPS = {
    thickness: 0.45,
    roughness: 0.05,
    transmission: 1,
    ior: 1.32,
    chromaticAberration: 0.08,
    anisotropy: 0.45,
    distortion: 0.18,
    distortionScale: 0.45,
    temporalDistortion: 0.12,
    color: "#e2f2ff"
};
/**
 * Computes planar UV projection mapped onto the XY bounds of the geometry
 * so the glow texture displays without distortion.
 */ function applyPlanarUVs(geometry) {
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    if (!box) return;
    const sizeX = Math.max(box.max.x - box.min.x, 0.001);
    const sizeY = Math.max(box.max.y - box.min.y, 0.001);
    const pos = geometry.attributes.position;
    const uvs = new Float32Array(pos.count * 2);
    for(let i = 0; i < pos.count; i++){
        const x = pos.getX(i);
        const y = pos.getY(i);
        uvs[i * 2] = (x - box.min.x) / sizeX;
        uvs[i * 2 + 1] = (y - box.min.y) / sizeY;
    }
    const uvAttribute = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferAttribute"](uvs, 2);
    uvAttribute.needsUpdate = true;
    geometry.setAttribute("uv", uvAttribute);
}
const Emblem = /*#__PURE__*/ _s((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c = _s(function Emblem(_props, ref) {
    _s();
    const innerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const { scene } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Gltf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGLTF"])(EMBLEM_MODEL_PATH);
    const bokehTexture = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useEmblemGlowTexture$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEmblemGlowTexture"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useIntroTimeline$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useIntroTimeline"])(innerRef);
    const geometry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Emblem.Emblem.useMemo[geometry]": ()=>{
            let geo = null;
            scene.traverse({
                "Emblem.Emblem.useMemo[geometry]": (child)=>{
                    if (!geo && child.isMesh) {
                        geo = child.geometry.clone();
                        applyPlanarUVs(geo);
                        geo.computeVertexNormals();
                    }
                }
            }["Emblem.Emblem.useMemo[geometry]"]);
            return geo;
        }
    }["Emblem.Emblem.useMemo[geometry]"], [
        scene
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        ref: ref,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
            ref: innerRef,
            children: geometry && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                geometry: geometry,
                castShadow: true,
                receiveShadow: true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$MeshTransmissionMaterial$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MeshTransmissionMaterial"], {
                    ...GLASS_PROPS,
                    backside: true,
                    side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DoubleSide"],
                    emissive: "#ffffff",
                    emissiveIntensity: 2.5,
                    emissiveMap: bokehTexture || undefined,
                    toneMapped: false
                }, void 0, false, {
                    fileName: "[project]/src/components/hero/Emblem.tsx",
                    lineNumber: 79,
                    columnNumber: 13
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/hero/Emblem.tsx",
                lineNumber: 78,
                columnNumber: 11
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/hero/Emblem.tsx",
            lineNumber: 76,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/hero/Emblem.tsx",
        lineNumber: 75,
        columnNumber: 5
    }, this);
}, "477Fd4oKxIKdtiQUo27WPCbBvfE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Gltf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGLTF"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useEmblemGlowTexture$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEmblemGlowTexture"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useIntroTimeline$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useIntroTimeline"]
    ];
})), "477Fd4oKxIKdtiQUo27WPCbBvfE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Gltf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGLTF"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useEmblemGlowTexture$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEmblemGlowTexture"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useIntroTimeline$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useIntroTimeline"]
    ];
});
_c1 = Emblem;
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Gltf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGLTF"].preload(EMBLEM_MODEL_PATH);
/**
 * Procedural stand-in for emblem.glb: an outer transmissive ring plus an extruded "a"
 * glyph with planar UV mapping and self-illuminating emissive glow texture.
 */ function buildPlaceholderGeometry() {
    const bowlOuterR = 0.5;
    const bowlInnerR = 0.27;
    const bowlCenterX = -0.06;
    const bowlCenterY = -0.05;
    const bowl = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Shape"]();
    bowl.absarc(bowlCenterX, bowlCenterY, bowlOuterR, 0, Math.PI * 2, false);
    const hole = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Path"]();
    hole.absarc(bowlCenterX, bowlCenterY, bowlInnerR, 0, Math.PI * 2, true);
    bowl.holes.push(hole);
    const stemWidth = 0.17;
    const stemLeft = bowlCenterX + bowlOuterR - stemWidth * 1.1;
    const stemBottom = bowlCenterY - bowlOuterR + 0.06;
    const stemTop = bowlCenterY + bowlOuterR + 0.3;
    const stem = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Shape"]();
    stem.moveTo(stemLeft, stemBottom);
    stem.lineTo(stemLeft + stemWidth, stemBottom);
    stem.lineTo(stemLeft + stemWidth, stemTop);
    stem.lineTo(stemLeft, stemTop);
    stem.closePath();
    const letterGeometry = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtrudeGeometry"]([
        bowl,
        stem
    ], {
        depth: 0.16,
        bevelEnabled: true,
        bevelThickness: 0.025,
        bevelSize: 0.018,
        bevelSegments: 4,
        curveSegments: 64
    });
    letterGeometry.center();
    applyPlanarUVs(letterGeometry);
    const ringGeometry = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TorusGeometry"](1.4, 0.1, 36, 128);
    return {
        ringGeometry,
        letterGeometry
    };
}
const PlaceholderEmblem = /*#__PURE__*/ _s1((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c2 = _s1(function PlaceholderEmblem(_props, ref) {
    _s1();
    const innerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const { ringGeometry, letterGeometry } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PlaceholderEmblem.PlaceholderEmblem.useMemo": ()=>buildPlaceholderGeometry()
    }["PlaceholderEmblem.PlaceholderEmblem.useMemo"], []);
    const bokehTexture = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useEmblemGlowTexture$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEmblemGlowTexture"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useIntroTimeline$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useIntroTimeline"])(innerRef);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        ref: ref,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
            ref: innerRef,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                    geometry: ringGeometry,
                    rotation: [
                        Math.PI / 2,
                        0,
                        0
                    ],
                    castShadow: true,
                    receiveShadow: true,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$MeshTransmissionMaterial$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MeshTransmissionMaterial"], {
                        ...GLASS_PROPS,
                        backside: true,
                        side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DoubleSide"]
                    }, void 0, false, {
                        fileName: "[project]/src/components/hero/Emblem.tsx",
                        lineNumber: 153,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/hero/Emblem.tsx",
                    lineNumber: 152,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                    geometry: letterGeometry,
                    castShadow: true,
                    receiveShadow: true,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshStandardMaterial", {
                        color: "#04070e",
                        metalness: 0.88,
                        roughness: 0.12,
                        emissive: "#ffffff",
                        emissiveIntensity: 3.2,
                        emissiveMap: bokehTexture || undefined,
                        toneMapped: false
                    }, void 0, false, {
                        fileName: "[project]/src/components/hero/Emblem.tsx",
                        lineNumber: 158,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/hero/Emblem.tsx",
                    lineNumber: 157,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/hero/Emblem.tsx",
            lineNumber: 150,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/hero/Emblem.tsx",
        lineNumber: 149,
        columnNumber: 7
    }, this);
}, "ERf+HSwqvT/VgvLkkeGuEWhTQzs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useEmblemGlowTexture$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEmblemGlowTexture"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useIntroTimeline$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useIntroTimeline"]
    ];
})), "ERf+HSwqvT/VgvLkkeGuEWhTQzs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useEmblemGlowTexture$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEmblemGlowTexture"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useIntroTimeline$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useIntroTimeline"]
    ];
});
_c3 = PlaceholderEmblem;
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "Emblem$forwardRef");
__turbopack_context__.k.register(_c1, "Emblem");
__turbopack_context__.k.register(_c2, "PlaceholderEmblem$forwardRef");
__turbopack_context__.k.register(_c3, "PlaceholderEmblem");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/hero/HeroScene.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HeroScene
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$react$2d$three$2d$fiber$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/react-three-fiber.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$postprocessing$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/postprocessing/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$SceneRig$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/hero/SceneRig.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useTabVisible$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useTabVisible.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useInViewport$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useInViewport.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function HeroScene({ triggerRef }) {
    _s();
    const isTabVisible = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useTabVisible$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTabVisible"])();
    const isInViewport = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useInViewport$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInViewport"])(triggerRef);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$react$2d$three$2d$fiber$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Canvas"], {
        shadows: false,
        dpr: [
            1,
            1.5
        ],
        gl: {
            antialias: false,
            powerPreference: "high-performance"
        },
        camera: {
            position: [
                0,
                0.3,
                8.5
            ],
            fov: 32
        },
        frameloop: isTabVisible && isInViewport ? "always" : "never",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("color", {
                attach: "background",
                args: [
                    "#000000"
                ]
            }, void 0, false, {
                fileName: "[project]/src/components/hero/HeroScene.tsx",
                lineNumber: 26,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$SceneRig$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SceneRig"], {
                triggerRef: triggerRef
            }, void 0, false, {
                fileName: "[project]/src/components/hero/HeroScene.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$postprocessing$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EffectComposer"], {
                multisampling: 0,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$postprocessing$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Bloom"], {
                    intensity: 0.9,
                    luminanceThreshold: 0.25,
                    luminanceSmoothing: 0.4,
                    mipmapBlur: true
                }, void 0, false, {
                    fileName: "[project]/src/components/hero/HeroScene.tsx",
                    lineNumber: 29,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/hero/HeroScene.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/hero/HeroScene.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
_s(HeroScene, "0fbFD+ZWoWpZmpdLDp+G2eO7qO8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useTabVisible$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTabVisible"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useInViewport$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInViewport"]
    ];
});
_c = HeroScene;
var _c;
__turbopack_context__.k.register(_c, "HeroScene");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/hero/HeroScene.tsx [app-client] (ecmascript, next/dynamic entry)", (function(__turbopack_context__){

__turbopack_context__.n(__turbopack_context__.i("[project]/src/components/hero/HeroScene.tsx [app-client] (ecmascript)"));
}),
"[project]/src/components/hero/ParticleField.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ParticleField",
    ()=>ParticleField
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-156d8d12.esm.js [app-client] (ecmascript) <export D as useFrame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-156d8d12.esm.js [app-client] (ecmascript) <export C as useThree>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$misc$2f$GPUComputationRenderer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/examples/jsm/misc/GPUComputationRenderer.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
// Reduced from 96 (9216 particles) — a denser field read as busy/cluttered
// rather than premium; this keeps the effect present without overwhelming
// the emblem, and is a solid GPU-compute win as a side effect (particle
// count scales with the square of this value).
const SIM_SIZE = 64;
const PARTICLE_COUNT = SIM_SIZE * SIM_SIZE;
// Fraction of scroll progress over which particles finish revealing / spreading out
const REVEAL_RANGE = 0.55;
const SPREAD_RANGE = 0.7;
const SPREAD_MIN = 1.0;
const SPREAD_MAX = 3.6;
// A handful of particles are already awake before any scrolling, so the idle
// frame isn't completely empty (matches the reference's sparse-but-present start)
const AMBIENT_REVEAL_FLOOR = 0.06;
// Spawning fans out across multiple emitter points spread across the full
// viewport width from the very start (emitter count itself is a GLSL-side
// const in the shader below), instead of a single central column that only
// widens later — bubbles rise from across the whole bottom of the viewport
// throughout the section.
// Past this point the emblem is pinned (see PIN_AT in useScrollTimeline) and the
// field surges upward to visually submerge it instead of the emblem moving away
const SUBMERGE_START = 0.95;
// How long after the last pointer move the cursor still counts as "active"
// for spawning a trail of particles
const MOUSE_ACTIVE_TIMEOUT = 500;
const simulationShader = `
uniform float uTime;
uniform vec3 uMouse;
uniform vec3 uEmblemPos;
uniform float uReveal;
uniform float uSpread;
uniform float uEmitterSpread;
uniform float uViewportHalfWidth;
uniform float uSubmergeLevel;
uniform float uMouseActive;

const float EMITTER_COUNT = 7.0;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

vec3 curlNoise(vec3 p) {
  const float e = 0.05;
  float n1 = snoise(vec3(p.x, p.y + e, p.z));
  float n2 = snoise(vec3(p.x, p.y - e, p.z));
  float n3 = snoise(vec3(p.x, p.y, p.z + e));
  float n4 = snoise(vec3(p.x, p.y, p.z - e));
  float n5 = snoise(vec3(p.x + e, p.y, p.z));
  float n6 = snoise(vec3(p.x - e, p.y, p.z));
  return normalize(vec3((n1 - n2) - (n3 - n4), (n3 - n4) - (n5 - n6), (n5 - n6) - (n1 - n2)));
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 data = texture2D(texturePosition, uv);
  vec3 pos = data.xyz;
  // age: -1 = dormant (never yet revealed), 0..1 = position through its current
  // life cycle. Once revealed, a particle loops forever (fade in, live, fade out,
  // respawn elsewhere, fade in again) instead of popping in once and stopping.
  float age = data.w;

  // Stable per-particle seed: decides both spawn placement and when (in scroll
  // progress) this particle is allowed to switch on, giving a staggered "growing"
  // reveal instead of the whole field fading in together.
  float seed = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);

  bool respawn = age < 0.0 || age >= 1.0;

  if (respawn) {
    if (age < 0.0 && seed > uReveal) {
      // Stay dormant until scroll progress raises uReveal past this particle's seed
      gl_FragColor = vec4(pos, -1.0);
      return;
    }

    // A fraction of respawns seek the cursor instead of the usual spawn point,
    // so hovering leaves a trail of particles that then live out the exact same
    // buoyancy/turbulence/attraction physics as everything else
    float mouseRoll = fract(sin(dot(uv, vec2(71.34, 22.17)) + uTime * 0.11) * 5432.1);
    bool spawnAtMouse = uMouseActive > 0.5 && mouseRoll < 0.35;

    if (spawnAtMouse) {
      vec2 jitter = vec2(
        fract(sin(dot(uv, vec2(9.1, 3.7)) + uTime * 0.2) * 1000.0) - 0.5,
        fract(sin(dot(uv, vec2(4.3, 8.9)) + uTime * 0.2) * 1000.0) - 0.5
      ) * 0.5;
      pos = uMouse + vec3(jitter, 0.0);
    } else {
      // Include uTime so each respawn lands somewhere new, not the exact same spot
      float angle = fract(sin(dot(uv, vec2(39.3468, 11.135)) + uTime * 0.07) * 24634.6345) * 6.28318;
      float radius = seed * uSpread;

      // Single central column (low scroll) ...
      float columnX = cos(angle) * radius;
      float columnZ = sin(angle) * radius * 0.8;

      // ... fanning out into multiple emitters spread across the viewport width
      float emitterIndex = floor(fract(seed * 91.23) * EMITTER_COUNT);
      float emitterX = mix(-uViewportHalfWidth, uViewportHalfWidth, (emitterIndex + 0.5) / EMITTER_COUNT);
      float jitterX = (fract(sin(dot(uv, vec2(51.23, 17.91)) + uTime * 0.03) * 10000.0) - 0.5)
        * (uViewportHalfWidth / EMITTER_COUNT) * 0.7;
      float rowX = emitterX + jitterX;
      float rowZ = sin(angle) * radius * 0.8;

      pos.x = mix(columnX, rowX, uEmitterSpread);
      pos.z = mix(columnZ, rowZ, uEmitterSpread);

      // Submersion: spawn ceiling rises from the low idle band up past the
      // emblem so the surge visually floods over it instead of it moving away
      float baseSpawnY = -2.4 + (fract(uv.y * 311.0 + uTime * 0.05) * 0.9 - 0.45);
      float submergeSpawnY = uEmblemPos.y + 1.4 + (fract(uv.y * 311.0 + uTime * 0.05) * 0.6);
      pos.y = mix(baseSpawnY, submergeSpawnY, uSubmergeLevel);
    }
    age = 0.0;
  } else {
    vec3 buoyancy = vec3(0.0, 0.006, 0.0) * mix(1.0, 3.0, uSubmergeLevel);
    vec3 turbulence = curlNoise(pos * 0.4 + uTime * 0.06) * 0.005;

    vec3 toEmblem = uEmblemPos - pos;
    vec3 attraction = normalize(toEmblem + 0.0001) * 0.0018;

    vec3 mouseDiff = pos - uMouse;
    float dist = length(mouseDiff);
    vec3 mouseForce = vec3(0.0);
    if (dist < 1.6) {
      mouseForce = normalize(mouseDiff + 0.0001) * (1.0 - dist / 1.6) * 0.03;
    }

    pos += buoyancy + turbulence + attraction + mouseForce;
    age += 0.0018 + fract(sin(uv.x + uv.y) * 43758.5) * 0.0012;

    // Buoyancy alone would let particles drift past the emblem and coast
    // indefinitely off the top of frame; force an early respawn once they
    // overshoot so the field stays where it's actually visible
    if (pos.y > uEmblemPos.y + 3.0) {
      age = 1.0;
    }
  }

  gl_FragColor = vec4(pos, age);
}
`;
const particleVertexShader = `
uniform sampler2D uPosTexture;
uniform float uPixelRatio;
uniform float uSubmergeLevel;
attribute vec2 aSimUv;
varying vec3 vColor;
varying float vLife;

void main() {
  vec4 data = texture2D(uPosTexture, aSimUv);
  vec3 pos = data.xyz;
  float age = data.w;

  // Smooth breathing envelope: fades in from birth, fades out before the next
  // respawn, so particles never pop discretely in or out. In the ending/submerge
  // zone, the fade-out is switched off so the field accumulates fully bright
  // instead of continuing to breathe.
  float revealed = step(0.0, age);
  float fadeIn = smoothstep(0.0, 0.12, age);
  float fadeOut = mix(smoothstep(1.0, 0.85, age), 1.0, uSubmergeLevel);
  vLife = revealed * fadeIn * fadeOut;

  // Brand-derived gradient: multi-shade purple from deep amethyst through signature lavender to pastel violet
  vec3 deepAmethyst = vec3(0.486, 0.227, 0.929); // #7C3AED
  vec3 signatureLavender = vec3(0.733, 0.616, 0.933); // #BB9DEE
  vec3 pastelViolet = vec3(0.878, 0.831, 0.988); // #E0D4FC

  float t = smoothstep(-2.0, 1.0, pos.y);
  vec3 col = mix(deepAmethyst, signatureLavender, t);
  col = mix(col, pastelViolet, smoothstep(0.5, 3.0, pos.y));
  vColor = col;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float depth = max(-mvPosition.z, 0.1);
  // Power-biased hash: most particles stay small dust, a few pop as bright flares
  float sizeHash = fract(sin(dot(aSimUv, vec2(12.9, 78.2))) * 43758.5);
  float baseSize = mix(3.0, 30.0, pow(sizeHash, 3.5)) * mix(1.0, 1.5, uSubmergeLevel);
  gl_PointSize = (baseSize * uPixelRatio * vLife) / depth;
}
`;
const particleFragmentShader = `
varying vec3 vColor;
varying float vLife;

void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  if (dist > 0.5) discard;

  // Fake 3D sphere normal for a glassy, refractive bubble look
  float z = sqrt(max(0.0, 0.25 - dist * dist)) * 2.0;
  float fresnel = pow(1.0 - z, 2.5);

  vec2 lightDir = normalize(vec2(0.3, 0.5));
  float specular = pow(max(0.0, dot(normalize(coord + 0.0001), lightDir)), 8.0) * z;

  float alpha = (fresnel * 0.85 + specular * 1.5 + 0.1) * vLife;
  vec3 finalColor = vColor * (1.2 + fresnel * 2.0 + specular * 3.0);

  gl_FragColor = vec4(finalColor, alpha);
}
`;
function ParticleField({ scrollState, attractorPosition }) {
    _s();
    const { gl, camera } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__["useThree"])();
    const pointerWorld = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](999, 999, 0));
    const lastPointerMoveAt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(-Infinity);
    const raycaster = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ParticleField.useMemo[raycaster]": ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Raycaster"]()
    }["ParticleField.useMemo[raycaster]"], []);
    const plane = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ParticleField.useMemo[plane]": ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Plane"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](0, 0, 1), 0)
    }["ParticleField.useMemo[plane]"], []);
    const gpu = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ParticleField.useMemo[gpu]": ()=>{
            const computation = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$misc$2f$GPUComputationRenderer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GPUComputationRenderer"](SIM_SIZE, SIM_SIZE, gl);
            const dtPosition = computation.createTexture();
            const posArray = dtPosition.image.data;
            for(let i = 0; i < posArray.length; i += 4){
                posArray[i] = 0;
                posArray[i + 1] = -2.4;
                posArray[i + 2] = 0;
                posArray[i + 3] = -1.0; // dormant until scroll-driven uReveal wakes it
            }
            const positionVariable = computation.addVariable("texturePosition", simulationShader, dtPosition);
            computation.setVariableDependencies(positionVariable, [
                positionVariable
            ]);
            Object.assign(positionVariable.material.uniforms, {
                uTime: {
                    value: 0
                },
                uMouse: {
                    value: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](999, 999, 0)
                },
                uEmblemPos: {
                    value: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](0, 0, 0)
                },
                uReveal: {
                    value: 0
                },
                uSpread: {
                    value: SPREAD_MIN
                },
                uEmitterSpread: {
                    value: 1
                },
                uViewportHalfWidth: {
                    value: 4.0
                },
                uSubmergeLevel: {
                    value: 0
                },
                uMouseActive: {
                    value: 0
                }
            });
            const error = computation.init();
            if (error) console.error(error);
            return {
                computation,
                positionVariable
            };
        }
    }["ParticleField.useMemo[gpu]"], [
        gl
    ]);
    const geometry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ParticleField.useMemo[geometry]": ()=>{
            const geo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferGeometry"]();
            const simUvs = new Float32Array(PARTICLE_COUNT * 2);
            let idx = 0;
            for(let i = 0; i < SIM_SIZE; i++){
                for(let j = 0; j < SIM_SIZE; j++){
                    simUvs[idx * 2] = (i + 0.5) / SIM_SIZE;
                    simUvs[idx * 2 + 1] = (j + 0.5) / SIM_SIZE;
                    idx++;
                }
            }
            geo.setAttribute("aSimUv", new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferAttribute"](simUvs, 2));
            geo.setAttribute("position", new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferAttribute"](new Float32Array(PARTICLE_COUNT * 3), 3));
            return geo;
        }
    }["ParticleField.useMemo[geometry]"], []);
    const material = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ParticleField.useMemo[material]": ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ShaderMaterial"]({
                uniforms: {
                    uPosTexture: {
                        value: null
                    },
                    uPixelRatio: {
                        value: gl.getPixelRatio()
                    },
                    uSubmergeLevel: {
                        value: 0
                    }
                },
                vertexShader: particleVertexShader,
                fragmentShader: particleFragmentShader,
                transparent: true,
                depthWrite: false,
                blending: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AdditiveBlending"]
            })
    }["ParticleField.useMemo[material]"], [
        gl
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ParticleField.useEffect": ()=>{
            const handlePointerMove = {
                "ParticleField.useEffect.handlePointerMove": (e)=>{
                    const ndc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"](e.clientX / window.innerWidth * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
                    raycaster.setFromCamera(ndc, camera);
                    raycaster.ray.intersectPlane(plane, pointerWorld.current);
                    lastPointerMoveAt.current = performance.now();
                }
            }["ParticleField.useEffect.handlePointerMove"];
            window.addEventListener("pointermove", handlePointerMove, {
                passive: true
            });
            return ({
                "ParticleField.useEffect": ()=>window.removeEventListener("pointermove", handlePointerMove)
            })["ParticleField.useEffect"];
        }
    }["ParticleField.useEffect"], [
        camera,
        raycaster,
        plane
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ParticleField.useEffect": ()=>{
            return ({
                "ParticleField.useEffect": ()=>{
                    geometry.dispose();
                    material.dispose();
                    gpu.computation.dispose();
                }
            })["ParticleField.useEffect"];
        }
    }["ParticleField.useEffect"], [
        gpu,
        geometry,
        material
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"])({
        "ParticleField.useFrame": (_state, delta)=>{
            const uniforms = gpu.positionVariable.material.uniforms;
            uniforms.uTime.value += delta;
            uniforms.uMouse.value.copy(pointerWorld.current);
            uniforms.uMouseActive.value = performance.now() - lastPointerMoveAt.current < MOUSE_ACTIVE_TIMEOUT ? 1 : 0;
            if (attractorPosition.current) {
                uniforms.uEmblemPos.value.copy(attractorPosition.current);
            }
            const progress = scrollState.current?.progress ?? 0;
            const revealRamp = Math.min(progress / REVEAL_RANGE, 1);
            uniforms.uReveal.value = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MathUtils"].lerp(AMBIENT_REVEAL_FLOOR, 1, revealRamp);
            uniforms.uSpread.value = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MathUtils"].lerp(SPREAD_MIN, SPREAD_MAX, Math.min(progress / SPREAD_RANGE, 1));
            uniforms.uSubmergeLevel.value = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MathUtils"].clamp((progress - SUBMERGE_START) / (1 - SUBMERGE_START), 0, 1);
            material.uniforms.uSubmergeLevel.value = uniforms.uSubmergeLevel.value;
            const perspectiveCamera = camera;
            const distance = Math.abs(camera.position.z);
            const halfHeight = Math.tan(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MathUtils"].degToRad(perspectiveCamera.fov) / 2) * distance;
            uniforms.uViewportHalfWidth.value = halfHeight * perspectiveCamera.aspect;
            gpu.computation.compute();
            material.uniforms.uPosTexture.value = gpu.computation.getCurrentRenderTarget(gpu.positionVariable).texture;
        }
    }["ParticleField.useFrame"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("points", {
        geometry: geometry,
        material: material,
        frustumCulled: false
    }, void 0, false, {
        fileName: "[project]/src/components/hero/ParticleField.tsx",
        lineNumber: 396,
        columnNumber: 10
    }, this);
}
_s(ParticleField, "yfCD/+81g8ESptnjhsgMK5yZfg0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__["useThree"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"]
    ];
});
_c = ParticleField;
var _c;
__turbopack_context__.k.register(_c, "ParticleField");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/hero/RimLights.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RimLights",
    ()=>RimLights
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$lights$2f$RectAreaLightUniformsLib$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/examples/jsm/lights/RectAreaLightUniformsLib.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Environment$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/Environment.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function RimLights() {
    _s();
    const leftRectRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const rightRectRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RimLights.useEffect": ()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$examples$2f$jsm$2f$lights$2f$RectAreaLightUniformsLib$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RectAreaLightUniformsLib"].init();
            leftRectRef.current?.lookAt(0, 0, 0);
            rightRectRef.current?.lookAt(0, 0, 0);
        }
    }["RimLights.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                fallback: null,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Environment$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Environment"], {
                    preset: "studio",
                    environmentIntensity: 0.65
                }, void 0, false, {
                    fileName: "[project]/src/components/hero/RimLights.tsx",
                    lineNumber: 29,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/hero/RimLights.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ambientLight", {
                intensity: 0.12,
                color: "#181028"
            }, void 0, false, {
                fileName: "[project]/src/components/hero/RimLights.tsx",
                lineNumber: 31,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rectAreaLight", {
                ref: leftRectRef,
                args: [
                    "#BB9DEE",
                    6.0,
                    4.5,
                    7
                ],
                position: [
                    -4,
                    1.4,
                    2
                ]
            }, void 0, false, {
                fileName: "[project]/src/components/hero/RimLights.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rectAreaLight", {
                ref: rightRectRef,
                args: [
                    "#A855F7",
                    6.0,
                    4.5,
                    7
                ],
                position: [
                    4,
                    1.2,
                    1.6
                ]
            }, void 0, false, {
                fileName: "[project]/src/components/hero/RimLights.tsx",
                lineNumber: 41,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("directionalLight", {
                position: [
                    0,
                    4.5,
                    3.0
                ],
                intensity: 1.8,
                color: "#E0D4FC"
            }, void 0, false, {
                fileName: "[project]/src/components/hero/RimLights.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("directionalLight", {
                position: [
                    -3,
                    -4.0,
                    1.5
                ],
                intensity: 1.4,
                color: "#7C3AED"
            }, void 0, false, {
                fileName: "[project]/src/components/hero/RimLights.tsx",
                lineNumber: 55,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("directionalLight", {
                position: [
                    0,
                    0,
                    -5.0
                ],
                intensity: 1.6,
                color: "#9333EA"
            }, void 0, false, {
                fileName: "[project]/src/components/hero/RimLights.tsx",
                lineNumber: 62,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pointLight", {
                position: [
                    0.6,
                    1.8,
                    2.4
                ],
                intensity: 2.8,
                distance: 8,
                color: "#E0D4FC"
            }, void 0, false, {
                fileName: "[project]/src/components/hero/RimLights.tsx",
                lineNumber: 69,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/hero/RimLights.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
_s(RimLights, "bEpnYG93sk1vi5zVORAmBS71O9A=");
_c = RimLights;
var _c;
__turbopack_context__.k.register(_c, "RimLights");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/hero/SceneRig.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SceneRig",
    ()=>SceneRig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-156d8d12.esm.js [app-client] (ecmascript) <export D as useFrame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$Emblem$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/components/hero/Emblem.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$ModelErrorBoundary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/hero/ModelErrorBoundary.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$ParticleField$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/hero/ParticleField.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$RimLights$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/hero/RimLights.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useScrollTimeline$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useScrollTimeline.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
// Composition framing: centered in the viewport
const RIG_SCALE = 0.65;
const RIG_Y_OFFSET = 0.0;
function SceneRig({ triggerRef }) {
    _s();
    const rigGroupRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const scrollState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({
        rotY: 0,
        rotX: 0,
        posY: 0,
        scale: 1,
        progress: 0
    });
    const emblemWorldPos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]());
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useScrollTimeline$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useScrollTimeline"])(triggerRef, scrollState);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"])({
        "SceneRig.useFrame": (state)=>{
            const rig = rigGroupRef.current;
            if (!rig) return;
            const t = state.clock.elapsedTime;
            const { rotY, rotX, posY, scale } = scrollState.current;
            rig.rotation.y = rotY + Math.sin(t * 0.6) * 0.05;
            rig.rotation.x = rotX + Math.sin(t * 0.4) * 0.025;
            rig.position.y = RIG_Y_OFFSET + posY + Math.sin(t * 0.5) * 0.04;
            rig.scale.setScalar(RIG_SCALE * (scale || 1.0));
            rig.getWorldPosition(emblemWorldPos.current);
        }
    }["SceneRig.useFrame"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                ref: rigGroupRef,
                scale: RIG_SCALE,
                position: [
                    0,
                    RIG_Y_OFFSET,
                    0
                ],
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$RimLights$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RimLights"], {}, void 0, false, {
                        fileName: "[project]/src/components/hero/SceneRig.tsx",
                        lineNumber: 49,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$ModelErrorBoundary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ModelErrorBoundary"], {
                        fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$Emblem$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PlaceholderEmblem"], {}, void 0, false, {
                            fileName: "[project]/src/components/hero/SceneRig.tsx",
                            lineNumber: 50,
                            columnNumber: 39
                        }, this),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                            fallback: null,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$Emblem$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Emblem"], {}, void 0, false, {
                                fileName: "[project]/src/components/hero/SceneRig.tsx",
                                lineNumber: 52,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/hero/SceneRig.tsx",
                            lineNumber: 51,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/hero/SceneRig.tsx",
                        lineNumber: 50,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/hero/SceneRig.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$ParticleField$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ParticleField"], {
                scrollState: scrollState,
                attractorPosition: emblemWorldPos
            }, void 0, false, {
                fileName: "[project]/src/components/hero/SceneRig.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/hero/SceneRig.tsx",
        lineNumber: 47,
        columnNumber: 5
    }, this);
}
_s(SceneRig, "vKnbxGNSFcAefLyggXyU0P+nxSE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useScrollTimeline$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useScrollTimeline"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"]
    ];
});
_c = SceneRig;
var _c;
__turbopack_context__.k.register(_c, "SceneRig");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/useIntroTimeline.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useIntroTimeline",
    ()=>useIntroTimeline
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-156d8d12.esm.js [app-client] (ecmascript) <export D as useFrame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gsap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/gsap.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__ = __turbopack_context__.i("[project]/node_modules/gsap/index.js [app-client] (ecmascript) <locals> <export default as gsap>");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const IDLE_FLOAT_SPEED = 0.8;
const IDLE_FLOAT_AMPLITUDE = 0.08;
function useIntroTimeline(emblemGroupRef) {
    _s();
    const introComplete = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useIntroTimeline.useEffect": ()=>{
            const emblem = emblemGroupRef.current;
            if (!emblem) return;
            introComplete.current = false;
            // Pre-load state: close zoom with a slight tilt, half-turned (180deg)
            emblem.scale.set(2.5, 2.5, 2.5);
            emblem.rotation.x = 0.25;
            emblem.rotation.y = Math.PI;
            const tl = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].timeline({
                defaults: {
                    duration: 2.0,
                    ease: "power3.out"
                }
            });
            tl.to(emblem.scale, {
                x: 1,
                y: 1,
                z: 1
            }, 0);
            tl.to(emblem.rotation, {
                x: 0,
                y: Math.PI * 2
            }, 0);
            // Notify particle system that emblem zoom-out is complete, and hand off to idle float
            tl.call({
                "useIntroTimeline.useEffect": ()=>{
                    introComplete.current = true;
                    if ("TURBOPACK compile-time truthy", 1) {
                        window.dispatchEvent(new CustomEvent("emblem-intro-complete"));
                    }
                }
            }["useIntroTimeline.useEffect"]);
            return ({
                "useIntroTimeline.useEffect": ()=>{
                    tl.kill();
                }
            })["useIntroTimeline.useEffect"];
        }
    }["useIntroTimeline.useEffect"], [
        emblemGroupRef
    ]);
    // Idle float handoff: gentle sinusoidal shimmer so chrome reflections keep moving
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"])({
        "useIntroTimeline.useFrame": (state)=>{
            const emblem = emblemGroupRef.current;
            if (!emblem || !introComplete.current) return;
            emblem.rotation.y = Math.sin(state.clock.getElapsedTime() * IDLE_FLOAT_SPEED) * IDLE_FLOAT_AMPLITUDE;
        }
    }["useIntroTimeline.useFrame"]);
}
_s(useIntroTimeline, "+6zrizEgqwG6lLFpSie0JVt2kbA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$156d8d12$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/useScrollTimeline.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useScrollTimeline",
    ()=>useScrollTimeline
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gsap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/gsap.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__ = __turbopack_context__.i("[project]/node_modules/gsap/index.js [app-client] (ecmascript) <locals> <export default as gsap>");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function useScrollTimeline(triggerRef, scrollState) {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useScrollTimeline.useEffect": ()=>{
            if (!triggerRef.current) return;
            const progress = {
                value: 0
            };
            const tween = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(progress, {
                value: 1,
                ease: "none",
                scrollTrigger: {
                    trigger: triggerRef.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: 1.0
                },
                onUpdate: {
                    "useScrollTimeline.useEffect.tween": ()=>{
                        const p = progress.value;
                        scrollState.current.progress = p;
                        const baseRotY = p * Math.PI * 2;
                        if (p <= 0.70) {
                            scrollState.current.rotY = baseRotY;
                            scrollState.current.rotX = 0;
                            scrollState.current.posY = 0;
                            scrollState.current.scale = 1.0;
                        } else {
                            // As the section end approaches and reaches the top of the viewport (0.70 -> 1.0):
                            // The emblem moves down out of the frame
                            const exitT = (p - 0.70) / 0.30; // 0 to 1
                            const exitEase = 1 - Math.pow(1 - exitT, 2); // smooth curve
                            scrollState.current.posY = -exitEase * 6.5;
                            scrollState.current.rotX = exitEase * 0.5;
                            scrollState.current.rotY = baseRotY + exitEase * 1.2;
                            scrollState.current.scale = 1.0 - exitEase * 0.12;
                        }
                    }
                }["useScrollTimeline.useEffect.tween"]
            });
            return ({
                "useScrollTimeline.useEffect": ()=>{
                    tween.scrollTrigger?.kill();
                    tween.kill();
                }
            })["useScrollTimeline.useEffect"];
        }
    }["useScrollTimeline.useEffect"], [
        triggerRef,
        scrollState
    ]);
}
_s(useScrollTimeline, "OD7bBpZva5O2jO+Puf00hKivP7c=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_1h6qrfn._.js.map