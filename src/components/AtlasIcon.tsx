import { ATLAS_ICONS, AtlasIconName } from "@/data/atlasIcons";

export default function AtlasIcon({ name, regular = false }: { name: AtlasIconName; regular?: boolean }) {
  const drawing = ATLAS_ICONS[name];
  return (
    <svg
      viewBox="0 0 32 32"
      width="32"
      height="32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <g transform={regular ? "translate(0 -1) scale(.9)" : undefined}>
        {drawing.fill.map((path, i) => (
          <path key={`fill-${i}`} d={path} fill="currentColor" fillOpacity=".15" stroke="none" />
        ))}
        {drawing.paths.map((path, i) => (
          <path key={i} d={path} />
        ))}
      </g>
      {regular && (
        <g>
          <rect x="19" y="20" width="12" height="11" rx="3" fill="var(--surface)" strokeWidth="1.2" />
          <path d="M23 23h3l-2 2c4-1 4 4-1 3" strokeWidth="1.4" />
        </g>
      )}
    </svg>
  );
}
