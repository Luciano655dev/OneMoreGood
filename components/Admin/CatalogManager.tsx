"use client"

import Image from "next/image"
import { useDeferredValue, useId, useMemo, useState } from "react"

import FormSubmitButton from "@/components/Admin/FormSubmitButton"
import colors from "@/components/colors"
import RoughBorder from "@/components/Home/Objects/RoughBorder"
import type { StoredProduct } from "@/lib/products"
import {
  createCatalogProductAction,
  removeCatalogProductAction,
  updateCatalogProductAction,
} from "@/app/admin/catalog/actions"

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

function tagsToInputValue(tags?: string[]) {
  return Array.isArray(tags) ? tags.join(", ") : ""
}

function ImageDropzone({
  name,
  label,
  helper,
}: {
  name: string
  label: string
  helper: string
}) {
  const inputId = useId()
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState("")

  return (
    <div className="md:col-span-2 xl:col-span-3">
      <Label>{label}</Label>
      <label
        htmlFor={inputId}
        className="relative mt-2 block overflow-hidden p-6 text-center"
        style={{
          background: isDragging ? colors.paper : colors.sand,
          border: isDragging
            ? `2px solid ${colors.accent}`
            : `2px dashed ${colors.ink}`,
          boxShadow: isDragging ? `3px 3px 0 ${colors.ink}` : "none",
        }}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(event) => {
          event.preventDefault()
          if (!isDragging) setIsDragging(true)
        }}
        onDrop={() => setIsDragging(false)}
      >
        <input
          id={inputId}
          name={name}
          type="file"
          accept="image/*"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          onChange={(event) => {
            const nextFile = event.target.files?.[0]
            setFileName(nextFile?.name || "")
          }}
        />

        <div className="text-sm font-black">
          {fileName || "Choose an image or drag it here"}
        </div>
        <div className="mt-2 text-[11px] font-black uppercase tracking-widest">
          Click to browse
        </div>
        <div className="mt-2 text-xs" style={{ color: colors.muted }}>
          {helper}
        </div>
      </label>
    </div>
  )
}

