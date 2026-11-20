import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'
import styles from './Panel.module.css'

/** Outline of a neon frame. */
export type PanelShape = 'chamfered' | 'pointed'

/** Color of a neon frame: the accent, or the color of a game area. */
export type Tone = 'accent' | 'shop' | 'ship' | 'arena'

/** Props of {@link Panel}: its own options plus the props of the element it renders. */
export type PanelProps<E extends ElementType> = {
  /** Element to render, for example 'header', 'section', 'button' or a router Link. Default: div. */
  as?: E
  shape?: PanelShape
  tone?: Tone
  className?: string
  children: ReactNode
} & Omit<ComponentPropsWithoutRef<E>, 'as' | 'children' | 'className'>

/**
 * Neon frame with cut corners or pointed sides, used for bars, boxes and big buttons.
 * The inner wrappers are spans, so a Panel can also be a button or a link.
 */
export function Panel<E extends ElementType = 'div'>({ as, shape = 'chamfered', tone = 'accent', className, children, ...props }: PanelProps<E>) {
  const Element: ElementType = as ?? 'div'
  return (
    <Element className={className ? `${styles.panel} ${className}` : styles.panel} data-shape={shape} data-tone={tone} {...props}>
      <span className={styles.shape}>
        <span className={styles.content}>{children}</span>
      </span>
    </Element>
  )
}
