import { useState, useEffect } from 'react';

// Mock data for the Amajoni Identity Risk Monitor

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: 'admin' | 'user';
  mfaEnabled: boolean;
  riskScore: number;
  lastLogin: string;
  status: 'safe' | 'medium' | 'risky';
  provider: 'microsoft' | 'google';
}

export interface LoginEvent {
  id: string;
  timestamp: string;
  username: string;
  email: string;
  location: string;
  countryCode: string;
  deviceType: string;
  ipAddress: string;
  result: 'success' | 'failed';
  riskFlag: 'normal' | 'suspicious';
  riskFactors: string[];
}

export interface Alert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedUser: string;
  timestamp: string;
  description: string;
  recommendedAction: string;
  status: 'open' | 'investigating' | 'resolved';
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  impactLevel: 'low' | 'medium' | 'high';
  category: 'mfa' | 'password' | 'access' | 'device' | 'policy';
  affectedUsers: string[];
  actionEndpoint: string;
}

export interface DashboardSummary {
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  overallScore: number;
  suspiciousLoginsThisWeek: number;
  mfaCompliancePercentage: number;
  totalUsers: number;
  activeAlerts: number;
  loginTrend: { date: string; logins: number; suspicious: number }[];
}

// Mock Users Data
const mockUsers: User[] = [
  { id: '1', username: 'john.doe', displayName: 'John Doe', email: 'john.doe@company.com', role: 'admin', mfaEnabled: true, riskScore: 15, lastLogin: '2024-01-10T08:30:00Z', status: 'safe', provider: 'microsoft' },
  { id: '2', username: 'jane.smith', displayName: 'Jane Smith', email: 'jane.smith@company.com', role: 'user', mfaEnabled: false, riskScore: 65, lastLogin: '2024-01-10T09:15:00Z', status: 'medium', provider: 'google' },
  { id: '3', username: 'bob.wilson', displayName: 'Bob Wilson', email: 'bob.wilson@company.com', role: 'user', mfaEnabled: true, riskScore: 25, lastLogin: '2024-01-09T16:45:00Z', status: 'safe', provider: 'microsoft' },
  { id: '4', username: 'alice.brown', displayName: 'Alice Brown', email: 'alice.brown@company.com', role: 'user', mfaEnabled: false, riskScore: 82, lastLogin: '2024-01-10T02:30:00Z', status: 'risky', provider: 'microsoft' },
  { id: '5', username: 'charlie.davis', displayName: 'Charlie Davis', email: 'charlie.davis@company.com', role: 'admin', mfaEnabled: true, riskScore: 10, lastLogin: '2024-01-10T07:00:00Z', status: 'safe', provider: 'google' },
  { id: '6', username: 'eva.martinez', displayName: 'Eva Martinez', email: 'eva.martinez@company.com', role: 'user', mfaEnabled: true, riskScore: 35, lastLogin: '2024-01-08T14:20:00Z', status: 'safe', provider: 'microsoft' },
  { id: '7', username: 'frank.jones', displayName: 'Frank Jones', email: 'frank.jones@company.com', role: 'user', mfaEnabled: false, riskScore: 75, lastLogin: '2024-01-10T03:45:00Z', status: 'risky', provider: 'google' },
  { id: '8', username: 'grace.lee', displayName: 'Grace Lee', email: 'grace.lee@company.com', role: 'user', mfaEnabled: true, riskScore: 20, lastLogin: '2024-01-09T11:30:00Z', status: 'safe', provider: 'microsoft' },
];

