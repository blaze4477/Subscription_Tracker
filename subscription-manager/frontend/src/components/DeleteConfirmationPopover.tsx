'use client';

import { useEffect, useRef } from 'react';
import { X, Trash2 } from 'lucide-react';

interface DeleteConfirmationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  triggerRef: React.RefObject<HTMLElement | null>;
}

export default function DeleteConfirmationPopover({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  triggerRef
}: DeleteConfirmationPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, triggerRef]);

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Position popover relative to trigger
  useEffect(() => {
    if (!isOpen || !popoverRef.current || !triggerRef.current) return;

    const trigger = triggerRef.current;
    const popover = popoverRef.current;
    const triggerRect = trigger.getBoundingClientRect();
    
    // Position to the left of the trigger button
    const left = triggerRect.left - popover.offsetWidth - 8;
    const top = triggerRect.top + (triggerRect.height / 2) - (popover.offsetHeight / 2);
    
    // Ensure popover stays within viewport
    const adjustedLeft = Math.max(8, Math.min(left, window.innerWidth - popover.offsetWidth - 8));
    const adjustedTop = Math.max(8, Math.min(top, window.innerHeight - popover.offsetHeight - 8));
    
    popover.style.left = `${adjustedLeft}px`;
    popover.style.top = `${adjustedTop}px`;
  }, [isOpen, triggerRef]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <>
      {/* No backdrop - just the popover */}
      <div
        ref={popoverRef}
        className={`
          fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-72
          transform transition-all duration-200 ease-out
          ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        `}
        style={{ transformOrigin: 'right center' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <Trash2 className="w-4 h-4 text-red-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">
              Delete Subscription
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete <span className="font-medium text-gray-900">{itemName}</span>? 
          This action cannot be undone.
        </p>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </>
  );
}