"use client";

import { useState } from "react";

interface TimeSlot {
    time: string;
    available: boolean;
    remaining?: number;
}

interface TimeSlotPickerProps {
    selectedDate: string;
    onDateChange: (date: string) => void;
    selectedTime: string;
    onTimeChange: (time: string) => void;
    slots?: TimeSlot[];
    loading?: boolean;
}

const DAYS_OF_WEEK = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function getNext14Days(): { date: string; day: string; dayOfWeek: string; isToday: boolean }[] {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        days.push({
            date: `${yyyy}-${mm}-${dd}`,
            day: String(d.getDate()),
            dayOfWeek: DAYS_OF_WEEK[d.getDay()],
            isToday: i === 0,
        });
    }
    return days;
}

const DEFAULT_SLOTS: TimeSlot[] = [
    { time: "07:00", available: true, remaining: 3 },
    { time: "07:30", available: true, remaining: 2 },
    { time: "08:00", available: true, remaining: 5 },
    { time: "08:30", available: true, remaining: 1 },
    { time: "09:00", available: false },
    { time: "09:30", available: true, remaining: 4 },
    { time: "10:00", available: true, remaining: 3 },
    { time: "10:30", available: true, remaining: 2 },
    { time: "13:30", available: true, remaining: 5 },
    { time: "14:00", available: true, remaining: 3 },
    { time: "14:30", available: false },
    { time: "15:00", available: true, remaining: 4 },
    { time: "15:30", available: true, remaining: 2 },
    { time: "16:00", available: true, remaining: 1 },
    { time: "16:30", available: true, remaining: 3 },
    { time: "17:00", available: false },
];

export function TimeSlotPicker({ selectedDate, onDateChange, selectedTime, onTimeChange, slots, loading }: TimeSlotPickerProps) {
    const days = getNext14Days();
    const timeSlots = slots || DEFAULT_SLOTS;
    const [scrollStart, setScrollStart] = useState(0);

    const morningSlots = timeSlots.filter(s => {
        const h = parseInt(s.time.split(":")[0]);
        return h < 12;
    });
    const afternoonSlots = timeSlots.filter(s => {
        const h = parseInt(s.time.split(":")[0]);
        return h >= 12;
    });

    return (
        <div className="space-y-6">
            {/* Date picker */}
            <div>
                <label className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#3C81C6]" style={{ fontSize: "18px" }}>calendar_today</span>
                    Chọn ngày khám
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {days.map(d => (
                        <button key={d.date} onClick={() => onDateChange(d.date)}
                            className={`flex-shrink-0 w-16 py-3 rounded-xl text-center transition-all duration-200
                            ${selectedDate === d.date
                                ? "bg-gradient-to-b from-[#3C81C6] to-[#2563eb] text-white shadow-lg shadow-[#3C81C6]/25 scale-105"
                                : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-100"}`}>
                            <div className={`text-[10px] font-medium uppercase tracking-wide ${selectedDate === d.date ? "text-blue-200" : "text-gray-400"}`}>
                                {d.isToday ? "Hôm nay" : d.dayOfWeek}
                            </div>
                            <div className="text-lg font-bold mt-0.5">{d.day}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Time slots */}
            <div>
                <label className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#3C81C6]" style={{ fontSize: "18px" }}>schedule</span>
                    Chọn giờ khám
                </label>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="w-8 h-8 border-3 border-[#3C81C6]/20 border-t-[#3C81C6] rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Legend */}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded bg-gray-50 border border-gray-200" />
                                <span>Còn chỗ</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded bg-[#3C81C6]" />
                                <span>Đã chọn</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded bg-gray-200" />
                                <span>Hết chỗ</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded bg-amber-100 border border-amber-200" />
                                <span>Sắp hết</span>
                            </div>
                        </div>

                        {/* Morning */}
                        {morningSlots.length > 0 && (
                            <div>
                                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>wb_sunny</span>
                                    Buổi sáng
                                </div>
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                    {morningSlots.map(slot => (
                                        <SlotButton key={slot.time} slot={slot} selected={selectedTime === slot.time} onClick={() => slot.available && onTimeChange(slot.time)} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Afternoon */}
                        {afternoonSlots.length > 0 && (
                            <div>
                                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>wb_twilight</span>
                                    Buổi chiều
                                </div>
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                    {afternoonSlots.map(slot => (
                                        <SlotButton key={slot.time} slot={slot} selected={selectedTime === slot.time} onClick={() => slot.available && onTimeChange(slot.time)} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function SlotButton({ slot, selected, onClick }: { slot: TimeSlot; selected: boolean; onClick: () => void }) {
    const isLow = slot.available && slot.remaining !== undefined && slot.remaining <= 2;

    return (
        <button onClick={onClick} disabled={!slot.available}
            className={`relative py-2.5 px-1 rounded-xl text-sm font-medium transition-all duration-200 text-center
            ${selected ? "bg-gradient-to-b from-[#3C81C6] to-[#2563eb] text-white shadow-md shadow-[#3C81C6]/25 scale-105" : ""}
            ${!selected && slot.available && !isLow ? "bg-gray-50 text-gray-700 hover:bg-[#3C81C6]/[0.08] hover:text-[#3C81C6] border border-gray-100 hover:border-[#3C81C6]/20" : ""}
            ${!selected && isLow ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100" : ""}
            ${!slot.available ? "bg-gray-100 text-gray-300 cursor-not-allowed line-through" : "cursor-pointer active:scale-[0.95]"}`}>
            {slot.time}
            {slot.available && slot.remaining !== undefined && !selected && (
                <span className={`block text-[10px] font-normal mt-0.5 ${isLow ? "text-amber-600" : "text-gray-400"}`}>
                    Còn {slot.remaining}
                </span>
            )}
        </button>
    );
}
