export interface Event {
  id: string;
  name: string;
  host: string;
  coHosts: string[];
  status: 'active' | 'expired';
  startDate: string;
  expiryDate: string;
  createdDate: string;
  expiredDate?: string;
  expiryReason?: string;
  metrics: {
    going: number;
    maybe: number;
    notGoing: number;
    participantCount: number;
    mediaCount: number;
  };
  chatState: 'active' | 'archived';
}

export const mockEvents: Event[] = [
  {
    id: 'EVT-101',
    name: 'Tech Conference 2024',
    host: 'Sarah Johnson',
    coHosts: ['Michael Chen', 'Emma Davis'],
    status: 'active',
    startDate: '2024-12-20T09:00:00Z',
    expiryDate: '2024-12-20T18:00:00Z',
    createdDate: '2024-01-15T10:00:00Z',
    metrics: {
      going: 156,
      maybe: 42,
      notGoing: 12,
      participantCount: 210,
      mediaCount: 85,
    },
    chatState: 'active',
  },
  {
    id: 'EVT-102',
    name: 'Product Launch Workshop',
    host: 'Sarah Johnson',
    coHosts: [],
    status: 'expired',
    startDate: '2024-03-10T14:00:00Z',
    expiryDate: '2024-03-10T15:00:00Z',
    createdDate: '2024-01-20T14:30:00Z',
    expiredDate: '2024-03-10T15:00:05Z',
    expiryReason: 'Auto',
    metrics: {
      going: 45,
      maybe: 10,
      notGoing: 5,
      participantCount: 60,
      mediaCount: 120,
    },
    chatState: 'archived',
  },
  {
    id: 'EVT-103',
    name: 'Networking Mixer',
    host: 'Sarah Johnson',
    coHosts: ['David Park'],
    status: 'active',
    startDate: '2024-06-15T18:00:00Z',
    expiryDate: '2024-06-15T20:00:00Z',
    createdDate: '2024-02-05T09:15:00Z',
    metrics: {
      going: 88,
      maybe: 25,
      notGoing: 10,
      participantCount: 123,
      mediaCount: 45,
    },
    chatState: 'active',
  },
  {
    id: 'EVT-104',
    name: 'Developer Meetup',
    host: 'Michael Chen',
    coHosts: ['Sarah Johnson'],
    status: 'active',
    startDate: '2024-07-01T18:30:00Z',
    expiryDate: '2024-07-01T19:00:00Z',
    createdDate: '2024-03-12T11:45:00Z',
    metrics: {
      going: 32,
      maybe: 15,
      notGoing: 8,
      participantCount: 55,
      mediaCount: 12,
    },
    chatState: 'active',
  },
  {
    id: 'EVT-205',
    name: 'Marketing Strategy 101',
    host: 'David Park',
    coHosts: [],
    status: 'expired',
    startDate: '2024-04-01T15:00:00Z',
    expiryDate: '2024-04-01T16:00:00Z',
    createdDate: '2024-03-01T16:20:00Z',
    expiredDate: '2024-04-01T16:05:00Z',
    expiryReason: 'Manual End',
    metrics: {
      going: 12,
      maybe: 5,
      notGoing: 2,
      participantCount: 19,
      mediaCount: 30,
    },
    chatState: 'archived',
  },
];
