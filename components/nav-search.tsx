"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, UserCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { supabase } from "@/utils/supabase/client";

export interface NavSearchProps {
  variant?: "default" | "sheet";
  placeholder?: string;
  className?: string;
}

interface UserResult {
  id: string;
  full_name: string | null;
  profile_path: string | null;
  instrument: string | null;
  is_active: boolean;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}


export function NavSearch({
  variant = "default",
  placeholder = "Search members…",
  className,
}: NavSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const debouncedQuery = useDebounce(query.trim(), 300);


  const search = useCallback(async (q: string) => {
    if (!q) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, profile_path, instrument, is_active")
      .ilike("full_name", `%${q}%`)
      .eq("is_active", true)
      .order("display_order", { ascending: true, nullsFirst: false })
      .limit(6);

    setIsLoading(false);

    if (error) {
      console.error("[NavSearch] Supabase error:", error.message);
      setResults([]);
      return;
    }

    setResults(data ?? []);
    setIsOpen(true);
    setActiveIndex(-1);
  }, []);

  useEffect(() => {
    search(debouncedQuery);
  }, [debouncedQuery, search]);

  // ── Close on outside click ──────────────────────────────────────────────────

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // ── Keyboard navigation ─────────────────────────────────────────────────────

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(results[activeIndex].id);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  function handleSelect(userId: string) {
    setQuery("");
    setIsOpen(false);
    router.push(`/user/profile/${userId}`);
  }

  function handleClear() {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  }

  // ── Derived ─────────────────────────────────────────────────────────────────

  const isSheet = variant === "sheet";
  const showDropdown = isOpen && query.trim().length > 0;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative",
        isSheet ? "w-full" : "w-52 lg:w-64",
        className
      )}
    >
      {/* Input row */}
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Search className="h-3.5 w-3.5" />
          )}
        </span>

        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          aria-label="Search members"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-controls="nav-search-results"
          className={cn(
            "h-8 bg-muted pl-8 text-xs focus-visible:ring-1",
            query ? "pr-7" : "pr-3",
            isSheet ? "w-full rounded-md" : "rounded-full"
          )}
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* ── Dropdown results ──────────────────────────────────────────────── */}
      {showDropdown && (
        <ul
          id="nav-search-results"
          role="listbox"
          aria-label="Search results"
          className="absolute left-0 z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-md"
        >
          {results.length === 0 && !isLoading ? (
            <li className="flex items-center gap-2 px-3 py-3 text-xs text-muted-foreground">
              <UserCircle2 className="h-4 w-4 shrink-0" />
              No members found for &ldquo;{query}&rdquo;
            </li>
          ) : (
            results.map((user, idx) => (
              <li key={user.id} role="option" aria-selected={idx === activeIndex}>
                <button
                  type="button"
                  onClick={() => handleSelect(user.id)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors",
                    idx === activeIndex
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage
                      src={user.profile_path ?? undefined}
                      alt={user.full_name ?? "Member"}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                      {user.full_name
                        ? user.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()
                        : "?"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium leading-tight">
                      {user.full_name ?? "Unnamed member"}
                    </p>
                    {user.instrument && (
                      <p className="truncate text-[10px] text-muted-foreground leading-tight">
                        {user.instrument}
                      </p>
                    )}
                  </div>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}