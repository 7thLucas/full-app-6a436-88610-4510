/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  // Base
  background: string;
  foreground: string;
  // Card
  card: string;
  cardForeground: string;
  // Popover
  popover: string;
  popoverForeground: string;
  // Primary
  primary: string;
  primaryForeground: string;
  // Secondary
  secondary: string;
  secondaryForeground: string;
  // Muted
  muted: string;
  mutedForeground: string;
  // Accent
  accent: string;
  accentForeground: string;
  // Destructive
  destructive: string;
  destructiveForeground: string;
  // Border / Input / Ring
  border: string;
  input: string;
  ring: string;
  // Charts
  chart1?: string;
  chart2?: string;
  chart3?: string;
  chart4?: string;
  chart5?: string;
  // Navbar
  navbarBackground: string;
  // Sidebar
  sidebarBackground: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
};

export type TFont = {
  headingFont: string;
  textFont: string;
};

export type TDefaultConfigurableData = {
  appName: string;
  logoUrl: string;
  brandColor: TBrandColor;
  font: TFont;
  appTagline: string;
  appDescription: string;
  maxActionItemsPerMeeting: number;
  defaultProjectName: string;
  enableEmailReminders: boolean;
  actionItemReminderDays: number;
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "autoMoM",
  logoUrl: "",
  brandColor: {
    // Base
    background:        "#0f172a",
    foreground:        "#e2e8f0",
    // Card
    card:              "#1e293b",
    cardForeground:    "#e2e8f0",
    // Popover
    popover:           "#1e293b",
    popoverForeground: "#e2e8f0",
    // Primary
    primary:           "#0d9488",
    primaryForeground: "#ffffff",
    // Secondary
    secondary:           "#334155",
    secondaryForeground: "#e2e8f0",
    // Muted
    muted:           "#1e293b",
    mutedForeground: "#94a3b8",
    // Accent
    accent:           "#06b6d4",
    accentForeground: "#ffffff",
    // Destructive
    destructive:           "#ef4444",
    destructiveForeground: "#ffffff",
    // Border / Input / Ring
    border: "#334155",
    input:  "#334155",
    ring:   "#0d9488",
    // Charts
    chart1: "#0d9488",
    chart2: "#06b6d4",
    chart3: "#3b82f6",
    chart4: "#8b5cf6",
    chart5: "#f59e0b",
    // Navbar
    navbarBackground: "#0f172a",
    // Sidebar
    sidebarBackground:        "#0a1120",
    sidebarForeground:        "#cbd5e1",
    sidebarPrimary:           "#0d9488",
    sidebarPrimaryForeground: "#ffffff",
    sidebarAccent:            "#1e293b",
    sidebarAccentForeground:  "#e2e8f0",
    sidebarBorder:            "#1e293b",
    sidebarRing:              "#0d9488",
  },
  font: {
    headingFont: "Space Grotesk",
    textFont: "Inter",
  },
  appTagline: "Never Lose a Decision Again",
  appDescription: "AI-powered meeting assistant that auto-generates transcripts, action items, and decisions from your recordings.",
  maxActionItemsPerMeeting: 50,
  defaultProjectName: "General",
  enableEmailReminders: true,
  actionItemReminderDays: 2,
};
