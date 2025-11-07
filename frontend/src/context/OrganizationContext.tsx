import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import * as adminApi from '../services/adminApi';

interface Organization {
  id: string;
  name: string;
  subdomain: string | null;
  contact_email: string;
  subscription_status: string;
  is_active: boolean;
}

interface OrganizationContextType {
  selectedOrganization: Organization | null;
  setSelectedOrganization: (org: Organization | null) => void;
  organizations: Organization[];
  loadOrganizations: () => Promise<void>;
  isSystemView: boolean;
  canSwitchContext: boolean;
  loading: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);

  // Determine if user can switch contexts (only DStudio admins without their own org)
  const canSwitchContext = user?.role === 'dstudio_admin' && !user?.organizationId;

  // Is in system view (no org selected)
  const isSystemView = canSwitchContext && !selectedOrganization;

  // Load organizations list for DStudio admins
  const loadOrganizations = async () => {
    if (!canSwitchContext) return;

    try {
      setLoading(true);
      const response = await adminApi.getAllOrganizations(1, 100);
      setOrganizations(response.data.organizations || []);
    } catch (error) {
      console.error('Failed to load organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load organizations on mount if user can switch
  useEffect(() => {
    if (canSwitchContext) {
      loadOrganizations();
    }
  }, [canSwitchContext]);

  // If user is org admin, automatically set their organization
  useEffect(() => {
    if (user?.organizationId && user?.role === 'org_admin') {
      // For org admins, we'll use their organization from user context
      // No need to fetch it separately
      setSelectedOrganization({
        id: user.organizationId,
        name: 'My Organization', // This will be updated when we fetch org details
        subdomain: null,
        contact_email: user.email || '',
        subscription_status: 'active',
        is_active: true,
      });
    }
  }, [user]);

  const value: OrganizationContextType = {
    selectedOrganization,
    setSelectedOrganization,
    organizations,
    loadOrganizations,
    isSystemView,
    canSwitchContext,
    loading,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = (): OrganizationContextType => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within OrganizationProvider');
  }
  return context;
};
