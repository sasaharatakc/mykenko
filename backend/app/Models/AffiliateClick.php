<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class AffiliateClick extends Model
{
    protected $fillable = [
        'affiliate_program_id', 'ref_code', 'ip_address',
        'user_agent', 'landing_page', 'referrer',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(AffiliateProgram::class, 'affiliate_program_id');
    }

    public function conversion(): HasOne
    {
        return $this->hasOne(AffiliateConversion::class);
    }
}
