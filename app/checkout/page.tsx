"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js"

import { CartProvider, useCart } from "@/components/cart/CartContext"
import colors from "@/components/colors"
import {
  ONLINE_CHECKOUT_ENABLED,
  calculateCartTotals,
  formatMoneyFromCents,
} from "@/lib/commerce"
import { i18n, localeFromShippingCountry } from "@/lib/i18n"
import { getStripeClient } from "@/lib/stripe-client"

type Quote = {
  service: "PAC" | "SEDEX"
  meServiceId: number
  priceCents: number
  deliveryDays: number
}

const inputStyle: React.CSSProperties = {
  background: colors.paper,
  border: `2px solid ${colors.ink}`,
  padding: "10px 12px",
  width: "100%",
  fontWeight: 600,
}

const sectionStyle: React.CSSProperties = {
  background: colors.paper,
  border: `2px solid ${colors.ink}`,
  boxShadow: `4px 4px 0 ${colors.ink}`,
  padding: 16,
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "")
}

export default function CheckoutPage() {
  // Online checkout is disabled for now. Block access but keep the code intact.
  if (!ONLINE_CHECKOUT_ENABLED) {
    return (
      <Notice
        message={i18n.pt.checkout.unavailable}
        backLabel={i18n.pt.checkout.backToShop}
      />
    )
  }

  return (
    <CartProvider initialShippingCountry="BR">
      <CheckoutContent />
    </CartProvider>
  )
}

