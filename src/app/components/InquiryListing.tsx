import { useState, useMemo, useRef, useEffect } from 'react';
import { 
  MoreVertical, 
  Search, 
  Filter,
  RefreshCw, 
  Plus, 
  FileSpreadsheet, 
  FileText, 
  BarChart3, 
  Clock, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  ClipboardList
} from 'lucide-react';
import { 
  PageHeader, 
  IconButton, 
  Pagination, 
  PrimaryButton, 
  SummaryWidgets,
  SearchBar
} from './hb/listing';
import { mockInquiries, Inquiry } from '../../mockAPI/inquiriesData';
import { toast } from 'sonner';
import UploadInquiryModal from './UploadInquiryModal';

export default function InquiryListing({ onSelectInquiry }: { onSelectInquiry: (id: string) => void }) {
  const [inquiries, setInquiries] = useState<Inquiry[]>(mockInquiries);
  const [searchQuery, setSearchQuery] = useState('');
  const [extractionFilter, setExtractionFilter] = useState<string>('all');
  const [validationFilter, setValidationFilter] = useState<string>('all');
  const [processingFilter, setProcessingFilter] = useState<string>('all');
  const [uploadedStart, setUploadedStart] = useState<string>('');
  const [uploadedEnd, setUploadedEnd] = useState<string>('');
  const [exportedStart, setExportedStart] = useState<string>('');
  const [exportedEnd, setExportedEnd] = useState<string>('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showSummary, setShowSummary] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [sortField, setSortField] = useState<string>('requestDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Simulate loading state on mount
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleResetFilters = () => {
    setSearchQuery('');
    setExtractionFilter('all');
    setValidationFilter('all');
    setProcessingFilter('all');
    setUploadedStart('');
    setUploadedEnd('');
    setExportedStart('');
    setExportedEnd('');
    toast.info('Filters have been reset.');
  };

  const cleanCustomerName = (fileName: string) => {
    const base = fileName.replace(/\.pdf$/i, "").replace(/[-_]/g, " ");
    return base.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  const generateNextInquiryId = (list: Inquiry[]) => {
    let maxNum = 8;
    const combined = [...list, ...mockInquiries];
    combined.forEach(inq => {
      const match = inq.id.match(/INQ-2026-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    const nextNum = maxNum + 1;
    return `INQ-2026-${String(nextNum).padStart(3, '0')}`;
  };

  const handleUploadSuccess = (fileNames: string[]) => {
    const newInquiries: Inquiry[] = [];
    let currentList = [...inquiries];

    fileNames.forEach(fileName => {
      const nextId = generateNextInquiryId([...currentList, ...newInquiries]);
      const customerName = cleanCustomerName(fileName);
      
      const newInq: Inquiry = {
        id: nextId,
        customerName,
        email: `info@${customerName.toLowerCase().replace(/\s+/g, '')}.com`,
        phone: `+91 22 ${Math.floor(40000000 + Math.random() * 59000000)}`,
        productType: "FIBC U-Panel Bag (Type C Conductive)",
        quantity: Math.floor(Math.random() * 4 + 1) * 5000,
        requestDate: new Date().toISOString(),
        priority: "medium",
        status: "processing",
        processingStatus: "Uploading",
        extraction: "processing",
        validation: "pending",
        swl: "",
        sf: ""
      };

      newInquiries.push(newInq);
    });

    setInquiries(prev => [...newInquiries, ...prev]);
    mockInquiries.unshift(...newInquiries);
    toast.success(`${fileNames.length} inquiries uploaded successfully. AI extraction has started.`);
  };

  // Background simulation pipeline updates
  useEffect(() => {
    const hasProcessing = inquiries.some(i => i.processingStatus === 'Uploading' || i.processingStatus === 'Processing');
    if (!hasProcessing) return;

    const timer = setTimeout(() => {
      setInquiries(prev => {
        let updated = false;
        const next = prev.map(inq => {
          if (inq.processingStatus === 'Uploading') {
            updated = true;
            return {
              ...inq,
              processingStatus: 'Processing' as const,
              processingStep: 'Processing' as const
            };
          } else if (inq.processingStatus === 'Processing') {
            updated = true;
            const currentStep = inq.processingStep || 'Processing';
            
            const steps: ('Processing' | 'PDF Parsing' | 'Field Extraction' | 'Validation' | 'Completed')[] = [
              'Processing', 'PDF Parsing', 'Field Extraction', 'Validation', 'Completed'
            ];
            const currentIndex = steps.indexOf(currentStep);
            
            if (currentIndex < steps.length - 1) {
              const nextStep = steps[currentIndex + 1];
              
              if (nextStep === 'Field Extraction') {
                return {
                  ...inq,
                  processingStep: nextStep,
                  extraction: 'complete' as const,
                  swl: '1000 KG',
                  sf: '5:1'
                };
              } else if (nextStep === 'Validation') {
                return {
                  ...inq,
                  processingStep: nextStep,
                  validation: 'review-required' as const
                };
              } else if (nextStep === 'Completed') {
                return {
                  ...inq,
                  status: 'under-review' as const,
                  processingStatus: 'Ready for Review' as const,
                  processingStep: undefined
                };
              } else {
                return {
                  ...inq,
                  processingStep: nextStep
                };
              }
            }
          }
          return inq;
        });

        if (updated) {
          next.forEach(n => {
            const idx = mockInquiries.findIndex(mi => mi.id === n.id);
            if (idx !== -1) {
              mockInquiries[idx].status = n.status;
              mockInquiries[idx].productType = n.productType;
              mockInquiries[idx].quantity = n.quantity;
              mockInquiries[idx].swl = n.swl;
              mockInquiries[idx].sf = n.sf;
              mockInquiries[idx].extraction = n.extraction;
              mockInquiries[idx].validation = n.validation;
              mockInquiries[idx].processingStatus = n.processingStatus;
            }
          });
        }

        return next;
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [inquiries]);

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
      return <ArrowUpDown className="w-3 h-3 text-neutral-400 ml-1 inline-block opacity-45 hover:opacity-100 transition-opacity" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-primary-600 dark:text-primary-400 ml-1 inline-block" />
    ) : (
      <ArrowDown className="w-3 h-3 text-primary-600 dark:text-primary-400 ml-1 inline-block" />
    );
  };

  // Search, Filter, Sort, and Pagination computation
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((item) => {
      const matchesSearch = 
        item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesExtraction = 
        extractionFilter === 'all' || 
        item.extraction === extractionFilter;

      const matchesValidation = 
        validationFilter === 'all' || 
        item.validation === validationFilter;

      const matchesProcessing = 
        processingFilter === 'all' || 
        item.processingStatus === processingFilter;

      let matchesUploaded = true;
      if (uploadedStart) {
        matchesUploaded = matchesUploaded && new Date(item.requestDate) >= new Date(uploadedStart + 'T00:00:00');
      }
      if (uploadedEnd) {
        matchesUploaded = matchesUploaded && new Date(item.requestDate) <= new Date(uploadedEnd + 'T23:59:59');
      }

      let matchesExported = true;
      if (exportedStart) {
        if (!item.exportedOn) {
          matchesExported = false;
        } else {
          matchesExported = matchesExported && new Date(item.exportedOn) >= new Date(exportedStart + 'T00:00:00');
        }
      }
      if (exportedEnd) {
        if (!item.exportedOn) {
          matchesExported = false;
        } else {
          matchesExported = matchesExported && new Date(item.exportedOn) <= new Date(exportedEnd + 'T23:59:59');
        }
      }

      return matchesSearch && matchesExtraction && matchesValidation && matchesProcessing && matchesUploaded && matchesExported;
    });
  }, [inquiries, searchQuery, extractionFilter, validationFilter, processingFilter, uploadedStart, uploadedEnd, exportedStart, exportedEnd]);

  const sortedInquiries = useMemo(() => {
    return [...filteredInquiries].sort((a, b) => {
      let aVal = (a as any)[sortField] || '';
      let bVal = (b as any)[sortField] || '';
      
      if (sortField === 'exportedOn') {
        if (!a.exportedOn) aVal = sortDirection === 'asc' ? '9999-12-31' : '0000-01-01';
        if (!b.exportedOn) bVal = sortDirection === 'asc' ? '9999-12-31' : '0000-01-01';
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      aVal = String(aVal).toLowerCase();
      bVal = String(bVal).toLowerCase();
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredInquiries, sortField, sortDirection]);

  const paginatedInquiries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedInquiries.slice(start, start + itemsPerPage);
  }, [sortedInquiries, currentPage]);

  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage);

  const handleExport = (format: 'excel' | 'pdf') => {
    const dataToExport = sortedInquiries;

    if (dataToExport.length === 0) {
      toast.error('No inquiry data available to export.');
      return;
    }

    if (format === 'excel') {
      const headers = ['Inquiry Ref No.', 'Customer Name', 'SWL', 'SF', 'Qty', 'Uploaded On', 'Exported On', 'Extraction', 'Validation', 'Processing Status'].join(',');
      const rows = dataToExport.map(i => [
        i.id,
        `"${i.customerName}"`,
        i.swl || '-',
        i.sf || '-',
        i.quantity,
        formatDateTime(i.requestDate),
        i.exportedOn ? formatDateTime(i.exportedOn) : '-',
        i.extraction || '',
        i.validation || '',
        i.processingStatus
      ].join(','));
      
      const csvContent = [headers, ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `abs_inquiries_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Successfully exported ${dataToExport.length} inquiries to Excel.`);
    } else {
      let report = `ABS INQUIRY REPORT - Generated on ${new Date().toLocaleString()}\n`;
      report += `Total Records: ${dataToExport.length}\n\n`;
      report += `${'Ref No.'.padEnd(15)}${'Customer Name'.padEnd(30)}${'SWL'.padEnd(10)}${'SF'.padEnd(10)}${'Qty'.padEnd(10)}${'Processing Status'}\n`;
      report += '='.repeat(90) + '\n';
      
      dataToExport.forEach(i => {
        report += `${i.id.padEnd(15)}${i.customerName.substring(0, 28).padEnd(30)}${(i.swl || '-').padEnd(10)}${(i.sf || '-').padEnd(10)}${String(i.quantity).padEnd(10)}${i.processingStatus}\n`;
      });

      const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `abs_inquiries_export_${new Date().toISOString().split('T')[0]}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Successfully exported ${dataToExport.length} inquiries to Report.`);
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "-";
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = String(date.getDate()).padStart(2, '0');
    const m = months[date.getMonth()];
    const y = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const h = String(hours).padStart(2, '0');

    return `${d}-${m}-${y} ${h}:${minutes} ${ampm}`;
  };

  const getExtractionBadge = (status?: string) => {
    const badgeConfig: Record<string, { label: string, colorClass: string, dotColor: string }> = {
      complete: { label: 'Complete', colorClass: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-250 dark:border-emerald-900/50', dotColor: 'bg-emerald-500' },
      partial: { label: 'Partial', colorClass: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-250 dark:border-amber-900/50', dotColor: 'bg-amber-500' },
      failed: { label: 'Failed', colorClass: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border-rose-250 dark:border-rose-800/50', dotColor: 'bg-rose-500' },
      processing: { label: 'Processing', colorClass: 'text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800', dotColor: 'bg-neutral-400' }
    };
    const config = badgeConfig[status || ''] || badgeConfig.processing;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border rounded-full text-xs font-semibold ${config.colorClass}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`}></div>
        <span>{config.label}</span>
      </span>
    );
  };

  const getValidationBadge = (status?: string) => {
    const badgeConfig: Record<string, { label: string, colorClass: string, dotColor: string }> = {
      valid: { label: 'Valid', colorClass: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-250 dark:border-emerald-900/50', dotColor: 'bg-emerald-500' },
      'review-required': { label: 'Review Required', colorClass: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-250 dark:border-amber-900/50', dotColor: 'bg-amber-500' },
      missing: { label: 'Missing', colorClass: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/50', dotColor: 'bg-rose-500' },
      pending: { label: 'Pending', colorClass: 'text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800', dotColor: 'bg-neutral-400' }
    };
    const config = badgeConfig[status || ''] || badgeConfig.pending;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border rounded-full text-xs font-semibold ${config.colorClass}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`}></div>
        <span>{config.label}</span>
      </span>
    );
  };

  const getProcessingStatusBadge = (pStatus: string) => {
    if (pStatus === 'Uploading' || pStatus === 'Processing') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 border rounded-full bg-amber-50/40 dark:bg-amber-950/10 border-amber-255 dark:border-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-semibold">
          <RefreshCw className="w-3 h-3 animate-spin text-amber-500 shrink-0" />
          <span>{pStatus}</span>
        </span>
      );
    }
    
    const configs: Record<string, { bg: string, text: string, label: string }> = {
      'Ready for Review': { bg: 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-250 dark:border-indigo-900/50', text: 'text-indigo-700 dark:text-indigo-400', label: 'Ready for Review' },
      'Exported': { bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-250 dark:border-emerald-900/50', text: 'text-emerald-700 dark:text-emerald-400', label: 'Exported' },
      'Failed': { bg: 'bg-rose-50 dark:bg-rose-950/20 border-rose-250 dark:border-rose-800/50', text: 'text-rose-700 dark:text-rose-450', label: 'Failed' }
    };
    
    const config = configs[pStatus] || { bg: 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800', text: 'text-neutral-600 dark:text-neutral-400', label: pStatus };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 border rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const handleRowClick = (inquiry: Inquiry) => {
    if (inquiry.processingStatus === 'Uploading' || inquiry.processingStatus === 'Processing') {
      toast.warning("Inquiry is currently processing. Details will be available once extraction completes.");
      return;
    }
    onSelectInquiry(inquiry.id);
  };

  const renderSkeletons = () => {
    return Array.from({ length: 5 }).map((_, idx) => (
      <tr key={`skeleton-${idx}`} className="animate-pulse">
        <td className="p-4"><div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-24"></div></td>
        <td className="p-4"><div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-40"></div></td>
        <td className="p-4"><div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-16"></div></td>
        <td className="p-4"><div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-12"></div></td>
        <td className="p-4 text-right"><div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-16 ml-auto"></div></td>
        <td className="p-4"><div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-28"></div></td>
        <td className="p-4"><div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-28"></div></td>
        <td className="p-4"><div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-20"></div></td>
        <td className="p-4"><div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-24"></div></td>
        <td className="p-4"><div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-28"></div></td>
      </tr>
    ));
  };

  const renderMobileSkeletons = () => {
    return Array.from({ length: 3 }).map((_, idx) => (
      <div key={`m-skeleton-${idx}`} className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3 animate-pulse">
        <div className="flex justify-between">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-24"></div>
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-20"></div>
        </div>
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4"></div>
        <div className="h-8 bg-neutral-100 dark:bg-neutral-950 rounded w-full"></div>
        <div className="flex justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-16"></div>
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-16"></div>
        </div>
      </div>
    ));
  };

  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950">
      <div className="max-w-[100%] mx-auto">
        
        {/* PAGE HEADER */}
        <PageHeader
          title="Inquiry Listing"
          breadcrumbs={[
            { label: 'Asia Bulk Sacks', href: '#' },
            { label: 'Inquiry Listing', current: true },
          ]}
        >
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search Reference No or Customer..."
          />

          <IconButton 
            icon={Filter} 
            onClick={() => setShowFilters(!showFilters)} 
            active={showFilters} 
            title="Toggle Filters" 
          />

          <PrimaryButton icon={Plus} onClick={() => setShowUploadModal(true)}>
            Add Inquiry
          </PrimaryButton>

          <IconButton icon={BarChart3} onClick={() => setShowSummary(!showSummary)} title="Summary Widgets" />
          <IconButton icon={RefreshCw} onClick={() => {
            setIsLoading(true);
            setTimeout(() => {
              setInquiries([...mockInquiries]);
              setIsLoading(false);
              toast.success('Inquiry listings refreshed.');
            }, 500);
          }} title="Refresh Data" />

          <IconButton
            icon={MoreVertical}
            title="Export actions"
            menuItems={[
              { icon: FileSpreadsheet, label: 'Export All as CSV', onClick: () => handleExport('excel') },
              { icon: FileText, label: 'Export All Report', onClick: () => handleExport('pdf') },
            ]}
          />
        </PageHeader>

        {/* SUMMARY WIDGETS */}
        {showSummary && (
          <SummaryWidgets
            title="Inquiry Pipeline"
            widgets={[
              { label: 'Total Inquiries', value: inquiries.length, icon: 'ClipboardList' },
              { label: 'Ready for Review', value: inquiries.filter(i => i.processingStatus === 'Ready for Review').length, icon: 'Clock' },
              { label: 'Exported Inquiries', value: inquiries.filter(i => i.processingStatus === 'Exported').length, icon: 'FileText' },
              { label: 'Active Processing', value: inquiries.filter(i => i.processingStatus === 'Uploading' || i.processingStatus === 'Processing').length, icon: 'RefreshCw' },
            ]}
          />
        )}

        {/* COMPACT FILTER BAR */}
        {showFilters && (
          <div className="mb-6 p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Extraction Status */}
              <div>
                <label className="block text-xs font-semibold text-neutral-450 dark:text-neutral-500 mb-1.5 uppercase tracking-wider">Extraction</label>
                <select
                  value={extractionFilter}
                  onChange={e => setExtractionFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 rounded-lg text-sm text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                >
                  <option value="all">All Extractions</option>
                  <option value="complete">Complete</option>
                  <option value="partial">Partial</option>
                  <option value="failed">Failed</option>
                  <option value="processing">Processing</option>
                </select>
              </div>

              {/* Validation Status */}
              <div>
                <label className="block text-xs font-semibold text-neutral-450 dark:text-neutral-500 mb-1.5 uppercase tracking-wider">Validation</label>
                <select
                  value={validationFilter}
                  onChange={e => setValidationFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 rounded-lg text-sm text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                >
                  <option value="all">All Validations</option>
                  <option value="valid">Valid</option>
                  <option value="review-required">Review Required</option>
                  <option value="missing">Missing</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {/* Processing Status */}
              <div>
                <label className="block text-xs font-semibold text-neutral-450 dark:text-neutral-500 mb-1.5 uppercase tracking-wider">Processing Status</label>
                <select
                  value={processingFilter}
                  onChange={e => setProcessingFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 rounded-lg text-sm text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                >
                  <option value="all">All Processing Statuses</option>
                  <option value="Uploading">Uploading</option>
                  <option value="Processing">Processing</option>
                  <option value="Ready for Review">Ready for Review</option>
                  <option value="Exported">Exported</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              {/* Uploaded Date Range */}
              <div>
                <label className="block text-xs font-semibold text-neutral-450 dark:text-neutral-500 mb-1.5 uppercase tracking-wider">Uploaded Date Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={uploadedStart}
                    onChange={e => setUploadedStart(e.target.value)}
                    className="w-[47%] px-2.5 py-1.5 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 rounded-lg text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <span className="text-neutral-400 text-xs">to</span>
                  <input
                    type="date"
                    value={uploadedEnd}
                    onChange={e => setUploadedEnd(e.target.value)}
                    className="w-[47%] px-2.5 py-1.5 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 rounded-lg text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Exported Date Range */}
              <div>
                <label className="block text-xs font-semibold text-neutral-450 dark:text-neutral-500 mb-1.5 uppercase tracking-wider">Exported Date Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={exportedStart}
                    onChange={e => setExportedStart(e.target.value)}
                    className="w-[47%] px-2.5 py-1.5 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 rounded-lg text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <span className="text-neutral-400 text-xs">to</span>
                  <input
                    type="date"
                    value={exportedEnd}
                    onChange={e => setExportedEnd(e.target.value)}
                    className="w-[47%] px-2.5 py-1.5 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 rounded-lg text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Reset Filter Button */}
              <div className="flex items-end justify-end col-span-1">
                <button
                  onClick={handleResetFilters}
                  className="w-full md:w-auto px-4 py-2 border border-red-200 dark:border-red-950/60 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-655 dark:text-red-400 text-sm font-semibold rounded-lg transition-colors"
                >
                  Reset Filters
                </button>
              </div>

            </div>
          </div>
        )}

        {/* LOADING & TABLE VIEW */}
        {isLoading ? (
          <>
            {/* Desktop Loading */}
            <div className="hidden md:block bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-955 border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold select-none">
                  <tr>
                    <th className="p-4">Inquiry Ref No.</th>
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">SWL</th>
                    <th className="p-4">SF</th>
                    <th className="p-4 text-right">Qty</th>
                    <th className="p-4">Uploaded On</th>
                    <th className="p-4">Exported On</th>
                    <th className="p-4">Extraction</th>
                    <th className="p-4">Validation</th>
                    <th className="p-4">Processing Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {renderSkeletons()}
                </tbody>
              </table>
            </div>
            {/* Mobile Loading */}
            <div className="block md:hidden space-y-4">
              {renderMobileSkeletons()}
            </div>
          </>
        ) : sortedInquiries.length > 0 ? (
          <>
            {/* DESKTOP TABLE VIEW */}
            <div className="hidden md:block bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold select-none">
                  <tr>
                    <th onClick={() => handleSort('id')} className="p-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
                      Inquiry Ref No. {renderSortArrow('id')}
                    </th>
                    <th onClick={() => handleSort('customerName')} className="p-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
                      Customer Name {renderSortArrow('customerName')}
                    </th>
                    <th className="p-4">SWL</th>
                    <th className="p-4">SF</th>
                    <th className="p-4 text-right">Qty</th>
                    <th onClick={() => handleSort('requestDate')} className="p-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
                      Uploaded On {renderSortArrow('requestDate')}
                    </th>
                    <th onClick={() => handleSort('exportedOn')} className="p-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
                      Exported On {renderSortArrow('exportedOn')}
                    </th>
                    <th className="p-4">Extraction</th>
                    <th className="p-4">Validation</th>
                    <th onClick={() => handleSort('processingStatus')} className="p-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
                      Processing Status {renderSortArrow('processingStatus')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {paginatedInquiries.map((inquiry) => (
                    <tr 
                      key={inquiry.id}
                      onClick={() => handleRowClick(inquiry)}
                      className={`hover:bg-neutral-50 dark:hover:bg-neutral-955/40 transition-colors cursor-pointer ${
                        inquiry.processingStatus === 'Uploading' || inquiry.processingStatus === 'Processing' ? 'opacity-65 !cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent' : ''
                      }`}
                    >
                      <td className="p-4 font-bold text-primary-600 dark:text-primary-400">{inquiry.id}</td>
                      <td className="p-4 font-medium text-neutral-900 dark:text-white max-w-[220px] truncate" title={inquiry.customerName}>{inquiry.customerName}</td>
                      <td className="p-4 text-neutral-600 dark:text-neutral-300 font-semibold">{inquiry.swl || '-'}</td>
                      <td className="p-4 text-neutral-600 dark:text-neutral-300 font-semibold">{inquiry.sf || '-'}</td>
                      <td className="p-4 text-right font-medium text-neutral-950 dark:text-neutral-100">{inquiry.quantity ? inquiry.quantity.toLocaleString() : '-'}</td>
                      <td className="p-4 text-neutral-500 dark:text-neutral-400 whitespace-nowrap">{formatDateTime(inquiry.requestDate)}</td>
                      <td className="p-4 text-neutral-500 dark:text-neutral-400 whitespace-nowrap">{inquiry.exportedOn ? formatDateTime(inquiry.exportedOn) : '-'}</td>
                      <td className="p-4">{getExtractionBadge(inquiry.extraction)}</td>
                      <td className="p-4">{getValidationBadge(inquiry.validation)}</td>
                      <td className="p-4">{getProcessingStatusBadge(inquiry.processingStatus)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARD VIEW */}
            <div className="block md:hidden space-y-4">
              {paginatedInquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  onClick={() => handleRowClick(inquiry)}
                  className={`bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs hover:bg-neutral-50 dark:hover:bg-neutral-950/40 transition-colors cursor-pointer relative ${
                    inquiry.processingStatus === 'Uploading' || inquiry.processingStatus === 'Processing' ? 'opacity-65 !cursor-not-allowed' : ''
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-primary-600 dark:text-primary-400 text-base">{inquiry.id}</span>
                    {getProcessingStatusBadge(inquiry.processingStatus)}
                  </div>

                  <h3 className="font-bold text-neutral-900 dark:text-white text-base mb-2 truncate" title={inquiry.customerName}>
                    {inquiry.customerName}
                  </h3>

                  <div className="grid grid-cols-3 gap-2 mb-3 text-xs bg-neutral-50 dark:bg-neutral-950 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800">
                    <div>
                      <div className="text-neutral-400 font-medium">SWL</div>
                      <div className="font-semibold text-neutral-800 dark:text-neutral-200">{inquiry.swl || '-'}</div>
                    </div>
                    <div>
                      <div className="text-neutral-400 font-medium">SF</div>
                      <div className="font-semibold text-neutral-800 dark:text-neutral-200">{inquiry.sf || '-'}</div>
                    </div>
                    <div>
                      <div className="text-neutral-400 font-medium text-right">Qty</div>
                      <div className="font-semibold text-neutral-800 dark:text-neutral-200 text-right">{inquiry.quantity ? inquiry.quantity.toLocaleString() : '-'}</div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                    <div className="flex justify-between">
                      <span>Uploaded On:</span>
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">{formatDateTime(inquiry.requestDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Exported On:</span>
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">{inquiry.exportedOn ? formatDateTime(inquiry.exportedOn) : '-'}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 justify-end">
                    {getExtractionBadge(inquiry.extraction)}
                    {getValidationBadge(inquiry.validation)}
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="mt-5">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        ) : (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs text-center min-h-[360px]">
            <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-450 dark:text-neutral-500 mb-4 border border-neutral-200/50 dark:border-neutral-700/50">
              <ClipboardList className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200 mb-2">No inquiries have been uploaded yet.</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 max-w-sm mx-auto">
              You can get started by clicking below to upload inquiry PDF files for AI processing.
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Inquiry</span>
            </button>
          </div>
        )}

        <UploadInquiryModal 
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      </div>
    </div>
  );
}
