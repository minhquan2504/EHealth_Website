"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MOCK_PATIENT_QUEUE } from "@/lib/mock-data/doctor";

/* ──────── Steps Config ──────── */
const STEPS = [
    { key: "vitals", label: "Sinh hiệu", icon: "monitor_heart" },
    { key: "symptoms", label: "Triệu chứng", icon: "symptoms" },
    { key: "diagnosis", label: "Chẩn đoán", icon: "diagnosis" },
    { key: "prescription", label: "Đơn thuốc", icon: "medication" },
    { key: "summary", label: "Kết luận", icon: "task_alt" },
] as const;

const VITAL_FIELDS = [
    { key: "bloodPressure", label: "Huyết áp", unit: "mmHg", icon: "bloodtype", placeholder: "120/80", color: "text-red-500" },
    { key: "heartRate", label: "Nhịp tim", unit: "bpm", icon: "monitor_heart", placeholder: "80", color: "text-pink-500" },
    { key: "temperature", label: "Nhiệt độ", unit: "°C", icon: "thermostat", placeholder: "36.5", color: "text-orange-500" },
    { key: "spO2", label: "SpO₂", unit: "%", icon: "spo2", placeholder: "98", color: "text-blue-500" },
    { key: "respiratoryRate", label: "Nhịp thở", unit: "/phút", icon: "pulmonology", placeholder: "18", color: "text-teal-500" },
    { key: "weight", label: "Cân nặng", unit: "kg", icon: "fitness_center", placeholder: "70", color: "text-indigo-500" },
    { key: "height", label: "Chiều cao", unit: "cm", icon: "height", placeholder: "170", color: "text-violet-500" },
] as const;

