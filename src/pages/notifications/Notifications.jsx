import React, { useState, useEffect } from 'react';
import { notificationService } from '../../services/notificationService';
import { formatDate } from '../../utils/date';
import { useApp } from '../../context/AppContext';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import {
  Bell,
  CheckCheck,
  Check,
  Clock,
  AlertTriangle,
  BadgePercent,
  FileText,
  UserPlus,
} from 'lucide-react';

export default function Notifications() {
  const { showToast } = useApp();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getAll();
      setNotifications(res.data || []);
    } catch (err) {
      showToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      showToast('Error updating notification', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      showToast('All notifications marked as read', 'success');
      fetchNotifications();
    } catch (err) {
      showToast('Failed to mark all as read', 'error');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'payment_due':
      case 'payment_overdue':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'loan_completed':
      case 'payment_received':
        return <BadgePercent className="w-5 h-5 text-emerald-500" />;
      case 'document_uploaded':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'customer_created':
        return <UserPlus className="w-5 h-5 text-violet-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Notifications</h2>
          <p className="text-xs text-slate-500 mt-0.5">Payment reminders, disbursement alerts, and system events</p>
        </div>

        {notifications.length > 0 && (
          <Button size="sm" variant="secondary" onClick={handleMarkAllRead}>
            <CheckCheck className="w-4 h-4 mr-1.5" /> Mark All Read
          </Button>
        )}
      </div>

      {loading ? (
        <Loader text="Loading alerts..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="You're all caught up! System alerts and reminders will appear here."
          icon={Bell}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                n.isRead ? 'bg-white' : 'bg-emerald-50/40'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0">
                  {getIcon(n.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 mt-2">
                    <Clock className="w-3 h-3" />
                    {formatDate(n.createdAt)}
                  </span>
                </div>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => handleMarkAsRead(n._id)}
                  className="p-1 text-slate-400 hover:text-emerald-600 rounded"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
