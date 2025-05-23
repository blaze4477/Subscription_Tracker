'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { subscriptionApi, type Subscription, type AnalyticsData } from '@/lib/subscriptionAPI';
import { LogOut, User, CreditCard, Plus, Search, Filter } from 'lucide-react';
import SubscriptionCard from '@/components/SubscriptionCard';
import SubscriptionStats from '@/components/SubscriptionStats';
import AddSubscriptionModal from '@/components/AddSubscriptionModal';
import EditSubscriptionModal from '@/components/EditSubscriptionModal';
import { useToast } from '@/components/SuccessToast';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout, getCurrentUser, initialize } = useAuthStore();
  const { showToast, ToastComponent } = useToast();
  
  // Dashboard state
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  // Initialize and check authentication
  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  // Get fresh user data on mount
  useEffect(() => {
    if (isAuthenticated && !user) {
      getCurrentUser();
    }
  }, [isAuthenticated, user, getCurrentUser]);

  // Fetch subscriptions and analytics when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscriptions();
      fetchAnalytics();
    }
  }, [isAuthenticated]);

  const fetchSubscriptions = async () => {
    try {
      setIsLoadingSubscriptions(true);
      setError(null);
      
      const params = {
        limit: 50, // Get more subscriptions for dashboard
        // All filtering now done client-side for better UX
      };
      
      const response = await subscriptionApi.getSubscriptions(params);
      setSubscriptions(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch subscriptions';
      setError(errorMessage);
      console.error('Error fetching subscriptions:', err);
    } finally {
      setIsLoadingSubscriptions(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setIsLoadingAnalytics(true);
      const response = await subscriptionApi.getAnalytics();
      setAnalytics(response.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      // Don't show analytics errors as they're not critical
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  // Debounce search term to prevent excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Only refetch when authentication changes (all filtering is client-side)
  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscriptions();
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/');
    }
  };

  const handleAddSubscription = () => {
    setIsAddModalOpen(true);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsEditModalOpen(true);
  };

  const handleDeleteSubscription = async (subscription: Subscription) => {
    try {
      await subscriptionApi.deleteSubscription(subscription.id);
      // Refresh data after deletion
      await Promise.all([fetchSubscriptions(), fetchAnalytics()]);
      showToast(`${subscription.serviceName} has been deleted successfully!`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete subscription';
      showToast(`Error: ${errorMessage}`);
    }
  };

  const handleModalSuccess = async () => {
    // Refresh data after successful add/edit
    await Promise.all([fetchSubscriptions(), fetchAnalytics()]);
  };

  const handleAddSuccess = async () => {
    await handleModalSuccess();
    showToast('Subscription added successfully!');
  };

  const handleEditSuccess = async () => {
    await handleModalSuccess();
    showToast('Subscription updated successfully!');
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedSubscription(null);
  };

  // Filter subscriptions based on search term and status (client-side for better UX)
  const filteredSubscriptions = useMemo(() => {
    let filtered = subscriptions;

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(sub => sub.status.toLowerCase() === filterStatus.toLowerCase());
    }

    // Apply search filter (using debounced search term)
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase().trim();
      filtered = filtered.filter(sub =>
        sub.serviceName.toLowerCase().includes(searchLower) ||
        sub.planType.toLowerCase().includes(searchLower) ||
        sub.category.toLowerCase().includes(searchLower) ||
        sub.paymentMethod.toLowerCase().includes(searchLower) ||
        sub.billingCycle.toLowerCase().includes(searchLower) ||
        sub.cost.toString().includes(searchLower)
      );
    }

    return filtered;
  }, [subscriptions, debouncedSearchTerm, filterStatus]);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-secondary-600 mb-4">Please sign in to access the dashboard</p>
          <button
            onClick={() => router.push('/')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Title */}
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-xl font-semibold text-secondary-900">
                Subscription Manager
              </h1>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-secondary-700">
                <User className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">
                  {user.name || user.email}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center text-secondary-600 hover:text-secondary-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">
            Welcome back{user.name ? `, ${user.name}` : ''}!
          </h2>
          <p className="text-secondary-600">
            Here's an overview of your subscription management dashboard.
          </p>
        </div>

        {/* Analytics Stats */}
        {analytics && (
          <SubscriptionStats 
            analytics={analytics} 
            isLoading={isLoadingAnalytics}
          />
        )}

        {/* Subscriptions Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-secondary-900">
                Your Subscriptions
              </h3>
              <p className="text-sm text-secondary-600 mt-1">
                Manage and track your active subscriptions
              </p>
            </div>
            
            <button
              onClick={handleAddSubscription}
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>Add Subscription</span>
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
              <input
                type="text"
                placeholder="Search subscriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-secondary-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg mb-6">
              <p className="font-medium">Error loading subscriptions</p>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={fetchSubscriptions}
                className="text-sm underline mt-2 hover:no-underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Subscriptions Grid */}
          {isLoadingSubscriptions ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-secondary-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-secondary-200 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-secondary-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-secondary-200 rounded"></div>
                    <div className="h-3 bg-secondary-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredSubscriptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubscriptions.map((subscription) => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  onEdit={handleEditSubscription}
                  onDelete={handleDeleteSubscription}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 text-secondary-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">
                {debouncedSearchTerm || filterStatus !== 'all' ? 'No matching subscriptions' : 'No subscriptions found'}
              </h3>
              <p className="text-secondary-500 mb-6">
                {debouncedSearchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start by adding your first subscription to track your spending'
                }
              </p>
              {(!debouncedSearchTerm && filterStatus === 'all') && (
                <button
                  onClick={handleAddSubscription}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                >
                  Add Your First Subscription
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <AddSubscriptionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      <EditSubscriptionModal
        isOpen={isEditModalOpen}
        subscription={selectedSubscription}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
      />

      {/* Toast Notifications */}
      <ToastComponent />
    </div>
  );
}