import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">

                {/* Backdrop */}
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity" onClick={onClose}></div>

                {/* Modal Panel */}
                <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all sm:my-8 sm:w-full sm:max-w-md border border-gray-100 flex flex-col">

                    {/* Header */}
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div className="flex items-start justify-between">
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">
                                    {title}
                                </h3>
                                <div className="mt-2 text-sm text-gray-500">
                                    {children}
                                </div>
                            </div>
                            <div className="ml-4 flex h-7 items-center">
                                <button
                                    type="button"
                                    className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                                    onClick={onClose}
                                >
                                    <span className="absolute -inset-2.5"></span>
                                    <span className="sr-only">Close panel</span>
                                    <X className="h-6 w-6" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    {footer && (
                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;
