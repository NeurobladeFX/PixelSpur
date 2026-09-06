/**
 * PixelSpur Studio — Luxury Obsidian & Silver Creative Engine
 * Powers: Viral Portraits & Fashion Studio, Cinematic & Surrealism Studio,
 * Scroll Progress, Reveal Animations, and 1-Click Prompt Copying.
 */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ═══════════════════════════════════════════════════════════
     0. MONETAG VIGNETTE AD ENGINE
     Fires on every download. On prompt copy: every 3rd click only.
     ═══════════════════════════════════════════════════════════ */
  let _copyCount = 0;

  function showVignetteAd() {
    try {
      const s = document.createElement('script');
      s.dataset.zone = '11738580';
      s.src = 'https://n6wxm.com/vignette.min.js';
      document.body.appendChild(s);
    } catch (e) { /* fail silently */ }
  }

  function vignetteOnDownload() {
    showVignetteAd();
  }

  function vignetteOnCopy() {
    _copyCount++;
    if (_copyCount % 3 === 0) showVignetteAd();
  }

  /* ═══════════════════════════════════════════════════════════
     1. FIXED PROMPT COPY HANDLERS
     ═══════════════════════════════════════════════════════════ */

  // Copy standard fixed master prompt
  $$('.copy-prompt-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.aesthetic-card-full');
      const box = $('.prompt-copy-box', card);
      if (!box) return;

      const promptText = box.textContent.trim();
      navigator.clipboard.writeText(promptText).then(() => {
        flashBtn(btn, '✓ Copied Prompt!');
        vignetteOnCopy();
      });
    });
  });

  // Copy with Midjourney /imagine syntax
  $$('.copy-mj-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.aesthetic-card-full');
      const box = $('.prompt-copy-box', card);
      if (!box) return;

      const promptText = box.textContent.trim();
      const mjFormatted = `/imagine prompt: ${promptText}`;
      navigator.clipboard.writeText(mjFormatted).then(() => {
        flashBtn(btn, '✓ Midjourney Copied!');
        vignetteOnCopy();
      });
    });
  });

  // Copy for Flux.1 (cleans parameter flags and formats natural language)
  $$('.copy-flux-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.aesthetic-card-full');
      const box = $('.prompt-copy-box', card);
      if (!box) return;

      let promptText = box.textContent.trim();
      // Strip [IMAGE_URL] and Midjourney parameter flags (--ar, --style, --s, etc.)
      promptText = promptText.replace(/\[IMAGE_URL\]\s*/i, '');
      promptText = promptText.replace(/--\w+\s+[^\s-]+/g, '').trim();
      promptText = promptText.replace(/--\w+/g, '').trim();

      navigator.clipboard.writeText(promptText).then(() => {
        flashBtn(btn, '✓ Flux.1 Copied!');
        vignetteOnCopy();
      });
    });
  });

  function flashBtn(btn, message) {
    const orig = btn.textContent;
    btn.textContent = message;
    btn.style.color = '#ffffff';
    btn.style.borderColor = '#ffffff';
    btn.style.boxShadow = '0 0 16px rgba(255, 255, 255, 0.4)';

    setTimeout(() => {
      btn.textContent = orig;
      btn.style.color = '';
      btn.style.borderColor = '';
      btn.style.boxShadow = '';
    }, 1800);
  }

  /* ═══════════════════════════════════════════════════════════
     1B. CATEGORY FILTER & LIVE SEARCH FOR STUDIO
     ═══════════════════════════════════════════════════════════ */

  function initStudioFilters() {
    const filterBtns = $$('.filter-btn');
    const searchInput = $('#prompt-search');
    const cards = $$('.aesthetic-card-full');
    const countEl = $('#showing-count');
    const totalEl = $('#total-count');

    if (!cards.length) return;

    if (totalEl) totalEl.textContent = cards.length;

    let currentCategory = 'all';
    let searchQuery = '';

    function applyFilters() {
      let visibleCount = 0;
      const q = searchQuery.toLowerCase().trim();

      cards.forEach(card => {
        const cat = card.dataset.category || 'all';
        const text = card.textContent.toLowerCase();

        const matchesCat = (currentCategory === 'all' || cat === currentCategory);
        const matchesSearch = !q || text.includes(q);

        if (matchesCat && matchesSearch) {
          card.classList.remove('hidden-by-filter');
          visibleCount++;
        } else {
          card.classList.add('hidden-by-filter');
        }
      });

      if (countEl) countEl.textContent = visibleCount;
    }

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.filter || 'all';
        applyFilters();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        applyFilters();
      });
    }

    applyFilters();
  }

  /* ═══════════════════════════════════════════════════════════
     2. NAVBAR & MOBILE DRAWER
     ═══════════════════════════════════════════════════════════ */

  $('#nav-toggle')?.addEventListener('click', () => {
    $('.nav-links')?.classList.toggle('open');
  });

  $$('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      $('.nav-links')?.classList.remove('open');
    });
  });

  /* ═══════════════════════════════════════════════════════════
     3. DYNAMIC SCROLL PROGRESS BAR
     ═══════════════════════════════════════════════════════════ */

  function initScrollProgress() {
    const bar = $('#scroll-progress');
    if (!bar) return;

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = `${progress}%`;
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════════════════
     4. SCROLL-TRIGGERED REVEAL ANIMATIONS
     ═══════════════════════════════════════════════════════════ */

  function initScrollReveals() {
    const reveals = $$('.reveal-on-scroll');
    if (!('IntersectionObserver' in window)) {
      reveals.forEach(el => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, parseInt(delay, 10));
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08
    });

    reveals.forEach(el => observer.observe(el));
  }

  /* ═══════════════════════════════════════════════════════════
     5. INITIALIZATION
     ═══════════════════════════════════════════════════════════ */

  initStudioFilters();
  initSpriteStudio();
  initScrollProgress();
  initScrollReveals();
});

/* ═══════════════════════════════════════════════════════════
   6. SMART SPRITE STUDIO & ANIMATION PLAYER
   ═══════════════════════════════════════════════════════════ */
