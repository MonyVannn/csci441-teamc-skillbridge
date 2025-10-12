/**
 * Maps project categories to their respective thumbnail images
 * Returns the path to the thumbnail image based on the project category
 */
export function getCategoryThumbnail(category: string): string {
  const thumbnailMap: Record<string, string> = {
    // Tech & Development
    WEB_DEVELOPMENT: "/thumbnails/webdev.webp",
    MOBILE_DEVELOPMENT: "/thumbnails/webdev.webp", // Using webdev as fallback
    UI_UX_DESIGN: "/thumbnails/uxuidesign.webp",
    DATA_SCIENCE: "/thumbnails/datascience.webp",
    MACHINE_LEARNING: "/thumbnails/ai.webp",
    BLOCKCHAIN: "/thumbnails/blockchain.webp",
    GAME_DEVELOPMENT: "/thumbnails/gamedev.webp",
    CYBERSECURITY: "/thumbnails/cybersecurity.webp",
    CLOUD_COMPUTING: "/thumbnails/cloudcomputing.webp",
    DEVOPS: "/thumbnails/cloudcomputing.webp", // Similar to cloud computing
    API_DEVELOPMENT: "/thumbnails/code.webp",
    DATABASE_DESIGN: "/thumbnails/database.webp",
    SOFTWARE_TESTING: "/thumbnails/code.webp",

    // Business & Analytics
    BUSINESS_ANALYTICS: "/thumbnails/finance.webp",
    DIGITAL_MARKETING: "/thumbnails/seo.webp",
    FINANCIAL_ANALYSIS: "/thumbnails/finance.webp",
    ACCOUNTING: "/thumbnails/accounting.webp",
    PROJECT_MANAGEMENT: "/thumbnails/finance.webp", // Using finance as business-related
    PRODUCT_MANAGEMENT: "/thumbnails/finance.webp",
    MARKET_RESEARCH: "/thumbnails/finance.webp",

    // Creative & Media
    CONTENT_CREATION: "/thumbnails/socialmedia.webp",
    GRAPHIC_DESIGN: "/thumbnails/graphic.webp",
    VIDEO_PRODUCTION: "/thumbnails/graphic.webp", // Using graphic as creative
    PHOTOGRAPHY: "/thumbnails/graphic.webp",
    MUSIC_PRODUCTION: "/thumbnails/music.webp",
    PODCAST_PRODUCTION: "/thumbnails/music.webp", // Similar to music production
    FASHION_DESIGN: "/thumbnails/fashion.webp",

    // Writing & Communication
    TECHNICAL_WRITING: "/thumbnails/code.webp", // Tech-related writing
    LANGUAGE_TRANSLATION: "/thumbnails/education.webp",
    SOCIAL_MEDIA_MANAGEMENT: "/thumbnails/socialmedia.webp",

    // Legal & Healthcare
    LEGAL_RESEARCH: "/thumbnails/legal.webp",
    HEALTHCARE_IT: "/thumbnails/healthcare.webp",
    BIOTECH_RESEARCH: "/thumbnails/healthcare.webp",

    // Engineering
    CIVIL_ENGINEERING: "/thumbnails/construction.webp",
    MECHANICAL_ENGINEERING: "/thumbnails/mechanical.webp",
    ELECTRICAL_ENGINEERING: "/thumbnails/electrical.webp",
    ENVIRONMENTAL_SCIENCE: "/thumbnails/agriculture.webp", // Nature-related

    // Education & Research
    EDUCATION_TECH: "/thumbnails/education.webp",
    PSYCHOLOGY_RESEARCH: "/thumbnails/healthcare.webp", // Related to health/wellness

    // E-commerce & Business
    E_COMMERCE: "/thumbnails/retail.webp",
    LOGISTICS: "/thumbnails/construction.webp", // Using construction for logistics
    SUPPLY_CHAIN: "/thumbnails/construction.webp",
    HUMAN_RESOURCES: "/thumbnails/finance.webp", // Business-related

    // Design & Architecture
    ARCHITECTURE: "/thumbnails/construction.webp",
    INTERIOR_DESIGN: "/thumbnails/fashion.webp", // Creative design

    // Nonprofit & Government
    NONPROFIT_OUTREACH: "/thumbnails/socialmedia.webp",
    GOVERNMENT_POLICY: "/thumbnails/legal.webp",
    SUSTAINABILITY: "/thumbnails/agriculture.webp",

    // Agriculture & Food
    AGRICULTURE_TECH: "/thumbnails/agriculture.webp",
    FOOD_SCIENCE: "/thumbnails/agriculture.webp",

    // Hospitality & Tourism
    HOSPITALITY: "/thumbnails/toursim.webp",
    TOURISM: "/thumbnails/toursim.webp",

    // Industries
    REAL_ESTATE: "/thumbnails/construction.webp",
    INSURANCE: "/thumbnails/finance.webp",
    TELECOMMUNICATIONS: "/thumbnails/electrical.webp",
    AUTOMOTIVE: "/thumbnails/automative.webp",
    AEROSPACE: "/thumbnails/aerospace.webp",
    ENERGY: "/thumbnails/electrical.webp",
    MINING: "/thumbnails/mining.webp",
    CONSTRUCTION: "/thumbnails/construction.webp",
    RETAIL: "/thumbnails/retail.webp",
    MANUFACTURING: "/thumbnails/manufactoring.webp",

    // Fallback
    OTHER: "/placeholder.jpg",
  };

  return thumbnailMap[category] || "/placeholder.jpg";
}
