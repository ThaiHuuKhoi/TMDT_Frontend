'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, CheckCircle2 } from 'lucide-react';
import publicApi from '@/lib/api/publicClient';

export default function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!token) {
            setError('Đường dẫn không hợp lệ hoặc thiếu token xác thực.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp!');
            return;
        }

        if (newPassword.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }

        setLoading(true);

        try {
            await publicApi.post('/auth/reset-password', {
                token,
                newPassword,
            });

            setSuccess(true);
        } catch (err: any) {
            console.error('Lỗi đặt lại mật khẩu:', err);
            let errorMsg = 'Có lỗi xảy ra. Vui lòng thử lại hoặc yêu cầu link mới.';
            if (err.response?.data) {
                errorMsg =
                    typeof err.response.data === 'string'
                        ? err.response.data
                        : err.response.data.message || errorMsg;
            }
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md text-center">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Thành công!</h2>
                <p className="text-gray-600 mb-6">
                    Mật khẩu của bạn đã được đặt lại an toàn. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.
                </p>
                <Link
                    href="/login"
                    className="inline-flex justify-center items-center w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                    Đăng nhập ngay
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">Tạo mật khẩu mới</h2>
            <p className="text-sm text-gray-600 text-center mb-8">
                Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
            </p>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md mb-6 text-sm text-center">
                    {error}
                </div>
            )}

            {!token && !error && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-md mb-6 text-sm text-center">
                    Không tìm thấy mã xác thực. Vui lòng kiểm tra lại đường dẫn từ email.
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mật khẩu mới
                    </label>
                    <input
                        type="password"
                        required
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={loading || !token}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Xác nhận mật khẩu mới
                    </label>
                    <input
                        type="password"
                        required
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading || !token}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !token || !newPassword || !confirmPassword}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-black hover:bg-gray-800 disabled:bg-gray-400 transition-all"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin w-5 h-5 mr-2" />
                            Đang xử lý...
                        </>
                    ) : (
                        'Xác nhận đổi mật khẩu'
                    )}
                </button>
            </form>
        </div>
    );
}

