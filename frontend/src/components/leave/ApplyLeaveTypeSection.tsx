"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "../ui/Button";
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormSetValue,
} from "react-hook-form";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { LEAVE_BALANCE_LABELS } from "@/constants/leave";
import type { LeaveBalance, LeaveType } from "@/types/leave";
import type { LeaveFormData } from "@/utils/leave/leaveSchema";
import { balanceKeyMap, leaveTypeConfig } from "./applyLeaveConfig";

type Props = {
  control: Control<LeaveFormData>;
  errors: FieldErrors<LeaveFormData>;
  type: LeaveFormData["type"];
  leaveOptions: LeaveType[];
  leaveTypeStart: number;
  setLeaveTypeStart: React.Dispatch<React.SetStateAction<number>>;
  canGoPrev: boolean;
  canGoNext: boolean;
  maxLeaveTypeStart: number;
  balance: LeaveBalance | null;
  setValue: UseFormSetValue<LeaveFormData>;
};

export default function ApplyLeaveTypeSection(props: Props) {
  const {
    control,
    errors,
    type,
    leaveOptions,
    leaveTypeStart,
    setLeaveTypeStart,
    canGoPrev,
    canGoNext,
    maxLeaveTypeStart,
    balance,
    setValue,
  } = props;
  const [cardsPerView, setCardsPerView] = useState(3);

  useEffect(() => {
    const updateCardsPerView = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setCardsPerView(1);
        return;
      }
      if (width < 1024) {
        setCardsPerView(2);
        return;
      }
      setCardsPerView(3);
    };

    updateCardsPerView();
    window.addEventListener("resize", updateCardsPerView);
    return () => window.removeEventListener("resize", updateCardsPerView);
  }, []);

  const cardWidth = useMemo(() => {
    if (cardsPerView <= 1) return "100%";
    const gaps = cardsPerView - 1;
    return `calc((100% - ${gaps * 0.75}rem) / ${cardsPerView})`;
  }, [cardsPerView]);

  const effectiveMaxLeaveTypeStart = useMemo(
    () => Math.max(0, leaveOptions.length - cardsPerView),
    [leaveOptions.length, cardsPerView],
  );
  const effectiveCanGoPrev = leaveTypeStart > 0;
  const effectiveCanGoNext = leaveTypeStart < effectiveMaxLeaveTypeStart;

  useEffect(() => {
    setLeaveTypeStart((prev) => Math.min(prev, effectiveMaxLeaveTypeStart));
  }, [effectiveMaxLeaveTypeStart, setLeaveTypeStart]);

  const translateX = useMemo(() => {
    if (cardsPerView <= 1)
      return `translateX(calc(-${leaveTypeStart} * (100% + 0.75rem)))`;
    const gaps = cardsPerView - 1;
    return `translateX(calc(-${leaveTypeStart} * ((100% - ${gaps * 0.75}rem) / ${cardsPerView} + 0.75rem)))`;
  }, [cardsPerView, leaveTypeStart]);

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card/90 p-4 shadow-sm backdrop-blur-sm md:p-5">
      <div className="flex justify-between items-center gap-3">
        <h3 className="text-lg font-semibold text-card-foreground">
          Choose leave type
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLeaveTypeStart((prev) => Math.max(prev - 1, 0))}
              disabled={!effectiveCanGoPrev}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                effectiveCanGoPrev
                  ? "border-border bg-card text-muted-foreground hover:bg-muted"
                  : "cursor-not-allowed border-border bg-muted text-muted-foreground/60"
              }`}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() =>
                setLeaveTypeStart((prev) =>
                  Math.min(prev + 1, effectiveMaxLeaveTypeStart),
                )
              }
              disabled={!effectiveCanGoNext}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                effectiveCanGoNext
                  ? "border-border bg-card text-muted-foreground hover:bg-muted"
                  : "cursor-not-allowed border-border bg-muted text-muted-foreground/60"
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
            <ShieldCheck size={12} className="text-primary" />
            <span>
              {LEAVE_BALANCE_LABELS[type as LeaveType] ?? "Balance aware"}
            </span>
          </div>
        </div>
      </div>

      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <div className="mt-3 w-full max-w-full overflow-hidden">
            <div
              className="flex gap-3 transition-transform duration-300 ease-out"
              style={{
                transform: translateX,
              }}
            >
              {leaveOptions.map((key) => {
                const cfg = leaveTypeConfig[key];
                const Icon = cfg.icon;
                const isSelected = field.value === key;
                const balKey = balanceKeyMap[key];
                const balanceLabel =
                  balance && balKey ? (balance[balKey] ?? null) : null;
                return (
                  <Button
                    key={key}
                    type="button"
                    unstyled
                    onClick={() => setValue("type", key)}
                    className={`group relative flex shrink-0 flex-col gap-3 rounded-xl border px-4 py-4 text-left h-auto! text-card-foreground! transition-all duration-150 ${
                      isSelected
                        ? `${cfg.bg} ${cfg.border} border-2`
                        : "border-border bg-muted/70!"
                    }`}
                    style={{ width: cardWidth }}
                  >
                    {isSelected ? (
                      <div
                        className={`absolute right-3 top-3 z-10 inline-flex h-5 w-5 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-card ${cfg.color} ${cfg.bg}`}
                      >
                        <Check size={12} strokeWidth={3} />
                      </div>
                    ) : null}
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border bg-card shadow-sm ${isSelected ? cfg.border : "border-border"}`}
                      >
                        <Icon
                          size={18}
                          className={
                            isSelected ? cfg.color : "text-muted-foreground"
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <p
                          className={`text-sm font-semibold leading-tight ${isSelected ? cfg.color : "text-card-foreground"}`}
                        >
                          {cfg.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {cfg.desc}
                        </p>
                      </div>
                      {balanceLabel !== null ? (
                        <div
                          className={`ml-auto items-center justify-center px-2 py-1 text-xs font-semibold ${isSelected ? `${cfg.border} ${cfg.color}` : "border-border text-muted-foreground"}`}
                        >
                          {balanceLabel}d
                        </div>
                      ) : null}
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      />
      {errors.type ? (
        <p className="flex items-center gap-1 mt-2 text-destructive text-xs">
          <AlertTriangle size={11} />
          {errors.type.message}
        </p>
      ) : null}
    </section>
  );
}
