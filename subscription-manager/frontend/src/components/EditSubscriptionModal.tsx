'use client';

import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { subscriptionApi, type Subscription, type UpdateSubscriptionData } from '@/lib/subscriptionAPI';

interface EditSubscriptionModalProps {
  isOpen: boolean;
  subscription: Subscription | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditSubscriptionModal({ isOpen, subscription, onClose, onSuccess }: EditSubscriptionModalProps) {
  const [formData, setFormData] = useState<UpdateSubscriptionData>({
    serviceName: '',
    planType: '',
    cost: 0,
    billingCycle: 'monthly',
    nextBillingDate: '',
    status: 'active',
    category: 'entertainment',
    paymentMethod: 'credit_card',
    autoRenewal: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // Category options
  const categories = [
    { value: 'entertainment', label: '🎬 Entertainment', description: 'Netflix, Spotify, Gaming' },
    { value: 'productivity', label: '💼 Productivity', description: 'Office, Adobe, Tools' },
    { value: 'health', label: '🏥 Health & Fitness', description: 'Gym, Apps, Wellness' },
    { value: 'development', label: '💻 Development', description: 'AWS, GitHub, Hosting' },
    { value: 'education', label: '📚 Education', description: 'Courses, Books, Learning' },
    { value: 'news', label: '📰 News & Media', description: 'Newspapers, Magazines' },
    { value: 'communication', label: '💬 Communication', description: 'Slack, Teams, Phone' },
    { value: 'storage', label: '☁️ Cloud Storage', description: 'Dropbox, Drive, iCloud' },
    { value: 'other', label: '📦 Other', description: 'Everything else' },
  ];

  // Billing cycle options
  const billingCycles = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly (3 months)' },
    { value: 'yearly', label: 'Yearly' },
  ];

  // Status options
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'expired', label: 'Expired' },
  ];

