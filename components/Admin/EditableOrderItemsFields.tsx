"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import colors from "@/components/colors"

type ProductOption = {
  id: string
  title: string
  inventory_quantity_us: number
  inventory_quantity_br: number
}

type InitialItem = {
  id: string
  product_id: string
  title: string
  quantity: number
  unit_price_cents: number
}

type Row = {
  key: number
  productId: string
  title: string
  qty: number
  unitPrice: string
}

const MAX_ROWS = 100

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

function parseAmountToCents(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return 0

  const amount = Number(trimmed)
  if (!Number.isFinite(amount) || amount < 0) return 0
  return Math.round(amount * 100)
}

function formatMoney(cents: number, market: "US" | "BR") {
  const currency = market === "BR" ? "BRL" : "USD"
  const locale = market === "BR" ? "pt-BR" : "en-US"

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(cents / 100)
}

export default function EditableOrderItemsFields({
  products,
  initialItems,
  initialMarket,
  initialShippingCents,
  initialPromoSavingsCents,
}: {
  products: ProductOption[]
  initialItems: InitialItem[]
  initialMarket: "US" | "BR"
  initialShippingCents: number
  initialPromoSavingsCents: number
}) {
  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products]
  )
  const [market, setMarket] = useState<"US" | "BR">(initialMarket)
  const [shippingAmount, setShippingAmount] = useState(
    (initialShippingCents / 100).toFixed(2)
  )
  const [promoAmount, setPromoAmount] = useState(
    (initialPromoSavingsCents / 100).toFixed(2)
  )
  const [rows, setRows] = useState<Row[]>(
    initialItems.length > 0
      ? initialItems.map((item, index) => ({
          key: index + 1,
          productId: item.product_id,
          title: item.title,
          qty: item.quantity,
          unitPrice: (item.unit_price_cents / 100).toFixed(2),
        }))
      : [{ key: 1, productId: "", title: "", qty: 1, unitPrice: "0.00" }]
  )
  const nextKeyRef = useRef(Math.max(initialItems.length + 1, 2))

  useEffect(() => {
    const marketSelect = document.getElementById("order-market")
    if (!(marketSelect instanceof HTMLSelectElement)) return

    const syncMarket = () => {
      setMarket(marketSelect.value === "BR" ? "BR" : "US")
    }

    syncMarket()
    marketSelect.addEventListener("change", syncMarket)
    return () => marketSelect.removeEventListener("change", syncMarket)
  }, [])

  useEffect(() => {
    const shippingInput = document.getElementById("order-shipping")
    if (!(shippingInput instanceof HTMLInputElement)) return

    const syncShipping = () => setShippingAmount(shippingInput.value)

    syncShipping()
    shippingInput.addEventListener("input", syncShipping)
    shippingInput.addEventListener("change", syncShipping)
    return () => {
      shippingInput.removeEventListener("input", syncShipping)
      shippingInput.removeEventListener("change", syncShipping)
    }
  }, [])

  useEffect(() => {
    const promoInput = document.getElementById("order-promo")
    if (!(promoInput instanceof HTMLInputElement)) return

    const syncPromo = () => setPromoAmount(promoInput.value)

    syncPromo()
    promoInput.addEventListener("input", syncPromo)
    promoInput.addEventListener("change", syncPromo)
    return () => {
      promoInput.removeEventListener("input", syncPromo)
      promoInput.removeEventListener("change", syncPromo)
    }
  }, [])

  const subtotalCents = useMemo(() => {
    return rows.reduce((sum, row) => {
      if (!row.productId || !Number.isInteger(row.qty) || row.qty <= 0) {
        return sum
      }

      return sum + row.qty * parseAmountToCents(row.unitPrice)
    }, 0)
  }, [rows])

  const shippingCents = useMemo(
    () => parseAmountToCents(shippingAmount),
    [shippingAmount]
  )
  const promoSavingsCents = useMemo(
    () => parseAmountToCents(promoAmount),
    [promoAmount]
  )
  const totalCents = Math.max(0, subtotalCents - promoSavingsCents) + shippingCents

  function updateRow(key: number, patch: Partial<Row>) {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row))
    )
  }

  function addRow() {
    setRows((current) => {
      if (current.length >= MAX_ROWS) return current

      const nextRow: Row = {
        key: nextKeyRef.current,
        productId: "",
        title: "",
        qty: 1,
        unitPrice: "0.00",
      }
      nextKeyRef.current += 1
      return [...current, nextRow]
    })
  }

  function removeRow(key: number) {
    setRows((current) => {
      if (current.length <= 1) return current
      return current.filter((row) => row.key !== key)
    })
  }

  return (
    <div className="grid gap-3">
      {rows.map((row, index) => {
        const matchedProduct = productMap.get(row.productId)
        const stock =
          market === "BR"
            ? matchedProduct?.inventory_quantity_br
            : matchedProduct?.inventory_quantity_us
        const lineTotalCents = Math.max(0, row.qty) * parseAmountToCents(row.unitPrice)

        return (
          <div
            key={row.key}
            className="grid gap-3 p-3"
            style={{
              background: colors.paper,
              border: `2px solid ${colors.ink}`,
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-black">Item {index + 1}</div>
              <button
                type="button"
                onClick={() => removeRow(row.key)}
                disabled={rows.length <= 1}
                className="px-3 py-2 text-[11px] font-black uppercase tracking-widest"
                style={{
                  background: colors.sand,
                  border: `2px solid ${colors.ink}`,
                  boxShadow: `2px 2px 0 ${colors.ink}`,
                  opacity: rows.length <= 1 ? 0.55 : 1,
                }}
              >
                Remove
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>Product ID</Label>
                <input
                  name="order_item_product_id"
                  value={row.productId}
                  onChange={(event) => updateRow(row.key, { productId: event.target.value })}
                  placeholder="sock-cactus"
                  className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                  style={{
                    background: colors.sand,
                    border: `2px solid ${colors.ink}`,
                  }}
                />
              </div>

              <div>
                <Label>Item title</Label>
                <input
                  name="order_item_title"
                  value={row.title}
                  onChange={(event) => updateRow(row.key, { title: event.target.value })}
                  placeholder="Cactus Socks"
                  className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                  style={{
                    background: colors.sand,
                    border: `2px solid ${colors.ink}`,
                  }}
                />
              </div>

              <div>
                <Label>Quantity</Label>
                <input
                  name="order_item_quantity"
                  type="number"
                  min="1"
                  step="1"
                  value={row.qty}
                  onChange={(event) => {
                    const nextValue = Number(event.target.value)
                    updateRow(row.key, {
                      qty: Number.isFinite(nextValue) ? nextValue : 0,
                    })
                  }}
                  className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                  style={{
                    background: colors.sand,
                    border: `2px solid ${colors.ink}`,
                  }}
                />
              </div>

              <div>
                <Label>Unit price</Label>
                <input
                  name="order_item_unit_price_dollars"
                  type="number"
                  min="0"
                  step="0.01"
                  value={row.unitPrice}
                  onChange={(event) => updateRow(row.key, { unitPrice: event.target.value })}
                  className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                  style={{
                    background: colors.sand,
                    border: `2px solid ${colors.ink}`,
                  }}
                />
              </div>
            </div>

            <div
              className="flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-widest"
              style={{ color: colors.muted }}
            >
              <span
                className="px-2 py-1"
                style={{
                  background: colors.sand,
                  border: `1.5px solid ${colors.ink}`,
                }}
              >
                Line total: {formatMoney(lineTotalCents, market)}
              </span>
              {matchedProduct ? (
                <span
                  className="px-2 py-1"
                  style={{
                    background: colors.sand,
                    border: `1.5px solid ${colors.ink}`,
                  }}
                >
                  {market} stock: {stock}
                </span>
              ) : (
                <span
                  className="px-2 py-1"
                  style={{
                    background: colors.sand,
                    border: `1.5px dashed ${colors.ink}`,
                  }}
                >
                  Custom or unmatched product id
                </span>
              )}
            </div>
          </div>
        )
      })}

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

      <div
        className="grid gap-2 p-4"
        style={{
          background: colors.sand,
          border: `2px solid ${colors.ink}`,
          boxShadow: `2px 2px 0 ${colors.ink}`,
        }}
      >
        <div className="flex items-center justify-between gap-3 text-sm font-black">
          <span style={{ color: colors.muted }}>Subtotal</span>
          <span>{formatMoney(subtotalCents, market)}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm font-black">
          <span style={{ color: colors.muted }}>Promo</span>
          <span>{formatMoney(promoSavingsCents, market)}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm font-black">
          <span style={{ color: colors.muted }}>Shipping</span>
          <span>{formatMoney(shippingCents, market)}</span>
        </div>
        <div
          className="flex items-center justify-between gap-3 border-t pt-2 text-base font-black"
          style={{ borderColor: colors.ink }}
        >
          <span>Total</span>
          <span>{formatMoney(totalCents, market)}</span>
        </div>
      </div>
    </div>
  )
}
