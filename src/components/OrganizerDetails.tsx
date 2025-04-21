import { Organizer, UpcomingEvent } from '../types';
import { format } from 'date-fns';
import { CalendarIcon, UserGroupIcon, CurrencyDollarIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

interface OrganizerDetailsProps {
  organizer: Organizer;
}

const OrganizerDetails = ({ organizer }: OrganizerDetailsProps) => {
  return (
    <div>
      <h2 className="text-lg font-semibold">Event Organizer Details</h2>
      
      {/* Past Events */}
      <div className="mt-4">
        <h3 className="text-md font-medium flex items-center">
          <ClipboardDocumentListIcon className="h-5 w-5 mr-2 text-indigo-500" />
          Past Events
        </h3>
        <p className="mt-2 text-gray-600">
          {organizer.pastEvents || 'No past events listed.'}
        </p>
      </div>
      
      {/* Upcoming Events */}
      <div className="mt-6">
        <h3 className="text-md font-medium mb-3">Upcoming Events</h3>
        
        {!organizer.upcomingEvents || organizer.upcomingEvents.length === 0 ? (
          <p className="text-gray-500">No upcoming events listed.</p>
        ) : (
          <div className="space-y-4">
            {organizer.upcomingEvents.map((event: UpcomingEvent) => (
              <div key={event.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-medium text-indigo-600">{event.name}</h4>
                
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                    {event.date && format(new Date(event.date.toDate()), 'MMM d, yyyy')}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <CurrencyDollarIcon className="h-4 w-4 mr-1 text-gray-400" />
                    Budget: {event.budgetRange}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <UserGroupIcon className="h-4 w-4 mr-1 text-gray-400" />
                    Audience: {event.audienceType}
                  </div>
                </div>
                
                <p className="mt-2 text-sm text-gray-600">{event.description}</p>
                
                <div className="mt-2">
                  <h5 className="text-sm font-medium">Sponsorship Requirements:</h5>
                  <p className="text-sm text-gray-600">{event.sponsorshipRequirements}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerDetails; 