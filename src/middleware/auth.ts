---
import { defineMiddleware } from 'astro/middleware';
import { supabase } from '../lib/supabase';

export const onRequest = defineMiddleware(async ({ request, redirect }, next) => {
  const { pathname } = new URL(request.url);
  
  // التحقق من المصادقة للصفحات المحمية
  if (pathname.startsWith('/dashboard')) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return redirect('/login');
    }
  }

  return next();
});