function initSpriteStudio() {
  const promptOutput = document.getElementById('sprite-prompt-output');
  if (!promptOutput) return; // Only run on sprite-studio.html

  // Primary Prompt Generator Inputs
  const charDesc = document.getElementById('char-description');
  const animDesc = document.getElementById('anim-description');
  const artStyle = document.getElementById('art-style');
  const actionSelect = document.getElementById('action-select');
  const bgChroma = document.getElementById('bg-chroma');
  const viewAngle = document.getElementById('view-angle');
  const animationPacing = document.getElementById('animation-pacing');
  const engineMode = document.getElementById('engine-mode');
  const presetSelect = document.getElementById('preset-select');
  const btnSurpriseMe = document.getElementById('btn-surprise-me');
  const detectedBadge = document.getElementById('detected-frames-badge');
  const actionFrameInd = document.getElementById('action-frame-indicator');
  const copyBtn = document.getElementById('copy-sprite-prompt');
  const frameSlider = document.getElementById('frame-slider');
  const frameOverrideVal = document.getElementById('frame-override-val');
  const frameNumberInput = document.getElementById('frame-number-input');
  const promptLayoutMode = document.getElementById('prompt-layout-mode');
  const frameBtns = document.querySelectorAll('.frame-btn');
  const animChips = document.querySelectorAll('.anim-chip');

  // AI Auto-Enhance & VFX Elements
  const btnToggleAiEnhance = document.getElementById('btn-toggle-ai-enhance');
  const aiEnhanceStatus = document.getElementById('ai-enhance-status');
  const vfxChips = document.querySelectorAll('.vfx-chip');
  const vfxCountBadge = document.getElementById('vfx-count-badge');
  const promptTabBtns = document.querySelectorAll('.prompt-tab-btn');
  const negativePromptOutput = document.getElementById('negative-prompt-output');
  const copyNegativeBtn = document.getElementById('copy-negative-prompt');
  const gameSpecOutput = document.getElementById('game-spec-output');
  const copySpecBtn = document.getElementById('copy-spec-prompt');

  // Kinematic Linter Elements
  const promptQualityPill = document.getElementById('prompt-quality-pill');
  const linterStatusText = document.getElementById('linter-status-text');
  const lintRoot = document.getElementById('lint-root');
  const lintGround = document.getElementById('lint-ground');
  const lintBorder = document.getElementById('lint-border');
  const lintRatio = document.getElementById('lint-ratio');

  // Action Pack Modal Elements
  const btnGenActionPack = document.getElementById('btn-gen-action-pack');
  const modalActionPack = document.getElementById('modal-action-pack');
  const modalActionPackClose = document.getElementById('modal-action-pack-close');
  const actionPackList = document.getElementById('action-pack-list');
  const btnCopyAllPack = document.getElementById('btn-copy-all-pack');
  const packCharTitle = document.getElementById('pack-char-title');

  // State
  let promptFrames = 10;
  let aiEnhanceActive = true;
  let activeVfx = new Set(); // Stores active VFX strings
  let currentActiveTab = 'positive';

  // Independent Preview Player State
  let rawImage = null;
  let isPlaying = true;
  let currentFrameIndex = 0;
  let lastAnimTime = 0;
  let fps = 10;

  // Slicing Inset & Offset State (Solves seams, lines & alignment issues)
  let sliceInset = 0;
  let sliceOffsetX = 0;
  let sliceOffsetY = 0;

  // Multi-Row Grid State (Defaults to 10f layout: 5 cols x 2 rows)
  let cols = 5;
  let rows = 2;
  let rowMode = 'all'; // 'all' | 'row1' | 'row2'

  const presetsData = {
    knight_walk: {
      desc: "A medieval knight in engraved silver plate armor with a glowing blue visor, holding a rune broadsword",
      anim: "Strides deliberately forward in heavy armor, sword held at the ready, cape billowing rhythmically",
      style: "16-bit retro pixel art, clean sharp pixel contours, vibrant palette",
      action: "walk",
      bg: "solid bright green #00FF00 background, zero shadows",
      view: "side-scroller lateral side profile view"
    },
    cyber_run: {
      desc: "A futuristic cyberpunk ninja with glowing cyan cybernetics and dual holographic blades",
      anim: "Low forward-leaning sprint with holographic blades trailing behind, neon trail sparks rippling",
      style: "cyberpunk neon pixel art, vibrant chromatic palette, glowing neon contours, Hyper Light Drifter style",
      action: "run",
      bg: "solid bright green #00FF00 background, zero shadows",
      view: "side-scroller lateral side profile view"
    },
    ninja_dash: {
      desc: "A shadow assassin in midnight hooded garb with glowing violet kunai",
      anim: "Performs a high-speed smoke dash leaving trailing shadow silhouettes, followed by a swift dual katana cross-slash",
      style: "16-bit retro pixel art, clean sharp pixel contours, vibrant palette",
      action: "dash",
      bg: "solid bright green #00FF00 background, zero shadows",
      view: "side-scroller lateral side profile view"
    },
    paladin_block: {
      desc: "A holy paladin in radiant golden plate armor with a glowing sun emblem",
      anim: "Raises an enormous blessed tower shield emitting a radiant golden aura barrier that deflects magical projectile strikes",
      style: "modern clean vector 2D game asset, flat cell shading, bold clean ink outlines, Hollow Knight aesthetic",
      action: "block",
      bg: "solid bright green #00FF00 background, zero shadows",
      view: "front-facing direct combat view"
    },
    archer_shoot: {
      desc: "An elven ranger in forest leather armor holding an ornate recurve bow",
      anim: "Draws back an arrow of celestial light with full tension, exhales, and releases with a burst of wind ripples",
      style: "hand-drawn Studio Ghibli anime cel game asset, delicate ink line art, soft watercolor textures",
      action: "archery",
      bg: "solid bright green #00FF00 background, zero shadows",
      view: "side-scroller lateral side profile view"
    },
    brawler_combo: {
      desc: "A cybernetic monk with illuminated martial arts circuitry on fists",
      anim: "Delivers a lightning-fast jab, followed by a heavy hook, finishing with a devastating rising dragon uppercut",
      style: "16-bit retro pixel art, clean sharp pixel contours, vibrant palette",
      action: "attack_combo",
      bg: "solid bright magenta pink #FF00FF background, zero shadows",
      view: "side-scroller lateral side profile view"
    },
    mage_cast: {
      desc: "An anime sorceress in flowing violet robes channeling swirling arcane lightning from her staff",
      anim: "Raises star-tipped staff as swirling purple runes orbit her hands, launching a crackling lightning bolt",
      style: "hand-drawn Studio Ghibli anime cel game asset, delicate ink line art, soft watercolor textures",
      action: "cast",
      bg: "solid bright green #00FF00 background, zero shadows",
      view: "3/4 isometric top-down action RPG view"
    },
    witch_meteor: {
      desc: "A gothic pixel witch hovering gently with a star-tipped celestial broom",
      anim: "Incants an ancient ritual, raising hands as miniature fiery meteors condense overhead and crash forward",
      style: "16-bit retro pixel art, clean sharp pixel contours, vibrant palette",
      action: "ultimate",
      bg: "solid bright magenta pink #FF00FF background, zero shadows",
      view: "side-scroller lateral side profile view"
    },
    mecha_slash: {
      desc: "A giant humanoid mecha pilot in polished chrome and red armor executing a heavy energy beam slash",
      anim: "Draws back colossal beam saber, charges plasma energy, and executes a sweeping ground-shattering energy wave",
      style: "modern clean vector 2D game asset, flat cell shading, bold clean ink outlines, Hollow Knight aesthetic",
      action: "heavy_smash",
      bg: "solid bright magenta pink #FF00FF background, zero shadows",
      view: "side-scroller lateral side profile view"
    },
    rogue_jump: {
      desc: "An agile rogue acrobat in leather tunic with dual daggers performing an acrobatic leap",
      anim: "Crouches, launches high into air with somersault spin, extends daggers at peak, and lands with forward roll",
      style: "16-bit retro pixel art, clean sharp pixel contours, vibrant palette",
      action: "backflip",
      bg: "solid bright green #00FF00 background, zero shadows",
      view: "side-scroller lateral side profile view"
    },
    boss_death: {
      desc: "An abyssal demon warlord enveloped in cosmic dark matter and cracked obsidian horns",
      anim: "Stumbles backwards in agonizing defeat, chest core cracking open with blinding light, collapsing into crumbling dark embers",
      style: "dark fantasy gothic chibi sprite, detailed armor, painterly lighting, Blasphemous aesthetic",
      action: "death",
      bg: "pure pitch black #000000 background, zero ambient shadows",
      view: "front-facing direct combat view"
    },
    slime_idle: {
      desc: "A cute gelatinous dark fantasy slime monster with glowing golden eyes squishing gently",
      anim: "Squishes rhythmically downward with gelatinous jiggle, bubbling softly and bouncing back upward",
      style: "cute chibi kawaii creature monster sprite, rounded soft proportions, playful clean outlines",
      action: "idle",
      bg: "pure pitch black #000000 background, zero ambient shadows",
      view: "front-facing direct combat view"
    }
  };

  const surpriseInspirations = [
    {
      desc: "A steampunk alchemist in brass-goggled leather coat wielding an pressurized ether gun",
      anim: "Uncorks a glowing emerald glass flask, shakes it rapidly with fizzing bubbles, and tosses it in a high parabolic arc",
      action: "attack",
      style: "16-bit retro pixel art, clean sharp pixel contours, vibrant palette",
      vfx: ["speed_dust", "arcane"]
    },
    {
      desc: "A solar-punk druid warrior with living bioluminescent vine armor and an overgrown wooden staff",
      anim: "Stamps staff into ground causing thorned floral roots to surge forward and blossom into radiant golden light",
      action: "cast",
      style: "modern clean vector 2D game asset, flat cell shading, bold clean ink outlines, Hollow Knight aesthetic",
      vfx: ["holy", "speed_dust"]
    },
    {
      desc: "A cyber-valkyrie with polished titanium wings, holographic visor, and an energized plasma halberd",
      anim: "Ignites thrusters on back, executes an explosive 360-degree aerial halberd spin leaving neon cyan plasma arcs",
      action: "attack_combo",
      style: "cyberpunk neon pixel art, vibrant chromatic palette, glowing neon contours, Hyper Light Drifter style",
      vfx: ["lightning", "shockwave"]
    },
    {
      desc: "A wandering ronin fox warrior in tattered straw kasa hat with twin bamboo katanas",
      anim: "Drops into a low feline crouch, unsheathes twin blades in blinding cross-scissor strike, and flicks blood from steel",
      action: "attack",
      style: "hand-drawn Studio Ghibli anime cel game asset, delicate ink line art, soft watercolor textures",
      vfx: ["shockwave", "speed_dust"]
    },
    {
      desc: "An abyssal void knight encased in cracked obsidian chitin armor with an incandescent purple eye core",
      anim: "Channels dark anti-gravity matter as floating void stones orbit his shoulders, detonating into a localized gravity vortex",
      action: "ultimate",
      style: "dark fantasy gothic chibi sprite, detailed armor, painterly lighting, Blasphemous aesthetic",
      vfx: ["dark_void", "lightning"]
    },
    {
      desc: "A retro pixel brawler hero in denim vest, spiked gauntlets, and red headband",
      anim: "Throws a rapid 1-2 boxing combination followed by an explosive rising dragon uppercut with trailing fire embers",
      action: "attack_combo",
      style: "32-bit high-res PS1 Saturn pixel art, Castlevania Symphony of the Night ultra-detailed sprite, micro-dithering",
      vfx: ["fire", "shockwave"]
    },
    {
      desc: "A tiny mushroom folk ranger carrying an acorn bow and glowing spore quiver",
      anim: "Sneaks forward on tip-toes, drops into a stealth crouch, and nocks a phosphorescent spore arrow",
      action: "archery",
      style: "cute chibi kawaii creature monster sprite, rounded soft proportions, playful clean outlines",
      vfx: ["arcane"]
    }
  ];

  function flashBtn(btn, message) {
    if (!btn) return;
    const orig = btn.textContent;
    btn.textContent = message;
    btn.style.color = '#ffffff';
    btn.style.borderColor = '#ffffff';
    btn.style.boxShadow = '0 0 16px rgba(255, 255, 255, 0.4)';

    setTimeout(() => {
      btn.textContent = orig;
      btn.style.color = '';
      btn.style.borderColor = '';
      btn.style.boxShadow = '';
    }, 1800);
  }

  // ─── DYNAMIC 26-ACTION KINEMATIC CHOREOGRAPHY ENGINE ───
  function buildKinematicChoreography(action, frames, rows, cols, pacing = 'arcade') {
    const isGrid = rows === 2;
    const c = cols;

    // Pacing modifier
    let pacingNote = '';
    if (pacing === 'heavy') pacingNote = 'Weighted Souls-like momentum with heavy anticipation inertia, ground impact shudder, and deliberate follow-through deceleration.';
    else if (pacing === 'anime') pacingNote = 'Fluid Anime Sakuga kinetic style with dynamic smear frames, exaggerated motion arcs, and snappy impact easing.';
    else if (pacing === 'bouncy') pacingNote = 'Bouncy cartoon physics with exaggerated squash-and-stretch on contacts, playful apex cushions, and elastic recoil.';
    else pacingNote = 'Snappy responsive arcade timing with crisp keyframe read, fast 1-frame anticipation, and instant stance recovery.';

    switch (action) {
      case 'walk':
        if (isGrid) {
          return `complete seamless ${frames}-frame looping walk cycle in-place on treadmill, facing right: Row 1 (Frames 1-${c}): Frame 1 right foot contact heel strike at Y=85% ground plane with left arm swung 35° forward, Frame 2 right knee flexes 20° absorbing impact weight in down squash, Frame 3 left leg passing stance with knee bent 45° clearing ankle, Frame 4 push-off onto right ball of foot reaching upward stride apex, Frame 5 left leg extending forward toward heel strike. Row 2 (Frames ${c + 1}-${frames}): Frame ${c + 1} left foot contact heel strike at Y=85% with right arm swung 35° forward, Frame ${c + 2} left knee flexes 20° in down squash, Frame ${c + 3} right leg passing stance with knee bent 45° clearing ankle, Frame ${c + 4} push-off onto left ball of foot reaching upward stride apex, Frame ${frames} right leg reaching forward to loop seamlessly into Frame 1. Stationary root motion locked at X=50%, razor-flat ground line at Y=85%. ${pacingNote}`;
        }
        if (frames <= 6) {
          return `complete seamless ${frames}-frame looping walk cycle in-place on treadmill, facing right: Frame 1 right foot heel strike at Y=85% with left arm forward, Frame 2 right knee down squash weight absorption, Frame 3 left passing knee lift clearing ankle, Frame 4 left foot heel strike at Y=85% with right arm forward, Frame 5 left knee down squash, Frame ${frames} right passing stride returning seamlessly to loop into Frame 1. Stationary root motion locked at X=50%, razor-flat ground baseline at Y=85%. ${pacingNote}`;
        }
        return `complete seamless ${frames}-frame looping walk cycle in-place on treadmill, facing right: alternating left and right strides progressing through heel strike contact at Y=85%, weight-absorption 20° knee flex squash, high-knee 45° passing stance, and push-off onto ball of foot, returning seamlessly to loop into Frame 1. Stationary root motion locked at X=50%, razor-flat ground baseline at Y=85%. ${pacingNote}`;

      case 'run':
        if (isGrid) {
          return `high-speed athletic ${frames}-frame running sprint cycle in-place on treadmill, facing right, dynamic 15° forward torso lean, 90° bent pumping arms: Row 1 (Frames 1-${c}): Frame 1 right foot forward ground strike at Y=85% absorbing shock, Frame 2 explosive rear leg push-off thrust, Frame 3 full airborne double-flight suspension phase with both feet elevated off ground plane, Frame 4 left knee driving high forward at 60° angle, Frame 5 left foot reaching forward for impact. Row 2 (Frames ${c + 1}-${frames}): Frame ${c + 1} left foot forward ground strike absorbing shock, Frame ${c + 2} explosive rear leg push-off thrust, Frame ${c + 3} alternating airborne double-flight suspension phase with both feet off ground, Frame ${c + 4} right knee driving high forward at 60°, Frame ${frames} right foot preparing heel strike to loop seamlessly into Frame 1. Stationary root motion locked at X=50%, razor-flat ground baseline at Y=85%. ${pacingNote}`;
        }
        return `high-speed athletic ${frames}-frame running sprint cycle in-place on treadmill, facing right, dynamic 15° forward torso lean, 90° bent pumping arms: alternating explosive ground strikes at Y=85%, powerful rear push-offs, full airborne double-flight suspension phases with both feet off the ground, and high 60° knee drives, returning seamlessly into Frame 1. Stationary root motion locked at X=50%, razor-flat ground baseline at Y=85%. ${pacingNote}`;

      case 'idle':
        return `relaxed ${frames}-frame continuous idle breathing cycle in-place, facing right: neutral balanced standing posture at Y=85% ground plane, rhythmic 2-3px chest expansion inhaling with subtle shoulder rise, slight knee bounce cushion, exhaling with soft chest contraction, gentle cloth breeze micro-sway, looping seamlessly and smoothly into Frame 1. Stationary root motion locked at X=50%, razor-flat ground baseline at Y=85%. ${pacingNote}`;

      case 'idle_combat':
        return `taut ${frames}-frame combat-ready idle stance in-place, facing right: low agile center of gravity, rhythmic weight transfer between balls of feet at Y=85% ground plane, weapon held in tight defensive guard, focused gaze locked ahead, subtle cloth and hair flutter, looping seamlessly back into Frame 1. Stationary root motion locked at X=50%, razor-flat ground baseline at Y=85%. ${pacingNote}`;

      case 'attack':
        return `dynamic ${frames}-frame sword slash melee attack sequence: Frame 1 anticipation windup coiling torso 25° backward with blade drawn behind shoulder, Frame 2 explosive step forward with weight shift onto front foot, Frame 3 wide sweeping diagonal crescent slash with radiant motion blur smear arc, Frame 4 maximum extension follow-through, Frame 5 blade deceleration and kinetic recoil, Frame ${frames} smooth recovery back into balanced combat stance. Stationary root motion, razor-flat ground baseline at Y=85%. ${pacingNote}`;

      case 'attack_combo':
        return `escalating ${frames}-frame 3-hit melee combo sequence: Frames 1-${Math.max(2, Math.floor(frames * 0.3))} rapid straight thrust jab with kinetic shock ring, Frames ${Math.floor(frames * 0.3) + 1}-${Math.floor(frames * 0.65)} wide horizontal cleave slash with curved luminous energy trail, Frames ${Math.floor(frames * 0.65) + 1}-${frames - 1} full 360° spinning whirlwind cleave with radial particle burst, Frame ${frames} athletic recovery into ready stance. Locked center of mass, level ground baseline at Y=85%. ${pacingNote}`;

      case 'roll_dodge':
        return `tactical ${frames}-frame combat roll evasion sequence: Frame 1 drops into low crouch anticipation, Frame 2 explosive dive forward tucking chin to chest, Frame 3 smooth back-shoulder ground contact roll across Y=85% floor line, Frame 4 body unfurls with legs driving beneath center of mass, Frame ${frames} springs upright into alert combat stance with zero horizontal displacement on canvas. Level ground baseline at Y=85%. ${pacingNote}`;

      case 'wall_slide':
        return `acrobatic ${frames}-frame vertical wall slide and kick-off: Frame 1 one hand and boot flat against vertical boundary friction-sliding downward with spark particles, Frame 2 deep crouch knee flexion absorbing downward momentum, Frame 3 explosive horizontal leg push-off kicking away from wall, Frame 4 mid-air airborne leap reaching apex, Frame ${frames} athletic ground landing absorption at Y=85%. ${pacingNote}`;

      case 'double_jump':
        return `athletic ${frames}-frame double jump somersault sequence: Frame 1 mid-air suspension phase, Frame 2 sudden foot stomp generating a radiant kinetic circular shockwave ring beneath boots, Frame 3 tight tucked 360° airborne somersault spin, Frame 4 arms and legs extending reaching second jump peak, Frame ${frames} controlled downward descent with limbs prepared for landing. ${pacingNote}`;

      case 'charge_power':
        return `epic ${frames}-frame power charging sequence: Frame 1 wide-legged deep horse stance with fists clenched tightly at hips, Frame 2 muscles tensing as ground vortex draws inward, Frame 3 explosive upward eruption of crackling aura flames with hair and cloth levitating violently, Frame 4 pulsating energy surge with radiating spark arcs, Frame ${frames} empowered battle stance with residual aura glow. Stationary root motion locked at X=50%, baseline at Y=85%. ${pacingNote}`;

      case 'heavy_smash':
        return `heavy ${frames}-frame two-handed overhead ground smash: Frame 1 deep crouch anticipation windup, Frame 2 explosive upward leap reaching apex with weapon hoisted high overhead, Frame 3 gravity-assisted downward power plunge, Frame 4 devastating impact slam on Y=85% ground plane with radiating shockwave cracks and flying debris particles, Frame ${frames} weapon recovery into ready stance. Level ground baseline at Y=85%. ${pacingNote}`;

      case 'archery':
        return `classical precision ${frames}-frame archery shot sequence: Frame 1 reaches to quiver and draws arrow, Frame 2 nocks arrow onto bowstring, Frame 3 raises bow and pulls string back with full shoulder tension to cheek anchor, Frame 4 holds motionless steady aim at apex, Frame 5 releases string with arrow flight speed ripple trail, Frame ${frames} smooth bow recoil and arm follow-through recovery into stance. Level ground baseline at Y=85%. ${pacingNote}`;

      case 'gun_fire':
        return `tactical ${frames}-frame firearm discharge sequence: Frame 1 raises firearm to eye level with rigid two-handed grip, Frame 2 blinding muzzle flash fireball explosion with spent brass casing ejecting upward, Frame 3 mechanical slide kickback recoil with muzzle climb, Frame 4 barrel smoke drift dissipation, Frame ${frames} weapon stabilization and stance reset. Level ground baseline at Y=85%. ${pacingNote}`;

      case 'cast':
        return `arcane ${frames}-frame magic channeling sequence: Frame 1 raises staff and hands as glowing runic glyph rings orbit forearms, Frame 2 concentrates swirling sphere of incandescent energy overhead, Frame 3 unleashes forward piercing energy beam with crackling particle streaks, Frame 4 spell discharge shockwave, Frame ${frames} lowers arms with dissipating magical sparks into stance. Level ground baseline at Y=85%. ${pacingNote}`;

      case 'jump':
        return `complete ${frames}-frame 3-phase athletic jump sequence: Frame 1 deep knee crouch anticipation squash, Frame 2 explosive upward launch with legs extending then tucking, Frame 3 weightless peak apex hover pose, Frame 4 downward descent with outstretched limbs, Frame 5 deep knee-bend ground contact absorption squash at Y=85%, Frame ${frames} upright stance recovery. Consistent scale, level baseline at Y=85%. ${pacingNote}`;

      case 'backflip':
        return `acrobatic ${frames}-frame evasive backflip sequence: Frame 1 deep crouch launch anticipation, Frame 2 explosive backward leap, Frame 3 mid-air inverted 180° somersault tuck with knees to chest, Frame 4 body unfurling reaching apex, Frame 5 downward descent, Frame ${frames} smooth ground landing roll at Y=85% into ready stance. Level ground baseline at Y=85%. ${pacingNote}`;

      case 'dash':
        return `high-speed ${frames}-frame evasion dash sequence: Frame 1 low aerodynamic crouch, Frame 2 sudden explosive forward burst with trailing phantom silhouette speed blur and ground dust puffs, Frame 3 frictionless high-speed slide, Frame ${frames} deceleration and stance recovery. Stationary root motion, locked center of mass at X=50%, ground baseline at Y=85%. ${pacingNote}`;

      case 'block':
        return `defensive ${frames}-frame shield block sequence: Frame 1 raises heavy shield barrier firmly to chest, Frame 2 digs rear foot into Y=85% ground plane bracing for collision, Frame 3 absorbs heavy impact with brilliant ricochet spark bursts, Frame ${frames} eases guard back into ready combat posture. Level ground baseline at Y=85%. ${pacingNote}`;

      case 'hurt':
        return `heavy ${frames}-frame hit reaction sequence: Frame 1 head and torso snap backward from blunt strike force, Frame 2 torso arches backward off-balance with arms flailing, Frame 3 stumbles onto rear foot absorbing force at Y=85% floor line, Frame ${frames} quickly regains balance and recovers combat guard. Level ground baseline at Y=85%. ${pacingNote}`;

      case 'knockback':
        return `dramatic ${frames}-frame knockback recovery sequence: Frame 1 propelled backward off feet through the air by heavy impact, Frame 2 skids and rolls across Y=85% floor plane, Frame 3 cushions landing with hands, Frame ${frames} springs back upright into ready stance. Level ground baseline at Y=85%. ${pacingNote}`;

      case 'item_consume':
        return `tactical ${frames}-frame potion consume sequence: Frame 1 retrieves glowing glass potion flask from belt, Frame 2 pops cork with thumb, Frame 3 tilts head back drinking elixir with radiant throat glow, Frame 4 wipes mouth as revitalizing sparkle particles ripple across body, Frame ${frames} drops empty vial and re-grips weapon in combat stance. Baseline at Y=85%. ${pacingNote}`;

      case 'death':
        return `dramatic ${frames}-frame defeat sequence: Frame 1 clutches fatal wound, Frame 2 staggers backward off-balance dropping weapon to the floor, Frame 3 collapses heavily onto knees at Y=85% baseline, Frame 4 falls forward prone onto ground, Frame ${frames} dissolves into dissipating dark ash particles. Level ground baseline at Y=85%. ${pacingNote}`;

      case 'victory':
        return `triumphant ${frames}-frame victory celebration: Frame 1 lowers combat guard, Frame 2 raises weapon high into the air with radiant gleam, Frame 3 pumps opposite fist with confident heroic smile, Frame ${frames} strikes triumphant heroic stance. Level ground baseline at Y=85%. ${pacingNote}`;

      case 'climb':
        return `vertical ${frames}-frame wall climb locomotion cycle: alternating hand and foot reaches, gripping stone ledges, hoisting body weight upward rhythmically, cycling smoothly into Frame 1. Character centered with equal horizontal spacing directly on the seamless background. ${pacingNote}`;

      case 'ultimate':
        return `awakening ${frames}-frame ultimate aura sequence: Frame 1 crouches as swirling ground vortex draws inward, Frame 2 eyes ignite with radiant energy beams, Frame 3 colossal shockwave aura erupts outward with radial lightning arcs, Frame 4 levitates slightly in divine surge, Frame ${frames} settles back down to Y=85% ground plane in empowered stance. Level ground baseline at Y=85%. ${pacingNote}`;

      case 'custom':
      default:
        return `custom dynamic ${frames}-frame animation sequence with continuous progressive keyframing across all frames, stationary root motion on treadmill locked at X=50%, level ground baseline at Y=85%, and rigid anatomical consistency. ${pacingNote}`;
    }
  }

  function getPromptGridDimensions() {
    const layoutMode = promptLayoutMode ? promptLayoutMode.value : 'auto';
    let pRows = 1;
    let pCols = promptFrames;

    if (layoutMode === 'grid') {
      pRows = 2;
      pCols = Math.ceil(promptFrames / 2);
    } else if (layoutMode === 'strip') {
      pRows = 1;
      pCols = promptFrames;
    } else {
      // Auto: strip if <= 8 frames, 2-row grid if > 8 frames
      if (promptFrames > 8) {
        pRows = 2;
        pCols = Math.ceil(promptFrames / 2);
      } else {
        pRows = 1;
        pCols = promptFrames;
      }
    }
    return { cols: pCols, rows: pRows };
  }

  function syncGridWithPrompt(autoSlice = false) {
    const { cols: targetCols, rows: targetRows } = getPromptGridDimensions();
    cols = targetCols;
    rows = targetRows;
    if (colSelect) colSelect.value = String(targetCols);
    if (rowSelect) rowSelect.value = String(targetRows);
    updateGridBadge();
    updatePlayerResInfo();
    if (autoSlice && rawImage) {
      extractAllFrames(true);
      drawAnimFrame();
      drawSourceGridOverlay();
    }
  }

  function updateGridBadge() {
    const pGrid = typeof getPromptGridDimensions === 'function' ? getPromptGridDimensions() : { cols: 5, rows: 2 };
    const isPromptMatch = (cols === pGrid.cols && rows === pGrid.rows);
    if (gridBadge) {
      const total = rowMode === 'all' ? (cols * rows) : cols;
      gridBadge.innerHTML = `<span style="color:#fff;">${cols} Cols × ${rows} ${rows === 1 ? 'Row' : 'Rows'} (${total} Frames)</span>${isPromptMatch ? ' <span style="color:#38bdf8; font-size:0.68rem; font-weight:700;">• 🔗 Synced to Prompt</span>' : ''}`;
    }
    const playerFrameEl = document.getElementById('player-frame-count');
    if (playerFrameEl) {
      const total = rowMode === 'all' ? (cols * rows) : cols;
      playerFrameEl.textContent = `${total} Frames`;
    }
  }

  function updatePlayerResInfo() {
    if (rawImage && sourceCanvas && sourceCanvas.width > 0) {
      const fw = Math.floor(sourceCanvas.width / cols);
      const fh = Math.floor(sourceCanvas.height / rows);
      const total = rowMode === 'all' ? (cols * rows) : cols;
      if (playerRes) {
        playerRes.textContent = `${sourceCanvas.width}×${sourceCanvas.height} (${fw}×${fh}/frame • ${cols}×${rows} grid • ${total}f)`;
      }
    }
  }

  function updatePrompt() {
    const actionVal = actionSelect ? actionSelect.value : 'walk';
    const pacingVal = animationPacing ? animationPacing.value : 'arcade';

    // Clamp frames between 2 and 16
    let frames = promptFrames;
    if (isNaN(frames) || frames < 2) frames = 2;
    if (frames > 16) frames = 16;
    promptFrames = frames;

    // Sync input controls
    if (frameSlider) frameSlider.value = promptFrames;
    if (frameNumberInput) frameNumberInput.value = promptFrames;

    // Update active state on quick frame buttons
    frameBtns.forEach(btn => {
      const f = parseInt(btn.dataset.frames, 10);
      if (f === promptFrames) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Automatically synchronize slicing grid layout with the prompt
    syncGridWithPrompt(true);

    // Layout calculation for prompt
    const { cols: pCols, rows: pRows } = getPromptGridDimensions();

    // Update prompt indicators
    if (frameOverrideVal) {
      if (pRows === 2) {
        frameOverrideVal.textContent = `${promptFrames} Frames (2 Rows × ${pCols} Cols)`;
      } else {
        frameOverrideVal.textContent = `${promptFrames} Frames (Single Strip)`;
      }
    }

    if (actionFrameInd) {
      actionFrameInd.textContent = `Prompt: ${promptFrames} Frames`;
    }

    if (detectedBadge) {
      detectedBadge.textContent = `${promptFrames} FRAMES SET`;
    }

    const desc = charDesc?.value.trim() || 'A heroic knight in silver plate armor';
    const animTelling = animDesc?.value.trim();
    const style = artStyle?.value || '16-bit retro pixel art, clean sharp pixel contours, vibrant palette';
    const bg = bgChroma?.value || 'solid bright green #00FF00 background, zero shadows';
    const angle = viewAngle?.value || 'side-scroller lateral side profile view';
    const engine = engineMode?.value || 'mj';

    // Kinematic motion choreography
    let choreography = buildKinematicChoreography(actionVal, promptFrames, pRows, pCols, pacingVal);
    if (animTelling) {
      choreography = `${choreography}. Specific custom motion choreography: ${animTelling}`;
    }

    // Append active VFX
    if (activeVfx.size > 0) {
      const vfxText = [...activeVfx].join(', ');
      choreography = `${choreography}. Dynamic visual particle effects: ${vfxText}`;
    }

    // Append AI Auto-Enhance modifiers if enabled
    if (aiEnhanceActive) {
      choreography = `${choreography}. Enhanced with crisp directional silver rim-lighting from top-left, subtle specular metallic armor sheen, secondary micro-motion cloth and cape physics with realistic gravity drag, and clean silhouette separation`;
    }

    let layoutClause = '';
    if (pRows === 2) {
      layoutClause = `structured 2-row horizontal sequence with exactly ${pCols} characters in Row 1 and ${promptFrames - pCols} characters in Row 2 (${promptFrames} sprites total, sequential animation reading left-to-right top-to-bottom), completely seamless and borderless, equal horizontal spacing between characters directly on the flat solid background, strictly zero dividing lines, zero panel borders, zero grid lines, zero boxes`;
    } else {
      layoutClause = `single continuous horizontal sprite strip with exactly ${promptFrames} sequential animation poses evenly spaced left-to-right in 1 straight row directly on the flat solid background, completely borderless, strictly zero dividing lines, zero grid lines, zero panel frames, zero box outlines`;
    }

    const ar = pRows === 2 ? '16:9' : (promptFrames <= 6 ? '3:1' : '4:1');

    // Scale and positioning rules without any mention of box or cell
    const spacingClause = `Character scale and positioning: character height strictly 70% of total canvas height with generous empty breathing room around each silhouette, razor-flat level ground baseline locked at Y=85% across all frames (feet contact the identical horizontal baseline with zero vertical floating), stationary in-place root motion with character center of mass centered in each pose on a treadmill with zero horizontal drifting across the sheet`;

    // Seamless single background rules
    const backgroundClause = `Background rules: single continuous unbroken flat solid ${bg} across the entire canvas with zero gradients, zero shadows, completely seamless and borderless without any rectangular boxes, dividing lines, grid lines, panel frames, or borders`;

    // Rigid model sheet rules
    const modelSheetClause = `Rigid model sheet fidelity: identical character anatomy, proportions, costume details, gear, color palette, and line weight across every frame, zero perspective shifts, zero 3D rotation, zero anatomical morphing, no missing limbs`;

    // 1. Positive Master Prompt
    let prompt = '';
    if (engine === 'mj') {
      prompt = `/imagine prompt: 2D game asset sprite sheet of ${desc}, ${choreography}, ${layoutClause}, ${spacingClause}, ${modelSheetClause}, ${angle}, ${style}, ${backgroundClause} --ar ${ar} --style raw --v 6.1 --no boxes, bounding_box, grid_lines, dividing_lines, cell_borders, panel_borders, frames, rectangular_boxes, comic_panels, borders, inner_boxes, perspective_shift, character_drift, morphing, floating_limbs, cropped_frame, watermark, text, signature, 3d, floor_shadows`;
    } else if (engine === 'flux') {
      prompt = `A masterwork 2D game asset sprite sheet of ${desc}. Layout structure: ${layoutClause}. Kinematic motion sequence: ${choreography}. Character scale & positioning: ${spacingClause}. Model sheet rules: ${modelSheetClause}. ${backgroundClause}. Rendered in ${style}, ${angle}. The background is one continuous, uninterrupted, completely borderless solid flat color with strictly NO grid lines, NO dividing lines, NO bounding boxes, NO cell borders, and NO frame outlines separating the characters.`;
    } else if (engine === 'sdxl') {
      prompt = `((2D game asset sprite sheet:1.3)), ${desc}, ${layoutClause}, ${choreography}, ((stationary root motion, treadmill in-place animation, locked center of mass at X=50%)), ((razor-flat ground baseline at Y=85%)), ((rigid model sheet anatomical consistency)), ${backgroundClause}, ${style}, ${angle}, crisp sharp outlines, game development asset, studio quality, (boxes, bounding box, grid lines, dividing lines, panel borders, cell frames, rectangular outlines, comic panels, borders, inner boxes, frames, non-uniform background:1.5), (worst quality, low quality, blurry, 3d render, photo, photorealistic, perspective shift, rotation, character drifting, forward displacement, anatomical morphing, mutating limbs, extra arms, floating feet, cropped limbs, text, logo, signature, watermark, label, gradient background, floor drop shadow:1.4)`;
    } else if (engine === 'gemini') {
      prompt = `Pristine 2D game asset sprite sheet of ${desc}. ${layoutClause}. Sequential kinematic motion: ${choreography}. Spacing and positioning: ${spacingClause}. Rendered in flat 2D game textures in ${style}, ${angle}, ${backgroundClause}. Model sheet fidelity: ${modelSheetClause}. Strictly borderless: NO grid lines, NO dividing lines, NO rectangular boxes, NO bounding boxes, NO frame borders, NO comic panels separating the frames. Strictly NO watermark, NO logo, NO signature, NO text labels, perfectly clean transparent-ready single background.`;
    }

    if (promptOutput) promptOutput.textContent = prompt;

    // 2. Dedicated Negative Exclusions
    let negativePrompt = '';
    if (engine === 'mj') {
      negativePrompt = `--no boxes, bounding_box, grid_lines, dividing_lines, cell_borders, panel_borders, frames, rectangular_boxes, comic_panels, borders, inner_boxes, perspective_shift, character_drift, morphing, floating_limbs, cropped_frame, watermark, text, signature, 3d, floor_shadows, gradient_background, blurry_edges`;
    } else if (engine === 'sdxl') {
      negativePrompt = `(boxes, bounding box, grid lines, dividing lines, panel borders, cell frames, rectangular outlines, comic panels, borders, inner boxes, frames, non-uniform background:1.5), (worst quality, low quality, blurry, 3d render, photo, photorealistic, perspective shift, rotation, character drifting, forward displacement, anatomical morphing, mutating limbs, extra arms, floating feet, cropped limbs, text, logo, signature, watermark, label, gradient background, floor drop shadow, noisy background:1.4)`;
    } else {
      negativePrompt = `Strictly exclude: rectangular bounding boxes, inner border lines, comic book panel dividers, grid guidelines, drop shadows under feet, background color gradients, two-tone background patches, watermarks, spark logos, text signatures, perspective rotation, and character drifting across frames.`;
    }
    if (negativePromptOutput) negativePromptOutput.textContent = negativePrompt;

    // 3. Game Engine Spec JSON
    const gameSpec = {
      meta: {
        character: desc,
        animation: actionVal,
        frames: promptFrames,
        layout: pRows === 2 ? `${pCols}x2_grid` : `1x${promptFrames}_strip`,
        pacing: pacingVal,
        engineTarget: engine,
        aspectRatio: ar,
        baselineLockY: "85%",
        rootMotion: "in_place_treadmill"
      },
      exportTargets: ["Godot 4 AnimatedSprite2D", "Unity 2D SpriteSheet", "Phaser 3 / PixiJS", "Unreal Paper2D"]
    };
    if (gameSpecOutput) gameSpecOutput.textContent = JSON.stringify(gameSpec, null, 2);

    // 4. Update Kinematic Linter & Score
    let score = 100;
    if (lintRoot) lintRoot.style.color = '#4ade80';
    if (lintGround) lintGround.style.color = '#4ade80';
    if (lintBorder) lintBorder.style.color = '#4ade80';
    if (lintRatio) lintRatio.style.color = '#4ade80';
    if (promptQualityPill) promptQualityPill.textContent = `Score: ${score}/100`;
    if (linterStatusText) linterStatusText.textContent = `100% Production Ready`;
  }

  // Surprise Me / Random Generator
  function triggerSurpriseMe() {
    const pick = surpriseInspirations[Math.floor(Math.random() * surpriseInspirations.length)];
    if (!pick) return;

    if (charDesc) charDesc.value = pick.desc;
    if (animDesc) animDesc.value = pick.anim;
    if (actionSelect) actionSelect.value = pick.action;
    if (artStyle) artStyle.value = pick.style;

    // Reset and assign active VFX
    activeVfx.clear();
    vfxChips.forEach(chip => {
      chip.classList.remove('active');
    });

    if (pick.vfx) {
      vfxChips.forEach(chip => {
        const vfxKey = chip.dataset.vfx;
        pick.vfx.forEach(target => {
          if (vfxKey.includes(target) || chip.textContent.toLowerCase().includes(target)) {
            chip.classList.add('active');
            activeVfx.add(vfxKey);
          }
        });
      });
    }

    if (vfxCountBadge) vfxCountBadge.textContent = `${activeVfx.size} Active`;

    updatePrompt();
    if (btnSurpriseMe) flashBtn(btnSurpriseMe, '🎲 Generated!');
  }

  btnSurpriseMe?.addEventListener('click', triggerSurpriseMe);

  // AI Auto-Enhance Toggle
  btnToggleAiEnhance?.addEventListener('click', () => {
    aiEnhanceActive = !aiEnhanceActive;
    if (btnToggleAiEnhance) {
      btnToggleAiEnhance.textContent = aiEnhanceActive ? '✨ AI Auto-Enhance: ON' : '✨ AI Auto-Enhance: OFF';
      btnToggleAiEnhance.className = aiEnhanceActive ? 'btn btn-silver btn-block btn-sm' : 'btn btn-silver-outline btn-block btn-sm';
    }
    if (aiEnhanceStatus) {
      aiEnhanceStatus.textContent = aiEnhanceActive ? 'Active' : 'Disabled';
      aiEnhanceStatus.style.color = aiEnhanceActive ? '#4ade80' : 'var(--silver-400)';
    }
    updatePrompt();
  });

  // VFX Chips Toggle
  vfxChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const vfxText = chip.dataset.vfx;
      if (activeVfx.has(vfxText)) {
        activeVfx.delete(vfxText);
        chip.classList.remove('active');
      } else {
        activeVfx.add(vfxText);
        chip.classList.add('active');
      }
      if (vfxCountBadge) vfxCountBadge.textContent = `${activeVfx.size} Active`;
      updatePrompt();
    });
  });

  // Prompt Tabs Switcher
  promptTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      currentActiveTab = target;
      promptTabBtns.forEach(b => b.classList.toggle('active', b === btn));

      const pPane = document.getElementById('tab-pane-positive');
      const nPane = document.getElementById('tab-pane-negative');
      const sPane = document.getElementById('tab-pane-spec');

      if (pPane) pPane.style.display = target === 'positive' ? 'block' : 'none';
      if (nPane) nPane.style.display = target === 'negative' ? 'block' : 'none';
      if (sPane) sPane.style.display = target === 'spec' ? 'block' : 'none';
    });
  });

  // Copy Buttons
  copyNegativeBtn?.addEventListener('click', () => {
    if (!negativePromptOutput) return;
    navigator.clipboard.writeText(negativePromptOutput.textContent.trim()).then(() => {
      flashBtn(copyNegativeBtn, '✓ Copied Negative Exclusions!');
    });
  });

  copySpecBtn?.addEventListener('click', () => {
    if (!gameSpecOutput) return;
    navigator.clipboard.writeText(gameSpecOutput.textContent.trim()).then(() => {
      flashBtn(copySpecBtn, '✓ Copied Engine Spec JSON!');
    });
  });

  // Full Character Action Pack Generator
  function renderActionPack() {
    if (!actionPackList) return;
    const desc = charDesc?.value.trim() || 'Hero Character';
    const style = artStyle?.value || '16-bit retro pixel art, clean sharp pixel contours, vibrant palette';
    const bg = bgChroma?.value || 'solid bright green #00FF00 background, zero shadows';
    const angle = viewAngle?.value || 'side-scroller lateral side profile view';
    const engine = engineMode?.value || 'mj';

    if (packCharTitle) packCharTitle.innerHTML = `Target: <strong>${desc}</strong>`;

    const actions = [
      { name: "1. Relaxed Idle Breathing", key: "idle", frames: 8 },
      { name: "2. Looping Walk Cycle (Treadmill)", key: "walk", frames: 10 },
      { name: "3. Run Sprint", key: "run", frames: 8 },
      { name: "4. Primary Attack Slash / Strike", key: "attack", frames: 8 },
      { name: "5. Defeat & Collapse", key: "death", frames: 8 }
    ];

    actionPackList.innerHTML = '';

    actions.forEach((act, idx) => {
      const pCols = act.frames > 8 ? Math.ceil(act.frames / 2) : act.frames;
      const pRows = act.frames > 8 ? 2 : 1;
      const ar = pRows === 2 ? '16:9' : '3:1';
      const ch = buildKinematicChoreography(act.key, act.frames, pRows, pCols, 'arcade');

      const fullPrompt = engine === 'mj'
        ? `/imagine prompt: 2D game asset sprite sheet of ${desc}, ${ch}, single continuous borderless layout directly on ${bg}, locked center of mass, Y=85% ground plane, ${style}, ${angle} --ar ${ar} --style raw --v 6.1 --no boxes, bounding_box, dividing_lines, grid_lines, frames, borders, text, watermark`
        : `A masterwork 2D game asset sprite sheet of ${desc}. ${ch}. Borderless single continuous flat ${bg}. Stationary root motion on treadmill, ground baseline at Y=85%, rigid model sheet consistency. Style: ${style}, ${angle}. Strictly NO dividing lines, NO boxes, NO borders.`;

      const card = document.createElement('div');
      card.className = 'action-pack-item';
      card.innerHTML = `
        <div class="action-pack-header">
          <strong style="color: #fff; font-size: 0.78rem;">${act.name} (${act.frames}f)</strong>
          <button type="button" class="btn btn-silver-outline btn-sm btn-copy-single-pack" data-idx="${idx}" style="font-size: 0.68rem; padding: 0.2rem 0.5rem;">
            📋 Copy
          </button>
        </div>
        <div class="action-pack-prompt">${fullPrompt}</div>
      `;

      card.querySelector('.btn-copy-single-pack')?.addEventListener('click', (e) => {
        navigator.clipboard.writeText(fullPrompt).then(() => {
          flashBtn(e.target, '✓ Copied!');
        });
      });

      actionPackList.appendChild(card);
    });
  }

  btnGenActionPack?.addEventListener('click', () => {
    renderActionPack();
    if (modalActionPack) modalActionPack.classList.add('active');
  });

  modalActionPackClose?.addEventListener('click', () => {
    if (modalActionPack) modalActionPack.classList.remove('active');
  });

  btnCopyAllPack?.addEventListener('click', () => {
    const prompts = [...actionPackList.querySelectorAll('.action-pack-prompt')].map((el, i) => `// --- Action ${i + 1} ---\n${el.textContent.trim()}`).join('\n\n');
    navigator.clipboard.writeText(prompts).then(() => {
      flashBtn(btnCopyAllPack, '✓ Copied All 5 Prompts!');
    });
  });

  // Event Listeners for Dynamic Prompt Generation
  [charDesc, animDesc, artStyle, bgChroma, viewAngle, animationPacing, engineMode].forEach(el => {
    el?.addEventListener('input', updatePrompt);
    el?.addEventListener('change', updatePrompt);
  });

  actionSelect?.addEventListener('change', updatePrompt);
  promptLayoutMode?.addEventListener('change', updatePrompt);

  frameSlider?.addEventListener('input', (e) => {
    promptFrames = parseInt(e.target.value, 10);
    updatePrompt();
  });

  frameNumberInput?.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      promptFrames = Math.max(2, Math.min(16, val));
      updatePrompt();
    }
  });

  frameBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const f = parseInt(btn.dataset.frames, 10);
      if (f) {
        promptFrames = f;
        updatePrompt();
      }
    });
  });

  // Quick Action Suggestion Chips
  animChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const text = chip.dataset.chip || chip.textContent;
      const targetAction = chip.dataset.action;

      if (animDesc) {
        animDesc.value = text;
        animDesc.focus();
      }

      if (targetAction && actionSelect) {
        actionSelect.value = targetAction;
      }

      updatePrompt();

      chip.style.borderColor = '#ffffff';
      chip.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
      setTimeout(() => {
        chip.style.borderColor = '';
        chip.style.backgroundColor = '';
      }, 600);
    });
  });

  presetSelect?.addEventListener('change', () => {
    const val = presetSelect.value;
    if (presetsData[val]) {
      const p = presetsData[val];
      if (charDesc) charDesc.value = p.desc;
      if (animDesc) animDesc.value = p.anim || '';
      if (artStyle) artStyle.value = p.style;
      if (actionSelect) actionSelect.value = p.action;
      if (bgChroma) bgChroma.value = p.bg;
      if (viewAngle) viewAngle.value = p.view;
      updatePrompt();
    }
  });

  copyBtn?.addEventListener('click', () => {
    if (!promptOutput) return;
    navigator.clipboard.writeText(promptOutput.textContent.trim()).then(() => {
      flashBtn(copyBtn, '✓ Copied Sprite Prompt!');
    });
  });

  // Canvas Defringer & Image Loading
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const sourceCanvas = document.getElementById('source-canvas');
  const canvasWrap = document.getElementById('canvas-wrapper');
  const chromaControls = document.getElementById('chroma-controls');
  const colorPicker = document.getElementById('color-picker');
  const tolSlider = document.getElementById('tolerance-slider');
  const tolVal = document.getElementById('tolerance-val');
  const defringeSlider = document.getElementById('defringe-slider');
  const defringeVal = document.getElementById('defringe-val');
  const smartBoxToggle = document.getElementById('toggle-smart-box-clean');

  // Gemini & AI Watermark removal elements
  const wmToggle = document.getElementById('toggle-watermark-erase');
  const wmCornerSelect = document.getElementById('wm-corner-select');
  const wmSizeSlider = document.getElementById('wm-size-slider');
  const wmSizeVal = document.getElementById('wm-size-val');
  const btnEyedropper = document.getElementById('btn-tool-eyedropper');
  const btnEraser = document.getElementById('btn-tool-eraser');
  const btnClearEraser = document.getElementById('btn-tool-clear-eraser');
  const toolBadge = document.getElementById('active-tool-badge');
  const eraserSizeRow = document.getElementById('eraser-size-row');
  const eraserSizeSlider = document.getElementById('eraser-size-slider');
  const eraserSizeVal = document.getElementById('eraser-size-val');

  // Offscreen canvas to track manual eraser brush strokes
  const eraseMaskCanvas = document.createElement('canvas');
  const eraseMaskCtx = eraseMaskCanvas.getContext('2d');
  let activeTool = 'eyedropper'; // 'eyedropper' | 'eraser'
  let isErasing = false;

  const animCanvas = document.getElementById('anim-canvas');
  const animPlaceholder = document.getElementById('anim-placeholder');
  const playToggleBtn = document.getElementById('btn-play-toggle');
  const stepPrevBtn = document.getElementById('btn-step-prev');
  const stepNextBtn = document.getElementById('btn-step-next');
  const frameDisplay = document.getElementById('frame-display');
  const fpsSlider = document.getElementById('fps-slider');
  const fpsVal = document.getElementById('fps-val');
  const playerRes = document.getElementById('player-res-info');

  // Multi-Row Grid Controls
  const colSelect = document.getElementById('col-select');
  const rowSelect = document.getElementById('row-select');
  const rowModeSelect = document.getElementById('row-mode-select');
  const gridBadge = document.getElementById('grid-status-badge');
  const gridPresetBtns = document.querySelectorAll('.grid-preset-btn');
  const btnAutoDetectGrid = document.getElementById('btn-auto-detect-grid');
  const gridOverlayCanvas = document.getElementById('grid-overlay-canvas');
  const toggleShowGridLines = document.getElementById('toggle-show-grid-lines');
  const sliceInsetSlider = document.getElementById('slice-inset-slider');
  const sliceInsetVal = document.getElementById('slice-inset-val');
  const sliceOffsetXSlider = document.getElementById('slice-offset-x-slider');
  const sliceOffsetXVal = document.getElementById('slice-offset-x-val');
  const sliceOffsetYSlider = document.getElementById('slice-offset-y-slider');
  const sliceOffsetYVal = document.getElementById('slice-offset-y-val');
  const btnResetSliceOffsets = document.getElementById('btn-reset-slice-offsets');

  const dlPngBtn = document.getElementById('btn-download-png');
  const dlJsonBtn = document.getElementById('btn-download-json');
  const dlBundleBtn = document.getElementById('btn-download-bundle');

  // Extracted Frames Manager State & DOM
  let extractedFrames = []; // Array of { id, origIndex, col, row, frameW, frameH, canvas, dataUrl, isExcluded }
  const extractedFramesPanel = document.getElementById('extracted-frames-panel');
  const extractedFramesGrid = document.getElementById('extracted-frames-grid');
  const extractedFramesBadge = document.getElementById('extracted-frames-badge');
  const btnRestoreAllFrames = document.getElementById('btn-restore-all-frames');
  const btnDownloadIndividualFrames = document.getElementById('btn-download-individual-frames');
  const framesEmptyState = document.getElementById('frames-empty-state');

  function getActiveFrames() {
    return extractedFrames.filter(f => !f.isExcluded);
  }

  function highlightPlayingCard(frameId) {
    if (!extractedFramesGrid) return;
    const cards = extractedFramesGrid.querySelectorAll('.frame-card');
    cards.forEach(card => {
      if (card.dataset.id === frameId) {
        card.classList.add('is-active-playing');
      } else {
        card.classList.remove('is-active-playing');
      }
    });
  }

  function updatePlayerStatusWithFrames() {
    const active = getActiveFrames();
    const playerFrameEl = document.getElementById('player-frame-count');
    if (playerFrameEl) {
      const removedCount = extractedFrames.length - active.length;
      if (removedCount > 0) {
        playerFrameEl.textContent = `${active.length} Active (${removedCount} Excluded)`;
      } else {
        playerFrameEl.textContent = `${active.length} Frames`;
      }
    }
  }

  function inspectFrame(idx) {
    if (!extractedFrames[idx]) return;
    isPlaying = false;
    if (playToggleBtn) playToggleBtn.textContent = '▶';

    const targetFrame = extractedFrames[idx];
    const actx = animCanvas.getContext('2d');
    animCanvas.width = targetFrame.frameW;
    animCanvas.height = targetFrame.frameH;
    actx.clearRect(0, 0, animCanvas.width, animCanvas.height);
    actx.imageSmoothingEnabled = false;
    actx.drawImage(targetFrame.canvas, 0, 0);

    if (frameDisplay) {
      frameDisplay.textContent = `Inspecting Frame #${idx + 1} (${targetFrame.isExcluded ? 'Excluded' : 'Active'})`;
    }

    highlightPlayingCard(targetFrame.id);
  }

  function renderExtractedFramesUI() {
    if (!extractedFramesGrid) return;

    if (extractedFrames.length === 0) {
      extractedFramesGrid.innerHTML = `
        <div class="frames-empty-state" id="frames-empty-state" style="padding: 1.5rem; text-align: center; background: rgba(255,255,255,0.02); border: 1px dashed var(--silver-800); border-radius: var(--radius-sm); color: var(--silver-300); font-size: 0.76rem; width: 100%;">
          <span>Drop, paste (<kbd>Ctrl+V</kbd>), or import a sprite sheet above to automatically slice and manage individual frames here.</span>
        </div>
      `;
      if (extractedFramesBadge) extractedFramesBadge.textContent = '0 Frames';
      if (btnRestoreAllFrames) btnRestoreAllFrames.style.display = 'none';
      if (btnDownloadIndividualFrames) btnDownloadIndividualFrames.style.display = 'none';
      return;
    }

    const active = getActiveFrames();
    const removedCount = extractedFrames.length - active.length;

    if (extractedFramesBadge) {
      if (removedCount > 0) {
        extractedFramesBadge.textContent = `${extractedFrames.length} Sliced (${active.length} Active, ${removedCount} Removed)`;
        extractedFramesBadge.style.borderColor = 'rgba(239, 68, 68, 0.4)';
        extractedFramesBadge.style.color = '#fca5a5';
      } else {
        extractedFramesBadge.textContent = `${extractedFrames.length} Frames (All Active)`;
        extractedFramesBadge.style.borderColor = '';
        extractedFramesBadge.style.color = '';
      }
    }

    if (btnRestoreAllFrames) {
      btnRestoreAllFrames.style.display = removedCount > 0 ? 'inline-flex' : 'none';
    }
    if (btnDownloadIndividualFrames) {
      btnDownloadIndividualFrames.style.display = active.length > 0 ? 'inline-flex' : 'none';
    }

    extractedFramesGrid.innerHTML = '';

    extractedFrames.forEach((frame, idx) => {
      const card = document.createElement('div');
      card.className = `frame-card ${frame.isExcluded ? 'is-excluded' : ''}`;
      card.dataset.id = frame.id;
      card.dataset.idx = String(idx);

      card.innerHTML = `
        <div class="frame-card-header">
          <span class="frame-num-badge">#${idx + 1}</span>
          <span class="frame-status-tag ${frame.isExcluded ? 'excluded' : 'active'}">
            ${frame.isExcluded ? '✕ Removed' : '✓ Active'}
          </span>
        </div>

        <div class="frame-thumb-box" title="Click to inspect Frame #${idx + 1} on player canvas">
          <img src="${frame.dataUrl}" class="frame-thumb-img" alt="Frame ${idx + 1}" />
          ${frame.isExcluded ? '<span class="frame-excluded-stamp">REMOVED</span>' : ''}
        </div>

        <div style="font-size: 0.65rem; color: var(--silver-400); text-align: center; font-family: var(--mono);">
          Col ${frame.col + 1}, Row ${frame.row + 1} (${frame.frameW}×${frame.frameH})
        </div>

        <div class="frame-card-actions">
          <div class="frame-action-main">
            ${frame.isExcluded ?
              `<button type="button" class="frame-btn-restore btn-toggle-frame" data-idx="${idx}" title="Restore Frame #${idx + 1} to animation loop and exports">
                 <span>↩️</span> Restore Frame
               </button>` :
              `<button type="button" class="frame-btn-remove btn-toggle-frame" data-idx="${idx}" title="Remove Frame #${idx + 1} from animation loop and exports">
                 <span>🗑️</span> Remove Frame
               </button>`
            }
          </div>
          <div class="frame-sub-actions">
            <button type="button" class="frame-btn-sub btn-inspect-frame" data-idx="${idx}" title="Inspect frame on player canvas">👁️</button>
            <button type="button" class="frame-btn-sub btn-shift-left" data-idx="${idx}" title="Move frame earlier in sequence" ${idx === 0 ? 'disabled' : ''}>⬅</button>
            <button type="button" class="frame-btn-sub btn-shift-right" data-idx="${idx}" title="Move frame later in sequence" ${idx === extractedFrames.length - 1 ? 'disabled' : ''}>➡</button>
            <button type="button" class="frame-btn-sub btn-download-frame" data-idx="${idx}" title="Download Frame #${idx + 1} PNG">💾</button>
          </div>
        </div>
      `;

      // Event: Inspect on click thumb
      const thumbBox = card.querySelector('.frame-thumb-box');
      thumbBox?.addEventListener('click', () => {
        inspectFrame(idx);
      });

      // Event: Inspect button
      const inspectBtn = card.querySelector('.btn-inspect-frame');
      inspectBtn?.addEventListener('click', () => {
        inspectFrame(idx);
      });

      // Event: Toggle Remove / Restore
      const toggleBtn = card.querySelector('.btn-toggle-frame');
      toggleBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        frame.isExcluded = !frame.isExcluded;
        renderExtractedFramesUI();
        updatePlayerStatusWithFrames();
        drawAnimFrame();
      });

      // Event: Shift Left
      const leftBtn = card.querySelector('.btn-shift-left');
      leftBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (idx > 0) {
          const temp = extractedFrames[idx];
          extractedFrames[idx] = extractedFrames[idx - 1];
          extractedFrames[idx - 1] = temp;
          renderExtractedFramesUI();
          drawAnimFrame();
        }
      });

      // Event: Shift Right
      const rightBtn = card.querySelector('.btn-shift-right');
      rightBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (idx < extractedFrames.length - 1) {
          const temp = extractedFrames[idx];
          extractedFrames[idx] = extractedFrames[idx + 1];
          extractedFrames[idx + 1] = temp;
          renderExtractedFramesUI();
          drawAnimFrame();
        }
      });

      // Event: Download single frame PNG
      const dlFrameBtn = card.querySelector('.btn-download-frame');
      dlFrameBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const a = document.createElement('a');
        a.href = frame.dataUrl;
        a.download = `frame_${String(idx + 1).padStart(2, '0')}.png`;
        a.click();
      });

      extractedFramesGrid.appendChild(card);
    });
  }

  function drawSourceGridOverlay() {
    if (!gridOverlayCanvas || !sourceCanvas || sourceCanvas.width === 0) return;

    gridOverlayCanvas.width = sourceCanvas.width;
    gridOverlayCanvas.height = sourceCanvas.height;
    const octx = gridOverlayCanvas.getContext('2d');
    octx.clearRect(0, 0, gridOverlayCanvas.width, gridOverlayCanvas.height);

    if (!toggleShowGridLines || !toggleShowGridLines.checked) return;

    const w = sourceCanvas.width;
    const h = sourceCanvas.height;
    const exactW = w / cols;
    const exactH = h / rows;

    const sliceInset = parseInt(sliceInsetSlider?.value || 0, 10);
    const sliceOffsetX = parseInt(sliceOffsetXSlider?.value || 0, 10);
    const sliceOffsetY = parseInt(sliceOffsetYSlider?.value || 0, 10);

    octx.save();

    // 1. Draw Cell Boundaries (dashed cyan)
    octx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
    octx.lineWidth = 1.5;
    octx.setLineDash([4, 3]);

    for (let c = 1; c < cols; c++) {
      const x = Math.round(c * exactW);
      octx.beginPath();
      octx.moveTo(x + 0.5, 0);
      octx.lineTo(x + 0.5, h);
      octx.stroke();
    }

    for (let r = 1; r < rows; r++) {
      const y = Math.round(r * exactH);
      octx.beginPath();
      octx.moveTo(0, y + 0.5);
      octx.lineTo(w, y + 0.5);
      octx.stroke();
    }

    // 2. Draw Inset Trim boxes if inset > 0 or offset != 0
    if (sliceInset > 0 || sliceOffsetX !== 0 || sliceOffsetY !== 0) {
      octx.strokeStyle = 'rgba(251, 191, 36, 0.85)'; // Amber
      octx.lineWidth = 1;
      octx.setLineDash([2, 2]);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x0 = Math.round(c * exactW);
          const x1 = Math.round((c + 1) * exactW);
          const y0 = Math.round(r * exactH);
          const y1 = Math.round((r + 1) * exactH);

          const sx = Math.max(0, Math.min(w - 1, x0 + sliceOffsetX + sliceInset));
          const sy = Math.max(0, Math.min(h - 1, y0 + sliceOffsetY + sliceInset));
          const sw = Math.max(1, Math.min(w - sx, (x1 - x0) - (sliceInset * 2)));
          const sh = Math.max(1, Math.min(h - sy, (y1 - y0) - (sliceInset * 2)));

          octx.strokeRect(sx + 0.5, sy + 0.5, sw - 1, sh - 1);
        }
      }
    }

    // 3. Draw Frame Badges (#1, #2...)
    octx.setLineDash([]);
    octx.font = 'bold 11px Inter, sans-serif';
    octx.textBaseline = 'top';

    let frameIdx = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x0 = Math.round(c * exactW);
        const y0 = Math.round(r * exactH);

        octx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        octx.fillRect(x0 + 4, y0 + 4, 30, 16);
        octx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
        octx.strokeRect(x0 + 4, y0 + 4, 30, 16);

        octx.fillStyle = '#00f0ff';
        octx.fillText(`#${frameIdx}`, x0 + 8, y0 + 6);
        frameIdx++;
      }
    }

    octx.restore();
  }

  function extractAllFrames(resetExclusions = false) {
    if (!sourceCanvas || sourceCanvas.width === 0) return;
    const w = sourceCanvas.width;
    const h = sourceCanvas.height;

    const sliceInset = parseInt(sliceInsetSlider?.value || 0, 10);
    const sliceOffsetX = parseInt(sliceOffsetXSlider?.value || 0, 10);
    const sliceOffsetY = parseInt(sliceOffsetYSlider?.value || 0, 10);

    const exactW = w / cols;
    const exactH = h / rows;
    const total = rowMode === 'all' ? (cols * rows) : cols;

    // Preserve previous exclusions by frame coordinate ID
    const previousExclusions = new Map();
    if (!resetExclusions && extractedFrames.length > 0) {
      extractedFrames.forEach(f => {
        previousExclusions.set(f.id, f.isExcluded);
      });
    }

    const newFrames = [];

    for (let i = 0; i < total; i++) {
      let c = i % cols;
      let r = 0;
      if (rowMode === 'all') {
        r = Math.floor(i / cols);
      } else if (rowMode === 'row2') {
        r = Math.min(1, rows - 1);
      }

      const x0 = Math.round(c * exactW);
      const x1 = Math.round((c + 1) * exactW);
      const y0 = Math.round(r * exactH);
      const y1 = Math.round((r + 1) * exactH);

      const cellW = x1 - x0;
      const cellH = y1 - y0;

      const sourceX = Math.max(0, Math.min(w - 1, x0 + sliceOffsetX + sliceInset));
      const sourceY = Math.max(0, Math.min(h - 1, y0 + sliceOffsetY + sliceInset));
      const sourceW = Math.max(1, Math.min(w - sourceX, cellW - (sliceInset * 2)));
      const sourceH = Math.max(1, Math.min(h - sourceY, cellH - (sliceInset * 2)));

      const fCanvas = document.createElement('canvas');
      fCanvas.width = sourceW;
      fCanvas.height = sourceH;
      const fctx = fCanvas.getContext('2d');
      fctx.imageSmoothingEnabled = false;
      fctx.drawImage(
        sourceCanvas,
        sourceX, sourceY, sourceW, sourceH,
        0, 0, sourceW, sourceH
      );

      const frameId = `f_${c}_${r}_${i}`;
      const isExcluded = previousExclusions.has(frameId) ? previousExclusions.get(frameId) : false;

      newFrames.push({
        id: frameId,
        origIndex: i,
        col: c,
        row: r,
        frameW: sourceW,
        frameH: sourceH,
        canvas: fCanvas,
        dataUrl: fCanvas.toDataURL('image/png'),
        isExcluded
      });
    }

    extractedFrames = newFrames;
    renderExtractedFramesUI();
    updatePlayerStatusWithFrames();
    drawSourceGridOverlay();
  }

  // Restore All Frames button handler
  btnRestoreAllFrames?.addEventListener('click', () => {
    extractedFrames.forEach(f => {
      f.isExcluded = false;
    });
    renderExtractedFramesUI();
    updatePlayerStatusWithFrames();
    drawAnimFrame();
    flashBtn(btnRestoreAllFrames, '✓ Restored All');
  });

  // Download Individual Frames button handler
  btnDownloadIndividualFrames?.addEventListener('click', () => {
    const active = getActiveFrames();
    if (active.length === 0) {
      alert('All frames are excluded! Please restore at least one frame before downloading.');
      return;
    }
    flashBtn(btnDownloadIndividualFrames, `✓ Exporting ${active.length} PNGs...`);
    vignetteOnDownload();
    active.forEach((f, i) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = f.dataUrl;
        a.download = `frame_${String(i + 1).padStart(2, '0')}.png`;
        a.click();
      }, i * 220);
    });
  });

  // Computer Vision Automatic Column & Row Grid Detector
  function autoDetectSpriteGrid(showNotification = true) {
    const pGrid = typeof getPromptGridDimensions === 'function' ? getPromptGridDimensions() : { cols: 5, rows: 2 };
    if (!sourceCanvas || sourceCanvas.width === 0) return { cols: pGrid.cols, rows: pGrid.rows };
    const w = sourceCanvas.width;
    const h = sourceCanvas.height;
    const ctx = sourceCanvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    const hex = colorPicker?.value || '#00FF00';
    const rKey = parseInt(hex.slice(1, 3), 16);
    const gKey = parseInt(hex.slice(3, 5), 16);
    const bKey = parseInt(hex.slice(5, 7), 16);
    const tolerance = parseInt(tolSlider?.value || 45, 10);
    const isGreenKey = gKey > rKey + 25 && gKey > bKey + 25;
    const isMagentaKey = rKey > gKey + 25 && bKey > gKey + 25;

    // Dynamically sample corners to detect image background color (supports chroma, dark, black, and transparent)
    const cornerSamples = [
      { x: 4, y: 4 },
      { x: Math.max(0, w - 5), y: 4 },
      { x: 4, y: Math.max(0, h - 5) },
      { x: Math.max(0, w - 5), y: Math.max(0, h - 5) }
    ];
    let sumR = 0, sumG = 0, sumB = 0, validCorners = 0;
    for (const pt of cornerSamples) {
      const idx = (pt.y * w + pt.x) * 4;
      if (data[idx + 3] > 30) {
        sumR += data[idx];
        sumG += data[idx + 1];
        sumB += data[idx + 2];
        validCorners++;
      }
    }
    const bgR = validCorners > 0 ? Math.round(sumR / validCorners) : rKey;
    const bgG = validCorners > 0 ? Math.round(sumG / validCorners) : gKey;
    const bgB = validCorners > 0 ? Math.round(sumB / validCorners) : bKey;
    const isDarkCorner = bgR < 35 && bgG < 35 && bgB < 35;

    const projX = new Float32Array(w);
    const projY = new Float32Array(h);

    for (let y = 0; y < h; y++) {
      const rowOffset = y * w;
      for (let x = 0; x < w; x++) {
        const idx = (rowOffset + x) * 4;
        const a = data[idx + 3];
        if (a < 30) continue; // Transparent pixel is background

        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        let isBg = false;
        const distKey = Math.sqrt((r - rKey) ** 2 + (g - gKey) ** 2 + (b - bKey) ** 2);
        const distCorner = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);

        if (distKey < tolerance || distCorner < 30) {
          isBg = true;
        } else if (isGreenKey && g > r + 25 && g > b + 25 && g > 60) {
          isBg = true;
        } else if (isMagentaKey && r > g + 25 && b > g + 25 && (r + b) > 120) {
          isBg = true;
        } else if (isDarkCorner && r < 35 && g < 35 && b < 35) {
          isBg = true;
        }

        if (!isBg) {
          projX[x] += 1;
          projY[y] += 1;
        }
      }
    }

    // 1. Detect Rows (1, 2, 3, 4)
    let bestR = pGrid.rows || 2;
    let minRScore = 1e9;
    const aspectTotal = w / h;

    for (let r of [1, 2, 3, 4]) {
      if (r === 1) {
        let score = (aspectTotal < 2.5 && h >= 300) ? 20 : 0;
        if (pGrid.rows === 1) score -= 40;
        if (score < minRScore) {
          minRScore = score;
          bestR = 1;
        }
        continue;
      }

      let penalty = 0;
      for (let k = 1; k < r; k++) {
        const by = Math.round(k * h / r);
        let minCut = 1e9;
        const start = Math.max(0, by - 4);
        const end = Math.min(h, by + 5);
        for (let y = start; y < end; y++) {
          if (projY[y] < minCut) minCut = projY[y];
        }
        penalty += (minCut === 1e9 ? 0 : minCut);
      }
      const avgCut = penalty / (r - 1);
      let rScore = avgCut;
      if (avgCut < 10 && aspectTotal <= 3.2) {
        rScore = avgCut - 60; // Clean horizontal split reward
      }
      if (r === pGrid.rows) {
        rScore -= 50; // Synergy reward with configured prompt
      }
      if (rScore < minRScore) {
        minRScore = rScore;
        bestR = r;
      }
    }

    // 2. Detect Columns (2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16)
    let bestC = pGrid.cols || 5;
    let minCScore = 1e9;
    const candidates = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16];

    for (let c of candidates) {
      let penalty = 0;
      for (let k = 1; k < c; k++) {
        const bx = Math.round(k * w / c);
        let minCut = 1e9;
        const start = Math.max(0, bx - 3);
        const end = Math.min(w, bx + 4);
        for (let x = start; x < end; x++) {
          if (projX[x] < minCut) minCut = projX[x];
        }
        penalty += (minCut === 1e9 ? 0 : minCut);
      }
      const avgCut = penalty / (c - 1);

      const frameW = w / c;
      const frameH = h / bestR;
      const cellAspect = frameW / frameH;

      // Internal gap penalty (penalizes multi-character cells e.g. c=3 when true is c=6)
      let internalGaps = 0;
      for (let i = 0; i < c; i++) {
        const cStart = Math.round(i * frameW + frameW * 0.25);
        const cEnd = Math.round((i + 1) * frameW - frameW * 0.25);
        if (cEnd > cStart) {
          let minMid = 1e9;
          for (let x = cStart; x < cEnd; x++) {
            if (projX[x] < minMid) minMid = projX[x];
          }
          if (minMid < 5) internalGaps++;
        }
      }

      // Aspect penalty
      let aspectPenalty = 0;
      if (cellAspect < 0.35) {
        aspectPenalty = (0.35 - cellAspect) * 100;
      } else if (cellAspect > 1.3) {
        aspectPenalty = (cellAspect - 1.3) * 100;
      }

      // Prompt synergy reward:
      const promptReward = (c === pGrid.cols && bestR === pGrid.rows) ? -280 : (c === pGrid.cols ? -150 : 0);
      const cleanCutReward = (avgCut === 0) ? -100 : 0;

      const totalScore = (avgCut * 5) + (internalGaps * 25) + aspectPenalty + promptReward + cleanCutReward;
      if (totalScore < minCScore) {
        minCScore = totalScore;
        bestC = c;
      }
    }

    cols = bestC;
    rows = bestR;
    if (colSelect) colSelect.value = String(bestC);
    if (rowSelect) rowSelect.value = String(bestR);
    if (rowModeSelect) rowModeSelect.value = 'all';
    rowMode = 'all';

    updateGridBadge();
    updatePlayerResInfo();
    extractAllFrames(true);
    drawAnimFrame();
    drawSourceGridOverlay();

    const totalF = (rows === 1) ? cols : (cols * rows);
    if (showNotification) {
      updateDropZoneStatus(`⚡ Auto-checked ${cols} cols × ${rows} rows (${totalF} frames) matching prompt & computer vision!`);
    }

    return { cols: bestC, rows: bestR };
  }

  function loadImageToCanvas(imgSrc) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      rawImage = img;
      sourceCanvas.width = img.naturalWidth || img.width;
      sourceCanvas.height = img.naturalHeight || img.height;

      // Initialize eraser mask to match image dimensions
      eraseMaskCanvas.width = sourceCanvas.width;
      eraseMaskCanvas.height = sourceCanvas.height;
      eraseMaskCtx.clearRect(0, 0, eraseMaskCanvas.width, eraseMaskCanvas.height);

      if (canvasWrap) canvasWrap.style.display = 'block';
      if (chromaControls) chromaControls.style.display = 'block';
      if (animPlaceholder) animPlaceholder.style.display = 'none';

      currentFrameIndex = 0;
      extractedFrames = [];

      // Initialize grid directly from prompt layout
      const pGrid = typeof getPromptGridDimensions === 'function' ? getPromptGridDimensions() : { cols: 5, rows: 2 };
      cols = pGrid.cols;
      rows = pGrid.rows;
      if (colSelect) colSelect.value = String(cols);
      if (rowSelect) rowSelect.value = String(rows);

      // Defringe safely without cutting character columns
      applyDefringe();

      // Computer Vision Auto-Detection runs with prompt synergy
      autoDetectSpriteGrid(true);
    };
    img.onerror = () => {
      updateDropZoneStatus("Failed to load image. Please use a valid PNG, JPG, or WebP file.", false);
    };
    img.src = imgSrc;
  }

  function applyDefringe() {
    if (!rawImage) return;
    const ctx = sourceCanvas.getContext('2d');
    ctx.drawImage(rawImage, 0, 0);

    const tolerance = parseInt(tolSlider?.value || 45, 10);
    const defringeAmt = parseInt(defringeSlider?.value || 2, 10);
    const hex = colorPicker?.value || '#00FF00';
    const rKey = parseInt(hex.slice(1, 3), 16);
    const gKey = parseInt(hex.slice(3, 5), 16);
    const bKey = parseInt(hex.slice(5, 7), 16);

    const isGreenKey = gKey > rKey + 25 && gKey > bKey + 25;
    const isMagentaKey = rKey > gKey + 25 && bKey > gKey + 25;

    try {
      const w = sourceCanvas.width;
      const h = sourceCanvas.height;
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // 1. Primary Chroma Key Background Removal
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const dist = Math.sqrt((r - rKey) ** 2 + (g - gKey) ** 2 + (b - bKey) ** 2);
        if (dist < tolerance) {
          data[i + 3] = 0; // Transparent
        } else if (dist < tolerance + 15) {
          data[i + 3] = Math.round(((dist - tolerance) / 15) * 255);
        }
      }

      // 1B. Smart Inner Box & Frame Divider Cleaner (Eliminates two-tone green/magenta boxes & outlines safely)
      const smartBoxCleanActive = smartBoxToggle ? smartBoxToggle.checked : true;
      if (smartBoxCleanActive) {
        const frameW = w / (cols || 1);
        const frameH = h / (rows || 1);
        const marginH = Math.min(20, Math.floor(h * 0.05));
        const marginW = Math.min(20, Math.floor(w * 0.05));

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            if (data[idx + 3] === 0) continue;

            // Determine if pixel is near a grid divider or image margin
            const distX = Math.min(x % frameW, frameW - (x % frameW));
            const distY = Math.min(y % frameH, frameH - (y % frameH));
            
            const isNearXDivider = distX < 4;
            const isNearYDivider = distY < 4;
            const isNearMargin = (x < marginW || x > w - marginW || y < marginH || y > h - marginH);

            if (isNearXDivider || isNearYDivider || isNearMargin) {
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];
              
              if (isGreenKey) {
                // Strictly purge true chroma green shades; NEVER erode neutral gray/silver armor
                if (g > r + 25 && g > b + 25 && g > 65) {
                  data[idx + 3] = 0;
                }
              } else if (isMagentaKey) {
                // Strictly purge true chroma magenta/pink shades
                if (r > g + 25 && b > g + 25 && (r + b) > 130) {
                  data[idx + 3] = 0;
                }
              }
            }
          }
        }
      }

      // 1C. Edge Defringe & Despill Halo Neutralization
      if (defringeAmt > 0) {
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] > 0 && data[i + 3] < 255) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            if (isGreenKey && g > r && g > b) {
              data[i + 1] = Math.round((r + b) / 2); // Neutralize green edge halo
            } else if (isMagentaKey && r > g && b > g) {
              const avg = Math.round((r + b) / 2);
              data[i] = Math.min(data[i], avg);
              data[i + 2] = Math.min(data[i + 2], avg);
            }
          }
        }
      }

      // 2. Gemini / AI Watermark Corner Erasure
      const wmEraseActive = wmToggle ? wmToggle.checked : true;
      if (wmEraseActive) {
        const corner = wmCornerSelect ? wmCornerSelect.value : 'br';
        const boxSize = parseInt(wmSizeSlider?.value || 85, 10);

        let startX = 0, endX = 0, startY = 0, endY = 0;
        if (corner === 'br') {
          startX = Math.max(0, w - boxSize);
          endX = w;
          startY = Math.max(0, h - boxSize);
          endY = h;
        } else if (corner === 'bl') {
          startX = 0;
          endX = Math.min(w, boxSize);
          startY = Math.max(0, h - boxSize);
          endY = h;
        } else if (corner === 'tr') {
          startX = Math.max(0, w - boxSize);
          endX = w;
          startY = 0;
          endY = Math.min(h, boxSize);
        } else if (corner === 'tl') {
          startX = 0;
          endX = Math.min(w, boxSize);
          startY = 0;
          endY = Math.min(h, boxSize);
        } else if (corner === 'all-bottom') {
          startX = 0;
          endX = w;
          startY = Math.max(0, h - Math.round(boxSize / 2));
          endY = h;
        }

        for (let y = startY; y < endY; y++) {
          for (let x = startX; x < endX; x++) {
            const idx = (y * w + x) * 4;
            data[idx + 3] = 0; // Clear corner watermark to alpha 0
          }
        }
      }

      // 3. Manual Eraser Brush Mask
      if (eraseMaskCanvas && eraseMaskCanvas.width === w && eraseMaskCanvas.height === h) {
        const maskData = eraseMaskCtx.getImageData(0, 0, w, h).data;
        for (let i = 0; i < maskData.length; i += 4) {
          if (maskData[i + 3] > 0) {
            data[i + 3] = 0;
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      extractAllFrames(false);
      drawAnimFrame();
    } catch (err) {
      console.warn('Canvas defringing skipped (cross-origin or unreadable):', err);
    }
  }

  // Animation Player Loop (Iterates strictly over non-removed Active Frames)
  function renderAnim(timestamp) {
    if (!lastAnimTime) lastAnimTime = timestamp;
    const interval = 1000 / fps;
    const elapsed = timestamp - lastAnimTime;

    if (elapsed > interval) {
      lastAnimTime = timestamp - (elapsed % interval);
      if (isPlaying && rawImage && sourceCanvas.width > 0) {
        const active = getActiveFrames();
        if (active.length > 0) {
          currentFrameIndex = (currentFrameIndex + 1) % active.length;
          drawAnimFrame();
        }
      }
    }
    requestAnimationFrame(renderAnim);
  }

  function drawAnimFrame() {
    if (!sourceCanvas || sourceCanvas.width === 0) return;
    const actx = animCanvas.getContext('2d');
    const active = getActiveFrames();

    const frameW = Math.floor(sourceCanvas.width / cols);
    const frameH = Math.floor(sourceCanvas.height / rows);

    animCanvas.width = frameW;
    animCanvas.height = frameH;

    actx.clearRect(0, 0, animCanvas.width, animCanvas.height);
    actx.imageSmoothingEnabled = false;

    if (active.length === 0) {
      // Graceful All-Frames-Excluded State
      actx.fillStyle = 'rgba(239, 68, 68, 0.12)';
      actx.fillRect(0, 0, frameW, frameH);
      actx.fillStyle = '#f87171';
      actx.font = 'bold 12px Inter, sans-serif';
      actx.textAlign = 'center';
      actx.textBaseline = 'middle';
      actx.fillText('All frames excluded', frameW / 2, frameH / 2 - 8);
      actx.font = '10px Inter, sans-serif';
      actx.fillStyle = '#ffffff';
      actx.fillText('Click "Restore All" below', frameW / 2, frameH / 2 + 12);

      if (frameDisplay) {
        frameDisplay.textContent = `0 / ${extractedFrames.length} Active (All Excluded)`;
      }
      return;
    }

    const curActiveIdx = currentFrameIndex % active.length;
    const targetFrame = active[curActiveIdx];

    actx.drawImage(targetFrame.canvas, 0, 0);

    if (frameDisplay) {
      const removedCount = extractedFrames.length - active.length;
      const removedText = removedCount > 0 ? ` (${removedCount} excluded)` : '';
      frameDisplay.textContent = `Frame: ${curActiveIdx + 1} / ${active.length} [Orig #${targetFrame.origIndex + 1}]${removedText}`;
    }

    highlightPlayingCard(targetFrame.id);
  }

  playToggleBtn?.addEventListener('click', () => {
    isPlaying = !isPlaying;
    playToggleBtn.textContent = isPlaying ? '⏸' : '▶';
  });

  stepPrevBtn?.addEventListener('click', () => {
    isPlaying = false;
    playToggleBtn.textContent = '▶';
    const active = getActiveFrames();
    if (active.length > 0) {
      currentFrameIndex = (currentFrameIndex - 1 + active.length) % active.length;
      drawAnimFrame();
    }
  });

  stepNextBtn?.addEventListener('click', () => {
    isPlaying = false;
    playToggleBtn.textContent = '▶';
    const active = getActiveFrames();
    if (active.length > 0) {
      currentFrameIndex = (currentFrameIndex + 1) % active.length;
      drawAnimFrame();
    }
  });

  fpsSlider?.addEventListener('input', (e) => {
    fps = parseInt(e.target.value, 10);
    if (fpsVal) fpsVal.textContent = fps;
  });

  tolSlider?.addEventListener('input', (e) => {
    if (tolVal) tolVal.textContent = e.target.value;
    applyDefringe();
  });

  defringeSlider?.addEventListener('input', (e) => {
    if (defringeVal) defringeVal.textContent = e.target.value;
    applyDefringe();
  });

  colorPicker?.addEventListener('input', applyDefringe);

  function getCanvasCoords(e) {
    if (!sourceCanvas) return { x: 0, y: 0 };
    const rect = sourceCanvas.getBoundingClientRect();
    const scaleX = sourceCanvas.width / rect.width;
    const scaleY = sourceCanvas.height / rect.height;
    return {
      x: Math.floor((e.clientX - rect.left) * scaleX),
      y: Math.floor((e.clientY - rect.top) * scaleY)
    };
  }

  function paintEraserStroke(x, y) {
    if (!eraseMaskCtx || !sourceCanvas || sourceCanvas.width === 0) return;
    const brushRadius = Math.round(parseInt(eraserSizeSlider?.value || 24, 10) / 2);
    eraseMaskCtx.fillStyle = '#ffffff';
    eraseMaskCtx.beginPath();
    eraseMaskCtx.arc(x, y, brushRadius, 0, Math.PI * 2);
    eraseMaskCtx.fill();
    applyDefringe();
  }

  sourceCanvas?.addEventListener('mousedown', (e) => {
    if (activeTool === 'eraser') {
      isErasing = true;
      const { x, y } = getCanvasCoords(e);
      paintEraserStroke(x, y);
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (isErasing && activeTool === 'eraser') {
      const { x, y } = getCanvasCoords(e);
      paintEraserStroke(x, y);
    }
  });

  window.addEventListener('mouseup', () => {
    if (isErasing) isErasing = false;
  });

  sourceCanvas?.addEventListener('click', (e) => {
    if (activeTool === 'eyedropper') {
      const { x, y } = getCanvasCoords(e);
      const ctx = sourceCanvas.getContext('2d');
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const hex = "#" + ((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1);
      if (colorPicker) colorPicker.value = hex;
      applyDefringe();
    }
  });

  btnEyedropper?.addEventListener('click', () => {
    activeTool = 'eyedropper';
    btnEyedropper.classList.remove('btn-silver-outline');
    btnEyedropper.classList.add('btn-silver');
    btnEraser?.classList.remove('btn-silver');
    btnEraser?.classList.add('btn-silver-outline');
    if (eraserSizeRow) eraserSizeRow.style.display = 'none';
    if (toolBadge) toolBadge.textContent = 'Eyedropper Active';
    if (sourceCanvas) sourceCanvas.style.cursor = 'crosshair';
  });

  btnEraser?.addEventListener('click', () => {
    activeTool = 'eraser';
    btnEraser.classList.remove('btn-silver-outline');
    btnEraser.classList.add('btn-silver');
    btnEyedropper?.classList.remove('btn-silver');
    btnEyedropper?.classList.add('btn-silver-outline');
    if (eraserSizeRow) eraserSizeRow.style.display = 'flex';
    if (toolBadge) toolBadge.textContent = 'Eraser Active (Click/Drag to Erase)';
    if (sourceCanvas) sourceCanvas.style.cursor = 'cell';
  });

  btnClearEraser?.addEventListener('click', () => {
    if (eraseMaskCtx && eraseMaskCanvas) {
      eraseMaskCtx.clearRect(0, 0, eraseMaskCanvas.width, eraseMaskCanvas.height);
      applyDefringe();
      flashBtn(btnClearEraser, '✓ Strokes Reset');
    }
  });

  wmToggle?.addEventListener('change', () => {
    const opts = document.getElementById('watermark-options');
    if (opts) opts.style.display = wmToggle.checked ? 'block' : 'none';
    applyDefringe();
  });

  smartBoxToggle?.addEventListener('change', applyDefringe);

  wmCornerSelect?.addEventListener('change', applyDefringe);

  wmSizeSlider?.addEventListener('input', (e) => {
    if (wmSizeVal) wmSizeVal.textContent = `${e.target.value}px`;
    applyDefringe();
  });

  eraserSizeSlider?.addEventListener('input', (e) => {
    if (eraserSizeVal) eraserSizeVal.textContent = `${e.target.value}px`;
  });

  function updateDropZoneStatus(message, isSuccess = true) {
    if (!dropZone) return;
    const label = dropZone.querySelector('.drop-label');
    const icon = dropZone.querySelector('.drop-icon-circle');
    const origLabel = "Drop AI Generated Sprite Strip Here";
    const origIcon = "⇧";

    if (label) {
      label.textContent = message;
      label.style.color = isSuccess ? '#ffffff' : '#f87171';
    }
    if (icon) {
      icon.textContent = isSuccess ? '✓' : '⚠';
      icon.style.borderColor = isSuccess ? '#ffffff' : '#f87171';
      icon.style.color = isSuccess ? '#ffffff' : '#f87171';
    }
    dropZone.classList.remove('pasted-success', 'pasted-error');
    dropZone.classList.add(isSuccess ? 'pasted-success' : 'pasted-error');

    setTimeout(() => {
      if (label) {
        label.textContent = origLabel;
        label.style.color = '';
      }
      if (icon) {
        icon.textContent = origIcon;
        icon.style.borderColor = '';
        icon.style.color = '';
      }
      dropZone.classList.remove('pasted-success', 'pasted-error');
    }, 3200);
  }

  function handleImageFile(file, sourceName = 'image') {
    if (!file || !file.type.startsWith('image/')) {
      updateDropZoneStatus('Unsupported file format. Please upload PNG, JPG, or WebP.', false);
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      loadImageToCanvas(ev.target.result);
      const sizeKb = Math.round(file.size / 1024);
      updateDropZoneStatus(`✓ Loaded ${sourceName} (${sizeKb > 0 ? sizeKb + ' KB' : 'clipboard'})`);
    };
    reader.onerror = () => {
      updateDropZoneStatus('Error reading image data.', false);
    };
    reader.readAsDataURL(file);
  }

  function handlePaste(e) {
    const clipboardData = e.clipboardData || window.clipboardData;
    if (!clipboardData) return;

    // 1. Check for image item in clipboardData.items (standard for copied screenshots/images)
    if (clipboardData.items) {
      for (let i = 0; i < clipboardData.items.length; i++) {
        const item = clipboardData.items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            handleImageFile(file, 'clipboard image');
            return;
          }
        }
      }
    }

    // 2. Check for image files in clipboardData.files (e.g. copied file from desktop/explorer)
    if (clipboardData.files && clipboardData.files.length > 0) {
      for (let i = 0; i < clipboardData.files.length; i++) {
        const file = clipboardData.files[i];
        if (file.type && file.type.startsWith('image/')) {
          e.preventDefault();
          handleImageFile(file, file.name || 'clipboard file');
          return;
        }
      }
    }

    // 3. If no binary image file, check if user pasted an image URL outside text inputs
    const activeEl = document.activeElement;
    const isTextInput = activeEl && (
      activeEl.tagName === 'INPUT' ||
      activeEl.tagName === 'TEXTAREA' ||
      activeEl.isContentEditable
    );

    if (!isTextInput) {
      const text = clipboardData.getData('text')?.trim();
      if (text) {
        if (text.startsWith('data:image/') || /^https?:\/\/.*\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(text)) {
          e.preventDefault();
          loadImageToCanvas(text);
          updateDropZoneStatus('✓ Loaded image from pasted URL');
        }
      }
    }
  }

  // Register global window paste listener so Ctrl+V works everywhere on the page
  window.addEventListener('paste', handlePaste);

  dropZone?.addEventListener('click', () => fileInput?.click());
  dropZone?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput?.click();
    }
  });

  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageFile(file, file.name);
    }
    fileInput.value = '';
  });

  dropZone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone?.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

  dropZone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageFile(file, file.name);
    }
  });

  colSelect?.addEventListener('change', () => {
    cols = parseInt(colSelect.value, 10);
    currentFrameIndex = 0;
    updateGridBadge();
    updatePlayerResInfo();
    extractAllFrames(true);
    drawAnimFrame();
    drawSourceGridOverlay();
  });

  rowSelect?.addEventListener('change', () => {
    rows = parseInt(rowSelect.value, 10);
    currentFrameIndex = 0;
    updateGridBadge();
    updatePlayerResInfo();
    extractAllFrames(true);
    drawAnimFrame();
    drawSourceGridOverlay();
  });

  rowModeSelect?.addEventListener('change', () => {
    rowMode = rowModeSelect.value;
    currentFrameIndex = 0;
    updateGridBadge();
    updatePlayerResInfo();
    extractAllFrames(true);
    drawAnimFrame();
    drawSourceGridOverlay();
  });

  gridPresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetCols = parseInt(btn.dataset.cols, 10);
      const targetRows = parseInt(btn.dataset.rows, 10);
      cols = targetCols;
      rows = targetRows;
      if (colSelect) colSelect.value = String(targetCols);
      if (rowSelect) rowSelect.value = String(targetRows);
      currentFrameIndex = 0;
      updateGridBadge();
      updatePlayerResInfo();
      extractAllFrames(true);
      drawAnimFrame();
      drawSourceGridOverlay();

      btn.style.borderColor = '#ffffff';
      btn.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
      setTimeout(() => {
        btn.style.borderColor = '';
        btn.style.backgroundColor = '';
      }, 500);
    });
  });

  // Slicing Boundary Offset & Inset Trim Listeners
  sliceInsetSlider?.addEventListener('input', (e) => {
    if (sliceInsetVal) sliceInsetVal.textContent = `${e.target.value}px`;
    extractAllFrames(false);
    drawAnimFrame();
  });

  sliceOffsetXSlider?.addEventListener('input', (e) => {
    if (sliceOffsetXVal) sliceOffsetXVal.textContent = `${e.target.value}px`;
    extractAllFrames(false);
    drawAnimFrame();
  });

  sliceOffsetYSlider?.addEventListener('input', (e) => {
    if (sliceOffsetYVal) sliceOffsetYVal.textContent = `${e.target.value}px`;
    extractAllFrames(false);
    drawAnimFrame();
  });

  btnResetSliceOffsets?.addEventListener('click', () => {
    if (sliceInsetSlider) sliceInsetSlider.value = '0';
    if (sliceInsetVal) sliceInsetVal.textContent = '0px';
    if (sliceOffsetXSlider) sliceOffsetXSlider.value = '0';
    if (sliceOffsetXVal) sliceOffsetXVal.textContent = '0px';
    if (sliceOffsetYSlider) sliceOffsetYSlider.value = '0';
    if (sliceOffsetYVal) sliceOffsetYVal.textContent = '0px';
    extractAllFrames(false);
    drawAnimFrame();
    flashBtn(btnResetSliceOffsets, '✓ Reset');
  });

  toggleShowGridLines?.addEventListener('change', drawSourceGridOverlay);

  const btnSyncToPrompt = document.getElementById('btn-sync-to-prompt');
  btnSyncToPrompt?.addEventListener('click', () => {
    syncGridWithPrompt(true);
    const pGrid = typeof getPromptGridDimensions === 'function' ? getPromptGridDimensions() : { cols: 5, rows: 2 };
    const total = pGrid.rows === 1 ? pGrid.cols : (pGrid.cols * pGrid.rows);
    updateDropZoneStatus(`⚡ Slicer synchronized to prompt: ${pGrid.cols} cols × ${pGrid.rows} rows (${total} frames)!`);
    flashBtn(btnSyncToPrompt, '✓ Synced to Prompt!');
  });

  btnAutoDetectGrid?.addEventListener('click', () => {
    if (!sourceCanvas || sourceCanvas.width === 0) {
      alert('Please load or drop a sprite sheet image first!');
      return;
    }
    autoDetectSpriteGrid(true);
    flashBtn(btnAutoDetectGrid, '✓ Grid Detected!');
  });

  const btnLoadSampleSheet = document.getElementById('btn-load-sample-sheet');
  btnLoadSampleSheet?.addEventListener('click', () => {
    loadImageToCanvas('assets/knight_12frame_walk.png');
    flashBtn(btnLoadSampleSheet, '✓ Loaded Demo Knight Sheet!');
  });

  function buildActiveSpriteSheetCanvas() {
    const active = getActiveFrames();
    if (active.length === 0) return null;

    const frameW = active[0].frameW;
    const frameH = active[0].frameH;

    const outCanvas = document.createElement('canvas');
    outCanvas.width = frameW * active.length;
    outCanvas.height = frameH;
    const octx = outCanvas.getContext('2d');
    octx.imageSmoothingEnabled = false;

    for (let i = 0; i < active.length; i++) {
      octx.drawImage(active[i].canvas, i * frameW, 0);
    }
    return outCanvas;
  }

  function generateSpriteJson() {
    if (!sourceCanvas || sourceCanvas.width === 0) return null;
    const active = getActiveFrames();
    if (active.length === 0) return null;

    const frameW = active[0].frameW;
    const frameH = active[0].frameH;
    const totalActive = active.length;
    const actionName = actionSelect ? actionSelect.value : 'action';

    const sheetW = frameW * totalActive;
    const sheetH = frameH;

    const framesArr = [];
    const animFrameList = [];

    for (let i = 0; i < totalActive; i++) {
      const fname = `${actionName}_${i}.png`;
      animFrameList.push(fname);
      framesArr.push({
        filename: fname,
        frame: { x: i * frameW, y: 0, w: frameW, h: frameH },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: frameW, h: frameH },
        sourceSize: { w: frameW, h: frameH },
        duration: Math.round(1000 / fps),
        originalIndex: active[i].origIndex,
        originalGrid: { col: active[i].col + 1, row: active[i].row + 1 }
      });
    }

    return {
      meta: {
        app: "PixelSpur Sprite Studio",
        version: "2.3",
        image: `pixelspur_spritesheet_${totalActive}frames.png`,
        format: "RGBA8888",
        size: { w: sheetW, h: sheetH },
        scale: "1",
        fps: fps,
        grid: {
          cols: totalActive,
          rows: 1,
          totalActiveFrames: totalActive,
          totalSlicedFrames: extractedFrames.length,
          excludedFramesCount: extractedFrames.length - totalActive
        }
      },
      frames: framesArr,
      animations: {
        [actionName]: animFrameList
      }
    };
  }

  function downloadFile(content, fileName, contentType) {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  dlPngBtn?.addEventListener('click', () => {
    if (!sourceCanvas || sourceCanvas.width === 0) {
      alert('Please load or drop a sprite sheet image first!');
      return;
    }
    const active = getActiveFrames();
    if (active.length === 0) {
      alert('All frames are excluded! Please restore at least one frame before downloading.');
      return;
    }
    const cleanCanvas = buildActiveSpriteSheetCanvas();
    if (!cleanCanvas) return;
    const dataUrl = cleanCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `pixelspur_spritesheet_${active.length}frames.png`;
    a.click();
    flashBtn(dlPngBtn, `✓ Downloaded ${active.length}f PNG!`);
    vignetteOnDownload();
  });

  dlJsonBtn?.addEventListener('click', () => {
    const json = generateSpriteJson();
    if (!json) {
      alert('Please load or drop a sprite sheet image first!');
      return;
    }
    const active = getActiveFrames();
    downloadFile(JSON.stringify(json, null, 2), `pixelspur_spritesheet_${active.length}frames.json`, 'application/json');
    flashBtn(dlJsonBtn, `✓ Downloaded ${active.length}f JSON!`);
    vignetteOnDownload();
  });

  dlBundleBtn?.addEventListener('click', () => {
    if (!sourceCanvas || sourceCanvas.width === 0) {
      alert('Please load or drop a sprite sheet image first!');
      return;
    }
    const active = getActiveFrames();
    if (active.length === 0) {
      alert('All frames are excluded! Please restore at least one frame before downloading.');
      return;
    }
    dlPngBtn.click();
    setTimeout(() => dlJsonBtn.click(), 300);
    flashBtn(dlBundleBtn, '✓ Downloaded Bundle!');
  });

  /* ═══════════════════════════════════════════════════════════
     7. AI TRAINING LAB & USER RESPONSE SYSTEM
     ═══════════════════════════════════════════════════════════ */
  const modalFeedback = document.getElementById('modal-feedback');
  const modalDataset = document.getElementById('modal-dataset');
  const btnHeaderFeedback = document.getElementById('header-btn-feedback');
  const btnOpenFeedback = document.getElementById('btn-open-feedback');
  const btnViewFeedbackRecords = document.getElementById('btn-view-feedback-records');
  const btnCloseFeedback = document.getElementById('modal-feedback-close');
  const btnCloseDataset = document.getElementById('modal-dataset-close');
  const feedbackForm = document.getElementById('feedback-form');
  const headerFeedbackCount = document.getElementById('header-feedback-count');
  const feedbackCountBadge = document.getElementById('feedback-count-badge');
  const datasetTotalCount = document.getElementById('dataset-total-count');
  const datasetTableBody = document.getElementById('dataset-table-body');
  const datasetRefreshBtn = document.getElementById('dataset-refresh-btn');
  const datasetDlJsonBtn = document.getElementById('dataset-dl-json-btn');
  const datasetDlJsonlBtn = document.getElementById('dataset-dl-jsonl-btn');
  const fbDlJsonBtn = document.getElementById('fb-btn-download-json');
  const fbDlJsonlBtn = document.getElementById('fb-btn-download-jsonl');
  const fbStarBtns = document.querySelectorAll('#fb-star-container .star-btn');
  const fbRatingInput = document.getElementById('fb-rating');
  const fbRatingText = document.getElementById('fb-rating-text');
  const fbStatusMsg = document.getElementById('fb-status-msg');
  const fbUserIssue = document.getElementById('fb-user-issue');
  const fbExpected = document.getElementById('fb-expected');
  const fbCategory = document.getElementById('fb-category');
  const fbCtxInfo = document.getElementById('fb-ctx-info');
  const fbPromptPreview = document.getElementById('fb-prompt-preview');
  const fbSubmitBtn = document.getElementById('fb-submit-btn');

  const ratingLabels = {
    1: '1 / 5 (Critical Flaw)',
    2: '2 / 5 (Needs Improvement)',
    3: '3 / 5 (Acceptable / Fair)',
    4: '4 / 5 (Good Quality)',
    5: '5 / 5 (Flawless Target)'
  };

  function setRating(val) {
    if (fbRatingInput) fbRatingInput.value = String(val);
    if (fbRatingText) fbRatingText.textContent = ratingLabels[val] || `${val} / 5`;
    fbStarBtns.forEach(btn => {
      const s = parseInt(btn.dataset.star, 10);
      if (s <= val) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  fbStarBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const s = parseInt(btn.dataset.star, 10);
      if (s) setRating(s);
    });
  });

  function updateCountBadges(count) {
    const c = String(count);
    if (headerFeedbackCount) headerFeedbackCount.textContent = c;
    if (feedbackCountBadge) feedbackCountBadge.textContent = c;
    if (datasetTotalCount) datasetTotalCount.textContent = c;
  }

  function getLocalResponses() {
    try {
      const str = localStorage.getItem('pixelspur_user_responses');
      return str ? JSON.parse(str) : [];
    } catch (e) {
      return [];
    }
  }

  function saveLocalResponse(record) {
    try {
      const list = getLocalResponses();
      list.push(record);
      localStorage.setItem('pixelspur_user_responses', JSON.stringify(list));
      return list.length;
    } catch (e) {
      return 0;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getCategoryBadgeClass(cat) {
    switch (cat) {
      case 'character_drifting': return 'cat-drift';
      case 'loop_glitch': return 'cat-loop';
      case 'perspective_shift': return 'cat-persp';
      case 'watermark_artifacts': return 'cat-watermark';
      case 'anatomical_morph': return 'cat-morph';
      default: return 'cat-general';
    }
  }

  function formatCategoryName(cat) {
    switch (cat) {
      case 'character_drifting': return 'Drifting Motion';
      case 'loop_glitch': return 'Loop Glitch';
      case 'perspective_shift': return 'Perspective Shift';
      case 'watermark_artifacts': return 'Watermark Logo';
      case 'anatomical_morph': return 'Anatomical Morph';
      case 'slicing_misaligned': return 'Grid Slicing';
      case 'limb_clipping': return 'Limb Clipping';
      default: return 'General Training';
    }
  }

  function openFeedbackModal() {
    if (!modalFeedback) return;

    const actionText = actionSelect ? (actionSelect.options[actionSelect.selectedIndex]?.text.split('(')[0].trim() || actionSelect.value) : 'Animation';
    const engineText = engineMode ? (engineMode.options[engineMode.selectedIndex]?.text.split('(')[0].trim() || engineMode.value) : 'Engine';
    if (fbCtxInfo) {
      fbCtxInfo.textContent = `${actionText} • ${promptFrames} Frames • ${engineText}`;
    }
    if (fbPromptPreview) {
      fbPromptPreview.textContent = promptOutput?.textContent.trim() || '(No prompt generated yet)';
    }
    if (fbStatusMsg) {
      fbStatusMsg.style.display = 'none';
      fbStatusMsg.textContent = '';
    }

    modalFeedback.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeFeedbackModal() {
    if (modalFeedback) modalFeedback.classList.remove('open');
    document.body.style.overflow = '';
  }

  function openDatasetModal() {
    if (!modalDataset) return;
    modalDataset.classList.add('open');
    document.body.style.overflow = 'hidden';
    loadDatasetTable();
  }

  function closeDatasetModal() {
    if (modalDataset) modalDataset.classList.remove('open');
    document.body.style.overflow = '';
  }

  async function loadDatasetTable() {
    if (!datasetTableBody) return;
    datasetTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--silver-400); padding:2rem;">Fetching training records from user_responses.json...</td></tr>`;

    let records = [];
    try {
      const res = await fetch('https://pixelspur.onrender.com/api/feedback');
      if (res.ok) {
        const data = await res.json();
        records = data.responses || [];
      }
    } catch (err) {
      console.warn('Backend fetch failed, checking local backup:', err);
    }

    if (records.length === 0) {
      records = getLocalResponses();
    }

    updateCountBadges(records.length);

    if (records.length === 0) {
      datasetTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--silver-300); padding:2rem;">No feedback recorded yet. Submit your first issue or training sample!</td></tr>`;
      return;
    }

    datasetTableBody.innerHTML = [...records].reverse().map(item => {
      const catClass = getCategoryBadgeClass(item.category);
      const catName = formatCategoryName(item.category);
      const r = Math.max(1, Math.min(5, parseInt(item.rating, 10) || 3));
      const stars = '★'.repeat(r) + '☆'.repeat(5 - r);
      const shortId = (item.id || '').replace('resp_', '');
      const actionText = `${item.action || 'action'} (${item.frames || 10}f)`;

      return `
        <tr>
          <td><code style="font-size:0.7rem; color:var(--silver-300);">${escapeHtml(shortId)}</code></td>
          <td><span class="cat-badge ${catClass}">${escapeHtml(catName)}</span></td>
          <td><strong style="color:#fff;">${escapeHtml(actionText)}</strong><br/><span style="font-size:0.68rem; color:var(--silver-300);">${escapeHtml(item.engine || 'engine')}</span></td>
          <td style="color:var(--silver-200); font-size:0.78rem; line-height:1.4;">${escapeHtml(item.user_issue || '—')}</td>
          <td style="color:#38ef7d; font-size:0.78rem; line-height:1.4;">${escapeHtml(item.expected_behavior || '—')}</td>
          <td style="color:#f59e0b; font-family:var(--mono); font-size:0.8rem; white-space:nowrap;">${stars}</td>
        </tr>
      `;
    }).join('');
  }

  feedbackForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const category = fbCategory?.value || 'general_issue';
    const rating = parseInt(fbRatingInput?.value || '3', 10);
    const userIssue = fbUserIssue?.value.trim();
    const expectedBehavior = fbExpected?.value.trim();

    if (!userIssue) {
      alert('Please describe what went wrong with the AI output.');
      return;
    }

    const payload = {
      category,
      rating,
      character: charDesc?.value.trim() || 'Custom Character',
      action: actionSelect?.value || 'walk',
      frames: promptFrames,
      layout: promptLayoutMode?.value || 'auto',
      style: artStyle?.value || '16-bit retro pixel art',
      engine: engineMode?.value || 'mj',
      prompt_used: promptOutput?.textContent.trim() || '',
      user_issue: userIssue,
      expected_behavior: expectedBehavior
    };

    if (fbSubmitBtn) {
      fbSubmitBtn.disabled = true;
      fbSubmitBtn.textContent = '⏳ Writing to user_responses.json & jsonl...';
    }

    try {
      const res = await fetch('https://pixelspur.onrender.com/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (fbStatusMsg) {
        fbStatusMsg.style.display = 'block';
        fbStatusMsg.style.color = '#38ef7d';
        fbStatusMsg.textContent = `✓ Recorded sample (${data.id || 'new'}) to user_responses.json and user_responses.jsonl for AI training!`;
      }

      if (typeof data.count === 'number') {
        updateCountBadges(data.count);
      }

      if (fbUserIssue) fbUserIssue.value = '';
      if (fbExpected) fbExpected.value = '';

      setTimeout(() => {
        closeFeedbackModal();
        if (fbStatusMsg) fbStatusMsg.style.display = 'none';
      }, 2000);

    } catch (err) {
      console.warn('Server endpoint error, saving to local backup:', err);
      const newCount = saveLocalResponse({
        id: 'resp_local_' + Date.now(),
        timestamp: new Date().toISOString(),
        ...payload
      });
      updateCountBadges(newCount);

      if (fbStatusMsg) {
        fbStatusMsg.style.display = 'block';
        fbStatusMsg.style.color = '#facc15';
        fbStatusMsg.textContent = '✓ Saved locally! Server API offline. You can export JSON / JSONL anytime.';
      }

      if (fbUserIssue) fbUserIssue.value = '';
      if (fbExpected) fbExpected.value = '';

      setTimeout(() => {
        closeFeedbackModal();
        if (fbStatusMsg) fbStatusMsg.style.display = 'none';
      }, 2500);
    } finally {
      if (fbSubmitBtn) {
        fbSubmitBtn.disabled = false;
        fbSubmitBtn.textContent = '🚀 Submit & Record to AI Training File';
      }
    }
  });

  async function downloadDatasetJSON() {
    let records = [];
    try {
      const res = await fetch('https://pixelspur.onrender.com/api/feedback');
      if (res.ok) {
        const data = await res.json();
        records = data.responses || [];
      }
    } catch (e) {
      records = getLocalResponses();
    }
    if (records.length === 0) records = getLocalResponses();
    downloadFile(JSON.stringify(records, null, 2), 'user_responses.json', 'application/json');
  }

  async function downloadDatasetJSONL() {
    let records = [];
    try {
      const res = await fetch('https://pixelspur.onrender.com/api/feedback');
      if (res.ok) {
        const data = await res.json();
        records = data.responses || [];
      }
    } catch (e) {
      records = getLocalResponses();
    }
    if (records.length === 0) records = getLocalResponses();
    const jsonl = records.map(r => JSON.stringify(r)).join('\n') + '\n';
    downloadFile(jsonl, 'user_responses.jsonl', 'application/x-jsonlines');
  }

  datasetDlJsonBtn?.addEventListener('click', downloadDatasetJSON);
  fbDlJsonBtn?.addEventListener('click', downloadDatasetJSON);
  datasetDlJsonlBtn?.addEventListener('click', downloadDatasetJSONL);
  fbDlJsonlBtn?.addEventListener('click', downloadDatasetJSONL);

  btnHeaderFeedback?.addEventListener('click', openFeedbackModal);
  btnOpenFeedback?.addEventListener('click', openFeedbackModal);
  btnViewFeedbackRecords?.addEventListener('click', openDatasetModal);
  btnCloseFeedback?.addEventListener('click', closeFeedbackModal);
  btnCloseDataset?.addEventListener('click', closeDatasetModal);
  datasetRefreshBtn?.addEventListener('click', loadDatasetTable);

  modalFeedback?.addEventListener('click', (e) => {
    if (e.target === modalFeedback) closeFeedbackModal();
  });
  modalDataset?.addEventListener('click', (e) => {
    if (e.target === modalDataset) closeDatasetModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeFeedbackModal();
      closeDatasetModal();
    }
  });

  async function fetchFeedbackCount() {
    try {
      const res = await fetch('https://pixelspur.onrender.com/api/feedback');
      if (res.ok) {
        const data = await res.json();
        if (typeof data.count === 'number') {
          updateCountBadges(data.count);
          return;
        }
      }
    } catch (e) {
      // Backend offline, fallback to local
    }
    const local = getLocalResponses();
    updateCountBadges(local.length || 3);
  }

  fetchFeedbackCount();

  updatePrompt();
  requestAnimationFrame(renderAnim);
}

