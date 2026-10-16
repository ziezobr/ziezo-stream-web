"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";


import { Check, ChevronDown, ChevronUp } from "lucide-react";

import type {
  ButtonHTMLAttributes,
  ComponentType,
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
} from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type NotchPosition = "top" | "bottom";

export interface NotchItemData {
  id: string;
  label: string;
  icon?: LucideIcon | ComponentType<{ className?: string }>;
  badge?: string;
  disabled?: boolean;
}

export interface NotchWingProps {
  position?: NotchPosition;
  className?: string;
}

export function NotchLeftWing({
  position = "top",
  className,
}: NotchWingProps) {
  const isBottom = position === "bottom";

  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      shapeRendering="geometricPrecision"
      className={cn(
        "pointer-events-none absolute right-full size-2.5 md:size-4 overflow-visible select-none text-zinc-950 transition-colors duration-200 dark:text-zinc-950",
        isBottom ? "bottom-0" : "top-0",
        className
      )}
    >
      <path
        d={
          isBottom
            ? "M 0 20 C 11.046 20 20 11.046 20 0 H 21 V 21 H 0 Z"
            : "M 0 0 C 11.046 0 20 8.954 20 20 H 21 V -1 H 0 Z"
        }
        fill="currentColor"
      />
    </svg>
  );
}

export function NotchRightWing({
  position = "top",
  className,
}: NotchWingProps) {
  const isBottom = position === "bottom";

  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      shapeRendering="geometricPrecision"
      className={cn(
        "pointer-events-none absolute left-full size-2.5 md:size-4 overflow-visible select-none text-zinc-950 transition-colors duration-200 dark:text-zinc-950",
        isBottom ? "bottom-0" : "top-0",
        className
      )}
    >
      <path
        d={
          isBottom
            ? "M 20 20 C 8.954 20 0 11.046 0 0 H -1 V 21 H 20 Z"
            : "M 20 0 C 8.954 0 0 8.954 0 20 H -1 V -1 H 20 Z"
        }
        fill="currentColor"
      />
    </svg>
  );
}

export function NotchCornerLeftWing({
  position = "top",
  className,
}: NotchWingProps) {
  const isBottom = position === "bottom";

  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      shapeRendering="geometricPrecision"
      className={cn(
        "pointer-events-none absolute left-0 size-2.5 md:size-4 overflow-visible select-none text-zinc-950 transition-colors duration-200 dark:text-zinc-950",
        isBottom ? "bottom-full" : "top-full",
        className
      )}
    >
      <path
        d={
          isBottom
            ? "M 0 20 H 20 C 8.954 20 0 11.046 0 0 V 20 Z"
            : "M 0 0 H 20 C 8.954 0 0 8.954 0 20 V 0 Z"
        }
        fill="currentColor"
      />
    </svg>
  );
}

export function NotchCornerRightWing({
  position = "top",
  className,
}: NotchWingProps) {
  const isBottom = position === "bottom";

  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      shapeRendering="geometricPrecision"
      className={cn(
        "pointer-events-none absolute right-0 size-2.5 md:size-4 overflow-visible select-none text-zinc-950 transition-colors duration-200 dark:text-zinc-950",
        isBottom ? "bottom-full" : "top-full",
        className
      )}
    >
      <path
        d={
          isBottom
            ? "M 20 20 H 0 C 11.046 20 20 11.046 20 0 V 20 Z"
            : "M 20 0 H 0 C 11.046 0 20 8.954 20 20 V 0 Z"
        }
        fill="currentColor"
      />
    </svg>
  );
}

export interface NotchItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>,'onSelect'> {
  id: string;
  label: string;
  isActive: boolean;
  icon?: LucideIcon | ComponentType<{ className?: string }>;
  badge?: string;
  disabled?: boolean;
  onSelect: (id: string) => void;
}

export const NotchItem = forwardRef<HTMLButtonElement, NotchItemProps>(
  (
    {
      id,
      label,
      isActive,
      icon: Icon,
      badge,
      disabled,
      className,
      onClick,
      onSelect,
      ...props
    },
    ref
  ) => {
    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      if (disabled) {
        event.preventDefault();
        return;
      }

      onSelect(id);
      onClick?.(event);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (!disabled) {
          onSelect(id);
        }
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isActive}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "ziezo-nav-tab relative flex h-9 cursor-pointer items-center gap-2 rounded-full px-3.5 text-sm font-medium transition-colors outline-none select-none",
          "focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-1 dark:focus-visible:ring-zinc-500",
          isActive
            ? "font-semibold text-white bg-zinc-850 shadow-sm"
            : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5",
          disabled && "cursor-not-allowed pointer-events-none opacity-40",
          className
        )}
        {...props}
      >
        {isActive && (
          <span
            aria-hidden="true"
            className="ziezo-nav-tab-indicator absolute inset-0 rounded-full bg-zinc-800/90 border border-white/10 transition-colors duration-200"
          />
        )}

        <span className="ziezo-nav-tab-content relative z-10 flex items-center gap-2">
          {Icon && (
            <Icon
              className={cn(
                "size-4 shrink-0 transition-colors",
                isActive
                  ? "text-[#c8ff48]"
                  : "text-zinc-400 group-hover:text-zinc-200"
              )}
            />
          )}

          <span className="leading-none">{label}</span>

          {badge && (
            <span className="rounded-full bg-[#c8ff48] px-1.5 py-0.5 text-[9px] font-black tracking-tight uppercase text-black">
              {badge}
            </span>
          )}
        </span>
      </button>
    );
  }
);

