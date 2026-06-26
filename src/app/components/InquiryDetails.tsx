import React, { useState, useEffect, useRef } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Printer, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize2, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  X, 
  AlertCircle, 
  CheckCircle,
  FileDown,
  Info,
  Maximize
} from "lucide-react";
import { mockInquiries, Inquiry } from "../../mockAPI/inquiriesData";
import { toast } from "sonner";
import { Button } from "./ui/button";

interface InquiryDetailsProps {
  inquiryId: string;
  onBack: () => void;
  onSelectInquiry: (id: string) => void;
}

// Extracted fields structure matching the ABS POC categories (with expanded fields for the merged section and others)
interface ExtractedFieldsData {
  // Core Inquiry (7 fields)
  customerName: string;
  inquiryReference: string;
  safeWorkingLoad: string;
  swlUnit: string;
  safetyFactor: string;
  quantity: string;
  bagType: string;

  // Bag Design (21 fields)
  bagHeight: string;
  bagWidth: string;
  gusset: string;
  conicalTop: boolean;
  conicalBottom: boolean;
  topFlap: boolean;
  bottomFlap: boolean;
  topSpoutDiameter: string;
  topSpoutLength: string;
  bottomSpoutDiameter: string;
  bottomSpoutLength: string;
  spoutCover: boolean;
  baffleType: string;
  gussetThickness: string;
  threadColor: string;
  safetyLabel: boolean;
  sewPattern: string;
  cornerReinforcement: boolean;
  bodyType: string;
  dischargeType: string;
  topType: string;

  // Fabric (17 fields)
  fabricGsm: string;
  fabricType: string;
  fabricColor: string;
  doubleLayer: boolean;
  uvStabilization: boolean;
  coatingThickness: string;
  coatingGsm: string;
  fabricWeave: string;
  warpStrength: string;
  weftStrength: string;
  elongation: string;
  antistatic: boolean;
  breathable: boolean;
  conductiveType: string;
  meshSize: string;
  yarnType: string;
  flatWidth: string;

  // Material / Liner (5 fields)
  linerType: string;
  hygiene: string;
  linerThickness: string;
  linerGsm: string;
  linerColor: string;

  // Loop Configuration (8 fields)
  loopType: string;
  extraLoopOptions: string[];
  fullLoop: boolean;
  multifilamentLoop: boolean;
  patchUnderLoop: boolean;
  loopHeight: string;
  loopWidth: string;
  loopColor: string;

  // Band Details (2 fields)
  bandType: string;
  bandWidth: string;

  // Bag Construction (2 fields)
  stitchingType: string;
  stitchingColor: string;

  // Accessories, Printing, Comments & Document Pouch (16 fields)
  extraAccessories: boolean;
  dustproofComponents: string[];
  printingRequired: boolean;
  printingSide: string;
  printingColour: string;
  customerComments: string;
  documentPouch: boolean;
  documentPouchSize: string;
  documentPouchPosition: string;
  velcroTie: boolean;
  fillerCord: boolean;
  chainStitch: boolean;
  tieString: string;
  labelType: string;
  palletRequired: boolean;
  specialPackaging: string;
}

