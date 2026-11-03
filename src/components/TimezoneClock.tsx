import React, { useState, useEffect } from 'react';
import { Clock, Globe2, Moon, Sun } from 'lucide-react';

interface TimezoneClockProps {
  timezoneString: string;
}

export const TimezoneClock: React.FC<TimezoneClockProps> = ({ timezoneString }) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [timeZoneName, setTimeZoneName] = useState<string>('UTC');

  useEffect(() => {
    // Determine target IANA timezone based on timezoneString hints
    let targetZone = 'Europe/London';
    if (timezoneString.includes('UK') || timezoneString.includes('London') || timezoneString.includes('GMT')) {
      targetZone = 'Europe/London';
      setTimeZoneName('London (GMT+0/BST)');
    } else if (timezoneString.includes('Eastern') || timezoneString.includes('EST') || timezoneString.includes('Boston')) {
      targetZone = 'America/New_York';
      setTimeZoneName('New York / Boston (EST)');
    } else if (timezoneString.includes('PST') || timezoneString.includes('San Francisco') || timezoneString.includes('Pacific')) {
      targetZone = 'America/Los_Angeles';
      setTimeZoneName('San Francisco (PST)');
    } else if (timezoneString.includes('CET') || timezoneString.includes('Stockholm')) {
      targetZone = 'Europe/Stockholm';
      setTimeZoneName('Stockholm (CET)');
    } else if (timezoneString.includes('SGT') || timezoneString.includes('Singapore')) {
      targetZone = 'Asia/Singapore';
      setTimeZoneName('Singapore (SGT)');
    } else {
      targetZone = 'UTC';
      setTimeZoneName('Simulated Corporate Time');
    }

    const updateTimer = () => {
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: targetZone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });
        setCurrentTime(formatter.format(new Date()));
      } catch {
        setCurrentTime(new Date().toLocaleTimeString());
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [timezoneString]);

  return (
    <div className="flex items-center gap-2.5 px-3 py-2 bg-[#f8f9ff] border border-[#635bff]/20 rounded-lg shadow-sm">
      <div className="w-7 h-7 rounded-md bg-[#ede9fe] text-[#635bff] flex items-center justify-center">
        <Clock className="w-4 h-4 animate-pulse" />
      </div>
      <div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#475569]">
          <Globe2 className="w-3 h-3 text-[#635bff]" />
          <span>{timezoneString}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#0f172a]">{currentTime || '02:15:00 PM'}</span>
          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Office Active
          </span>
        </div>
      </div>
    </div>
  );
};
