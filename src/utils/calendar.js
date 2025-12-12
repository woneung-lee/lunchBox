import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO
} from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 캘린더에 표시할 날짜 배열 생성
 * @param {Date} currentDate - 현재 표시 중인 월의 날짜
 * @returns {Date[]} 6주(42일)의 날짜 배열
 */
export const getCalendarDates = (currentDate) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const dates = [];
  let currentDay = calendarStart;

  while (currentDay <= calendarEnd) {
    dates.push(currentDay);
    currentDay = addDays(currentDay, 1);
  }

  return dates;
};

/**
 * 다음 달로 이동
 * @param {Date} currentDate
 * @returns {Date}
 */
export const getNextMonth = (currentDate) => {
  return addMonths(currentDate, 1);
};

/**
 * 이전 달로 이동
 * @param {Date} currentDate
 * @returns {Date}
 */
export const getPreviousMonth = (currentDate) => {
  return subMonths(currentDate, 1);
};

/**
 * 날짜를 YYYY-MM-DD 형식으로 변환
 * @param {Date} date
 * @returns {string}
 */
export const formatDateKey = (date) => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * YYYY-MM-DD 형식 문자열을 Date 객체로 변환
 * @param {string} dateStr
 * @returns {Date}
 */
export const parseDateKey = (dateStr) => {
  return parseISO(dateStr);
};

/**
 * 날짜 비교 유틸리티
 */
export const dateUtils = {
  isSameMonth,
  isSameDay,
  isToday,
  format: (date, formatStr) => format(date, formatStr, { locale: ko })
};

/**
 * 요일 배열
 */
export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * 주말 확인
 * @param {Date} date
 * @returns {boolean}
 */
export const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

/**
 * 날짜 범위 생성
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {string[]} YYYY-MM-DD 형식의 날짜 배열
 */
export const getDateRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = startDate;

  while (currentDate <= endDate) {
    dates.push(formatDateKey(currentDate));
    currentDate = addDays(currentDate, 1);
  }

  return dates;
};
