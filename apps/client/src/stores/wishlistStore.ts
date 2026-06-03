import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ProductType } from "@repo/types";
import api from "@/lib/api/client";
import { useAuthStore } from "@/stores/authStore";

const isAuthenticated = () => useAuthStore.getState().isAuthenticated;
import { toast } from "react-toastify";

interface WishlistState {
    items: ProductType[];
    hasHydrated: boolean;
    fetchWishlistFromServer: () => Promise<void>;
    toggleWishlist: (product: ProductType) => Promise<void>;
    isInWishlist: (productId: number) => boolean;
    clearWishlist: () => void;
}

const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],
            hasHydrated: false,

            // LẤY DỮ LIỆU TỪ DB: Chạy khi F5 web hoặc vừa Login xong
            fetchWishlistFromServer: async () => {
                if (!isAuthenticated()) return;

                try {
                    // Backend trả về Page<ProductResponse>, danh sách nằm trong mảng .content
                    const res = await api.get('/wishlists?page=0&size=50');
                    const dbItems = res.data?.content || (Array.isArray(res.data) ? res.data : []);
                    set({ items: dbItems });
                } catch (error) {
                    console.error("Lỗi đồng bộ Wishlist từ Server:", error);
                }
            },

            // TOGGLE VỚI OPTIMISTIC UI
            toggleWishlist: async (product) => {
                const currentItems = get().items;
                const isExisting = currentItems.some((item) => item.id === product.id);
                const loggedIn = isAuthenticated();

                // ⚡ 1. CẬP NHẬT GIAO DIỆN TỨC THÌ (Không cần đợi API)
                if (isExisting) {
                    set({ items: currentItems.filter((item) => item.id !== product.id) });
                } else {
                    set({ items: [...currentItems, product] });
                }

                // 🌍 2. GỌI API DƯỚI NỀN (Chỉ gọi khi đã đăng nhập)
                if (loggedIn) {
                    try {
                        await api.post(`/wishlists/${product.id}`);
                    } catch (error) {
                        // 🔙 3. ROLLBACK: Nếu API lỗi, trả lại trạng thái UI như cũ
                        set({ items: currentItems });
                        toast.error("Lỗi kết nối! Không thể cập nhật danh sách yêu thích.");
                    }
                } else {
                    // Khách chưa đăng nhập: Vẫn cho lưu ở LocalStorage, gợi ý đăng nhập để đồng bộ
                    toast.info("Đăng nhập để đồng bộ danh sách yêu thích trên mọi thiết bị nhé!", { autoClose: 2000 });
                }
            },

            isInWishlist: (productId) => {
                return get().items.some((item) => item.id === productId);
            },

            clearWishlist: () => set({ items: [] }),
        }),
        {
            name: "wishlist-storage",
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.hasHydrated = true;
                    // F5 trang -> Tự động kéo data từ Server về ghi đè lên LocalStorage
                    if (state.fetchWishlistFromServer) {
                        state.fetchWishlistFromServer();
                    }
                }
            },
        }
    )
);

export default useWishlistStore;