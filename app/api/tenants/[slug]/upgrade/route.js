// app/api/tenants/[slug]/upgrade/route.js

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/tenants/:slug/upgrade
export async function POST(request, { params }) {
  try {
    // 1. Get user data from middleware
    const userPayload = JSON.parse(request.headers.get('X-User-Payload'));
    const { tenantId, role } = userPayload;
    const { slug } = params;

    // 2. Authorization: Only Admins can upgrade
    if (role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden: Only admins can upgrade.' }, { status: 403 });
    }

    // 3. Find the tenant by slug to verify ownership
    const tenant = await prisma.tenant.findUnique({
      where: { slug: slug },
    });
    
    // 4. Ensure the Admin belongs to the tenant they are trying to upgrade
    if (!tenant || tenant.id !== tenantId) {
        return NextResponse.json({ message: 'Forbidden: You can only upgrade your own tenant.' }, { status: 403 });
    }

    // 5. Perform the upgrade
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { plan: 'PRO' },
    });

    return NextResponse.json({ message: 'Tenant upgraded to PRO successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Error upgrading tenant:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}