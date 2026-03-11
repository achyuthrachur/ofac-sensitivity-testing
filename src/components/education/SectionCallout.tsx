import Link from 'next/link';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Setting4, ClipboardTick, Chart } from 'iconsax-reactjs';

interface SectionCalloutProps {
  tab: 'sensitivity' | 'screening' | 'simulation';
}

const CONTENT = {
  sensitivity: {
    title: 'Sensitivity Test',
    body: 'This tab tests how your current screening engine handles deliberate name degradations. Configure entity types and rules, then run a test to see how many degraded names your engine would catch vs. miss.',
    link: { label: 'Learn more in the User Guide →', href: '/guide#sensitivity-test' },
  },
  screening: {
    title: 'Screening Mode',
    body: 'Upload a list of names to screen against the 285-entry synthetic SDN dataset. The engine scores each name across three algorithms and assigns a risk tier — use this to demonstrate screening coverage to a client.',
    link: { label: 'Learn more in the User Guide →', href: '/guide#screening-mode' },
  },
  simulation: {
    title: 'Simulation Mode',
    body: 'Model how catch rates evolve over time as sanctioned entities adopt increasingly sophisticated evasion tactics. Select a velocity preset to see how your threshold holds up under sustained evasion pressure.',
    link: { label: 'Learn more in the User Guide →', href: '/guide#simulation' },
  },
} as const;

const ICONS = {
  sensitivity: Setting4,
  screening: ClipboardTick,
  simulation: Chart,
} as const;

export function SectionCallout({ tab }: SectionCalloutProps) {
  const { title, body, link } = CONTENT[tab];
  const Icon = ICONS[tab];

  return (
    <Alert className="mb-4 border-l-4 border-l-crowe-indigo-dark border-crowe-indigo-dark/15 bg-crowe-indigo-dark/5">
      <Icon variant="Linear" size={16} color="var(--color-crowe-indigo-dark)" />
      <AlertTitle className="text-foreground font-semibold">{title}</AlertTitle>
      <AlertDescription className="text-muted-foreground mt-1">
        {body}{' '}
        <Link
          href={link.href}
          className="text-crowe-amber hover:text-crowe-amber-bright transition-colors"
        >
          {link.label}
        </Link>
      </AlertDescription>
    </Alert>
  );
}