/* ──────── Component ──────── */
export default function ExaminationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const patientId = searchParams.get("patient");

    // Look up patient from queue data
    const patient = useMemo(() => {
        if (!patientId) return null;
        return MOCK_PATIENT_QUEUE.find(p => p.id === patientId) || null;
    }, [patientId]);

    const [activeStep, setActiveStep] = useState(0);
    const [saving, setSaving] = useState(false);

    // Form state
    const [vitals, setVitals] = useState({
        bloodPressure: "", heartRate: "", temperature: "",
        weight: "", height: "", spO2: "", respiratoryRate: "",
    });
    const [symptoms, setSymptoms] = useState("");
    const [diagnosis, setDiagnosis] = useState("");
    const [icdCode, setIcdCode] = useState("");
    const [treatment, setTreatment] = useState("");
    const [meds, setMeds] = useState<{ name: string; dosage: string; frequency: string; duration: string; note: string }[]>([]);
    const [newMed, setNewMed] = useState({ name: "", dosage: "", frequency: "", duration: "", note: "" });
    const [followUp, setFollowUp] = useState("");
    const [doctorNote, setDoctorNote] = useState("");

    // Computed
    const bmi = useMemo(() => {
        const w = parseFloat(vitals.weight);
        const h = parseFloat(vitals.height) / 100;
        return w && h ? (w / (h * h)).toFixed(1) : "—";
    }, [vitals.weight, vitals.height]);

    const canProceed = useMemo(() => {
        switch (activeStep) {
            case 0: return !!(vitals.bloodPressure && vitals.heartRate && vitals.temperature);
            case 1: return symptoms.trim().length > 0;
            case 2: return diagnosis.trim().length > 0;
            case 3: return true;
            case 4: return true;
            default: return true;
        }
    }, [activeStep, vitals, symptoms, diagnosis]);

    // Handlers
    const addMed = () => {
        if (!newMed.name.trim()) return;
        setMeds(prev => [...prev, { ...newMed }]);
        setNewMed({ name: "", dosage: "", frequency: "", duration: "", note: "" });
    };
    const removeMed = (idx: number) => setMeds(prev => prev.filter((_, i) => i !== idx));
    const goNext = () => { if (canProceed && activeStep < STEPS.length - 1) setActiveStep(prev => prev + 1); };
    const goBack = () => { if (activeStep > 0) setActiveStep(prev => prev - 1); };

    const handleSaveDraft = async () => {
        setSaving(true);
        await new Promise(r => setTimeout(r, 800));
        setSaving(false);
        alert("Đã lưu nháp thành công!");
    };

    const handleComplete = async () => {
        if (!confirm("Xác nhận hoàn thành khám bệnh và ký kết quả?")) return;
        setSaving(true);
        await new Promise(r => setTimeout(r, 1200));
        setSaving(false);
        alert("Đã hoàn thành khám bệnh!");
        router.push("/portal/doctor/queue");
    };

    const handleExit = () => {
        if (confirm("Bạn muốn thoát? Dữ liệu chưa lưu sẽ bị mất.")) {
            router.push("/portal/doctor/queue");
        }
    };

    /* ── No patient found ── */
    if (!patient) {
        return (
            <div className="p-6 md:p-8">
                <div className="max-w-2xl mx-auto text-center py-20">
                    <div className="w-20 h-20 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mx-auto mb-5">
                        <span className="material-symbols-outlined text-orange-500 text-4xl">person_off</span>
                    </div>
                    <h1 className="text-xl font-bold text-[#121417] dark:text-white mb-2">Chưa chọn bệnh nhân</h1>
                    <p className="text-sm text-[#687582] mb-6">
                        Vui lòng chọn bệnh nhân từ hàng đợi để bắt đầu khám.
                    </p>
                    <Link
                        href="/portal/doctor/queue"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3C81C6] hover:bg-[#2a6da8] text-white rounded-xl text-sm font-bold shadow-md shadow-blue-200 dark:shadow-none transition-all"
                    >
                        <span className="material-symbols-outlined text-[18px]">groups</span>
                        Về hàng đợi
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto space-y-5">

                {/* ── Top Bar ── */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs text-[#687582]">
                        <Link href="/portal/doctor" className="hover:text-[#3C81C6]">Trang chủ</Link>
                        <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                        <Link href="/portal/doctor/queue" className="hover:text-[#3C81C6]">Hàng đợi</Link>
                        <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                        <span className="text-[#121417] dark:text-white font-medium">Khám bệnh — {patient.fullName}</span>
                    </div>
                    <div className="ml-auto">
                        <button onClick={handleExit} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#687582] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-[16px]">close</span>
                            Thoát
                        </button>
                    </div>
                </div>

                {/* ── Patient Banner ── */}
                <div className="bg-white dark:bg-[#1e242b] rounded-xl border border-[#dde0e4] dark:border-[#2d353e] p-4">
                    <div className="flex items-center gap-4 flex-wrap">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden border border-gray-200 bg-gray-100"
                            style={patient.avatar ? { backgroundImage: `url('${patient.avatar}')`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
                            {!patient.avatar && (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <span className="material-symbols-outlined text-2xl">person</span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-lg font-bold text-[#121417] dark:text-white">{patient.fullName}</h1>
                                <span className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full font-medium">{patient.id}</span>
                                <span className="text-xs px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full font-medium">STT: {patient.queueNumber}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 text-xs text-[#687582] flex-wrap">
                                <span>{patient.gender}, {patient.age} tuổi</span>
                                <span>•</span>
                                <span>Ngày sinh: {patient.birthDate}</span>
                                <span>•</span>
                                <span>SĐT: {patient.phone}</span>
                            </div>
                        </div>

                        {/* Warning badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {patient.allergies && patient.allergies.length > 0 && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <span className="material-symbols-outlined text-red-500 text-[16px]">warning</span>
                                    <span className="text-xs font-medium text-red-600 dark:text-red-400">
                                        Dị ứng: {patient.allergies.join(", ")}
                                    </span>
                                </div>
                            )}
                            {patient.medicalHistory && patient.medicalHistory.length > 0 && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                    <span className="material-symbols-outlined text-amber-500 text-[16px]">history</span>
                                    <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                                        {patient.medicalHistory.join(", ")}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Reason */}
                    {patient.reason && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                            <p className="text-xs text-[#687582]">
                                <strong className="text-[#121417] dark:text-gray-300">Lý do khám:</strong> {patient.reason}
                            </p>
                        </div>
                    )}
                </div>

                {/* ── Steps Progress ── */}
                <div className="bg-white dark:bg-[#1e242b] rounded-xl border border-[#dde0e4] dark:border-[#2d353e] px-5 py-4">
                    <div className="flex items-center gap-0">
                        {STEPS.map((step, i) => {
                            const isDone = i < activeStep;
                            const isCurrent = i === activeStep;
                            return (
                                <div key={step.key} className="flex items-center flex-1 last:flex-none">
                                    <button
                                        onClick={() => i <= activeStep && setActiveStep(i)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${isCurrent
                                                ? "bg-[#3C81C6] text-white shadow-md shadow-blue-200 dark:shadow-none"
                                                : isDone
                                                    ? "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer"
                                                    : "text-[#b0b8c1] cursor-default"
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-[18px]">
                                            {isDone ? "check_circle" : step.icon}
                                        </span>
                                        <span className="hidden sm:inline">{step.label}</span>
                                    </button>
                                    {i < STEPS.length - 1 && (
                                        <div className={`flex-1 h-[2px] mx-1 rounded transition-colors ${isDone ? "bg-green-400" : "bg-gray-200 dark:bg-gray-700"}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Step Content ── */}
                <div className="bg-white dark:bg-[#1e242b] rounded-xl border border-[#dde0e4] dark:border-[#2d353e] overflow-hidden">
                    <div className="p-5 border-b border-[#eee] dark:border-[#2d353e]">
                        <h2 className="text-base font-bold text-[#121417] dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#3C81C6] text-[20px]">{STEPS[activeStep].icon}</span>
                            {STEPS[activeStep].label}
                            <span className="text-xs font-normal text-[#b0b8c1] ml-1">Bước {activeStep + 1}/{STEPS.length}</span>
                        </h2>
                    </div>

                    <div className="p-5">
                        {/* ── Step 0: Sinh hiệu ── */}
                        {activeStep === 0 && (
                            <div className="space-y-5">
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {VITAL_FIELDS.map((f) => (
                                        <div key={f.key} className="bg-[#f8f9fa] dark:bg-[#13191f] rounded-xl p-3.5 border border-transparent hover:border-[#3C81C6]/20 transition-colors">
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <span className={`material-symbols-outlined text-[16px] ${f.color}`}>{f.icon}</span>
                                                <span className="text-xs font-medium text-[#687582]">{f.label}</span>
                                            </div>
                                            <div className="flex items-baseline gap-1">
                                                <input
                                                    type="text"
                                                    value={vitals[f.key as keyof typeof vitals]}
                                                    onChange={(e) => setVitals(prev => ({ ...prev, [f.key]: e.target.value }))}
                                                    placeholder={f.placeholder}
                                                    className="w-full text-lg font-bold text-[#121417] dark:text-white bg-transparent outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600"
                                                />
                                                <span className="text-xs text-[#b0b8c1] flex-shrink-0">{f.unit}</span>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-3.5 border border-indigo-100 dark:border-indigo-800">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <span className="material-symbols-outlined text-[16px] text-indigo-500">calculate</span>
                                            <span className="text-xs font-medium text-indigo-500">BMI</span>
                                        </div>
                                        <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{bmi}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Step 1: Triệu chứng ── */}
                        {activeStep === 1 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#121417] dark:text-gray-300 mb-1.5">Mô tả triệu chứng *</label>
                                    <textarea
                                        value={symptoms} onChange={(e) => setSymptoms(e.target.value)}
                                        rows={5} placeholder="Mô tả chi tiết triệu chứng, thời gian bắt đầu, mức độ..."
                                        className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-[#13191f] border border-[#dde0e4] dark:border-[#2d353e] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3C81C6]/20 focus:border-[#3C81C6] resize-none dark:text-white"
                                    />
                                </div>
                                {patient.reason && (
                                    <div className="flex items-start gap-3 p-3.5 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/50">
                                        <span className="material-symbols-outlined text-blue-500 text-[20px] mt-0.5">description</span>
                                        <div>
                                            <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-0.5">Lý do khám (từ tiếp nhận)</p>
                                            <p className="text-sm text-blue-800 dark:text-blue-300">{patient.reason}</p>
                                        </div>
                                    </div>
                                )}
                                {patient.medicalHistory && patient.medicalHistory.length > 0 && (
                                    <div className="flex items-start gap-3 p-3.5 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-800/50">
                                        <span className="material-symbols-outlined text-amber-500 text-[20px] mt-0.5">history</span>
                                        <div>
                                            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-0.5">Tiền sử bệnh</p>
                                            <ul className="text-sm text-amber-800 dark:text-amber-300 space-y-0.5">
                                                {patient.medicalHistory.map((h, i) => <li key={i}>• {h}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Step 2: Chẩn đoán ── */}
                        {activeStep === 2 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[#121417] dark:text-gray-300 mb-1.5">Mã ICD-10</label>
                                        <input type="text" value={icdCode} onChange={(e) => setIcdCode(e.target.value)}
                                            placeholder="VD: I10, J06.9..."
                                            className="w-full px-4 py-2.5 bg-[#f8f9fa] dark:bg-[#13191f] border border-[#dde0e4] dark:border-[#2d353e] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3C81C6]/20 focus:border-[#3C81C6] dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#121417] dark:text-gray-300 mb-1.5">Chẩn đoán *</label>
                                        <input type="text" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)}
                                            placeholder="Tên bệnh / chẩn đoán..."
                                            className="w-full px-4 py-2.5 bg-[#f8f9fa] dark:bg-[#13191f] border border-[#dde0e4] dark:border-[#2d353e] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3C81C6]/20 focus:border-[#3C81C6] dark:text-white" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#121417] dark:text-gray-300 mb-1.5">Phương án điều trị</label>
                                    <textarea value={treatment} onChange={(e) => setTreatment(e.target.value)}
                                        rows={3} placeholder="Mô tả hướng xử lý, chỉ định xét nghiệm, chuyển khoa..."
                                        className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-[#13191f] border border-[#dde0e4] dark:border-[#2d353e] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3C81C6]/20 focus:border-[#3C81C6] resize-none dark:text-white" />
                                </div>
                            </div>
                        )}

                        {/* ── Step 3: Đơn thuốc ── */}
                        {activeStep === 3 && (
                            <div className="space-y-4">
                                {meds.length > 0 && (
                                    <div className="space-y-2">
                                        {meds.map((m, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-[#f8f9fa] dark:bg-[#13191f] rounded-xl group">
                                                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                                                    <span className="material-symbols-outlined text-teal-600 text-[18px]">medication</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-[#121417] dark:text-white">{m.name}</p>
                                                    <p className="text-xs text-[#687582] truncate">
                                                        {[m.dosage, m.frequency, m.duration, m.note].filter(Boolean).join(" • ")}
                                                    </p>
                                                </div>
                                                <button onClick={() => removeMed(i)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all">
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {meds.length === 0 && (
                                    <div className="text-center py-6 text-[#b0b8c1]">
                                        <span className="material-symbols-outlined text-4xl mb-2 block">medication</span>
                                        <p className="text-sm">Chưa có thuốc nào. Thêm thuốc bên dưới.</p>
                                    </div>
                                )}

                                {/* Add new med */}
                                <div className="p-4 border-2 border-dashed border-[#dde0e4] dark:border-[#2d353e] rounded-xl space-y-3">
                                    <p className="text-xs font-bold text-[#687582] uppercase tracking-wide">Thêm thuốc mới</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        <input type="text" value={newMed.name} onChange={(e) => setNewMed(p => ({ ...p, name: e.target.value }))} placeholder="Tên thuốc *"
                                            className="px-3 py-2 bg-white dark:bg-[#13191f] border border-[#dde0e4] dark:border-[#2d353e] rounded-lg text-sm outline-none focus:border-[#3C81C6] dark:text-white" />
                                        <input type="text" value={newMed.dosage} onChange={(e) => setNewMed(p => ({ ...p, dosage: e.target.value }))} placeholder="Liều lượng (VD: 500mg)"
                                            className="px-3 py-2 bg-white dark:bg-[#13191f] border border-[#dde0e4] dark:border-[#2d353e] rounded-lg text-sm outline-none focus:border-[#3C81C6] dark:text-white" />
                                        <input type="text" value={newMed.frequency} onChange={(e) => setNewMed(p => ({ ...p, frequency: e.target.value }))} placeholder="Tần suất (VD: 2 lần/ngày)"
                                            className="px-3 py-2 bg-white dark:bg-[#13191f] border border-[#dde0e4] dark:border-[#2d353e] rounded-lg text-sm outline-none focus:border-[#3C81C6] dark:text-white" />
                                        <input type="text" value={newMed.duration} onChange={(e) => setNewMed(p => ({ ...p, duration: e.target.value }))} placeholder="Số ngày dùng"
                                            className="px-3 py-2 bg-white dark:bg-[#13191f] border border-[#dde0e4] dark:border-[#2d353e] rounded-lg text-sm outline-none focus:border-[#3C81C6] dark:text-white" />
                                        <input type="text" value={newMed.note} onChange={(e) => setNewMed(p => ({ ...p, note: e.target.value }))} placeholder="Ghi chú (uống sau ăn...)"
                                            className="px-3 py-2 bg-white dark:bg-[#13191f] border border-[#dde0e4] dark:border-[#2d353e] rounded-lg text-sm outline-none focus:border-[#3C81C6] dark:text-white" />
                                        <button onClick={addMed}
                                            className="px-4 py-2 bg-[#3C81C6] text-white rounded-lg text-sm font-medium hover:bg-[#2a6da8] flex items-center justify-center gap-1.5 transition-colors">
                                            <span className="material-symbols-outlined text-[16px]">add</span>
                                            Thêm thuốc
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Step 4: Kết luận ── */}
                        {activeStep === 4 && (
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <SummaryCard title="Sinh hiệu" icon="monitor_heart" color="text-pink-500">
                                        {vitals.bloodPressure && <p>HA: <strong>{vitals.bloodPressure}</strong> mmHg</p>}
                                        {vitals.heartRate && <p>Nhịp tim: <strong>{vitals.heartRate}</strong> bpm</p>}
                                        {vitals.temperature && <p>Nhiệt độ: <strong>{vitals.temperature}</strong>°C</p>}
                                        {vitals.spO2 && <p>SpO₂: <strong>{vitals.spO2}</strong>%</p>}
                                        {vitals.weight && <p>Cân nặng: {vitals.weight}kg • BMI: {bmi}</p>}
                                    </SummaryCard>
                                    <SummaryCard title="Triệu chứng" icon="symptoms" color="text-amber-500">
                                        <p>{symptoms || <span className="text-[#b0b8c1] italic">Chưa nhập</span>}</p>
                                    </SummaryCard>
                                    <SummaryCard title="Chẩn đoán" icon="diagnosis" color="text-blue-500">
                                        {icdCode && <p className="text-xs font-mono text-blue-500 mb-1">{icdCode}</p>}
                                        <p className="font-medium">{diagnosis || <span className="text-[#b0b8c1] italic">Chưa nhập</span>}</p>
                                        {treatment && <p className="text-[#687582] mt-1">{treatment}</p>}
                                    </SummaryCard>
                                    <SummaryCard title={`Đơn thuốc (${meds.length})`} icon="medication" color="text-teal-500">
                                        {meds.length === 0 ? (
                                            <p className="text-[#b0b8c1] italic">Không kê đơn</p>
                                        ) : (
                                            <div className="space-y-1">
                                                {meds.map((m, i) => <p key={i}>• <strong>{m.name}</strong> {m.dosage && `— ${m.dosage}`}</p>)}
                                            </div>
                                        )}
                                    </SummaryCard>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <label className="block text-sm font-medium text-[#121417] dark:text-gray-300 mb-1.5">Lịch tái khám</label>
                                        <input type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-[#f8f9fa] dark:bg-[#13191f] border border-[#dde0e4] dark:border-[#2d353e] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3C81C6]/20 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#121417] dark:text-gray-300 mb-1.5">Lời dặn bác sĩ</label>
                                        <input type="text" value={doctorNote} onChange={(e) => setDoctorNote(e.target.value)}
                                            placeholder="Chế độ ăn, sinh hoạt..."
                                            className="w-full px-4 py-2.5 bg-[#f8f9fa] dark:bg-[#13191f] border border-[#dde0e4] dark:border-[#2d353e] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3C81C6]/20 dark:text-white" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Bottom Actions ── */}
                <div className="flex items-center justify-between bg-white dark:bg-[#1e242b] rounded-xl border border-[#dde0e4] dark:border-[#2d353e] p-4">
                    <button onClick={goBack} disabled={activeStep === 0}
                        className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-[#687582] disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                        Quay lại
                    </button>
                    <div className="flex items-center gap-2.5">
                        <button onClick={handleSaveDraft} disabled={saving}
                            className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-[#687582] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
                            <span className="material-symbols-outlined text-[18px]">save</span>
                            Lưu nháp
                        </button>
                        {activeStep < STEPS.length - 1 ? (
                            <button onClick={goNext} disabled={!canProceed}
                                className="flex items-center gap-1.5 px-5 py-2.5 bg-[#3C81C6] hover:bg-[#2a6da8] text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-40 shadow-md shadow-blue-200 dark:shadow-none">
                                Tiếp theo
                                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                            </button>
                        ) : (
                            <button onClick={handleComplete} disabled={saving}
                                className="flex items-center gap-1.5 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 shadow-md shadow-green-200 dark:shadow-none">
                                {saving ? (
                                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Đang xử lý...</>
                                ) : (
                                    <><span className="material-symbols-outlined text-[18px]">verified</span> Hoàn thành &amp; Ký</>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ──────── Summary Card ──────── */
function SummaryCard({ title, icon, color, children }: { title: string; icon: string; color: string; children: React.ReactNode }) {
    return (
        <div className="bg-[#f8f9fa] dark:bg-[#13191f] rounded-xl p-4 border border-[#eee] dark:border-[#2d353e]">
            <h4 className="text-xs font-bold uppercase tracking-wide text-[#687582] mb-2.5 flex items-center gap-1.5">
                <span className={`material-symbols-outlined text-[16px] ${color}`}>{icon}</span>
                {title}
            </h4>
            <div className="text-sm text-[#121417] dark:text-gray-300 space-y-0.5">{children}</div>
        </div>
    );
}
