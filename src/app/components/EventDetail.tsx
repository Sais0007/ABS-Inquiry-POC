import { useState } from 'react';
import { 
  ArrowLeft,
  Calendar,
  User as UserIcon,
  Users as UsersIcon,
  Clock,
  Layout,
  MessageSquare,
  Image as ImageIcon,
  CheckCircle2,
  HelpCircle,
  XCircle,
  ShieldCheck,
  Edit
} from 'lucide-react';
import { PageHeader, SecondaryButton, PrimaryButton } from './hb/listing';
import { StatCard } from './hb/common/StatCard';
import { ReadOnlyBanner } from './hb/common/ReadOnlyBanner';
import { Event } from '../../mockAPI/eventsData';

interface EventDetailProps {
  event: Event;
  onBack: () => void;
  onEdit: () => void;
}

export default function EventDetail({ event, onBack, onEdit }: EventDetailProps) {
  const getStatusBadge = (status: string) => {
    const isActive = status === 'active';
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${
        isActive 
          ? 'bg-success-50 text-success-600 border-success-100 dark:bg-success-950/20 dark:text-success-400 dark:border-success-900/30' 
          : 'bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800'
      }`}>
        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-success-500' : 'bg-neutral-400'}`}></div>
        <span className="text-xs font-medium">
          {isActive ? 'Active' : 'Expired'}
        </span>
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'engagement'>('overview');

  return (
    <div className="p-5 md:p-6 bg-transparent dark:bg-neutral-950 px-[8px] py-[8px]">
      <div className="max-w-[100%] mx-auto">
        {/* PROFILE HEADER SECTION */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            {/* Left Side - Event Info */}
            <div className="flex-1">
              {/* Name and ID */}
              <div className="flex items-center gap-3 mb-2">
                <h1 style={{ fontSize: '18px', fontWeight: '600' }} className="text-neutral-900 dark:text-white">
                  {event.name}
                </h1>
                <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-700"></div>
                <span style={{ fontWeight: 'medium' }} className="text-sm text-neutral-900 dark:text-white">
                  System Event
                </span>
                <span className="text-neutral-400 dark:text-neutral-600">•</span>
                <span style={{ fontWeight: '400' }} className="text-sm text-neutral-600 dark:text-neutral-400 font-mono">
                  {event.id}
                </span>
              </div>

              {/* Contact Details Row */}
              <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                <div className="flex items-center gap-1">
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Host: {event.host}</span>
                </div>
                <span className="text-neutral-400 dark:text-neutral-600">•</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Scheduled {formatDate(event.startDate)}</span>
                </div>
              </div>

              {/* Status Tags Row */}
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(event.status)}
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-400"></div>
                  <span className="text-xs text-neutral-600 dark:text-neutral-400">Public Event</span>
                </span>
              </div>
            </div>

            {/* Right Side - Action Buttons */}
            <div className="flex items-center gap-2">
              <SecondaryButton icon={ArrowLeft} onClick={onBack}>
                Back
              </SecondaryButton>
              <PrimaryButton icon={Edit} onClick={onEdit}>
                Edit Event
              </PrimaryButton>
            </div>
          </div>
        </div>

        {/* READ-ONLY BANNER */}
        <ReadOnlyBanner message="This event is view-only for Admin. No event actions are available." />

        {/* TWO-COLUMN LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-6 mt-6">
          {/* LEFT COLUMN - Tabs + Content (70%) */}
          <div className="flex-1 lg:w-[70%] border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden flex flex-col">
            {/* HORIZONTAL TABS */}
            <div className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/30">
              <div className="flex px-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-3 text-sm whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === 'overview'
                      ? 'border-primary-600 dark:border-primary-400 text-neutral-900 dark:text-white font-semibold'
                      : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  Event Overview
                </button>
                <button
                  onClick={() => setActiveTab('engagement')}
                  className={`px-4 py-3 text-sm whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === 'engagement'
                      ? 'border-primary-600 dark:border-primary-400 text-neutral-900 dark:text-white font-semibold'
                      : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  Engagement Metrics
                </button>
              </div>
            </div>

            {/* TAB CONTENT */}
            <div className="p-6 bg-white dark:bg-neutral-950 flex-1">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Summary Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard 
                      label="Going" 
                      value={event.metrics.going} 
                      icon={CheckCircle2}
                      valueClassName="text-success-600 dark:text-success-400"
                      className="bg-neutral-50 dark:bg-neutral-900/50"
                    />
                    <StatCard 
                      label="Maybe" 
                      value={event.metrics.maybe} 
                      icon={HelpCircle}
                      valueClassName="text-primary-600 dark:text-primary-400"
                      className="bg-neutral-50 dark:bg-neutral-900/50"
                    />
                    <StatCard 
                      label="Not Going" 
                      value={event.metrics.notGoing} 
                      icon={XCircle}
                      className="bg-neutral-50 dark:bg-neutral-900/50"
                    />
                  </div>

                  {/* Lifecycle Card */}
                  <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                    <h4 style={{ fontSize: '14px', fontWeight: '500' }} className="text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                      Lifecycle & Timeline
                    </h4>
                    <div className="px-6 pb-6 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">
                            Created Date
                          </label>
                          <p className="text-sm text-neutral-900 dark:text-white">{formatDate(event.createdDate)}</p>
                        </div>
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">
                            Scheduled Start
                          </label>
                          <p className="text-sm text-neutral-900 dark:text-white font-medium">{formatDate(event.startDate)}</p>
                        </div>
                        <div>
                          <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">
                            Scheduled Expiry
                          </label>
                          <p className="text-sm text-neutral-900 dark:text-white font-medium">{formatDate(event.expiryDate)}</p>
                        </div>
                        {event.status === 'expired' && event.expiredDate && (
                          <div>
                            <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1.5">
                              Actual Expiry
                            </label>
                            <p className="text-sm text-error-600 font-bold">{formatDate(event.expiredDate)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'engagement' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Participants Card */}
                  <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-primary-600 dark:text-primary-400">
                        <UsersIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Participants</h3>
                        <p className="text-xs text-neutral-500">Total reach</p>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-neutral-900 dark:text-white">
                        {event.metrics.participantCount}
                      </span>
                      <span className="text-sm text-neutral-500 font-medium">Members</span>
                    </div>
                  </div>

                  {/* Media Assets Card */}
                  <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Media Assets</h3>
                        <p className="text-xs text-neutral-500">Shared photos</p>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-neutral-900 dark:text-white">
                        {event.metrics.mediaCount}
                      </span>
                      <span className="text-sm text-neutral-500 font-medium">Photos</span>
                    </div>
                  </div>

                  {/* Chat State Card */}
                  <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Chat State</h3>
                        <p className="text-xs text-neutral-500">Discussion</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        event.chatState === 'active' 
                          ? 'bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-400' 
                          : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                      }`}>
                        {event.chatState}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - Sidebar (30%) */}
          <div className="lg:w-[30%] space-y-6">
            {/* Host Information Card */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm">
              <h4 style={{ fontSize: '14px', fontWeight: '500' }} className="text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                Host Information
              </h4>
              <div className="px-6 py-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                    {event.host.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">{event.host}</p>
                    <p className="text-xs text-neutral-500">Event Organizer</p>
                  </div>
                </div>

                {event.coHosts.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Co-Hosts</label>
                    <div className="flex flex-wrap gap-2">
                      {event.coHosts.map((cohost, idx) => (
                        <span key={idx} className="px-2 py-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded text-xs text-neutral-600 dark:text-neutral-400">
                          {cohost}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Controls Card */}
            <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              </div>
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">Admin Access</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed italic">
                Read-only monitoring mode active. Only the primary host can modify event parameters or manage participant permissions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
