import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'
import styles from './Button.module.css'
import { Panel, type PanelShape, type Tone } from './Panel'

/** Visual options shared by {@link Button} and {@link ButtonLink}. */
interface ButtonLookProps {
  /** primary: filled with the tone color. secondary: neon outline. */
  variant?: 'primary' | 'secondary'
  tone?: Tone
  shape?: PanelShape
  size?: 'md' | 'lg'
  /** Icon before the label. Hidden from screen readers: the label already says what the button does. */
  icon?: ReactNode
  /** Added to the button class, for layout from the parent. */
  className?: string
  children: ReactNode
}

function buttonClass(className?: string) {
  return className ? `${styles.button} ${className}` : styles.button
}

function Label({ icon, children }: Pick<ButtonLookProps, 'icon' | 'children'>) {
  return (
    <span className={styles.label}>
      {icon && <span aria-hidden="true">{icon}</span>}
      <span className={styles.text}>{children}</span>
    </span>
  )
}

/** Button with the neon look. type defaults to "button", so it never submits a form by accident. */
export function Button({
  variant = 'secondary',
  tone,
  shape = 'pointed',
  size = 'md',
  icon,
  className,
  children,
  type = 'button',
  ...props
}: ButtonLookProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Panel as="button" inline type={type} className={buttonClass(className)} shape={shape} tone={tone} data-variant={variant} data-size={size} {...props}>
      <Label icon={icon}>{children}</Label>
    </Panel>
  )
}

/** Link to a route with the look of a {@link Button}. */
export function ButtonLink({ variant = 'secondary', tone, shape = 'pointed', size = 'md', icon, className, children, ...props }: ButtonLookProps & LinkProps) {
  return (
    <Panel as={Link} inline className={buttonClass(className)} shape={shape} tone={tone} data-variant={variant} data-size={size} {...props}>
      <Label icon={icon}>{children}</Label>
    </Panel>
  )
}
