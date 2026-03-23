import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // [{ product, qty, unitPrice, total }]

      addItem: (product, qty = 1) => {
        const { items } = get()
        const existing = items.find((i) => i.product._id === product._id)
        if (existing) {
          set({
            items: items.map((i) =>
              i.product._id === product._id
                ? { ...i, qty: i.qty + qty, total: (i.qty + qty) * i.unitPrice }
                : i
            ),
          })
        } else {
          set({
            items: [
              ...items,
              { product, qty, unitPrice: product.price, total: product.price * qty },
            ],
          })
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.product._id !== productId) })
      },

      updateQty: (productId, qty) => {
        if (qty < 1) return
        set({
          items: get().items.map((i) =>
            i.product._id === productId
              ? { ...i, qty, total: qty * i.unitPrice }
              : i
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      // Derived values
      get count() {
        return get().items.reduce((sum, i) => sum + i.qty, 0)
      },
      get subtotal() {
        return get().items.reduce((sum, i) => sum + i.total, 0)
      },
    }),
    { name: 'portal-cart' }
  )
)

export default useCartStore
