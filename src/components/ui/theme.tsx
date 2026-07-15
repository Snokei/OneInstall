import {
  AppWindow,
  Check,
  ChevronRight,
  Code,
  Cpu,
  ExternalLink,
  Info,
  Palette,
  Settings,
  Sparkles,
  Star,
} from "lucide-react";
import { useState } from "react";
import { Button } from "./button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import * as Typography from "./typography";

const Theme = () => {
  const [count, setCount] = useState(0);
  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-300 px-6 py-12 md:px-12 max-w-5xl mx-auto flex flex-col gap-12">
      {/* Hero Header */}
      <header className="flex flex-col gap-3 border-b border-border/20 pb-8">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <Typography.Small className="text-primary font-bold tracking-wider uppercase">
            Core UI Components
          </Typography.Small>
        </div>
        <Typography.H1>UI Design System</Typography.H1>
        <Typography.Lead className="max-w-2xl">
          A showcase of the typography, card layouts, and button designs ported
          and adapted from the{" "}
          <Typography.InlineCode>package-installer</Typography.InlineCode>{" "}
          project.
        </Typography.Lead>
      </header>

      {/* Grid of Showcases */}
      <main className="flex flex-col gap-12">
        {/* SECTION 1: TYPOGRAPHY */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-border/10 pb-2">
            <Typography.H2 className="flex items-center gap-2">
              <Code className="w-5 h-5 text-primary" />
              <span>Typography</span>
            </Typography.H2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-card p-6 rounded-lg border border-border">
            <div className="flex flex-col gap-4">
              <div className="border-b border-border/10 pb-2 mb-2">
                <Typography.Small className="font-semibold text-muted-foreground">
                  Headings
                </Typography.Small>
              </div>
              <Typography.H1 className="text-3xl lg:text-4xl">
                Heading 1 (H1)
              </Typography.H1>
              <Typography.H2>Heading 2 (H2)</Typography.H2>
              <Typography.H3>Heading 3 (H3)</Typography.H3>
              <Typography.H4>Heading 4 (H4)</Typography.H4>
            </div>

            <div className="flex flex-col gap-4">
              <div className="border-b border-border/10 pb-2 mb-2">
                <Typography.Small className="font-semibold text-muted-foreground">
                  Paragraphs & Inline Elements
                </Typography.Small>
              </div>
              <Typography.Lead>
                This is a lead paragraph (
                <Typography.InlineCode>Lead</Typography.InlineCode>) used for
                introductory descriptions.
              </Typography.Lead>
              <Typography.P className="mt-0">
                This is standard body text (
                <Typography.InlineCode>P</Typography.InlineCode>). It is styled
                for high readability with comfortable spacing and line height.
              </Typography.P>
              <div className="flex flex-col gap-1.5 bg-secondary p-3 rounded-md border border-border">
                <Typography.Large>Large text wrapper</Typography.Large>
                <Typography.Small>
                  Small description text label
                </Typography.Small>
                <Typography.Muted>
                  Muted fine print style for extra metadata details.
                </Typography.Muted>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: BUTTONS */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-border/10 pb-2">
            <Typography.H2 className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              <span>Button Variants & Sizes</span>
            </Typography.H2>
          </div>

          <div className="flex flex-col gap-8 bg-card p-6 rounded-lg border border-border">
            {/* Variants */}
            <div className="flex flex-col gap-3">
              <Typography.Small className="font-semibold text-muted-foreground border-b border-border/10 pb-1 mb-2">
                Variants
              </Typography.Small>
              <div className="flex flex-wrap gap-3 items-center">
                <Button variant="default">Default Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost Link</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link Style</Button>
              </div>
            </div>

            {/* Sizes */}
            <div className="flex flex-col gap-3">
              <Typography.Small className="font-semibold text-muted-foreground border-b border-border/10 pb-1 mb-2">
                Sizes
              </Typography.Small>
              <div className="flex flex-wrap gap-3 items-end">
                <Button size="xs" variant="outline">
                  Extra Small (xs)
                </Button>
                <Button size="sm" variant="outline">
                  Small (sm)
                </Button>
                <Button size="default" variant="outline">
                  Default Size
                </Button>
                <Button size="lg" variant="outline">
                  Large (lg)
                </Button>
              </div>
            </div>

            {/* Icons */}
            <div className="flex flex-col gap-3">
              <Typography.Small className="font-semibold text-muted-foreground border-b border-border/10 pb-1 mb-2">
                With Icons & Actions
              </Typography.Small>
              <div className="flex flex-wrap gap-3 items-center">
                <Button onClick={() => setCount(count + 1)} className="gap-2">
                  <Star className="w-4 h-4 fill-primary-foreground" />
                  <span>Interactive Count: {count}</span>
                </Button>

                <Button variant="secondary" className="gap-1.5">
                  <span>Open Config</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  title="Settings icon-only"
                >
                  <Cpu className="w-4 h-4" />
                </Button>

                <Button variant="destructive" size="sm" className="gap-1">
                  <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                  <span>Undo Transaction</span>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: CARDS */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-border/10 pb-2">
            <Typography.H2 className="flex items-center gap-2">
              <AppWindow className="w-5 h-5 text-primary" />
              <span>Card Designs</span>
            </Typography.H2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CARD 1: Info/Welcome */}
            <Card>
              <CardHeader>
                <div className="p-2 w-fit rounded-lg bg-secondary text-foreground mb-2 border border-border">
                  <Sparkles className="w-5 h-5" />
                </div>
                <CardTitle>Welcome Premium</CardTitle>
                <CardDescription>
                  Vercel style clean dashboard card layout.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Typography.P className="mt-0 text-sm">
                  This card features a clean flat background, thin border, and
                  Geist-inspired typography padding.
                </Typography.P>
                <div className="flex items-center gap-2 bg-secondary p-2.5 rounded-md border border-border">
                  <Info className="w-4 h-4 text-foreground shrink-0" />
                  <Typography.Small className="text-[10px] leading-tight">
                    Custom properties ensure smooth dark/light transitions.
                  </Typography.Small>
                </div>
              </CardContent>
              <CardFooter className="justify-end gap-2 pt-3">
                <Button size="xs" variant="ghost">
                  Learn More
                </Button>
                <Button size="xs">Get Started</Button>
              </CardFooter>
            </Card>

            {/* CARD 2: App Status simulator */}
            <Card>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex flex-col gap-1">
                  <CardTitle>GitKraken Client</CardTitle>
                  <Typography.Small className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground">
                    GitKraken.GitKraken
                  </Typography.Small>
                </div>
                <div className="w-5 h-5 flex items-center justify-center rounded bg-foreground text-background">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </CardHeader>
              <CardContent>
                <Typography.P className="mt-0 text-sm text-muted-foreground/80 line-clamp-2">
                  Legendary cross-platform Git client for productivity. Includes
                  graph view and merge tools.
                </Typography.P>
                <div className="mt-4 flex items-center justify-between text-sm border-t border-border/10 pt-3">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    Version: v9.4.0
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-500/5 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">
                    Installed
                  </span>
                </div>
              </CardContent>
              <CardFooter className="pt-3">
                <Button className="w-full" size="sm" variant="outline">
                  Launch Application
                </Button>
              </CardFooter>
            </Card>

            {/* CARD 3: Quick Settings Control */}
            <Card className="flex flex-col justify-between">
              <div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-primary" />
                    <span>Concurrently Threads</span>
                  </CardTitle>
                  <CardDescription>
                    Adjust download queue limits.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex items-center justify-center gap-4 bg-background border border-border p-3 rounded-lg">
                    <Button
                      variant="outline"
                      size="icon-xs"
                      className="w-8 h-8 rounded-lg"
                    >
                      -
                    </Button>
                    <div className="flex flex-col items-center">
                      <span className="font-mono font-bold text-lg leading-none">
                        2
                      </span>
                      <Typography.Small className="text-[8px] tracking-wider uppercase font-bold text-muted-foreground">
                        Threads
                      </Typography.Small>
                    </div>
                    <Button
                      variant="outline"
                      size="icon-xs"
                      className="w-8 h-8 rounded-lg"
                    >
                      +
                    </Button>
                  </div>
                </CardContent>
              </div>
              <CardFooter className="pt-3">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-between"
                >
                  <span>Save Profile</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/20 pt-6 text-center">
        <Typography.Muted>
          © 2026 Antigravity. Adaptive Premium Styling Systems.
        </Typography.Muted>
      </footer>
    </div>
  );
};

export default Theme;