// Mock Login Events
const mockLoginEvents: LoginEvent[] = [
  { id: '1', timestamp: '2024-01-10T09:30:00Z', username: 'alice.brown', email: 'alice.brown@company.com', location: 'Nigeria', countryCode: 'NG', deviceType: 'Desktop', ipAddress: '102.89.34.56', result: 'success', riskFlag: 'suspicious', riskFactors: ['Unusual location', 'High-risk country'] },
  { id: '2', timestamp: '2024-01-10T09:15:00Z', username: 'jane.smith', email: 'jane.smith@company.com', location: 'South Africa', countryCode: 'ZA', deviceType: 'Mobile', ipAddress: '196.21.45.78', result: 'success', riskFlag: 'normal', riskFactors: [] },
  { id: '3', timestamp: '2024-01-10T08:45:00Z', username: 'frank.jones', email: 'frank.jones@company.com', location: 'Russia', countryCode: 'RU', deviceType: 'Desktop', ipAddress: '95.173.128.45', result: 'failed', riskFlag: 'suspicious', riskFactors: ['High-risk country', 'Failed login', 'New device'] },
  { id: '4', timestamp: '2024-01-10T08:30:00Z', username: 'john.doe', email: 'john.doe@company.com', location: 'South Africa', countryCode: 'ZA', deviceType: 'Desktop', ipAddress: '196.21.45.12', result: 'success', riskFlag: 'normal', riskFactors: [] },
  { id: '5', timestamp: '2024-01-10T07:00:00Z', username: 'charlie.davis', email: 'charlie.davis@company.com', location: 'South Africa', countryCode: 'ZA', deviceType: 'Mobile', ipAddress: '196.21.45.99', result: 'success', riskFlag: 'normal', riskFactors: [] },
  { id: '6', timestamp: '2024-01-10T03:45:00Z', username: 'frank.jones', email: 'frank.jones@company.com', location: 'China', countryCode: 'CN', deviceType: 'Desktop', ipAddress: '223.104.63.78', result: 'success', riskFlag: 'suspicious', riskFactors: ['Unusual hours', 'High-risk country', 'Impossible travel'] },
  { id: '7', timestamp: '2024-01-10T02:30:00Z', username: 'alice.brown', email: 'alice.brown@company.com', location: 'Brazil', countryCode: 'BR', deviceType: 'Mobile', ipAddress: '177.67.89.12', result: 'success', riskFlag: 'suspicious', riskFactors: ['Unusual hours', 'New location'] },
  { id: '8', timestamp: '2024-01-09T16:45:00Z', username: 'bob.wilson', email: 'bob.wilson@company.com', location: 'South Africa', countryCode: 'ZA', deviceType: 'Desktop', ipAddress: '196.21.45.34', result: 'success', riskFlag: 'normal', riskFactors: [] },
];

// Mock Alerts
const mockAlerts: Alert[] = [
  { id: '1', type: 'Impossible Travel', severity: 'critical', affectedUser: 'frank.jones@company.com', timestamp: '2024-01-10T03:50:00Z', description: 'User logged in from China 4 hours after logging in from South Africa. This is physically impossible.', recommendedAction: 'Force sign-out and reset password immediately', status: 'open' },
  { id: '2', type: 'High-Risk Country Login', severity: 'high', affectedUser: 'alice.brown@company.com', timestamp: '2024-01-10T09:32:00Z', description: 'Successful login detected from Nigeria, a high-risk country for your organization.', recommendedAction: 'Verify with user and consider blocking country', status: 'open' },
  { id: '3', type: 'MFA Not Enabled', severity: 'medium', affectedUser: 'jane.smith@company.com', timestamp: '2024-01-10T09:20:00Z', description: 'User has accessed sensitive resources without MFA enabled.', recommendedAction: 'Enable MFA for this user immediately', status: 'investigating' },
  { id: '4', type: 'Multiple Failed Logins', severity: 'high', affectedUser: 'frank.jones@company.com', timestamp: '2024-01-10T08:50:00Z', description: '5 failed login attempts detected in the past hour from different IPs.', recommendedAction: 'Lock account and investigate', status: 'open' },
  { id: '5', type: 'New Device Added', severity: 'low', affectedUser: 'bob.wilson@company.com', timestamp: '2024-01-09T17:00:00Z', description: 'A new mobile device was registered to the user account.', recommendedAction: 'Confirm device with user', status: 'resolved' },
];

