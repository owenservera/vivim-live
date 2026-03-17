document.addEventListener('DOMContentLoaded', () => {
    // ========================================
    // 1. THREE.JS HERO BACKGROUND
    // ========================================
    const heroCanvas = document.getElementById('hero-3d-canvas');
    if (heroCanvas && typeof THREE !== 'undefined') {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({
            canvas: heroCanvas,
            alpha: true,
            antialias: true
        });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Create particle network
        const particlesGeometry = new THREE.BufferGeometry();
        const particleCount = 200;

        const positions = new Float32Array(particleCount * 3);
        const velocities = [];

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 10;
            positions[i + 1] = (Math.random() - 0.5) * 10;
            positions[i + 2] = (Math.random() - 0.5) * 10;

            velocities.push({
                x: (Math.random() - 0.5) * 0.002,
                y: (Math.random() - 0.5) * 0.002,
                z: (Math.random() - 0.5) * 0.002
            });
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            color: 0x00D4E8,
            size: 0.05,
            transparent: true,
            opacity: 0.8
        });

        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particles);

        // Create connections between nearby particles
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x00D4E8,
            transparent: true,
            opacity: 0.15
        });

        const lineGeometry = new THREE.BufferGeometry();
        const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
        scene.add(lines);

        camera.position.z = 5;

        // Mouse interaction
        let mouseX = 0;
        let mouseY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);

            // Update particle positions
            const positions = particlesGeometry.attributes.position.array;

            for (let i = 0; i < particleCount; i++) {
                positions[i * 3] += velocities[i].x;
                positions[i * 3 + 1] += velocities[i].y;
                positions[i * 3 + 2] += velocities[i].z;

                // Boundary check
                if (Math.abs(positions[i * 3]) > 5) velocities[i].x *= -1;
                if (Math.abs(positions[i * 3 + 1]) > 5) velocities[i].y *= -1;
                if (Math.abs(positions[i * 3 + 2]) > 5) velocities[i].z *= -1;
            }

            particlesGeometry.attributes.position.needsUpdate = true;

            // Update connections
            const connectionPositions = [];
            const connectionDistance = 1.5;

            for (let i = 0; i < particleCount; i++) {
                for (let j = i + 1; j < particleCount; j++) {
                    const dx = positions[i * 3] - positions[j * 3];
                    const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
                    const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                    if (distance < connectionDistance) {
                        connectionPositions.push(
                            positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
                            positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
                        );
                    }
                }
            }

            lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(connectionPositions, 3));

            // Mouse parallax
            camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
            camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.05;
            camera.lookAt(scene.position);

            // Subtle rotation
            particles.rotation.y += 0.0005;
            lines.rotation.y += 0.0005;

            renderer.render(scene, camera);
        }

        animate();

        // Handle resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // ========================================
    // 2. SCROLL PROGRESS & SCROLLYTELLING
    // ========================================
    const progressBar = document.getElementById('progress-bar');
    const progressSections = document.querySelectorAll('.progress-section');
    const sections = document.querySelectorAll('section[id]');

    // Update progress bar
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;

        if (progressBar) {
            progressBar.style.width = scrollPercent + '%';
        }

        // Update active section indicator
        sections.forEach((section) => {
            const sectionTop = section.offsetTop - 200;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollTop >= sectionTop && scrollTop < sectionTop + sectionHeight) {
                progressSections.forEach((ps) => {
                    ps.classList.remove('active');
                    if (ps.getAttribute('data-section') === sectionId) {
                        ps.classList.add('active');
                    }
                });
            }
        });
    });

    // Click on progress section to scroll to it
    progressSections.forEach((ps) => {
        ps.addEventListener('click', () => {
            const targetSection = ps.getAttribute('data-section');
            const section = document.getElementById(targetSection);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ========================================
    // 3. KINETIC TYPOGRAPHY
    // ========================================
    const kineticText = document.getElementById('kinetic-headline');
    const kineticSections = document.querySelectorAll('.kinetic-section');

    if (kineticText) {
        const words = kineticText.querySelectorAll('.word');

        // Word-by-word reveal on scroll
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    words.forEach((word, index) => {
                        setTimeout(() => {
                            word.style.opacity = '1';
                            word.style.transform = 'translateY(0)';
                        }, index * 100);
                    });
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        revealObserver.observe(kineticText);
    }

    // Section headers animation
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.2 });

    kineticSections.forEach((section) => {
        sectionObserver.observe(section);
    });

    // ========================================
    // 4. TL;DR SUMMARY TOGGLE
    // ========================================
    const tldrToggle = document.getElementById('tldr-toggle');
    const tldrContent = document.querySelector('.tldr-content');

    if (tldrToggle && tldrContent) {
        tldrToggle.addEventListener('click', () => {
            tldrContent.classList.toggle('active');
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!tldrToggle.contains(e.target) && !tldrContent.contains(e.target)) {
                tldrContent.classList.remove('active');
            }
        });
    }

    // ========================================
    // 5. THEME TOGGLE
    // ========================================
    const themeToggle = document.getElementById('theme-toggle');

    if (themeToggle) {
        // Check for saved theme
        const savedTheme = localStorage.getItem('vivim-theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }

        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');

            themeToggle.innerHTML = isLight ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

            // Save preference
            localStorage.setItem('vivim-theme', isLight ? 'light' : 'dark');
        });
    }

    // ========================================
    // 6. DOCUMENTATION SEARCH & ACCORDION
    // ========================================
    const docsSearch = document.getElementById('docs-search');
    const docsItems = document.querySelectorAll('.docs-item');
    const docsToggles = document.querySelectorAll('.docs-toggle');

    // Search functionality
    if (docsSearch) {
        docsSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();

            docsItems.forEach((item) => {
                const title = item.querySelector('.docs-toggle-header span')?.textContent.toLowerCase() || '';
                const content = item.querySelector('.docs-content')?.textContent.toLowerCase() || '';

                if (title.includes(query) || content.includes(query)) {
                    item.style.display = 'block';
                    // Auto-expand if search matches
                    if (query.length > 2) {
                        const toggle = item.querySelector('.docs-toggle');
                        if (toggle && toggle.getAttribute('aria-expanded') === 'false') {
                            toggle.click();
                        }
                    }
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // Accordion functionality
    docsToggles.forEach((toggle) => {
        toggle.addEventListener('click', () => {
            const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
            const content = toggle.nextElementSibling;

            // Close all others
            docsToggles.forEach((otherToggle) => {
                if (otherToggle !== toggle) {
                    otherToggle.setAttribute('aria-expanded', 'false');
                    otherToggle.nextElementSibling.style.maxHeight = '0';
                }
            });

            // Toggle current
            toggle.setAttribute('aria-expanded', !isExpanded);
            content.style.maxHeight = isExpanded ? '0' : content.scrollHeight + 'px';
        });
    });

    // Copy code functionality
    const copyButtons = document.querySelectorAll('.code-copy');
    copyButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const codeBlock = btn.nextElementSibling.querySelector('code');
            const code = codeBlock.textContent;

            navigator.clipboard.writeText(code).then(() => {
                const originalIcon = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i>';
                btn.style.color = 'var(--vivim-green)';

                setTimeout(() => {
                    btn.innerHTML = originalIcon;
                    btn.style.color = '';
                }, 2000);
            });
        });
    });

    // ========================================
    // 7. AI PERSONALIZATION (Visitor Detection)
    // ========================================
    let scrollDepth = 0;
    let timeOnPage = 0;
    let visitorType = null;

    // Track scroll depth
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const currentScrollDepth = (scrollTop / docHeight) * 100;

        if (currentScrollDepth > scrollDepth) {
            scrollDepth = currentScrollDepth;
        }
    });

    // Track time on page
    setInterval(() => {
        timeOnPage++;
    }, 1000);

    // Determine visitor type
    function detectVisitorType() {
        // High scroll depth to docs + longer time = Developer/Technical
        if (scrollDepth > 60 && timeOnPage > 30) {
            return 'developer';
        }
        // Moderate scroll + shorter time = Investor/Visionary
        else if (scrollDepth > 30 && timeOnPage > 15) {
            return 'investor';
        }
        return 'explorer';
    }

    // Personalize based on visitor type
    function personalizeForVisitor() {
        visitorType = detectVisitorType();

        if (visitorType === 'developer') {
            // Highlight docs section
            const docsSection = document.getElementById('docs');
            if (docsSection) {
                docsSection.style.scrollMarginTop = '100px';
            }
        } else if (visitorType === 'investor') {
            // Emphasize vision and stats
            const heroStats = document.querySelector('.hero-stats');
            if (heroStats) {
                heroStats.style.transform = 'scale(1.05)';
                heroStats.style.transition = 'transform 0.3s';
            }
        }

        console.log('Visitor type detected:', visitorType);
    }

    // Detect after 10 seconds
    setTimeout(personalizeForVisitor, 10000);

    // ========================================
    // 8. INJECT ANIMATION DELAYS (Existing)
    // ========================================
    const animatedElements = document.querySelectorAll('[style*="--delay"]');
    animatedElements.forEach(el => {
        const delay = el.style.getPropertyValue('--delay');
        el.style.animationDelay = delay;
    });

    // ========================================
    // 9. AMBIENT BACKGROUND EFFECT SPAWNING (Existing)
    // ========================================
    const ambientContainer = document.getElementById('ambient-canvas');
    if (ambientContainer) {
        const colors = ['orb-1', 'orb-2', 'orb-3'];
        colors.forEach(className => {
            const orb = document.createElement('div');
            orb.className = `orb ${className}`;
            ambientContainer.appendChild(orb);

            // Fade in orbs gradually
            setTimeout(() => {
                orb.classList.add('visible');
            }, 100);
        });
    }

    // ========================================
    // 10. FLUID CURSOR GLOW EFFECT (Existing)
    // ========================================
    const cursorGlow = document.querySelector('.cursor-glow');
    let cursorMouseX = window.innerWidth / 2;
    let cursorMouseY = window.innerHeight / 2;
    let cursorGlowX = cursorMouseX;
    let cursorGlowY = cursorMouseY;

    document.addEventListener('mousemove', (e) => {
        cursorMouseX = e.clientX;
        cursorMouseY = e.clientY;
    });

    function animateGlow() {
        // Easing factor for smooth trailing
        cursorGlowX += (cursorMouseX - cursorGlowX) * 0.08;
        cursorGlowY += (cursorMouseY - cursorGlowY) * 0.08;

        if (cursorGlow) {
            cursorGlow.style.left = `${cursorGlowX}px`;
            cursorGlow.style.top = `${cursorGlowY}px`;
        }

        requestAnimationFrame(animateGlow);
    }
    animateGlow();

    // ========================================
    // 11. LOGO 3D TILT EFFECT ON HOVER (Existing)
    // ========================================
    const tiltWrapper = document.getElementById('tilt-wrapper');
    const logoImg = document.getElementById('logo-img');

    if (tiltWrapper && logoImg) {
        tiltWrapper.addEventListener('mousemove', (e) => {
            const rect = tiltWrapper.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const tiltX = ((y - centerY) / centerY) * -15;
            const tiltY = ((x - centerX) / centerX) * 15;

            logoImg.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.05, 1.05, 1.05)`;
            logoImg.style.transition = `none`;
        });

        tiltWrapper.addEventListener('mouseleave', () => {
            logoImg.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
            logoImg.style.transition = `transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)`;
        });
    }

    // ========================================
    // 12. FORM SUBMISSION HANDLING (Existing)
    // ========================================
    const form = document.getElementById('invite-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const input = document.getElementById('email-input');
            if (input && input.value) {
                // Feedback state
                const btn = form.querySelector('.stealth-button span');
                const originalText = btn.innerText;
                btn.innerText = 'Encrypting...';

                // Simulate network latency / encryption sequence
                setTimeout(() => {
                    form.classList.add('submitted');
                }, 1200);
            }
        });
    }
});
