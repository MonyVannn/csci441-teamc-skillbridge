/**
 * Maps project categories to their respective thumbnail images
 * Returns the path to the thumbnail image based on the project category
 */
export function getCategoryThumbnail(category: string): string {
  const thumbnailMap: Record<string, string> = {
    // Tech & Development
    WEB_DEVELOPMENT: "/thumbnails/webdev.avif",
    MOBILE_DEVELOPMENT: "/thumbnails/webdev.avif", // Using webdev as fallback
    UI_UX_DESIGN: "/thumbnails/uxuidesign.avif",
    DATA_SCIENCE: "/thumbnails/datascience.avif",
    MACHINE_LEARNING: "/thumbnails/ai.avif",
    BLOCKCHAIN: "/thumbnails/blockchain.avif",
    GAME_DEVELOPMENT: "/thumbnails/gamedev.avif",
    CYBERSECURITY: "/thumbnails/cybersecurity.avif",
    CLOUD_COMPUTING: "/thumbnails/cloudcomputing.avif",
    DEVOPS: "/thumbnails/cloudcomputing.avif", // Similar to cloud computing
    API_DEVELOPMENT: "/thumbnails/code.avif",
    DATABASE_DESIGN: "/thumbnails/database.avif",
    SOFTWARE_TESTING: "/thumbnails/code.avif",

    // Business & Analytics
    BUSINESS_ANALYTICS: "/thumbnails/finance.avif",
    DIGITAL_MARKETING: "/thumbnails/seo.avif",
    FINANCIAL_ANALYSIS: "/thumbnails/finance.avif",
    ACCOUNTING: "/thumbnails/accounting.avif",
    PROJECT_MANAGEMENT: "/thumbnails/finance.avif", // Using finance as business-related
    PRODUCT_MANAGEMENT: "/thumbnails/finance.avif",
    MARKET_RESEARCH: "/thumbnails/finance.avif",

    // Creative & Media
    CONTENT_CREATION: "/thumbnails/socialmedia.avif",
    GRAPHIC_DESIGN: "/thumbnails/graphic.avif",
    VIDEO_PRODUCTION: "/thumbnails/graphic.avif", // Using graphic as creative
    PHOTOGRAPHY: "/thumbnails/graphic.avif",
    MUSIC_PRODUCTION: "/thumbnails/music.avif",
    PODCAST_PRODUCTION: "/thumbnails/music.avif", // Similar to music production
    FASHION_DESIGN: "/thumbnails/fashion.avif",

    // Writing & Communication
    TECHNICAL_WRITING: "/thumbnails/code.avif", // Tech-related writing
    LANGUAGE_TRANSLATION: "/thumbnails/education.avif",
    SOCIAL_MEDIA_MANAGEMENT: "/thumbnails/socialmedia.avif",

    // Legal & Healthcare
    LEGAL_RESEARCH: "/thumbnails/legal.avif",
    HEALTHCARE_IT: "/thumbnails/healthcare.avif",
    BIOTECH_RESEARCH: "/thumbnails/healthcare.avif",

    // Engineering
    CIVIL_ENGINEERING: "/thumbnails/construction.avif",
    MECHANICAL_ENGINEERING: "/thumbnails/mechanical.avif",
    ELECTRICAL_ENGINEERING: "/thumbnails/electrical.avif",
    ENVIRONMENTAL_SCIENCE: "/thumbnails/agriculture.avif", // Nature-related

    // Education & Research
    EDUCATION_TECH: "/thumbnails/education.avif",
    PSYCHOLOGY_RESEARCH: "/thumbnails/healthcare.avif", // Related to health/wellness

    // E-commerce & Business
    E_COMMERCE: "/thumbnails/retail.avif",
    LOGISTICS: "/thumbnails/construction.avif", // Using construction for logistics
    SUPPLY_CHAIN: "/thumbnails/construction.avif",
    HUMAN_RESOURCES: "/thumbnails/finance.avif", // Business-related

    // Design & Architecture
    ARCHITECTURE: "/thumbnails/construction.avif",
    INTERIOR_DESIGN: "/thumbnails/fashion.avif", // Creative design

    // Nonprofit & Government
    NONPROFIT_OUTREACH: "/thumbnails/socialmedia.avif",
    GOVERNMENT_POLICY: "/thumbnails/legal.avif",
    SUSTAINABILITY: "/thumbnails/agriculture.avif",

    // Agriculture & Food
    AGRICULTURE_TECH: "/thumbnails/agriculture.avif",
    FOOD_SCIENCE: "/thumbnails/agriculture.avif",

    // Hospitality & Tourism
    HOSPITALITY: "/thumbnails/toursim.avif",
    TOURISM: "/thumbnails/toursim.avif",

    // Industries
    REAL_ESTATE: "/thumbnails/construction.avif",
    INSURANCE: "/thumbnails/finance.avif",
    TELECOMMUNICATIONS: "/thumbnails/electrical.avif",
    AUTOMOTIVE: "/thumbnails/automative.avif",
    AEROSPACE: "/thumbnails/aerospace.avif",
    ENERGY: "/thumbnails/electrical.avif",
    MINING: "/thumbnails/mining.avif",
    CONSTRUCTION: "/thumbnails/construction.avif",
    RETAIL: "/thumbnails/retail.avif",
    MANUFACTURING: "/thumbnails/manufactoring.avif",

    // Fallback
    OTHER: "/placeholder.jpg",
  };

  return thumbnailMap[category] || "/placeholder.jpg";
}
