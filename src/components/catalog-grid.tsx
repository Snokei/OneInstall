import { useInstallStore } from "@/store/useInstallStore";
import { useVirtualizer } from "@tanstack/react-virtual";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useShallow } from "zustand/react/shallow";
import AppCard from "./app-card";
import LucideIcon from "./ui/lucide-icon";

const CATEGORIES = [
  "AI",
  "Browsers",
  "Development",
  "Editors & IDEs",
  "Utilities",
  "Communication",
  "Messaging",
  "Multimedia",
  "Design",
  "Gaming",
  "Productivity",
  "Online Search",
];

// Custom hook: uses matchMedia for efficient breakpoint-only change detection.
// Fires only when a breakpoint boundary is crossed, not on every pixel resize.
function useColumns(): number {
  const getColumns = useCallback(() => {
    if (window.matchMedia("(min-width: 1280px)").matches) return 4;
    if (window.matchMedia("(min-width: 768px)").matches) return 3;
    if (window.matchMedia("(min-width: 640px)").matches) return 2;
    return 1;
  }, []);

  const [columns, setColumns] = useState<number>(getColumns);

  useEffect(() => {
    const queries = [
      { mql: window.matchMedia("(min-width: 1280px)"), value: 4 },
      { mql: window.matchMedia("(min-width: 768px)"), value: 3 },
      { mql: window.matchMedia("(min-width: 640px)"), value: 2 },
    ];

    const handler = () => setColumns(getColumns());
    queries.forEach(({ mql }) => mql.addEventListener("change", handler));
    return () =>
      queries.forEach(({ mql }) => mql.removeEventListener("change", handler));
  }, [getColumns]);

  return columns;
}

