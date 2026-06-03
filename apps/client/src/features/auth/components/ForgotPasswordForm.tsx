'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Loader2, ArrowLeft } from 'lucide-react';
import publicApi from '@/lib/api/publicClient';

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const res = await publicApi.post('/auth/forgot-password', { email });
            setMessage(
                res.data?.message ||
                    'Link khôi phục mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn!'
            );
            setEmail('');
        } catch (err: any) {
            console.error('Lỗi quên mật khẩu:', err);
            let errorMsg = 'Có lỗi xảy ra. Vui lòng thử lại sau.';
            if (err.response?.data) {
                if (typeof err.response.data === 'string') {
                    errorMsg = err.response.data;
                } else if (err.response.data.message) {
                    errorMsg = err.response.data.message;
                }
            }
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
            <Link
                href="/login"
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6"
            >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Quay lại đăng nhập
            </Link>

            <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">Quên Mật Khẩu?</h2>
            <p className="text-sm text-gray-600 text-center mb-8">
                Đừng lo lắng! Hãy nhập email của bạn và chúng tôi sẽ gửi link để đặt lại mật khẩu.
            </p>

            {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md mb-6 text-sm text-center">
                    {message}
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md mb-6 text-sm text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Địa chỉ Email đã đăng ký
                    </label>
                    <input
                        type="email"
                        required
                        placeholder="ví dụ: user@email.com"
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading || !!message}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !!message || !email.trim()}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 transition-all"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin w-5 h-5 mr-2" />
                            Đang gửi...
                        </>
                    ) : (
                        'Gửi link khôi phục'
                    )}
                </button>
            </form>
        </div>
    );
}

