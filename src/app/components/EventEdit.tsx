import { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Calendar,
  User as UserIcon,
  Users as UsersIcon,
  Clock,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { PageHeader, SecondaryButton, PrimaryButton } from './hb/listing';
import { FormSection, FormField, FormLabel, FormInput, StatusSlider } from './hb/common';
import { Event } from '../../mockAPI/eventsData';
import { toast } from 'sonner';

interface EventEditProps {
  event: Event;
  onBack: () => void;
}

export default function EventEdit({ event, onBack }: EventEditProps) {
  const [formData, setFormData] = useState({
    name: event.name,
    host: event.host,
    status: event.status as 'active' | 'expired',
    startDate: event.startDate.split('T')[0],
    expiryDate: event.expiryDate.split('T')[0],
    chatState: event.chatState as 'active' | 'archived',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Event updated successfully.");
      onBack();
    } catch (err) {
      toast.error("Failed to update event.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950 min-h-screen">
      <div className="max-w-[100%] mx-auto">
        {/* PAGE HEADER */}
        <PageHeader
          title="Edit Event Details"
          breadcrumbs={[
            { label: 'Event Management', onClick: onBack },
            { label: 'View Details', onClick: onBack },
            { label: 'Edit', current: true },
          ]}
        >
          <div className="flex items-center gap-3">
            <SecondaryButton icon={ArrowLeft} onClick={onBack}>
              Cancel
            </SecondaryButton>
            <PrimaryButton 
              icon={Save} 
              onClick={handleSave}
              isLoading={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </PrimaryButton>
          </div>
        </PageHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MAIN FORM AREA */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <Calendar className="w-4 h-4 text-primary-600" />
                General Information
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField>
                  <FormLabel required>Event Name</FormLabel>
                  <FormInput
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter event name"
                  />
                </FormField>

                <FormField>
                  <FormLabel required>Primary Host</FormLabel>
                  <FormInput
                    value={formData.host}
                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                    placeholder="Enter host name"
                  />
                </FormField>
              </div>
            </div>

            {/* Timeline & Schedule */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <Clock className="w-4 h-4 text-primary-600" />
                Timeline & Schedule
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField>
                  <FormLabel required>Start Date</FormLabel>
                  <FormInput
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </FormField>

                <FormField>
                  <FormLabel required>Expiry Date</FormLabel>
                  <FormInput
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </FormField>
              </div>
            </div>

            {/* Event Settings */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <UsersIcon className="w-4 h-4 text-primary-600" />
                Event Controls
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField>
                  <FormLabel>Event Status</FormLabel>
                  <StatusSlider
                    value={formData.status}
                    onChange={(val) => setFormData({ ...formData, status: val as 'active' | 'expired' })}
                    options={[
                      { value: 'active', label: 'Active', color: 'bg-success-500' },
                      { value: 'expired', label: 'Expired', color: 'bg-error-500' },
                    ]}
                  />
                </FormField>

                <FormField>
                  <FormLabel>Chat Room State</FormLabel>
                  <StatusSlider
                    value={formData.chatState}
                    onChange={(val) => setFormData({ ...formData, chatState: val as 'active' | 'archived' })}
                    options={[
                      { value: 'active', label: 'Enabled', color: 'bg-primary-500' },
                      { value: 'archived', label: 'Archived', color: 'bg-neutral-400' },
                    ]}
                  />
                </FormField>
              </div>
            </div>
          </div>

          {/* SIDEBAR INFO */}
          <div className="space-y-6">
            <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Admin Policy</h3>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed italic">
                Modifying event dates will automatically update participants' calendars. If an event is set to "Expired", the chat room will be moved to an archived state by default.
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">Event Reference</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 block mb-1">Event ID</label>
                  <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-neutral-600 dark:text-neutral-400">{event.id}</code>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 block mb-1">Created By</label>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">{event.host}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
