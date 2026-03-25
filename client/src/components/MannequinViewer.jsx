import React, { useRef, useEffect, useState, useCallback } from 'react';

/**
 * MannequinViewer v2
 * Renders a dark fashion mannequin on an HTML5 Canvas.
 * The product image is texture-mapped onto the garment area using
 * perspective-aware quad transforms, simulating a 3D 360° rotation.
 */

// ─── Perspective quad-warp helper ────────────────────────────────────────────
// Draws a sub-region of an image warped into an arbitrary quadrilateral.
function drawTexturedQuad(ctx, img, quad, srcRect) {
    const { x: sx, y: sy, w: sw, h: sh } = srcRect;
    const [tl, tr, br, bl] = quad;

    const STEPS = 30; // mesh divisions for smooth warp

    for (let row = 0; row < STEPS; row++) {
        for (let col = 0; col < STEPS; col++) {
            const u0 = col / STEPS, u1 = (col + 1) / STEPS;
            const v0 = row / STEPS, v1 = (row + 1) / STEPS;

            // Bilinear interpolation of the 4 quad corners
            const lerp = (a, b, t) => a + (b - a) * t;
            const bilinear = (tl, tr, br, bl, u, v) => ({
                x: lerp(lerp(tl.x, tr.x, u), lerp(bl.x, br.x, u), v),
                y: lerp(lerp(tl.y, tr.y, u), lerp(bl.y, br.y, u), v),
            });

            const p00 = bilinear(tl, tr, br, bl, u0, v0);
            const p10 = bilinear(tl, tr, br, bl, u1, v0);
            const p11 = bilinear(tl, tr, br, bl, u1, v1);
            const p01 = bilinear(tl, tr, br, bl, u0, v1);

            const srcX = sx + u0 * sw;
            const srcY = sy + v0 * sh;
            const srcW = (u1 - u0) * sw + 2; // +2 avoids seams
            const srcH = (v1 - v0) * sh + 2;

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(p00.x, p00.y);
            ctx.lineTo(p10.x, p10.y);
            ctx.lineTo(p11.x, p11.y);
            ctx.lineTo(p01.x, p01.y);
            ctx.closePath();
            ctx.clip();

            // Transform matrix to map src rect → dest quad cell
            const dw = p10.x - p00.x;
            const dh = p11.y - p10.y;
            const a = dw / srcW;
            const d = (p01.y - p00.y) / srcH;
            const b = (p11.x - p10.x - dw) / srcH;
            const c = (p10.y - p00.y) / srcW;

            ctx.setTransform(a, c, b, d, p00.x, p00.y);
            ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);
            ctx.restore();
        }
    }
}

// ─── Mannequin geometry at a given rotation angle ────────────────────────────
function getMannequinGeometry(W, H, angle) {
    // angle: 0 = front, 90 = right side, 180 = back, 270 = left side
    const cx = W / 2;
    const rad = (angle * Math.PI) / 180;

    // How much the body appears "squished" from the side (perspective factor)
    const depthFactor = Math.cos(rad); // 1=front, 0=side, -1=back
    const absDepth = Math.abs(depthFactor);
    const horizScale = 0.45 + 0.55 * absDepth; // body width scale

    // ── Key proportions ──────────────────────────────────────────────────────
    const headTop = H * 0.035;
    const headBot = H * 0.135;
    const neckTop = H * 0.138;
    const neckBot = H * 0.168;
    const shoulder = H * 0.190;
    const bust = H * 0.270;
    const waist = H * 0.390;
    const hip = H * 0.455;
    const hemBot = H * 0.870;
    const legSplit = H * 0.865;

    // Body half-widths
    const shoulderHW = horizScale * W * 0.195;
    const bustHW = horizScale * W * 0.175;
    const waistHW = horizScale * W * 0.120;
    const hipHW = horizScale * W * 0.185;
    const hemHW = horizScale * W * 0.145;
    const neckHW = horizScale * W * 0.048;
    const headRX = horizScale * W * 0.075;
    const headRY = (headBot - headTop) / 2;

    // Arm positions
    const armTopY = shoulder;
    const armBotY = waist;
    const armOutX = cx + horizScale * W * 0.265;
    const armInX = cx + horizScale * W * 0.220;
    const armW = horizScale * W * 0.060;

    return {
        cx, depthFactor, absDepth,
        headTop, headBot, neckTop, neckBot,
        shoulder, bust, waist, hip, hemBot, legSplit,
        shoulderHW, bustHW, waistHW, hipHW, hemHW, neckHW,
        headRX, headRY,
        armTopY, armBotY, armOutX, armInX, armW,
    };
}

