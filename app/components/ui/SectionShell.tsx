const SectionShell = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => {
    return (
        <section id={id} className="py-16 sm:py-24">
            <div className="mx-auto max-w-6xl px-6">
                <div className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-semibold">{title}</h2>
                </div>
                {children}
            </div>
        </section>
    );
};

export default SectionShell;