export const CatalogGrid: React.FC = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const columns = useColumns();

  // Fix 1: Single store subscription with shallow equality — prevents redundant re-renders
  // when unrelated store slices update.
  const {
    packages,
    queue,
    searchQuery,
    activeFilter,
    selectAll,
    isSearchingOnline,
    searchOnline,
  } = useInstallStore(
    useShallow((s) => ({
      packages: s.packages,
      queue: s.queue,
      searchQuery: s.searchQuery,
      activeFilter: s.activeFilter,
      selectAll: s.selectAll,
      isSearchingOnline: s.isSearchingOnline,
      searchOnline: s.searchOnline,
    })),
  );

  // Fix 2: useRef instead of useState — scroll element never needs to trigger a re-render.
  // It is only read imperatively inside rowVirtualizer's getScrollElement.
  const scrollElRef = useRef<Element | null>(null);
  useEffect(() => {
    if (parentRef.current) {
      let el: HTMLElement | null = parentRef.current.parentElement;
      while (el) {
        const overflow = window.getComputedStyle(el).overflowY;
        if (overflow === "auto" || overflow === "scroll") {
          scrollElRef.current = el;
          break;
        }
        el = el.parentElement;
      }
    }
  }, []);

  // Fix 3: useCallback prevents isCategoryAllSelected from being recreated on every render.
  const isCategoryAllSelected = useCallback(
    (category: string) => {
      const eligibleApps = packages.filter(
        (app) => app.category === category && !app.isInstalled,
      );
      if (eligibleApps.length === 0) return false;
      return eligibleApps.every((app) => queue.includes(app.wingetId));
    },
    [packages, queue],
  );

  // 4. Perform search queries and category tab filters
  const filteredApps = useMemo(() => {
    return packages.filter((app) => {
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchName = app.name.toLowerCase().includes(q);
        const matchDesc = app.description.toLowerCase().includes(q);
        const matchCat = app.category.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchCat) {
          return false;
        }
      }

      const isInstalled = app.isInstalled || false;
      const updateAvailable = app.isUpdateAvailable || false;

      switch (activeFilter) {
        case "installed":
          return isInstalled;
        case "not-installed":
          return !isInstalled;
        case "updates":
          return isInstalled && updateAvailable;
        default:
          return true;
      }
    });
  }, [packages, searchQuery, activeFilter]);

  // 5. Group packages into categories map
  const appsByCategory = useMemo(() => {
    return CATEGORIES.reduce(
      (acc, cat) => {
        const catApps = filteredApps.filter((app) => app.category === cat);
        if (catApps.length > 0) {
          acc[cat] = catApps;
        }
        return acc;
      },
      {} as Record<string, typeof packages>,
    );
  }, [filteredApps]);

  // 6. Flatten category segments and grid cards into unified virtual rows
  const virtualRows = useMemo(() => {
    const rows: Array<
      | { type: "header"; categoryName: string }
      | { type: "grid-row"; categoryName: string; apps: typeof packages }
    > = [];

    CATEGORIES.forEach((cat) => {
      const catApps = appsByCategory[cat];
      if (!catApps || catApps.length === 0) return;

      // Category Header row
      rows.push({ type: "header", categoryName: cat });

      // Category Card grid rows
      for (let i = 0; i < catApps.length; i += columns) {
        rows.push({
          type: "grid-row",
          categoryName: cat,
          apps: catApps.slice(i, i + columns),
        });
      }
    });

    return rows;
  }, [appsByCategory, columns]);

  // 7. Instantiate TanStack useVirtualizer
  const rowVirtualizer = useVirtualizer({
    count: virtualRows.length,
    getScrollElement: () => scrollElRef.current,
    estimateSize: (index) => {
      const item = virtualRows[index];
      if (item.type === "header") return 52;
      return 264; // height of AppCard + grid gap
    },
    overscan: 3,
  });

  const hasOnlineResults = useMemo(() => {
    return packages.some(
      (pkg) =>
        pkg.category === "Online Search" &&
        (pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pkg.wingetId.toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [packages, searchQuery]);

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Online Search Banner */}
      {searchQuery && !hasOnlineResults && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-primary/20 bg-primary/5 backdrop-blur-md font-sans">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <LucideIcon
                name={isSearchingOnline ? "Loader2" : "Search"}
                size={16}
                className={isSearchingOnline ? "animate-spin" : ""}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {isSearchingOnline
                  ? "Searching Winget..."
                  : "Looking for something else?"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isSearchingOnline
                  ? `Searching the broader Winget repository for "${searchQuery}"...`
                  : `You can search the online Winget repository to discover and install packages.`}
              </p>
            </div>
          </div>
          {!isSearchingOnline && (
            <button
              onClick={() => searchOnline(searchQuery)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md active:scale-95 cursor-pointer border-0 font-sans"
            >
              Search Online
            </button>
          )}
        </div>
      )}

      <div ref={parentRef} className="w-full relative">
        {virtualRows.length > 0 ? (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const item = virtualRows[virtualRow.index];

              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="pb-4"
                >
                  {item.type === "header" ? (
                    /* Render Category Title & Select-All button */
                    <div className="flex items-center justify-between py-2 border-b border-border/10">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                          {item.categoryName}
                        </h3>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono leading-none">
                          {appsByCategory[item.categoryName]?.length || 0}
                        </span>
                      </div>
                      <button
                        onClick={() => selectAll(item.categoryName)}
                        className="text-[10px] font-extrabold uppercase text-primary hover:underline select-none bg-transparent border-0 cursor-pointer font-sans"
                      >
                        {isCategoryAllSelected(item.categoryName)
                          ? "Deselect All in Category"
                          : "Select All in Category"}
                      </button>
                    </div>
                  ) : (
                    /* Render Card Grid Row */
                    <div
                      className="grid gap-5 font-sans h-full"
                      style={{
                        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                      }}
                    >
                      {item.apps?.map((app) => (
                        <AppCard key={app.id} app={app} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="relative flex flex-col items-center justify-center py-20 px-6 text-center rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden font-sans">
            {/* Glowing backlight spotlight */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
              {/* Animated Icon Ring */}
              <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-b from-white/10 to-white/[0.02] border border-white/10 text-muted-foreground shadow-lg mb-6 transition-transform duration-300">
                <LucideIcon
                  name={isSearchingOnline ? "Loader2" : "PackageOpen"}
                  size={32}
                  className={
                    isSearchingOnline
                      ? "animate-spin text-primary"
                      : "stroke-[1.5] text-muted-foreground/80"
                  }
                />
              </div>

              {/* Status Title */}
              <h3 className="font-bold text-lg text-foreground tracking-tight mb-2">
                {isSearchingOnline
                  ? "Searching Winget Repository..."
                  : "No Local Matches Found"}
              </h3>

              {/* Descriptive Text with custom highlighted search query badge */}
              <p className="text-sm text-muted-foreground max-w-md leading-relaxed mb-8">
                {isSearchingOnline ? (
                  <span>
                    Querying online database for{" "}
                    <span className="inline-block px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-mono text-xs font-semibold">
                      {searchQuery}
                    </span>
                    ...
                  </span>
                ) : (
                  <span>
                    We couldn't find any packages matching{" "}
                    <span className="inline-block px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-mono text-xs font-semibold">
                      {searchQuery}
                    </span>{" "}
                    in the local catalog. Try searching the online Winget
                    repository.
                  </span>
                )}
              </p>

              {/* Premium Dynamic Action Button */}
              {!isSearchingOnline && searchQuery && (
                <button
                  onClick={() => searchOnline(searchQuery)}
                  className="group/btn mt-4 relative flex items-center gap-2 px-6 py-3 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer border-0 font-sans tracking-wide uppercase"
                >
                  <LucideIcon
                    name="Search"
                    size={13}
                    className="group-hover/btn:scale-110 transition-transform duration-200"
                  />
                  Search Winget Online
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogGrid;
