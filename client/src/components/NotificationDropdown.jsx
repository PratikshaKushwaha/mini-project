import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock } from 'lucide-react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';
import { Link } from 'react-router-dom';

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const fetchNotifications = async () => {
        try {
            const res = await getNotifications();
            setNotifications(res.data.data);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await markNotificationRead(id);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="text-stone-600 hover:text-text-brown relative p-2 rounded-full hover:bg-stone-100 transition"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-stone-100 z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-stone-50 flex justify-between items-center bg-stone-50/50">
                        <h3 className="font-bold text-deep-cocoa text-sm uppercase tracking-wider">Notifications</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={handleMarkAllRead}
                                className="text-[11px] font-bold text-btn-brown hover:underline flex items-center gap-1"
                            >
                                <Check className="w-3 h-3" /> Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-10 text-center text-stone-400">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-sm italic">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div 
                                    key={notification._id}
                                    className={`p-4 border-b border-stone-50 transition hover:bg-stone-50 flex gap-3 relative ${!notification.isRead ? 'bg-btn-brown/[0.03]' : ''}`}
                                >
                                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notification.isRead ? 'bg-transparent' : 'bg-btn-brown'}`} />
                                    <div className="flex-1">
                                        <p className={`text-sm leading-snug ${notification.isRead ? 'text-stone-500' : 'text-deep-cocoa font-medium'}`}>
                                            {notification.message}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[10px] text-stone-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {notification.link && (
                                                <Link 
                                                    to={notification.link}
                                                    onClick={() => {
                                                        setIsOpen(false);
                                                        handleMarkAsRead(notification._id);
                                                    }}
                                                    className="text-[10px] font-bold text-btn-brown hover:underline"
                                                >
                                                    View Details
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                    {!notification.isRead && (
                                        <button 
                                            onClick={() => handleMarkAsRead(notification._id)}
                                            className="text-stone-300 hover:text-stone-500 opacity-0 group-hover:opacity-100 transition"
                                            title="Mark as read"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                    
                    <div className="p-3 bg-stone-50 text-center border-t border-stone-100">
                        <Link to="/notifications" className="text-xs font-bold text-stone-500 hover:text-text-brown transition">
                            View all history
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
