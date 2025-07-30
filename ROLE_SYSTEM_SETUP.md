# Role-Based Access Control System Setup Guide

This guide explains how to set up and configure the comprehensive role-based access control system in your DATACRM application.

## Overview

The role system provides hierarchical permission management with three main user types:
- **Super Admin** (testdatacrmpascal@gmail.com) - Full system access
- **Organization Admins** - Manage their organization and users
- **Regular Users** - Limited access based on assigned permissions

## Database Setup

### 1. Run the Database Schema

Execute the SQL script in your Supabase SQL editor:

```bash
# Copy and paste the contents of database-setup.sql into Supabase SQL Editor
```

The script creates:
- `organizations` - Company/organization records
- `permissions` - Available system permissions
- `user_roles` - User role assignments within organizations
- `user_permissions` - Specific permission grants to users

### 2. Verify Tables Created

Check that these tables exist in your Supabase database:
- organizations
- permissions
- user_roles
- user_permissions

## Permission System

### Default Permissions

The system includes these permission categories:

**Customers:**
- `view_customers` - View customer data
- `edit_customers` - Edit customer information
- `delete_customers` - Delete customer records

**Data Management:**
- `import_data` - Import data from CSV files
- `export_data` - Export data to CSV files

**Analytics:**
- `view_analytics` - View analytics and reports

**Campaign Management:**
- `manage_campaigns` - Create and manage campaigns
- `manage_journeys` - Create and manage customer journeys
- `manage_content` - Create and manage content templates

**Administration:**
- `manage_team` - Manage team members and roles
- `manage_settings` - Manage system settings
- `view_all_data` - View all organizational data

**System:**
- `super_admin` - Super administrator privileges

## User Roles

### Super Admin
- Email: testdatacrmpascal@gmail.com
- Can create and manage organizations
- Can assign organization admins
- Full access to all features
- Can delegate any permission

### Organization Admin
- Manages a specific organization
- Can assign roles to users within their organization
- Can manage user permissions
- Can delegate their permissions to others

### Regular User
- Limited access based on assigned permissions
- Can delegate their existing permissions to others
- Cannot elevate their own permissions

## Access Control Implementation

### Navigation
The admin navigation is automatically shown/hidden based on user permissions:
- Super admins see all admin options
- Organization admins see user management options
- Regular users see no admin options

### Page Protection
Each admin page checks permissions on load:
```typescript
// Example permission check
const checkPermissions = async () => {
  const isSuperAdminUser = await isSuperAdmin(user.email)
  const roleResponse = await getUserRole(user.id)
  
  if (!isSuperAdminUser && roleResponse.data?.role !== 'organization_admin') {
    router.push('/dashboard')
    return
  }
}
```

## Using the Admin Interface

### For Super Admins

1. **Navigate to Administration**
   - Click "Administration" in the main navigation
   - Access organization management, user permissions, and system settings

2. **Create Organizations**
   - Go to "Organisationen verwalten"
   - Create new organizations with admin email assignments
   - View organization statistics

3. **Manage Global Permissions**
   - Access "Benutzerberechtigungen"
   - Assign roles across all organizations
   - Delegate permissions system-wide

### For Organization Admins

1. **Manage Team Members**
   - Access "Benutzerberechtigungen"
   - Assign roles within your organization
   - Grant specific permissions to users

2. **Delegate Permissions**
   - Select users in your organization
   - Assign available permissions
   - Track permission assignments

## API Functions

### Key Functions Available

```typescript
// Check if user is super admin
await isSuperAdmin(email: string): Promise<boolean>

// Get user's role in organization
await getUserRole(userId: string): Promise<{data: any, error: any}>

// Assign role to user
await assignRole(userId: string, organizationId: string, role: string, assignedBy: string)

// Grant permission to user
await assignPermission(userId: string, permissionName: string, organizationId: string, grantedBy: string)

// Create new organization
await createOrganization(name: string, adminEmail: string, domain?: string)

// Get all organizations (super admin only)
await getOrganizations()
```

## Security Features

### Row Level Security (RLS)
- Users can only access data from their organization
- Super admin can access all data
- Automatic filtering based on user context

### Permission Delegation
- Users can only delegate permissions they already have
- Cannot elevate their own permissions
- All delegations are tracked with timestamps

### Audit Trail
- All role assignments tracked with who assigned them
- Permission grants logged with grantor information
- Created/updated timestamps on all records

## Testing the System

### 1. Test Super Admin Access
- Login as testdatacrmpascal@gmail.com
- Verify admin navigation appears
- Test organization creation
- Test global permission management

### 2. Test Organization Admin
- Create an organization with a different admin email
- Login as that admin
- Verify limited admin access (no organization creation)
- Test user permission management

### 3. Test Regular User
- Create a user without admin role
- Login as that user
- Verify no admin navigation
- Test permission-based feature access

## Troubleshooting

### Common Issues

1. **Admin navigation not appearing**
   - Check user email against super admin email
   - Verify role assignment in user_roles table
   - Check permission checking functions

2. **Permission checks failing**
   - Verify database tables created correctly
   - Check RLS policies are active
   - Verify function implementations

3. **Unable to create organizations**
   - Confirm super admin status
   - Check database permissions
   - Verify API function implementation

### Debug Commands

```typescript
// Check user permissions in browser console
console.log(await isSuperAdmin('user@example.com'))
console.log(await getUserRole('user-uuid'))
```

## Next Steps

1. **Implement Permission Checks in Features**
   - Add permission checks to customer management
   - Protect data import/export features
   - Secure analytics and reporting

2. **Enhance UI/UX**
   - Add permission indicators in UI
   - Show/hide features based on permissions
   - Implement permission request system

3. **Add Audit Logging**
   - Track all permission changes
   - Log administrative actions
   - Create audit reports

The role system is now ready for use and can be extended with additional permissions and features as needed.
