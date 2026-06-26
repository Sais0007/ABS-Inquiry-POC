import { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Eye,
  Calendar,
  User as UserIcon,
  Clock,
  RefreshCw,
  Users as UsersIcon,
  MoreVertical,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Download,
  Edit,
  FileSpreadsheet,
  FileText,
  BarChart3
} from 'lucide-react';
import { 
  PageHeader,
  SearchBar,
  IconButton,
  ViewModeSwitcher,
  Pagination,
  AdvancedSearchPanel,
  PrimaryButton,
  ColumnVisibilityPanel,
  SummaryWidgets,
  type ColumnConfig
} from './hb/listing';
import type { FilterCondition } from './hb/listing';
import { mockEvents, Event } from '../../mockAPI/eventsData';
import EventDetail from './EventDetail';
import EventEdit from './EventEdit';
import { toast } from 'sonner';

type ViewMode = 'grid' | 'list' | 'table';
type ViewModeState = 'list' | 'detail' | 'edit';

export default function EventManagement() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewModeState, setViewModeState] = useState<ViewModeState>('list');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showSummary, setShowSummary] = useState(true);

  // Column Visibility State
  const [showColumnPanel, setShowColumnPanel] = useState(false);
  const columnAnchorRef = useRef<HTMLDivElement>(null);
  const eventColumns: ColumnConfig[] = [
    { key: 'id', label: 'Event Id' },
    { key: 'name', label: 'Event Name' },
    { key: 'host', label: 'Host' },
    { key: 'status', label: 'Status' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'expiryDate', label: 'Expiry Date' },
  ];
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    id: true,
    name: true,
    host: true,
    status: true,
    startDate: true,
    expiryDate: true,
  });

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const [sortField, setSortField] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortArrow = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-neutral-400 ml-1 inline-block opacity-40 hover:opacity-100 transition-opacity" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-primary-600 dark:text-primary-400 ml-1 inline-block" />
    ) : (
      <ArrowDown className="w-3 h-3 text-primary-600 dark:text-primary-400 ml-1 inline-block" />
    );
  };

  // Filter and Search Logic
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = 
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilters = filters.every(filter => {
        if (filter.field === 'Status') {
          return filter.values.some(v => {
            const statusMap: Record<string, string> = { 'Active': 'active', 'Expired': 'expired' };
            return statusMap[v] === event.status;
          });
        }
        return true;
      });

      return matchesSearch && matchesFilters;
    });
  }, [events, searchQuery, filters]);

  // Sorting Logic
  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      let aVal = (a as any)[sortField] || '';
      let bVal = (b as any)[sortField] || '';
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredEvents, sortField, sortDirection]);

  // Pagination Logic
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedEvents.slice(start, start + itemsPerPage);
  }, [sortedEvents, currentPage]);

  // Auto-close column visibility panel when leaving table view
  useEffect(() => {
    if (viewMode !== 'table') {
      setShowColumnPanel(false);
    }
  }, [viewMode]);

  // Enhanced Export handler (CSV/PDF)
  const handleExport = (format: 'excel' | 'pdf') => {
    const dataToExport = selectedIds.size > 0 
      ? sortedEvents.filter(ev => selectedIds.has(ev.id))
      : sortedEvents;

    if (dataToExport.length === 0) {
      toast.error('No data available to export.');
      return;
    }

    const columnsToExport = eventColumns.filter(col => visibleColumns[col.key]);

    if (format === 'excel') {
      const headers = columnsToExport.map(col => `"${col.label}"`).join(',');
      const rows = dataToExport.map(item => 
        columnsToExport.map(col => {
          let val = (item as any)[col.key];
          if (col.key === 'startDate' || col.key === 'expiryDate') {
            val = new Date(val).toLocaleDateString('en-GB');
          }
          return `"${String(val || '').replace(/"/g, '""')}"`;
        }).join(',')
      );
      const csvContent = [headers, ...rows].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `events_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Successfully exported ${dataToExport.length} events to Excel.`);
    } else {
      let reportContent = `EVENT REPORT - Generated on ${new Date().toLocaleString()}\n`;
      reportContent += `Total Records: ${dataToExport.length}\n\n`;
      reportContent += columnsToExport.map(col => col.label.padEnd(25)).join('') + '\n';
      reportContent += '='.repeat(columnsToExport.length * 25) + '\n';
      
      dataToExport.forEach(item => {
        reportContent += columnsToExport.map(col => {
          let val = (item as any)[col.key];
          if (col.key === 'startDate' || col.key === 'expiryDate') {
            val = new Date(val).toLocaleDateString('en-GB');
          }
          return String(val || '').substring(0, 23).padEnd(25);
        }).join('') + '\n';
      });

      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `events_export_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Successfully exported ${dataToExport.length} events to PDF.`);
    }
  };

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  // Handlers
  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
    setViewModeState('detail');
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setViewModeState('edit');
  };

  const handleBackToList = () => {
    setViewModeState('list');
    setSelectedEvent(null);
  };

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
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  if (viewModeState === 'detail' && selectedEvent) {
    return (
      <EventDetail 
        event={selectedEvent} 
        onBack={handleBackToList} 
        onEdit={() => handleEdit(selectedEvent)}
      />
    );
  }

  if (viewModeState === 'edit' && selectedEvent) {
    return (
      <EventEdit 
        event={selectedEvent} 
        onBack={() => setViewModeState('detail')} 
      />
    );
  }

  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950">
      <div className="max-w-[100%] mx-auto">
        {/* PAGE HEADER */}
        <PageHeader
          title="Event Management"
          breadcrumbs={[
            { label: 'Event Management', href: '#' },
            { label: 'Event Management', current: true },
          ]}
        >
          <div className="relative" ref={columnAnchorRef}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onAdvancedSearch={() => setShowAdvancedSearch(true)}
              onToggleColumns={viewMode === 'table' ? () => setShowColumnPanel(!showColumnPanel) : undefined}
              activeFilterCount={filters.filter(f => f.values.length > 0).length}
              placeholder="Search events..."
            />
            <AdvancedSearchPanel
              isOpen={showAdvancedSearch}
              onClose={() => setShowAdvancedSearch(false)}
              filters={filters}
              onFiltersChange={setFilters}
              filterOptions={{ 'Status': ['Active', 'Expired'] }}
            />
            <ColumnVisibilityPanel
              isOpen={showColumnPanel}
              onClose={() => setShowColumnPanel(false)}
              columns={eventColumns}
              visibleColumns={visibleColumns}
              onToggleColumn={toggleColumn}
              anchorRef={columnAnchorRef}
            />
          </div>

          <PrimaryButton icon={Plus} onClick={() => toast.info('Event creation is managed by primary hosts only.')}>
            Add Event
          </PrimaryButton>

          <IconButton icon={BarChart3} onClick={() => setShowSummary(!showSummary)} title="Summary" />
          <IconButton icon={RefreshCw} onClick={() => {}} title="Refresh" />

          <IconButton
            icon={MoreVertical}
            title="More options"
            menuItems={[
              { icon: FileSpreadsheet, label: 'Export as Excel', onClick: () => handleExport('excel') },
              { icon: FileText, label: 'Export as PDF', onClick: () => handleExport('pdf') },
            ]}
          />

          <ViewModeSwitcher
            currentMode={viewMode}
            onChange={setViewMode}
          />
        </PageHeader>

        {/* SUMMARY WIDGETS */}
        {showSummary && (
          <SummaryWidgets
            title="Event Summary"
            widgets={[
              { label: 'Total Events', value: events.length, icon: 'Activity' },
              { label: 'Active Events', value: events.filter(e => e.status === 'active').length, icon: 'CheckCircle' },
              { label: 'Expired Events', value: events.filter(e => e.status === 'expired').length, icon: 'XCircle' },
              { label: 'Draft Events', value: events.filter(e => (e as any).status === 'draft').length, icon: 'Clock' },
            ]}
          />
        )}

        {/* LIST VIEW */}
        {viewMode === 'list' && (
          <div className="space-y-3">
            {paginatedEvents.length > 0 ? (
              paginatedEvents.map((event) => (
                <div
                  key={event.id}
                  className={`bg-white dark:bg-neutral-950 border rounded-lg p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer relative group shadow-sm ${
                    selectedIds.has(event.id)
                      ? 'border-primary-300 dark:border-primary-600'
                      : 'border-neutral-200 dark:border-neutral-800'
                  }`}
                  onClick={() => handleViewDetails(event)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Extreme left Checkbox */}
                      <div onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(event.id)}
                          onChange={() => toggleSelection(event.id)}
                          className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer flex-shrink-0"
                          title="Select"
                        />
                      </div>

                      <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-950 flex items-center justify-center flex-shrink-0 text-primary-600 dark:text-primary-400">
                        <Calendar className="w-6 h-6" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-neutral-900 dark:text-white font-semibold truncate">
                            {event.name}
                          </span>
                          {getStatusBadge(event.status)}
                          <span className="text-xs text-neutral-500 font-mono ml-auto md:ml-0">
                            {event.id}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                          <span className="flex items-center gap-1.5">
                            <UserIcon className="w-3.5 h-3.5 text-neutral-400" />
                            <span className="truncate">{event.host}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{formatDate(event.startDate)}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 ml-4" onClick={e => e.stopPropagation()}>
                      <IconButton
                        icon={MoreVertical}
                        borderless={true}
                        title="Actions"
                        menuItems={[
                          { icon: Eye, label: 'View Event', onClick: () => handleViewDetails(event) },
                          { icon: Edit, label: 'Edit Event', onClick: () => handleEdit(event) },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-20 text-center shadow-sm">
                <h3 className="text-sm font-medium text-neutral-900 dark:text-white">No events found</h3>
              </div>
            )}
          </div>
        )}

        {/* GRID VIEW */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedEvents.length > 0 ? (
              paginatedEvents.map((event) => (
                <div
                  key={event.id}
                  className={`bg-white dark:bg-neutral-950 border rounded-lg p-5 hover:shadow-md transition-all cursor-pointer relative group shadow-sm flex flex-col ${
                    selectedIds.has(event.id)
                      ? 'border-primary-300 dark:border-primary-600 bg-primary-50/20 dark:bg-primary-950/20'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-primary-200 dark:hover:border-primary-800'
                  }`}
                  onClick={() => handleViewDetails(event)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(event.id)}
                        onChange={() => toggleSelection(event.id)}
                        className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer flex-shrink-0"
                        title="Select"
                      />
                      <IconButton
                        icon={MoreVertical}
                        borderless={true}
                        title="Actions"
                        menuItems={[
                          { icon: Eye, label: 'View Event', onClick: () => handleViewDetails(event) },
                          { icon: Edit, label: 'Edit Event', onClick: () => handleEdit(event) },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-neutral-900 dark:text-white truncate mb-1">
                      {event.name}
                    </h4>
                    <p className="text-xs text-neutral-400 font-mono mb-4">
                      {event.id}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <UserIcon className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="truncate">{event.host}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end items-center mt-auto" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(event.status)}
                      <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                        <UsersIcon className="w-3 h-3" />
                        {event.metrics.participantCount}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-20 text-center">
                <h3 className="text-sm font-medium text-neutral-900 dark:text-white">No events found</h3>
              </div>
            )}
          </div>
        )}

        {/* DATA TABLE VIEW */}
        {viewMode === 'table' && (
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                    <th className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3.5 w-12 border-b border-neutral-200 dark:border-neutral-800">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === paginatedEvents.length && paginatedEvents.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(new Set(paginatedEvents.map(ev => ev.id)));
                          } else {
                            setSelectedIds(new Set());
                          }
                        }}
                        className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                      />
                    </th>
                    {visibleColumns.id && (
                      <th 
                        onClick={() => handleSort('id')}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                      >
                        Event Id {renderSortArrow('id')}
                      </th>
                    )}
                    {visibleColumns.name && (
                      <th 
                        onClick={() => handleSort('name')}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                      >
                        Event Name {renderSortArrow('name')}
                      </th>
                    )}
                    {visibleColumns.host && (
                      <th 
                        onClick={() => handleSort('host')}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                      >
                        Host {renderSortArrow('host')}
                      </th>
                    )}
                    {visibleColumns.status && (
                      <th 
                        onClick={() => handleSort('status')}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                      >
                        Status {renderSortArrow('status')}
                      </th>
                    )}
                    {visibleColumns.startDate && (
                      <th 
                        onClick={() => handleSort('startDate')}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                      >
                        Start Date {renderSortArrow('startDate')}
                      </th>
                    )}
                    {visibleColumns.expiryDate && (
                      <th 
                        onClick={() => handleSort('expiryDate')}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                      >
                        Expiry Date {renderSortArrow('expiryDate')}
                      </th>
                    )}
                    <th className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 text-right border-b border-neutral-200 dark:border-neutral-800 tracking-normal">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {paginatedEvents.length > 0 ? (
                    paginatedEvents.map((event) => (
                      <tr 
                        key={event.id} 
                        className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors group cursor-pointer"
                        onClick={() => handleViewDetails(event)}
                      >
                        <td className="px-4 py-3.5 w-12" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(event.id)}
                            onChange={() => toggleSelection(event.id)}
                            className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                          />
                        </td>
                        {visibleColumns.id && (
                          <td className="px-6 py-4 text-sm font-medium text-primary-600 dark:text-primary-400 underline decoration-primary-600/30 underline-offset-4">
                            {event.id}
                          </td>
                        )}
                        {visibleColumns.name && (
                          <td className="px-6 py-4 text-sm font-medium text-neutral-900 dark:text-white group-hover:text-primary-600 transition-colors">
                            {event.name}
                          </td>
                        )}
                        {visibleColumns.host && (
                          <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                            {event.host}
                          </td>
                        )}
                        {visibleColumns.status && (
                          <td className="px-6 py-4">
                            {getStatusBadge(event.status)}
                          </td>
                        )}
                        {visibleColumns.startDate && (
                          <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                            {formatDate(event.startDate)}
                          </td>
                        )}
                        {visibleColumns.expiryDate && (
                          <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                            {formatDate(event.expiryDate)}
                          </td>
                        )}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                            <IconButton 
                              icon={Eye}
                              borderless={true}
                              onClick={() => handleViewDetails(event)}
                              title="View Details"
                            />
                            <IconButton 
                              icon={Edit}
                              borderless={true}
                              onClick={() => handleEdit(event)}
                              title="Edit"
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                      <tr>
                        <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 2} className="px-6 py-20 text-center">
                          <h3 className="text-sm font-medium text-neutral-900 dark:text-white">No events found</h3>
                        </td>
                      </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAGINATION */}
        <div className="mt-6">
          {filteredEvents.length > 0 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredEvents.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