export default function CatalogManager({
  products,
}: {
  products: StoredProduct[]
}) {
  const [query, setQuery] = useState("")
  const deferredQuery = useDeferredValue(query)

  const visibleProducts = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase()
    if (!normalizedQuery) return products

    return products.filter((product) => {
      const title = product.title.toLowerCase()
      const id = product.id.toLowerCase()
      return title.includes(normalizedQuery) || id.includes(normalizedQuery)
    })
  }, [products, deferredQuery])

  return (
    <div className="grid gap-6">
      <RoughBorder bg={colors.sand} label="Add item">
        <form
          action={createCatalogProductAction}
          encType="multipart/form-data"
          className="grid gap-4"
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <Label>Product ID</Label>
              <input
                name="id"
                placeholder="sock-cactus"
                className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                style={{
                  background: colors.paper,
                  border: `2px solid ${colors.ink}`,
                }}
              />
            </div>

            <div>
              <Label>Title</Label>
              <input
                name="title"
                placeholder="Cactus Socks"
                className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                style={{
                  background: colors.paper,
                  border: `2px solid ${colors.ink}`,
                }}
              />
            </div>

            <div>
              <Label>Price (USD)</Label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                defaultValue="8.00"
                className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                style={{
                  background: colors.paper,
                  border: `2px solid ${colors.ink}`,
                }}
              />
            </div>

            <div>
              <Label>Brazil price (R$) — optional</Label>
              <input
                name="price_br"
                type="number"
                min="0"
                step="0.01"
                placeholder="Default R$25"
                className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                style={{
                  background: colors.paper,
                  border: `2px solid ${colors.ink}`,
                }}
              />
            </div>

            <div>
              <Label>Sort order</Label>
              <input
                name="sort_order"
                type="number"
                min="0"
                step="1"
                defaultValue={products.length}
                className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                style={{
                  background: colors.paper,
                  border: `2px solid ${colors.ink}`,
                }}
              />
            </div>

            <div>
              <Label>U.S. stock</Label>
              <input
                name="inventory_quantity_us"
                type="number"
                min="0"
                step="1"
                defaultValue="20"
                className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                style={{
                  background: colors.paper,
                  border: `2px solid ${colors.ink}`,
                }}
              />
            </div>

            <div>
              <Label>Brazil stock</Label>
              <input
                name="inventory_quantity_br"
                type="number"
                min="0"
                step="1"
                defaultValue="20"
                className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                style={{
                  background: colors.paper,
                  border: `2px solid ${colors.ink}`,
                }}
              />
            </div>

            <div className="md:col-span-2 xl:col-span-1">
              <Label>Visibility</Label>
              <select
                name="is_active"
                defaultValue="1"
                className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                style={{
                  background: colors.paper,
                  border: `2px solid ${colors.ink}`,
                }}
              >
                <option value="1">Visible in shop</option>
                <option value="0">Hidden from shop</option>
              </select>
            </div>

            <div className="md:col-span-2 xl:col-span-1">
              <Label>Featured</Label>
              <select
                name="featured"
                defaultValue="0"
                className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                style={{
                  background: colors.paper,
                  border: `2px solid ${colors.ink}`,
                }}
              >
                <option value="0">Normal</option>
                <option value="1">Featured (top + highlight)</option>
              </select>
            </div>

            <div className="md:col-span-2 xl:col-span-3">
              <Label>Tags</Label>
              <input
                name="tags"
                placeholder="Fun, Cartoon, Sport"
                className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                style={{
                  background: colors.paper,
                  border: `2px solid ${colors.ink}`,
                }}
              />
            </div>

            <div className="md:col-span-2 xl:col-span-3">
              <Label>Description</Label>
              <textarea
                name="description"
                rows={3}
                placeholder="Short product description"
                className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                style={{
                  background: colors.paper,
                  border: `2px solid ${colors.ink}`,
                }}
              />
            </div>

            <ImageDropzone
              name="image_file"
              label="Product image"
              helper="PNG, JPG, WEBP, GIF, or SVG. This uploads to Supabase Storage."
            />
          </div>

          <FormSubmitButton
            idleLabel="Add item"
            pendingLabel="Saving..."
            className="px-4 py-3 text-xs font-black uppercase tracking-widest"
            style={{
              background: colors.accent,
              color: colors.paper,
              border: `2px solid ${colors.ink}`,
              boxShadow: `3px 3px 0 ${colors.ink}`,
            }}
          />
        </form>
      </RoughBorder>

      <RoughBorder bg={colors.paper} label="Edit items">
        {products.length === 0 ? (
          <div
            className="p-4 text-sm font-black"
            style={{
              background: colors.sand,
              border: `2px dashed ${colors.ink}`,
            }}
          >
            No products found. Use the form above to create the first item.
          </div>
        ) : (
          <>
            <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <div>
                <Label>Search item</Label>
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by name or ID"
                  className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                  style={{
                    background: colors.sand,
                    border: `2px solid ${colors.ink}`,
                  }}
                />
              </div>
              <div
                className="px-3 py-3 text-[11px] font-black uppercase tracking-widest"
                style={{
                  background: colors.sand,
                  border: `2px solid ${colors.ink}`,
                  boxShadow: `2px 2px 0 ${colors.ink}`,
                  color: colors.muted,
                }}
              >
                {visibleProducts.length} item
                {visibleProducts.length === 1 ? "" : "s"}
              </div>
            </div>

            <div className="grid gap-4">
              {visibleProducts.map((product) => (
                <div
                  key={product.id}
                  className="grid gap-4 p-4"
                  style={{
                    background: colors.sand,
                    border: `2px solid ${colors.ink}`,
                    boxShadow: `2px 2px 0 ${colors.ink}`,
                  }}
                >
                  <div className="grid gap-4 lg:grid-cols-[132px_minmax(0,1fr)_auto] lg:items-start">
                    <div
                      className="w-28 overflow-hidden sm:w-32 lg:w-full"
                      style={{
                        background: colors.paper,
                        border: `2px solid ${colors.ink}`,
                      }}
                    >
                      <div className="relative aspect-square w-full">
                        <Image
                          src={product.image}
                          alt={product.title}
                          fill
                          sizes="(max-width: 1024px) 128px, 132px"
                          className="object-cover"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="font-black">{product.title}</div>
                      <div className="mt-1 text-xs" style={{ color: colors.muted }}>
                        ID: {product.id}
                      </div>
                      <div className="mt-2 text-sm font-black">
                        {product.is_active === false ? "Hidden from shop" : "Visible in shop"}
                      </div>
                      <div className="mt-2 text-sm" style={{ color: colors.muted }}>
                        Current image source
                      </div>
                      <div className="mt-1 break-all text-xs" style={{ color: colors.muted }}>
                        {product.image}
                      </div>
                    </div>

                    <form action={removeCatalogProductAction}>
                      <input type="hidden" name="id" value={product.id} />
                      <FormSubmitButton
                        idleLabel="Remove item"
                        pendingLabel="Removing..."
                        className="px-4 py-3 text-xs font-black uppercase tracking-widest"
                        style={{
                          background: colors.clay,
                          color: colors.paper,
                          border: `2px solid ${colors.ink}`,
                          boxShadow: `2px 2px 0 ${colors.ink}`,
                        }}
                      />
                    </form>
                  </div>

                  <form
                    action={updateCatalogProductAction}
                    encType="multipart/form-data"
                    className="grid gap-4"
                  >
                    <input type="hidden" name="id" value={product.id} />

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <div>
                        <Label>Title</Label>
                        <input
                          name="title"
                          defaultValue={product.title}
                          className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                          style={{
                            background: colors.paper,
                            border: `2px solid ${colors.ink}`,
                          }}
                        />
                      </div>

                      <div>
                        <Label>Price (USD)</Label>
                        <input
                          name="price"
                          type="number"
                          min="0"
                          step="0.01"
                          defaultValue={product.price.toFixed(2)}
                          className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                          style={{
                            background: colors.paper,
                            border: `2px solid ${colors.ink}`,
                          }}
                        />
                      </div>

                      <div>
                        <Label>Brazil price (R$) — optional</Label>
                        <input
                          name="price_br"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Default R$25"
                          defaultValue={
                            product.price_br != null
                              ? product.price_br.toFixed(2)
                              : ""
                          }
                          className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                          style={{
                            background: colors.paper,
                            border: `2px solid ${colors.ink}`,
                          }}
                        />
                      </div>

                      <div>
                        <Label>Sort order</Label>
                        <input
                          name="sort_order"
                          type="number"
                          min="0"
                          step="1"
                          defaultValue={product.sort_order ?? 0}
                          className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                          style={{
                            background: colors.paper,
                            border: `2px solid ${colors.ink}`,
                          }}
                        />
                      </div>

                      <div>
                        <Label>U.S. stock</Label>
                        <input
                          name="inventory_quantity_us"
                          type="number"
                          min="0"
                          step="1"
                          defaultValue={product.inventory_quantity_us}
                          className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                          style={{
                            background: colors.paper,
                            border: `2px solid ${colors.ink}`,
                          }}
                        />
                      </div>

                      <div>
                        <Label>Brazil stock</Label>
                        <input
                          name="inventory_quantity_br"
                          type="number"
                          min="0"
                          step="1"
                          defaultValue={product.inventory_quantity_br}
                          className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                          style={{
                            background: colors.paper,
                            border: `2px solid ${colors.ink}`,
                          }}
                        />
                      </div>

                      <div>
                        <Label>Visibility</Label>
                        <select
                          name="is_active"
                          defaultValue={product.is_active === false ? "0" : "1"}
                          className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                          style={{
                            background: colors.paper,
                            border: `2px solid ${colors.ink}`,
                          }}
                        >
                          <option value="1">Visible in shop</option>
                          <option value="0">Hidden from shop</option>
                        </select>
                      </div>

                      <div>
                        <Label>Featured</Label>
                        <select
                          name="featured"
                          defaultValue={product.featured ? "1" : "0"}
                          className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                          style={{
                            background: colors.paper,
                            border: `2px solid ${colors.ink}`,
                          }}
                        >
                          <option value="0">Normal</option>
                          <option value="1">Featured (top + highlight)</option>
                        </select>
                      </div>

                      <div className="md:col-span-2 xl:col-span-3">
                        <Label>Tags</Label>
                        <input
                          name="tags"
                          defaultValue={tagsToInputValue(product.tags)}
                          className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                          style={{
                            background: colors.paper,
                            border: `2px solid ${colors.ink}`,
                          }}
                        />
                      </div>

                      <div className="md:col-span-2 xl:col-span-3">
                        <Label>Description</Label>
                        <textarea
                          name="description"
                          rows={3}
                          defaultValue={product.description || ""}
                          className="mt-2 w-full px-3 py-3 text-sm font-black outline-none"
                          style={{
                            background: colors.paper,
                            border: `2px solid ${colors.ink}`,
                          }}
                        />
                      </div>

                      <ImageDropzone
                        name="image_file"
                        label="Replace image"
                        helper="Leave empty to keep the current image, or drop a new file here."
                      />
                    </div>

                    <FormSubmitButton
                      idleLabel="Save item"
                      pendingLabel="Saving..."
                      className="px-4 py-3 text-xs font-black uppercase tracking-widest"
                      style={{
                        background: colors.accent,
                        color: colors.paper,
                        border: `2px solid ${colors.ink}`,
                        boxShadow: `3px 3px 0 ${colors.ink}`,
                      }}
                    />
                  </form>
                </div>
              ))}
            </div>
          </>
        )}
      </RoughBorder>
    </div>
  )
}
