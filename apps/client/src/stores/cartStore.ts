// File: stores/cartStore.ts
import { CartStoreActionsType, CartStoreStateType, CartItemType } from "@repo/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "@/lib/api/client";
import { useAuthStore } from "@/stores/authStore";

const isAuthenticated = () => useAuthStore.getState().isAuthenticated;

const useCartStore = create<CartStoreStateType & CartStoreActionsType>()(
  persist(
    (set, get) => ({
      cart: [],
      hasHydrated: false,

      // 1. LẤY GIỎ HÀNG TỪ SERVER (Chạy khi app khởi động và có token)
      // 1. LẤY GIỎ HÀNG TỪ SERVER (Chạy khi app khởi động và có token)
      fetchCartFromServer: async () => {
        try {
          // Bỏ qua nếu ko có token
          if (!isAuthenticated()) return;

          const res = await api.get('/cart');

          // 🚨 BẢO VỆ CHỐNG CRASH: Kiểm tra xem API trả về mảng trực tiếp hay nằm trong object 'items'
          // Nếu không có gì thì mặc định là mảng rỗng []
          const rawItems = res.data?.items || (Array.isArray(res.data) ? res.data : []);

          // Map dữ liệu an toàn với Optional Chaining (?.)
          const serverCart = rawItems.map((item: any) => ({
            productId: item?.variant?.product?.id || 0,
            variantId: item?.variant?.id || 0,
            name: item?.variant?.product?.name || "Sản phẩm không xác định",
            price: item?.variant?.price || 0,
            quantity: item?.quantity || 1,
            image: item?.variant?.product?.images?.find((img: any) => img.isMain)?.url
              || item?.variant?.product?.images?.[0]?.url
              || "/product-placeholder.png",
            attributes: item?.variant?.attributeValues?.reduce((acc: any, curr: any) => {
              if (curr?.attribute?.name) {
                acc[curr.attribute.name] = curr.value;
              }
              return acc;
            }, {}) || {}
          }));

          set({ cart: serverCart });
        } catch (error) {
          console.error("Failed to fetch cart from server:", error);
        }
      },

      addToCart: async (product: CartItemType) => {
        // Cập nhật Local State trước để UI mượt mà (Optimistic UI Update)
        const currentCart = get().cart;
        const existingIndex = currentCart.findIndex((p) => p.variantId === product.variantId);

        let updatedCart = [...currentCart];
        if (existingIndex !== -1) {
          updatedCart[existingIndex]!.quantity += product.quantity || 1;
        } else {
          updatedCart.push({ ...product, quantity: product.quantity || 1 });
        }

        set({ cart: updatedCart });

        // Gọi API nếu đã đăng nhập
        if (isAuthenticated()) {
          try {
            await api.post('/cart/items', {
              variantId: product.variantId,
              quantity: product.quantity || 1
            });
          } catch (error) {
            console.error("Lỗi khi thêm vào giỏ hàng server", error);
            // Rollback nếu API lỗi (Tùy chọn)
            set({ cart: currentCart });
          }
        }
      },

      updateQuantity: async (variantId: number, quantity: number) => {
        const currentCart = get().cart;
        set({
          cart: currentCart.map(item =>
            item.variantId === variantId ? { ...item, quantity } : item
          )
        });

        // Cập nhật lên Server
        if (isAuthenticated()) {
          try {
            await api.put('/cart/items', { variantId, quantity });
          } catch (error) {
            set({ cart: currentCart }); // Rollback
          }
        }
      },

      removeFromCart: async (variantId: number) => {
        const currentCart = get().cart;
        set({ cart: currentCart.filter((p) => p.variantId !== variantId) });

        // Xóa trên Server
        if (isAuthenticated()) {
          try {
            await api.delete(`/cart/items/${variantId}`);
          } catch (error) {
            set({ cart: currentCart }); // Rollback
          }
        }
      },

      clearCart: async () => {
        set({ cart: [] });
        if (isAuthenticated()) {
          try {
            await api.delete('/cart');
          } catch (error) {
            console.error("Lỗi xóa giỏ hàng server", error);
          }
        }
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasHydrated = true;
          // Sau khi hydrate từ localstorage xong, lấy data từ server đè lên
          if (state.fetchCartFromServer) {
            state.fetchCartFromServer();
          }
        }
      },
    }
  )
);

export default useCartStore;