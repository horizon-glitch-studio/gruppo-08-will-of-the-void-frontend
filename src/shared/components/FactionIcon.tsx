import { AtomIcon, CubeIcon, DiamondIcon, FireIcon, LightningIcon, MagnetIcon, RadioactiveIcon, SnowflakeIcon, type IconProps } from '@phosphor-icons/react'
import type { Faction } from '../factions'

/** Phosphor icon of each faction, bold weight. */
const icons = {
  lava: FireIcon,
  electro: LightningIcon,
  radio: RadioactiveIcon,
  ice: SnowflakeIcon,
  metal: MagnetIcon,
  matte: CubeIcon,
  gem: DiamondIcon,
  'noble-gas': AtomIcon,
} satisfies Record<Faction, unknown>

/** Props of {@link FactionIcon}. */
interface FactionIconProps extends IconProps {
  faction: Faction
  /** Accessible name. Leave it out when the faction name is already written next to the icon. */
  label?: string
}

/** Faction symbol in the faction color. */
export function FactionIcon({ faction, label, style, ...props }: FactionIconProps) {
  const Icon = icons[faction]
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true }
  // The color goes through CSS `color`: Phosphor fills with currentColor
  return <Icon weight="bold" style={{ color: `var(--color-${faction})`, ...style }} {...a11y} {...props} />
}
