'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    User, Shield, LogOut, ShoppingBag, Loader2,
    Edit2, Save, X, CheckCircle2, Calendar, Camera,
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '@/lib/api/client';
import { useAuthStore } from '@/features/auth/store';

interface UserProfile {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar: string | null;
    createdAt?: string;
}

export default function ProfilePage() {
    const { user: authUser, logout, isLoading: authLoading } = useAuthStore();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [saving, setSaving] = useState(false);

    const [showAvatarPopover, setShowAvatarPopover] = useState(false);
    const [avatarUrlInput, setAvatarUrlInput] = useState('');
    const [savingAvatar, setSavingAvatar] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (authLoading || !authUser) return;
        api.get('/users/profile').then(res => {
            setProfile(res.data);
            setEditName(res.data.name || '');
            setAvatarUrlInput(res.data.avatar || '');
        }).catch(err => {
            if (err?.response?.status === 401) logout();
        }).finally(() => setLoading(false));
    }, [authUser, authLoading, logout]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setShowAvatarPopover(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSaveName = async () => {
        if (!editName.trim()) return;
        setSaving(true);
        try {
            const res = await api.put('/users/profile', { name: editName.trim() });
            setProfile(res.data);
            setIsEditing(false);
            toast.success('Đã cập nhật tên!');
        } catch {
            toast.error('Lỗi hệ thống.');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAvatar = async () => {
        const trimmed = avatarUrlInput.trim();
        setSavingAvatar(true);
        try {
            const res = await api.put('/users/profile', { avatar: trimmed || '' });
            setProfile(res.data);
            setAvatarUrlInput(res.data.avatar || '');
            setShowAvatarPopover(false);
            toast.success(trimmed ? 'Đã cập nhật ảnh đại diện.' : 'Đã gỡ ảnh đại diện.');
        } catch {
            toast.error('Không cập nhật được. Kiểm tra URL.');
        } finally {
            setSavingAvatar(false);
        }
    };

    const handleLogout = () => {
        if (confirm('Xác nhận đăng xuất?')) logout();
    };

    if (authLoading || loading) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    if (!profile) return null;

    const joinedDate = profile.createdAt
        ? new Date(profile.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '—';

    return (
        <div className="min-h-screen bg-zinc-50 py-10 px-4">
            <div className="max-w-3xl mx-auto space-y-5">

                {/* Main card */}
                <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">

                    {/* Banner */}
                    <div className="h-28 bg-zinc-900" />

                    <div className="px-6 md:px-8 pb-8">
                        {/* Avatar row */}
                        <div className="flex items-end justify-between -mt-12 mb-6">
                            <div className="relative" ref={popoverRef}>
                                <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
                                    {profile.avatar ? (
                                        <Image src={profile.avatar} alt={profile.name} fill className="object-cover" unoptimized />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-3xl font-black text-zinc-400">
                                            {profile.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => setShowAvatarPopover(v => !v)}
                                    className="absolute bottom-0 right-0 w-7 h-7 bg-zinc-900 text-white rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors shadow"
                                    title="Đổi ảnh"
                                >
                                    <Camera size={12} />
                                </button>

                                {showAvatarPopover && (
                                    <div className="absolute top-full left-0 mt-2 z-20 w-72 bg-white border border-zinc-200 rounded-xl shadow-xl p-4 space-y-3">
                                        <p className="text-xs font-bold text-zinc-700">Dán URL ảnh đại diện</p>
                                        <input
                                            type="url"
                                            value={avatarUrlInput}
                                            onChange={e => setAvatarUrlInput(e.target.value)}
                                            placeholder="https://..."
                                            className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900"
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleSaveAvatar}
                                                disabled={savingAvatar}
                                                className="flex-1 py-2 bg-zinc-900 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 disabled:opacity-60 flex items-center justify-center gap-1"
                                            >
                                                {savingAvatar ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                                                Lưu
                                            </button>
                                            <button
                                                onClick={() => setShowAvatarPopover(false)}
                                                className="px-3 py-2 bg-zinc-100 text-zinc-600 rounded-lg text-xs font-bold hover:bg-zinc-200"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Edit / Save buttons */}
                            <div className="flex gap-2 pb-1">
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-1.5 px-4 py-2 border border-zinc-200 rounded-lg text-xs font-bold text-zinc-700 hover:border-zinc-900 hover:text-zinc-900 transition-colors"
                                    >
                                        <Edit2 size={13} /> Chỉnh sửa
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => { setIsEditing(false); setEditName(profile.name); }}
                                            className="px-4 py-2 border border-zinc-200 rounded-lg text-xs font-bold text-zinc-500 hover:bg-zinc-50"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            onClick={handleSaveName}
                                            disabled={saving}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 disabled:opacity-60"
                                        >
                                            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                                            Lưu
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Name & Email */}
                        <div className="space-y-5">
                            <div>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        className="text-2xl font-black text-zinc-900 tracking-tight border-b-2 border-zinc-900 outline-none bg-transparent w-full pb-1"
                                        autoFocus
                                    />
                                ) : (
                                    <h1 className="text-2xl font-black text-zinc-900 tracking-tight">{profile.name}</h1>
                                )}
                                <p className="text-sm text-zinc-500 mt-0.5 flex items-center gap-1.5">
                                    {profile.email}
                                    <CheckCircle2 size={13} className="text-blue-500" />
                                </p>
                            </div>

                            {/* Info row */}
                            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-zinc-100">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-zinc-100 rounded-lg text-zinc-500">
                                        {profile.role === 'ADMIN' ? <Shield size={14} /> : <User size={14} />}
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Vai trò</p>
                                        <p className="text-xs font-bold text-zinc-800">{profile.role || 'Member'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-green-50 rounded-lg text-green-500">
                                        <CheckCircle2 size={14} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Trạng thái</p>
                                        <p className="text-xs font-bold text-green-600">Xác minh</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-blue-50 rounded-lg text-blue-400">
                                        <Calendar size={14} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Gia nhập</p>
                                        <p className="text-xs font-bold text-zinc-800">{joinedDate}</p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[10px] text-zinc-400 font-mono">
                                #UID-{String(profile.id).padStart(5, '0')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-2 gap-4">
                    <Link
                        href="/orders"
                        className="group flex items-center gap-4 p-5 bg-white border border-zinc-200 rounded-2xl hover:border-zinc-900 transition-all duration-200 shadow-sm"
                    >
                        <div className="p-3 bg-zinc-50 rounded-xl text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                            <ShoppingBag size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-zinc-900 text-sm">Đơn hàng</p>
                            <p className="text-xs text-zinc-400 mt-0.5">Lịch sử mua sắm</p>
                        </div>
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="group flex items-center gap-4 p-5 bg-white border border-zinc-200 rounded-2xl hover:border-red-400 transition-all duration-200 text-left shadow-sm"
                    >
                        <div className="p-3 bg-zinc-50 rounded-xl text-zinc-400 group-hover:bg-red-500 group-hover:text-white transition-all">
                            <LogOut size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-zinc-900 text-sm group-hover:text-red-600 transition-colors">Đăng xuất</p>
                            <p className="text-xs text-zinc-400 mt-0.5">Kết thúc phiên làm việc</p>
                        </div>
                    </button>
                </div>

            </div>
        </div>
    );
}
