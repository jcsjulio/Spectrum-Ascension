import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  RotateCw, 
  Flame, 
  Moon, 
  Zap, 
  TrendingUp, 
  Volume2, 
  VolumeX, 
  Info, 
  Award, 
  Layers, 
  Activity, 
  Atom, 
  ChevronRight, 
  Palette, 
  Star, 
  Play, 
  HelpCircle,
  Undo2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Custom Type declarations
interface ColorUpgrade {
  id: string;
  name: string;
  color: string;
  cost: number;
  level: number;
  multiplier: number;
  baseProduction: number;
  automationUnlocked: boolean;
  isUnlocked: boolean;
  description: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
  life: number;
  maxLife: number;
}

interface Achievement {
  id: string;
  title: string;
  desc: string;
  unlocked: boolean;
  category: 'clicks' | 'points' | 'prestige' | 'colors';
  reqValue: number;
}

export default function App() {
  // --- Game Currencies & Primary States ---
  const [colorPoints, setColorPoints] = useState<number>(0);
  const [totalColorPointsEver, setTotalColorPointsEver] = useState<number>(0);
  const [clickCount, setClickCount] = useState<number>(0);
  
  // Prestige 1: Reinício Cromático
  const [prismaticFragments, setPrismaticFragments] = useState<number>(0);
  const [totalPrismaticFragments, setTotalPrismaticFragments] = useState<number>(0);
  const [chromaticResets, setChromaticResets] = useState<number>(0);

  // Prestige 2: Ascensão Espectral
  const [spectralStars, setSpectralStars] = useState<number>(0);
  const [spectralAscensions, setSpectralAscensions] = useState<number>(0);
  const [activeDimension, setActiveDimension] = useState<number>(1); // Dimensions 1-4
  const [spectralMultiplier, setSpectralMultiplier] = useState<number>(1);

  // Prestige 3: Big Bang Cromático
  const [colorSingularities, setColorSingularities] = useState<number>(0);
  const [bigBangs, setBigBangs] = useState<number>(0);
  const [unlockedCosmicLaws, setUnlockedCosmicLaws] = useState<string[]>([]);

  // --- Audio Synth Engine settings ---
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.15);

  // --- Particle Canvas ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particles = useRef<Particle[]>([]);

  // --- Active Tab ---
  // Tabs: 'core' (Prisma Central), 'upgrades' (Cores e Automação), 'blender' (Laboratório), 'prestige' (Prestígio), 'stats' (Estatísticas & Conquistas)
  const [activeTab, setActiveTab] = useState<'core' | 'upgrades' | 'blender' | 'prestige' | 'stats'>('core');

  // --- Color Mixing / Blending Ratios ---
  const [mixRed, setMixRed] = useState<number>(33);
  const [mixGreen, setMixGreen] = useState<number>(33);
  const [mixBlue, setMixBlue] = useState<number>(34);
  const [unlockedBlends, setUnlockedBlends] = useState<string[]>([]);

  // --- Random Event State ---
  // Active events: null, 'storm', 'eclipse', 'supernova', 'inversion', 'timewarp'
  const [activeEvent, setActiveEvent] = useState<string | null>(null);
  const [eventTimeLeft, setEventTimeLeft] = useState<number>(0);
  const [eventSpawnTimer, setEventSpawnTimer] = useState<number>(30); // countdown to random event bubble
  const [bubblePosition, setBubblePosition] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [showEventBubble, setShowEventBubble] = useState<boolean>(false);

  // --- Upgrade Store State ---
  const [upgrades, setUpgrades] = useState<ColorUpgrade[]>([
    {
      id: 'red',
      name: 'Fóton Vermelho',
      color: '#ef4444',
      cost: 15,
      level: 0,
      multiplier: 1,
      baseProduction: 0.2,
      automationUnlocked: false,
      isUnlocked: true,
      description: 'Gera pequenos pulsos constantes de Vermelho.'
    },
    {
      id: 'green',
      name: 'Fóton Verde',
      color: '#22c55e',
      cost: 100,
      level: 0,
      multiplier: 1,
      baseProduction: 1.5,
      automationUnlocked: false,
      isUnlocked: false,
      description: 'Gera energia verde que multiplica a produção do Vermelho em x1.5 por nível.'
    },
    {
      id: 'blue',
      name: 'Fóton Azul',
      color: '#3b82f6',
      cost: 1200,
      level: 0,
      multiplier: 1,
      baseProduction: 8,
      automationUnlocked: false,
      isUnlocked: false,
      description: 'Gera ondas azuis cristalinas que aceleram todo o espectro visível.'
    },
    {
      id: 'yellow',
      name: 'Radiação Amarela',
      color: '#eab308',
      cost: 15000,
      level: 0,
      multiplier: 1,
      baseProduction: 45,
      automationUnlocked: false,
      isUnlocked: false,
      description: 'Mistura energia vermelha e verde para ampliar as autocombustões cromáticas.'
    },
    {
      id: 'cyan',
      name: 'Plasma Ciano',
      color: '#06b6d4',
      cost: 120000,
      level: 0,
      multiplier: 1,
      baseProduction: 250,
      automationUnlocked: false,
      isUnlocked: false,
      description: 'Sincroniza fluxos verdes e azuis, reduzindo o custo de upgrades básicos.'
    },
    {
      id: 'magenta',
      name: 'Névoa Magenta',
      color: '#d946ef',
      cost: 1000000,
      level: 0,
      multiplier: 1,
      baseProduction: 1500,
      automationUnlocked: false,
      isUnlocked: false,
      description: 'A força máxima do espectro, multiplicando todo o ganho de prestígio.'
    }
  ]);

  // --- Permanent Prismatic Upgrades (Prestige 1 Shop) ---
  const [prismaticUpgrades, setPrismaticUpgrades] = useState({
    clickBoost: { level: 0, cost: 5, label: 'Toque Cintilante', desc: '+150% força do clique por nível.' },
    autoCol: { level: 0, cost: 15, label: 'Automação Cromática', desc: 'Ativa geradores de forma autônoma sem delay.' },
    offlineRate: { level: 0, cost: 10, label: 'Fluxo Temporal', desc: 'Recupere +15% de produção offline por nível.' },
    luckyTrigger: { level: 0, cost: 20, label: 'Anomalia Prismática', desc: 'Dobra a duração de eventos aleatórios.' }
  });

  // --- Spectral Perks (Prestige 2 Upgrades) ---
  const [spectralPerks, setSpectralPerks] = useState({
    dimBypass: { active: false, cost: 2, label: 'Fissão Dimensional', desc: 'A produção da dimensão atual se espalha para as outras.' },
    shimmerBonus: { active: false, cost: 3, label: 'Brilho Estelar', desc: 'Eventos aleatórios aumentam a produção em +100% de forma permanente.' },
    prestigeness: { active: false, cost: 5, label: 'Cromagem Infinita', desc: 'O Reinício Cromático não reseta mais o Fóton Vermelho.' }
  });

  // --- Cosmic Laws (Prestige 3 Upgrades) ---
  const cosmicLawsList = [
    { id: 'law_infinity', label: 'Lei da Luz Infinita', desc: 'Pontos de Cor são multiplicados com base no tempo de jogo atual (até x5000).', cost: 1 },
    { id: 'law_entropy', label: 'Lei da Entropia Cromática', desc: 'Custo de todos os geradores é reduzido em 90%.', cost: 2 },
    { id: 'law_resonance', label: 'Lei da Ressonância Cósmica', desc: 'Dobra todos os bônus ativos de misturas de cores no Laboratório.', cost: 3 }
  ];

  // --- Achievements State ---
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: 'click_10', title: 'Primeiro Raio', desc: 'Clique 10 vezes no prisma central', unlocked: false, category: 'clicks', reqValue: 10 },
    { id: 'click_100', title: 'Frequência Frenética', desc: 'Clique 100 vezes no prisma central', unlocked: false, category: 'clicks', reqValue: 100 },
    { id: 'pts_1000', title: 'Luz Visível', desc: 'Acumule 1.000 pontos de cor', unlocked: false, category: 'points', reqValue: 1000 },
    { id: 'pts_1m', title: 'Espectro Divino', desc: 'Acumule 1.000.000 de pontos de cor', unlocked: false, category: 'points', reqValue: 1000000 },
    { id: 'prestige_1', title: 'Primeira Dispersão', desc: 'Realize 1 Reinício Cromático', unlocked: false, category: 'prestige', reqValue: 1 },
    { id: 'colors_all', title: 'Mestre da Luz', desc: 'Desbloqueie todas as 6 cores primárias e secundárias', unlocked: false, category: 'colors', reqValue: 6 }
  ]);

  const [lastNotification, setLastNotification] = useState<string | null>(null);

  // --- Load progress from Local Storage ---
  useEffect(() => {
    const savedData = localStorage.getItem('spectrum_ascension_save_v1');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.colorPoints !== undefined) setColorPoints(parsed.colorPoints);
        if (parsed.totalColorPointsEver !== undefined) setTotalColorPointsEver(parsed.totalColorPointsEver);
        if (parsed.clickCount !== undefined) setClickCount(parsed.clickCount);
        if (parsed.prismaticFragments !== undefined) setPrismaticFragments(parsed.prismaticFragments);
        if (parsed.totalPrismaticFragments !== undefined) setTotalPrismaticFragments(parsed.totalPrismaticFragments);
        if (parsed.chromaticResets !== undefined) setChromaticResets(parsed.chromaticResets);
        if (parsed.spectralStars !== undefined) setSpectralStars(parsed.spectralStars);
        if (parsed.spectralAscensions !== undefined) setSpectralAscensions(parsed.spectralAscensions);
        if (parsed.colorSingularities !== undefined) setColorSingularities(parsed.colorSingularities);
        if (parsed.bigBangs !== undefined) setBigBangs(parsed.bigBangs);
        if (parsed.unlockedCosmicLaws !== undefined) setUnlockedCosmicLaws(parsed.unlockedCosmicLaws);
        if (parsed.mixRed !== undefined) setMixRed(parsed.mixRed);
        if (parsed.mixGreen !== undefined) setMixGreen(parsed.mixGreen);
        if (parsed.mixBlue !== undefined) setMixBlue(parsed.mixBlue);
        if (parsed.unlockedBlends !== undefined) setUnlockedBlends(parsed.unlockedBlends);

        // Map upgrades safely
        if (parsed.upgrades) {
          setUpgrades(prev => prev.map(up => {
            const found = parsed.upgrades.find((pUp: any) => pUp.id === up.id);
            return found ? { ...up, ...found } : up;
          }));
        }

        if (parsed.prismaticUpgrades) setPrismaticUpgrades(parsed.prismaticUpgrades);
        if (parsed.spectralPerks) setSpectralPerks(parsed.spectralPerks);
        if (parsed.achievements) {
          setAchievements(prev => prev.map(ach => {
            const found = parsed.achievements.find((pAch: any) => pAch.id === ach.id);
            return found ? { ...ach, unlocked: found.unlocked } : ach;
          }));
        }

        // Handle offline progress calculation
        if (parsed.lastSaveTime) {
          const offlineMs = Date.now() - parsed.lastSaveTime;
          if (offlineMs > 10000) {
            const secondsOffline = Math.floor(offlineMs / 1000);
            const baseRate = calculateProductionRate();
            const flowMultiplier = 0.05 + (prismaticUpgrades.offlineRate.level * 0.15);
            const offlineGained = baseRate * secondsOffline * flowMultiplier;
            if (offlineGained > 0) {
              setColorPoints(prev => prev + offlineGained);
              setTotalColorPointsEver(prev => prev + offlineGained);
              triggerToast(`Você ficou offline por ${secondsOffline} segundos e obteve +${formatNumber(offlineGained)} Pontos de Cor!`);
            }
          }
        }
      } catch (err) {
        console.error("Error restoring save", err);
      }
    }
  }, []);

  // --- Save game periodically ---
  useEffect(() => {
    const saveInterval = setInterval(() => {
      const stateToSave = {
        colorPoints,
        totalColorPointsEver,
        clickCount,
        prismaticFragments,
        totalPrismaticFragments,
        chromaticResets,
        spectralStars,
        spectralAscensions,
        colorSingularities,
        bigBangs,
        unlockedCosmicLaws,
        mixRed,
        mixGreen,
        mixBlue,
        unlockedBlends,
        upgrades: upgrades.map(u => ({ id: u.id, level: u.level, cost: u.cost, isUnlocked: u.isUnlocked })),
        prismaticUpgrades,
        spectralPerks,
        achievements: achievements.map(a => ({ id: a.id, unlocked: a.unlocked })),
        lastSaveTime: Date.now()
      };
      localStorage.setItem('spectrum_ascension_save_v1', JSON.stringify(stateToSave));
    }, 10000);

    return () => clearInterval(saveInterval);
  }, [
    colorPoints, totalColorPointsEver, clickCount, prismaticFragments, totalPrismaticFragments,
    chromaticResets, spectralStars, spectralAscensions, colorSingularities, bigBangs,
    unlockedCosmicLaws, mixRed, mixGreen, mixBlue, unlockedBlends, upgrades, prismaticUpgrades,
    spectralPerks, achievements
  ]);

  // --- Web Audio Synthesizer Node ---
  const playSound = (freq: number, type: 'sine' | 'triangle' | 'sawtooth' | 'square' = 'sine') => {
    if (!audioEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      // Audio context might fail on initial click if not fully interacted
    }
  };

  // Sound patterns
  const playClickSound = () => {
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // Pentatonic scale (C, D, E, G, A, C)
    const randomFreq = scale[Math.floor(Math.random() * scale.length)];
    playSound(randomFreq, 'sine');
  };

  const playUpgradeSound = () => {
    playSound(440, 'triangle');
    setTimeout(() => playSound(554.37, 'triangle'), 100);
    setTimeout(() => playSound(659.25, 'triangle'), 200);
  };

  const playPrestigeSound = () => {
    playSound(220, 'sine');
    setTimeout(() => playSound(330, 'sine'), 150);
    setTimeout(() => playSound(440, 'sine'), 300);
    setTimeout(() => playSound(660, 'sine'), 450);
  };

  // --- Trigger floating notification ---
  const triggerToast = (msg: string) => {
    setLastNotification(msg);
    setTimeout(() => {
      setLastNotification(prev => prev === msg ? null : prev);
    }, 4500);
  };

  // --- Calculate Current Modifiers and Base Rates ---
  const calculateClickPower = (): number => {
    let base = 1;
    // Click upgrade boost
    base += prismaticUpgrades.clickBoost.level * 1.5;
    // Dimension scale active
    if (activeDimension === 2) base *= 2; // Dimension 2 doubles click power
    // Cosmic law active
    if (unlockedCosmicLaws.includes('law_infinity')) {
      const timeFactor = Math.min(5000, 1 + clickCount * 0.05);
      base *= timeFactor;
    }
    // Random Event Active
    if (activeEvent === 'eclipse') {
      base *= 100;
    }
    // Blend bonus multiplier
    if (unlockedBlends.includes('Amarelo Ouro')) base *= 1.25;
    if (unlockedBlends.includes('Magenta Profundo')) base *= 1.5;

    // Spectral Stars impact
    base *= (1 + spectralStars * 0.25) * spectralMultiplier;
    return Math.max(1, base);
  };

  const calculateProductionRate = (): number => {
    if (activeEvent === 'eclipse') return 0; // Eclipse silences offline production but enables insane clicks
    
    let total = 0;
    upgrades.forEach(up => {
      if (up.isUnlocked) {
        let upgradeProd = up.level * up.baseProduction;
        
        // Green photons boost red photons
        if (up.id === 'red' && upgrades[1].level > 0) {
          upgradeProd *= (1 + upgrades[1].level * 1.5);
        }
        // Blue photons boost everything
        if (upgrades[2].level > 0) {
          upgradeProd *= (1 + upgrades[2].level * 0.15);
        }

        total += upgradeProd;
      }
    });

    // Dimensões Espectrais alterations
    if (activeDimension === 1) total *= 1.5; // Dimension 1 focuses on speed/throughput
    if (activeDimension === 3) total *= 2.5; // Dimension 3 grants deep multipliers

    // Prismatic upgrades / prestiges
    total *= (1 + prismaticFragments * 0.1);

    // Blends custom rewards
    if (unlockedBlends.includes('Laranja Brilhante')) total *= 1.25;
    if (unlockedBlends.includes('Verde Turquesa')) total *= 1.4;
    if (unlockedBlends.includes('Roxo Sombrio')) total *= 1.6;

    // Cosmic Laws multipliers
    if (unlockedCosmicLaws.includes('law_infinity')) {
      total *= 2;
    }

    // Active Random Events
    if (activeEvent === 'storm') {
      total *= 6; // +500% (6x)
    }
    if (activeEvent === 'inversion') {
      const unlockedCount = upgrades.filter(u => u.isUnlocked).length;
      total *= (1 + unlockedCount * 0.5);
    }
    if (activeEvent === 'timewarp') {
      total *= 3;
    }

    // Singularities impact
    total *= (1 + colorSingularities * 2);

    return total;
  };

  // --- Real-time Tick Processor (10 ticks per second) ---
  useEffect(() => {
    const tickInterval = setInterval(() => {
      // 1. Process passive points
      const rate = calculateProductionRate();
      const gained = rate / 10;
      if (gained > 0) {
        setColorPoints(prev => prev + gained);
        setTotalColorPointsEver(prev => prev + gained);
      }

      // 2. Automator implementation (Prismatic Shop Tier)
      if (prismaticUpgrades.autoCol.level > 0) {
        // Attempt to auto buy cheapest unlocked upgrade if affordable
        upgrades.forEach(up => {
          if (up.isUnlocked && colorPoints >= up.cost) {
            // Trigger auto purchase safely
            buyUpgrade(up.id, true);
          }
        });
      }

      // 3. Update Random Event Timer
      if (activeEvent) {
        setEventTimeLeft(prev => {
          if (prev <= 0.1) {
            setActiveEvent(null);
            return 0;
          }
          return prev - 0.1;
        });
      }

      // 4. Update Event Spawning Engine
      setEventSpawnTimer(prev => {
        if (prev <= 0.1) {
          // Spawn event bubble on random coordinate
          const x = Math.floor(10 + Math.random() * 80);
          const y = Math.floor(20 + Math.random() * 60);
          setBubblePosition({ x, y });
          setShowEventBubble(true);
          return 45; // seconds until next attempt
        }
        return prev - 0.1;
      });

      // 5. Run Canvas Animation updates
      updateParticles();

      // 6. Unlock milestones or check next color upgrade costs
      checkAchievements();
    }, 100);

    return () => clearInterval(tickInterval);
  }, [colorPoints, upgrades, prismaticUpgrades, activeEvent, unlockedCosmicLaws, unlockedBlends, activeDimension]);

  // --- Particle Spawning System ---
  const spawnClickParticles = (x: number, y: number, color: string) => {
    const count = 15;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.5;
      particles.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        alpha: 1,
        size: 3 + Math.random() * 5,
        life: 0,
        maxLife: 20 + Math.random() * 20
      });
    }
  };

  const updateParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update & Draw
    particles.current = particles.current.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // light gravity
      p.life++;
      p.alpha = 1 - p.life / p.maxLife;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      return p.life < p.maxLife;
    });
  };

  // --- Click Main Prism handler ---
  const handlePrimaryClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const power = calculateClickPower();
    setColorPoints(prev => prev + power);
    setTotalColorPointsEver(prev => prev + power);
    setClickCount(prev => prev + 1);

    // Trigger visual particles
    const currentColor = getCurrentMixColor();
    spawnClickParticles(clickX, clickY, currentColor);

    // Play satisfying notes
    playClickSound();
  };

  // --- Achievements & Unlock Manager ---
  const checkAchievements = () => {
    let changed = false;
    const nextAch = achievements.map(ach => {
      if (ach.unlocked) return ach;
      let shouldUnlock = false;

      if (ach.category === 'clicks' && clickCount >= ach.reqValue) shouldUnlock = true;
      if (ach.category === 'points' && totalColorPointsEver >= ach.reqValue) shouldUnlock = true;
      if (ach.category === 'prestige' && chromaticResets >= ach.reqValue) shouldUnlock = true;
      if (ach.category === 'colors') {
        const primaryCount = upgrades.filter(u => u.level > 0).length;
        if (primaryCount >= ach.reqValue) shouldUnlock = true;
      }

      if (shouldUnlock) {
        changed = true;
        triggerToast(`Conquista Desbloqueada: ${ach.title}!`);
        playSound(880, 'sine');
        return { ...ach, unlocked: true };
      }
      return ach;
    });

    if (changed) {
      setAchievements(nextAch);
    }

    // Dynamic unlock colors based on thresholds
    let unlockChanged = false;
    const nextUpgrades = upgrades.map((up, idx) => {
      if (up.isUnlocked) return up;
      // Unlock subsequent color if previous is level 5+
      const prevUpgrade = upgrades[idx - 1];
      if (prevUpgrade && prevUpgrade.level >= 5) {
        unlockChanged = true;
        triggerToast(`Nova Cor Sincronizada: ${up.name}!`);
        return { ...up, isUnlocked: true };
      }
      return up;
    });

    if (unlockChanged) {
      setUpgrades(nextUpgrades);
    }
  };

  // --- Purchases and Mechanics ---
  const buyUpgrade = (id: string, isAuto = false) => {
    setUpgrades(prev => prev.map(up => {
      if (up.id === id) {
        if (colorPoints >= up.cost) {
          setColorPoints(c => c - up.cost);
          const nextCost = Math.round(up.cost * 1.35);
          if (!isAuto) {
            playUpgradeSound();
          }
          return {
            ...up,
            level: up.level + 1,
            cost: nextCost
          };
        }
      }
      return up;
    }));
  };

  // Buy Prismatic permanent upgrades
  const buyPrismaticUpgrade = (key: keyof typeof prismaticUpgrades) => {
    const up = prismaticUpgrades[key];
    if (prismaticFragments >= up.cost) {
      setPrismaticFragments(p => p - up.cost);
      setPrismaticUpgrades(prev => ({
        ...prev,
        [key]: {
          ...up,
          level: up.level + 1,
          cost: Math.round(up.cost * 1.5)
        }
      }));
      playUpgradeSound();
      triggerToast(`Melhoria ${up.label} adquirida!`);
    }
  };

  // Buy Spectral perks
  const buySpectralPerk = (key: keyof typeof spectralPerks) => {
    const perk = spectralPerks[key];
    if (!perk.active && spectralStars >= perk.cost) {
      setSpectralStars(s => s - perk.cost);
      setSpectralPerks(prev => ({
        ...prev,
        [key]: {
          ...perk,
          active: true
        }
      }));
      playUpgradeSound();
      triggerToast(`Perk Espectral '${perk.label}' Ativado!`);
    }
  };

  // Buy Cosmic Law
  const adoptCosmicLaw = (id: string, cost: number) => {
    if (!unlockedCosmicLaws.includes(id) && colorSingularities >= cost) {
      setColorSingularities(s => s - cost);
      setUnlockedCosmicLaws(prev => [...prev, id]);
      playUpgradeSound();
      triggerToast(`Nova Lei Cósmica Sancionada!`);
    }
  };

  // --- Dynamic Gradient Generator ---
  const getCurrentMixColor = (): string => {
    // Return RGB blend string
    const r = Math.round((mixRed / 100) * 255);
    const g = Math.round((mixGreen / 100) * 255);
    const b = Math.round((mixBlue / 100) * 255);
    return `rgb(${r}, ${g}, ${b})`;
  };

  // --- Laboratório de Mistura (Color blending calculator) ---
  const blendColorLab = () => {
    // Check blend formulas
    const r = mixRed;
    const g = mixGreen;
    const b = mixBlue;

    let blendFound = "";
    if (r > 60 && g > 20 && b < 20) {
      blendFound = "Laranja Brilhante"; // Reward: +25% point prod
    } else if (r < 20 && g > 60 && b > 20) {
      blendFound = "Verde Turquesa"; // Reward: +40% point prod
    } else if (r > 40 && g < 15 && b > 40) {
      blendFound = "Roxo Sombrio"; // Reward: +60% point prod
    } else if (r > 80 && g > 10 && b > 10) {
      blendFound = "Amarelo Ouro"; // Reward: +25% click power
    } else if (r > 40 && g > 40 && b > 40) {
      blendFound = "Branco Prismático"; // Reward: Unlocks maximum chromatic spectrum
    } else {
      blendFound = "Mistura Instável";
    }

    if (blendFound !== "Mistura Instável" && !unlockedBlends.includes(blendFound)) {
      setUnlockedBlends(prev => [...prev, blendFound]);
      playUpgradeSound();
      triggerToast(`Excelente! Você descobriu a essência: ${blendFound}!`);
    } else if (blendFound === "Mistura Instável") {
      triggerToast("A mistura falhou. Ajuste os reguladores prismáticos!");
      playSound(150, 'sawtooth');
    } else {
      triggerToast(`Você já possui a essência de ${blendFound} ativa.`);
    }
  };

  // --- Random Event Bubble Trigger ---
  const triggerRandomEvent = () => {
    setShowEventBubble(false);
    
    // Choose dynamic event
    const events = ['storm', 'eclipse', 'supernova', 'inversion', 'timewarp'];
    const selected = events[Math.floor(Math.random() * events.length)];
    
    // Base duration: 15s. Double if luckyTrigger level > 0
    const baseDuration = 15;
    const finalDuration = baseDuration * (1 + prismaticUpgrades.luckyTrigger.level * 0.5);

    setActiveEvent(selected);
    setEventTimeLeft(finalDuration);

    let soundFreq = 523.25;
    if (selected === 'storm') {
      triggerToast("Uma TEMPESTADE DE CORES começou! Produção aumentada em +500%!");
      soundFreq = 783.99;
    } else if (selected === 'eclipse') {
      triggerToast("ECLIPSE CROMÁTICO detectado! cliques ganham x100 de força temporária!");
      soundFreq = 392.00;
    } else if (selected === 'supernova') {
      // Direct instant points reward
      const rate = calculateProductionRate();
      const instantReward = rate * 600; // 10 minutes of production
      setColorPoints(prev => prev + instantReward);
      setTotalColorPointsEver(prev => prev + instantReward);
      triggerToast(`SUPERNOVA PRISMÁTICA! Você obteve instantaneamente +${formatNumber(instantReward)} Pontos de Cor!`);
      soundFreq = 987.77;
    } else if (selected === 'inversion') {
      triggerToast("INVERSÃO DE ESPECTRO! Geradores desbloqueados amplificam toda a produção!");
      soundFreq = 659.25;
    } else if (selected === 'timewarp') {
      triggerToast("MULTIPLICADOR TEMPORAL! O tempo acelerou em 3x!");
      soundFreq = 880.00;
    }

    playSound(soundFreq, 'sawtooth');
    setTimeout(() => playSound(soundFreq * 1.5, 'sine'), 150);
  };

  // --- Prestige Calculators & Actions ---
  
  // Prestige 1: Reinício Cromático
  const getPrismaticFragmentsGained = (): number => {
    if (colorPoints < 10000) return 0;
    // Math.sqrt scaling
    let raw = Math.floor(Math.sqrt(colorPoints / 10000));
    // Magenta photons or perks
    if (upgrades[5].level > 0) {
      raw = Math.floor(raw * (1 + upgrades[5].level * 0.25));
    }
    return Math.max(1, raw);
  };

  const handleChromaticReset = () => {
    const gained = getPrismaticFragmentsGained();
    if (gained < 1) {
      triggerToast("Você precisa de pelo menos 10.000 Pontos de Cor para um Reinício!");
      return;
    }

    setPrismaticFragments(prev => prev + gained);
    setTotalPrismaticFragments(prev => prev + gained);
    setChromaticResets(prev => prev + 1);
    
    // Reset currencies
    setColorPoints(0);

    // Keep upgrades if perk 'cromagem infinita' is active
    setUpgrades(prev => prev.map(u => {
      if (u.id === 'red' && spectralPerks.prestigeness.active) {
        return u; // do not reset red
      }
      return {
        ...u,
        level: 0,
        cost: u.id === 'red' ? 15 : u.id === 'green' ? 100 : u.id === 'blue' ? 1200 : u.id === 'yellow' ? 15000 : u.id === 'cyan' ? 120000 : 1000000,
        isUnlocked: u.id === 'red' ? true : false
      };
    }));

    playPrestigeSound();
    triggerToast(`Reinício Cromático bem-sucedido! +${gained} Fragmentos Prismáticos.`);
  };

  // Prestige 2: Ascensão Espectral
  const getSpectralStarsGained = (): number => {
    if (prismaticFragments < 500) return 0;
    return Math.floor(prismaticFragments / 500);
  };

  const handleSpectralAscension = () => {
    const gained = getSpectralStarsGained();
    if (gained < 1) {
      triggerToast("Requer pelo menos 500 Fragmentos Prismáticos!");
      return;
    }

    setSpectralStars(prev => prev + gained);
    setSpectralAscensions(prev => prev + 1);

    // Harder reset: resets points, fragments, basic upgrades
    setColorPoints(0);
    setPrismaticFragments(0);
    setUpgrades(prev => prev.map(u => ({
      ...u,
      level: 0,
      cost: u.id === 'red' ? 15 : u.id === 'green' ? 100 : u.id === 'blue' ? 1200 : u.id === 'yellow' ? 15000 : u.id === 'cyan' ? 120000 : 1000000,
      isUnlocked: u.id === 'red' ? true : false
    })));

    // Increment spectral multiplier
    setSpectralMultiplier(prev => prev * 1.5);

    playPrestigeSound();
    triggerToast(`Ascensão Espectral efetuada! +${gained} Estrelas Espectrais.`);
  };

  // Prestige 3: Big Bang Cromático
  const getSingularitiesGained = (): number => {
    if (spectralStars < 10) return 0;
    return Math.floor(spectralStars / 10);
  };

  const handleBigBang = () => {
    const gained = getSingularitiesGained();
    if (gained < 1) {
      triggerToast("Requer 10 ou mais Estrelas Espectrais!");
      return;
    }

    setColorSingularities(prev => prev + gained);
    setBigBangs(prev => prev + 1);

    // Ultimate reset
    setColorPoints(0);
    setPrismaticFragments(0);
    setSpectralStars(0);
    setUpgrades(prev => prev.map(u => ({
      ...u,
      level: 0,
      isUnlocked: u.id === 'red' ? true : false
    })));

    setPrismaticUpgrades({
      clickBoost: { level: 0, cost: 5, label: 'Toque Cintilante', desc: '+150% força do clique por nível.' },
      autoCol: { level: 0, cost: 15, label: 'Automação Cromática', desc: 'Ativa geradores de forma autônoma sem delay.' },
      offlineRate: { level: 0, cost: 10, label: 'Fluxo Temporal', desc: 'Recupere +15% de produção offline por nível.' },
      luckyTrigger: { level: 0, cost: 20, label: 'Anomalia Prismática', desc: 'Dobra a duração de eventos aleatórios.' }
    });

    playPrestigeSound();
    triggerToast(`BIG BANG CROMÁTICO EFETUADO! Universo reconfigurado. +${gained} Singularidades.`);
  };

  // Helper for formatting large numbers nicely
  const formatNumber = (num: number): string => {
    if (num === 0) return '0';
    if (num < 0.1) return num.toFixed(3);
    if (num < 1000) return num.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
    const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'UDc', 'DDc', 'TDc', 'QaD', 'QiD'];
    const exp = Math.floor(Math.log10(num) / 3);
    if (exp < suffixes.length) {
      const formatted = num / Math.pow(10, exp * 3);
      return `${formatted.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${suffixes[exp]}`;
    }
    return num.toExponential(2).replace('e+', 'e');
  };

  // UI styling depending on active event
  const getAppBgClass = (): string => {
    if (activeEvent === 'storm') return 'bg-gradient-to-br from-indigo-950 via-slate-950 to-violet-950';
    if (activeEvent === 'eclipse') return 'bg-gradient-to-br from-black via-slate-950 to-gray-900';
    if (activeEvent === 'timewarp') return 'bg-gradient-to-br from-cyan-950 via-slate-950 to-teal-950';
    return 'bg-[#070913]';
  };

  return (
    <div className={`min-h-screen text-slate-200 transition-all duration-700 ease-in-out relative overflow-hidden pb-12 select-none ${getAppBgClass()}`}>
      
      {/* Dynamic particles background canvas */}
      <canvas 
        ref={canvasRef} 
        width={window.innerWidth} 
        height={window.innerHeight} 
        className="absolute inset-0 pointer-events-none z-10" 
      />

      {/* Floating Header */}
      <header className="relative z-20 border-b border-slate-800/60 bg-slate-950/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-rose-500 via-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-950/50">
              <Sparkles className="h-5 w-5 text-slate-50 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-red-400 via-emerald-400 to-violet-400 bg-clip-text text-transparent">
                SPECTRUM ASCENSION
              </h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Evolução Cromática e Prestígio</p>
            </div>
          </div>

          {/* Core Currencies Dashboard Panel */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <div className="bg-slate-900/65 border border-slate-800/80 rounded-xl px-4 py-2 flex flex-col items-start min-w-[120px]">
              <span className="text-[9px] text-slate-400 uppercase">Fragmentos Prismáticos</span>
              <span className="text-sm font-bold text-violet-400">{formatNumber(prismaticFragments)}</span>
            </div>
            <div className="bg-slate-900/65 border border-slate-800/80 rounded-xl px-4 py-2 flex flex-col items-start min-w-[120px]">
              <span className="text-[9px] text-slate-400 uppercase">Estrelas Espectrais</span>
              <span className="text-sm font-bold text-amber-400">{formatNumber(spectralStars)}</span>
            </div>
            <div className="bg-slate-900/65 border border-slate-800/80 rounded-xl px-4 py-2 flex flex-col items-start min-w-[120px]">
              <span className="text-[9px] text-slate-400 uppercase">Singularidades</span>
              <span className="text-sm font-bold text-cyan-400">{formatNumber(colorSingularities)}</span>
            </div>
          </div>

          {/* System Control Settings */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900/40 border border-slate-800 rounded-lg p-1">
              <button 
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`p-1.5 rounded-md transition-colors ${audioEnabled ? 'bg-indigo-600/35 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                title={audioEnabled ? 'Mutar Som' : 'Ativar Som'}
              >
                {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
              <input 
                type="range" 
                min="0.01" 
                max="0.4" 
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 accent-indigo-500 h-1 rounded-lg"
              />
            </div>
          </div>

        </div>
      </header>

      {/* Floating Random Event Bubble */}
      {showEventBubble && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [1, 1.15, 1], opacity: 1 }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ top: `${bubblePosition.y}%`, left: `${bubblePosition.x}%` }}
          onClick={triggerRandomEvent}
          className="absolute z-50 p-4 rounded-full bg-gradient-to-tr from-pink-500 via-amber-400 to-teal-400 shadow-2xl shadow-pink-500/40 border-2 border-white/80 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform"
        >
          <div className="text-black text-[10px] font-extrabold font-mono flex flex-col items-center">
            <Atom className="h-5 w-5 animate-spin text-black mb-0.5" />
            ANOMALIA
          </div>
        </motion.div>
      )}

      {/* Global Notifications system */}
      <AnimatePresence>
        {lastNotification && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-6 left-6 z-40 bg-[#0c1023] border-l-4 border-indigo-500 text-slate-100 px-5 py-4 rounded-r-xl shadow-2xl shadow-black/80 max-w-sm flex items-start gap-3"
          >
            <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs leading-relaxed font-medium">{lastNotification}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Workspace Sections */}
      <main className="max-w-7xl mx-auto px-6 py-8 relative z-20">

        {/* Dynamic Alerts if Event Is Running */}
        <AnimatePresence>
          {activeEvent && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-indigo-950/45 border border-indigo-800/45 text-indigo-200 px-6 py-3.5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Flame className="h-5 w-5 text-rose-400 animate-bounce" />
                  <span className="text-xs font-mono">
                    EVENTO ATIVO: <strong className="uppercase text-white tracking-wider">{activeEvent === 'storm' ? 'Tempestade Cromática' : activeEvent === 'eclipse' ? 'Eclipse Cromático' : activeEvent === 'supernova' ? 'Supernova' : activeEvent === 'inversion' ? 'Inversão Cromática' : 'Multiplicador Temporal'}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span>Tempo Restante:</span>
                  <span className="bg-indigo-900/60 px-2.5 py-1 rounded text-white font-bold">{eventTimeLeft.toFixed(1)}s</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Primary Navigation Tabs */}
        <div className="flex border-b border-slate-800/40 gap-1.5 overflow-x-auto pb-px mb-8 bg-slate-900/20 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('core')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all shrink-0 ${
              activeTab === 'core'
                ? 'bg-gradient-to-tr from-indigo-900 to-violet-800 text-white shadow-md shadow-violet-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <Activity className="h-4 w-4" />
            Prisma Central
          </button>
          <button
            onClick={() => setActiveTab('upgrades')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all shrink-0 ${
              activeTab === 'upgrades'
                ? 'bg-gradient-to-tr from-indigo-900 to-violet-800 text-white shadow-md shadow-violet-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <Layers className="h-4 w-4" />
            Cores & Automação
          </button>
          <button
            onClick={() => setActiveTab('blender')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all shrink-0 ${
              activeTab === 'blender'
                ? 'bg-gradient-to-tr from-indigo-900 to-violet-800 text-white shadow-md shadow-violet-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <Palette className="h-4 w-4" />
            Mistura de Cores
          </button>
          <button
            onClick={() => setActiveTab('prestige')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all shrink-0 ${
              activeTab === 'prestige'
                ? 'bg-gradient-to-tr from-indigo-900 to-violet-800 text-white shadow-md shadow-violet-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <Star className="h-4 w-4" />
            Ascensões & Prestígio
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all shrink-0 ${
              activeTab === 'stats'
                ? 'bg-gradient-to-tr from-indigo-900 to-violet-800 text-white shadow-md shadow-violet-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <Award className="h-4 w-4" />
            Conquistas & Stats
          </button>
        </div>

        {/* Tab 1: Central clicker (PRISMA CENTRAL) */}
        {activeTab === 'core' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Display points information */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900/30 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-sm">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono block mb-1">Carga Cromática</span>
                <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-mono break-all">
                  {formatNumber(colorPoints)}
                </h2>
                <p className="text-xs text-slate-400 mt-2 font-mono">Pontos de Cor acumulados</p>
                
                <div className="mt-6 pt-6 border-t border-slate-800/60 space-y-4 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Produção Passiva:</span>
                    <span className="text-white font-bold">{formatNumber(calculateProductionRate())}/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Força do Clique:</span>
                    <span className="text-white font-bold">+{formatNumber(calculateClickPower())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cliques Totais:</span>
                    <span className="text-indigo-300 font-bold">{clickCount}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic event details help card */}
              <div className="bg-slate-900/20 border border-slate-800/50 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-bold font-mono">
                  <Info className="h-4 w-4" /> Dicas Rápidas
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Gere pontos clicando no prisma. Desbloqueie geradores na aba <strong>Cores</strong> para automatizar a geração. Eventos anômalos aparecem aleatoriamente no espaço, não deixe de tocá-los!
                </p>
              </div>
            </div>

            {/* Click Stage */}
            <div className="lg:col-span-8 flex flex-col items-center justify-center py-10 relative">
              
              {/* Outer light aura */}
              <div 
                style={{ backgroundColor: getCurrentMixColor() }} 
                className="absolute w-80 h-80 rounded-full opacity-10 blur-3xl animate-pulse pointer-events-none" 
              />

              {/* Glowing ring */}
              <div className="absolute w-72 h-72 rounded-full border border-dashed border-indigo-500/20 animate-spin pointer-events-none" />

              {/* Central Clicker Cube */}
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95, rotate: -5 }}
                onClick={handlePrimaryClick}
                className="w-56 h-56 rounded-xl flex items-center justify-center cursor-pointer shadow-2xl relative z-20 group border-4 border-slate-100/90"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  boxShadow: `0 0 50px ${getCurrentMixColor()}90, inset 0 0 15px rgba(255, 255, 255, 0.8)`
                }}
              >
                <div className="absolute inset-0 rounded-lg bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[11px] uppercase tracking-widest text-slate-900 font-mono font-bold bg-white/90 px-3 py-1.5 rounded-lg shadow-sm border border-slate-150 backdrop-blur-md">
                    REFRATAR
                  </span>
                </div>
              </motion.div>

              <span className="text-xs text-slate-500 mt-6 font-mono tracking-wider">Clique no prisma para liberar fótons</span>
            </div>

          </div>
        )}

        {/* Tab 2: CORES & AUTOMAÇÃO */}
        {activeTab === 'upgrades' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 font-mono">
                  <Layers className="h-5 w-5 text-indigo-400" /> Geradores Visíveis
                </h3>
                <p className="text-xs text-slate-400 mt-1">Multiplique fótons comprando e sincronizando novos canais de cores.</p>
              </div>

              {/* Quick info if automation is active */}
              {prismaticUpgrades.autoCol.level > 0 && (
                <div className="bg-emerald-950/30 border border-emerald-900/40 rounded-xl px-4 py-2 text-xs font-mono text-emerald-400">
                  Automação Prismática: Ativa ({prismaticUpgrades.autoCol.level})
                </div>
              )}
            </div>

            {/* List of custom upgrades */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upgrades.map((up) => {
                if (!up.isUnlocked) {
                  return (
                    <div 
                      key={up.id}
                      className="bg-slate-900/10 border border-dashed border-slate-800/80 rounded-2xl p-6 flex flex-col justify-center items-center text-center space-y-3 min-h-[180px]"
                    >
                      <Layers className="h-8 w-8 text-slate-700 animate-pulse" />
                      <div className="text-slate-500 font-mono text-xs">
                        Bloqueado
                        <p className="text-[10px] text-slate-600 mt-1">Gere nível 5 no fóton anterior para sintetizar esta cor.</p>
                      </div>
                    </div>
                  );
                }

                const canAfford = colorPoints >= up.cost;

                return (
                  <div 
                    key={up.id}
                    className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm transition-all hover:border-slate-750 flex flex-col justify-between"
                  >
                    <div>
                      {/* Color Header Indicator */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-3.5 h-3.5 rounded-full inline-block" 
                            style={{ backgroundColor: up.color, boxShadow: `0 0 10px ${up.color}` }} 
                          />
                          <h4 className="text-sm font-extrabold font-mono text-white">{up.name}</h4>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">Nível {up.level}</span>
                      </div>

                      <p className="text-xs text-slate-400 mt-3.5 leading-relaxed">{up.description}</p>
                      
                      <div className="mt-4 pt-4 border-t border-slate-800/40 space-y-1.5 font-mono text-xs">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Produção Base:</span>
                          <span className="text-slate-200">+{up.baseProduction}/s</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Produção Total:</span>
                          <span className="text-white font-bold">+{formatNumber(up.level * up.baseProduction)}/s</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5">
                      <button
                        onClick={() => buyUpgrade(up.id)}
                        disabled={!canAfford}
                        className={`w-full font-mono text-xs py-3.5 px-4 rounded-xl font-bold uppercase transition-all flex justify-between items-center cursor-pointer ${
                          canAfford 
                            ? 'bg-slate-800 hover:bg-slate-750 text-white' 
                            : 'bg-slate-950 text-slate-600 border border-slate-900'
                        }`}
                      >
                        <span>Comprar</span>
                        <span>{formatNumber(up.cost)} Pts</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: MISTURA DE CORES (Lab) */}
        {activeTab === 'blender' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Color Blending stage */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
                <h3 className="text-md font-bold font-mono text-white flex items-center gap-2 mb-4">
                  <Palette className="h-5 w-5 text-indigo-400" /> Regulador Espectral
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Ajuste a intensidade de emissão dos três feixes fundamentais de luz. Quando encontrar um equilíbrio perfeito, sintetize a essência para liberar buffs permanentes no jogo!
                </p>

                {/* Mixing Sliders */}
                <div className="space-y-5 font-mono text-xs">
                  <div>
                    <div className="flex justify-between mb-1.5 text-red-400 font-bold">
                      <span>VERMELHO</span>
                      <span>{mixRed}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={mixRed} 
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setMixRed(val);
                      }}
                      className="w-full accent-red-500 h-1.5 rounded-lg bg-slate-950"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1.5 text-emerald-400 font-bold">
                      <span>VERDE</span>
                      <span>{mixGreen}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={mixGreen} 
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setMixGreen(val);
                      }}
                      className="w-full accent-emerald-500 h-1.5 rounded-lg bg-slate-950"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1.5 text-blue-400 font-bold">
                      <span>AZUL</span>
                      <span>{mixBlue}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={mixBlue} 
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setMixBlue(val);
                      }}
                      className="w-full accent-blue-500 h-1.5 rounded-lg bg-slate-950"
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={blendColorLab}
                    className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-mono text-xs font-bold py-3.5 rounded-xl uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Palette className="h-4 w-4" /> Fundir Essência
                  </button>
                </div>

              </div>
            </div>

            {/* Right Side: Unlocked blends & rewards list */}
            <div className="lg:col-span-7 space-y-6">
              <h3 className="text-md font-bold font-mono text-white flex items-center gap-2">
                <Palette className="h-5 w-5 text-indigo-400" /> Essências Sintetizadas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Gold blend */}
                <div className={`bg-slate-900/40 border rounded-2xl p-4.5 flex flex-col justify-between ${unlockedBlends.includes('Amarelo Ouro') ? 'border-amber-500/50' : 'border-slate-800/80 opacity-40'}`}>
                  <div>
                    <span className="text-[9px] font-bold font-mono tracking-widest uppercase block text-amber-400">Essência de Ouro</span>
                    <h4 className="text-sm font-bold text-slate-100 mt-1">Amarelo Ouro</h4>
                    <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
                      Buff: +25% de força de toque permanente de forma integrada.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-amber-500 mt-4 block">Requisito: Vermelho Max, Verde Alto, Azul Mínimo</span>
                </div>

                {/* Orange blend */}
                <div className={`bg-slate-900/40 border rounded-2xl p-4.5 flex flex-col justify-between ${unlockedBlends.includes('Laranja Brilhante') ? 'border-orange-500/50' : 'border-slate-800/80 opacity-40'}`}>
                  <div>
                    <span className="text-[9px] font-bold font-mono tracking-widest uppercase block text-orange-400">Luz Solar</span>
                    <h4 className="text-sm font-bold text-slate-100 mt-1">Laranja Brilhante</h4>
                    <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
                      Buff: +25% de produção passiva em todas as dimensões de cor.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-orange-500 mt-4 block">Requisito: Vermelho Elevado, Verde Médio</span>
                </div>

                {/* Turquoise blend */}
                <div className={`bg-slate-900/40 border rounded-2xl p-4.5 flex flex-col justify-between ${unlockedBlends.includes('Verde Turquesa') ? 'border-teal-500/50' : 'border-slate-800/80 opacity-40'}`}>
                  <div>
                    <span className="text-[9px] font-bold font-mono tracking-widest uppercase block text-teal-400">Espectro Abissal</span>
                    <h4 className="text-sm font-bold text-slate-100 mt-1">Verde Turquesa</h4>
                    <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
                      Buff: +40% de velocidade de produção passiva geral.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-teal-500 mt-4 block">Requisito: Verde Máximo, Azul Médio</span>
                </div>

                {/* Purple blend */}
                <div className={`bg-slate-900/40 border rounded-2xl p-4.5 flex flex-col justify-between ${unlockedBlends.includes('Roxo Sombrio') ? 'border-purple-500/50' : 'border-slate-800/80 opacity-40'}`}>
                  <div>
                    <span className="text-[9px] font-bold font-mono tracking-widest uppercase block text-purple-400">Espectro Violeta</span>
                    <h4 className="text-sm font-bold text-slate-100 mt-1">Roxo Sombrio</h4>
                    <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
                      Buff: +60% de ganho de Fragmentos Prismáticos em prestígio.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-purple-500 mt-4 block">Requisito: Vermelho e Azul equilibrados</span>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* Tab 4: PRESTÍGIO */}
        {activeTab === 'prestige' && (
          <div className="space-y-12">
            
            {/* Prestiges Rows */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Prestige 1: Reinício Cromático */}
              <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />
                
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-violet-950/40 border border-violet-800/40 text-violet-300 font-mono font-bold px-3 py-1 rounded-full uppercase">Prestigio 1</span>
                  </div>

                  <h3 className="text-lg font-extrabold text-white font-mono mt-4">Reinício Cromático</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Disperse as frequências acumuladas. Reseta seus pontos de cor e geradores básicos para catalisar <strong>Fragmentos Prismáticos</strong> permanentes.
                  </p>

                  <div className="bg-slate-950/50 rounded-2xl p-4 mt-6 text-xs font-mono space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Exigido:</span>
                      <span className="text-slate-200">10.000 Pontos</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Recompensa:</span>
                      <span className="text-violet-400 font-bold">+{getPrismaticFragmentsGained()} Fragmentos</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleChromaticReset}
                  className="w-full bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs font-bold py-3.5 rounded-xl uppercase tracking-wider mt-6 transition-all cursor-pointer"
                >
                  Acionar Reinício
                </button>
              </div>

              {/* Prestige 2: Ascensão Espectral */}
              <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-600/10 rounded-full blur-2xl pointer-events-none" />
                
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-amber-950/40 border border-amber-800/40 text-amber-300 font-mono font-bold px-3 py-1 rounded-full uppercase">Prestigio 2</span>
                  </div>

                  <h3 className="text-lg font-extrabold text-white font-mono mt-4">Ascensão Espectral</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Ascenda o nível dimensional da luz. Abre portais para as novas <strong>Dimensões de Cor</strong> e gera <strong>Estrelas Espectrais</strong> fundamentais.
                  </p>

                  <div className="bg-slate-950/50 rounded-2xl p-4 mt-6 text-xs font-mono space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Exigido:</span>
                      <span className="text-slate-200">500 Fragmentos</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Recompensa:</span>
                      <span className="text-amber-400 font-bold">+{getSpectralStarsGained()} Estrelas</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSpectralAscension}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold py-3.5 rounded-xl uppercase tracking-wider mt-6 transition-all cursor-pointer"
                >
                  Acionar Ascensão
                </button>
              </div>

              {/* Prestige 3: Big Bang Cromático */}
              <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-600/10 rounded-full blur-2xl pointer-events-none" />
                
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 font-mono font-bold px-3 py-1 rounded-full uppercase">Prestigio 3</span>
                  </div>

                  <h3 className="text-lg font-extrabold text-white font-mono mt-4">Big Bang Cromático</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Invoque o recomeço cósmico supremo. Restaura todo o progresso passado para sintonizar a realidade de <strong>Singularidades de Cor</strong> e estabelecer leis.
                  </p>

                  <div className="bg-slate-950/50 rounded-2xl p-4 mt-6 text-xs font-mono space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Exigido:</span>
                      <span className="text-slate-200">10 Estrelas</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Recompensa:</span>
                      <span className="text-cyan-400 font-bold">+{getSingularitiesGained()} Singularidade</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleBigBang}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold py-3.5 rounded-xl uppercase tracking-wider mt-6 transition-all cursor-pointer"
                >
                  Sintonizar Big Bang
                </button>
              </div>

            </div>

            {/* Prestige shops & Unlocked upgrades details */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Prismatic Shop Column (Prestige 1 Shop) */}
              <div className="lg:col-span-6 space-y-5">
                <h4 className="text-sm font-extrabold font-mono text-violet-300 uppercase tracking-wider">
                  Loja Prismática (Fragmentos: {formatNumber(prismaticFragments)})
                </h4>

                <div className="space-y-4">
                  {Object.entries(prismaticUpgrades).map(([key, up]) => {
                    const typedKey = key as keyof typeof prismaticUpgrades;
                    const item = up as { level: number; cost: number; label: string; desc: string };
                    const canAfford = prismaticFragments >= item.cost;
                    return (
                      <div key={key} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4.5 flex justify-between items-center gap-4">
                        <div>
                          <h5 className="text-xs font-extrabold text-white font-mono">{item.label} (Nível {item.level})</h5>
                          <p className="text-[10px] text-slate-400 mt-1">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => buyPrismaticUpgrade(typedKey)}
                          disabled={!canAfford}
                          className={`font-mono text-[10px] font-bold uppercase py-2 px-3.5 rounded-lg shrink-0 transition-all cursor-pointer ${
                            canAfford 
                              ? 'bg-violet-600/25 border border-violet-500/45 text-violet-300 hover:bg-violet-600/40' 
                              : 'bg-slate-950 border border-slate-900 text-slate-600'
                          }`}
                        >
                          {item.cost} Frag
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Spectral Shop Column (Prestige 2 Shop) */}
              <div className="lg:col-span-6 space-y-5">
                <h4 className="text-sm font-extrabold font-mono text-amber-300 uppercase tracking-wider">
                  Leis Cósmicas (Singularidades: {formatNumber(colorSingularities)})
                </h4>

                <div className="space-y-4">
                  {cosmicLawsList.map((law) => {
                    const isPurchased = unlockedCosmicLaws.includes(law.id);
                    const canAfford = colorSingularities >= law.cost;
                    return (
                      <div key={law.id} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4.5 flex justify-between items-center gap-4">
                        <div>
                          <h5 className="text-xs font-extrabold text-white font-mono flex items-center gap-1.5">
                            {law.label} {isPurchased && <span className="text-[8px] bg-emerald-950 border border-emerald-800 text-emerald-400 px-1.5 rounded-full uppercase">Sancionada</span>}
                          </h5>
                          <p className="text-[10px] text-slate-400 mt-1">{law.desc}</p>
                        </div>
                        {!isPurchased && (
                          <button
                            onClick={() => adoptCosmicLaw(law.id, law.cost)}
                            disabled={!canAfford}
                            className={`font-mono text-[10px] font-bold uppercase py-2 px-3.5 rounded-lg shrink-0 transition-all cursor-pointer ${
                              canAfford 
                                ? 'bg-cyan-600/25 border border-cyan-500/45 text-cyan-300 hover:bg-cyan-600/40' 
                                : 'bg-slate-950 border border-slate-900 text-slate-600'
                            }`}
                          >
                            {law.cost} Sing
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Tab 5: ESTATÍSTICAS E CONQUISTAS */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* General Stats summary */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
                <h3 className="text-md font-bold font-mono text-white flex items-center gap-2 mb-4">
                  <Activity className="h-4.5 w-4.5 text-indigo-400" /> Registro de Atividade
                </h3>

                <div className="space-y-4 font-mono text-xs">
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Acumulado Histórico:</span>
                    <span className="text-white font-bold">{formatNumber(totalColorPointsEver)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Cliques Totais:</span>
                    <span className="text-white font-bold">{clickCount}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Reinícios Cromáticos:</span>
                    <span className="text-white font-bold">{chromaticResets}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Ascensões Espectrais:</span>
                    <span className="text-white font-bold">{spectralAscensions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Big Bangs Cromáticos:</span>
                    <span className="text-white font-bold">{bigBangs}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* List of custom achievements */}
            <div className="lg:col-span-8 space-y-6">
              <h3 className="text-md font-bold font-mono text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-indigo-400" /> Medalhas de Ascensão
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((ach) => (
                  <div 
                    key={ach.id} 
                    className={`bg-slate-900/40 border rounded-2xl p-4.5 flex items-start gap-3 transition-all ${
                      ach.unlocked 
                        ? 'border-emerald-500/40 bg-emerald-950/5' 
                        : 'border-slate-800/80 opacity-50'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${ach.unlocked ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-950 text-slate-700'}`}>
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold font-mono text-white">{ach.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-1">{ach.desc}</p>
                      {ach.unlocked ? (
                        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded mt-2.5 inline-block">Conquistado</span>
                      ) : (
                        <span className="text-[9px] font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded mt-2.5 inline-block">Bloqueado</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
