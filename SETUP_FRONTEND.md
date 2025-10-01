# راهنمای راهاندازی Frontend تراشه

## تغییرات اعمال شده

### 1. API Integration
- ایجاد `src/lib/api.ts` برای اتصال به بکند
- پیکربندی URL بکند در `.env.local`

### 2. Authentication
- ایجاد `src/store/authStore.ts` با Zustand
- صفحات ورود و ثبت نام در `src/app/auth/`
- بروزرسانی Navbar برای نمایش وضعیت کاربر

### 3. Products Integration
- بروزرسانی `ProductSlider` برای استفاده از API
- بروزرسانی صفحه محصولات برای دریافت از بکند

## راهاندازی

### 1. نصب Dependencies
```bash
cd d:/projects/tarashee/tarashe
npm install
```

### 2. تنظیم Environment Variables
فایل `.env.local` ایجاد شده با:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. اجرای پروژه
```bash
npm run dev
```

## ویژگی های جدید

### احراز هویت
- صفحه ورود: `/auth/login`
- صفحه ثبت نام: `/auth/register`
- مدیریت وضعیت کاربر در Navbar

### API Calls
- دریافت محصولات از بکند
- دریافت دسته بندی ها
- احراز هویت کاربران

### اطلاعات تست
- ادمین: admin@tarashe.com / admin123
- کاربر: user@test.com / user123

## نکات مهم

1. **Backend باید اجرا باشد**: مطمئن شوید بکند روی پورت 5000 اجرا میشود
2. **CORS**: بکند برای localhost:3000 پیکربندی شده
3. **SSR Safe**: کدها برای Next.js و SSR بهینه شدهاند

## مراحل بعدی

1. تکمیل صفحه جزئیات محصول
2. پیادهسازی سبد خرید
3. صفحه پروفایل کاربر
4. پنل ادمین