  // Payment method options
  const paymentMethods = [
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'apple_pay', label: 'Apple Pay' },
    { value: 'google_pay', label: 'Google Pay' },
    { value: 'other', label: 'Other' },
  ];

  // Populate form when subscription changes
  useEffect(() => {
    if (subscription) {
      // Format the date for input[type="date"]
      const formattedDate = subscription.nextBillingDate 
        ? new Date(subscription.nextBillingDate).toISOString().split('T')[0]
        : '';

      setFormData({
        serviceName: subscription.serviceName,
        planType: subscription.planType,
        cost: subscription.cost,
        billingCycle: subscription.billingCycle,
        nextBillingDate: formattedDate,
        status: subscription.status,
        category: subscription.category,
        paymentMethod: subscription.paymentMethod,
        autoRenewal: subscription.autoRenewal,
      });
    }
  }, [subscription]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : 
               type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               value
    }));

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (formData.serviceName && !formData.serviceName.trim()) {
      newErrors.serviceName = 'Service name cannot be empty';
    } else if (formData.serviceName && formData.serviceName.length > 100) {
      newErrors.serviceName = 'Service name must not exceed 100 characters';
    }

    if (formData.planType && !formData.planType.trim()) {
      newErrors.planType = 'Plan type cannot be empty';
    } else if (formData.planType && formData.planType.length > 50) {
      newErrors.planType = 'Plan type must not exceed 50 characters';
    }

    if (formData.cost !== undefined && formData.cost <= 0) {
      newErrors.cost = 'Cost must be greater than 0';
    } else if (formData.cost !== undefined && formData.cost > 999999.99) {
      newErrors.cost = 'Cost must not exceed $999,999.99';
    }

    if (formData.nextBillingDate) {
      const selectedDate = new Date(formData.nextBillingDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.nextBillingDate = 'Next billing date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subscription) return;
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      // Only send fields that have values (partial update)
      const updateData: UpdateSubscriptionData = {};
      
      if (formData.serviceName !== undefined && formData.serviceName.trim()) {
        updateData.serviceName = formData.serviceName.trim();
      }
      if (formData.planType !== undefined && formData.planType.trim()) {
        updateData.planType = formData.planType.trim();
      }
      if (formData.cost !== undefined) {
        updateData.cost = formData.cost;
      }
      if (formData.billingCycle !== undefined) {
        updateData.billingCycle = formData.billingCycle;
      }
      if (formData.nextBillingDate !== undefined) {
        updateData.nextBillingDate = formData.nextBillingDate;
      }
      if (formData.status !== undefined) {
        updateData.status = formData.status;
      }
      if (formData.category !== undefined) {
        updateData.category = formData.category;
      }
      if (formData.paymentMethod !== undefined) {
        updateData.paymentMethod = formData.paymentMethod;
      }
      if (formData.autoRenewal !== undefined) {
        updateData.autoRenewal = formData.autoRenewal;
      }

      await subscriptionApi.updateSubscription(subscription.id, updateData);

      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update subscription';
      setApiError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    
    setErrors({});
    setApiError(null);
    onClose();
  };

  if (!isOpen || !subscription) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Save className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-secondary-900">Edit Subscription</h2>
              <p className="text-sm text-secondary-600">Update {subscription.serviceName} subscription details</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-secondary-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            <X className="h-5 w-5 text-secondary-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* API Error */}
          {apiError && (
            <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-danger-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-danger-900">Error updating subscription</h4>
                  <p className="text-sm text-danger-700 mt-1">{apiError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Service Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="serviceName" className="block text-sm font-medium text-secondary-700 mb-2">
                Service Name
              </label>
              <input
                type="text"
                id="serviceName"
                name="serviceName"
                value={formData.serviceName || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${
                  errors.serviceName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Netflix, Spotify, Adobe"
                disabled={isSubmitting}
              />
              {errors.serviceName && (
                <p className="text-sm text-danger-600 mt-1">{errors.serviceName}</p>
              )}
            </div>

            <div>
              <label htmlFor="planType" className="block text-sm font-medium text-secondary-700 mb-2">
                Plan Type
              </label>
              <input
                type="text"
                id="planType"
                name="planType"
                value={formData.planType || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${
                  errors.planType ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Premium, Pro, Basic"
                disabled={isSubmitting}
              />
              {errors.planType && (
                <p className="text-sm text-danger-600 mt-1">{errors.planType}</p>
              )}
            </div>
          </div>

          {/* Cost and Billing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="cost" className="block text-sm font-medium text-secondary-700 mb-2">
                Cost (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
                <input
                  type="number"
                  id="cost"
                  name="cost"
                  value={formData.cost || ''}
                  onChange={handleInputChange}
                  className={`w-full pl-8 pr-3 py-2 border rounded-md text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${
                    errors.cost ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={isSubmitting}
                />
              </div>
              {errors.cost && (
                <p className="text-sm text-danger-600 mt-1">{errors.cost}</p>
              )}
            </div>

            <div>
              <label htmlFor="billingCycle" className="block text-sm font-medium text-secondary-700 mb-2">
                Billing Cycle
              </label>
              <select
                id="billingCycle"
                name="billingCycle"
                value={formData.billingCycle || 'monthly'}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                disabled={isSubmitting}
              >
                {billingCycles.map(cycle => (
                  <option key={cycle.value} value={cycle.value}>
                    {cycle.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status and Next Billing Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-secondary-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status || 'active'}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                disabled={isSubmitting}
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="nextBillingDate" className="block text-sm font-medium text-secondary-700 mb-2">
                Next Billing Date
              </label>
              <input
                type="date"
                id="nextBillingDate"
                name="nextBillingDate"
                value={formData.nextBillingDate || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${
                  errors.nextBillingDate ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {errors.nextBillingDate && (
                <p className="text-sm text-danger-600 mt-1">{errors.nextBillingDate}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-secondary-700 mb-2">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category || 'entertainment'}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              disabled={isSubmitting}
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-secondary-500 mt-1">
              {categories.find(c => c.value === formData.category)?.description}
            </p>
          </div>

          {/* Payment Method */}
          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-secondary-700 mb-2">
              Payment Method
            </label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod || 'credit_card'}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              disabled={isSubmitting}
            >
              {paymentMethods.map(method => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          {/* Auto Renewal */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="autoRenewal"
              name="autoRenewal"
              checked={formData.autoRenewal || false}
              onChange={handleInputChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              disabled={isSubmitting}
            />
            <label htmlFor="autoRenewal" className="text-sm text-secondary-700">
              Enable auto-renewal
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-secondary-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-secondary-700 bg-secondary-100 hover:bg-secondary-200 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition-colors duration-200"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Update Subscription</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}