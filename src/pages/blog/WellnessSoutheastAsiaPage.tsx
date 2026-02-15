// International blog: wellness & spa trends across Southeast Asia (Indonesia, Thailand, Malaysia, Singapore, Vietnam)
import React, { useEffect } from 'react';
import { setupBlogArticleSEO } from '../../utils/seoSchema';
import BlogArticleLayout from '../../components/blog/BlogArticleLayout';

interface Props {
  onNavigate?: (page: string) => void;
  t?: any;
  language?: 'en' | 'id';
  onLanguageChange?: (lang: string) => void;
  onMassageJobsClick?: () => void;
  onVillaPortalClick?: () => void;
  onTherapistPortalClick?: () => void;
  onMassagePlacePortalClick?: () => void;
  onAgentPortalClick?: () => void;
  onCustomerPortalClick?: () => void;
  onAdminPortalClick?: () => void;
  onTermsClick?: () => void;
  onPrivacyClick?: () => void;
  therapists?: any[];
  places?: any[];
}

const WellnessSoutheastAsiaPage: React.FC<Props> = (props) => {
  const { onNavigate } = props;

  useEffect(() => {
    const cleanup = setupBlogArticleSEO({
      title: 'Wellness & Spa Trends Across Southeast Asia: Indonesia, Thailand, Malaysia, Singapore, Vietnam',
      description: 'Compare wellness tourism, massage demand, and spa standards across Southeast Asian markets. Insights for therapists, massage places and spa owners in Indonesia, Thailand, Malaysia, Singapore and Vietnam.',
      url: 'https://www.indastreetmassage.com/blog-wellness-southeast-asia',
      image: 'https://ik.imagekit.io/7grri5v7d/massage%20therapist%20indonisea.png?updatedAt=1761563061042',
      datePublished: '2025-11-05T08:00:00Z',
      dateModified: '2025-11-05T12:00:00Z',
      author: 'IndaStreet Research',
      keywords: ['wellness Southeast Asia', 'spa trends Thailand Malaysia Singapore Vietnam Indonesia', 'massage tourism Asia', 'spa standards multiple countries'],
      breadcrumbs: [
        { name: 'Home', url: 'https://www.indastreetmassage.com/' },
        { name: 'Blog', url: 'https://www.indastreetmassage.com/blog' },
        { name: 'Wellness & Spa Trends Southeast Asia', url: 'https://www.indastreetmassage.com/blog-wellness-southeast-asia' }
      ]
    });
    return cleanup;
  }, []);

  return (
    <BlogArticleLayout
      title="Wellness & Spa Trends Across Southeast Asia: Indonesia, Thailand, Malaysia, Singapore, Vietnam"
      category="International"
      author="IndaStreet Research"
      date="Nov 5, 2025"
      readTime="10 min read"
      heroImageSrc="https://ik.imagekit.io/7grri5v7d/massage%20therapist%20indonisea.png?updatedAt=1761563061042"
      heroImageAlt="Wellness and spa industry across Southeast Asia"
      breadcrumbLabel="Wellness Southeast Asia"
      onNavigate={onNavigate}
      onLanguageChange={props.onLanguageChange}
      language={props.language}
      t={props.t}
      onMassageJobsClick={props.onMassageJobsClick}
      onVillaPortalClick={props.onVillaPortalClick}
      onTherapistPortalClick={props.onTherapistPortalClick}
      onMassagePlacePortalClick={props.onMassagePlacePortalClick}
      onAgentPortalClick={props.onAgentPortalClick}
      onCustomerPortalClick={props.onCustomerPortalClick}
      onAdminPortalClick={props.onAdminPortalClick}
      onTermsClick={props.onTermsClick}
      onPrivacyClick={props.onPrivacyClick}
      therapists={props.therapists}
      places={props.places}
    >
      <p className="text-lg text-gray-700 mb-6 leading-relaxed">
        Southeast Asia is one of the world’s leading regions for wellness tourism, massage and spa. This article brings together information from Indonesia, Thailand, Malaysia, Singapore and Vietnam so therapists, massage places and spa owners can see how demand, standards and opportunities differ across these markets.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Indonesia: Bali and Beyond</h2>
      <p className="text-gray-700 mb-6 leading-relaxed">
        Indonesia leads with Bali as a major wellness hub. Traditional massage, spa resorts and villa-based services are strong. Demand is high from both domestic and international guests. Therapists and spas here benefit from a well-established tourism and wellness ecosystem.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Thailand: Traditional Thai Massage and Spa</h2>
      <p className="text-gray-700 mb-6 leading-relaxed">
        Thailand is known for traditional Thai massage and luxury spas. Bangkok, Phuket and Chiang Mai attract millions of wellness travellers. Standards and training are widely recognised, and many therapists and spa brands operate across the country and into neighbouring markets.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Malaysia and Singapore: Urban and Resort Demand</h2>
      <p className="text-gray-700 mb-6 leading-relaxed">
        Malaysia and Singapore combine urban day spas with resort wellness. Singapore is a hub for high-end treatments and professional standards; Malaysia offers a mix of city and island demand. Both markets value hygiene, certification and clear pricing — important for therapists and massage places building trust.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Vietnam: Growing Wellness and Spa Market</h2>
      <p className="text-gray-700 mb-6 leading-relaxed">
        Vietnam’s wellness and spa sector is growing quickly. Cities and coastal destinations are seeing more massage and spa offerings. Therapists and spa owners entering or expanding here can learn from regulations and customer expectations in neighbouring countries to plan services and positioning.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Comparing Demand and Standards</h2>
      <p className="text-gray-700 mb-6 leading-relaxed">
        Demand for massage and spa varies by country: resort-heavy markets (Indonesia, Thailand) lean toward longer, experience-led treatments; city markets (Singapore, parts of Malaysia) often favour shorter, results-oriented sessions. Understanding these differences helps therapists and massage places tailor services and marketing in each market.
      </p>

      <div className="bg-orange-50 border-l-4 border-orange-500 p-6 mb-8 rounded-r-xl">
        <p className="text-gray-800 font-medium">For therapists, massage places and spas: staying informed on trends and standards across Southeast Asia helps with career choices, business expansion and serving guests from multiple countries.</p>
      </div>

      <div className="mt-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <button type="button" onClick={() => onNavigate?.('blog-massage-spa-standards-asia-europe')} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow text-left border border-gray-100">
            <h4 className="text-lg font-bold text-gray-900 mb-2">Massage & Spa Standards: Asia and Europe</h4>
            <p className="text-gray-600 text-sm">Regulations and best practices across markets.</p>
          </button>
          <button type="button" onClick={() => onNavigate?.('blog')} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow text-left border border-gray-100">
            <h4 className="text-lg font-bold text-gray-900 mb-2">All Blog Articles</h4>
            <p className="text-gray-600 text-sm">More insights for therapists, massage places and skin clinics.</p>
          </button>
        </div>
      </div>
    </BlogArticleLayout>
  );
};

export default WellnessSoutheastAsiaPage;
