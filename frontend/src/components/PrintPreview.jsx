
import React, { useState, useEffect } from 'react';

// --- ICONS ---
const CheckIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
);
const Spinner = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
);
const PrinterIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
);

const PrintPreview = ({ image, template, settings = {}, onCancel, onPrint }) => {
    // --- DEBUGGING & SAFETY ---
    console.log("PrintPreview Mounting...", { template, settings });

    // 1. Safety Check: If template is missing, don't render (prevents crash)
    if (!template) {
        console.error("PrintPreview: Template prop is missing!");
        return null;
    }

    // 2. Template Dimensions from Profile
    const { width: widthPx, height: heightPx } = template;
    const widthMm = widthPx / 4;
    const heightMm = heightPx / 4;

    // 3. State
    const [isLandscape, setIsLandscape] = useState(true);
    const [imageOrientation, setImageOrientation] = useState('landscape');
    const [allowAutoRotate, setAllowAutoRotate] = useState(true);

    // Default Offset
    const [offsets, setOffsets] = useState({
        top: parseFloat(settings.offsetTop) || 0,
        left: parseFloat(settings.offsetLeft) || 0
    });
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(true);

    // 4. Auto-Detect Image Orientation (With Timeout Safety)
    useEffect(() => {
        if (!image) {
            setIsProcessing(false);
            return;
        }

        setIsProcessing(true);
        const img = new Image();
        let loaded = false;

        const handleLoad = () => {
            if (loaded) return;
            loaded = true;
            console.log("PrintPreview: Image Loaded", img.width, img.height);
            const orientation = img.width > img.height ? 'landscape' : 'portrait';
            setImageOrientation(orientation);
            setIsLandscape(false); // Default to Portrait per user request
            setIsImageLoaded(true);
            setIsProcessing(false);
        };

        const handleError = () => {
            if (loaded) return;
            loaded = true;
            console.error("PrintPreview: Image Load Failed");
            setIsImageLoaded(true); // Allow print anyway
            setIsProcessing(false);
        };

        img.onload = handleLoad;
        img.onerror = handleError;

        // Safety Timeout (2s) to prevent infinite spinner
        const timeoutId = setTimeout(() => {
            if (!loaded) {
                console.warn("PrintPreview: Image load timed out - forcing ready state");
                loaded = true;
                setIsProcessing(false);
                setIsImageLoaded(true);
            }
        }, 2000);

        img.src = image;

        return () => clearTimeout(timeoutId);
    }, [image]);

    // 5. Rotation Logic
    const needsRotation = allowAutoRotate && (
        (isLandscape && imageOrientation === 'portrait') ||
        (!isLandscape && imageOrientation === 'landscape')
    );

    // 6. Physical Paper Dimensions
    // We swap these based on our Paper Orientation toggle
    const displayWidth = isLandscape ? Math.max(widthMm, heightMm) : Math.min(widthMm, heightMm);
    const displayHeight = isLandscape ? Math.min(widthMm, heightMm) : Math.max(widthMm, heightMm);

    // 7. Test Print (Calibration Frame)
    const printTestFrame = () => {
        const testWindow = window.open('', '_blank');
        const paperW = displayWidth;
        const paperH = displayHeight;

        // Absolute Positioning Logic
        const css = `
            @page { size: ${paperW}mm ${paperH}mm; margin: 0; }
            body { margin: 0; padding: 0; }
            .test-wrapper {
                position: absolute;
                top: 0;
                left: 0;
                width: ${paperW}mm;
                height: ${paperH}mm;
                /* Apply Offsets via Transform from Top-Left */
                transform: translate(${offsets.left}mm, ${offsets.top}mm);
                border: 1px solid #ff0000;
                box-sizing: border-box;
            }
            .crosshair {
                position: absolute;
                top: 50%; left: 50%;
                width: 20mm; height: 20mm;
                border-top: 1px solid #ff0000;
                border-left: 1px solid #ff0000;
                transform: translate(-50%, -50%);
            }
        `;

        testWindow.document.write(`
            <html>
            <head>
                <style>${css}</style>
            </head>
            <body onload="window.print(); window.close();">
                <div class="test-wrapper">
                    <div class="crosshair"></div>
                    <div style="position:absolute; top: 10px; left: 10px; font-family: sans-serif; font-size: 10px;">
                        TEST: ${paperW}x${paperH}mm<br/>
                        Offset: X=${offsets.left} / Y=${offsets.top}
                    </div>
                </div>
            </body>
            </html>
        `);
        testWindow.document.close();
    };

    // 8. Actual Print Logic (Absolute Positioning)
    const handleStrictPrint = () => {
        if (!isImageLoaded) return;

        console.log("Printing with Offsets:", offsets); // DEBUG

        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        const doc = iframe.contentWindow.document;

        const css = `
            @page { 
                size: ${displayWidth}mm ${displayHeight}mm; 
                margin: 0 !important; 
            }
            html, body { 
                margin: 0 !important; 
                padding: 0 !important; 
                width: 100%; 
                height: 100%; 
                overflow: hidden;
            }
            
            /* The Wrapper: Use Transform for Offset */
            .print-wrapper {
                position: relative;
                width: ${displayWidth}mm;
                height: ${displayHeight}mm;
                transform: translate(${offsets.left}mm, ${offsets.top}mm);
                transform-origin: top left;
            }

            .print-image {
                position: absolute;
                top: 0; left: 0;
                width: 100%; height: 100%;
                display: block;
                object-fit: contain;

                /* Rotation Logic */
                ${needsRotation ? `
                    transform: rotate(-90deg);
                    transform-origin: center center;
                    /* Swap W/H locally to ensure fit after rotation */
                    width: ${displayHeight}mm; 
                    height: ${displayWidth}mm;
                    top: 50%; left: 50%;
                    margin-top: -${displayWidth / 2}mm;
                    margin-left: -${displayHeight / 2}mm;
                ` : ''}
            }
        `;

        doc.write(`
            <html>
                <head>
                    <title>SublyMaster Print</title>
                    <style>${css}</style>
                </head>
                <body>
                    <div class="print-wrapper">
                        <img class="print-image" src="${image}" />
                    </div>
                </body>
            </html>
        `);
        doc.close();

        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            setTimeout(() => { document.body.removeChild(iframe); onPrint(); }, 1000);
        }, 500);
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-sans text-slate-800">
            {/* Modal Window */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex overflow-hidden min-h-[550px]">

                {/* LEFT: PREVIEW AREA */}
                <div className="flex-[1.5] bg-slate-100 p-8 flex flex-col items-center justify-center relative border-r border-slate-200">
                    <span className="absolute top-6 left-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Preview ({displayWidth}x{displayHeight}mm)
                    </span>

                    {/* Visual Preview Container */}
                    <div
                        className="bg-white shadow-xl relative overflow-hidden transition-all duration-300 ease-in-out border border-slate-300"
                        style={{
                            aspectRatio: `${displayWidth}/${displayHeight}`,
                            width: isLandscape ? '100%' : 'auto',
                            height: isLandscape ? 'auto' : '100%',
                            maxHeight: '400px',
                            maxWidth: '450px'
                        }}
                    >
                        {/* Wrapper Representation (Visual Only - NO OFFSET SHIFT) */}
                        <div
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            {isImageLoaded ? (
                                <img
                                    src={image}
                                    className="object-contain transition-transform duration-300"
                                    alt="Preview"
                                    style={{
                                        width: needsRotation ? `${(displayHeight / displayWidth) * 100}%` : '100%',
                                        height: needsRotation ? `${(displayWidth / displayHeight) * 100}%` : '100%',
                                        maxWidth: 'none',
                                        transform: needsRotation ? 'rotate(-90deg)' : 'none',
                                    }}
                                />
                            ) : (
                                <Spinner className="w-8 h-8 text-slate-300 animate-spin" />
                            )}
                        </div>
                        <div className="absolute inset-0 border border-dashed border-slate-200 pointer-events-none opacity-60" />
                    </div>
                </div>

                {/* RIGHT: SETTINGS */}
                <div className="flex-1 bg-white p-8 flex flex-col justify-between z-10">
                    <div>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                    <PrinterIcon className="w-6 h-6 text-indigo-600" />
                                    <span>Drucken</span>
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    Version 2.5 (Fixed Layout)
                                </p>
                            </div>
                            <button onClick={onCancel} className="text-slate-300 hover:text-red-500 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        {/* Toggle Group */}
                        <div className="mb-6 bg-slate-50 rounded-xl border border-slate-200 p-4">
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Papier-Ausrichtung</label>
                                <button
                                    onClick={() => setAllowAutoRotate(!allowAutoRotate)}
                                    className="flex items-center gap-2 cursor-pointer focus:outline-none group"
                                >
                                    <span className={`text-[10px] font-bold uppercase transition-colors ${allowAutoRotate ? 'text-indigo-600' : 'text-slate-400'}`}>
                                        Auto-Rotate
                                    </span>
                                    {/* UI Switch */}
                                    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-300 relative ${allowAutoRotate ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                                        <div className={`w-3 h-3 bg-white rounded-full shadow-sm absolute top-0.5 transition-all duration-300 ${allowAutoRotate ? 'left-[calc(100%-14px)]' : 'left-0.5'}`} />
                                    </div>
                                </button>
                            </div>

                            <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                                <button
                                    onClick={() => setIsLandscape(false)}
                                    className={`flex-1 py-2 text-[10px] font-bold uppercase rounded transition-all ${!isLandscape ? 'bg-slate-800 text-white shadow-low' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    Hochformat
                                </button>
                                <button
                                    onClick={() => setIsLandscape(true)}
                                    className={`flex-1 py-2 text-[10px] font-bold uppercase rounded transition-all ${isLandscape ? 'bg-slate-800 text-white shadow-low' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    Querformat
                                </button>
                            </div>
                        </div>

                        {/* Offsets */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Start-Position (mm)</span>
                                <button onClick={() => setOffsets({ top: 0, left: 0 })} className="text-[10px] text-indigo-500 font-bold hover:underline">Reset</button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-2 rounded border border-slate-100 group focus-within:border-indigo-500 transition-colors">
                                    <label className="text-[9px] text-slate-400 block mb-0.5 ml-1">Links (X)</label>
                                    <input
                                        type="number"
                                        value={offsets.left}
                                        onChange={(e) => setOffsets({ ...offsets, left: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-transparent text-lg font-mono font-bold text-slate-700 outline-none px-1"
                                    />
                                </div>
                                <div className="bg-slate-50 p-2 rounded border border-slate-100 group focus-within:border-indigo-500 transition-colors">
                                    <label className="text-[9px] text-slate-400 block mb-0.5 ml-1">Oben (Y)</label>
                                    <input
                                        type="number"
                                        value={offsets.top}
                                        onChange={(e) => setOffsets({ ...offsets, top: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-transparent text-lg font-mono font-bold text-slate-700 outline-none px-1"
                                    />
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 leading-tight">
                                * 0/0 = Oben Links am Einzug (Absolute Positionierung).
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
                        <button
                            onClick={printTestFrame}
                            className="w-full py-3 rounded-lg border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                        >
                            Test-Rahmen Drucken (Kalibrierung)
                        </button>

                        <button
                            disabled={!isImageLoaded || isProcessing}
                            onClick={handleStrictPrint}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center transition-transform active:scale-[0.99] ${isImageLoaded && !isProcessing
                                ? "bg-slate-900 text-white hover:bg-black"
                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                }`}
                        >
                            {isProcessing ? <Spinner className="w-5 h-5 animate-spin" /> : "Jetzt Drucken"}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PrintPreview;
