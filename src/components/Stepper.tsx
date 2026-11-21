interface StepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label?: string;
}

/** +/- quantity stepper; the value is always clamped to [min, max]. */
export function Stepper({ value, min, max, onChange, label = 'Quantity' }: StepperProps) {
  const clamp = (n: number) => Math.max(min, Math.min(max, Math.round(n) || min));
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(clamp(value - 1))} disabled={value <= min} aria-label="Decrease">
        −
      </button>
      <span>
        <input
          type="number"
          aria-label={label}
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(clamp(Number(e.target.value)))}
          style={{ width: 56, textAlign: 'center', border: 'none', background: 'transparent', fontWeight: 700 }}
        />
      </span>
      <button type="button" onClick={() => onChange(clamp(value + 1))} disabled={value >= max} aria-label="Increase">
        +
      </button>
    </div>
  );
}
