'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import AdminAccessorySelector from '@/components/AdminAccessorySelector';
import AttributeSelector from '@/components/AttributeSelector';

type AttributeType = 'text' | 'number' | 'select';

type ProductImage = {
  url: string;
  alt: string;
  public_id?: string;
  isUploading?: boolean;
};

type FormDataState = {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  discountPercent: string;
  category: string;
  brand: string;
  model: string;
  stock: string;
  attributes: Record<string, string>;
  images: ProductImage[];
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categoryAttributes, setCategoryAttributes] = useState<any[]>([]);

  const [parentCategoryId, setParentCategoryId] = useState<string>('');
  const [secondLevelCategoryId, setSecondLevelCategoryId] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);

  const [showNewAttribute, setShowNewAttribute] = useState(false);
  const [newAttribute, setNewAttribute] = useState<{
    name: string;
    type: AttributeType;
    options: string[];
  }>({
    name: '',
    type: 'text',
    options: [''],
  });

  const [formData, setFormData] = useState<FormDataState>({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    discountPercent: '',
    category: '',
    brand: '',
    model: '',
    stock: '',
    attributes: {},
    images: [],
  });

  const fetchCategoryAttributes = useCallback(async (categoryId: string) => {
    try {
      const response = await api.getCategoryAttributes(categoryId);
      const attributes = response.map((ca: any) => ca.attribute).filter(Boolean);
      setCategoryAttributes(attributes);
    } catch (error) {
      console.error('Error fetching category attributes:', error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [productData, categoriesData, brandsData] = await Promise.all([
        api.getProduct(productId),
        api.getCategories(),
        api.getBrands(),
      ]);

      setCategories(categoriesData);
      setBrands(brandsData);

      const categoryId =
        typeof productData.category === 'object' ? productData.category._id : productData.category;
      const brandId = typeof productData.brand === 'object' ? productData.brand._id : productData.brand;

      // calculate discount percent from existing data if available
      let discountPercent = '';
      if (productData.originalPrice && productData.price) {
        const original = parseFloat(productData.originalPrice.toString());
        const current = parseFloat(productData.price.toString());
        if (original > 0 && original > current) {
          const discount = ((original - current) / original) * 100;
          discountPercent = discount.toFixed(0);
        }
      }

      setFormData({
        name: productData.name || '',
        description: productData.description || '',
        price: productData.price?.toString() || '',
        originalPrice:
          productData.originalPrice?.toString() || productData.price?.toString() || '',
        discountPercent,
        category: categoryId || '',
        brand: brandId || '',
        model: productData.model || '',
        stock: productData.stock?.toString() || '',
        attributes: productData.attributes || {},
        images: productData.images || [],
      });

      // map current category into parent / second / third level
      if (categoryId && categoriesData && categoriesData.length > 0) {
        const currentCat = categoriesData.find((c: any) => c._id === categoryId);
        if (currentCat) {
          if (!currentCat.parent) {
            // level 1
            setParentCategoryId(currentCat._id);
            setSecondLevelCategoryId('');
            setFormData((prev) => ({ ...prev, category: '' }));
          } else {
            const parent = categoriesData.find(
              (c: any) => String(c._id) === String(currentCat.parent),
            );
            if (parent) {
              if (!parent.parent) {
                // level 2
                setParentCategoryId(parent._id);
                setSecondLevelCategoryId(currentCat._id);
                setFormData((prev) => ({ ...prev, category: '' }));
              } else {
                // level 3
                const grandParent = categoriesData.find(
                  (c: any) => String(c._id) === String(parent.parent),
                );
                if (grandParent) {
                  setParentCategoryId(grandParent._id);
                  setSecondLevelCategoryId(parent._id);
                  setFormData((prev) => ({ ...prev, category: currentCat._id }));
                } else {
                  setParentCategoryId(parent._id);
                  setSecondLevelCategoryId(currentCat._id);
                  setFormData((prev) => ({ ...prev, category: '' }));
                }
              }
            } else {
              setParentCategoryId(currentCat._id);
              setSecondLevelCategoryId('');
              setFormData((prev) => ({ ...prev, category: '' }));
            }
          }
        }
      }

      if (categoryId) {
        await fetchCategoryAttributes(categoryId);
      }

      if (productData.accessories && productData.accessories.length > 0) {
        const accessoryIds = productData.accessories.map((acc: any) =>
          typeof acc.accessory === 'object' ? acc.accessory._id : acc.accessory,
        );
        setSelectedAccessories(accessoryIds);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading edit product data:', error);
      toast.error('خطا در بارگذاری اطلاعات محصول');
      setLoading(false);
    }
  }, [fetchCategoryAttributes, productId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const categoryIdForAttributes =
      formData.category || secondLevelCategoryId || parentCategoryId;
    if (categoryIdForAttributes) {
      fetchCategoryAttributes(categoryIdForAttributes);
    } else {
      setCategoryAttributes([]);
    }
  }, [fetchCategoryAttributes, formData.category, secondLevelCategoryId, parentCategoryId]);

  // recalc price from originalPrice + discountPercent
  useEffect(() => {
    const originalPrice = parseFloat(formData.originalPrice) || 0;
    const discountPercent = parseFloat(formData.discountPercent) || 0;

    if (originalPrice > 0 && discountPercent >= 0) {
      const discountAmount = originalPrice * (discountPercent / 100);
      const finalPrice = originalPrice - discountAmount;
      setFormData((prev) => ({
        ...prev,
        price: finalPrice > 0 ? finalPrice.toFixed(0) : '',
      }));
    }
  }, [formData.originalPrice, formData.discountPercent]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024;

      if (!isValidType) {
        toast.error(`فایل ${file.name} نوع مجاز نیست`);
        return false;
      }
      if (!isValidSize) {
        toast.error(`فایل ${file.name} بیش از 5MB است`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const previews: ProductImage[] = validFiles.map((file) => ({
      url: URL.createObjectURL(file),
      alt: file.name,
      isUploading: true,
    }));

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...previews],
    }));

    setUploadingImages(true);

    try {
      const response = await api.uploadProductImages(validFiles, formData.name || 'محصول');

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images.filter((img) => !img.isUploading), ...response.images],
      }));

      previews.forEach((preview) => {
        if (preview.url.startsWith('blob:')) {
          URL.revokeObjectURL(preview.url);
        }
      });

      toast.success(`✅ ${validFiles.length} تصویر با موفقیت آپلود شد!`);
      
      // Show warnings if any files were saved locally or failed
      if (response.warning) {
        setTimeout(() => {
          toast.warning(`⚠️ ${response.warning}`, {
            position: 'top-right',
            autoClose: 8000,
          });
        }, 500);
      }
      
      if (response.warnings && Array.isArray(response.warnings) && response.warnings.length > 0) {
        response.warnings.forEach((warning: string) => {
          setTimeout(() => {
            toast.warning(`⚠️ ${warning}`, {
              position: 'top-right',
              autoClose: 6000,
            });
          }, 1000);
        });
      }
    } catch (error: any) {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((img) => !img.isUploading),
      }));

      previews.forEach((preview) => {
        if (preview.url.startsWith('blob:')) {
          URL.revokeObjectURL(preview.url);
        }
      });

      toast.error('❌ ' + (error.message || 'خطا در آپلود تصاویر'));
    } finally {
      setUploadingImages(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = formData.images[index];
    if (imageToRemove?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.url);
    }
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    toast.info('🗑️ تصویر حذف شد');
  };

  const handleCreateAttribute = async () => {
    if (!newAttribute.name.trim()) {
      toast.error('نام ویژگی الزامی است');
      return;
    }

    try {
      const attributeData = {
        ...newAttribute,
        options:
          newAttribute.type === 'select'
            ? newAttribute.options.filter((opt) => opt.trim())
            : undefined,
      };

      const response = await api.createAttribute(attributeData);
      setNewAttribute({ name: '', type: 'text', options: [''] });
      setShowNewAttribute(false);

      const categoryIdForAttributes =
        formData.category || secondLevelCategoryId || parentCategoryId;
      if (categoryIdForAttributes) {
        try {
          await api.assignAttributeToCategory(categoryIdForAttributes, response.attribute._id);
          fetchCategoryAttributes(categoryIdForAttributes);
          toast.success('✅ ویژگی جدید ایجاد و به دسته اضافه شد!');
        } catch {
          toast.success('✅ ویژگی جدید ایجاد شد!');
        }
      } else {
        toast.success('✅ ویژگی جدید ایجاد شد!');
      }
    } catch (error: any) {
      toast.error('❌ ' + (error.message || 'خطا در ایجاد ویژگی'));
    }
  };

  const addAttributeOption = () => {
    setNewAttribute((prev) => ({
      ...prev,
      options: [...prev.options, ''],
    }));
  };

  const updateAttributeOption = (index: number, value: string) => {
    setNewAttribute((prev) => {
      const next = [...prev.options];
      next[index] = value;
      return { ...prev, options: next };
    });
  };

  const removeAttributeOption = (index: number) => {
    setNewAttribute((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const finalCategory = formData.category || secondLevelCategoryId || parentCategoryId;
      if (!finalCategory) {
        toast.error('❌ لطفاً دسته‌بندی محصول را انتخاب کنید');
        return;
      }

      const filteredAttributes = Object.fromEntries(
        Object.entries(formData.attributes).filter(([_, value]) => value && value.trim()),
      );

      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price || formData.originalPrice);
      if (formData.originalPrice) submitData.append('originalPrice', formData.originalPrice);
      submitData.append('brand', formData.brand);
      submitData.append('category', finalCategory);
      submitData.append('stock', formData.stock);
      if (formData.model) submitData.append('model', formData.model);
      submitData.append('existingImages', JSON.stringify(formData.images));

      if (Object.keys(filteredAttributes).length > 0) {
        const attributesArray = Object.entries(filteredAttributes).map(([attribute, value]) => ({
          attribute,
          value,
        }));
        submitData.append('attributes', JSON.stringify(attributesArray));
      }

      if (selectedAccessories.length > 0) {
        submitData.append('accessories', JSON.stringify(selectedAccessories));
      }

      await api.updateProduct(productId, submitData);
      toast.success('🎉 محصول با موفقیت به‌روزرسانی شد!');
      router.push('/admin/products');
    } catch (error: any) {
      console.error('Update product error:', error);
      toast.error('❌ ' + (error.message || 'خطا در به‌روزرسانی محصول'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-black">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 dark:border-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
            ویرایش محصول
          </h1>
          <p className="text-gray-600 dark:text-gray-400">اطلاعات محصول را به‌روزرسانی کنید</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8 space-y-8"
        >
          {/* Basic Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800/50">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4">اطلاعات پایه</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  نام محصول *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white/70 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100"
                  placeholder="نام محصول را وارد کنید"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  توضیحات *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white/70 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 resize-none"
                  placeholder="توضیحات کامل محصول را بنویسید"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-100 dark:border-green-800/50">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4">قیمت‌گذاری</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  قیمت اصلی (تومان) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 bg-white/70 dark:bg-gray-700/50 pl-16 text-gray-900 dark:text-gray-100"
                    placeholder="0"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                    تومان
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  درصد تخفیف (اختیاری)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 bg-white/70 dark:bg-gray-700/50 pr-12 text-gray-900 dark:text-gray-100"
                    placeholder="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                    %
                  </span>
                </div>
                {formData.discountPercent && parseFloat(formData.discountPercent) > 0 && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    تخفیف:{' '}
                    {(
                      ((parseFloat(formData.originalPrice) || 0) *
                        (parseFloat(formData.discountPercent) || 0)) /
                      100
                    ).toLocaleString('fa-IR')}{' '}
                    تومان
                  </p>
                )}
              </div>
            </div>
            {formData.price && parseFloat(formData.price) > 0 && (
              <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border-2 border-green-300 dark:border-green-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-green-800 dark:text-green-300">
                    قیمت فروش نهایی:
                  </span>
                  <span className="text-lg font-bold text-green-700 dark:text-green-400">
                    {parseFloat(formData.price).toLocaleString('fa-IR')} تومان
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Category & Details */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-100 dark:border-purple-800/50">
            <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-4">
              دسته‌بندی و جزئیات
            </h3>

            {/* Parent Category */}
            <div className="rounded-xl p-4 bg-white/70 dark:bg-gray-700/50 border border-purple-100 dark:border-purple-800/50 mb-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                دسته‌بندی اصلی *
              </label>
              <select
                required
                value={parentCategoryId}
                onChange={(e) => {
                  const value = e.target.value;
                  setParentCategoryId(value);
                  setSecondLevelCategoryId('');
                  setFormData((prev) => ({ ...prev, category: '' }));
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">انتخاب دسته اصلی</option>
                {categories
                  .filter((c) => !c.parent)
                  .map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Second level */}
            {parentCategoryId && (
              <div className="rounded-xl p-4 bg-white/70 dark:bg-gray-700/50 border border-purple-100 dark:border-purple-800/50 mb-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  زیر‌دسته *
                </label>
                <select
                  required
                  value={secondLevelCategoryId}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSecondLevelCategoryId(value);
                    setFormData((prev) => ({ ...prev, category: '' }));
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">انتخاب زیر‌دسته</option>
                  {categories
                    .filter((c) => !!c.parent && String(c.parent) === String(parentCategoryId))
                    .map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Third level */}
            {secondLevelCategoryId && (
              <div className="rounded-xl p-4 bg-white/70 dark:bg-gray-700/50 border border-purple-100 dark:border-purple-800/50 mb-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  زیر‌دستهٔ سطح سوم (اختیاری)
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">انتخاب زیر‌دستهٔ سطح سوم</option>
                  {categories
                    .filter((c) => !!c.parent && String(c.parent) === String(secondLevelCategoryId))
                    .map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Attributes */}
            {(formData.category || parentCategoryId || secondLevelCategoryId) && (
              <div className="mt-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-700/50">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-bold text-purple-800 dark:text-purple-300">
                    ویژگی‌های محصول
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowNewAttribute(!showNewAttribute)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 font-medium transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    ویژگی جدید
                  </button>
                </div>

                {/* Select existing */}
                <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-blue-300 dark:border-blue-700/50">
                  <h5 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-4">
                    افزودن ویژگی موجود
                  </h5>
                  <AttributeSelector
                    categoryId={formData.category || secondLevelCategoryId || parentCategoryId}
                    onAttributeAdd={() => {
                      const categoryIdForAttributes =
                        formData.category || secondLevelCategoryId || parentCategoryId;
                      if (categoryIdForAttributes) {
                        fetchCategoryAttributes(categoryIdForAttributes);
                      }
                      toast.success('ویژگی به دسته اضافه شد');
                    }}
                  />
                </div>

                {/* Create new attribute */}
                {showNewAttribute && (
                  <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-purple-300 dark:border-purple-700/50">
                    <h5 className="text-lg font-bold text-purple-800 dark:text-purple-300 mb-4">
                      ایجاد ویژگی جدید برای{' '}
                      {categories.find(
                        (c) =>
                          c._id === (formData.category || secondLevelCategoryId || parentCategoryId),
                      )?.name || 'دسته انتخاب‌شده'}
                    </h5>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          نام ویژگی
                        </label>
                        <input
                          type="text"
                          value={newAttribute.name}
                          onChange={(e) =>
                            setNewAttribute({ ...newAttribute, name: e.target.value })
                          }
                          className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="مثال: رنگ، اندازه، جنس"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          نوع ویژگی
                        </label>
                        <select
                          value={newAttribute.type}
                          onChange={(e) =>
                            setNewAttribute({
                              ...newAttribute,
                              type: e.target.value as AttributeType,
                              options: e.target.value === 'select' ? [''] : [],
                            })
                          }
                          className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="text">متن</option>
                          <option value="number">عدد</option>
                          <option value="select">انتخابی</option>
                        </select>
                      </div>
                      {newAttribute.type === 'select' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            گزینه‌ها
                          </label>
                          <div className="space-y-2">
                            {newAttribute.options.map((option, index) => (
                              <div key={index} className="flex gap-2">
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateAttributeOption(index, e.target.value)}
                                  className="flex-1 px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                  placeholder={`گزینه ${index + 1}`}
                                />
                                {newAttribute.options.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeAttributeOption(index)}
                                    className="px-3 py-2 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/70"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={addAttributeOption}
                              className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                            >
                              + افزودن گزینه
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleCreateAttribute}
                          className="bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-600 dark:hover:bg-green-700 font-medium"
                        >
                          ایجاد ویژگی
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewAttribute(false);
                            setNewAttribute({ name: '', type: 'text', options: [''] });
                          }}
                          className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 font-medium"
                        >
                          انصراف
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* existing attributes */}
                {categoryAttributes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryAttributes.map((attr) => (
                      <div
                        key={attr._id}
                        className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            {attr.name}
                            {attr.isRequired && <span className="text-red-500 mr-1">*</span>}
                          </label>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await api.removeAttributeFromCategory(
                                  formData.category || secondLevelCategoryId || parentCategoryId,
                                  attr._id,
                                );
                                toast.success('ویژگی از دسته حذف شد');
                                const categoryIdForAttributes =
                                  formData.category || secondLevelCategoryId || parentCategoryId;
                                if (categoryIdForAttributes) {
                                  fetchCategoryAttributes(categoryIdForAttributes);
                                }
                                const nextAttributes = { ...formData.attributes };
                                delete nextAttributes[attr._id];
                                setFormData({ ...formData, attributes: nextAttributes });
                              } catch (error: any) {
                                toast.error(error.message);
                              }
                            }}
                            className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs"
                          >
                            ×
                          </button>
                        </div>
                        {attr.type === 'select' ? (
                          <select
                            required={attr.isRequired}
                            value={formData.attributes[attr._id] || ''}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                attributes: {
                                  ...formData.attributes,
                                  [attr._id]: e.target.value,
                                },
                              })
                            }
                            className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                          >
                            <option value="">انتخاب کنید</option>
                            {attr.options?.map((option: string) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={attr.type === 'number' ? 'number' : 'text'}
                            required={attr.isRequired}
                            value={formData.attributes[attr._id] || ''}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                attributes: {
                                  ...formData.attributes,
                                  [attr._id]: e.target.value,
                                },
                              })
                            }
                            className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                            placeholder={`وارد کردن ${attr.name}`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                    هیچ ویژگی‌ای برای این دسته تعریف نشده است.
                  </div>
                )}
              </div>
            )}

            {/* Brand / model / stock */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  برند *
                </label>
                <select
                  required
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 bg-white/70 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100"
                >
                  <option value="">انتخاب برند</option>
                  {brands.map((brand) => (
                    <option key={brand._id} value={brand._id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  مدل
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 bg-white/70 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100"
                  placeholder="مدل محصول"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  موجودی *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 bg-white/70 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100"
                  placeholder="تعداد"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-100 dark:border-orange-800/50">
            <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-300 mb-4">
              تصاویر محصول
            </h3>
            <div className="border-2 border-dashed border-orange-200 dark:border-orange-700/50 rounded-xl p-8 bg-white/50 dark:bg-gray-700/30 hover:bg-white/70 dark:hover:bg-gray-700/50 transition-all duration-200">
              <div className="text-center">
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-red-600 dark:hover:from-orange-700 dark:hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                    {uploadingImages ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        در حال آپلود...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        انتخاب تصاویر
                      </>
                    )}
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImages}
                    className="sr-only"
                  />
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  حداکثر ۲۰ تصویر • JPG, PNG, WEBP (حداکثر ۵ مگابایت)
                </p>
              </div>
            </div>

            {formData.images.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  تصاویر ({formData.images.length})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-80 overflow-y-auto p-4 bg-white/60 dark:bg-gray-700/30 rounded-xl border border-orange-100 dark:border-orange-800/50">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 group-hover:border-orange-300 dark:group-hover:border-orange-600 transition-all duration-200">
                        <Image
                          src={image.url}
                          alt={image.alt || `تصویر ${index + 1}`}
                          fill
                          className={`object-cover group-hover:scale-105 transition-all duration-300 cursor-pointer ${
                            image.isUploading ? 'opacity-50' : ''
                          }`}
                          onClick={() => !image.isUploading && window.open(image.url, '_blank')}
                          sizes="(max-width: 1024px) 33vw, 200px"
                          unoptimized={image.url.startsWith('blob:')}
                        />
                        {image.isUploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                            <div className="animate-spin rounded-full h-8 w-8 border-3 border-white border-t-transparent" />
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        disabled={image.isUploading}
                        className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:from-red-600 hover:to-pink-600 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg disabled:opacity-30"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Accessories */}
          <AdminAccessorySelector
            selectedAccessories={selectedAccessories}
            onAccessoriesChange={setSelectedAccessories}
          />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={submitting || uploadingImages}
              className="flex-1 inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  در حال به‌روزرسانی...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  به‌روزرسانی محصول
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/products')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 border border-gray-200 dark:border-gray-600"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}