/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'

export const useNextCigaretteTimer = ({ lastCigaretteAt, dailyGoal }) => {
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 })
  const [isReady, setIsReady] = useState(true)

  useEffect(() => {
    // Si pas de dernière cigarette ou objectif invalide, on est prêt
    if (!lastCigaretteAt || dailyGoal <= 0) {
      setIsReady(true)
      return
    }

    // --- CONFIGURATION DU RYTHME ---
    // On considère une journée active de 16h (ex: 08h00 -> 00h00)
    // 16 heures * 60 minutes = 960 minutes disponibles
    const AWAKE_HOURS = 16
    const totalAwakeMinutes = AWAKE_HOURS * 60

    // Intervalle idéal en minutes entre chaque cigarette
    const intervalMinutes = totalAwakeMinutes / dailyGoal

    // Convertir l'intervalle en millisecondes pour le calcul
    const intervalMs = intervalMinutes * 60 * 1000

    const calculate = () => {
      const now = new Date().getTime()
      // On s'assure que lastCigaretteAt est bien converti en Date
      const lastTime = new Date(lastCigaretteAt).getTime()

      // La prochaine cigarette est autorisée à : Dernière + Intervalle
      const nextAllowedTime = lastTime + intervalMs
      const diff = nextAllowedTime - now

      if (diff <= 0) {
        // Le temps est écoulé, on peut fumer
        setIsReady(true)
        setTimeLeft({ minutes: 0, seconds: 0 })
      } else {
        // Il faut encore attendre
        setIsReady(false)
        // Calcul des minutes et secondes restantes
        const totalMinutes = Math.floor(diff / 1000 / 60)
        const s = Math.floor((diff / 1000) % 60)

        setTimeLeft({ minutes: totalMinutes, seconds: s })
      }
    }

    // Lancer le calcul immédiatement au chargement
    calculate()

    // Mettre à jour chaque seconde
    const timerId = setInterval(calculate, 1000)

    // Nettoyage quand le composant est démonté
    return () => clearInterval(timerId)
  }, [lastCigaretteAt, dailyGoal])

  return { ...timeLeft, isReady }
}
