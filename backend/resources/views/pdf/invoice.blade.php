<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: "DejaVu Sans", sans-serif; font-size: 12px; color: #1f2937; line-height: 1.5; }
  .page { padding: 40px 48px; }

  /* Header */
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
  .logo { font-size: 24px; font-weight: 700; color: #0989FF; }
  .logo span { color: #6b7280; font-size: 13px; font-weight: 400; margin-left: 4px; }
  .invoice-title { text-align: right; }
  .invoice-title h1 { font-size: 20px; font-weight: 700; color: #111827; }
  .invoice-title .number { font-size: 13px; color: #6b7280; margin-top: 2px; }

  /* Divider */
  .divider { border-top: 2px solid #0989FF; margin-bottom: 24px; }

  /* Meta grid */
  .meta { display: flex; gap: 32px; margin-bottom: 28px; }
  .meta-block { flex: 1; }
  .meta-block h4 { font-size: 11px; text-transform: uppercase; letter-spacing: .05em; color: #9ca3af; margin-bottom: 6px; font-weight: 600; }
  .meta-block p { font-size: 12px; color: #374151; line-height: 1.6; }
  .meta-block .name { font-weight: 600; font-size: 13px; color: #111827; }

  /* Badge */
  .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
  .badge-paid { background: #d1fae5; color: #065f46; }
  .badge-pending { background: #fef3c7; color: #92400e; }

  /* Table */
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  thead tr { background: #f9fafb; }
  thead th { padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: #6b7280; font-weight: 600; border-bottom: 1px solid #e5e7eb; }
  thead th.right { text-align: right; }
  tbody tr { border-bottom: 1px solid #f3f4f6; }
  tbody tr:last-child { border-bottom: none; }
  tbody td { padding: 10px 12px; font-size: 12px; color: #374151; }
  tbody td.right { text-align: right; }
  tbody td.product { font-weight: 500; color: #111827; }

  /* Totals */
  .totals { width: 260px; margin-left: auto; }
  .totals-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 12px; color: #374151; }
  .totals-row.total { border-top: 1px solid #e5e7eb; margin-top: 6px; padding-top: 10px; font-size: 14px; font-weight: 700; color: #111827; }
  .totals-row .label { color: #6b7280; }
  .totals-row.total .label { color: #111827; }

  /* Footer */
  .footer { margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 16px; display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; }
</style>
</head>
<body>
<div class="page">
  <!-- Header -->
  <div class="header">
    <div>
      <div class="logo">Shofy <span>EC Platform</span></div>
    </div>
    <div class="invoice-title">
      <h1>請求書</h1>
      <div class="number">#{{ str_pad($order->id, 6, '0', STR_PAD_LEFT) }}</div>
      <div style="margin-top:6px">
        <span class="badge {{ $order->payment_status === 'paid' || $order->payment_status === 'completed' ? 'badge-paid' : 'badge-pending' }}">
          {{ $order->payment_status === 'paid' || $order->payment_status === 'completed' ? '支払済' : '未払い' }}
        </span>
      </div>
    </div>
  </div>

  <div class="divider"></div>

  <!-- Meta -->
  <div class="meta">
    <div class="meta-block">
      <h4>請求先</h4>
      @if($order->customer)
        <p class="name">{{ $order->customer->name }}</p>
        <p>{{ $order->customer->email }}</p>
        @if($order->customer->phone)<p>{{ $order->customer->phone }}</p>@endif
      @else
        <p class="name">—</p>
      @endif
    </div>

    <div class="meta-block">
      <h4>配送先</h4>
      @if($order->shippingAddress)
        <p class="name">{{ $order->shippingAddress->name }}</p>
        <p>{{ $order->shippingAddress->address }}</p>
        <p>{{ $order->shippingAddress->city }}{{ $order->shippingAddress->state ? ', '.$order->shippingAddress->state : '' }}</p>
        @if($order->shippingAddress->zip_code)<p>〒 {{ $order->shippingAddress->zip_code }}</p>@endif
      @else
        <p>—</p>
      @endif
    </div>

    <div class="meta-block" style="text-align:right">
      <h4>注文情報</h4>
      <p><strong>注文番号:</strong> {{ $order->code }}</p>
      <p><strong>注文日:</strong> {{ $order->created_at->format('Y/m/d') }}</p>
      <p><strong>支払方法:</strong> {{ $order->payment_method ?? '—' }}</p>
      <p><strong>ステータス:</strong> {{ $order->status }}</p>
    </div>
  </div>

  <!-- Items -->
  <table>
    <thead>
      <tr>
        <th style="width:45%">商品</th>
        <th class="right">単価</th>
        <th class="right">数量</th>
        <th class="right">小計</th>
      </tr>
    </thead>
    <tbody>
      @foreach($order->products as $item)
      <tr>
        <td class="product">{{ $item->product_name }}</td>
        <td class="right">¥{{ number_format($item->price) }}</td>
        <td class="right">{{ $item->qty }}</td>
        <td class="right">¥{{ number_format($item->sub_total) }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>

  <!-- Totals -->
  <div class="totals">
    <div class="totals-row">
      <span class="label">小計</span>
      <span>¥{{ number_format($order->sub_total) }}</span>
    </div>
    @if($order->shipping_amount)
    <div class="totals-row">
      <span class="label">送料</span>
      <span>¥{{ number_format($order->shipping_amount) }}</span>
    </div>
    @endif
    @if($order->tax_amount)
    <div class="totals-row">
      <span class="label">消費税</span>
      <span>¥{{ number_format($order->tax_amount) }}</span>
    </div>
    @endif
    @if($order->discount_amount)
    <div class="totals-row" style="color: #ef4444;">
      <span class="label" style="color: #ef4444;">割引</span>
      <span>-¥{{ number_format($order->discount_amount) }}</span>
    </div>
    @endif
    <div class="totals-row total">
      <span class="label">合計</span>
      <span>¥{{ number_format($order->total_amount) }}</span>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <span>Shofy EC Platform — {{ config('app.url') }}</span>
    <span>発行日: {{ now()->format('Y/m/d') }}</span>
  </div>
</div>
</body>
</html>
