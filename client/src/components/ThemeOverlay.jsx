import React, { useState, useEffect, useRef } from 'react';
import { Palette, Sparkles, X, Settings } from 'lucide-react';

const THEMES = [
    { id: 'standard', name: 'Standard', icon: '✨', description: 'Classic green & teal Vastra Kuteer theme' },
    { id: 'diwali', name: 'Diwali', icon: '🪔', description: 'Golden diya glows and sparkler particles' },
    { id: 'holi', name: 'Holi', icon: '🎨', description: 'Splash visual overlays and color click bursts' },
    { id: 'sankranti', name: 'Sankranti', icon: '🪁', description: 'Colorful kites floating in the sky' }
];

const ThemeOverlay = () => {
    const [activeTheme, setActiveTheme] = useState(() => {
        return localStorage.getItem('vastra_theme') || 'standard';
    });
    const [isOpen, setIsOpen] = useState(false);
    const canvasRef = useRef(null);

    // Apply theme classes to body for styling hooks
    useEffect(() => {
        const bodyClassList = document.body.classList;
        THEMES.forEach(t => bodyClassList.remove(`theme-${t.id}`));
        bodyClassList.add(`theme-${activeTheme}`);
        localStorage.setItem('vastra_theme', activeTheme);
    }, [activeTheme]);

    // HTML5 Canvas animations for different themes
    useEffect(() => {
        if (activeTheme === 'standard') {
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];
        let clicks = [];

        // Handle resize
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);
        handleResize();

        // Particle definitions
        class SparkleParticle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * -canvas.height;
                this.size = Math.random() * 3 + 1;
                this.speedY = Math.random() * 1.5 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.7 + 0.3;
                this.color = `hsla(${Math.random() * 15 + 40}, 100%, 70%, ${this.opacity})`; // Gold sparks
                this.flickerSpeed = Math.random() * 0.05 + 0.01;
            }

            update() {
                this.y += this.speedY;
                this.x += this.speedX;
                this.opacity -= this.flickerSpeed;
                if (this.opacity <= 0) {
                    this.y = Math.random() * -100;
                    this.x = Math.random() * canvas.width;
                    this.opacity = Math.random() * 0.7 + 0.3;
                }
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#fbbf24';
                ctx.fill();
                ctx.restore();
            }
        }

        class HoliClickParticle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 8 + 4;
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 4 + 2;
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed;
                this.gravity = 0.1;
                this.opacity = 1;
                this.decay = Math.random() * 0.02 + 0.015;
                const hue = Math.random() * 360;
                this.color = `hsla(${hue}, 100%, 60%, ${this.opacity})`;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.vy += this.gravity;
                this.opacity -= this.decay;
            }

            draw() {
                ctx.save();
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color.replace(this.opacity.toString(), Math.max(0, this.opacity).toString());
                ctx.fill();
                ctx.restore();
            }
        }

        class KiteParticle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + Math.random() * 200;
                this.size = Math.random() * 20 + 15;
                this.speedY = -(Math.random() * 1 + 0.5);
                this.speedX = Math.sin(this.y * 0.01) * 0.8;
                this.color = `hsla(${Math.random() * 360}, 85%, 65%, 0.85)`;
                this.rotation = (Math.random() - 0.5) * 0.2;
            }

            update() {
                this.y += this.speedY;
                this.x += Math.sin(this.y * 0.01) * 0.4;
                if (this.y < -100) {
                    this.y = canvas.height + 100;
                    this.x = Math.random() * canvas.width;
                }
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);

                // Draw diamond shape
                ctx.beginPath();
                ctx.moveTo(0, -this.size / 2);
                ctx.lineTo(this.size / 2, 0);
                ctx.lineTo(0, this.size / 2);
                ctx.lineTo(-this.size / 2, 0);
                ctx.closePath();
                ctx.fillStyle = this.color;
                ctx.fill();

                // Cross spars
                ctx.strokeStyle = 'rgba(255,255,255,0.6)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(0, -this.size / 2);
                ctx.lineTo(0, this.size / 2);
                ctx.moveTo(-this.size / 2, 0);
                ctx.lineTo(this.size / 2, 0);
                ctx.stroke();

                // Kite Tail (Triangle at bottom)
                ctx.beginPath();
                ctx.moveTo(0, this.size / 2);
                ctx.lineTo(-this.size / 5, this.size / 2 + this.size / 5);
                ctx.lineTo(this.size / 5, this.size / 2 + this.size / 5);
                ctx.closePath();
                ctx.fillStyle = '#f43f5e';
                ctx.fill();

                // Kite String (squiggly line)
                ctx.strokeStyle = 'rgba(0,0,0,0.15)';
                ctx.beginPath();
                ctx.moveTo(0, this.size / 2 + this.size / 5);
                ctx.bezierCurveTo(
                    Math.sin(this.y * 0.05) * 10, this.size,
                    -Math.sin(this.y * 0.05) * 10, this.size * 1.5,
                    0, this.size * 2
                );
                ctx.stroke();

                ctx.restore();
            }
        }

        // Initialize particles
        if (activeTheme === 'diwali') {
            for (let i = 0; i < 75; i++) {
                particles.push(new SparkleParticle());
            }
        } else if (activeTheme === 'sankranti') {
            for (let i = 0; i < 12; i++) {
                particles.push(new KiteParticle());
            }
        }

        // Handle Holi Mouse Clicks
        const handleWindowClick = (e) => {
            if (activeTheme === 'holi') {
                for (let i = 0; i < 20; i++) {
                    clicks.push(new HoliClickParticle(e.clientX, e.clientY));
                }
            }
        };
        window.addEventListener('click', handleWindowClick);

        // Animation Loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update & Draw particles
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            // Update & Draw Holi bursts
            if (activeTheme === 'holi') {
                clicks = clicks.filter(c => c.opacity > 0);
                clicks.forEach(c => {
                    c.update();
                    c.draw();
                });
            }

            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('click', handleWindowClick);
            cancelAnimationFrame(animationFrameId);
        };
    }, [activeTheme]);

    return (
        <>
            {/* HTML5 Canvas Overlay */}
            {activeTheme !== 'standard' && (
                <canvas
                    ref={canvasRef}
                    className="fixed inset-0 pointer-events-none z-[80]"
                    style={{ zIndex: 80 }}
                />
            )}

            {/* Corner Decorative Elements */}
            {activeTheme === 'diwali' && (
                <div className="fixed top-24 left-0 right-0 flex justify-between px-6 pointer-events-none z-[75] select-none">
                    <span className="text-3xl animate-pulse">🪔</span>
                    <span className="text-3xl animate-pulse">🪔</span>
                </div>
            )}
            {activeTheme === 'holi' && (
                <div className="fixed top-24 left-0 pointer-events-none z-[75] select-none opacity-20">
                    <div className="w-24 h-24 bg-red-500 rounded-full blur-xl absolute -top-8 -left-8"></div>
                    <div className="w-24 h-24 bg-yellow-500 rounded-full blur-xl absolute top-8 -left-12"></div>
                </div>
            )}

            {/* Floating Trigger Switcher Tab */}
            <div className="fixed left-0 top-1/3 z-[100] flex items-center">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-3 bg-vastra-teal text-white rounded-r-2xl shadow-[4px_4px_15px_rgba(13,148,136,0.3)] border-t border-r border-b border-teal-500/30 flex items-center justify-center transform hover:scale-105 transition-all duration-300 relative group"
                    title="Festive Visual Themes"
                >
                    <Palette className="h-5 w-5 animate-spin-slow text-yellow-300" />
                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-out whitespace-nowrap text-xs font-bold font-sans ml-0 group-hover:ml-2">
                        Themes
                    </span>
                    {activeTheme !== 'standard' && (
                        <span className="absolute -top-1 -right-1 bg-vastra-gold text-white text-[9px] px-1 rounded-full animate-bounce">
                            Live
                        </span>
                    )}
                </button>

                {/* Sidebar Drawer */}
                <div className={`fixed left-0 top-0 h-full w-80 shadow-[10px_0_40px_rgba(0,0,0,0.15)] z-[100] transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col p-6 border-r border-violet-100 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                    style={{ background: 'linear-gradient(135deg, #FAF9FF 0%, #FAF6FF 100%)' }}>
                    
                    <div className="flex justify-between items-center mb-6 pb-3 border-b border-violet-100">
                        <div className="flex items-center space-x-2 text-vastra-teal">
                            <Palette className="h-5 w-5" />
                            <h3 className="font-serif font-bold text-gray-900 text-lg">Festive Themes</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                        Customize your Vastra Kuteer shopping experience with custom seasonal celebrations and ambient animations.
                    </p>

                    <div className="flex-1 space-y-4">
                        {THEMES.map(theme => {
                            const isSelected = activeTheme === theme.id;
                            return (
                                <button
                                    key={theme.id}
                                    onClick={() => setActiveTheme(theme.id)}
                                    className={`w-full p-4 rounded-2xl text-left border flex items-start space-x-4 transition-all duration-300 transform active:scale-98 ${
                                        isSelected
                                            ? 'border-vastra-teal bg-white shadow-[0_10px_25px_rgba(13,148,136,0.1)]'
                                            : 'border-transparent bg-white/40 hover:bg-white/90 hover:shadow-md'
                                    }`}
                                >
                                    <div className="text-3xl p-2 bg-violet-50 rounded-xl flex items-center justify-center">
                                        {theme.icon}
                                    </div>
                                    <div>
                                        <h4 className={`font-bold text-sm ${isSelected ? 'text-vastra-teal' : 'text-gray-800'}`}>
                                            {theme.name}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {theme.description}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-auto border-t border-violet-100 pt-4 text-center">
                        <span className="text-[10px] text-gray-400 font-medium">
                            🪔 Celebrating Indian Handlooms 🪁
                        </span>
                    </div>
                </div>
            </div>

            {/* Custom Animation Styling */}
            <style>{`
                .animate-spin-slow {
                    animation: spin 8s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                /* Theme overrides for main body or elements if active */
                .theme-diwali {
                    background-color: #FFFDF4 !important; /* warm yellow tint */
                }
                .theme-sankranti {
                    background-color: #F3FBFF !important; /* sky blue tint */
                }
                .theme-holi {
                    background-color: #FFF9FC !important; /* soft splash rose tint */
                }
            `}</style>
        </>
    );
};

export default ThemeOverlay;
