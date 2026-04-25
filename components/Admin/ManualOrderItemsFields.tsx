"use client"

import { useRef, useState } from "react"

import colors from "@/components/colors"

type ProductOption = {
  id: string
  title: string
  price: number
  inventory_quantity: number
}

type Row = {
  id: number
  productId: string
  qty: number
  unitPrice: string
}

const MAX_ROWS = 25

export default function ManualOrderItemsFields({
  products,
}: {
  products: ProductOption[]
}) {
  const [rows, setRows] = useState<Row[]>([
    { id: 1, productId: "", qty: 1, unitPrice: "0.00" },
  ])
  const nextIdRef = useRef(2)

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
    <div className="mt-2 grid gap-2">
      {rows.map((row, index) => (
        <div
          key={row.id}
          className="grid gap-2 md:grid-cols-[minmax(0,1fr)_110px_140px_92px]"
        >
          <select
            name="product_id"
            value={row.productId}
            onChange={(event) => {
              const nextProductId = event.target.value
              const selectedProduct = products.find(
                (product) => product.id === nextProductId
              )

              updateRow(row.id, {
                productId: nextProductId,
                unitPrice: selectedProduct
                  ? selectedProduct.price.toFixed(2)
                  : row.unitPrice,
              })
            }}
            className="w-full px-3 py-3 text-sm font-black outline-none"
            style={{
              background: colors.paper,
              border: `2px solid ${colors.ink}`,
            }}
          >
            <option value="">No item</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.title} - price {product.price.toFixed(2)} (stock:{" "}
                {product.inventory_quantity})
              </option>
            ))}
          </select>

          <input
            name="quantity"
            type="number"
            min="0"
            value={row.qty}
            onChange={(event) => {
              const nextValue = Number(event.target.value)
              updateRow(row.id, { qty: Number.isFinite(nextValue) ? nextValue : 0 })
            }}
            className="w-full px-3 py-3 text-sm font-black outline-none"
            style={{
              background: colors.paper,
              border: `2px solid ${colors.ink}`,
            }}
          />

          <input
            name="unit_price_dollars"
            type="number"
            min="0"
            step="0.01"
            value={row.unitPrice}
            onChange={(event) =>
              updateRow(row.id, { unitPrice: event.target.value })
            }
            className="w-full px-3 py-3 text-sm font-black outline-none"
            style={{
              background: colors.paper,
              border: `2px solid ${colors.ink}`,
            }}
          />

          <button
            type="button"
            onClick={() => removeRow(row.id)}
            disabled={rows.length <= 1}
            className="w-full px-3 py-3 text-xs font-black uppercase tracking-widest"
            style={{
              background: colors.paper,
              border: `2px solid ${colors.ink}`,
              boxShadow: `2px 2px 0 ${colors.ink}`,
              opacity: rows.length <= 1 ? 0.55 : 1,
            }}
            aria-label={`Remove product row ${index + 1}`}
          >
            Remove
          </button>
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
        Set the exact unit price for each row. This is the final charged amount
        per item (you can apply custom discounts here).
      </p>
    </div>
  )
}
