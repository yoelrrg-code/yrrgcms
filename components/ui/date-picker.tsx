'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  allowWeekends?: boolean;
  countryHolidays?: string[];
  customDisabledDates?: string[];
  allowPastDates?: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS_OF_WEEK = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const CALENDAR_WIDTH = 288; // w-72
const GAP = 4; // px between trigger and dropdown

export default function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  className = '',
  allowWeekends = true,
  customDisabledDates = [],
  allowPastDates = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({ visibility: 'hidden' });
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isDateDisabled = useCallback((year: number, month: number, day: number) => {
    const dateObj = new Date(year, month, day, 0, 0, 0, 0);
    
    // Check if date is in the past
    if (!allowPastDates) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dateObj < today) {
        return true;
      }
    }

    const dayOfWeek = dateObj.getDay(); // 0: Sun, 6: Sat
    if (!allowWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
      return true;
    }
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
    if (customDisabledDates.includes(dateStr)) {
      return true;
    }
    return false;
  }, [allowWeekends, customDisabledDates, allowPastDates]);

  const parsedDate = value ? new Date(`${value}T00:00:00`) : new Date();
  const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

  const [currentYear, setCurrentYear] = useState(validDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(validDate.getMonth());

  // Synchronize state during render when prop changes
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    if (value) {
      const d = new Date(`${value}T00:00:00`);
      if (!isNaN(d.getTime())) {
        setCurrentYear(d.getFullYear());
        setCurrentMonth(d.getMonth());
      }
    }
  }

  // Step 1: set horizontal position and hide dropdown before measuring
  const computeInitialPosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const MARGIN = 28;

    let left = rect.left;
    if (left + CALENDAR_WIDTH > viewportWidth - MARGIN) {
      left = viewportWidth - CALENDAR_WIDTH - MARGIN;
    }
    if (left < MARGIN) left = MARGIN;

    const width = Math.min(CALENDAR_WIDTH, viewportWidth - MARGIN * 2);

    setDropdownStyle({
      position: 'fixed',
      top: rect.bottom + GAP,
      left,
      width,
      zIndex: 9999,
      visibility: 'hidden',
    });
  }, []);

  // Step 2: after dropdown renders, measure actual height and reposition flush to trigger
  useEffect(() => {
    if (!isOpen || !dropdownRef.current || !containerRef.current) return;

    const triggerRect = containerRef.current.getBoundingClientRect();
    const dropdownHeight = dropdownRef.current.offsetHeight;
    const viewportHeight = window.innerHeight;
    const MARGIN = 8;

    const spaceBelow = viewportHeight - triggerRect.bottom - MARGIN;
    const spaceAbove = triggerRect.top - MARGIN;
    const openAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    const top = openAbove
      ? Math.max(MARGIN, triggerRect.top - dropdownHeight - GAP)
      : triggerRect.bottom + GAP;

    setDropdownStyle((prev) => ({ ...prev, top, visibility: 'visible' }));
  }, [isOpen]);

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
    const update = () => {
      computeInitialPosition();
      setDropdownStyle((prev) => ({ ...prev }));
    };
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isOpen, computeInitialPosition]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
  };

  const handleSelectDay = (dayNumber: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(dayNumber).padStart(2, '0');
    onChange(`${currentYear}-${formattedMonth}-${formattedDay}`);
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    const today = new Date();
    const formattedMonth = String(today.getMonth() + 1).padStart(2, '0');
    const formattedDay = String(today.getDate()).padStart(2, '0');
    onChange(`${today.getFullYear()}-${formattedMonth}-${formattedDay}`);
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setIsOpen(false);
  };

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  let startDayIndex = firstDayOfMonth.getDay() - 1;
  if (startDayIndex === -1) startDayIndex = 6;

  const selectedDayNum =
    value && validDate.getFullYear() === currentYear && validDate.getMonth() === currentMonth
      ? validDate.getDate()
      : null;

  const today = new Date();
  const isTodayCurrentView = today.getFullYear() === currentYear && today.getMonth() === currentMonth;
  const todayDayNum = isTodayCurrentView ? today.getDate() : null;

  const formattedDisplay = value
    ? validDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : placeholder;

  const dropdown = isOpen ? (
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="bg-[var(--theme-card-bg,#ffffff)] dark:bg-slate-900 border border-[var(--theme-border-color,#e2e8f0)] dark:border-slate-800 rounded-2xl shadow-xl p-4 text-[var(--theme-p-color,#1e293b)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={handlePrevMonth} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--theme-p-color,currentColor)] dark:text-slate-300 transition">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-bold text-[var(--theme-h3-color,currentColor)] dark:text-slate-100">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </span>
        <button type="button" onClick={handleNextMonth} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--theme-p-color,currentColor)] dark:text-slate-300 transition">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {DAYS_OF_WEEK.map((d) => (
          <span key={d} className="text-xs font-semibold text-[var(--theme-p-color,#94a3b8)] opacity-70 py-1">{d}</span>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {Array.from({ length: startDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="h-8" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const isSelected = selectedDayNum === dayNum;
          const isToday = todayDayNum === dayNum;
          const disabled = isDateDisabled(currentYear, currentMonth, dayNum);
          return (
            <button
              key={dayNum}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && handleSelectDay(dayNum)}
              style={
                disabled
                  ? { opacity: 0.35, cursor: 'not-allowed' }
                  : isSelected
                  ? {
                      backgroundColor: "var(--theme-button-bg, var(--theme-primary, #059669))",
                      color: "var(--theme-button-text, #ffffff)",
                    }
                  : isToday
                  ? {
                      borderColor: "var(--theme-primary, #059669)",
                      color: "var(--theme-primary, #059669)",
                      backgroundColor: "color-mix(in srgb, var(--theme-primary, #059669) 10%, transparent)",
                    }
                  : undefined
              }
              className={`h-8 w-full rounded-lg text-xs font-medium flex items-center justify-center transition ${
                disabled
                  ? 'line-through text-slate-400 dark:text-slate-600'
                  : isSelected
                  ? 'font-bold shadow'
                  : isToday
                  ? 'border font-bold'
                  : 'text-[var(--theme-p-color,currentColor)] dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {dayNum}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-[var(--theme-border-color,#e2e8f0)] dark:border-slate-800 flex justify-end">
        <button type="button" onClick={handleSelectToday} className="text-xs font-semibold text-[var(--theme-primary,#059669)] hover:underline">
          Today
        </button>
      </div>
    </div>
  ) : null;

  return (
    <div className={`relative inline-block w-full ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="w-full h-10 flex items-center justify-between px-3 border border-[var(--theme-border-color,#e2e8f0)] dark:border-slate-700 bg-[var(--theme-card-bg,#ffffff)] dark:bg-slate-800/80 text-[var(--theme-p-color,currentColor)] dark:text-slate-100 rounded-lg text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[var(--theme-primary,#059669)] focus:outline-none transition shadow-sm"
      >
        <span className={!value ? 'text-slate-400 dark:text-slate-500' : ''}>{formattedDisplay}</span>
        <CalendarIcon className="w-4 h-4 text-[var(--theme-primary,#059669)] shrink-0 ml-2" />
      </button>

      {typeof window !== 'undefined' && createPortal(dropdown, document.body)}
    </div>
  );
}
