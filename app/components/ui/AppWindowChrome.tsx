import { BORDER_SOFT } from "@/app/constants";

const AppWindowChrome = () => {
    return (
        <div
            className="absolute left-0 right-0 top-0 h-9 flex items-center px-3 select-none"
            style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0))",
                borderBottom: `1px solid ${BORDER_SOFT}`,
                backdropFilter: "blur(6px)",
            }}
        >
            {/* window controls */}
            <div className="flex items-center gap-2">
                {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                    <span key={c} className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c, boxShadow: `0 0 0 1px rgba(0,0,0,0.25) inset` }} />
                ))}
            </div>
            <div className="mx-auto text-xs text-white/70 tracking-wide">Icarus – Strategy Planner</div>
            <div className="w-16" />
        </div>
    );
};

export default AppWindowChrome;
