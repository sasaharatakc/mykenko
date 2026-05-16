<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SpecificationTable extends Model
{
    use HasFactory;

    protected $table = 'specification_tables';

    protected $fillable = ['name', 'status'];

    public function groups(): HasMany
    {
        return $this->hasMany(SpecificationGroup::class, 'specification_table_id');
    }
}
