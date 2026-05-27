'use client'

import { useEffect, useState, useCallback } from 'react'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'onboarding_seen'

export default function OnboardingModal() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // avoid hydration / SSR mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    try {
      const seen = localStorage.getItem(STORAGE_KEY)
      if (!seen) setOpen(true)
    } catch (e) {
      setOpen(true)
    }
  }, [mounted])

  const finishOnboarding = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch (e) {}

    setOpen(false)
  }, [])

  if (!mounted) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md overflow-hidden rounded-3xl border-0 p-0">

        {/* Content */}
        <div className="space-y-4 p-6 text-center">

          <h2 className="text-2xl font-bold">
            Dobrodošli u komšiluk
          </h2>

          <p className="text-muted-foreground">
            Povežite se sa stanarima, pratite obaveštenja
            i prijavite probleme zgrade na jednom mestu.
          </p>

          <div className="flex gap-3 pt-2">

            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={finishOnboarding}
            >
              Preskoči
            </Button>

            <Button
              className="flex-1 rounded-xl"
              onClick={finishOnboarding}
            >
              Započni
            </Button>

          </div>

        </div>

      </DialogContent>
    </Dialog>
  )
}
