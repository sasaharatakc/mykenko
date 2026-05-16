<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderShipped extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Order $order,
        public ?string $trackingNumber = null,
        public ?string $carrier = null,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = config('shofy.frontend_url', env('FRONTEND_URL', 'http://localhost:3000'));
        $orderUrl    = "{$frontendUrl}/account/orders/{$this->order->code}";

        $mail = (new MailMessage)
            ->subject("出荷のお知らせ — #{$this->order->code}")
            ->greeting("{$notifiable->name} 様、")
            ->line("ご注文の商品を出荷いたしました！");

        if ($this->carrier) {
            $mail->line("**配送会社:** {$this->carrier}");
        }
        if ($this->trackingNumber) {
            $mail->line("**追跡番号:** {$this->trackingNumber}");
        }

        return $mail
            ->action('注文状況を確認', $orderUrl)
            ->line("商品のお届けまでしばらくお待ちください。")
            ->salutation("Shofy より");
    }
}
