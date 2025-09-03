"use client"

import { useState, useEffect } from "react"

type Theme = "light" | "dark"

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Verificar si hay un tema guardado en localStorage
    const savedTheme = localStorage.getItem("theme") as Theme
    if (savedTheme) {
      return savedTheme
    }

    // Si no hay tema guardado, usar la preferencia del sistema
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark"
    }

    return "light"
  })

  useEffect(() => {
    const root = window.document.documentElement

    // Remover clases anteriores
    root.classList.remove("light", "dark")

    // Agregar la clase del tema actual
    root.classList.add(theme)

    // Guardar en localStorage
    localStorage.setItem("theme", theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
  }

  return {
    theme,
    toggleTheme,
    isDark: theme === "dark",
  }
}
