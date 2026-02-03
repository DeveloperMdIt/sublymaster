import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Unternehmen */}
                    <div>
                        <h3 className="text-white font-bold mb-4">MD IT Solutions</h3>
                        <p className="text-sm">
                            An der Hohl 4<br />
                            36318 Schwalmtal<br />
                            Deutschland
                        </p>
                        <p className="text-sm mt-4">
                            <a href="tel:+4966387292101" className="hover:text-white transition-colors">
                                +49 6638 7292101
                            </a>
                        </p>
                        <p className="text-sm">
                            <a href="mailto:info@md-it-solutions.de" className="hover:text-white transition-colors">
                                info@md-it-solutions.de
                            </a>
                        </p>
                        <p className="text-sm mt-2">
                            <a href="https://www.md-it-solutions.de" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                www.md-it-solutions.de
                            </a>
                        </p>
                    </div>

                    {/* Rechtliches */}
                    <div>
                        <h3 className="text-white font-bold mb-4">Rechtliches</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/impressum" className="hover:text-white transition-colors">
                                    Impressum
                                </Link>
                            </li>
                            <li>
                                <Link to="/datenschutz" className="hover:text-white transition-colors">
                                    Datenschutzerklärung
                                </Link>
                            </li>
                            <li>
                                <Link to="/agb" className="hover:text-white transition-colors">
                                    AGB
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Sublymaster */}
                    <div>
                        <h3 className="text-white font-bold mb-4">Sublymaster</h3>
                        <p className="text-sm">
                            Professionelles Design-Tool für Sublimationsdruck mit Echtzeit-Vorschau und Druckerverwaltung.
                        </p>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} MD IT Solutions. Alle Rechte vorbehalten.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
