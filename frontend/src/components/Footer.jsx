import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-400 py-4 mt-auto border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-wrap justify-center items-center gap-4 text-sm">
                    <span>&copy; {new Date().getFullYear()} MD IT Solutions</span>
                    <span className="text-gray-600">|</span>
                    <Link to="/impressum" className="hover:text-white transition-colors">
                        Impressum
                    </Link>
                    <span className="text-gray-600">|</span>
                    <Link to="/datenschutz" className="hover:text-white transition-colors">
                        Datenschutz
                    </Link>
                    <span className="text-gray-600">|</span>
                    <Link to="/agb" className="hover:text-white transition-colors">
                        AGB
                    </Link>
                    <span className="text-gray-600">|</span>
                    <a href="mailto:info@md-it-solutions.de" className="hover:text-white transition-colors">
                        info@md-it-solutions.de
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
