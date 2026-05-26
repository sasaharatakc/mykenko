# /design-system — デザインシステム構築

## 用途
MYKENKOの一貫したUIを実現するデザインシステムを設計・構築する。

## デザインシステムの構成要素

### 1. デザイントークン
```css
/* カラー */
--color-primary-500: #3B82F6;
--color-primary-600: #2563EB;

/* スペーシング */
--spacing-1: 4px;
--spacing-2: 8px;

/* タイポグラフィ */
--font-size-sm: 14px;
--font-size-base: 16px;
```

### 2. 基本コンポーネント
- Button（Primary / Secondary / Ghost / Danger）
- Input（Text / Select / Checkbox / Radio）
- Card（商品カード / 情報カード）
- Badge / Tag
- Modal / Drawer
- Notification / Toast

### 3. コンポジットコンポーネント
- ProductCard
- CheckoutForm
- OrderSummary
- ReviewCard

## Tailwind CSS実装方針
```tsx
// コンポーネントクラスをcn()でまとめる
const buttonVariants = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600',
  secondary: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
}
```
