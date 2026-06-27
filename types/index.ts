export type Product = {
  id: string
  title: string
  price: number
  /** Optional fixed Brazil price (in reais). Falls back to the flat BR price when unset. */
  price_br?: number
  /** When true, the product is pinned to the top of the shop and highlighted. */
  featured?: boolean
  image: string
  description?: string
  max_qnt?: number
  tags?: string[]
  is_test_product?: boolean
}
