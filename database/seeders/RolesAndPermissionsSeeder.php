<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run()
    {
        // Clear cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
    
        // Create permissions
        $permissions = [
            'lookup_dns_records',
            'export_csv',
            'export_zone_file',
            'view_past_results',
            'manage_subscription',
            'access_all_subdomains'
        ];
    
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }
    
        // Create roles
        $roles = [
            'free' => ['lookup_dns_records', 'access_all_subdomains'], // Added access_all_subdomains
            'basic' => ['lookup_dns_records', 'view_past_results', 'access_all_subdomains', 'export_csv'],
            'pro' => ['lookup_dns_records', 'view_past_results', 'export_csv', 'export_zone_file', 'access_all_subdomains'],
            'admin' => Permission::all()->pluck('name')->toArray()
        ];
    
        foreach ($roles as $roleName => $rolePermissions) {
            $role = Role::firstOrCreate(['name' => $roleName]);
            $role->syncPermissions($rolePermissions);
        }
    }
}
