#!/bin/bash

# مسیرهای پروژه
BACKEND_DIR=~/tarasheh/tarashebackend
FRONTEND_DIR=~/tarasheh/tarashefront

echo "===== حذف همه instanceهای قبلی ====="
pm2 delete all > /dev/null 2>&1

# =========================================
# راه‌اندازی Backend
# =========================================
if [ -d "$BACKEND_DIR" ]; then
    echo "===== راه‌اندازی Backend ====="
    cd $BACKEND_DIR
    echo "در حال نصب وابستگی‌ها..."
    npm install
    echo "در حال اجرای Build در صورت نیاز..."
    # اگر نیاز به build نداری می‌تونی خط بعدی رو حذف کنی
    # npm run build
    echo "اجرای Backend با PM2..."
    pm2 start server.js --name tarasheh-backend --node-args="--max-old-space-size=200"
else
    echo "مسیر Backend یافت نشد: $BACKEND_DIR"
fi

# =========================================
# راه‌اندازی Frontend
# =========================================
if [ -d "$FRONTEND_DIR" ]; then
    echo "===== راه‌اندازی Frontend ====="
    cd $FRONTEND_DIR
    echo "در حال نصب وابستگی‌ها..."
    npm install
    echo "ساخت پروژه Next.js..."
    npm run build
    echo "اجرای Frontend با PM2..."
    pm2 start npm --name tarashe-frontend -- start -p 3001
else
    echo "مسیر Frontend یافت نشد: $FRONTEND_DIR"
fi

# =========================================
# نمایش وضعیت PM2
# =========================================
pm2 list
