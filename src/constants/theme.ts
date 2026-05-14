/**
 * Global design tokens for the Livestock app.
 * All UI values should be sourced from here — no magic numbers in components.
 *
 * Design philosophy: Dark-mode-first, fintech-inspired.
 * Anchor colors:
 *   Background  → #06140B  (deep charcoal/dark green)
 *   Emerald     → #00FF66  (primary CTA, positive indicators)
 *   Card/Alt    → #0F2417  (secondary surfaces, cards)
 *   Gold        → #FFB800  (premium labels, festive highlights)
 *   Text base   → #FFFFFF  (headings, key values)
 *   Text muted  → #A0AEC0  (descriptions, labels)
 */

export const Colors = {
  // ── Brand ──────────────────────────────────────────────────────────────────
  /** Primary CTA, growth indicators, positive values */
  emerald: '#00FF66',
  emeraldDim: '#00CC52',        // pressed / active state
  emeraldFaint: '#00FF661A',    // 10% — tinted backgrounds, chips

  /** Premium / festive labels, high-priority badges */
  gold: '#FFB800',
  goldDim: '#CC9300',           // pressed
  goldFaint: '#FFB8001A',       // 10% — tinted backgrounds

  // ── Backgrounds ────────────────────────────────────────────────────────────
  /** Root app background */
  background: '#06140B',
  /** Cards, section containers */
  surface: '#0F2417',
  /** Slightly lighter than surface — nested cards, input fills */
  surfaceElevated: '#162E1E',
  /** Overlay panels, bottom sheets */
  overlay: '#0A1C10',

  // ── Text ───────────────────────────────────────────────────────────────────
  /** Primary headings, key financial values */
  textPrimary: '#FFFFFF',
  /** Secondary text, descriptions, form labels */
  textSecondary: '#A0AEC0',
  /** Disabled / placeholder text */
  textMuted: '#4A5568',
  /** Text rendered on emerald or gold backgrounds */
  textOnAccent: '#06140B',

  // ── Borders & Dividers ─────────────────────────────────────────────────────
  border: '#1E3828',            // subtle card borders
  borderFocus: '#00FF66',       // active input ring
  divider: '#122019',           // section separators

  // ── Semantic states ────────────────────────────────────────────────────────
  success: '#00FF66',           // maps to emerald for consistency
  successBg: '#00FF661A',
  warning: '#FFB800',           // maps to gold
  warningBg: '#FFB8001A',
  error: '#FF4D4D',
  errorBg: '#FF4D4D1A',
  info: '#38BDF8',
  infoBg: '#38BDF81A',

  // ── Utilities ──────────────────────────────────────────────────────────────
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export const Typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 30,
    display: 36,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
  },
} as const;

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  section: 64,
} as const;

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;