NotchItem.displayName = "NotchItem";

interface NotchDropdownItemProps {
  key?: string;
  item: NotchItemData;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function NotchDropdownItem({
  item,
  isSelected,
  onSelect,
}: NotchDropdownItemProps) {
  const Icon = item.icon;

  const handleClick = () => {
    onSelect(item.id);
  };

  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      disabled={item.disabled}
      onClick={handleClick}
      className={cn(
        "ziezo-nav-option flex w-full cursor-pointer items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-left text-sm outline-none transition-colors select-none",
        "focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-500",
        isSelected
          ? "bg-zinc-800 font-semibold text-white border border-[#c8ff48]/40 shadow-[0_0_12px_rgba(200,255,72,0.15)]"
          : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 active:bg-zinc-800",
        item.disabled && "cursor-not-allowed pointer-events-none opacity-40"
      )}
    >
      <div className="flex items-center gap-2.5">
        {Icon && (
          <Icon
            className={cn(
              "size-4 shrink-0",
              isSelected
                ? "text-[#c8ff48]"
                : "text-zinc-400"
            )}
          />
        )}

        <span>{item.label}</span>
      </div>

      {isSelected && (
        <Check className="size-3.5 text-[#c8ff48]" />
      )}
    </button>
  );
}

export interface NotchNavProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  items: NotchItemData[];
  activeId?: string;
  defaultActiveId?: string;
  position?: NotchPosition;
  logo?: ReactNode;
  rightContent?: ReactNode;
  showLogo?: boolean;
  showRightContent?: boolean;
  children?: ReactNode;
  onActiveChange?: (id: string) => void;
}

