import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, type = 'website' }) {
  const siteName = "EstateLedger";
  const defaultTitle = "EstateLedger | Property Management Software Kenya & Rent Collection";
  const defaultDesc = "The premium property management system in Kenya. Automate rent collection via M-Pesa, manage tenants, track expenses, and view your ledger with architectural precision.";

  const finalTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const finalDesc = description || defaultDesc;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDesc} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDesc} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDesc} />
    </Helmet>
  );
}
