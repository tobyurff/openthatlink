"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { DEFAULT_CONFIG } from "@otl/shared";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? DEFAULT_CONFIG.APP_NAME;
const CHROME_EXTENSION_URL = process.env.NEXT_PUBLIC_CHROME_EXTENSION_URL ?? DEFAULT_CONFIG.CHROME_EXTENSION_URL;
const FIREFOX_EXTENSION_URL = process.env.NEXT_PUBLIC_FIREFOX_EXTENSION_URL ?? DEFAULT_CONFIG.FIREFOX_EXTENSION_URL;

const BROWSER_STORES = {
  chrome: {
    name: "Chrome",
    label: "Try on Chrome",
    url: CHROME_EXTENSION_URL,
  },
  firefox: {
    name: "Firefox",
    label: "Try on Firefox",
    url: FIREFOX_EXTENSION_URL,
  },
} as const;

type BrowserKey = keyof typeof BROWSER_STORES;

function detectBrowser(): BrowserKey {
  if (typeof navigator === "undefined") return "chrome";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("firefox")) return "firefox";
  return "chrome";
}

function BrowserDropdown({ small = false }: { small?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [browser, setBrowser] = useState<BrowserKey>("chrome");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setBrowser(detectBrowser());
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const primary = BROWSER_STORES[browser];
  const otherBrowsers = (Object.keys(BROWSER_STORES) as BrowserKey[]).filter(
    (key) => key !== browser
  );

  const buttonPadding = small ? "8px 14px" : "14px 28px";
  const fontSize = small ? 13 : 16;
  const arrowPadding = small ? "8px 10px" : "14px 12px";

  return (
    <div ref={dropdownRef} style={{ position: "relative", display: "inline-flex" }}>
      <a
        href={primary.url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary"
        style={{
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          padding: buttonPadding,
          paddingRight: small ? 12 : 20,
          fontSize,
        }}
      >
        {primary.label}
      </a>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-primary"
        style={{
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          borderLeft: "1px solid rgba(255,255,255,0.2)",
          padding: arrowPadding,
          minWidth: "auto",
        }}
        aria-label="Select browser"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill="none"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s ease",
          }}
        >
          <path
            d="M2.5 4.5L6 8L9.5 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: 0,
            background: "var(--white)",
            border: "1px solid var(--gray-200)",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            minWidth: "100%",
            zIndex: 10,
          }}
        >
          {otherBrowsers.map((key) => (
            <a
              key={key}
              href={BROWSER_STORES[key].url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              style={{
                display: "block",
                padding: small ? "8px 14px" : "10px 16px",
                color: "var(--black)",
                fontSize: small ? 13 : 14,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "var(--gray-100)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              {BROWSER_STORES[key].label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

interface HeaderProps {
  variant?: "full" | "compact";
}

export function Header({ variant = "full" }: HeaderProps) {
  const isCompact = variant === "compact";
  const height = isCompact ? 72 : 100;
  const logoHeight = isCompact ? 28 : 64;
  const fontSize = isCompact ? 20 : 42;

  return (
    <header style={{ borderBottom: "1px solid var(--gray-200)" }}>
      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: isCompact ? 10 : 18,
            color: "inherit",
            textDecoration: "none",
          }}
        >
          <img
            src="/logo.svg"
            alt={APP_NAME}
            style={{ height: logoHeight, width: "auto" }}
          />
          <span style={{ fontWeight: 700, fontSize, letterSpacing: "-0.02em" }}>
            {APP_NAME}
          </span>
        </Link>
        <div className="header-cta">
          <BrowserDropdown small={isCompact} />
        </div>
      </div>
    </header>
  );
}

// Re-export BrowserDropdown for use in hero section
export { BrowserDropdown };
