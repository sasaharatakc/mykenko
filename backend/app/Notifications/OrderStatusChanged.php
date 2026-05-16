<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusChanged extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Order $order) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $trackUrl = config('shofy.frontend_url') . "/orders/track/{$this->order->code}/{$this->order->token}";
        $status = ucfirst(str_replace('_', ' ', $this->order->status));

        return (new MailMessage)
            ->subject("Order Update — #{$this->order->code}")
            ->greeting("Hello {$notifiable->name}!")
            ->line("Your order **#{$this->order->code}** has been updated.")
            ->line("New status: **{$status}**")
            ->action('Track Order', $trackUrl)
            ->line('Thank you for shopping with Shofy!');
    }
}