export function NotchNav({
  items,
  activeId: controlledActiveId,
  defaultActiveId,
  position = "top",
  logo,
  rightContent,
  showLogo = true,
  showRightContent = true,
  children,
  onActiveChange,
  className,
  ...props
}: NotchNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [internalActiveId, setInternalActiveId] = useState<string>(
    defaultActiveId || items[0]?.id || ""
  );

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const isBottom = position === "bottom";

  const activeId =
    controlledActiveId !== undefined
      ? controlledActiveId
      : internalActiveId;

  const activeIndex = useMemo(() => {
    const index = items.findIndex((item) => item.id === activeId);
    return index >= 0 ? index : 0;
  }, [items, activeId]);

  const activeItem = items[activeIndex] || items[0];

  const handleSelect = useCallback(
    (id: string) => {
      if (controlledActiveId === undefined) {
        setInternalActiveId(id);
      }
      setIsDropdownOpen(false);
      onActiveChange?.(id);
    },
    [controlledActiveId, onActiveChange]
  );

  const handleToggleDropdown = useCallback(() => {
    setIsDropdownOpen((prev) => !prev);
  }, []);

  const handleCloseDropdown = useCallback(() => {
    setIsDropdownOpen(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div
      className={cn(
        "ziezo-nav-root relative w-full min-h-screen bg-[#08080a] text-[#f5f5f7] antialiased",
        className
      )}
      {...props}
    >
      <div className="ziezo-nav-stage relative flex min-h-screen w-full flex-col bg-background text-foreground antialiased">
        <div
          aria-hidden="true"
          onClick={handleCloseDropdown}
          className={cn(
            "ziezo-nav-scrim fixed inset-0 z-40 transition-opacity duration-200 ease-out xl:hidden",
            isDropdownOpen
              ? "pointer-events-auto bg-black/60 backdrop-blur-xs opacity-100"
              : "pointer-events-none opacity-0"
          )}
        />

        {/* 1. Desktop Left Logo Notch */}
        {showLogo && logo && (
          <aside
            aria-label="Brand logo notch"
            className={cn(
              "ziezo-nav-brand-island hidden xl:flex fixed left-4 z-50 h-11 px-5 select-none transition-colors duration-200 bg-[#0c0c10]/95 backdrop-blur-md border border-white/10 shadow-2xl",
              isBottom
                ? "bottom-3 rounded-2xl md:items-center"
                : "top-3 rounded-2xl md:items-center"
            )}
          >
            <div className="flex items-center text-white">
              {logo}
            </div>
          </aside>
        )}

        {/* 2. Desktop Center Menu Notch */}
        <header
          role="tablist"
          aria-orientation="horizontal"
          className={cn(
            "ziezo-nav-desktop-tabs hidden xl:flex fixed left-1/2 -translate-x-1/2 z-50 h-12 px-3 bg-[#0c0c10]/90 backdrop-blur-xl border border-white/10 text-white select-none transition-colors duration-200 shadow-2xl rounded-full",
            isBottom
              ? "bottom-3 items-center"
              : "top-3 items-center"
          )}
        >
          <div className="flex items-center gap-1">
            {items.map((item) => (
              <NotchItem
                key={item.id}
                id={item.id}
                label={item.label}
                icon={item.icon}
                badge={item.badge}
                disabled={item.disabled}
                isActive={item.id === activeId}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </header>

        {/* 3. Desktop Right Action Notch */}
        {showRightContent && rightContent && (
          <aside
            aria-label="User actions notch"
            className={cn(
              "ziezo-nav-actions-island hidden xl:flex fixed right-4 z-50 h-11 px-4 select-none transition-colors duration-200 bg-[#0c0c10]/95 backdrop-blur-md border border-white/10 text-white shadow-2xl rounded-2xl",
              isBottom
                ? "bottom-3 items-center"
                : "top-3 items-center"
            )}
          >
            <div className="flex items-center text-white gap-2">
              {rightContent}
            </div>
          </aside>
        )}

        {/* ========================================================================= */}
        {/* TABLET & MOBILE VIEW (< 1280px): COMPACT NOTCH ISLAND                      */}
        {/* ========================================================================= */}
        <div
          ref={containerRef}
          className={cn(
            "xl:hidden fixed z-50 flex flex-col bg-[#0c0c10]/95 backdrop-blur-2xl border border-white/10 text-white select-none transition-all duration-200 shadow-2xl",
            "ziezo-mobile-notch",
            "w-[94%] max-w-md left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-2xl",
            isBottom
              ? "bottom-3"
              : "top-3"
          )}
        >
          {/* Unified Horizontal Bar */}
          <div
            className={cn(
              "ziezo-mobile-bar w-full flex h-10 items-center justify-between gap-2"
            )}
          >
            {/* Left Logo Slot */}
            {showLogo && logo && (
              <div className="flex shrink-0 items-center text-white">
                {logo}
              </div>
            )}

            {/* Center Dropdown Page Trigger */}
            <button
              type="button"
              aria-expanded={isDropdownOpen}
              aria-haspopup="listbox"
              aria-label="Alternar navegação"
              onClick={handleToggleDropdown}
              className="ziezo-mobile-trigger group flex h-9 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-3 text-xs sm:text-sm font-semibold text-white outline-none transition-colors bg-white/5 hover:bg-white/10 active:scale-98"
            >
              {activeItem?.icon && (
                <activeItem.icon className="size-4 shrink-0 text-[#c8ff48]" />
              )}

              <span className="leading-none truncate max-w-[130px]">{activeItem?.label}</span>

              {isBottom ? (
                <ChevronUp
                  className={cn(
                    "size-3.5 text-zinc-400 transition-transform duration-200",
                    isDropdownOpen && "rotate-180"
                  )}
                />
              ) : (
                <ChevronDown
                  className={cn(
                    "size-3.5 text-zinc-400 transition-transform duration-200",
                    isDropdownOpen && "rotate-180"
                  )}
                />
              )}
            </button>

            {/* Right Action Slot */}
            {showRightContent && rightContent && (
              <div className="ziezo-mobile-actions flex shrink-0 items-center justify-end text-white">
                {rightContent}
              </div>
            )}
          </div>

          {/* Expandable Dropdown Drawer */}
          <div
            role="listbox"
            aria-label="Navigation options"
            className={cn(
              "ziezo-mobile-drawer grid transition-[grid-template-rows,opacity] duration-200 ease-out w-full",
              isDropdownOpen
                ? "grid-rows-[1fr] opacity-100 mt-2 border-t border-white/10 pt-2"
                : "grid-rows-[0fr] opacity-0 pointer-events-none"
            )}
          >
            <div className="overflow-hidden">
              <div
                className="flex w-full flex-col gap-1 pb-1"
              >
                {items.map((item) => (
                  <NotchDropdownItem
                    key={item.id}
                    item={item}
                    isSelected={item.id === activeId}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content Container */}
        <div className="ziezo-nav-content relative flex w-full flex-col flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

