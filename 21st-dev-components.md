# 21st.dev Component Reference

Curated picks for 9 UI categories. All install via `npx shadcn@latest add "https://21st.dev/r/<author>/<slug>"`.

---

## 1. Sticky Navbar

**Pick:** Tubelight Navbar — `ayushmxxn/tubelight-navbar`
Floating pill navbar (top on desktop, bottom on mobile) with a glowing tubelight bloom effect on the active tab. Spring-animated layout transition.

**Preview:** https://21st.dev/ayushmxxn/tubelight-navbar

```bash
npx shadcn@latest add "https://21st.dev/r/ayushmxxn/tubelight-navbar"
```

**Dependencies:** `framer-motion`, `lucide-react`

```tsx
// components/ui/navbar.tsx
"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function NavBar({ items, className }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0].name)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div
      className={cn(
        "fixed bottom-0 sm:top-0 left-1/2 -translate-x-1/2 z-[200] mb-6 sm:pt-6 h-max",
        className,
      )}
    >
      <div className="flex items-center gap-3 bg-background/5 border border-border backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
                "text-foreground/80 hover:text-primary",
                isActive && "bg-muted text-primary",
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                    <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
```

**Usage:**
```tsx
import { Home, BarChart2, Settings, Users } from "lucide-react"
import { NavBar } from "@/components/ui/navbar"

const navItems = [
  { name: "Dashboard", url: "/", icon: Home },
  { name: "Analytics", url: "/analytics", icon: BarChart2 },
  { name: "Team", url: "/team", icon: Users },
  { name: "Settings", url: "/settings", icon: Settings },
]

export default function Layout() {
  return (
    <>
      <NavBar items={navItems} />
      {/* page content */}
    </>
  )
}
```

---

## 2. Tooltip

**Pick:** Animated Tooltip — `aceternity/animated-tooltip`
Spring-animated tooltip that rotates and translates on hover, designed for avatar groups. Follows mouse cursor with parallax feel.

**Preview:** https://21st.dev/aceternity/animated-tooltip

```bash
npx shadcn@latest add "https://21st.dev/r/aceternity/animated-tooltip"
```

**Dependencies:** `framer-motion`

**Usage:**
```tsx
import { AnimatedTooltip } from "@/components/ui/animated-tooltip"

const people = [
  { id: 1, name: "John Doe", designation: "Lead Auditor", image: "/avatars/john.jpg" },
  { id: 2, name: "Sara Kim", designation: "BSA Analyst", image: "/avatars/sara.jpg" },
  { id: 3, name: "Alex Ray", designation: "MRM Validator", image: "/avatars/alex.jpg" },
]

export function TeamAvatars() {
  return (
    <div className="flex flex-row items-center justify-center">
      <AnimatedTooltip items={people} />
    </div>
  )
}
```

> **Alternative for plain tooltip:** `jolbol1/tooltip` (react-aria-components based, fully accessible)
> ```bash
> npx shadcn@latest add "https://21st.dev/r/jolbol1/tooltip"
> ```

---

## 3. Callout / Info Block

**Pick:** Alert — `shadcn/alert`
Clean bordered callout with icon, title, and description. Standard variant covers info, warning, destructive. Composable with any icon from lucide-react.

**Preview:** https://21st.dev/shadcn/alert

```bash
npx shadcn@latest add "https://21st.dev/r/shadcn/alert"
```

**Dependencies:** none beyond shadcn base

**Usage:**
```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, AlertTriangle, CheckCircle2 } from "lucide-react"

// Info callout
export function InfoCallout() {
  return (
    <Alert>
      <InfoIcon className="h-4 w-4" />
      <AlertTitle>Model Validation Note</AlertTitle>
      <AlertDescription>
        SR 11-7 requires annual periodic review for all tier-1 models. Ensure
        monitoring reports are submitted to the MRM committee by Q3.
      </AlertDescription>
    </Alert>
  )
}

// Warning callout
export function WarningCallout() {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>MRA Response Required</AlertTitle>
      <AlertDescription>
        Examination finding #2024-03 requires written response within 90 days.
      </AlertDescription>
    </Alert>
  )
}
```

---

## 4. Dismissible Banner