// Mock Recommendations
const mockRecommendations: Recommendation[] = [
  { id: '1', title: 'Enable MFA for jane.smith', description: 'This user accesses sensitive resources but does not have MFA enabled. Enabling MFA will significantly reduce the risk of account compromise.', impactLevel: 'high', category: 'mfa', affectedUsers: ['jane.smith@company.com'], actionEndpoint: '/api/action/enable-mfa/2' },
  { id: '2', title: 'Enable MFA for frank.jones', description: 'This user has shown suspicious login activity and does not have MFA enabled.', impactLevel: 'high', category: 'mfa', affectedUsers: ['frank.jones@company.com'], actionEndpoint: '/api/action/enable-mfa/7' },
  { id: '3', title: 'Reset password for alice.brown', description: 'Multiple suspicious logins detected from unusual locations. Password may be compromised.', impactLevel: 'high', category: 'password', affectedUsers: ['alice.brown@company.com'], actionEndpoint: '/api/action/reset-password/4' },
  { id: '4', title: 'Block logins from Nigeria', description: 'Multiple suspicious login attempts detected from Nigeria. Consider blocking this country if no employees operate there.', impactLevel: 'medium', category: 'access', affectedUsers: [], actionEndpoint: '/api/action/block-country/NG' },
  { id: '5', title: 'Force sign-out suspicious sessions', description: 'Sessions from high-risk locations should be terminated immediately.', impactLevel: 'high', category: 'access', affectedUsers: ['frank.jones@company.com', 'alice.brown@company.com'], actionEndpoint: '/api/action/force-signout' },
  { id: '6', title: 'Review new device for bob.wilson', description: 'A new device was recently added. Verify this was authorized by the user.', impactLevel: 'low', category: 'device', affectedUsers: ['bob.wilson@company.com'], actionEndpoint: '/api/action/review-device/5' },
  { id: '7', title: 'Enforce password policy', description: '3 users have passwords older than 90 days. Consider enforcing password rotation.', impactLevel: 'medium', category: 'policy', affectedUsers: ['jane.smith@company.com', 'frank.jones@company.com', 'alice.brown@company.com'], actionEndpoint: '/api/action/enforce-password-policy' },
];

// Mock Dashboard Summary
const mockDashboardSummary: DashboardSummary = {
  overallGrade: 'C',
  overallScore: 62,
  suspiciousLoginsThisWeek: 4,
  mfaCompliancePercentage: 62.5,
  totalUsers: 8,
  activeAlerts: 4,
  loginTrend: [
    { date: '2024-01-04', logins: 45, suspicious: 1 },
    { date: '2024-01-05', logins: 52, suspicious: 2 },
    { date: '2024-01-06', logins: 38, suspicious: 0 },
    { date: '2024-01-07', logins: 41, suspicious: 1 },
    { date: '2024-01-08', logins: 56, suspicious: 3 },
    { date: '2024-01-09', logins: 48, suspicious: 2 },
    { date: '2024-01-10', logins: 62, suspicious: 4 },
  ],
};

// Custom hooks for fetching mock data
export function useDashboardSummary() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setData(mockDashboardSummary);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { data, loading, error, refetch: () => setLoading(true) };
}

export function useUsers() {
  const [data, setData] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 400));
        setData(mockUsers);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { data, loading, error };
}

export function useLoginEvents() {
  const [data, setData] = useState<LoginEvent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 400));
        setData(mockLoginEvents);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { data, loading, error };
}

export function useAlerts() {
  const [data, setData] = useState<Alert[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 400));
        setData(mockAlerts);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateAlertStatus = (alertId: string, status: Alert['status']) => {
    setData(prev => prev?.map(alert => 
      alert.id === alertId ? { ...alert, status } : alert
    ) || null);
  };

  return { data, loading, error, updateAlertStatus };
}

export function useRecommendations() {
  const [data, setData] = useState<Recommendation[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 400));
        setData(mockRecommendations);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const executeAction = async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    setData(prev => prev?.filter(rec => rec.id !== id) || null);
    return true;
  };

  return { data, loading, error, executeAction };
}
