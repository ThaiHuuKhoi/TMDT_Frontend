"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Star, User, MessageSquare, ThumbsUp, ChevronDown, Loader2, LogIn } from "lucide-react";
import Link from "next/link";
import StarRating from "./StarRating";
import { toast } from "react-toastify";
import api from "@/lib/api/client";
import { useAuthStore } from "@/features/auth/store";
import { getPublicApiBaseUrl } from "@/lib/api/publicBaseUrl";

interface Review {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
    verifiedPurchase?: boolean;
}

function formatReviewCreatedAt(val: unknown): string {
    if (typeof val === 'string') return val;
    if (Array.isArray(val) && val.length >= 3) {
        const y = Number(val[0]);
        const m = Number(val[1]);
        const d = Number(val[2]);
        const h = Number(val[3] ?? 0);
        const mi = Number(val[4] ?? 0);
        const s = Number(val[5] ?? 0);
        if (!Number.isFinite(y)) return new Date().toISOString();
        return new Date(y, m - 1, d, h, mi, s).toISOString();
    }
    return new Date().toISOString();
}

function mapApiToReview(raw: unknown): Review | null {
    if (!raw || typeof raw !== 'object') return null;
    const r = raw as Record<string, unknown>;
    if (r.id == null || r.rating == null) return null;
    return {
        id: String(r.id),
        userName: typeof r.userName === 'string' ? r.userName : 'Khách hàng',
        rating: Number(r.rating),
        comment: typeof r.comment === 'string' ? r.comment : '',
        createdAt: formatReviewCreatedAt(r.createdAt),
        verifiedPurchase: r.verifiedPurchase === true,
    };
}

