'use client';

import { useRef, useState } from 'react';
import { Edit, Trash2, Calendar, DollarSign, CreditCard } from 'lucide-react';
import { Subscription, getDaysUntilRenewal, getRenewalUrgencyColor, getStatusColor, getBillingCycleDisplay } from '@/lib/subscriptionAPI';
import { formatCurrency, formatDate, capitalize } from '@/lib/utils';
import DeleteConfirmationPopover from './DeleteConfirmationPopover';

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit?: (subscription: Subscription) => void;
  onDelete?: (subscription: Subscription) => void;
}

export default function SubscriptionCard({ subscription, onEdit, onDelete }: SubscriptionCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  
  const daysUntilRenewal = getDaysUntilRenewal(subscription.nextBillingDate);
  const renewalUrgencyColor = getRenewalUrgencyColor(daysUntilRenewal);
  const statusColor = getStatusColor(subscription.status);

  const getRenewalText = (days: number): string => {
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `Due in ${days} days`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'entertainment':
        return '🎬';
      case 'productivity':
        return '💼';
      case 'health':
        return '🏥';
      case 'development':
        return '💻';
      case 'education':
        return '📚';
      default:
        return '📦';
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(subscription);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete(subscription);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="p-4 border-b border-secondary-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getCategoryIcon(subscription.category)}</span>
            <div>
              <h3 className="font-semibold text-secondary-900 text-lg">
                {subscription.serviceName}
              </h3>
              <p className="text-sm text-secondary-600">
                {subscription.planType}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
              {capitalize(subscription.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Cost and Billing */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-secondary-400" />
            <div>
              <p className="text-sm text-secondary-600">Cost</p>
              <p className="font-semibold text-secondary-900">
                {formatCurrency(subscription.cost)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-secondary-400" />
            <div>
              <p className="text-sm text-secondary-600">Billing</p>
              <p className="font-semibold text-secondary-900">
                {getBillingCycleDisplay(subscription.billingCycle)}
              </p>
            </div>
          </div>
        </div>

        {/* Next Billing Date */}
        <div className="bg-secondary-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600">Next billing date</p>
              <p className="font-medium text-secondary-900">
                {formatDate(subscription.nextBillingDate)}
              </p>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${renewalUrgencyColor}`}>
              {getRenewalText(daysUntilRenewal)}
            </div>
          </div>
        </div>

        {/* Payment Method & Category */}
        <div className="flex items-center justify-between text-sm text-secondary-600">
          <div className="flex items-center space-x-1">
            <CreditCard className="h-4 w-4" />
            <span>{capitalize(subscription.paymentMethod.replace('_', ' '))}</span>
          </div>
          <span className="bg-secondary-100 px-2 py-1 rounded text-xs">
            {capitalize(subscription.category)}
          </span>
        </div>

        {/* Auto Renewal */}
        {subscription.autoRenewal && (
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-success-500 rounded-full"></div>
            <span className="text-secondary-600">Auto-renewal enabled</span>
          </div>
        )}

        {/* Transaction Count */}
        {subscription._count.transactions > 0 && (
          <div className="text-sm text-secondary-500">
            {subscription._count.transactions} transaction{subscription._count.transactions !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-secondary-50 border-t border-secondary-100 flex justify-end space-x-2">
        <button
          onClick={handleEdit}
          className="flex items-center space-x-1 px-3 py-1.5 text-sm text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-md transition-colors duration-200"
        >
          <Edit className="h-4 w-4" />
          <span>Edit</span>
        </button>
        
        <button
          ref={deleteButtonRef}
          onClick={handleDeleteClick}
          className="flex items-center space-x-1 px-3 py-1.5 text-sm text-danger-600 hover:text-danger-900 hover:bg-danger-50 rounded-md transition-colors duration-200"
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete</span>
        </button>
      </div>

      {/* Delete Confirmation Popover */}
      <DeleteConfirmationPopover
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        itemName={subscription.serviceName}
        triggerRef={deleteButtonRef}
      />
    </div>
  );
}