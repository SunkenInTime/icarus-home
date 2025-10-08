import { BORDER_SOFT } from "@/app/constants";

const GlassDeviceFrame = ({ children, rounded = "xl" }: { children: React.ReactNode; rounded?: "lg" | "xl" }) => {
    const radius = rounded === "lg" ? "0.75rem" : "1rem";
    return (
        <div
            className="relative overflow-hidden"
            style={{
                borderRadius: radius,
                border: `1px solid ${BORDER_SOFT}`,
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
        >
            <div aria-hidden className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }} />
            {children}
        </div>
    );
};

export default GlassDeviceFrame;
