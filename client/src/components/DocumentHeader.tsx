export function DocumentHeader() {
    return (
        <>
            <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                    <h1 className="text-xl font-bold uppercase tracking-wide leading-tight">
                        AURORA'S PG COLLEGE (MBA)
                    </h1>
                    <p className="text-sm">Autonomous</p>
                    <p className="text-sm">Accredited by NAAC with A+ Grade</p>
                    <p className="text-sm">Ganesh Nagar, Ramanthapur, Hyderabad.</p>
                </div>
                <div className="w-32 flex flex-col items-center justify-center pt-2">
                    <img src="/aurora-logo.png" alt="Aurora Logo" className="w-24 h-auto object-contain" />
                </div>
            </div>
            <div className="w-full h-0.5 bg-black mb-4"></div>
        </>
    );
}
