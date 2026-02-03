import React from 'react';

const PrintStyleProvider = ({ width, height }) => {
    if (!width || !height) return null;

    return (
        <style dangerouslySetInnerHTML={{
            __html: `
        @media print {
          @page {
            /* Hier werden die Maße aus dem Dropdown eingesetzt */
            size: ${width}mm ${height}mm;
            margin: 0 !important;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `
        }} />
    );
};

export default PrintStyleProvider;
