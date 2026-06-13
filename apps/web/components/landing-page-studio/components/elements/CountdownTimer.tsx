'use client';

import React, { useState, useEffect } from 'react';
import { useNode } from '@craftjs/core';

export interface CountdownTimerProps {
  targetDate: string;
  title: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  showDays: boolean;
  padding: number;
}

const FlipUnit = ({
  value,
  label,
  accentColor,
  textColor,
}: {
  value: string;
  label: string;
  accentColor: string;
  textColor: string;
}) => (
  <div className="flex flex-col items-center gap-2">
    <div
      className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center text-2xl md:text-3xl font-black shadow-xl overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${accentColor}22 0%, ${accentColor}11 100%)`,
        border: `1px solid ${accentColor}55`,
        color: textColor,
      }}
    >
      <div
        className="absolute inset-x-0 top-1/2 h-px opacity-20"
        style={{ backgroundColor: accentColor }}
      />
      {value}
    </div>
    <span
      className="text-[9px] md:text-[10px] font-black uppercase tracking-widest"
      style={{ color: accentColor + 'cc' }}
    >
      {label}
    </span>
  </div>
);

export const CountdownTimer = ({
  targetDate,
  title,
  backgroundColor,
  textColor,
  accentColor,
  showDays,
  padding,
}: Partial<CountdownTimerProps>) => {
  const {
    connectors: { connect, drag },
    hasSelectedNode,
  } = useNode((node) => ({
    hasSelectedNode: node.events.selected,
  }));

  const [timeLeft, setTimeLeft] = useState({
    days: 1,
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    const fallback = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const target = targetDate ? new Date(targetDate) : fallback;

    const tick = () => {
      const now = new Date();
      const diff = Math.max(0, target.getTime() - now.getTime());
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const pad = (n: number) => String(n).padStart(2, '0');
  const bg = backgroundColor || '#080B14';
  const tc = textColor || '#ffffff';
  const ac = accentColor || '#EF4444';
  const pt = padding ?? 32;

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      className={`w-full transition-all duration-200 ${
        hasSelectedNode ? 'ring-2 ring-indigo-500 ring-inset' : ''
      }`}
      style={{ backgroundColor: bg, padding: `${pt}px 16px` }}
    >
      {title && (
        <p
          className="text-center text-xs md:text-sm font-black uppercase tracking-widest mb-5"
          style={{ color: ac }}
        >
          {title}
        </p>
      )}
      <div className="flex items-center justify-center gap-3 md:gap-5">
        {showDays !== false && (
          <>
            <FlipUnit value={pad(timeLeft.days)} label="Days" accentColor={ac} textColor={tc} />
            <span className="text-2xl font-black mb-5 opacity-50" style={{ color: ac }}>
              :
            </span>
          </>
        )}
        <FlipUnit value={pad(timeLeft.hours)} label="Hours" accentColor={ac} textColor={tc} />
        <span className="text-2xl font-black mb-5 opacity-50" style={{ color: ac }}>
          :
        </span>
        <FlipUnit value={pad(timeLeft.minutes)} label="Mins" accentColor={ac} textColor={tc} />
        <span className="text-2xl font-black mb-5 opacity-50" style={{ color: ac }}>
          :
        </span>
        <FlipUnit value={pad(timeLeft.seconds)} label="Secs" accentColor={ac} textColor={tc} />
      </div>
    </div>
  );
};

export const CountdownTimerSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as CountdownTimerProps,
  }));

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Urgency Label</label>
        <input
          type="text"
          value={props.title || ''}
          onChange={(e) => setProp((p: any) => (p.title = e.target.value))}
          className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs"
          placeholder="⏰ OFFER EXPIRES IN..."
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Target Date & Time</label>
        <input
          type="datetime-local"
          value={props.targetDate ? props.targetDate.slice(0, 16) : ''}
          onChange={(e) =>
            setProp((p: any) => (p.targetDate = new Date(e.target.value).toISOString()))
          }
          className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Background</label>
        <input
          type="color"
          value={props.backgroundColor || '#080B14'}
          onChange={(e) => setProp((p: any) => (p.backgroundColor = e.target.value))}
          className="h-8 w-full rounded cursor-pointer border border-white/10"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Accent / Number Color</label>
        <input
          type="color"
          value={props.accentColor || '#EF4444'}
          onChange={(e) => setProp((p: any) => (p.accentColor = e.target.value))}
          className="h-8 w-full rounded cursor-pointer border border-white/10"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between">
          <label className="text-gray-400 text-xs font-semibold">Padding</label>
          <span className="text-xs text-indigo-400">{props.padding ?? 32}px</span>
        </div>
        <input
          type="range"
          min="8"
          max="80"
          step="4"
          value={props.padding ?? 32}
          onChange={(e) => setProp((p: any) => (p.padding = parseInt(e.target.value)))}
          className="w-full accent-indigo-600"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showDays"
          checked={props.showDays !== false}
          onChange={(e) => setProp((p: any) => (p.showDays = e.target.checked))}
          className="accent-indigo-500"
        />
        <label htmlFor="showDays" className="text-gray-400 text-xs font-semibold">
          Show Days Counter
        </label>
      </div>
    </div>
  );
};

CountdownTimer.craft = {
  name: 'Countdown Timer',
  props: {
    targetDate: '',
    title: '⏰ THIS OFFER EXPIRES IN...',
    backgroundColor: '#080B14',
    textColor: '#ffffff',
    accentColor: '#EF4444',
    showDays: true,
    padding: 32,
  },
  related: {
    settings: CountdownTimerSettings,
  },
};
