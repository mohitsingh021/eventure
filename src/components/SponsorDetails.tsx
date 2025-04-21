import { Sponsor } from '../types';
import { BuildingOfficeIcon, TagIcon, MegaphoneIcon } from '@heroicons/react/24/outline';

interface SponsorDetailsProps {
  sponsor: Sponsor;
}

const SponsorDetails = ({ sponsor }: SponsorDetailsProps) => {
  return (
    <div>
      <h2 className="text-lg font-semibold">Sponsor Details</h2>
      
      {/* Company Name */}
      <div className="mt-4">
        <h3 className="text-md font-medium flex items-center">
          <BuildingOfficeIcon className="h-5 w-5 mr-2 text-indigo-500" />
          Company Name
        </h3>
        <p className="mt-2 text-gray-600">
          {sponsor.companyName || sponsor.displayName}
        </p>
      </div>
      
      {/* Event Types Sponsored */}
      <div className="mt-6">
        <h3 className="text-md font-medium flex items-center">
          <TagIcon className="h-5 w-5 mr-2 text-indigo-500" />
          Event Types Sponsored
        </h3>
        
        {!sponsor.eventTypesSponsored || sponsor.eventTypesSponsored.length === 0 ? (
          <p className="mt-2 text-gray-500">No event types specified.</p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {sponsor.eventTypesSponsored.map((eventType, index) => (
              <span 
                key={index} 
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
              >
                {eventType}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Preferred Promotion Format */}
      <div className="mt-6">
        <h3 className="text-md font-medium flex items-center">
          <MegaphoneIcon className="h-5 w-5 mr-2 text-indigo-500" />
          Preferred Promotion Format
        </h3>
        
        {!sponsor.preferredPromotionFormat || sponsor.preferredPromotionFormat.length === 0 ? (
          <p className="mt-2 text-gray-500">No promotion formats specified.</p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {sponsor.preferredPromotionFormat.map((format, index) => (
              <span 
                key={index} 
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                {format}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SponsorDetails; 