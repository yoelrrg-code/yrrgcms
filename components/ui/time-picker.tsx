'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Clock } from 'lucide-react';

interface TimePickerProps {
  value: string; // HH:mm (24h format e.g. "09:30" or "14:15")
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minTime?: string; // HH:mm format
  maxTime?: string; // HH:mm format
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

const PICKER_WIDTH = 256; // w-64
const GAP = 4; // px between trigger and dropdown
const MAX_LIST_HEIGHT = 192; // max-h-48

export default function TimePicker({
  value,
  onChange,
  placeholder = 'Select time',
  className = '',
  minTime,
  maxTime,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({ visibility: 'hidden' });
  const [listMaxHeight, setListMaxHeight] = useState(MAX_LIST_HEIGHT);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Derive hour and minute directly from value during render to avoid cascading renders
  const [parsedHour, parsedMinute] = (value && value.includes(':'))
    ? value.split(':')
    : ['09', '00'];

  const selectedHour = (parsedHour || '09').padStart(2, '0');
  const selectedMinute = (parsedMinute || '00').padStart(2, '0');

  // Calculate full position and visibility
  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const triggerRect = containerRef.current.getBoundingClientRect();
    const dropdownHeight = dropdownRef.current?.offsetHeight || MAX_LIST_HEIGHT + 60;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const MARGIN_X = 38;
    const MARGIN_Y = 8;

    let left = triggerRect.left;
    if (left + PICKER_WIDTH > viewportWidth - MARGIN_X) {
      left = viewportWidth - PICKER_WIDTH - MARGIN_X;
    }
    if (left < MARGIN_X) left = MARGIN_X;

    const width = Math.min(PICKER_WIDTH, viewportWidth - MARGIN_X * 2);

    const spaceBelow = viewportHeight - triggerRect.bottom - MARGIN_Y;
    const spaceAbove = triggerRect.top - MARGIN_Y;
    const openAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    const top = openAbove
      ? Math.max(MARGIN_Y, triggerRect.top - dropdownHeight - GAP)
      : triggerRect.bottom + GAP;

    const availableSpace = openAbove ? spaceAbove : spaceBelow;
    const newListMax = Math.min(MAX_LIST_HEIGHT, Math.max(80, availableSpace - 70));
    setListMaxHeight(newListMax);

    setDropdownStyle({
      position: 'fixed',
      top,
      left,
      width,
      zIndex: 9999,
      visibility: 'visible',
    });
  }, []);

  // Step 1: set horizontal position before initial measurement
  const computeInitialPosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const MARGIN = 38;

    let left = rect.left;
    if (left + PICKER_WIDTH > viewportWidth - MARGIN) {
      left = viewportWidth - PICKER_WIDTH - MARGIN;
    }
    if (left < MARGIN) left = MARGIN;

    const width = Math.min(PICKER_WIDTH, viewportWidth - MARGIN * 2);

