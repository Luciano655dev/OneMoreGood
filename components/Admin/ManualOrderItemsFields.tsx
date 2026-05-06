"use client"

import { useEffect, useRef, useState } from "react"

import colors from "@/components/colors"
import { BRAZIL_UNIT_PRICE_CENTS } from "@/lib/commerce"

type ProductOption = {
  id: string
  title: string
  price: number
  inventory_quantity_us: number
  inventory_quantity_br: number
}

type Row = {
  id: number
  productId: string
  qty: number
  unitPrice: string
}

const MAX_ROWS = 25

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="text-[11px] font-black uppercase tracking-widest"
      style={{ color: colors.muted }}
    >
      {children}
    </label>
  )
}

export default function ManualOrderItemsFields({
  products,
}: {
  products: ProductOption[]
}) {
  const [market, setMarket] = useState<"US" | "BR">("US")
  const [rows, setRows] = useState<Row[]>([
    { id: 1, productId: "", qty: 1, unitPrice: "0.00" },
  ])
  const nextIdRef = useRef(2)

  useEffect(() => {
    const select = document.getElementById("manual-order-market")
    if (!(select instanceof HTMLSelectElement)) return

    const syncMarket = () => {
      setMarket(select.value === "BR" ? "BR" : "US")
    }

    syncMarket()
    select.addEventListener("change", syncMarket)
    return () => select.removeEventListener("change", syncMarket)
  }, [])

  function getDefaultUnitPrice(product: ProductOption) {
    return market === "BR"
      ? (BRAZIL_UNIT_PRICE_CENTS / 100).toFixed(2)
      : product.price.toFixed(2)
  }

  function getSelectedProduct(productId: string) {
    return products.find((product) => product.id === productId) ?? null
  }

  function addRow() {
    setRows((current) => {
      if (current.length >= MAX_ROWS) return current

      const next: Row = {
        id: nextIdRef.current,
        productId: "",
        qty: 0,
        unitPrice: "0.00",
      }
      nextIdRef.current += 1
      return [...current, next]
    })
  }

  function removeRow(id: number) {
    setRows((current) => {
      if (current.length <= 1) return current
      return current.filter((row) => row.id !== id)
    })
  }

  function updateRow(id: number, patch: Partial<Row>) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row))
    )
  }

  return (
    <div className="mt-3 grid gap-3">
      {rows.map((row, index) => (
        <div
          key={row.id}
          className="grid gap-3 p-4"
          style={{
            background: colors.paper,
            border: `2px solid ${colors.ink}`,
            boxShadow: `2px 2px 0 ${colors.ink}`,
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-black">Item {index + 1}</div>
            <button
              type="button"
              onClick={() => removeRow(row.id)}
              disabled={rows.length <= 1}
              className="px-3 py-2 text-[11px] font-black uppercase tracking-widest"
              style={{
                background: colors.sand,
                border: `2px solid ${colors.ink}`,
                boxShadow: `2px 2px 0 ${colors.ink}`,
                opacity: rows.length <= 1 ? 0.55 : 1,
              }}
              aria-label={`Remove product row ${index + 1}`}
            >
              Remove
            </button>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.8fr)_120px_160px]">
            <div>
              <Label>Sock</Label>
              <select
                name="product_id"
                value={row.productId}
                onChange={(event) => {
                  const nextProductId = event.target.value
                  const selectedProduct = getSelectedProduct(nextProductId)

                  updateRow(row.id, {
                    productId: nextProductId,
                    unitPrice: selectedProduct
                      ? getDefaultUnitPrice(selectedProduct)
                      : row.unitPrice,
                  })
                }}
                className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                style={{
                  background: colors.paper,
                  border: `2px solid ${colors.ink}`,
                }}
              >
                <option value="">Choose a sock</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Qty</Label>
              <input
                name="quantity"
                type="number"
                min="0"
                value={row.qty}
                onChange={(event) => {
                  const nextValue = Number(event.target.value)
                  updateRow(row.id, {
                    qty: Number.isFinite(nextValue) ? nextValue : 0,
                  })
                }}
                className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                style={{
                  background: colors.paper,
                  border: `2px solid ${colors.ink}`,
                }}
              />
            </div>

            <div>
              <Label>Unit price</Label>
              <input
                name="unit_price_dollars"
                type="number"
                min="0"
                step="0.01"
                value={row.unitPrice}
                onChange={(event) =>
                  updateRow(row.id, { unitPrice: event.target.value })
                }
                className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                style={{
                  background: colors.paper,
                  border: `2px solid ${colors.ink}`,
                }}
              />
            </div>
          </div>

          {(() => {
            const selectedProduct = getSelectedProduct(row.productId)
            if (!selectedProduct) {
              return (
                <div
                  className="text-xs font-black uppercase tracking-widest"
                  style={{ color: colors.muted }}
                >
                  Pick a sock to see current stock for this market.
                </div>
              )
            }

            const stock =
              market === "BR"
                ? selectedProduct.inventory_quantity_br
                : selectedProduct.inventory_quantity_us
            const defaultPrice =
              market === "BR"
                ? (BRAZIL_UNIT_PRICE_CENTS / 100).toFixed(2)
                : selectedProduct.price.toFixed(2)

            return (
              <div
                className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-widest"
                style={{ color: colors.muted }}
              >
                <span
                  className="px-2 py-1"
                  style={{
                    background: colors.sand,
                    border: `1.5px solid ${colors.ink}`,
                  }}
                >
                  {market} stock: {stock}
                </span>
                <span
                  className="px-2 py-1"
                  style={{
                    background: colors.sand,
                    border: `1.5px solid ${colors.ink}`,
                  }}
                >
                  Default price: {defaultPrice}
                </span>
              </div>
            )
          })()}
        </div>
      ))}

      <div className="mt-1 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={addRow}
          disabled={rows.length >= MAX_ROWS}
          className="px-4 py-3 text-xs font-black uppercase tracking-widest"
          style={{
            background: colors.paper,
            border: `2px solid ${colors.ink}`,
            boxShadow: `3px 3px 0 ${colors.ink}`,
            opacity: rows.length >= MAX_ROWS ? 0.55 : 1,
          }}
        >
          Add row
        </button>

        <span
          className="text-xs font-black uppercase tracking-widest"
          style={{ color: colors.muted }}
        >
          {rows.length}/{MAX_ROWS} rows
        </span>
      </div>

      <p className="text-xs" style={{ color: colors.muted }}>
        Choose the sock, set the quantity, and confirm the final unit price for
        that sale.
      </p>
    </div>
  )
}
