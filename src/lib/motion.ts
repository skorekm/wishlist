// Animation variants for Framer Motion
export const fadeIn = (direction: "up" | "down" | "left" | "right" = "up", delay = 0) => {
  return {
    hidden: {
      x: direction === "left" ? 40 : direction === "right" ? -40 : 0,
      y: direction === "up" ? 40 : direction === "down" ? -40 : 0,
      opacity: 0,
    },
    show: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: 0.5,
        delay,
      },
    },
  }
}

export const stagger = {
  hidden: {
    scale: 0.8,
    opacity: 0,
  },
  show: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      staggerChildren: 0.1,
    }
  }
}

export const listItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
}

export const cardHover = {
  rest: { scale: 1, transition: { type: "spring", stiffness: 400, damping: 10 } },
  hover: { scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 10 } },
}