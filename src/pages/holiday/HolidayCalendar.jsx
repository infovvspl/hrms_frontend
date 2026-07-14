import { useEffect, useState, useRef } from "react";
import {
  FaTimes,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaArrowLeft,
  FaEye,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import axios from "axios";

const API = "http://localhost:5000/api/holiday";

export default function HolidayCalendar() {
  const [holidays, setHolidays] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewHoliday, setViewHoliday] = useState(null);
  const [editId, setEditId] = useState(null);

  // Unified date state for all calendar views
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month"); // "week" | "month" | "year"

  const [formData, setFormData] = useState({
    name: "",
    from_date: "",
    to_date: "",
    is_optional: false,
  });

  const token = localStorage.getItem("token");

  // ================= FETCH HOLIDAYS =================
  const fetchHolidays = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(API, { headers });
      setHolidays(res.data.holidays || []);
    } catch (error) {
      console.error("fetchHolidays error:", error);
      setHolidays([]);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, [token]);

  // ================= RESET FORM =================
  const resetForm = () => {
    setFormData({
      name: "",
      from_date: "",
      to_date: "",
      is_optional: false,
    });
    setEditId(null);
  };

  // ================= SAVE (CREATE / UPDATE) =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.from_date || !formData.to_date) {
      alert("Please fill all required fields.");
      return;
    }

    if (new Date(formData.to_date) < new Date(formData.from_date)) {
      alert("End date cannot be before start date.");
      return;
    }

    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      let res;
      if (editId) {
        res = await axios.put(`${API}/${editId}`, formData, config);
      } else {
        res = await axios.post(API, formData, config);
      }

      if (res.status === 200 || res.status === 201) {
        await fetchHolidays();
        resetForm();
        setShowModal(false);
      } else {
        alert("Failed to save holiday.");
      }
    } catch (error) {
      console.error("handleSubmit error:", error);
      alert(error.response?.data?.message || "Failed to save holiday.");
    }
  };

  // ================= EDIT =================
  const handleEdit = (holiday) => {
    const fromDateObj = new Date(holiday.from_date);
    const toDateObj = new Date(holiday.to_date);

    const pad = (n) => String(n).padStart(2, "0");
    const from_date = `${fromDateObj.getFullYear()}-${pad(fromDateObj.getMonth() + 1)}-${pad(fromDateObj.getDate())}`;
    const to_date = `${toDateObj.getFullYear()}-${pad(toDateObj.getMonth() + 1)}-${pad(toDateObj.getDate())}`;

    setFormData({
      name: holiday.name,
      from_date,
      to_date,
      is_optional: !!holiday.is_optional,
    });
    setEditId(holiday.id);
    setViewHoliday(null); // close details modal
    setShowModal(true);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this holiday?")) return;

    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.delete(`${API}/${id}`, config);
      setViewHoliday(null); // close details modal
      fetchHolidays();
    } catch (error) {
      console.error("handleDelete error:", error);
      alert(error.response?.data?.message || "Failed to delete holiday.");
    }
  };

  // ================= DATE HELPERS =================
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const getDuration = (fromStr, toStr) => {
    if (!fromStr || !toStr) return 0;
    const from = new Date(fromStr);
    const to = new Date(toStr);
    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);
    const diff = to.getTime() - from.getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const getHolidaysForDay = (year, month, day) => {
    const target = new Date(year, month, day);
    target.setHours(0, 0, 0, 0);

    return holidays.filter((h) => {
      const start = new Date(h.from_date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(h.to_date);
      end.setHours(0, 0, 0, 0);
      return target >= start && target <= end;
    });
  };

  // Pre-fill date when clicking a day on the calendar
  const handleDayClick = (year, month, day) => {
    resetForm();
    const pad = (n) => String(n).padStart(2, "0");
    const clickedDate = `${year}-${pad(month + 1)}-${pad(day)}`;
    setFormData({
      name: "",
      from_date: clickedDate,
      to_date: clickedDate,
      is_optional: false,
    });
    setShowModal(true);
  };

  // ================= NAVIGATION HANDLERS =================
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (currentView === "month") {
      d.setMonth(d.getMonth() - 1);
    } else if (currentView === "week") {
      d.setDate(d.getDate() - 7);
    } else if (currentView === "year") {
      d.setFullYear(d.getFullYear() - 1);
    }
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (currentView === "month") {
      d.setMonth(d.getMonth() + 1);
    } else if (currentView === "week") {
      d.setDate(d.getDate() + 7);
    } else if (currentView === "year") {
      d.setFullYear(d.getFullYear() + 1);
    }
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    const d = new Date(currentDate);
    d.setFullYear(newYear);
    setCurrentDate(d);
  };

  // ================= VIEW LABEL HELPER =================
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getHeaderLabel = () => {
    if (currentView === "month") {
      return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (currentView === "year") {
      return `${currentDate.getFullYear()}`;
    } else {
      // Week View Label
      const start = getStartOfWeek(currentDate);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      const startMonth = start.toLocaleDateString("en-US", { month: "short" });
      const endMonth = end.toLocaleDateString("en-US", { month: "short" });

      if (start.getFullYear() !== end.getFullYear()) {
        return `${startMonth} ${start.getDate()}, ${start.getFullYear()} - ${endMonth} ${end.getDate()}, ${end.getFullYear()}`;
      }
      if (start.getMonth() !== end.getMonth()) {
        return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${start.getFullYear()}`;
      }
      return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
    }
  };

  // ================= WEEK VIEW HELPERS =================
  const getStartOfWeek = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day; // adjust when day is sunday
    return new Date(date.setDate(diff));
  };

  const getWeekDays = () => {
    const start = getStartOfWeek(currentDate);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  };

  // ================= MONTH VIEW HELPERS =================
  const generateMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        month: month === 0 ? 11 : month - 1,
        year: month === 0 ? year - 1 : year,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month: month,
        year: year,
        isCurrentMonth: true,
      });
    }

    // Next month padding to fulfill 42 days grid
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        month: month === 11 ? 0 : month + 1,
        year: month === 11 ? year + 1 : year,
        isCurrentMonth: false,
      });
    }

    return days;
  };

  // ================= YEAR VIEW HELPERS =================
  const generateMiniMonthDays = (year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const days = [];

    // Prev month padding empty
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 pt-2 px-6 pb-6 max-w-7xl mx-auto space-y-4">

        {/* ================= COMPACT NAVIGATION HEADER ================= */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              to="/holiday"
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all shadow-sm flex items-center justify-center"
              title="Back to Holiday Directory"
            >
              <FaArrowLeft size={14} />
            </Link>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              {getHeaderLabel()}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Prev Today Next buttons */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-sm">
              <button
                onClick={handlePrev}
                className="p-2 text-slate-600 hover:bg-white hover:text-slate-800 rounded-lg transition-all"
              >
                <FaChevronLeft size={11} />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-white hover:text-slate-800 rounded-lg transition-all"
              >
                Today
              </button>
              <button
                onClick={handleNext}
                className="p-2 text-slate-600 hover:bg-white hover:text-slate-800 rounded-lg transition-all"
              >
                <FaChevronRight size={11} />
              </button>
            </div>

            {/* Year Selector Dropdown - Showing All Years from 2015 to 2035 */}
            <select
              value={currentDate.getFullYear()}
              onChange={handleYearChange}
              className="bg-white text-slate-800 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm cursor-pointer"
            >
              {Array.from({ length: 21 }, (_, i) => 2015 + i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            {/* View Selector Dropdown */}
            <select
              value={currentView}
              onChange={(e) => setCurrentView(e.target.value)}
              className="bg-white text-slate-800 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm cursor-pointer"
            >
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>
        </div>

        {/* ================= CALENDAR VIEWS CONTAINER ================= */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">

          {/* ================= 1. WEEK VIEW ================= */}
          {currentView === "week" && (
            <div className="space-y-4">
              {/* Columns Header */}
              <div className="grid grid-cols-8 gap-2 text-center border-b border-slate-100 pb-3">
                <div className="text-xs font-bold text-slate-400 self-center">GMT+00</div>
                {getWeekDays().map((day, idx) => {
                  const isToday =
                    day.getDate() === new Date().getDate() &&
                    day.getMonth() === new Date().getMonth() &&
                    day.getFullYear() === new Date().getFullYear();
                  const isSunday = day.getDay() === 0;

                  return (
                    <div key={idx} className="space-y-1">
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${isSunday ? "text-red-500" : "text-slate-400"}`}>
                        {day.toLocaleDateString("en-US", { weekday: "short" })}
                      </p>
                      <div className="flex justify-center">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${isToday ? "bg-indigo-600 text-white shadow-sm" : isSunday ? "text-red-500" : "text-slate-800"
                          }`}>
                          {day.getDate()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* All Day / Holidays Row */}
              <div className="grid grid-cols-8 gap-2 border-b border-slate-200 pb-2 bg-slate-50/50 p-2 rounded-xl">
                <div className="text-[10px] font-bold text-indigo-600 self-center uppercase tracking-wider pl-2">Holidays</div>
                {getWeekDays().map((day, idx) => {
                  const dayHolidays = getHolidaysForDay(day.getFullYear(), day.getMonth(), day.getDate());
                  return (
                    <div
                      key={idx}
                      onClick={() => handleDayClick(day.getFullYear(), day.getMonth(), day.getDate())}
                      className="min-h-[48px] flex flex-col gap-1 cursor-pointer hover:bg-slate-200/40 p-1.5 rounded-lg transition-all"
                    >
                      {dayHolidays.map((h, hIdx) => (
                        <div
                          key={hIdx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewHoliday(h);
                          }}
                          className={`text-[10px] font-bold py-1 px-2 rounded-r-md truncate shadow-sm cursor-pointer transition-all ${h.is_optional
                              ? "bg-purple-50 hover:bg-purple-100 text-purple-800 border-l-[3px] border-purple-600"
                              : "bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-l-[3px] border-indigo-600"
                            }`}
                          title={h.is_optional ? `${h.name} (Optional)` : h.name}>
                          <div className="flex flex-col items-start w-full">
                            {h.is_optional && (
                              <span className="text-[7px] leading-none font-extrabold bg-purple-100 border border-purple-200 text-purple-800 px-1 py-0.5 rounded mb-0.5 uppercase tracking-wider">
                                Optional
                              </span>
                            )}
                            <span className="truncate w-full">{h.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* Time grid */}
              <div className="h-[460px] overflow-y-auto border border-slate-200 rounded-2xl bg-white pr-1">
                {Array.from({ length: 24 }).map((_, hourIdx) => {
                  const formatHour = (h) => {
                    const ampm = h >= 12 ? "PM" : "AM";
                    const displayHour = h % 12 === 0 ? 12 : h % 12;
                    return `${displayHour} ${ampm}`;
                  };

                  return (
                    <div key={hourIdx} className="grid grid-cols-8 border-b border-slate-100 min-h-[50px]">
                      {/* Hour Axis */}
                      <div className="text-[10px] font-semibold text-slate-400 flex items-center justify-center border-r border-slate-100 bg-slate-50/50 pr-2">
                        {formatHour(hourIdx)}
                      </div>

                      {/* Day Columns */}
                      {getWeekDays().map((day, colIdx) => {
                        const isSunday = day.getDay() === 0;
                        const dayHolidays = getHolidaysForDay(day.getFullYear(), day.getMonth(), day.getDate());
                        const hasHoliday = dayHolidays.length > 0;

                        return (
                          <div
                            key={colIdx}
                            onClick={() => handleDayClick(day.getFullYear(), day.getMonth(), day.getDate())}
                            className={`border-r border-slate-100 last:border-r-0 hover:bg-indigo-50/30 transition-colors cursor-pointer relative ${isSunday ? "bg-red-50/10" : ""
                              } ${hasHoliday ? (dayHolidays[0].is_optional ? "bg-purple-50/20" : "bg-indigo-50/20") : ""}`}
                          >
                            {/* If holiday, tint the column box */}
                            {hasHoliday && hourIdx === 9 && (
                              <div className={`absolute inset-x-1 top-1 py-1 px-2 text-[9px] font-bold rounded-r-md shadow-sm pointer-events-none flex flex-col items-start ${dayHolidays[0].is_optional
                                  ? "bg-purple-50 text-purple-800 border-l-[3px] border-purple-600"
                                  : "bg-indigo-50 text-indigo-800 border-l-[3px] border-indigo-600"
                                }`}>
                                {dayHolidays[0].is_optional && (
                                  <span className="text-[7px] leading-none font-extrabold bg-purple-100 border border-purple-200 text-purple-800 px-1 py-0.5 rounded mb-0.5 uppercase tracking-wider">
                                    Optional
                                  </span>
                                )}
                                <span className="truncate w-full">{dayHolidays[0].name}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= 2. MONTH VIEW ================= */}
          {currentView === "month" && (
            <div className="space-y-4">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-3 text-center text-xs font-black uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-100">
                <div className="text-red-500">Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-3">
                {generateMonthDays().map((dayItem, index) => {
                  const dayHolidays = getHolidaysForDay(dayItem.year, dayItem.month, dayItem.day);
                  const isToday =
                    dayItem.day === new Date().getDate() &&
                    dayItem.month === new Date().getMonth() &&
                    dayItem.year === new Date().getFullYear();
                  const isSunday = index % 7 === 0;

                  return (
                    <div
                      key={index}
                      onClick={() => handleDayClick(dayItem.year, dayItem.month, dayItem.day)}
                      className={`min-h-[110px] p-2.5 rounded-2xl border transition-all flex flex-col justify-between hover:bg-slate-50 hover:border-indigo-400 cursor-pointer ${!dayItem.isCurrentMonth
                          ? "bg-slate-50/40 text-slate-300 border-slate-100"
                          : isToday
                            ? "bg-indigo-50/40 border-indigo-400 text-indigo-700 font-bold ring-2 ring-indigo-400/10"
                            : isSunday
                              ? "bg-red-50/30 border-slate-200 text-slate-700"
                              : "bg-white border-slate-200 text-slate-700"
                        }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${isToday
                            ? "bg-indigo-600 text-white shadow-sm"
                            : isSunday
                              ? "text-red-500 font-bold"
                              : "text-slate-800"
                          }`}>
                          {dayItem.day}
                        </span>
                        {!dayItem.isCurrentMonth && (
                          <span className="text-[9px] text-slate-300 uppercase font-bold">
                            {months[dayItem.month].substring(0, 3)}
                          </span>
                        )}
                      </div>

                      {/* Holiday labels inside day cells - Styled in Google Calendar Event soft-pills */}
                      <div className="mt-2 space-y-1.5 flex-1 flex flex-col justify-end">
                        {dayHolidays.map((h, idx) => (
                          <div
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewHoliday(h);
                            }}
                            className={`text-[10px] font-bold rounded-r-md py-1 px-2.5 truncate shadow-sm transition-all flex items-center justify-between cursor-pointer ${h.is_optional
                                ? "bg-purple-50 hover:bg-purple-100 text-purple-800 border-l-[3px] border-purple-600"
                                : "bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-l-[3px] border-indigo-600"
                              }`}

                            title={h.is_optional ? `${h.name} (Optional)` : h.name}
                          >
                            <div className="flex flex-col items-start w-full">
                              {h.is_optional && (
                                <span className="text-[7px] leading-none font-bold bg-purple-100 border border-purple-200 text-purple-800 px-1 py-0.5 rounded mb-0.5 uppercase tracking-wider">
                                  Optional
                                </span>
                              )}
                              <span className="truncate w-full">{h.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= 3. YEAR VIEW ================= */}
          {currentView === "year" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {months.map((monthName, monthIdx) => {
                const miniDays = generateMiniMonthDays(currentDate.getFullYear(), monthIdx);
                return (
                  <div key={monthIdx} className="bg-slate-50/40 border border-slate-200 p-4 rounded-2xl shadow-sm">
                    <h3 className="font-bold text-slate-800 text-sm mb-2 pl-1">{monthName}</h3>

                    {/* Week headers */}
                    <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-black uppercase text-slate-400 pb-1 border-b border-slate-100">
                      <div className="text-red-500">S</div>
                      <div>M</div>
                      <div>T</div>
                      <div>W</div>
                      <div>T</div>
                      <div>F</div>
                      <div>S</div>
                    </div>

                    {/* Mini grid */}
                    <div className="grid grid-cols-7 gap-1 mt-1 text-center text-[10px]">
                      {miniDays.map((day, idx) => {
                        if (day === null) {
                          return <div key={idx} />;
                        }

                        const dayHolidays = getHolidaysForDay(currentDate.getFullYear(), monthIdx, day);
                        const hasHoliday = dayHolidays.length > 0;
                        const isSunday = idx % 7 === 0;

                        return (
                          <div
                            key={idx}
                            onClick={() => handleDayClick(currentDate.getFullYear(), monthIdx, day)}
                            className="h-6 flex items-center justify-center cursor-pointer rounded-full hover:bg-slate-200 transition-colors"
                          >
                            {hasHoliday ? (
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewHoliday(dayHolidays[0]);
                                }}
                                className={`w-5 h-5 text-white font-extrabold flex items-center justify-center rounded-full text-[9px] shadow-sm ${dayHolidays[0].is_optional ? "bg-purple-600" : "bg-indigo-600"
                                  }`}
                                title={dayHolidays.map(h => h.name).join(", ")}
                              >
                                {day}
                              </span>
                            ) : (
                              <span className={isSunday ? "text-red-500 font-bold" : "text-slate-600"}>
                                {day}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* ===== ADD / EDIT MODAL ===== */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
              <div className="bg-gradient-to-r from-[#08112d] via-[#1a1d5f] to-[#08112d] p-6 flex justify-between items-center">
                <h2 className="text-white text-2xl font-bold">
                  {editId ? "Edit Corporate Holiday" : "Add Corporate Holiday"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Holiday Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Independence Day"
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.from_date}
                      onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">End Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.to_date}
                      onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Optional Holiday</label>
                    <span className="text-[10px] text-slate-500">Allow employees to opt-in or mark as optional</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_optional || false}
                      onChange={(e) => setFormData({ ...formData, is_optional: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-[#0b163d] to-[#20287d] hover:scale-105 duration-300 text-white font-semibold py-3 rounded-xl transition-all shadow-md"
                  >
                    Save Holiday
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===== VIEW DETAILS MODAL ===== */}
        {viewHoliday && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
              <div className="bg-gradient-to-r from-[#08112d] via-[#1a1d5f] to-[#08112d] p-6 flex justify-between items-center">
                <h2 className="text-white text-xl font-bold">Holiday Details</h2>
                <button
                  onClick={() => setViewHoliday(null)}
                  className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-indigo-200 flex flex-col items-center justify-center overflow-hidden shrink-0">
                    <div className="w-full bg-indigo-600 text-white text-[9px] font-black text-center py-0.5 uppercase tracking-wide">
                      {new Date(viewHoliday.from_date).toLocaleDateString("en-US", { month: "short" }).toUpperCase()}
                    </div>
                    <div className="text-slate-800 text-sm font-black py-0.5">
                      {new Date(viewHoliday.from_date).getDate()}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{viewHoliday.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">Corporate Holiday Event</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Start Date</p>
                    <p className="text-sm font-bold text-slate-700 mt-1">{formatDate(viewHoliday.from_date)}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">End Date</p>
                    <p className="text-sm font-bold text-slate-700 mt-1">{formatDate(viewHoliday.to_date)}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                  <span className="text-sm text-slate-600 font-medium">Holiday Type</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${viewHoliday.is_optional ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                    {viewHoliday.is_optional ? "Optional" : "Mandatory"}
                  </span>
                </div>

                <div className="bg-indigo-50/30 p-4 rounded-2xl flex justify-between items-center border border-indigo-50">
                  <span className="text-sm text-slate-600 font-medium">Total Duration</span>
                  <span className="bg-gradient-to-r from-[#0b163d] to-[#20287d] text-white font-bold px-4 py-1.5 rounded-full text-sm shadow-sm">
                    {getDuration(viewHoliday.from_date, viewHoliday.to_date)}{" "}
                    {getDuration(viewHoliday.from_date, viewHoliday.to_date) === 1 ? "day" : "days"}
                  </span>
                </div>

                {/* Edit / Delete actions directly inside details modal since header actions were removed */}
                <div className="flex gap-3 border-t border-slate-100 pt-4 mt-6">
                  <button
                    onClick={() => handleEdit(viewHoliday)}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
                  >
                    <FaEdit size={12} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(viewHoliday.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
                  >
                    <FaTrash size={12} />
                    Delete
                  </button>
                </div>

                <button
                  onClick={() => setViewHoliday(null)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
