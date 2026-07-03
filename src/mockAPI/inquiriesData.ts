export interface Inquiry {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  productType: string;
  quantity: number;
  requestDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'under-review' | 'quoted' | 'approved' | 'rejected' | 'processing';
  notes?: string;
  processingStep?: 'Uploading' | 'Record Created' | 'Processing' | 'PDF Parsing' | 'Field Extraction' | 'Validation' | 'Completed';
  swl?: string;
  sf?: string;
  exportedOn?: string;
  extraction?: 'complete' | 'partial' | 'failed' | 'processing';
  validation?: 'valid' | 'review' | 'missing' | 'pending';
  processingStatus: 'Uploading' | 'Processing' | 'In Review' | 'Exported' | 'Failed' | 'Draft';
  inquiryReference?: string;
  bagType?: string;
  updatedOn?: string;
}

export const mockInquiries: Inquiry[] = [
  {
    id: 'INQ-2026-001',
    customerName: 'Reliance Chemical Industries',
    email: 'procurement@reliancechem.com',
    phone: '+91 22 4000 1234',
    productType: 'FIBC U-Panel Bag (Type C Conductive)',
    quantity: 15000,
    requestDate: '2026-06-20T10:00:00Z',
    priority: 'high',
    status: 'under-review',
    notes: 'Require anti-static bags for powder chemical transport. Compliance certificate mandatory.',
    swl: '',
    sf: '5:1',
    extraction: 'complete',
    validation: 'review',
    processingStatus: 'In Review',
    inquiryReference: 'REF-2026-001',
    bagType: 'U-Panel',
    updatedOn: '2026-06-20T10:00:00Z'
  },
  {
    id: 'INQ-2026-002',
    customerName: 'BASF India Limited',
    email: 'contact.inquiries@basf.com',
    phone: '+91 22 6660 5000',
    productType: 'FIBC Circular Bag (Dust Proof Seams)',
    quantity: 25000,
    requestDate: '2026-06-21T14:30:00Z',
    priority: 'high',
    status: 'pending',
    notes: 'Standard 4-loop design with top filling skirt and bottom discharge spout.',
    swl: '1000 KG',
    sf: '5:1',
    extraction: 'complete',
    validation: 'pending',
    processingStatus: 'In Review',
    inquiryReference: 'REF-2026-002',
    bagType: 'Circular',
    updatedOn: '2026-06-21T14:30:00Z'
  },
  {
    id: 'INQ-2026-003',
    customerName: 'Tata Chemicals',
    email: 'sc.procure@tatachemicals.com',
    phone: '+91 20 6601 3000',
    productType: 'Baffle Bag (Q-Bag for space saving)',
    quantity: 8000,
    requestDate: '2026-06-22T09:15:00Z',
    priority: 'medium',
    status: 'quoted',
    notes: 'For soda ash shipment. Internal baffles needed to prevent bulging during transport.',
    swl: '1500 KG',
    sf: '6:1',
    exportedOn: '2026-06-22T14:05:00Z',
    extraction: 'complete',
    validation: 'valid',
    processingStatus: 'Exported',
    inquiryReference: 'REF-2026-003',
    bagType: 'Baffle',
    updatedOn: '2026-06-22T14:05:00Z'
  },
  {
    id: 'INQ-2026-004',
    customerName: 'Adani Ports & SEZ',
    email: 'logistics.support@adani.com',
    phone: '+91 79 2656 5555',
    productType: 'Standard Single Loop FIBC',
    quantity: 50000,
    requestDate: '2026-06-23T11:45:00Z',
    priority: 'high',
    status: 'approved',
    notes: 'High volume order for fertilizer shipment. Needs UV stabilization additive.',
    swl: '2000 KG',
    sf: '5:1',
    exportedOn: '2026-06-23T16:30:00Z',
    extraction: 'complete',
    validation: 'valid',
    processingStatus: 'Exported',
    inquiryReference: 'REF-2026-004',
    bagType: 'Single Loop',
    updatedOn: '2026-06-23T16:30:00Z'
  },
  {
    id: 'INQ-2026-005',
    customerName: 'Gujarat State Fertilizers & Chemicals',
    email: 'purchase@gsfcltd.com',
    phone: '+91 265 309 2000',
    productType: 'FIBC 4-Loop Bag (Cross Corner Loops)',
    quantity: 12000,
    requestDate: '2026-06-24T16:20:00Z',
    priority: 'low',
    status: 'rejected',
    notes: 'Rejected due to mismatch in pricing requirements and material specifications.',
    swl: '',
    sf: '',
    extraction: 'failed',
    validation: 'missing',
    processingStatus: 'Failed',
    inquiryReference: 'REF-2026-005',
    bagType: 'Four-Loop',
    updatedOn: '2026-06-24T16:20:00Z'
  },
  {
    id: 'INQ-2026-006',
    customerName: 'Ultratech Cement Ltd',
    email: 'supplychain@ultratech.adityabirla.com',
    phone: '+91 22 5000 8000',
    productType: 'Standard 2-Loop FIBC',
    quantity: 35000,
    requestDate: '2026-06-25T08:30:00Z',
    priority: 'medium',
    status: 'pending',
    notes: 'Urgent requirement for regional cement distribution hubs.',
    swl: '1000 KG',
    sf: '5:1',
    extraction: 'partial',
    validation: 'review',
    processingStatus: 'In Review',
    inquiryReference: 'REF-2026-006',
    bagType: 'Two-Loop',
    updatedOn: '2026-06-25T08:30:00Z'
  },
  {
    id: 'INQ-2026-007',
    customerName: 'Coromandel International',
    email: 'info.fertilizers@coromandel.murugappa.com',
    phone: '+91 40 2784 2034',
    productType: 'FIBC U-Panel Bag (Laminated)',
    quantity: 20000,
    requestDate: '2026-06-25T13:10:00Z',
    priority: 'medium',
    status: 'quoted',
    notes: 'Laminated fabric required to prevent moisture ingress during open storage.',
    swl: '1000 KG',
    sf: '5:1',
    exportedOn: '2026-06-25T15:20:00Z',
    extraction: 'complete',
    validation: 'valid',
    processingStatus: 'Exported',
    inquiryReference: 'REF-2026-007',
    bagType: 'U-Panel',
    updatedOn: '2026-06-25T15:20:00Z'
  },
  {
    id: 'INQ-2026-008',
    customerName: 'Hindalco Industries Ltd',
    email: 'materials.procure@hindalco.adityabirla.com',
    phone: '+91 22 6662 6662',
    productType: 'FIBC Baffle Bag (Q-Bag)',
    quantity: 6000,
    requestDate: '2026-06-26T10:05:00Z',
    priority: 'low',
    status: 'under-review',
    notes: 'For packaging alumina powder. Fine dust-proof sealing required.',
    swl: '1200 KG',
    sf: '5:1',
    extraction: 'complete',
    validation: 'valid',
    processingStatus: 'In Review',
    inquiryReference: 'REF-2026-008',
    bagType: 'Baffle',
    updatedOn: '2026-06-26T10:05:00Z'
  }
];
