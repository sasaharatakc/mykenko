<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GlobalOption extends Model
{
    use HasFactory;

    protected $table = 'global_options';

    protected $fillable = ['name', 'required', 'type', 'order', 'status'];

    protected $casts = [
        'required' => 'boolean',
        'order' => 'integer',
    ];

    public function values(): HasMany
    {
        return $this->hasMany(GlobalOptionValue::class, 'option_id');
    }
}