// ─── The Canvas component ─────────────────────────────────────────────────────
const MannequinViewer = ({ productImage, productName }) => {
    const canvasRef = useRef(null);
    const imgRef = useRef(null);
    const animRef = useRef(null);
    const rotRef = useRef(0);
    const dragRef = useRef(false);
    const lastXRef = useRef(0);
    const velRef = useRef(0);
    const autoRef = useRef(true);
    const imgLoadRef = useRef(false);

    const [hint, setHint] = useState(true);
    const [isDragging, setIsDragging] = useState(false);

    // Dismiss hint
    useEffect(() => {
        const t = setTimeout(() => setHint(false), 3500);
        return () => clearTimeout(t);
    }, []);

    // Load product image
    useEffect(() => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            imgRef.current = img;
            imgLoadRef.current = true;
        };
        img.onerror = () => {
            // Fallback: create a solid-color canvas as texture
            const fb = document.createElement('canvas');
            fb.width = 400; fb.height = 600;
            const gc = fb.getContext('2d');
            gc.fillStyle = '#5e8a6e';
            gc.fillRect(0, 0, 400, 600);
            imgRef.current = fb;
            imgLoadRef.current = true;
        };
        img.src = productImage;
    }, [productImage]);

    // ── Main draw function ───────────────────────────────────────────────────
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;

        // Clear with a soft gradient background
        ctx.clearRect(0, 0, W, H);
        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, '#f8fbff');
        bg.addColorStop(1, '#e8f4f2');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        // Subtle ground shadow
        const shadowGrad = ctx.createRadialGradient(W / 2, H - 28, 5, W / 2, H - 28, W * 0.38);
        shadowGrad.addColorStop(0, 'rgba(0,0,0,0.18)');
        shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = shadowGrad;
        ctx.fillRect(0, 0, W, H);

        const angle = ((rotRef.current % 360) + 360) % 360;
        const G = getMannequinGeometry(W, H, angle);
        const { cx, depthFactor, absDepth } = G;

        const isFrontish = Math.abs(depthFactor) > 0.05;
        const isBack = angle > 90 && angle < 270;

        // ── 1. Draw fabric/garment texture on the body ───────────────────────
        if (imgLoadRef.current && imgRef.current && isFrontish) {
            const img = imgRef.current;
            const imgW = img.width || img.naturalWidth || 400;
            const imgH = img.height || img.naturalHeight || 600;

            // Perspective-shifted x for the left/right edges
            const shift = depthFactor >= 0 ? 1 : -1; // which way we're tilted

            // Front face of dress quad
            const dressQuad = [
                { x: cx - G.shoulderHW * 0.9, y: G.shoulder },   // top-left
                { x: cx + G.shoulderHW * 0.9, y: G.shoulder },   // top-right
                { x: cx + G.hemHW, y: G.hemBot },       // bot-right
                { x: cx - G.hemHW, y: G.hemBot },       // bot-left
            ];

            // When rotating right (depthFactor < 0), compress left side; right side normal
            if (depthFactor < 0) {
                // Left side pulls in (rotating to left view)
                dressQuad[0].x = cx - G.shoulderHW * (1 + depthFactor) * 0.9;
                dressQuad[3].x = cx - G.hemHW * (1 + depthFactor);
            } else {
                // Right side pulls in (rotating to right view)
                dressQuad[1].x = cx + G.shoulderHW * (1 - depthFactor) * 0.9;
                dressQuad[2].x = cx + G.hemHW * (1 - depthFactor);
            }

            ctx.save();
            ctx.globalAlpha = 1;
            // Brightness to simulate lighting: brightest at front, darker at sides
            const brightness = 0.65 + 0.45 * absDepth;
            ctx.filter = `brightness(${brightness})`;
            drawTexturedQuad(ctx, img,
                dressQuad,
                { x: 0, y: 0, w: imgW, h: imgH }
            );
            ctx.filter = 'none';
            ctx.restore();

            // Side shading overlay
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(dressQuad[0].x, dressQuad[0].y);
            ctx.lineTo(dressQuad[1].x, dressQuad[1].y);
            ctx.lineTo(dressQuad[2].x, dressQuad[2].y);
            ctx.lineTo(dressQuad[3].x, dressQuad[3].y);
            ctx.closePath();
            const shadeDir = depthFactor >= 0 ? cx - G.shoulderHW : cx + G.shoulderHW;
            const shGrad = ctx.createLinearGradient(shadeDir, 0, G.cx, 0);
            shGrad.addColorStop(0, 'rgba(0,0,0,0.28)');
            shGrad.addColorStop(0.5, 'rgba(0,0,0,0)');
            shGrad.addColorStop(1, 'rgba(0,0,0,0.08)');
            ctx.fillStyle = shGrad;
            ctx.fill();
            ctx.restore();
        }

        // ── 2. Draw dark mannequin body (black/charcoal silhouette) ──────────
        const bodyColor = isBack
            ? '#1a1a1a'
            : ctx.createLinearGradient(cx - G.shoulderHW, 0, cx + G.shoulderHW, 0);

        if (!isBack) {
            bodyColor.addColorStop(0, '#2a2a2a');
            bodyColor.addColorStop(0.3, '#1a1a1a');
            bodyColor.addColorStop(0.5, '#333333');
            bodyColor.addColorStop(0.7, '#1a1a1a');
            bodyColor.addColorStop(1, '#111111');
        }

        // ── Head ────────────────────────────────────────────────────────────
        const headCY = (G.headTop + G.headBot) / 2;
        const headGrad = ctx.createRadialGradient(
            cx - G.headRX * 0.2, headCY - G.headRY * 0.2, 2,
            cx, headCY, G.headRX
        );
        headGrad.addColorStop(0, '#3c3c3c');
        headGrad.addColorStop(1, '#111111');
        ctx.beginPath();
        ctx.ellipse(cx, headCY, G.headRX, G.headRY, 0, 0, Math.PI * 2);
        ctx.fillStyle = headGrad;
        ctx.fill();

        // ── Neck ────────────────────────────────────────────────────────────
        ctx.beginPath();
        ctx.roundRect(cx - G.neckHW, G.neckTop, G.neckHW * 2, G.neckBot - G.neckTop, 4);
        ctx.fillStyle = '#1a1a1a';
        ctx.fill();

        // ── Left arm (mirrored when we have texture) ─────────────────────────
        const drawArm = (side) => {
            // side: +1 = right, -1 = left
            const topX = cx + side * G.shoulderHW * 0.82;
            const botX = cx + side * (G.shoulderHW * 0.82 + G.armW * 1.5);
            const armW2 = G.armW;
            ctx.beginPath();
            ctx.moveTo(topX - armW2 / 2, G.armTopY);
            ctx.lineTo(topX + armW2 / 2, G.armTopY);
            ctx.lineTo(botX + armW2 / 2, G.armBotY);
            ctx.lineTo(botX - armW2 / 2, G.armBotY);
            ctx.closePath();
            ctx.fillStyle = bodyColor;
            ctx.fill();
        };

        // In full side view we only show one arm
        if (absDepth > 0.15 || depthFactor < 0) drawArm(-1);  // left
        if (absDepth > 0.15 || depthFactor > 0) drawArm(+1);  // right

        // ── Torso body (drawn on top of texture) — exposed skin/mannequin ───
        // Draw only the shoulders + upper neckline, not the whole body
        // so the fabric shows through the middle
        const drawShoulder = (side) => {
            ctx.beginPath();
            ctx.moveTo(cx + side * G.neckHW, G.neckBot);
            ctx.lineTo(cx + side * G.shoulderHW, G.shoulder);
            ctx.lineTo(cx + side * G.bustHW, G.bust * 0.92);
            ctx.lineTo(cx + side * G.bustHW * 0.7, G.bust);
            ctx.lineTo(cx + side * G.neckHW * 1.2, G.shoulder * 1.12);
            ctx.closePath();
            ctx.fillStyle = bodyColor;
            ctx.fill();
        };
        drawShoulder(-1);
        drawShoulder(+1);

        // ── Legs (below dress hem) ───────────────────────────────────────────
        const legHW = G.hemHW * 0.42;
        [-1, 1].forEach(side => {
            ctx.beginPath();
            ctx.moveTo(cx + side * G.hemHW * 0.25, G.legSplit);
            ctx.lineTo(cx + side * G.hemHW * 0.65, G.legSplit);
            ctx.lineTo(cx + side * legHW * 1.05, H - 10);
            ctx.lineTo(cx + side * legHW * 0.10, H - 10);
            ctx.closePath();
            const legGrad = ctx.createLinearGradient(
                cx, G.legSplit, cx, H
            );
            legGrad.addColorStop(0, '#2a2a2a');
            legGrad.addColorStop(1, '#111111');
            ctx.fillStyle = legGrad;
            ctx.fill();
        });

        // ── Specular highlight on head ───────────────────────────────────────
        const specGrad = ctx.createRadialGradient(
            cx - G.headRX * 0.3, headCY - G.headRY * 0.4, 0,
            cx - G.headRX * 0.3, headCY - G.headRY * 0.4, G.headRX * 0.7
        );
        specGrad.addColorStop(0, 'rgba(255,255,255,0.18)');
        specGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.beginPath();
        ctx.ellipse(cx, headCY, G.headRX, G.headRY, 0, 0, Math.PI * 2);
        ctx.fillStyle = specGrad;
        ctx.fill();

        // ── Thin teal outline on shoulders ───────────────────────────────────
        ctx.beginPath();
        ctx.moveTo(cx - G.shoulderHW, G.shoulder);
        ctx.lineTo(cx + G.shoulderHW, G.shoulder);
        ctx.strokeStyle = 'rgba(20,184,166,0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();

    }, []);

    // ── Animation loop ───────────────────────────────────────────────────────
    const animate = useCallback(() => {
        if (!dragRef.current) {
            if (autoRef.current) {
                rotRef.current += 0.28;
            } else {
                velRef.current *= 0.92;
                rotRef.current += velRef.current;
                if (Math.abs(velRef.current) < 0.06) {
                    autoRef.current = true;
                }
            }
        }
        draw();
        animRef.current = requestAnimationFrame(animate);
    }, [draw]);

    useEffect(() => {
        animRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animRef.current);
    }, [animate]);

    // ── Canvas resize observer ───────────────────────────────────────────────
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ro = new ResizeObserver(() => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        });
        ro.observe(canvas);
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        return () => ro.disconnect();
    }, []);

    // ── Drag handlers ────────────────────────────────────────────────────────
    const startDrag = (x) => {
        dragRef.current = true;
        autoRef.current = false;
        lastXRef.current = x;
        velRef.current = 0;
        setIsDragging(true);
        setHint(false);
    };
    const moveDrag = (x) => {
        if (!dragRef.current) return;
        const delta = x - lastXRef.current;
        velRef.current = delta * 0.45;
        rotRef.current += delta * 0.35;
        lastXRef.current = x;
    };
    const endDrag = () => {
        dragRef.current = false;
        setIsDragging(false);
    };

    return (
        <div style={{ position: 'relative', width: '100%', paddingBottom: '115%' }}>
            {/* Canvas */}
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    borderRadius: '16px',
                    display: 'block',
                }}
                onMouseDown={e => startDrag(e.clientX)}
                onMouseMove={e => moveDrag(e.clientX)}
                onMouseUp={endDrag}
                onMouseLeave={endDrag}
                onTouchStart={e => startDrag(e.touches[0].clientX)}
                onTouchMove={e => { e.preventDefault(); moveDrag(e.touches[0].clientX); }}
                onTouchEnd={endDrag}
            />

            {/* 360° badge */}
            <div style={{
                position: 'absolute', bottom: 14, right: 14,
                background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                color: '#fff', fontSize: '11px', fontWeight: 700,
                padding: '5px 12px', borderRadius: '999px',
                boxShadow: '0 3px 14px rgba(20,184,166,0.5)',
                display: 'flex', alignItems: 'center', gap: '5px',
                pointerEvents: 'none',
            }}>
                <span style={{ animation: 'spin-manq 3s linear infinite', display: 'inline-block' }}>↻</span>
                360°
            </div>

            {/* Drag hint */}
            <div style={{
                position: 'absolute', bottom: 14, left: 14,
                background: 'rgba(0,0,0,0.52)',
                backdropFilter: 'blur(8px)',
                color: '#fff', fontSize: '11px', fontWeight: 500,
                padding: '5px 12px', borderRadius: '999px',
                display: 'flex', alignItems: 'center', gap: '6px',
                pointerEvents: 'none',
                opacity: hint ? 1 : 0,
                transition: 'opacity 0.8s ease',
            }}>
                <span>👆</span> Drag to rotate
            </div>

            <style>{`
                @keyframes spin-manq {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default MannequinViewer;
