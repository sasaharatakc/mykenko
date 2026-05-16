<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderConfirmed extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Order $order) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = config('shofy.frontend_url', env('FRONTEND_URL', 'http://localhost:3000'));
        $orderUrl    = "{$frontendUrl}/account/orders/{$this->order->code}";

        return (new MailMessage)
            ->subject("ご注文確認 — #{$this->order->code}")
            ->greeting("{$notifiable->name} 様、")
            ->line("この度はご注文いただき、誠にありがとうございます。")
            ->line("**注文番号:** #{$this->order->code}")
            ->line("**合計金額:** ¥" . number_format($this->order->total_amount))
            ->line("**支払方法:** " . ($this->order->payment_method ?? '—'))
            ->action('注文詳細を確認', $orderUrl)
            ->line("ご不明な点がございましたら、お気軽にお問い合わせください。")
            ->salutation("Shofy より");
    }
}
