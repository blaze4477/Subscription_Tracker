'use client';

import { TrendingUp, CreditCard, Calendar, AlertCircle, DollarSign, BarChart3 } from 'lucide-react';
import { AnalyticsData } from '@/lib/subscriptionAPI';
import { formatCurrency, formatDate } from '@/lib/utils';

interface SubscriptionStatsProps {
  analytics: AnalyticsData;
  isLoading?: boolean;
}

export default function SubscriptionStats({ analytics, isLoading }: SubscriptionStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-secondary-200 rounded-lg"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-secondary-200 rounded w-24 mb-2"></div>
                <div className="h-6 bg-secondary-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const { overview, upcomingRenewals } = analytics;

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Subscriptions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Active Subscriptions</p>
              <p className="text-2xl font-semibold text-secondary-900">
                {overview.activeSubscriptions}
              </p>
              <p className="text-xs text-secondary-500 mt-1">
                {overview.inactiveSubscriptions} inactive
              </p>
            </div>
          </div>
        </div>

        {/* Monthly Spending */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-success-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Monthly Spending</p>
              <p className="text-2xl font-semibold text-secondary-900">
                {formatCurrency(overview.monthlyTotal)}
              </p>
              <p className="text-xs text-secondary-500 mt-1">
                {formatCurrency(overview.yearlyTotal)} yearly
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming Renewals */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-warning-100 rounded-lg">
              <Calendar className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Upcoming Renewals</p>
              <p className="text-2xl font-semibold text-secondary-900">
                {upcomingRenewals.count}
              </p>
              <p className="text-xs text-secondary-500 mt-1">
                {formatCurrency(upcomingRenewals.totalCost)} total
              </p>
            </div>
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-secondary-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-secondary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total Spent</p>
              <p className="text-2xl font-semibold text-secondary-900">
                {formatCurrency(overview.totalSpent)}
              </p>
              <p className="text-xs text-secondary-500 mt-1">
                All time
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Renewals List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-secondary-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-secondary-900">Upcoming Renewals</h3>
              <span className="text-sm text-secondary-500">Next 30 days</span>
            </div>
          </div>
          <div className="p-6">
            {upcomingRenewals.renewals.length > 0 ? (
              <div className="space-y-4">
                {upcomingRenewals.renewals.map((renewal) => {
                  const daysUntil = Math.ceil(
                    (new Date(renewal.nextBillingDate).getTime() - new Date().getTime()) / 
                    (1000 * 60 * 60 * 24)
                  );
                  
                  return (
                    <div key={renewal.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                      <div>
                        <p className="font-medium text-secondary-900">{renewal.serviceName}</p>
                        <p className="text-sm text-secondary-600">
                          {formatDate(renewal.nextBillingDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-secondary-900">
                          {formatCurrency(renewal.cost)}
                        </p>
                        <p className={`text-xs font-medium ${
                          daysUntil <= 3 ? 'text-danger-600' : 
                          daysUntil <= 7 ? 'text-warning-600' : 'text-secondary-500'
                        }`}>
                          {daysUntil === 0 ? 'Today' : 
                           daysUntil === 1 ? 'Tomorrow' : 
                           `${daysUntil} days`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                <p className="text-secondary-500">No upcoming renewals in the next 30 days</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-secondary-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-secondary-900">Spending by Category</h3>
              <BarChart3 className="h-5 w-5 text-secondary-400" />
            </div>
          </div>
          <div className="p-6">
            {analytics.categoryBreakdown.length > 0 ? (
              <div className="space-y-4">
                {analytics.categoryBreakdown.map((category) => {
                  const percentage = (category.monthlyTotal / overview.monthlyTotal) * 100;
                  
                  const getCategoryIcon = (cat: string) => {
                    switch (cat.toLowerCase()) {
                      case 'entertainment': return '🎬';
                      case 'productivity': return '💼';
                      case 'health': return '🏥';
                      case 'development': return '💻';
                      case 'education': return '📚';
                      default: return '📦';
                    }
                  };

                  return (
                    <div key={category.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getCategoryIcon(category.category)}</span>
                          <span className="font-medium text-secondary-900 capitalize">
                            {category.category}
                          </span>
                          <span className="text-sm text-secondary-500">
                            ({category.count} subscription{category.count !== 1 ? 's' : ''})
                          </span>
                        </div>
                        <span className="font-semibold text-secondary-900">
                          {formatCurrency(category.monthlyTotal)}
                        </span>
                      </div>
                      <div className="w-full bg-secondary-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.max(percentage, 5)}%` }}
                        ></div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-secondary-500">
                          {percentage.toFixed(1)}% of monthly spending
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                <p className="text-secondary-500">No category data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Alert */}
      {upcomingRenewals.count > 0 && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-warning-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-warning-900">Upcoming Charges</h4>
              <p className="text-sm text-warning-700 mt-1">
                You have {upcomingRenewals.count} subscription{upcomingRenewals.count !== 1 ? 's' : ''} renewing 
                in the next 30 days for a total of {formatCurrency(upcomingRenewals.totalCost)}.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}