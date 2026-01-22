// Database types - Generated from Supabase schema
// Run `npm run generate-types` to update these types

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          sku: string
          name: string
          description: string | null
          category_id: string
          base_price: number
          gold_price: number | null
          silver_price: number | null
          stock_quantity: number
          low_stock_threshold: number
          stock_status: 'in_stock' | 'low_stock' | 'out_of_stock'
          image_url: string | null
          is_featured: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sku: string
          name: string
          description?: string | null
          category_id: string
          base_price: number
          gold_price?: number | null
          silver_price?: number | null
          stock_quantity?: number
          low_stock_threshold?: number
          stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock'
          image_url?: string | null
          is_featured?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sku?: string
          name?: string
          description?: string | null
          category_id?: string
          base_price?: number
          gold_price?: number | null
          silver_price?: number | null
          stock_quantity?: number
          low_stock_threshold?: number
          stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock'
          image_url?: string | null
          is_featured?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      stores: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          address: string
          city: string
          province: string
          postal_code: string
          country: string
          store_type: 'retail' | 'restaurant' | 'wholesale' | 'online'
          tier: 'gold' | 'silver' | 'standard'
          status: 'active' | 'inactive' | 'pending' | 'suspended'
          tax_number: string | null
          website: string | null
          credit_limit: number
          credit_used: number
          payment_terms_days: number
          created_at: string
          updated_at: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          slug: string
          parent_id: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          store_id: string
          order_date: string
          status: 'pending' | 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
          subtotal: number
          tax_amount: number
          shipping_cost: number
          discount_amount: number
          total_amount: number
          notes: string | null
          tracking_number: string | null
          shipped_date: string | null
          delivered_date: string | null
          created_at: string
          updated_at: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          product_name: string
          product_sku: string
          product_unit: string
          quantity: number
          unit_price: number
          subtotal: number
          created_at: string
        }
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          order_id: string
          store_id: string
          subtotal: number
          tax_amount: number
          total_amount: number
          amount_paid: number
          amount_due: number
          status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled'
          issue_date: string
          due_date: string
          paid_date: string | null
          cancelled_date: string | null
          notes: string | null
          payment_method: string | null
          payment_reference: string | null
          created_at: string
          updated_at: string
        }
      }
      inventory_transactions: {
        Row: {
          id: string
          product_id: string
          transaction_type: 'restock' | 'sale' | 'adjustment' | 'return' | 'damage'
          quantity_change: number
          quantity_before: number
          quantity_after: number
          reference_type: 'order' | 'manual' | 'return' | 'adjustment'
          reference_id: string | null
          notes: string | null
          created_at: string
        }
      }
    }
  }
}
