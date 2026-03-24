import { Transition } from 'framer-motion';

export const ANIMATION_CONFIG = {
  durations: {
    instant: 150,
    fast: 250,
    normal: 350,
    slow: 500,
    page: 600,
  },
  easings: {
    crisp: [0.25, 0.1, 0.25, 1],
    smooth: [0.4, 0, 0, 1],
    bounce: [0.68, -0.55, 0.265, 1.55],
  },
  spring: {
    gentle: [200, 25],
    bouncy: [300, 30],
    stiff: [400, 30],
  },
};

// Staggered list variants
export const staggeredListVariants: any = {
  container: {
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.04,
        staggerDirection: 1,
      } as Transition,
    },
  },
  item: {
    initial: { opacity: 0, x: -20, scale: 0.95 },
    animate: { opacity: 1, x: 0, scale: 1 },
  },
};

// Scale on hover variants
export const scaleOnHoverVariants: any = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

// Modal variants
export const modalVariants: any = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
};
