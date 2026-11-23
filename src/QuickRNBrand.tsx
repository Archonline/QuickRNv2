import { Activity } from "lucide-react";

type QuickRNBrandProps = {
  className?: string;
  tagline?: string;
  badge?: string;
  compact?: boolean;
};

export default function QuickRNBrand({ className = "", tagline, badge, compact = false }: QuickRNBrandProps) {
  return (
    <span className={["qrn-brand", compact ? "qrn-brand--compact" : "", className].filter(Boolean).join(" ")}>
      <span className="qrn-brand-mark" aria-hidden="true"><Activity size={compact ? 19 : 21} strokeWidth={2.5} /></span>
      <span className="qrn-brand-copy">
        <span className="qrn-brand-name">Quick<span>RN</span></span>
        {tagline && <span className="qrn-brand-tagline">{tagline}</span>}
      </span>
      {badge && <span className="qrn-brand-badge">{badge}</span>}
    </span>
  );
}
