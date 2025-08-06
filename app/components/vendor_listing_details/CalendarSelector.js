import React, { useState, useRef, useEffect } from 'react';
import styles from './CalendarSelector.module.css';

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const YEARS = Array.from({ length: 31 }, (_, i) => 2015 + i); // 2015-2045

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarSelector({ value, onChange }) {
  const [currentMonth, setCurrentMonth] = useState(value ? value.getMonth() : new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(value ? value.getFullYear() : new Date().getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const monthPickerRef = useRef();
  const yearPickerRef = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (showMonthPicker && monthPickerRef.current && !monthPickerRef.current.contains(e.target)) {
        setShowMonthPicker(false);
      }
      if (showYearPicker && yearPickerRef.current && !yearPickerRef.current.contains(e.target)) {
        setShowYearPicker(false);
      }
    }
    if (showMonthPicker || showYearPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMonthPicker, showYearPicker]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);

  // Build the calendar grid with neighboring days
  const calendarRows = [];
  let day = 1;
  let nextMonthDay = 1;
  for (let week = 0; week < 6; week++) {
    const row = [];
    for (let d = 0; d < 7; d++) {
      const cellIndex = week * 7 + d;
      if (cellIndex < firstDayOfWeek) {
        // Previous month
        const prevDate = new Date(prevMonthYear, prevMonth, daysInPrevMonth - (firstDayOfWeek - cellIndex - 1));
        row.push({ date: prevDate, inactive: true, isPrev: true });
      } else if (day > daysInMonth) {
        // Next month
        const nextDate = new Date(nextMonthYear, nextMonth, nextMonthDay++);
        row.push({ date: nextDate, inactive: true, isNext: true });
      } else {
        // Current month
        row.push({ date: new Date(currentYear, currentMonth, day++), inactive: false });
      }
    }
    calendarRows.push(row);
  }

  // Remove last row if all cells are inactive (to avoid empty space)
  let rowsToRender = [...calendarRows];
  while (rowsToRender.length > 0 && rowsToRender[rowsToRender.length - 1].every(cell => cell.inactive)) {
    rowsToRender.pop();
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isSameDay = (d1, d2) =>
    d1 && d2 &&
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const handleMonthClick = () => {
    setShowMonthPicker((v) => !v);
    setShowYearPicker(false);
  };
  const handleYearClick = () => {
    setShowYearPicker((v) => !v);
    setShowMonthPicker(false);
  };
  const handleMonthSelect = (idx) => {
    setCurrentMonth(idx);
    setShowMonthPicker(false);
  };
  const handleYearSelect = (yr) => {
    setCurrentYear(yr);
    setShowYearPicker(false);
  };

  // Click on inactive day: jump to prev/next month and select that date
  const handleInactiveClick = (cell) => {
    if (cell.isPrev) {
      setCurrentMonth(prevMonth);
      setCurrentYear(prevMonthYear);
      onChange(cell.date);
    } else if (cell.isNext) {
      setCurrentMonth(nextMonth);
      setCurrentYear(nextMonthYear);
      onChange(cell.date);
    }
  };

  return (
    <div className={styles.calendarContainer}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.navArrow} onClick={handlePrevMonth} aria-label="Previous Month">&#8249;</button>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
          <span className={styles.monthLabel} onClick={handleMonthClick}>{MONTHS[currentMonth]}</span>
          <span className={styles.yearLabel} onClick={handleYearClick}>{currentYear}</span>
          {showMonthPicker && (
            <div className={styles.pickerPopup} ref={monthPickerRef} style={{ left: '0', transform: 'none', minWidth: 120, top: 22 }}>
              {MONTHS.map((m, i) => (
                <button
                  key={m}
                  className={styles.pickerOption + (i === currentMonth ? ' ' + styles.selected : '')}
                  onClick={() => handleMonthSelect(i)}
                  type="button"
                >
                  {m}
                </button>
              ))}
            </div>
          )}
          {showYearPicker && (
            <div className={styles.pickerPopup} ref={yearPickerRef} style={{ left: '60px', transform: 'none', minWidth: 80, top: 22 }}>
              {YEARS.map((y) => (
                <button
                  key={y}
                  className={styles.pickerOption + (y === currentYear ? ' ' + styles.selected : '')}
                  onClick={() => handleYearSelect(y)}
                  type="button"
                >
                  {y}
                </button>
              ))}
            </div>
          )}
        </span>
        <button className={styles.navArrow} onClick={handleNextMonth} aria-label="Next Month">&#8250;</button>
      </div>
      {/* Weekdays */}
      <div className={styles.weekdays}>
        {WEEKDAYS.map((wd) => (
          <div key={wd} className={styles.weekday}>{wd}</div>
        ))}
      </div>
      {/* Dates Grid */}
      <div className={styles.datesGrid}>
        {rowsToRender.map((row, i) => (
          <div className={styles.datesRow} key={i}>
            {row.map((cell, j) =>
              cell.inactive ? (
                <button
                  key={j}
                  className={styles.dateCell + ' ' + styles.dateCellInactive}
                  onClick={() => handleInactiveClick(cell)}
                  type="button"
                >
                  <span className={styles.dateCellText}>{cell.date.getDate()}</span>
                </button>
              ) : (
                <button
                  key={j}
                  className={
                    isSameDay(cell.date, value)
                      ? styles.dateCell + ' ' + styles.dateCellActive
                      : styles.dateCell
                  }
                  onClick={() => onChange(cell.date)}
                  type="button"
                >
                  <span className={styles.dateCellText}>{cell.date.getDate()}</span>
                </button>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 