**Pick:** Dismissible Banner — `aceternity/sticky-banner`
Full-width top-of-page announcement banner with dismiss/close functionality and smooth animate-out. Supports icons and CTAs.

**Preview:** https://21st.dev/aceternity/sticky-banner

```bash
npx shadcn@latest add "https://21st.dev/r/aceternity/sticky-banner"
```

**Dependencies:** `framer-motion`

**Usage:**
```tsx
import { StickyBanner } from "@/components/ui/sticky-banner"
import { useState } from "react"

export function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <StickyBanner onDismiss={() => setDismissed(true)}>
      <span className="text-sm font-medium">
        New: AI-assisted model documentation now available in the intake portal.{" "}
        <a href="/docs" className="underline underline-offset-2">
          Learn more →
        </a>
      </span>
    </StickyBanner>
  )
}
```

> **Alternative (simpler, no animation):** Build inline with shadcn `Alert` + close button if you don't need a sticky full-width bar.

---

## 5. Empty State

**Pick:** Empty State — `serafimcloud/empty-state`
Polished empty state with icon, heading, description, and optional CTA button. Clean minimal design, dark-mode ready.

**Preview:** https://21st.dev/serafimcloud/empty-state

```bash
npx shadcn@latest add "https://21st.dev/r/serafimcloud/empty-state"
```

**Dependencies:** `lucide-react`

**Usage:**
```tsx
import { EmptyState } from "@/components/ui/empty-state"
import { FileSearch } from "lucide-react"

export function NoResultsState() {
  return (
    <EmptyState
      icon={FileSearch}
      title="No models found"
      description="Your model inventory is empty or no results match the current filters."
      action={{
        label: "Add Model",
        onClick: () => console.log("open intake form"),
      }}
    />
  )
}
```

---

## 6. Progress Bar

**Pick:** Progress — `shadcn/progress`
Accessible Radix UI progress primitive with smooth CSS transition. Pair with custom color overrides via Tailwind `[&>*]:bg-*` selector for variant states (success, warning, error).

**Preview:** https://21st.dev/shadcn/progress

```bash
npx shadcn@latest add "https://21st.dev/r/shadcn/progress"
```

**Dependencies:** `@radix-ui/react-progress`

**Usage:**
```tsx
"use client"

import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"

// Animated progress on mount
export function ValidationProgress() {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setValue(72), 400)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Validation Completeness</span>
        <span>{value}%</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  )
}

// Color variants via Tailwind child selector
export function RiskScoreBar({ score }: { score: number }) {
  const color =
    score >= 75 ? "[&>*]:bg-green-500" :
    score >= 50 ? "[&>*]:bg-yellow-500" :
    "[&>*]:bg-red-500"

  return <Progress value={score} className={`h-3 ${color}`} />
}
```

---

## 7. Toast / Sonner

**Pick:** Sonner — `shadcn/sonner`
The official shadcn toast replacement. Stack-based, auto-dismiss, supports success/error/info/warning/loading/promise variants. Highly polished, handles async actions natively.

**Preview:** https://21st.dev/shadcn/sonner

```bash
npx shadcn@latest add "https://21st.dev/r/shadcn/sonner"
```

**Dependencies:** `sonner`

**Setup** — add `<Toaster />` once in your root layout:
```tsx
// app/layout.tsx
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}
```

**Usage:**
```tsx
import { toast } from "sonner"

// Basic variants
toast("Model saved successfully")
toast.success("Validation report submitted")
toast.error("SAR filing failed — check BSA queue")
toast.warning("Model monitoring threshold exceeded")
toast.info("MRA response due in 14 days")

// With action button
toast("Finding #2024-03 updated", {
  action: {
    label: "View",
    onClick: () => router.push("/findings/2024-03"),
  },
})

// Async / promise
toast.promise(submitValidationReport(), {
  loading: "Submitting report...",
  success: "Report submitted to MRM committee",
  error: "Submission failed",
})
```

---

## 8. Drawer / Sheet

**Pick:** Drawer — `Edil-ozi/drawer`
Multi-position drawer (left, right, top, bottom) built on Radix UI Dialog. Smooth slide animations, keyboard accessible (Esc to close), backdrop overlay.

**Preview:** https://21st.dev/Edil-ozi/drawer

