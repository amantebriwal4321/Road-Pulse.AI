/**
 * TwinScanPanel — Reusable floating scan control + live event feed.
 *
 * Renders as a compact floating panel (bottom-left by default).
 * When ACTIVE: pulsing radar ring + live backend event log.
 * When IDLE:   clean "START TWIN SCAN" CTA.
 */
import { type TwinScanState } from '@/hooks/useTwinScan';
import { Activity, Radar, StopCircle, CheckCircle2, XCircle } from 'lucide-react';

interface TwinScanPanelProps {
  scan: TwinScanState;
  /** Compact mode = just the button. Expanded = button + live log */
  compact?: boolean;
  /** Positioning class / style override */
  style?: React.CSSProperties;
}

export function TwinScanPanel({ scan, compact = false, style }: TwinScanPanelProps) {
  const { active, totalScans, confirmedPotholes, lastEvent, log, toggle } = scan;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 8,
      ...style,
    }}>

      {/* ── Main CTA button ─────────────────────────────────────── */}
      <button
        onClick={toggle}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 16px', borderRadius: 12, border: 'none',
          cursor: 'pointer', fontFamily: 'monospace',
          background: active
            ? 'linear-gradient(135deg, #059669, #047857)'
            : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          color: 'white',
          boxShadow: active
            ? '0 0 0 3px rgba(5,150,105,0.35), 0 4px 16px rgba(5,150,105,0.4)'
            : '0 4px 16px rgba(37,99,235,0.4)',
          transition: 'all 0.25s ease',
          position: 'relative', overflow: 'visible',
        }}
      >
        {/* Outer radar pulse ring when active */}
        {active && (
          <span style={{
            position: 'absolute', inset: -4, borderRadius: 16,
            border: '2px solid rgba(5,150,105,0.5)',
            animation: 'locationPulse 1.5s ease-out infinite',
            pointerEvents: 'none',
          }} />
        )}

        {/* Icon */}
        <span style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'rgba(255,255,255,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {active
            ? <Activity size={14} color="white" style={{ animation: 'pulse 1s ease-in-out infinite' }} />
            : <Radar size={14} color="white" />
          }
        </span>

        {/* Label + stats */}
        <div style={{ textAlign: 'left' }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em' }}>
            {active ? '⬤ TWIN SCAN LIVE' : 'START TWIN SCAN'}
          </p>
          {active && (
            <p style={{ margin: 0, fontSize: 9, opacity: 0.85, letterSpacing: '0.06em' }}>
              {totalScans} scans · {confirmedPotholes} new confirmed
            </p>
          )}
          {!active && (
            <p style={{ margin: 0, fontSize: 9, opacity: 0.75 }}>
              Real-time backend detection
            </p>
          )}
        </div>

        {/* Stop icon when active */}
        {active && (
          <StopCircle size={16} color="rgba(255,255,255,0.7)" style={{ marginLeft: 4 }} />
        )}
      </button>

      {/* ── Live event log (when active + not compact) ─────────── */}
      {active && !compact && (
        <div style={{
          background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(16px)',
          borderRadius: 12, overflow: 'hidden',
          border: '1px solid rgba(5,150,105,0.3)',
          maxHeight: 200, overflowY: 'auto',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}>
          {/* Log header */}
          <div style={{
            padding: '6px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: 6, position: 'sticky', top: 0,
            background: 'rgba(0,0,0,0.9)',
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%', background: '#10b981',
              animation: 'locationPulse 1s ease-out infinite',
            }} />
            <span style={{ color: '#10b981', fontFamily: 'monospace', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em' }}>
              TWIN SENSOR FEED · LIVE
            </span>
          </div>

          {/* Events */}
          {log.length === 0 && (
            <div style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontSize: 10 }}>
              Initialising first scan...
            </div>
          )}
          {log.map((event, i) => (
            <div key={i} style={{
              padding: '7px 12px',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              display: 'flex', alignItems: 'center', gap: 8,
              background: i === 0 ? 'rgba(5,150,105,0.08)' : 'transparent',
              transition: 'background 0.3s',
            }}>
              {event.confirmed
                ? <CheckCircle2 size={12} color="#10b981" style={{ flexShrink: 0 }} />
                : <XCircle size={12} color="rgba(255,255,255,0.25)" style={{ flexShrink: 0 }} />
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  margin: 0, fontSize: 10, fontFamily: 'monospace',
                  color: event.confirmed ? '#6ee7b7' : 'rgba(255,255,255,0.45)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {event.confirmed
                    ? `✓ CONFIRMED  sev=${event.severity_raw.toFixed(1)}  conf=${(event.confidence * 100).toFixed(0)}%`
                    : `○ NO POTHOLE  sev=${event.severity_raw.toFixed(1)}`
                  }
                </p>
                <p style={{ margin: 0, fontSize: 8, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>
                  {event.lat.toFixed(5)},{event.lng.toFixed(5)} · {event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