const Reviews = ({ productId }: { productId: string }) => {
    const { user } = useAuthStore();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    // Tính năng mới: Lọc & Phân trang
    const [filterRating, setFilterRating] = useState<number | null>(null);
    const [visibleCount, setVisibleCount] = useState(5);

    const loadReviews = useCallback(async () => {
        try {
            const res = await fetch(`${getPublicApiBaseUrl()}/reviews/${productId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setReviews(
                    data.map(mapApiToReview).filter((x): x is Review => x != null)
                );
            } else {
                setReviews([]);
            }
        } catch (err) {
            console.error(err);
            setReviews([]);
        }
    }, [productId]);

    useEffect(() => {
        loadReviews();
    }, [loadReviews]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error("Vui lòng đăng nhập để đánh giá!");
            return;
        }

        setLoading(true);
        try {
            await api.post("/reviews", {
                productId: Number(productId),
                rating,
                comment
            });

            await loadReviews();
            setComment("");
            setRating(5);
            toast.success("Cảm ơn bạn đã đánh giá!");
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { code?: string; message?: string } } };
            const code = axiosErr.response?.data?.code;
            const msg = axiosErr.response?.data?.message;
            if (code === "PURCHASE_REQUIRED") {
                toast.error(msg || "Chỉ khách đã mua sản phẩm mới được đánh giá.");
            } else {
                toast.error(msg || "Bạn đã đánh giá sản phẩm này rồi hoặc có lỗi xảy ra.");
            }
        } finally {
            setLoading(false);
        }
    };

    // --- Tính toán thống kê ---
    const averageRating = reviews.length
        ? (reviews.reduce((acc, cur) => acc + cur.rating, 0) / reviews.length).toFixed(1)
        : "0.0";

    const ratingCounts = useMemo(() => {
        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
            if (r.rating >= 1 && r.rating <= 5) {
                counts[r.rating as keyof typeof counts]++;
            }
        });
        return counts;
    }, [reviews]);

    // --- Logic Lọc & Hiển thị ---
    const filteredReviews = useMemo(() => {
        if (!filterRating) return reviews;
        return reviews.filter(r => r.rating === filterRating);
    }, [reviews, filterRating]);

    const displayedReviews = filteredReviews.slice(0, visibleCount);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 5);
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                    Khách hàng đánh giá
                    <span className="bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full text-sm font-medium">
                        {reviews.length}
                    </span>
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">

                {/* 📊 CỘT TRÁI: THỐNG KÊ & FORM */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Box Tổng điểm & Progress Bar */}
                    <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                        <div className="flex items-center gap-6 mb-6">
                            <div className="flex flex-col items-center">
                                <div className="text-5xl font-black text-amber-500 mb-1">{averageRating}</div>
                                <StarRating rating={Math.round(Number(averageRating))} />
                                <p className="text-zinc-500 text-xs mt-2">{reviews.length} đánh giá</p>
                            </div>

                            {/* Thanh thống kê chi tiết */}
                            <div className="flex-1 flex flex-col gap-1.5">
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const count = ratingCounts[star as keyof typeof ratingCounts];
                                    const percentage = reviews.length ? (count / reviews.length) * 100 : 0;

                                    return (
                                        <div key={star} className="flex items-center gap-2 text-xs">
                                            <span className="w-2 font-bold text-zinc-600">{star}</span>
                                            <Star size={10} className="text-zinc-400 fill-zinc-400" />
                                            <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-amber-400 rounded-full"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="w-4 text-right text-zinc-400">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Form Viết đánh giá */}
                    <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                        <h3 className="font-bold text-zinc-800 mb-4 text-sm uppercase tracking-wide">Viết đánh giá của bạn</h3>
                        {!user ? (
                            <div className="flex flex-col items-center gap-3 py-4 text-center">
                                <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center">
                                    <LogIn size={18} className="text-zinc-400" />
                                </div>
                                <p className="text-sm text-zinc-500">Đăng nhập để chia sẻ đánh giá của bạn</p>
                                <Link
                                    href="/login"
                                    className="px-5 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Đăng nhập ngay
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <div>
                                    <div className="flex justify-center gap-2 mb-2 p-2 bg-zinc-50 rounded-lg">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                size={32}
                                                className={`cursor-pointer transition-transform hover:scale-110 ${star <= rating ? "text-amber-400 fill-amber-400" : "text-zinc-200"}`}
                                                onClick={() => setRating(star)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <textarea
                                        className="w-full p-3 border border-zinc-300 rounded-lg outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none text-sm placeholder:text-zinc-400"
                                        placeholder="Sản phẩm có giống mô tả không? Chất lượng thế nào?"
                                        rows={3}
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    />
                                </div>

                                <button
                                    disabled={loading || !comment.trim()}
                                    className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors disabled:bg-zinc-300 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Đang gửi...
                                        </>
                                    ) : "Gửi đánh giá"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* 💬 CỘT PHẢI: DANH SÁCH REVIEW */}
                <div className="lg:col-span-8">
                    {reviews.length > 0 ? (
                        <div className="flex flex-col gap-6">

                            {/* Bộ lọc sao (Filter) */}
                            <div className="flex flex-wrap gap-2 pb-4 border-b border-zinc-100">
                                <button
                                    onClick={() => { setFilterRating(null); setVisibleCount(5); }}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${!filterRating ? "bg-red-50 text-red-600 border-red-200" : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"}`}
                                >
                                    Tất cả
                                </button>
                                {[5, 4, 3, 2, 1].map(star => (
                                    <button
                                        key={star}
                                        onClick={() => { setFilterRating(star); setVisibleCount(5); }}
                                        disabled={ratingCounts[star as keyof typeof ratingCounts] === 0}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium border flex items-center gap-1 transition-colors disabled:opacity-40 disabled:bg-zinc-50 disabled:cursor-not-allowed
                                            ${filterRating === star ? "bg-red-50 text-red-600 border-red-200" : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"}
                                        `}
                                    >
                                        {star} Sao ({ratingCounts[star as keyof typeof ratingCounts]})
                                    </button>
                                ))}
                            </div>

                            {/* Danh sách hiển thị */}
                            {displayedReviews.length > 0 ? (
                                <div className="flex flex-col gap-4">
                                    {displayedReviews.map((review) => (
                                        <div key={review.id} className="flex gap-4 pb-4 border-b border-zinc-100 last:border-0">
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center font-bold text-zinc-500 border border-zinc-200">
                                                    {review.userName?.charAt(0).toUpperCase() || <User size={18} />}
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-zinc-900 text-sm">{review.userName || "Khách hàng"}</h4>
                                                        {review.verifiedPurchase && (
                                                            <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
                                                                <ThumbsUp size={10} /> Đã mua hàng
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-zinc-400 mt-1 sm:mt-0">
                                                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1 mb-2">
                                                    <StarRating rating={review.rating} />
                                                </div>

                                                <p className="text-zinc-700 text-sm leading-relaxed">
                                                    {review.comment}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-zinc-500 text-sm">
                                    Không có đánh giá {filterRating} sao nào.
                                </div>
                            )}

                            {/* Nút Xem thêm */}
                            {visibleCount < filteredReviews.length && (
                                <div className="pt-4 flex justify-center">
                                    <button
                                        onClick={handleLoadMore}
                                        className="flex items-center gap-2 px-6 py-2 bg-white border border-zinc-200 text-zinc-600 font-medium rounded-full hover:bg-zinc-50 hover:text-red-600 transition-colors text-sm"
                                    >
                                        Xem thêm đánh giá <ChevronDown size={16} />
                                    </button>
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white rounded-xl border border-dashed border-zinc-300">
                            <MessageSquare size={40} className="text-zinc-200 mb-3" />
                            <h3 className="text-base font-bold text-zinc-700">Chưa có đánh giá nào</h3>
                            <p className="text-sm text-zinc-500 mt-1">Trở thành người đầu tiên đánh giá sản phẩm này!</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Reviews;