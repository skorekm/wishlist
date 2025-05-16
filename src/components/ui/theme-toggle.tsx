// Example: src/components/ThemeToggle.tsx
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button' // Assuming you have a Button component
import { AnimatePresence, motion } from 'motion/react'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { setTheme, resolvedTheme } = useTheme()

  // useEffect only runs on the client, so now we can show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Avoid rendering mismatch during hydration,
    // you can return a placeholder or null
    return <Button variant="outline" size="icon" disabled><Sun className="h-[1.2rem] w-[1.2rem]" /></Button>;
  }

  const toggleTheme = () => {
    // If the current theme is light (or system resolves to light), switch to dark.
    // If the current theme is dark (or system resolves to dark), switch to light.
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="dark"
            initial={{ x: 15, y: 15, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            exit={{ x: -15, y: -15, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          </motion.div>
        ) : (
          <motion.div
            key="light"
            initial={{ x: -15, y: -15, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            exit={{ x: 15, y: 15, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          </motion.div>
        )}
      </AnimatePresence>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}