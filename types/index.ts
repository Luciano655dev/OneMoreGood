export type Product = {
  id: string
  title: string
  price: number
  image: string
  description?: string
  max_qnt?: number
  tags?: string[]
  is_test_product?: boolean
}