```bash
npx shadcn@latest add "https://21st.dev/r/Edil-ozi/drawer"
```

**Dependencies:** `@radix-ui/react-dialog`, `framer-motion`

**Usage:**
```tsx
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function ModelDetailDrawer({ model }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>View Model Details</Button>

      <Drawer open={open} onOpenChange={setOpen} position="right">
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{model.name}</DrawerTitle>
            <DrawerDescription>Model ID: {model.id} · Tier {model.tier}</DrawerDescription>
          </DrawerHeader>

          <div className="px-6 py-4 space-y-4">
            <p className="text-sm text-muted-foreground">{model.description}</p>
            {/* model detail fields */}
          </div>

          <DrawerFooter>
            <Button>Open Full Record</Button>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
```

> **Alternative (shadcn native):** `shadcn/sheet` — same pattern, right-side only.
> ```bash
> npx shadcn@latest add "https://21st.dev/r/shadcn/sheet"
> ```

---

## 9. Floating Action Button

**Pick:** Floating Action Menu — `chetanverma16/floating-action-menu`
FAB that expands into a stacked action menu on click. Spring-animated open/close, each action gets its own icon + label tooltip. Stays fixed bottom-right.

**Preview:** https://21st.dev/chetanverma16/floating-action-menu

```bash
npx shadcn@latest add "https://21st.dev/r/chetanverma16/floating-action-menu"
```

**Dependencies:** `framer-motion`, `lucide-react`

**Usage:**
```tsx
import { FloatingActionMenu } from "@/components/ui/floating-action-menu"
import { Plus, FileText, Upload, MessageSquare } from "lucide-react"

const actions = [
  { icon: FileText, label: "New Report", onClick: () => console.log("new report") },
  { icon: Upload, label: "Upload Doc", onClick: () => console.log("upload") },
  { icon: MessageSquare, label: "Add Finding", onClick: () => console.log("finding") },
]

export function DashboardFAB() {
  return (
    <FloatingActionMenu
      mainIcon={Plus}
      actions={actions}
      position="bottom-right"
    />
  )
}
```

> **Alternative (floating panel):** `Codehagen/floating-action-panel`
> ```bash
> npx shadcn@latest add "https://21st.dev/r/Codehagen/floating-action-panel"
> ```

---

## Quick Reference

| Category | Author | Slug | Install |
|---|---|---|---|
| Sticky Navbar | ayushmxxn | tubelight-navbar | `npx shadcn@latest add "https://21st.dev/r/ayushmxxn/tubelight-navbar"` |
| Tooltip | aceternity | animated-tooltip | `npx shadcn@latest add "https://21st.dev/r/aceternity/animated-tooltip"` |
| Callout / Info Block | shadcn | alert | `npx shadcn@latest add "https://21st.dev/r/shadcn/alert"` |
| Dismissible Banner | aceternity | sticky-banner | `npx shadcn@latest add "https://21st.dev/r/aceternity/sticky-banner"` |
| Empty State | serafimcloud | empty-state | `npx shadcn@latest add "https://21st.dev/r/serafimcloud/empty-state"` |
| Progress Bar | shadcn | progress | `npx shadcn@latest add "https://21st.dev/r/shadcn/progress"` |
| Toast / Sonner | shadcn | sonner | `npx shadcn@latest add "https://21st.dev/r/shadcn/sonner"` |
| Drawer / Sheet | Edil-ozi | drawer | `npx shadcn@latest add "https://21st.dev/r/Edil-ozi/drawer"` |
| Floating Action Button | chetanverma16 | floating-action-menu | `npx shadcn@latest add "https://21st.dev/r/chetanverma16/floating-action-menu"` |

---

## Notes

- All installs drop files into `components/ui/` and handle dependencies automatically
- The tubelight-navbar source above is confirmed (fetched directly from CDN); other usage snippets are illustrative — verify prop names after install
- If a slug 404s (author renamed it), browse the category pages directly:
  - Navbars: https://21st.dev/s/navbar
  - Tooltips: https://21st.dev/s/tooltip
  - Empty States: https://21st.dev/s/empty-state
  - Toasts: https://21st.dev/s/toast
  - Drawers: https://21st.dev/s/drawer
