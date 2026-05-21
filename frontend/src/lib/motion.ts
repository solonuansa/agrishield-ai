// ============================================================
// AgriShield AI — Motion Design Tokens
// Centralized framer-motion variants for consistent animation
// ============================================================

import type { Variants, Transition } from "framer-motion";

// ---- Easing Curves ----
// Natural deceleration — matches real-world physics
export const easing = {
  gentle: [0.16, 1, 0.3, 1] as [number, number, number, number],
  smooth: [0.19, 1, 0.22, 1] as [number, number, number, number],
  snappy: [0.22, 1, 0.36, 1] as [number, number, number, number],
  bounce: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
} as const;

// ---- Durations ----
export const duration = {
  fast: 0.18,
  normal: 0.35,
  slow: 0.55,
  reveal: 0.65,
} as const;

// ---- Default transition presets ----
export const transition = {
  gentle: { duration: duration.normal, ease: easing.gentle } as Transition,
  smooth: { duration: duration.slow, ease: easing.smooth } as Transition,
  snappy: { duration: duration.fast, ease: easing.snappy } as Transition,
  spring: { type: "spring", stiffness: 200, damping: 22 } as Transition,
} as const;

// ============================================================
// Entrance Variants
// ============================================================

/** Fade up + slide — primary entrance for sections and cards */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.reveal, ease: easing.gentle },
  },
};

/** Fade in only — for text, icons, badges */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.normal, ease: easing.smooth },
  },
};

/** Scale up from smaller — for modals, dialogs, cards appearing */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: duration.normal, ease: easing.bounce },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: duration.fast, ease: easing.smooth },
  },
};

/** Slide from right — for side panels, drawers */
export const slideLeft: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: duration.normal, ease: easing.gentle },
  },
};

/** Slide from bottom — for bottom sheets, toasts */
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.fast, ease: easing.gentle },
  },
  exit: {
    opacity: 0,
    y: 12,
    transition: { duration: duration.fast, ease: easing.smooth },
  },
};

// ============================================================
// Exit Variants
// ============================================================

export const fadeOut: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: {
    opacity: 0,
    transition: { duration: duration.fast, ease: easing.smooth },
  },
};

export const scaleOut: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1 },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: duration.fast, ease: easing.smooth },
  },
};

// ============================================================
// Container Variants (for stagger children)
// ============================================================

/** Stagger children with 60ms delay between each */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

/** Stagger children with 100ms delay — for larger card grids */
export const staggerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.12,
    },
  },
};

/** Stagger from left, each child slides in */
export const staggerFadeUp: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.08,
    },
  },
};

// ============================================================
// Child variants for use inside stagger containers
// ============================================================

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.normal, ease: easing.gentle },
  },
};

export const staggerItemScale: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: duration.normal, ease: easing.gentle },
  },
};

// ============================================================
// Interaction Micro-variants
// ============================================================

/** Subtle lift on hover — use with whileHover */
export const hoverLift = { y: -2, transition: transition.snappy };

/** Subtle grow on hover — use with whileHover */
export const hoverGrow = { scale: 1.02, transition: transition.snappy };

/** Press sink — use with whileTap */
export const tapSink = { scale: 0.97 };

// ============================================================
// Special-purpose variants
// ============================================================

/** Counter animation — for stat numbers */
export const countUp = (target: number, delay = 0) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delay, duration: duration.slow },
  },
});

/** Draw SVG path — for chart line animations */
export const drawPath: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.8, ease: easing.gentle },
  },
};

/** Confetti-scale success animation */
export const successPop: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: [0, 1.15, 1],
    opacity: 1,
    transition: { duration: 0.5, times: [0, 0.7, 1], ease: easing.bounce },
  },
};
