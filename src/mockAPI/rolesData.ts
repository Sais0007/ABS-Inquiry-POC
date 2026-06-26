export interface ActionPermission {
  id: string;
  name: string;
  code: string;
}

export interface ModulePermission {
  id: string;
  name: string;
  actions: ActionPermission[];
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  status: 'active' | 'inactive';
  userCount: number;
  lastUpdated: string;
  permissions: Record<string, string[]>; // moduleId -> actionIds[]
}

export const availableModules: ModulePermission[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    actions: [
      { id: 'view', name: 'View Dashboard', code: 'dashboard_view' },
      { id: 'export', name: 'Export Data', code: 'dashboard_export' },
    ],
  },
  {
    id: 'users',
    name: 'Users',
    actions: [
      { id: 'view', name: 'View Users', code: 'user_view' },
      { id: 'add', name: 'Add User', code: 'user_add' },
      { id: 'edit', name: 'Edit User', code: 'user_edit' },
      { id: 'delete', name: 'Delete User', code: 'user_delete' },
      { id: 'status', name: 'Change Status', code: 'user_status' },
    ],
  },
  {
    id: 'events',
    name: 'Event Management',
    actions: [
      { id: 'view', name: 'View Events', code: 'event_view' },
      { id: 'add', name: 'Add Event', code: 'event_add' },
      { id: 'edit', name: 'Edit Event', code: 'event_edit' },
      { id: 'delete', name: 'Delete Event', code: 'event_delete' },
      { id: 'approve', name: 'Approve Event', code: 'event_approve' },
    ],
  },
  {
    id: 'country',
    name: 'Country',
    actions: [
      { id: 'view', name: 'View', code: 'country_view' },
      { id: 'add', name: 'Add', code: 'country_add' },
      { id: 'edit', name: 'Edit', code: 'country_edit' },
      { id: 'delete', name: 'Delete', code: 'country_delete' },
    ],
  },
  {
    id: 'state',
    name: 'State',
    actions: [
      { id: 'view', name: 'View', code: 'state_view' },
      { id: 'add', name: 'Add', code: 'state_add' },
      { id: 'edit', name: 'Edit', code: 'state_edit' },
      { id: 'delete', name: 'Delete', code: 'state_delete' },
    ],
  },
  {
    id: 'city',
    name: 'City',
    actions: [
      { id: 'view', name: 'View', code: 'city_view' },
      { id: 'add', name: 'Add', code: 'city_add' },
      { id: 'edit', name: 'Edit', code: 'city_edit' },
      { id: 'delete', name: 'Delete', code: 'city_delete' },
    ],
  },
  {
    id: 'email-templates',
    name: 'Email Templates',
    actions: [
      { id: 'view', name: 'View', code: 'email_view' },
      { id: 'edit', name: 'Edit', code: 'email_edit' },
    ],
  },
  {
    id: 'system-notifications',
    name: 'System Notifications',
    actions: [
      { id: 'view', name: 'View', code: 'notif_view' },
      { id: 'add', name: 'Add', code: 'notif_add' },
      { id: 'delete', name: 'Delete', code: 'notif_delete' },
    ],
  },
  {
    id: 'configurations',
    name: 'Configurations',
    actions: [
      { id: 'view', name: 'View Settings', code: 'config_view' },
      { id: 'edit', name: 'Edit Settings', code: 'config_edit' },
    ],
  },
];

export const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Super Admin',
    code: 'super_admin',
    description: 'Full system access with all permissions enabled.',
    status: 'active',
    userCount: 3,
    lastUpdated: '2024-05-10T10:00:00Z',
    permissions: {
      'dashboard': ['view', 'export'],
      'users': ['view', 'add', 'edit', 'delete', 'status'],
      'events': ['view', 'add', 'edit', 'delete', 'approve'],
      'country': ['view', 'add', 'edit', 'delete'],
      'state': ['view', 'add', 'edit', 'delete'],
      'city': ['view', 'add', 'edit', 'delete'],
      'email-templates': ['view', 'edit'],
      'system-notifications': ['view', 'add', 'delete'],
      'configurations': ['view', 'edit'],
    },
  },
  {
    id: '2',
    name: 'Manager',
    code: 'manager',
    description: 'Can manage users and events, but cannot access system configurations.',
    status: 'active',
    userCount: 8,
    lastUpdated: '2024-05-12T14:30:00Z',
    permissions: {
      'dashboard': ['view'],
      'users': ['view', 'add', 'edit', 'status'],
      'events': ['view', 'add', 'edit', 'approve'],
      'country': ['view'],
      'state': ['view'],
      'city': ['view'],
    },
  },
  {
    id: '3',
    name: 'Editor',
    code: 'editor',
    description: 'Limited access to view and edit content, but cannot delete or add new users.',
    status: 'active',
    userCount: 15,
    lastUpdated: '2024-05-14T09:15:00Z',
    permissions: {
      'dashboard': ['view'],
      'users': ['view'],
      'events': ['view', 'edit'],
      'email-templates': ['view', 'edit'],
    },
  },
  {
    id: '4',
    name: 'Viewer',
    code: 'viewer',
    description: 'Read-only access to the system.',
    status: 'active',
    userCount: 24,
    lastUpdated: '2024-05-15T11:00:00Z',
    permissions: {
      'dashboard': ['view'],
      'users': ['view'],
      'events': ['view'],
    },
  },
  {
    id: '5',
    name: 'Inactive Role',
    code: 'inactive_role',
    description: 'This role is currently inactive and not assigned to any user.',
    status: 'inactive',
    userCount: 0,
    lastUpdated: '2024-04-20T16:45:00Z',
    permissions: {},
  },
];
