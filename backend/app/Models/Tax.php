<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tax extends Model
{
    use HasFactory;

    protected $table = 'taxes';

    protected $fillable = [
        'title', 'percentage', 'status', 'priority',
    ];

    protected $casts = [
        'percentage' => 'float',
        'priority' => 'integer',
    ];

    public function calculate(float $amount): float
    {
        return ($amount * $this->percentage) / 100;
    }
}
