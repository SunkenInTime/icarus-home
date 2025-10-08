const Parallax = ({ children, depth = 8 }: { children: React.ReactNode; depth?: number }) => {
    return (
        <section
            aria-label="parallax"
            className="transition-transform will-change-transform"
            style={{
                transform: "perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)",
            }}
            onMouseMove={(e) => {
                const t = e.currentTarget as HTMLDivElement;
                const r = t.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width - 0.5;
                const y = (e.clientY - r.top) / r.height - 0.5;
                t.style.transform = `perspective(900px) rotateX(${-y * depth}deg) rotateY(${x * depth}deg) translateZ(0)`;
            }}
            onMouseLeave={(e) => {
                const t = e.currentTarget as HTMLDivElement;
                t.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)";
            }}
        >
            {children}
        </section>
    );
};

export default Parallax;