    setDropdownStyle({
      position: 'fixed',
      top: rect.bottom + GAP,
      left,
      width,
      zIndex: 9999,
      visibility: 'hidden',
    });
  }, []);

  // Step 2: measure actual height and show dropdown
  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
  }, [isOpen, updatePosition]);

  const handleToggle = () => {
    if (!isOpen) computeInitialPosition();
    setIsOpen((prev) => !prev);
  };

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recompute on scroll/resize while open
  useEffect(() => {
    if (!isOpen) return;
    const handleScroll = (e: Event) => {
      // Ignore scroll events originating inside the dropdown container
      if (dropdownRef.current && dropdownRef.current.contains(e.target as Node)) {
        return;
      }
      updatePosition();
    };
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, updatePosition]);

  const handleSelectHour = (h: string) => {
    onChange(`${h}:${selectedMinute}`);
  };

  const handleSelectMinute = (m: string) => {
    onChange(`${selectedHour}:${m}`);
    setIsOpen(false);
  };

  const formatDisplay12H = (timeStr: string) => {
    if (!timeStr || !timeStr.includes(':')) return placeholder;
    const [hStr, mStr] = timeStr.split(':');
    let h = parseInt(hStr, 10);
    if (isNaN(h)) return placeholder;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${String(h).padStart(2, '0')}:${mStr} ${ampm}`;
  };

  const dropdown = isOpen ? (
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="bg-[var(--theme-card-bg,#ffffff)] dark:bg-slate-900 border border-[var(--theme-border-color,#e2e8f0)] dark:border-slate-800 rounded-2xl shadow-xl p-3 text-[var(--theme-p-color,#1e293b)]"
    >
      <div className="text-xs font-bold text-[var(--theme-p-color,#94a3b8)] opacity-70 uppercase tracking-wider mb-2 px-1">
        Select Time
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Hours list */}
        <div>
          <span className="block text-[11px] font-semibold text-[var(--theme-p-color,#64748b)] dark:text-slate-400 mb-1 px-1">Hours</span>
          <div
            className="overflow-y-auto space-y-1 pr-1 border-r border-[var(--theme-border-color,#e2e8f0)] dark:border-slate-800"
            style={{ maxHeight: listMaxHeight }}
          >
            {HOURS.map((h) => {
              const hourNum = parseInt(h, 10);
              const display12 = hourNum % 12 === 0 ? 12 : hourNum % 12;
              const ampm = hourNum >= 12 ? 'PM' : 'AM';
              const isSelected = selectedHour === h;

              // Check minTime and maxTime bounds
              let disabled = false;
              if (minTime) {
                const minHour = parseInt(minTime.split(':')[0] || '0', 10);
                if (hourNum < minHour) disabled = true;
              }
              if (maxTime) {
                const maxHour = parseInt(maxTime.split(':')[0] || '23', 10);
                if (hourNum > maxHour) disabled = true;
              }

              return (
                <button
                  key={h}
                  type="button"
                  disabled={disabled}
                  onClick={() => !disabled && handleSelectHour(h)}
                  style={
                    disabled
                      ? { opacity: 0.35, cursor: 'not-allowed' }
                      : isSelected
                      ? {
                          backgroundColor: "var(--theme-button-bg, var(--theme-primary, #059669))",
                          color: "var(--theme-button-text, #ffffff)",
                        }
                      : undefined
                  }
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-mono transition flex items-center justify-between ${
                    disabled
                      ? 'line-through text-slate-400 dark:text-slate-600'
                      : isSelected
                      ? 'font-bold'
                      : 'text-[var(--theme-p-color,currentColor)] dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{String(display12).padStart(2, '0')}</span>
                  <span className="text-[10px] opacity-75 font-sans uppercase">{ampm}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Minutes list */}
        <div>
          <span className="block text-[11px] font-semibold text-[var(--theme-p-color,#64748b)] dark:text-slate-400 mb-1 px-1">Minutes</span>
          <div
            className="overflow-y-auto space-y-1"
            style={{ maxHeight: listMaxHeight }}
          >
            {MINUTES.map((m) => {
              const isSelected = selectedMinute === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleSelectMinute(m)}
                  style={
                    isSelected
                      ? {
                          backgroundColor: "var(--theme-button-bg, var(--theme-primary, #059669))",
                          color: "var(--theme-button-text, #ffffff)",
                        }
                      : undefined
                  }
                  className={`w-full text-center px-2 py-1.5 rounded-lg text-xs font-mono transition ${
                    isSelected
                      ? 'font-bold'
                      : 'text-[var(--theme-p-color,currentColor)] dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  :{m}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className={`relative inline-block w-full ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="w-full h-10 flex items-center justify-between px-3 border border-[var(--theme-border-color,#e2e8f0)] dark:border-slate-700 bg-[var(--theme-card-bg,#ffffff)] dark:bg-slate-800/80 text-[var(--theme-p-color,currentColor)] dark:text-slate-100 rounded-lg text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[var(--theme-primary,#059669)] focus:outline-none transition shadow-sm font-mono"
      >
        <span className={!value ? 'text-slate-400 dark:text-slate-500 font-sans' : ''}>
          {formatDisplay12H(value || `${selectedHour}:${selectedMinute}`)}
        </span>
        <Clock className="w-4 h-4 text-[var(--theme-primary,#059669)] shrink-0 ml-2" />
      </button>

      {typeof window !== 'undefined' && createPortal(dropdown, document.body)}
    </div>
  );
}
