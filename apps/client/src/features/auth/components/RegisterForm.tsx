'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store';

const OTP_LENGTH = 6;
const emptyOtpDigits = (): string[] => Array.from({ length: OTP_LENGTH }, () => '');

export default function RegisterForm() {
    const { login } = useAuthStore();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [otpDigits, setOtpDigits] = useState<string[]>(emptyOtpDigits);
    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [otpSent, setOtpSent] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!/^[\p{L}\s]+$/u.test(formData.name.trim())) {
            setError('Họ và tên chỉ được chứa chữ cái và khoảng trắng.');
            return;
        }

        if (formData.password.length < 8 || formData.password.length > 72) {
            setError('Mật khẩu phải có từ 8 đến 72 ký tự.');
            return;
        }
        if (!/[A-Z]/.test(formData.password)) {
            setError('Mật khẩu phải có ít nhất 1 chữ hoa.');
            return;
        }
        if (!/[a-z]/.test(formData.password)) {
            setError('Mật khẩu phải có ít nhất 1 chữ thường.');
            return;
        }
        if (!/\d/.test(formData.password)) {
            setError('Mật khẩu phải có ít nhất 1 chữ số.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp!');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(data.message || 'Đăng ký thất bại. Vui lòng thử lại.');
                return;
            }
            if (data.requiresOtp) {
                setOtpSent(true);
                setResendCountdown(60);
                setMessage(data.message || 'Mã OTP đã được gửi đến email của bạn. Vui lòng nhập mã để hoàn tất đăng ký.');
            } else {
                await login();
                router.push('/');
            }
        } catch {
            setError('Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        const otpCode = otpDigits.join('');
        if (otpCode.length !== OTP_LENGTH) {
            setError(`Vui lòng nhập đủ ${OTP_LENGTH} chữ số OTP.`);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, otpCode }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(data.message || 'Xác thực OTP thất bại. Vui lòng thử lại.');
                return;
            }
            await login();
            router.push('/');
        } catch (err: any) {
            const msg =
                typeof err.response?.data === 'string'
                    ? err.response.data
                    : err.response?.data?.message || 'Xác thực OTP thất bại. Vui lòng thử lại.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendCountdown > 0 || loading) return;
        setError('');
        setMessage('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(data.message || 'Không thể gửi lại OTP. Vui lòng thử lại.');
                return;
            }
            setResendCountdown(60);
            setOtpDigits(emptyOtpDigits());
            setMessage('Đã gửi lại OTP mới. Vui lòng kiểm tra email của bạn.');
        } catch {
            setError('Không thể gửi lại OTP. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!otpSent || resendCountdown <= 0) return;
        const timer = setInterval(() => {
            setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [otpSent, resendCountdown]);

    useEffect(() => {
        if (!otpSent) return;
        const t = setTimeout(() => otpInputRefs.current[0]?.focus(), 0);
        return () => clearTimeout(t);
    }, [otpSent]);

    const handleOtpChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '');
        if (raw.length === 0) {
            setOtpDigits((prev) => {
                const next = [...prev];
                next[index] = '';
                return next;
            });
            return;
        }
        if (raw.length === 1) {
            setOtpDigits((prev) => {
                const next = [...prev];
                next[index] = raw;
                return next;
            });
            if (index < OTP_LENGTH - 1) {
                otpInputRefs.current[index + 1]?.focus();
            }
            return;
        }
        const chars = raw.slice(0, OTP_LENGTH).split('');
        setOtpDigits((prev) => {
            const next = [...prev];
            for (let i = 0; i < chars.length && index + i < OTP_LENGTH; i++) {
                next[index + i] = chars[i] ?? '';
            }
            return next;
        });
        const lastFocus = Math.min(index + chars.length - 1, OTP_LENGTH - 1);
        otpInputRefs.current[lastFocus]?.focus();
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            e.preventDefault();
            setOtpDigits((prev) => {
                const next = [...prev];
                if (next[index]) {
                    next[index] = '';
                    return next;
                }
                if (index > 0) {
                    next[index - 1] = '';
                    requestAnimationFrame(() => otpInputRefs.current[index - 1]?.focus());
                }
                return next;
            });
            return;
        }
        if (e.key === 'ArrowLeft' && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
            e.preventDefault();
        }
        if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
            otpInputRefs.current[index + 1]?.focus();
            e.preventDefault();
        }
    };

    const handleOtpPaste = (startIndex: number, e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const maxLen = OTP_LENGTH - startIndex;
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, maxLen);
        if (!pasted) return;
        setOtpDigits((prev) => {
            const next = [...prev];
            for (let i = 0; i < pasted.length; i++) next[startIndex + i] = pasted[i] ?? '';
            return next;
        });
        const focusIdx = Math.min(startIndex + pasted.length - 1, OTP_LENGTH - 1);
        otpInputRefs.current[focusIdx]?.focus();
    };

    return (
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center mb-6">Đăng ký tài khoản</h2>

            {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
            {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{message}</div>}

            <form onSubmit={otpSent ? handleVerifyOtp : handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                    <input
                        type="text"
                        name="name"
                        required
                        className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-black focus:border-black"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={otpSent}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        name="email"
                        required
                        className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-black focus:border-black"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={otpSent}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                    <input
                        type="password"
                        name="password"
                        required
                        className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-black focus:border-black"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={otpSent}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nhập lại mật khẩu</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        required
                        className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-black focus:border-black"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={otpSent}
                    />
                </div>
                {otpSent && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mã OTP (6 chữ số)</label>
                        <div className="flex justify-center gap-2" role="group" aria-label="Nhập mã OTP 6 chữ số">
                            {otpDigits.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={(el) => {
                                        otpInputRefs.current[i] = el;
                                    }}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    autoComplete="one-time-code"
                                    maxLength={OTP_LENGTH}
                                    aria-label={`Chữ số OTP thứ ${i + 1}`}
                                    className="h-11 w-10 sm:w-11 rounded border border-gray-300 text-center text-lg font-semibold tabular-nums focus:border-black focus:ring-1 focus:ring-black outline-none"
                                    value={digit}
                                    onChange={(e) => handleOtpChange(i, e)}
                                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                    onPaste={(e) => handleOtpPaste(i, e)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition flex justify-center items-center"
                >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : otpSent ? 'Xác thực OTP' : 'Đăng ký'}
                </button>
                {otpSent && (
                    <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading || resendCountdown > 0}
                        className="w-full border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50 transition disabled:opacity-60"
                    >
                        {resendCountdown > 0 ? `Gửi lại OTP sau ${resendCountdown}s` : 'Gửi lại OTP'}
                    </button>
                )}
            </form>

            <p className="mt-4 text-center text-sm text-gray-600">
                Đã có tài khoản?{' '}
                <Link href="/login" className="text-blue-600 hover:underline">
                    Đăng nhập ngay
                </Link>
            </p>
        </div>
    );
}