function CheckoutContent() {
  const { items, shippingCountry } = useCart()
  const t = i18n[localeFromShippingCountry(shippingCountry)].checkout

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    district: "",
    city: "",
    state: "",
  })

  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState(false)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [quoteError, setQuoteError] = useState(false)
  const [selectedService, setSelectedService] = useState<"PAC" | "SEDEX" | "">("")
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cepDigits = digitsOnly(form.cep)
  const simpleItems = useMemo(
    () => items.map(({ product, qty }) => ({ productId: product.id, qty })),
    [items]
  )

  const subtotalCents = useMemo(
    () =>
      calculateCartTotals(
        items.map(({ product }) => product),
        simpleItems,
        shippingCountry
      ).subtotalCents,
    [items, simpleItems, shippingCountry]
  )

  const selectedQuote = quotes.find((q) => q.service === selectedService)
  const shippingCents = selectedQuote?.priceCents ?? 0
  const totalCents = subtotalCents + shippingCents

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    // Any change to address/items invalidates a created intent.
    if (clientSecret) {
      setClientSecret(null)
      setOrderId(null)
    }
  }

  // ViaCEP autofill.
  useEffect(() => {
    if (cepDigits.length !== 8) return
    let cancelled = false
    setCepLoading(true)
    setCepError(false)
    fetch(`https://viacep.com.br/ws/${cepDigits}/json/`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        if (data?.erro) {
          setCepError(true)
          return
        }
        setForm((prev) => ({
          ...prev,
          street: data.logradouro || prev.street,
          district: data.bairro || prev.district,
          city: data.localidade || prev.city,
          state: (data.uf || prev.state).toUpperCase(),
        }))
      })
      .catch(() => {
        if (!cancelled) setCepError(true)
      })
      .finally(() => {
        if (!cancelled) setCepLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [cepDigits])

  // Shipping quotes when CEP + items are valid.
  useEffect(() => {
    if (cepDigits.length !== 8 || simpleItems.length === 0) {
      setQuotes([])
      return
    }
    let cancelled = false
    setQuoteLoading(true)
    setQuoteError(false)
    fetch("/api/shipping/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postalCode: cepDigits, items: simpleItems }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        if (!data.ok) {
          setQuoteError(true)
          setQuotes([])
          return
        }
        setQuotes(data.quotes as Quote[])
      })
      .catch(() => {
        if (!cancelled) {
          setQuoteError(true)
          setQuotes([])
        }
      })
      .finally(() => {
        if (!cancelled) setQuoteLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [cepDigits, simpleItems])

  function detailsComplete() {
    return (
      form.name.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) &&
      cepDigits.length === 8 &&
      form.street.trim() &&
      form.number.trim() &&
      form.district.trim() &&
      form.city.trim() &&
      form.state.trim().length === 2
    )
  }

  async function startPayment() {
    setError(null)
    if (!detailsComplete()) {
      setError(t.missingFields)
      return
    }
    if (!selectedService) {
      setError(t.selectShipping)
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/checkout/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          cpf: form.cpf,
          service: selectedService,
          address: {
            cep: cepDigits,
            street: form.street,
            number: form.number,
            complement: form.complement,
            district: form.district,
            city: form.city,
            state: form.state,
          },
          items: simpleItems,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError(data.error || t.payError)
        return
      }
      setClientSecret(data.clientSecret)
      setOrderId(data.orderId)
    } catch {
      setError(t.payError)
    } finally {
      setSubmitting(false)
    }
  }

  if (shippingCountry !== "BR") {
    return (
      <Notice
        message={t.brOnly}
        backLabel={t.backToShop}
      />
    )
  }

  if (items.length === 0) {
    return <Notice message={t.emptyCart} backLabel={t.backToShop} />
  }

  return (
    <main
      className="mx-auto max-w-3xl px-6 py-12"
      style={{ background: colors.paper, color: colors.ink }}
    >
      <h1 className="text-3xl font-black">{t.title}</h1>

      <div className="mt-8 grid gap-6">
        {/* Your details */}
        <section style={sectionStyle}>
          <h2 className="text-lg font-black">{t.contactHeading}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label={t.fullName}>
              <input
                style={inputStyle}
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </Field>
            <Field label={t.email}>
              <input
                style={inputStyle}
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </Field>
            <Field label={t.phone}>
              <input
                style={inputStyle}
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </Field>
            <Field label={t.cpf}>
              <input
                style={inputStyle}
                value={form.cpf}
                onChange={(e) => update("cpf", e.target.value)}
              />
            </Field>
          </div>
        </section>

        {/* Shipping address */}
        <section style={sectionStyle}>
          <h2 className="text-lg font-black">{t.addressHeading}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label={t.cep}>
              <input
                style={inputStyle}
                value={form.cep}
                onChange={(e) => update("cep", e.target.value)}
                inputMode="numeric"
              />
              {cepLoading && (
                <span className="text-xs" style={{ color: colors.muted }}>
                  {t.cepLookup}
                </span>
              )}
              {cepError && (
                <span className="text-xs" style={{ color: colors.clay }}>
                  {t.cepError}
                </span>
              )}
            </Field>
            <Field label={t.street}>
              <input
                style={inputStyle}
                value={form.street}
                onChange={(e) => update("street", e.target.value)}
              />
            </Field>
            <Field label={t.number}>
              <input
                style={inputStyle}
                value={form.number}
                onChange={(e) => update("number", e.target.value)}
              />
            </Field>
            <Field label={t.complement}>
              <input
                style={inputStyle}
                value={form.complement}
                onChange={(e) => update("complement", e.target.value)}
              />
            </Field>
            <Field label={t.district}>
              <input
                style={inputStyle}
                value={form.district}
                onChange={(e) => update("district", e.target.value)}
              />
            </Field>
            <Field label={t.city}>
              <input
                style={inputStyle}
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
              />
            </Field>
            <Field label={t.state}>
              <input
                style={inputStyle}
                value={form.state}
                maxLength={2}
                onChange={(e) => update("state", e.target.value.toUpperCase())}
              />
            </Field>
          </div>
        </section>

        {/* Shipping method */}
        <section style={sectionStyle}>
          <h2 className="text-lg font-black">{t.shippingHeading}</h2>
          {cepDigits.length !== 8 ? (
            <p className="mt-3 text-sm" style={{ color: colors.muted }}>
              {t.shippingHint}
            </p>
          ) : quoteLoading ? (
            <p className="mt-3 text-sm" style={{ color: colors.muted }}>
              {t.calculating}
            </p>
          ) : quoteError ? (
            <p className="mt-3 text-sm" style={{ color: colors.clay }}>
              {t.quoteError}
            </p>
          ) : (
            <div className="mt-4 grid gap-3">
              {quotes.map((quote) => {
                const active = selectedService === quote.service
                return (
                  <button
                    key={quote.service}
                    type="button"
                    onClick={() => {
                      setSelectedService(quote.service)
                      if (clientSecret) {
                        setClientSecret(null)
                        setOrderId(null)
                      }
                    }}
                    className="flex items-center justify-between px-4 py-3 text-left"
                    style={{
                      background: active ? colors.sand : colors.paper,
                      border: `2px solid ${colors.ink}`,
                      boxShadow: active ? `3px 3px 0 ${colors.ink}` : "none",
                    }}
                  >
                    <span>
                      <span className="font-black">{quote.service}</span>
                      <span
                        className="ml-2 text-xs"
                        style={{ color: colors.muted }}
                      >
                        {t.days(quote.deliveryDays)}
                      </span>
                    </span>
                    <span className="font-black">
                      {formatMoneyFromCents(quote.priceCents, shippingCountry)}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </section>

        {/* Summary */}
        <section style={sectionStyle}>
          <h2 className="text-lg font-black">{t.summaryHeading}</h2>
          <div className="mt-4 grid gap-2 text-sm font-black">
            <Row label={t.subtotal}>
              {formatMoneyFromCents(subtotalCents, shippingCountry)}
            </Row>
            <Row label={t.shipping}>
              {formatMoneyFromCents(shippingCents, shippingCountry)}
            </Row>
            <div
              className="flex items-center justify-between pt-2 text-base"
              style={{ borderTop: `2px solid ${colors.ink}` }}
            >
              <span>{t.total}</span>
              <span>{formatMoneyFromCents(totalCents, shippingCountry)}</span>
            </div>
          </div>
        </section>

        {error && (
          <p className="text-sm font-black" style={{ color: colors.clay }}>
            {error}
          </p>
        )}

        {clientSecret ? (
          <Elements
            stripe={getStripeClient()}
            options={{ clientSecret, appearance: { theme: "flat" } }}
          >
            <PaymentSection
              orderId={orderId}
              payLabel={`${t.pay} ${formatMoneyFromCents(
                totalCents,
                shippingCountry
              )}`}
              payingLabel={t.paying}
              errorLabel={t.payError}
              securedLabel={t.secured}
            />
          </Elements>
        ) : (
          <button
            type="button"
            onClick={startPayment}
            disabled={submitting}
            className="w-full px-6 py-4 text-sm font-black uppercase tracking-widest"
            style={{
              background: colors.accent,
              color: colors.paper,
              border: `2px solid ${colors.ink}`,
              boxShadow: `4px 4px 0 ${colors.ink}`,
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? t.paying : t.pay}
          </button>
        )}

        <Link
          href="/shop"
          className="text-sm font-black underline"
          style={{ color: colors.muted }}
        >
          {t.backToShop}
        </Link>
      </div>
    </main>
  )
}

function PaymentSection({
  orderId,
  payLabel,
  payingLabel,
  errorLabel,
  securedLabel,
}: {
  orderId: string | null
  payLabel: string
  payingLabel: string
  errorLabel: string
  securedLabel: string
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)

  async function confirm() {
    if (!stripe || !elements) return
    setPaying(true)
    setPayError(null)

    const returnUrl = `${window.location.origin}/checkout/success${
      orderId ? `?order=${encodeURIComponent(orderId)}` : ""
    }`

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
    })

    if (error) {
      setPayError(error.message || errorLabel)
      setPaying(false)
    }
  }

  return (
    <div style={sectionStyle}>
      <PaymentElement />
      {payError && (
        <p className="mt-3 text-sm font-black" style={{ color: colors.clay }}>
          {payError}
        </p>
      )}
      <button
        type="button"
        onClick={confirm}
        disabled={paying || !stripe}
        className="mt-4 w-full px-6 py-4 text-sm font-black uppercase tracking-widest"
        style={{
          background: colors.accent,
          color: colors.paper,
          border: `2px solid ${colors.ink}`,
          boxShadow: `4px 4px 0 ${colors.ink}`,
          opacity: paying ? 0.7 : 1,
        }}
      >
        {paying ? payingLabel : payLabel}
      </button>
      <p className="mt-3 text-xs" style={{ color: colors.muted }}>
        {securedLabel}
      </p>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="grid gap-1">
      <span
        className="text-xs font-black uppercase tracking-widest"
        style={{ color: colors.muted }}
      >
        {label}
      </span>
      {children}
    </label>
  )
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ color: colors.muted }}>{label}</span>
      <span>{children}</span>
    </div>
  )
}

function Notice({
  message,
  backLabel,
}: {
  message: string
  backLabel: string
}) {
  return (
    <main
      className="mx-auto max-w-xl px-6 py-20 text-center"
      style={{ background: colors.paper, color: colors.ink }}
    >
      <p className="text-lg font-black">{message}</p>
      <Link
        href="/shop"
        className="mt-6 inline-block px-6 py-3 text-sm font-black uppercase tracking-widest"
        style={{
          background: colors.accent,
          color: colors.paper,
          border: `2px solid ${colors.ink}`,
          boxShadow: `4px 4px 0 ${colors.ink}`,
        }}
      >
        {backLabel}
      </Link>
    </main>
  )
}