export default function InquiryDetails({ inquiryId, onBack, onSelectInquiry }: InquiryDetailsProps) {
  const currentInquiry = mockInquiries.find(i => i.id === inquiryId) || mockInquiries[0];
  const currentIndex = mockInquiries.findIndex(i => i.id === currentInquiry.id);

  // PDF Viewer state
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfZoom, setPdfZoom] = useState(100);
  const [pdfRotation, setPdfRotation] = useState(0);
  const [pdfFitWidth, setPdfFitWidth] = useState(true);

  // Accordion active state (all collapsed by default)
  const [activeAccordion, setActiveAccordion] = useState<string>("");

  // Form Fields State
  const [fields, setFields] = useState<ExtractedFieldsData>({
    customerName: "",
    inquiryReference: "",
    safeWorkingLoad: "",
    swlUnit: "Kgs",
    safetyFactor: "5:1",
    quantity: "",
    bagType: "U-Panel",
    bagHeight: "",
    bagWidth: "",
    gusset: "",
    conicalTop: false,
    conicalBottom: false,
    topFlap: false,
    bottomFlap: false,
    topSpoutDiameter: "350",
    topSpoutLength: "500",
    bottomSpoutDiameter: "350",
    bottomSpoutLength: "500",
    spoutCover: true,
    baffleType: "None",
    gussetThickness: "1.2",
    threadColor: "Blue",
    safetyLabel: true,
    sewPattern: "Standard Overlock",
    cornerReinforcement: true,
    bodyType: "U-Panel Construction",
    dischargeType: "Standard Spout",
    topType: "Open Top with Skirt",
    fabricGsm: "",
    fabricType: "Virgin Polypropylene",
    fabricColor: "White",
    doubleLayer: false,
    uvStabilization: true,
    coatingThickness: "30 micron",
    coatingGsm: "20 GSM",
    fabricWeave: "14x14",
    warpStrength: "1600 N",
    weftStrength: "1500 N",
    elongation: "20%",
    antistatic: false,
    breathable: false,
    conductiveType: "None",
    meshSize: "3mm",
    yarnType: "Fibrillated",
    flatWidth: "900mm",
    linerType: "None",
    hygiene: "Industrial Grade",
    linerThickness: "50 micron",
    linerGsm: "45 GSM",
    linerColor: "Natural",
    loopType: "Cross Corner",
    extraLoopOptions: [],
    fullLoop: false,
    multifilamentLoop: false,
    patchUnderLoop: false,
    loopHeight: "300",
    loopWidth: "70",
    loopColor: "Blue",
    bandType: "None",
    bandWidth: "80",
    stitchingType: "Standard Chain Stitch",
    stitchingColor: "White",
    extraAccessories: false,
    dustproofComponents: [],
    printingRequired: false,
    printingSide: "None",
    printingColour: "None",
    customerComments: "",
    documentPouch: false,
    documentPouchSize: "A4 Ziplock",
    documentPouchPosition: "Seam Stitched near Loop #1",
    velcroTie: false,
    fillerCord: false,
    chainStitch: true,
    tieString: "PP Tie String",
    labelType: "Standard ABS Product Label",
    palletRequired: false,
    specialPackaging: "Stretch Wrapped on Pallets"
  });

  // Track fields that are flagged for review (orange validation borders)
  const [reviewRequiredFields, setReviewRequiredFields] = useState<Record<string, boolean>>({});

  // Sync state when active inquiry changes
  useEffect(() => {
    // We intentionally make some fields empty (red border) or mark them as review required (orange border)
    const isAbs1 = currentInquiry.id === "INQ-2026-001";
    const isAbs2 = currentInquiry.id === "INQ-2026-002";
    const isAbs3 = currentInquiry.id === "INQ-2026-003";
    const isAbs8 = currentInquiry.id === "INQ-2026-008";

    // Set initial field values
    setFields(prev => ({
      ...prev,
      customerName: currentInquiry.customerName,
      inquiryReference: currentInquiry.id.replace("INQ", "REF"),
      safeWorkingLoad: isAbs1 ? "" : "1000", // Missing for INQ-001
      swlUnit: "Kgs",
      safetyFactor: isAbs3 ? "5:1" : "5:1", // Valid but review required for INQ-003
      quantity: String(currentInquiry.quantity),
      bagType: currentInquiry.productType.includes("Circular") ? "Circular" : currentInquiry.productType.includes("Baffle") ? "Baffle" : "U-Panel",
      bagHeight: "1200",
      bagWidth: "900",
      gusset: (isAbs3 || isAbs8) ? "" : "900", // Missing for INQ-003 and INQ-008
      conicalTop: false,
      conicalBottom: currentInquiry.productType.includes("Conical") || currentInquiry.productType.includes("spout"),
      topFlap: currentInquiry.productType.includes("filling skirt") || currentInquiry.productType.includes("Flap"),
      bottomFlap: currentInquiry.productType.includes("discharge spout") || currentInquiry.productType.includes("Flap"),
      fabricGsm: isAbs2 ? "" : currentInquiry.productType.includes("160") ? "160" : "180", // Missing for INQ-002
      fabricType: currentInquiry.productType.includes("Laminated") ? "Laminated" : "Virgin Polypropylene",
      fabricColor: currentInquiry.productType.includes("Blue") ? "Blue" : "White",
      doubleLayer: currentInquiry.notes?.toLowerCase().includes("double layer") || false,
      linerType: currentInquiry.notes?.toLowerCase().includes("liner") ? "LDPE Loose Fit" : "None",
      hygiene: currentInquiry.notes?.toLowerCase().includes("food") ? "Food Grade" : "Industrial Grade",
      loopType: currentInquiry.productType.includes("Cross Corner") ? "Cross Corner" : "Side Seam",
      extraLoopOptions: currentInquiry.notes?.toLowerCase().includes("stevedore") ? ["Stevedore Strap"] : [],
      fullLoop: false,
      multifilamentLoop: currentInquiry.notes?.toLowerCase().includes("multifilament") || false,
      patchUnderLoop: currentInquiry.notes?.toLowerCase().includes("patch") || true,
      bandType: currentInquiry.notes?.toLowerCase().includes("reinforce") ? "Reinforced Band" : "None",
      stitchingType: currentInquiry.productType.includes("Dust Proof") ? "Overlock with Dustproof" : "Standard Chain Stitch",
      extraAccessories: currentInquiry.notes?.toLowerCase().includes("accessories") || false,
      dustproofComponents: currentInquiry.productType.includes("Dust Proof") ? ["Filler Cord", "Felt Strip"] : [],
      printingRequired: currentInquiry.notes?.toLowerCase().includes("print") || false,
      printingSide: currentInquiry.notes?.toLowerCase().includes("print") ? "2 Sides" : "None",
      printingColour: currentInquiry.notes?.toLowerCase().includes("print") ? "Black" : "None",
      customerComments: isAbs2 ? "" : currentInquiry.notes || "", // Missing comments for INQ-002
      documentPouch: true
    }));

    // Setup review required fields (orange borders)
    const reviews: Record<string, boolean> = {};
    if (isAbs1) {
      reviews.safetyFactor = true; // Safety factor needs review
    }
    if (isAbs2) {
      reviews.bagHeight = true; // Height needs review
    }
    if (isAbs3) {
      reviews.fabricType = true; // Fabric type needs review
    }
    if (isAbs8) {
      reviews.safeWorkingLoad = true; // SWL needs review
    }
    setReviewRequiredFields(reviews);
    setActiveAccordion("");
    setPdfPage(1);
  }, [inquiryId]);

  // Navigate inquiries
  const handlePrevious = () => {
    if (currentIndex > 0) {
      onSelectInquiry(mockInquiries[currentIndex - 1].id);
    } else {
      toast.info("This is the first inquiry record.");
    }
  };

  const handleNext = () => {
    if (currentIndex < mockInquiries.length - 1) {
      onSelectInquiry(mockInquiries[currentIndex + 1].id);
    } else {
      toast.info("This is the last inquiry record.");
    }
  };

  const toggleAccordion = (id: string) => {
    setActiveAccordion(activeAccordion === id ? "" : id);
  };

  // Change Handler
  const handleInputChange = (key: keyof ExtractedFieldsData, value: any) => {
    setFields(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Clear review required flag on user edits
    if (reviewRequiredFields[key]) {
      setReviewRequiredFields(prev => ({
        ...prev,
        [key]: false
      }));
    }
  };

  // Field validation check
  const isFieldMissing = (key: keyof ExtractedFieldsData, val: any) => {
    if (typeof val === "string") {
      // Comments are optional; don't count empty comments as an extraction failure unless empty ref
      if (key === "customerComments") return false;
      return val.trim() === "";
    }
    return false;
  };

  const isFieldReviewRequired = (key: keyof ExtractedFieldsData) => {
    return !!reviewRequiredFields[key];
  };

  // Accordion fields mapping
  const accordionFieldMap: Record<string, (keyof ExtractedFieldsData)[]> = {
    "core-inquiry": ["customerName", "inquiryReference", "safeWorkingLoad", "swlUnit", "safetyFactor", "quantity", "bagType"],
    "bag-design": ["bagHeight", "bagWidth", "gusset", "conicalTop", "conicalBottom", "topFlap", "bottomFlap", "topSpoutDiameter", "topSpoutLength", "bottomSpoutDiameter", "bottomSpoutLength", "spoutCover", "baffleType", "gussetThickness", "threadColor", "safetyLabel", "sewPattern", "cornerReinforcement", "bodyType", "dischargeType", "topType"],
    "fabric": ["fabricGsm", "fabricType", "fabricColor", "doubleLayer", "uvStabilization", "coatingThickness", "coatingGsm", "fabricWeave", "warpStrength", "weftStrength", "elongation", "antistatic", "breathable", "conductiveType", "meshSize", "yarnType", "flatWidth"],
    "material": ["linerType", "hygiene", "linerThickness", "linerGsm", "linerColor"],
    "loop-config": ["loopType", "extraLoopOptions", "fullLoop", "multifilamentLoop", "patchUnderLoop", "loopHeight", "loopWidth", "loopColor"],
    "band-details": ["bandType", "bandWidth"],
    "bag-construction": ["stitchingType", "stitchingColor"],
    "accessories": ["extraAccessories", "dustproofComponents", "printingRequired", "printingSide", "printingColour", "customerComments", "documentPouch", "documentPouchSize", "documentPouchPosition", "velcroTie", "fillerCord", "chainStitch", "tieString", "labelType", "palletRequired", "specialPackaging"]
  };

  // Calculate accordion status dynamically based on current state of fields
  const getAccordionStatus = (sectionKey: string) => {
    const fieldKeys = accordionFieldMap[sectionKey] || [];
    
    // Count empty required fields (issues)
    let missingCount = 0;
    let reviewCount = 0;

    fieldKeys.forEach(k => {
      if (isFieldMissing(k, fields[k])) {
        missingCount++;
      } else if (isFieldReviewRequired(k)) {
        reviewCount++;
      }
    });

    if (missingCount > 0) {
      return { 
        type: "error", 
        borderClass: "border-red-200 dark:border-red-950/70 hover:bg-red-50/10 dark:hover:bg-red-950/5", 
        badgeClass: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/50",
        badgeText: `${missingCount} Issue${missingCount > 1 ? 's' : ''}`
      };
    } else if (reviewCount > 0) {
      return { 
        type: "warning", 
        borderClass: "border-amber-250 dark:border-amber-900/60 hover:bg-amber-50/10 dark:hover:bg-amber-950/5", 
        badgeClass: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50",
        badgeText: `${reviewCount} Review${reviewCount > 1 ? 's' : ''}`
      };
    } else {
      return { 
        type: "success", 
        borderClass: "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/30", 
        badgeClass: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50",
        badgeText: "All Good"
      };
    }
  };

  const handleExportCSV = () => {
    // Check if there are any missing fields
    const missingKeys = Object.keys(fields).filter(k => 
      isFieldMissing(k as keyof ExtractedFieldsData, fields[k as keyof ExtractedFieldsData])
    );

    if (missingKeys.length > 0) {
      toast.error(`Please correct the ${missingKeys.length} missing field(s) highlighted in red before exporting.`);
      
      // Auto expand the first section containing an issue
      for (const sectionKey of Object.keys(accordionFieldMap)) {
        const keys = accordionFieldMap[sectionKey];
        if (keys.some(k => missingKeys.includes(k))) {
          setActiveAccordion(sectionKey);
          break;
        }
      }
      return;
    }

    // Generate CSV
    const headers = Object.keys(fields).join(",");
    const rowValues = Object.values(fields).map(v => {
      if (Array.isArray(v)) return `"${v.join("; ")}"`;
      if (typeof v === "boolean") return v ? "Yes" : "No";
      return `"${String(v).replace(/"/g, '""')}"`;
    }).join(",");

    const csvContent = [headers, rowValues].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ABS_TechnicalSpecs_${currentInquiry.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Update local database status
    const index = mockInquiries.findIndex(i => i.id === currentInquiry.id);
    if (index !== -1) {
      mockInquiries[index].processingStatus = 'Exported';
      mockInquiries[index].exportedOn = new Date().toISOString();
      mockInquiries[index].status = 'approved';
    }

    toast.success("CSV file exported successfully!");
  };

  const handleSaveDraft = () => {
    const index = mockInquiries.findIndex(i => i.id === currentInquiry.id);
    if (index !== -1) {
      mockInquiries[index].notes = fields.customerComments;
      if (fields.quantity) {
        const qty = parseInt(fields.quantity, 10);
        if (!isNaN(qty)) {
          mockInquiries[index].quantity = qty;
        }
      }
    }
    toast.success("Draft saved successfully!");
  };

  const handleSaveChanges = () => {
    const missingKeys = Object.keys(fields).filter(k => 
      isFieldMissing(k as keyof ExtractedFieldsData, fields[k as keyof ExtractedFieldsData])
    );

    const index = mockInquiries.findIndex(i => i.id === currentInquiry.id);
    if (index !== -1) {
      mockInquiries[index].notes = fields.customerComments;
      if (fields.quantity) {
        const qty = parseInt(fields.quantity, 10);
        if (!isNaN(qty)) {
          mockInquiries[index].quantity = qty;
        }
      }
      if (missingKeys.length === 0) {
        if (mockInquiries[index].status === "pending") {
          mockInquiries[index].status = "under-review";
        }
      }
    }

    if (missingKeys.length > 0) {
      toast.warning(`Changes saved with ${missingKeys.length} unresolved issue(s).`);
    } else {
      toast.success("Changes saved successfully!");
    }
    onBack();
  };

  // Custom Input with border-embedded floating label
  const FloatingInput = ({ 
    id, 
    label, 
    value, 
    onChange, 
    type = "text", 
    required = false, 
    placeholder = " " 
  }: { 
    id: keyof ExtractedFieldsData; 
    label: string; 
    value: string; 
    onChange: (val: string) => void; 
    type?: string; 
    required?: boolean;
    placeholder?: string;
  }) => {
    const isError = isFieldMissing(id, value);
    const isWarning = isFieldReviewRequired(id);
    
    let borderStyle = "border-neutral-200 dark:border-neutral-800 focus:border-primary-500 focus:ring-primary-500/20";
    let bgStyle = "bg-white dark:bg-neutral-900";
    let labelStyle = "text-neutral-500 dark:text-neutral-400 peer-focus:text-primary-500";

    if (isError) {
      borderStyle = "border-red-400 dark:border-red-800 focus:border-red-500";
      bgStyle = "bg-red-50/20 dark:bg-red-950/15";
      labelStyle = "text-red-500 dark:text-red-400";
    } else if (isWarning) {
      borderStyle = "border-amber-400 dark:border-amber-700 focus:border-amber-500";
      bgStyle = "bg-amber-50/20 dark:bg-amber-950/15";
      labelStyle = "text-amber-600 dark:text-amber-400";
    }

    return (
      <div className="relative mt-2">
        <input
          type={type}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`peer w-full h-11 px-3 pt-4 pb-1 text-sm rounded-lg border transition-all outline-none ${borderStyle} ${bgStyle}`}
        />
        <label
          htmlFor={id}
          className={`absolute left-3 px-1.5 text-xs font-semibold select-none pointer-events-none transition-all
            -translate-y-2.5 top-0.5 scale-95 origin-[0] bg-white dark:bg-neutral-900
            peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-3 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal
            peer-focus:scale-95 peer-focus:-translate-y-2.5 peer-focus:text-xs peer-focus:font-semibold
            ${labelStyle}`}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      </div>
    );
  };

  // Custom Dropdown with border-embedded floating label
  const FloatingSelect = ({ 
    id, 
    label, 
    value, 
    onChange, 
    options, 
    required = false 
  }: { 
    id: keyof ExtractedFieldsData; 
    label: string; 
    value: string; 
    onChange: (val: string) => void; 
    options: string[]; 
    required?: boolean;
  }) => {
    const isError = isFieldMissing(id, value);
    const isWarning = isFieldReviewRequired(id);

    let borderStyle = "border-neutral-200 dark:border-neutral-800 focus:border-primary-500";
    let bgStyle = "bg-white dark:bg-neutral-900";
    let labelStyle = "text-neutral-500 dark:text-neutral-400 peer-focus:text-primary-500";

    if (isError) {
      borderStyle = "border-red-400 dark:border-red-800 focus:border-red-500";
      bgStyle = "bg-red-50/20 dark:bg-red-950/15";
      labelStyle = "text-red-500 dark:text-red-400";
    } else if (isWarning) {
      borderStyle = "border-amber-400 dark:border-amber-700 focus:border-amber-500";
      bgStyle = "bg-amber-50/20 dark:bg-amber-950/15";
      labelStyle = "text-amber-600 dark:text-amber-400";
    }

    return (
      <div className="relative mt-2">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`peer w-full h-11 px-3 pt-4 pb-1 text-sm border rounded-lg transition-all outline-none appearance-none cursor-pointer ${borderStyle} ${bgStyle}`}
        >
          {options.map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none pt-2">
          <ChevronDown className="w-4 h-4 text-neutral-400 dark:text-neutral-600" />
        </div>
        <label
          htmlFor={id}
          className={`absolute left-3 px-1.5 text-xs font-semibold select-none pointer-events-none transition-all bg-white dark:bg-neutral-900
            -translate-y-2.5 top-0.5 scale-95 origin-[0]
            ${labelStyle}`}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      </div>
    );
  };

  // Custom Toggle Switch
  const ToggleSwitch = ({
    id,
    label,
    checked,
    onChange
  }: {
    id: keyof ExtractedFieldsData;
    label: string;
    checked: boolean;
    onChange: (val: boolean) => void;
  }) => {
    return (
      <div className="flex items-center justify-between py-1.5 px-3 border border-neutral-100 dark:border-neutral-800/60 rounded-lg hover:bg-neutral-50/50 dark:hover:bg-neutral-950/20 transition-colors bg-white dark:bg-neutral-900">
        <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">{label}</span>
        <button
          type="button"
          onClick={() => onChange(!checked)}
          className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors focus:outline-none ${
            checked ? "bg-primary-500" : "bg-neutral-300 dark:bg-neutral-700"
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
              checked ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    );
  };

  // Custom MultiSelect
  const FloatingMultiSelect = ({
    id,
    label,
    selectedValues,
    onChange,
    options
  }: {
    id: keyof ExtractedFieldsData;
    label: string;
    selectedValues: string[];
    onChange: (vals: string[]) => void;
    options: string[];
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const clickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", clickOutside);
      return () => document.removeEventListener("mousedown", clickOutside);
    }, []);

    const toggleSelect = (opt: string) => {
      const exists = selectedValues.includes(opt);
      if (exists) {
        onChange(selectedValues.filter(v => v !== opt));
      } else {
        onChange([...selectedValues.filter(v => v !== "None"), opt]);
      }
    };

    return (
      <div className="relative mt-2" ref={containerRef}>
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="peer w-full min-h-11 px-3 pt-4 pb-1 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white transition-all cursor-pointer flex flex-wrap gap-1.5 items-center pr-8"
        >
          {selectedValues.length > 0 && !selectedValues.includes("None") ? (
            selectedValues.map(v => (
              <span key={v} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 dark:bg-primary-950 border border-primary-100 dark:border-primary-900 text-primary-700 dark:text-primary-400 text-[10px] font-medium rounded">
                {v}
                <X 
                  className="w-2.5 h-2.5 cursor-pointer hover:text-primary-900" 
                  onClick={(e) => { e.stopPropagation(); toggleSelect(v); }} 
                />
              </span>
            ))
          ) : (
            <span className="text-neutral-400 dark:text-neutral-600 text-xs">Select options...</span>
          )}
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none pt-2">
          <ChevronDown className="w-4 h-4 text-neutral-400 dark:text-neutral-600" />
        </div>
        <label
          className="absolute left-3 px-1.5 bg-white dark:bg-neutral-900 text-xs font-semibold select-none pointer-events-none transition-all
            -translate-y-2.5 top-0.5 scale-95 origin-[0] text-neutral-500 dark:text-neutral-400"
        >
          {label}
        </label>

        {isOpen && (
          <div className="absolute z-20 w-full mt-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg overflow-hidden py-1 max-h-48 overflow-y-auto">
            {options.map(opt => {
              const isChecked = selectedValues.includes(opt);
              return (
                <button
                  type="button"
                  key={opt}
                  onClick={() => toggleSelect(opt)}
                  className="w-full px-3 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 flex items-center justify-between"
                >
                  <span>{opt}</span>
                  {isChecked && <Check className="w-4 h-4 text-primary" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Helper Accordion Section Wrapper
  const AccordionSection = ({ 
    id, 
    title, 
    fieldsCountLabel, 
    children 
  }: { 
    id: string; 
    title: string; 
    fieldsCountLabel: string; 
    children: React.ReactNode;
  }) => {
    const status = getAccordionStatus(id);
    const isOpen = activeAccordion === id;

    return (
      <div className={`border rounded-lg overflow-hidden bg-white dark:bg-neutral-950 transition-all ${
        isOpen ? "shadow-sm" : ""
      } ${
        status.type === "error" 
          ? "border-red-300 dark:border-red-950/80 bg-red-50/5 dark:bg-red-950/5" 
          : status.type === "warning"
            ? "border-amber-300 dark:border-amber-900/60 bg-amber-50/5 dark:bg-amber-950/5"
            : "border-neutral-200 dark:border-neutral-800"
      }`}>
        <button
          type="button"
          onClick={() => toggleAccordion(id)}
          className={`w-full px-4 py-3.5 border-b flex items-center justify-between font-semibold text-xs text-neutral-800 dark:text-neutral-200 transition-colors ${
            isOpen ? "bg-neutral-50/50 dark:bg-neutral-900 border-neutral-100 dark:border-neutral-850" : "border-transparent"
          } ${status.borderClass}`}
        >
          <div className="flex items-center gap-3">
            <span>{title} ({fieldsCountLabel})</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold leading-normal ${status.badgeClass}`}>
              {status.badgeText}
            </span>
          </div>
          {isOpen ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
        </button>
        {isOpen && (
          <div className="p-4 bg-white dark:bg-neutral-950/20">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950 h-[calc(100vh-64px)] overflow-hidden flex flex-col gap-4">
      {/* BREADCRUMB & HEADER CONTROLS (Compact single-row focus) */}
      <div className="flex items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-3 shrink-0 select-none">
        <div className="flex items-center gap-4">
          <div>
            <nav className="flex items-center gap-1 text-[10px] text-neutral-400 dark:text-neutral-500 mb-0.5">
              <button onClick={onBack} className="hover:underline">Home</button>
              <span>&gt;</span>
              <button onClick={onBack} className="hover:underline">Inquiry Listing</button>
              <span>&gt;</span>
              <span className="text-neutral-500 font-medium">Inquiry Details</span>
            </nav>
            <h1 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <span>Inquiry Details</span>
              <span className="font-mono text-xs text-neutral-500 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 px-2 py-0.5 rounded font-normal">
                {currentInquiry.id}
              </span>
              
              {/* Compact Badges sitting directly next to Inquiry ID */}
              <div className="flex items-center gap-1.5 ml-2">
                {currentInquiry.extraction === 'complete' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 border rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-250 dark:border-emerald-900/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span>Extraction: Completed</span>
                  </span>
                )}
                {currentInquiry.extraction === 'partial' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 border rounded-full text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-255 dark:border-amber-900/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                    <span>Extraction: Partial</span>
                  </span>
                )}
                {currentInquiry.extraction === 'failed' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 border rounded-full text-xs font-semibold text-rose-700 dark:text-rose-450 bg-rose-50 dark:bg-rose-950/20 border-rose-250 dark:border-rose-800/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                    <span>Extraction: Failed</span>
                  </span>
                )}
                {(!currentInquiry.extraction || currentInquiry.extraction === 'processing') && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 border rounded-full text-xs font-semibold text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse"></div>
                    <span>Extraction: Processing</span>
                  </span>
                )}

                {currentInquiry.validation === 'valid' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 border rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-250 dark:border-emerald-900/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span>Validation: Valid</span>
                  </span>
                )}
                {currentInquiry.validation === 'review-required' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 border rounded-full text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-255 dark:border-amber-900/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                    <span>Validation: Review Required</span>
                  </span>
                )}
                {currentInquiry.validation === 'missing' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 border rounded-full text-xs font-semibold text-rose-700 dark:text-rose-455 bg-rose-50 dark:bg-rose-950/20 border-rose-250 dark:border-rose-800/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                    <span>Validation: Missing</span>
                  </span>
                )}
                {(!currentInquiry.validation || currentInquiry.validation === 'pending') && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 border rounded-full text-xs font-semibold text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-400"></div>
                    <span>Validation: Pending</span>
                  </span>
                )}

                {currentInquiry.processingStatus === 'Exported' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 border rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-250 dark:border-emerald-900/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span>CSV: Exported</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 border rounded-full text-xs font-semibold text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-400"></div>
                    <span>CSV: Not Exported</span>
                  </span>
                )}
              </div>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-3 py-1.5 text-xs font-semibold border border-neutral-200 dark:border-neutral-850 rounded-lg bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 text-neutral-600 dark:text-neutral-300 transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === mockInquiries.length - 1}
            className="px-3 py-1.5 text-xs font-semibold border border-neutral-200 dark:border-neutral-850 rounded-lg bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 text-neutral-600 dark:text-neutral-300 transition-colors flex items-center gap-1"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <Button
            onClick={handleExportCSV}
            className="text-xs px-3 h-8.5 flex items-center gap-1"
          >
            <FileDown className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* DUAL WORKSPACE PANEL - LETS USER DO SIDE-BY-SIDE REVIEW WITH VIEWPORT LOMITING */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 overflow-hidden">
        
        {/* LEFT PANEL - FIXED PDF VIEWER (45% Width on Desktop) */}
        <div className="w-full lg:w-[45%] h-full flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs overflow-hidden shrink-0">
          {/* PDF Viewer Toolbar (Controls always visible) */}
          <div className="p-2 border-b border-neutral-200 dark:border-neutral-850 flex items-center justify-between gap-3 bg-white dark:bg-neutral-900 shrink-0 select-none">
            {/* PDF File Name (replaced Page Navigation) */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 select-none">PDF</span>
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 truncate font-mono select-all">
                {currentInquiry.id}.pdf
              </span>
              <span className="text-[9px] text-neutral-400 shrink-0 font-medium select-none">(2.4 MB)</span>
            </div>
 
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400">
              <button 
                onClick={() => setPdfZoom(prev => Math.max(50, prev - 10))}
                className="p-1 border border-neutral-200/40 dark:border-neutral-850 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center font-mono font-medium text-[11px]">{pdfZoom}%</span>
              <button 
                onClick={() => setPdfZoom(prev => Math.min(200, prev + 10))}
                className="p-1 border border-neutral-200/40 dark:border-neutral-850 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
 
            {/* Download & Print Controls */}
            <div className="flex items-center gap-1">
              <button 
                onClick={() => toast.info("Downloading file...")}
                className="p-1.5 border border-neutral-200/40 dark:border-neutral-850 rounded text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-white transition-colors"
                title="Download PDF"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => window.print()}
                className="p-1.5 border border-neutral-200/40 dark:border-neutral-850 rounded text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-white transition-colors"
                title="Print PDF"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
 
          {/* Scrollable PDF Preview (Fixed panel height, inner contents scroll sequentially) */}
          <div className="flex-1 bg-neutral-100 dark:bg-neutral-950 overflow-auto p-4 flex justify-center items-start border-t border-neutral-200/60 dark:border-neutral-850/80 select-text scrollbar-thin">
            <div 
              className="flex flex-col gap-4 origin-top transition-transform duration-200 w-full max-w-lg"
              style={{
                transform: `scale(${pdfZoom / 100}) rotate(${pdfRotation}deg)`,
                transformOrigin: "top center"
              }}
            >
              {/* Page 1 */}
              <div className="bg-white dark:bg-neutral-900 border dark:border-neutral-850 rounded shadow-md w-full p-8 min-h-[740px] shrink-0">
                <div className="space-y-5 font-sans text-neutral-800 dark:text-neutral-200 leading-normal text-[11px]">
                  {/* Document Header Logo */}
                  <div className="flex justify-between items-start border-b border-neutral-200 dark:border-neutral-850 pb-3">
                    <div>
                      <div className="text-base font-bold tracking-tight text-primary-600 dark:text-primary-400">ASIA BULK SACKS</div>
                      <div className="text-[9px] text-neutral-400 mt-0.5">Plot No. 124, GIDC Industrial Estate, Halol, Gujarat</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Inquiry Specifications</div>
                      <div className="mt-0.5 space-y-0.5 text-neutral-500 font-mono text-[9px]">
                        <div>Inquiry No: {currentInquiry.id}</div>
                        <div>Date: {new Date(currentInquiry.requestDate).toLocaleDateString('en-GB')}</div>
                      </div>
                    </div>
                  </div>
 
                  {/* Customer information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[8px] font-bold uppercase text-neutral-400 mb-0.5">Customer details:</div>
                      <div className="font-semibold text-neutral-900 dark:text-white">{currentInquiry.customerName}</div>
                      <div className="text-neutral-500 mt-0.5">
                        Procurement HQ Division, India
                      </div>
                    </div>
                    <div>
                      <div className="text-[8px] font-bold uppercase text-neutral-400 mb-0.5">Reference Data:</div>
                      <div className="font-semibold">Review Pending Verification</div>
                      <div className="text-neutral-500 mt-0.5 font-mono text-[9.5px]">
                        Reference: {currentInquiry.id.replace("INQ", "REF-ABS")}<br />
                        Email: {currentInquiry.email}
                      </div>
                    </div>
                  </div>
 
                  {/* Salutations */}
                  <p className="text-neutral-500">We are pleased to quote you our best prices for the following customized FIBC requirements:</p>
 
                  {/* Specifications details */}
                  <div className="border border-neutral-200 dark:border-neutral-850 rounded overflow-hidden">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-850 text-[9px] font-bold text-neutral-600 dark:text-neutral-400">
                          <th className="p-1.5 w-1/3">Parameter</th>
                          <th className="p-1.5">Extracted Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 dark:divide-neutral-850 text-[9px]">
                        <tr>
                          <td className="p-1.5 font-semibold bg-neutral-50/50 dark:bg-neutral-950/20">Customer Name</td>
                          <td className="p-1.5 font-medium text-neutral-900 dark:text-white">{currentInquiry.customerName}</td>
                        </tr>
                        <tr>
                          <td className="p-1.5 font-semibold bg-neutral-50/50 dark:bg-neutral-950/20">Inquiry Reference</td>
                          <td className="p-1.5 font-mono">{currentInquiry.id.replace("INQ", "REF")}</td>
                        </tr>
                        <tr>
                          <td className="p-1.5 font-semibold bg-neutral-50/50 dark:bg-neutral-950/20">Product Bag Type</td>
                          <td className="p-1.5">{currentInquiry.productType}</td>
                        </tr>
                        <tr>
                          <td className="p-1.5 font-semibold bg-neutral-50/50 dark:bg-neutral-950/20">Safe Working Load (SWL)</td>
                          <td className="p-1.5">1,000 Kgs</td>
                        </tr>
                        <tr>
                          <td className="p-1.5 font-semibold bg-neutral-50/50 dark:bg-neutral-950/20">Safety Factor (SF)</td>
                          <td className="p-1.5">5:1</td>
                        </tr>
                        <tr>
                          <td className="p-1.5 font-semibold bg-neutral-50/50 dark:bg-neutral-950/20">Dimensions</td>
                          <td className="p-1.5">90 x 90 x 120 cm (Width x Length x Height)</td>
                        </tr>
                        <tr>
                          <td className="p-1.5 font-semibold bg-neutral-50/50 dark:bg-neutral-950/20">Fabric GSM / Weight</td>
                          <td className="p-1.5">160 GSM</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
 
                  <div className="text-[9px] text-neutral-400 text-center pt-8 border-t border-neutral-100 dark:border-neutral-850">
                    Page 1 of 3 — Asia Bulk Sacks Inquiry Processing System
                  </div>
                </div>
              </div>
 
              {/* Page 2 */}
              <div className="bg-white dark:bg-neutral-900 border dark:border-neutral-850 rounded shadow-md w-full p-8 min-h-[740px] shrink-0">
                <div className="space-y-5 font-sans text-neutral-800 dark:text-neutral-200 leading-normal text-[11px]">
                  <h3 className="text-xs font-bold border-b border-neutral-200 dark:border-neutral-850 pb-2 text-primary-600 dark:text-primary-400">Technical Details Sheet</h3>
                  
                  <div className="space-y-3.5">
                    <div>
                      <div className="text-[8px] font-bold uppercase text-neutral-400 mb-0.5">A. Construction Specifications:</div>
                      <p className="text-neutral-500">The bulk container is structured with a U-Panel design. It includes a standard flat bottom and a top filling skirt top to prevent spillage during automated loading.</p>
                    </div>
 
                    <div>
                      <div className="text-[8px] font-bold uppercase text-neutral-400 mb-0.5">B. Fabric Parameters:</div>
                      <p className="text-neutral-500">Fabric weave must be Virgin Polypropylene. A dustproof seam structure is required. The bag should be laminated coated internally to prevent moisture seepage.</p>
                    </div>
 
                    <div>
                      <div className="text-[8px] font-bold uppercase text-neutral-400 mb-0.5">C. Loop & Lift Configuration:</div>
                      <p className="text-neutral-500">Equipped with 4 Cross-Corner Lifting Loops. Stitching is reinforced at the corners. Loops must be high-tenacity polypropylene. Patch reinforcement under loops is required.</p>
                    </div>
                  </div>
 
                  <div className="text-[9px] text-neutral-400 text-center pt-24 border-t border-neutral-100 dark:border-neutral-850">
                    Page 2 of 3 — Technical Specifications Sheet
                  </div>
                </div>
              </div>
 
              {/* Page 3 */}
              <div className="bg-white dark:bg-neutral-900 border dark:border-neutral-850 rounded shadow-md w-full p-8 min-h-[740px] shrink-0">
                <div className="space-y-5 font-sans text-neutral-800 dark:text-neutral-200 leading-normal text-[11px]">
                  <h3 className="text-xs font-bold border-b border-neutral-200 dark:border-neutral-850 pb-2 text-primary-600 dark:text-primary-400">Special Accessories & Instructions</h3>
                  
                  <div className="space-y-3.5">
                    <div className="bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded border border-neutral-200 dark:border-neutral-850 font-mono text-[9px] text-neutral-700 dark:text-neutral-300">
                      <div className="text-[8px] font-bold uppercase text-neutral-400 mb-1 font-sans">Customer Special Instructions:</div>
                      {currentInquiry.notes || "No additional comments or specific requirements provided."}
                    </div>
 
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[8px] font-bold uppercase text-neutral-400 mb-0.5">Printing Specification:</div>
                        <p className="text-neutral-500">
                          Printing Required: Yes<br />
                          Color: Black<br />
                          Side: 2 Sides (Opposite panels)<br />
                          Content: Company Logo + Instructions
                        </p>
                      </div>
                      <div>
                        <div className="text-[8px] font-bold uppercase text-neutral-400 mb-0.5">Liner & Pouch details:</div>
                        <p className="text-neutral-500">
                          Liner: HDPE loose fit liner.<br />
                          Pouch: Ziplock document pouch (A4 Size) stitched on seam next to Loop #1.
                        </p>
                      </div>
                    </div>
                  </div>
 
                  <div className="pt-16 text-neutral-500">
                    <div className="font-bold">ABS Inquiry Verification Office</div>
                    <div className="text-[9px]">POC Automatic Extraction Core v1.0.0</div>
                  </div>
 
                  <div className="text-[9px] text-neutral-400 text-center pt-20 border-t border-neutral-100 dark:border-neutral-850">
                    Page 3 of 3 — Technical Specifications Sheet
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - EXTRACTED FIELDS (55% Width, Scrollable independently, Sticky footer) */}
        <div className="w-full lg:w-[55%] h-full flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs overflow-hidden shrink-0">
          {/* Header Title */}
          <div className="p-3.5 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0 select-none">
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Extracted Fields</span>
            <span className="text-[10px] text-neutral-400 font-medium flex items-center gap-1">
              <span>All fields with issues are highlighted</span>
              <Info className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
            </span>
          </div>

          {/* Scrollable Accordions list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
            
            {/* ACCORDION 1: CORE INQUIRY */}
            <AccordionSection id="core-inquiry" title="1. Core Inquiry Information" fieldsCountLabel="7 Fields">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingInput 
                  id="customerName" 
                  label="Customer Name" 
                  value={fields.customerName} 
                  onChange={(v) => handleInputChange("customerName", v)} 
                  required 
                />
                <FloatingInput 
                  id="inquiryReference" 
                  label="Inquiry Reference" 
                  value={fields.inquiryReference} 
                  onChange={(v) => handleInputChange("inquiryReference", v)} 
                  required 
                />
                <FloatingInput 
                  id="safeWorkingLoad" 
                  label="Safe Working Load (SWL)" 
                  value={fields.safeWorkingLoad} 
                  onChange={(v) => handleInputChange("safeWorkingLoad", v)} 
                  required 
                  placeholder="e.g. 1000"
                />
                <FloatingSelect 
                  id="swlUnit" 
                  label="SWL Unit" 
                  value={fields.swlUnit} 
                  onChange={(v) => handleInputChange("swlUnit", v)} 
                  options={["Kgs", "Lbs"]} 
                  required 
                />
                <FloatingSelect 
                  id="safetyFactor" 
                  label="Safety Factor" 
                  value={fields.safetyFactor} 
                  onChange={(v) => handleInputChange("safetyFactor", v)} 
                  options={["5:1", "6:1", "8:1"]} 
                  required 
                />
                <FloatingInput 
                  id="quantity" 
                  label="Quantity" 
                  value={fields.quantity} 
                  onChange={(v) => handleInputChange("quantity", v)} 
                  required 
                  placeholder="e.g. 2000"
                />
                <FloatingSelect 
                  id="bagType" 
                  label="Bag Type" 
                  value={fields.bagType} 
                  onChange={(v) => handleInputChange("bagType", v)} 
                  options={["U-Panel", "Circular", "4-Panel", "Baffle"]} 
                  required 
                />
              </div>
            </AccordionSection>

            {/* ACCORDION 2: BAG DESIGN (21 Fields) */}
            <AccordionSection id="bag-design" title="2. Bag Design" fieldsCountLabel="21 Fields">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FloatingInput 
                    id="bagHeight" 
                    label="Bag Height (mm)" 
                    value={fields.bagHeight} 
                    onChange={(v) => handleInputChange("bagHeight", v)} 
                    required 
                  />
                  <FloatingInput 
                    id="bagWidth" 
                    label="Bag Width (mm)" 
                    value={fields.bagWidth} 
                    onChange={(v) => handleInputChange("bagWidth", v)} 
                    required 
                  />
                  <FloatingInput 
                    id="gusset" 
                    label="Gusset (mm)" 
                    value={fields.gusset} 
                    onChange={(v) => handleInputChange("gusset", v)} 
                    required 
                    placeholder="Gusset size"
                  />
                </div>
                
                {/* Visual grid for design parameters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid grid-cols-1 gap-2">
                    <ToggleSwitch 
                      id="conicalTop" 
                      label="Conical Top" 
                      checked={fields.conicalTop} 
                      onChange={(v) => handleInputChange("conicalTop", v)} 
                    />
                    <ToggleSwitch 
                      id="conicalBottom" 
                      label="Conical Bottom" 
                      checked={fields.conicalBottom} 
                      onChange={(v) => handleInputChange("conicalBottom", v)} 
                    />
                    <ToggleSwitch 
                      id="topFlap" 
                      label="Top Flap" 
                      checked={fields.topFlap} 
                      onChange={(v) => handleInputChange("topFlap", v)} 
                    />
                    <ToggleSwitch 
                      id="bottomFlap" 
                      label="Bottom Flap" 
                      checked={fields.bottomFlap} 
                      onChange={(v) => handleInputChange("bottomFlap", v)} 
                    />
                  </div>
                  
                  {/* Spout measurements (re-used to fill design specifications grid) */}
                  <div className="grid grid-cols-1 gap-2 border-l border-neutral-100 dark:border-neutral-800/80 md:pl-4">
                    <FloatingInput 
                      id="topSpoutDiameter" 
                      label="Top Spout Diameter" 
                      value={fields.topSpoutDiameter} 
                      onChange={(v) => handleInputChange("topSpoutDiameter", v)} 
                    />
                    <FloatingInput 
                      id="topSpoutLength" 
                      label="Top Spout Length" 
                      value={fields.topSpoutLength} 
                      onChange={(v) => handleInputChange("topSpoutLength", v)} 
                    />
                    <FloatingInput 
                      id="bottomSpoutDiameter" 
                      label="Bottom Spout Diameter" 
                      value={fields.bottomSpoutDiameter} 
                      onChange={(v) => handleInputChange("bottomSpoutDiameter", v)} 
                    />
                    <FloatingInput 
                      id="bottomSpoutLength" 
                      label="Bottom Spout Length" 
                      value={fields.bottomSpoutLength} 
                      onChange={(v) => handleInputChange("bottomSpoutLength", v)} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-neutral-100 dark:border-neutral-800/50">
                  <FloatingSelect 
                    id="baffleType" 
                    label="Baffle Type" 
                    value={fields.baffleType} 
                    onChange={(v) => handleInputChange("baffleType", v)} 
                    options={["None", "Standard Baffle", "Net Baffle", "Suspend Baffle"]} 
                  />
                  <FloatingInput 
                    id="gussetThickness" 
                    label="Gusset Thickness" 
                    value={fields.gussetThickness} 
                    onChange={(v) => handleInputChange("gussetThickness", v)} 
                  />
                  <FloatingSelect 
                    id="threadColor" 
                    label="Stitch Thread Color" 
                    value={fields.threadColor} 
                    onChange={(v) => handleInputChange("threadColor", v)} 
                    options={["Blue", "White", "Black", "Red"]} 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ToggleSwitch 
                    id="spoutCover" 
                    label="Spout Protection Cover" 
                    checked={fields.spoutCover} 
                    onChange={(v) => handleInputChange("spoutCover", v)} 
                  />
                  <ToggleSwitch 
                    id="safetyLabel" 
                    label="Sewn Safety Label" 
                    checked={fields.safetyLabel} 
                    onChange={(v) => handleInputChange("safetyLabel", v)} 
                  />
                  <ToggleSwitch 
                    id="cornerReinforcement" 
                    label="Corner Reinforcement" 
                    checked={fields.cornerReinforcement} 
                    onChange={(v) => handleInputChange("cornerReinforcement", v)} 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-neutral-100 dark:border-neutral-800/50 pt-2">
                  <FloatingSelect 
                    id="sewPattern" 
                    label="Sewing Pattern" 
                    value={fields.sewPattern} 
                    onChange={(v) => handleInputChange("sewPattern", v)} 
                    options={["Standard Overlock", "Double Chain", "Hercules Stitch"]} 
                  />
                  <FloatingSelect 
                    id="bodyType" 
                    label="Body Type" 
                    value={fields.bodyType} 
                    onChange={(v) => handleInputChange("bodyType", v)} 
                    options={["U-Panel Construction", "Circular Weave", "4-Panel Layout"]} 
                  />
                  <FloatingSelect 
                    id="dischargeType" 
                    label="Discharge Spout Type" 
                    value={fields.dischargeType} 
                    onChange={(v) => handleInputChange("dischargeType", v)} 
                    options={["Standard Spout", "Petal Closure", "Star Spout", "None"]} 
                  />
                </div>
              </div>
            </AccordionSection>

            {/* ACCORDION 3: FABRIC (17 Fields) */}
            <AccordionSection id="fabric" title="3. Fabric" fieldsCountLabel="17 Fields">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FloatingInput 
                    id="fabricGsm" 
                    label="Fabric GSM" 
                    value={fields.fabricGsm} 
                    onChange={(v) => handleInputChange("fabricGsm", v)} 
                    required 
                    placeholder="e.g. 160"
                  />
                  <FloatingSelect 
                    id="fabricType" 
                    label="Fabric Type" 
                    value={fields.fabricType} 
                    onChange={(v) => handleInputChange("fabricType", v)} 
                    options={["Virgin Polypropylene", "Recycled Polypropylene", "Conductive Type C", "Conductive Type D"]} 
                    required 
                  />
                  <FloatingSelect 
                    id="fabricColor" 
                    label="Fabric Color" 
                    value={fields.fabricColor} 
                    onChange={(v) => handleInputChange("fabricColor", v)} 
                    options={["White", "Blue", "Beige", "Black"]} 
                    required 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid grid-cols-1 gap-2">
                    <ToggleSwitch 
                      id="doubleLayer" 
                      label="Double Layer Fabric" 
                      checked={fields.doubleLayer} 
                      onChange={(v) => handleInputChange("doubleLayer", v)} 
                    />
                    <ToggleSwitch 
                      id="uvStabilization" 
                      label="UV Stabilization (150 KLY)" 
                      checked={fields.uvStabilization} 
                      onChange={(v) => handleInputChange("uvStabilization", v)} 
                    />
                    <ToggleSwitch 
                      id="antistatic" 
                      label="Antistatic Coating" 
                      checked={fields.antistatic} 
                      onChange={(v) => handleInputChange("antistatic", v)} 
                    />
                    <ToggleSwitch 
                      id="breathable" 
                      label="Breathable Weave fabric" 
                      checked={fields.breathable} 
                      onChange={(v) => handleInputChange("breathable", v)} 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 border-l border-neutral-100 dark:border-neutral-800/80 md:pl-4">
                    <FloatingInput 
                      id="coatingThickness" 
                      label="Coating Thickness" 
                      value={fields.coatingThickness} 
                      onChange={(v) => handleInputChange("coatingThickness", v)} 
                    />
                    <FloatingInput 
                      id="coatingGsm" 
                      label="Coating GSM" 
                      value={fields.coatingGsm} 
                      onChange={(v) => handleInputChange("coatingGsm", v)} 
                    />
                    <FloatingInput 
                      id="fabricWeave" 
                      label="Fabric Weave Density" 
                      value={fields.fabricWeave} 
                      onChange={(v) => handleInputChange("fabricWeave", v)} 
                    />
                    <FloatingSelect 
                      id="conductiveType" 
                      label="Conductive Type" 
                      value={fields.conductiveType} 
                      onChange={(v) => handleInputChange("conductiveType", v)} 
                      options={["None", "Type A", "Type B", "Type C", "Type D"]} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-neutral-100 dark:border-neutral-800/50 pt-2">
                  <FloatingInput 
                    id="warpStrength" 
                    label="Warp Strength" 
                    value={fields.warpStrength} 
                    onChange={(v) => handleInputChange("warpStrength", v)} 
                  />
                  <FloatingInput 
                    id="weftStrength" 
                    label="Weft Strength" 
                    value={fields.weftStrength} 
                    onChange={(v) => handleInputChange("weftStrength", v)} 
                  />
                  <FloatingInput 
                    id="elongation" 
                    label="Yarn Elongation" 
                    value={fields.elongation} 
                    onChange={(v) => handleInputChange("elongation", v)} 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FloatingInput 
                    id="meshSize" 
                    label="Mesh Size" 
                    value={fields.meshSize} 
                    onChange={(v) => handleInputChange("meshSize", v)} 
                  />
                  <FloatingSelect 
                    id="yarnType" 
                    label="Yarn Weave Type" 
                    value={fields.yarnType} 
                    onChange={(v) => handleInputChange("yarnType", v)} 
                    options={["Fibrillated", "Flat Tape", "MonoFilament"]} 
                  />
                  <FloatingInput 
                    id="flatWidth" 
                    label="Flat Weave Width" 
                    value={fields.flatWidth} 
                    onChange={(v) => handleInputChange("flatWidth", v)} 
                  />
                </div>
              </div>
            </AccordionSection>

            {/* ACCORDION 4: MATERIAL / LINER */}
            <AccordionSection id="material" title="4. Material / Liner" fieldsCountLabel="5 Fields">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FloatingSelect 
                    id="linerType" 
                    label="Liner Type" 
                    value={fields.linerType} 
                    onChange={(v) => handleInputChange("linerType", v)} 
                    options={["None", "LDPE Loose Fit", "LDPE Suspended", "HDPE Form-Fit", "Aluminum Foil"]} 
                    required 
                  />
                  <FloatingSelect 
                    id="hygiene" 
                    label="Hygiene Standard" 
                    value={fields.hygiene} 
                    onChange={(v) => handleInputChange("hygiene", v)} 
                    options={["Industrial Grade", "Food Grade", "Pharma Grade"]} 
                    required 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-neutral-100 dark:border-neutral-800/50 pt-2">
                  <FloatingInput 
                    id="linerThickness" 
                    label="Liner Thickness" 
                    value={fields.linerThickness} 
                    onChange={(v) => handleInputChange("linerThickness", v)} 
                  />
                  <FloatingInput 
                    id="linerGsm" 
                    label="Liner GSM Weight" 
                    value={fields.linerGsm} 
                    onChange={(v) => handleInputChange("linerGsm", v)} 
                  />
                  <FloatingSelect 
                    id="linerColor" 
                    label="Liner Color" 
                    value={fields.linerColor} 
                    onChange={(v) => handleInputChange("linerColor", v)} 
                    options={["Natural", "Blue", "Black"]} 
                  />
                </div>
              </div>
            </AccordionSection>

            {/* ACCORDION 5: LOOP CONFIGURATION */}
            <AccordionSection id="loop-config" title="5. Loop Configuration" fieldsCountLabel="8 Fields">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FloatingSelect 
                    id="loopType" 
                    label="Loop Type" 
                    value={fields.loopType} 
                    onChange={(v) => handleInputChange("loopType", v)} 
                    options={["Cross Corner", "Side Seam", "Stevedore", "Tunnel"]} 
                    required 
                  />
                  <FloatingMultiSelect 
                    id="extraLoopOptions" 
                    label="Extra Loop Options" 
                    selectedValues={fields.extraLoopOptions} 
                    onChange={(v) => handleInputChange("extraLoopOptions", v)} 
                    options={["Stevedore Strap", "Double Strap", "Sleeve Loops", "None"]} 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-neutral-100 dark:border-neutral-800/50 pt-2">
                  <FloatingInput 
                    id="loopHeight" 
                    label="Loop Height (mm)" 
                    value={fields.loopHeight} 
                    onChange={(v) => handleInputChange("loopHeight", v)} 
                  />
                  <FloatingInput 
                    id="loopWidth" 
                    label="Loop Ribbon Width" 
                    value={fields.loopWidth} 
                    onChange={(v) => handleInputChange("loopWidth", v)} 
                  />
                  <FloatingSelect 
                    id="loopColor" 
                    label="Loop Fabric Color" 
                    value={fields.loopColor} 
                    onChange={(v) => handleInputChange("loopColor", v)} 
                    options={["Blue", "White", "Black", "Red"]} 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <ToggleSwitch 
                    id="fullLoop" 
                    label="Full Loop Structure" 
                    checked={fields.fullLoop} 
                    onChange={(v) => handleInputChange("fullLoop", v)} 
                  />
                  <ToggleSwitch 
                    id="multifilamentLoop" 
                    label="Multifilament Loop" 
                    checked={fields.multifilamentLoop} 
                    onChange={(v) => handleInputChange("multifilamentLoop", v)} 
                  />
                  <ToggleSwitch 
                    id="patchUnderLoop" 
                    label="Patch Under Loop" 
                    checked={fields.patchUnderLoop} 
                    onChange={(v) => handleInputChange("patchUnderLoop", v)} 
                  />
                </div>
              </div>
            </AccordionSection>

            {/* ACCORDION 6: BAND DETAILS */}
            <AccordionSection id="band-details" title="6. Band Details" fieldsCountLabel="2 Fields">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingSelect 
                  id="bandType" 
                  label="Band Type" 
                  value={fields.bandType} 
                  onChange={(v) => handleInputChange("bandType", v)} 
                  options={["None", "Standard Band", "Reinforced Band", "Double Band"]} 
                  required 
                />
                <FloatingInput 
                  id="bandWidth" 
                  label="Band Width (mm)" 
                  value={fields.bandWidth} 
                  onChange={(v) => handleInputChange("bandWidth", v)} 
                />
              </div>
            </AccordionSection>

            {/* ACCORDION 7: BAG CONSTRUCTION */}
            <AccordionSection id="bag-construction" title="7. Bag Construction" fieldsCountLabel="2 Fields">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingSelect 
                  id="stitchingType" 
                  label="Stitching Type" 
                  value={fields.stitchingType} 
                  onChange={(v) => handleInputChange("stitchingType", v)} 
                  options={["Standard Chain Stitch", "Overlock with Dustproof", "Double Chain Stitch", "Hercules Heavy Stitch"]} 
                  required 
                />
                <FloatingSelect 
                  id="stitchingColor" 
                  label="Stitch Color" 
                  value={fields.stitchingColor} 
                  onChange={(v) => handleInputChange("stitchingColor", v)} 
                  options={["White", "Blue", "Black", "Red"]} 
                />
              </div>
            </AccordionSection>

            {/* ACCORDION 8: MERGED ACCESSORIES, PRINTING, COMMENTS & DOCUMENT POUCH (16 Fields) */}
            <AccordionSection id="accessories" title="8. Accessories, Printing, Comments & Document Pouch" fieldsCountLabel="16 Fields">
              <div className="space-y-4">
                
                {/* A. Accessories Section */}
                <div>
                  <h4 className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">A. Accessories</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FloatingMultiSelect 
                      id="dustproofComponents" 
                      label="Dustproof Components" 
                      selectedValues={fields.dustproofComponents} 
                      onChange={(v) => handleInputChange("dustproofComponents", v)} 
                      options={["Filler Cord", "Felt Strip", "Double Felt Strip", "Seam Seal Tape", "None"]} 
                    />
                    <div className="grid grid-cols-1 gap-2">
                      <ToggleSwitch 
                        id="extraAccessories" 
                        label="Extra Accessories" 
                        checked={fields.extraAccessories} 
                        onChange={(v) => handleInputChange("extraAccessories", v)} 
                      />
                      <ToggleSwitch 
                        id="velcroTie" 
                        label="Velcro Tie Strap" 
                        checked={fields.velcroTie} 
                        onChange={(v) => handleInputChange("velcroTie", v)} 
                      />
                      <ToggleSwitch 
                        id="fillerCord" 
                        label="Dustproof Filler Cord" 
                        checked={fields.fillerCord} 
                        onChange={(v) => handleInputChange("fillerCord", v)} 
                      />
                      <ToggleSwitch 
                        id="chainStitch" 
                        label="Extra Chain Stitch" 
                        checked={fields.chainStitch} 
                        onChange={(v) => handleInputChange("chainStitch", v)} 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <FloatingInput 
                      id="tieString" 
                      label="Tie String Material" 
                      value={fields.tieString} 
                      onChange={(v) => handleInputChange("tieString", v)} 
                    />
                    <FloatingInput 
                      id="specialPackaging" 
                      label="Special Packaging Requirements" 
                      value={fields.specialPackaging} 
                      onChange={(v) => handleInputChange("specialPackaging", v)} 
                    />
                  </div>
                </div>

                {/* B. Printing Section */}
                <div className="border-t border-neutral-100 dark:border-neutral-800/50 pt-3">
                  <h4 className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">B. Printing Specification</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <ToggleSwitch 
                      id="printingRequired" 
                      label="Printing Required" 
                      checked={fields.printingRequired} 
                      onChange={(v) => handleInputChange("printingRequired", v)} 
                    />
                    <FloatingSelect 
                      id="printingSide" 
                      label="Printing Side" 
                      value={fields.printingSide} 
                      onChange={(v) => handleInputChange("printingSide", v)} 
                      options={["None", "1 Side", "2 Sides", "4 Sides"]} 
                      required 
                    />
                    <FloatingSelect 
                      id="printingColour" 
                      label="Printing Color" 
                      value={fields.printingColour} 
                      onChange={(v) => handleInputChange("printingColour", v)} 
                      options={["None", "Black", "Blue", "Green", "Red", "Multi-color"]} 
                      required 
                    />
                  </div>
                </div>

                {/* C. Document Pouch & Label Section */}
                <div className="border-t border-neutral-100 dark:border-neutral-800/50 pt-3">
                  <h4 className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">C. Document Pouch & Labeling</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid grid-cols-1 gap-2">
                      <ToggleSwitch 
                        id="documentPouch" 
                        label="Document Pouch" 
                        checked={fields.documentPouch} 
                        onChange={(v) => handleInputChange("documentPouch", v)} 
                      />
                      <ToggleSwitch 
                        id="palletRequired" 
                        label="Wood Pallet Packaging" 
                        checked={fields.palletRequired} 
                        onChange={(v) => handleInputChange("palletRequired", v)} 
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-2 border-l border-neutral-100 dark:border-neutral-800/80 md:pl-4">
                      <FloatingSelect 
                        id="documentPouchSize" 
                        label="Document Pouch Size" 
                        value={fields.documentPouchSize} 
                        onChange={(v) => handleInputChange("documentPouchSize", v)} 
                        options={["A4 Size", "A5 Size", "Ziplock A4", "Ziplock A5"]} 
                      />
                      <FloatingInput 
                        id="documentPouchPosition" 
                        label="Pouch Placement Position" 
                        value={fields.documentPouchPosition} 
                        onChange={(v) => handleInputChange("documentPouchPosition", v)} 
                      />
                    </div>
                  </div>
                  <div className="mt-2">
                    <FloatingSelect 
                      id="labelType" 
                      label="Product Label Type" 
                      value={fields.labelType} 
                      onChange={(v) => handleInputChange("labelType", v)} 
                      options={["Standard ABS Product Label", "Custom Client Logo Label", "Warning Hazard Label"]} 
                    />
                  </div>
                </div>

                {/* D. Inquiry Comments Section */}
                <div className="border-t border-neutral-100 dark:border-neutral-800/50 pt-3">
                  <h4 className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">D. Special Remarks</h4>
                  <div className="relative mt-2">
                    <textarea
                      id="customerComments"
                      value={fields.customerComments}
                      onChange={(e) => handleInputChange("customerComments", e.target.value)}
                      placeholder=" "
                      className="peer w-full min-h-[90px] px-3.5 pt-4 pb-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white transition-all outline-none focus:border-primary-500 resize-y"
                    />
                    <label
                      htmlFor="customerComments"
                      className="absolute left-3 px-1.5 bg-white dark:bg-neutral-900 text-xs font-semibold select-none pointer-events-none transition-all
                        -translate-y-2.5 top-0.5 scale-95 origin-[0] text-neutral-500 dark:text-neutral-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-3 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-focus:scale-95 peer-focus:-translate-y-2.5 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-primary-500"
                    >
                      Inquiry Comments / Technical Notes
                    </label>
                  </div>
                </div>

              </div>
            </AccordionSection>

          </div>

          {/* STICKY ACTION FOOTER */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-end gap-2 shrink-0 select-none">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 text-xs font-semibold border border-neutral-200 dark:border-neutral-850 rounded-lg bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-4 py-2 text-xs font-semibold border border-neutral-200 dark:border-neutral-850 rounded-lg bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-all"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={handleSaveChanges}
              className="px-4 py-2 text-xs font-semibold border border-primary-500/35 rounded-lg bg-white dark:bg-neutral-900 hover:bg-primary-50/50 dark:hover:bg-primary-950/20 text-primary transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
