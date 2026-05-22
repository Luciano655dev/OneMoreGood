"use client"

import Image from "next/image"
import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { createPortal } from "react-dom"

import colors from "@/components/colors"
import { BRAZIL_UNIT_PRICE_CENTS } from "@/lib/commerce"

type ProductOption = {
  id: string
  title: string
  price: number
  image: string
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

function parseAmountToCents(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return 0

  const amount = Number(trimmed)
  if (!Number.isFinite(amount) || amount < 0) return 0
  return Math.round(amount * 100)
}

function formatMarketMoney(cents: number, market: "US" | "BR") {
  const currency = market === "BR" ? "BRL" : "USD"
  const locale = market === "BR" ? "pt-BR" : "en-US"

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(cents / 100)
}

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
  const [shippingAmount, setShippingAmount] = useState("0")
  const [manualSubtotalAmount, setManualSubtotalAmount] = useState("0.00")
  const [hasManualSubtotalOverride, setHasManualSubtotalOverride] = useState(false)
  const [rows, setRows] = useState<Row[]>([
    { id: 1, productId: "", qty: 1, unitPrice: "0.00" },
  ])
  const [pickerRowId, setPickerRowId] = useState<number | null>(null)
  const [pickerQuery, setPickerQuery] = useState("")
  const nextIdRef = useRef(2)
  const pickerSearchRef = useRef<HTMLInputElement | null>(null)
  const deferredPickerQuery = useDeferredValue(pickerQuery)

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

  useEffect(() => {
    const input = document.getElementById("manual-order-shipping")
    if (!(input instanceof HTMLInputElement)) return

    const syncShippingAmount = () => {
      setShippingAmount(input.value)
    }

    syncShippingAmount()
    input.addEventListener("input", syncShippingAmount)
    input.addEventListener("change", syncShippingAmount)
    return () => {
      input.removeEventListener("input", syncShippingAmount)
      input.removeEventListener("change", syncShippingAmount)
    }
  }, [])

  useEffect(() => {
    if (pickerRowId === null) return

    const timeoutId = window.setTimeout(() => {
      pickerSearchRef.current?.focus()
    }, 0)

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPickerRowId(null)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.clearTimeout(timeoutId)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [pickerRowId])

  function getDefaultUnitPrice(product: ProductOption) {
    return market === "BR"
      ? (BRAZIL_UNIT_PRICE_CENTS / 100).toFixed(2)
      : product.price.toFixed(2)
  }

  function getSelectedProduct(productId: string) {
    return products.find((product) => product.id === productId) ?? null
  }

  const pickerProducts = useMemo(() => {
    const normalizedQuery = deferredPickerQuery.trim().toLowerCase()
    if (!normalizedQuery) return products

    return products.filter((product) => {
      const title = product.title.toLowerCase()
      const id = product.id.toLowerCase()
      return title.includes(normalizedQuery) || id.includes(normalizedQuery)
    })
  }, [products, deferredPickerQuery])

  const calculatedSubtotalCents = useMemo(() => {
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

  const displayedSubtotalAmount = hasManualSubtotalOverride
    ? manualSubtotalAmount
    : (calculatedSubtotalCents / 100).toFixed(2)

  const subtotalCents = hasManualSubtotalOverride
    ? parseAmountToCents(manualSubtotalAmount)
    : calculatedSubtotalCents

  const totalCents = subtotalCents + shippingCents

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

  function chooseProduct(rowId: number, product: ProductOption) {
    updateRow(rowId, {
      productId: product.id,
      unitPrice: getDefaultUnitPrice(product),
    })
    setPickerRowId(null)
  }

  function resetSubtotalToCalculated() {
    setHasManualSubtotalOverride(false)
    setManualSubtotalAmount((calculatedSubtotalCents / 100).toFixed(2))
  }

  return (
    <div className="mt-3 grid gap-3">
      {rows.map((row, index) => {
        const selectedProduct = getSelectedProduct(row.productId)
        const stock =
          selectedProduct && market === "BR"
            ? selectedProduct.inventory_quantity_br
            : selectedProduct?.inventory_quantity_us
        const defaultPrice = selectedProduct
          ? market === "BR"
            ? (BRAZIL_UNIT_PRICE_CENTS / 100).toFixed(2)
            : selectedProduct.price.toFixed(2)
          : null

        return (
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

            <div className="grid gap-4 md:grid-cols-[84px_minmax(0,1fr)] md:items-start">
              <div
                className="relative aspect-square w-20 overflow-hidden"
                style={{
                  background: colors.sand,
                  border: selectedProduct
                    ? `2px solid ${colors.ink}`
                    : `2px dashed ${colors.ink}`,
                  boxShadow: selectedProduct
                    ? `2px 2px 0 ${colors.ink}`
                    : "none",
                }}
              >
                {selectedProduct ? (
                  <Image
                    src={selectedProduct.image}
                    alt={selectedProduct.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : null}
              </div>

              <div className="grid gap-3">
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1.8fr)_120px_160px]">
                  <div>
                    <Label>Sock</Label>
                    <input type="hidden" name="product_id" value={row.productId} />
                    <button
                      type="button"
                      onClick={() => {
                        setPickerQuery("")
                        setPickerRowId(row.id)
                      }}
                      className="mt-2 flex w-full items-center justify-between gap-3 px-3 py-3 text-left text-sm font-black outline-none"
                      style={{
                        background: colors.paper,
                        border: `2px solid ${colors.ink}`,
                      }}
                    >
                      <span className="min-w-0 truncate">
                        {selectedProduct ? selectedProduct.title : "Choose a sock"}
                      </span>
                      <span
                        className="shrink-0 text-[11px] uppercase tracking-widest"
                        style={{ color: colors.muted }}
                      >
                        Browse
                      </span>
                    </button>
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

                {selectedProduct ? (
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
                ) : (
                  <div
                    className="text-xs font-black uppercase tracking-widest"
                    style={{ color: colors.muted }}
                  >
                    Pick a sock to see the photo, stock, and default price for
                    this market.
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {typeof document !== "undefined" && pickerRowId !== null
        ? createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
          style={{ background: "rgba(21,21,21,0.42)" }}
          onClick={() => setPickerRowId(null)}
        >
          <div
            className="w-full max-w-xl p-4"
            style={{
              background: colors.paper,
              border: `2px solid ${colors.ink}`,
              boxShadow: `4px 4px 0 ${colors.ink}`,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-base font-black">Choose a sock</div>
                <div
                  className="mt-1 text-xs font-black uppercase tracking-widest"
                  style={{ color: colors.muted }}
                >
                  Search by name or ID
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPickerRowId(null)}
                className="px-3 py-2 text-[11px] font-black uppercase tracking-widest"
                style={{
                  background: colors.sand,
                  border: `2px solid ${colors.ink}`,
                  boxShadow: `2px 2px 0 ${colors.ink}`,
                }}
              >
                Close
              </button>
            </div>

            <input
              ref={pickerSearchRef}
              type="text"
              value={pickerQuery}
              onChange={(event) => setPickerQuery(event.target.value)}
              placeholder="Search socks..."
              className="mt-4 w-full px-3 py-3 text-sm font-black outline-none"
              style={{
                background: colors.sand,
                border: `2px solid ${colors.ink}`,
              }}
            />

            <div className="mt-4 max-h-[45vh] overflow-y-auto pr-1">
              {pickerProducts.length === 0 ? (
                <div
                  className="p-4 text-sm font-black"
                  style={{
                    background: colors.sand,
                    border: `2px dashed ${colors.ink}`,
                  }}
                >
                  No socks match this search.
                </div>
              ) : (
                <div className="grid gap-3">
                  {pickerProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => chooseProduct(pickerRowId, product)}
                      className="grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-3 p-3 text-left"
                      style={{
                        background: colors.sand,
                        border: `2px solid ${colors.ink}`,
                        boxShadow: `2px 2px 0 ${colors.ink}`,
                      }}
                    >
                      <div
                        className="relative aspect-square w-16 overflow-hidden"
                        style={{
                          background: colors.paper,
                          border: `2px solid ${colors.ink}`,
                        }}
                      >
                        <Image
                          src={product.image}
                          alt={product.title}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-black">{product.title}</div>
                        <div
                          className="mt-1 truncate text-[11px] font-black uppercase tracking-widest"
                          style={{ color: colors.muted }}
                        >
                          {product.id}
                        </div>
                      </div>
                      <div
                        className="text-right text-[11px] font-black uppercase tracking-widest"
                        style={{ color: colors.muted }}
                      >
                        <div>US {product.inventory_quantity_us}</div>
                        <div className="mt-1">BR {product.inventory_quantity_br}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )
        : null}

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
          <span style={{ color: colors.muted }}>Items subtotal</span>
          <span>{formatMarketMoney(calculatedSubtotalCents, market)}</span>
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3 text-sm font-black">
            <span style={{ color: colors.muted }}>Subtotal to save</span>
            {hasManualSubtotalOverride ? (
              <button
                type="button"
                onClick={resetSubtotalToCalculated}
                className="px-2 py-1 text-[11px] font-black uppercase tracking-widest"
                style={{
                  background: colors.paper,
                  border: `1.5px solid ${colors.ink}`,
                  boxShadow: `2px 2px 0 ${colors.ink}`,
                }}
              >
                Use items subtotal
              </button>
            ) : null}
          </div>
          <input
            name="subtotal_dollars"
            type="number"
            min="0"
            step="0.01"
            value={displayedSubtotalAmount}
            onChange={(event) => {
              const nextValue = event.target.value
              if (nextValue.trim() === "") {
                resetSubtotalToCalculated()
                return
              }

              setHasManualSubtotalOverride(true)
              setManualSubtotalAmount(nextValue)
            }}
            className="w-full px-3 py-3 text-sm font-black outline-none"
            style={{
              background: colors.paper,
              border: `2px solid ${colors.ink}`,
            }}
          />
          <div className="text-[11px]" style={{ color: colors.muted }}>
            Edit this directly if the saved subtotal should differ from the sum of
            the item rows.
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm font-black">
          <span style={{ color: colors.muted }}>Shipping</span>
          <span>{formatMarketMoney(shippingCents, market)}</span>
        </div>
        <div
          className="flex items-center justify-between gap-3 border-t pt-2 text-base font-black"
          style={{ borderColor: colors.ink }}
        >
          <span>Total</span>
          <span>{formatMarketMoney(totalCents, market)}</span>
        </div>
      </div>

      <p className="text-xs" style={{ color: colors.muted }}>
        Choose the sock, set the quantity, and confirm the final unit price for
        that sale.
      </p>
    </div>
  )
}
