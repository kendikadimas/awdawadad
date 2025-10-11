<?php 

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserMotif extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'name', 'file_path'];
}