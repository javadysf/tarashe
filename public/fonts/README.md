# فونت‌های سایت

فونت‌های مخصوص سایت را در این پوشه قرار دهید.

## فرمت‌های پشتیبانی شده:
- .woff2 (بهترین گزینه)
- .woff
- .ttf
- .otf

## نحوه استفاده:
فونت‌ها را در فایل `globals.css` تعریف کنید:

```css
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/CustomFont.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
}
```