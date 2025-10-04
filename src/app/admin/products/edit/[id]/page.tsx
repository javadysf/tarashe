'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import AdminAccessorySelector from '@/components/AdminAccessorySelector';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categoryAttributes, setCategoryAttributes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [showNewAttribute, setShowNewAttribute] = useState(false);
  const [newAttribute, setNewAttribute] = useState({
    name: '',
    type: 'text' as 'text' | 'number' | 'select',
    options: [''] as string[]
  });
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    brand: '',
    model: '',
    stock: '',
    attributes: {} as Record<string, string>,
    images: [] as Array<{
      url: string;
      alt: string;
      public_id?: string;
      isUploading?: boolean;
    }>
  });

  useEffect(() => {
    fetchData();
  }, [productId]);

  useEffect(() => {
    if (formData.category) {
      fetchCategoryAttributes(formData.category);
    } else {
      setCategoryAttributes([]);
    }
  }, [formData.category]);

  const fetchData = async () => {
    try {
      const [productData, categoriesData, brandsData] = await Promise.all([
        api.getProduct(productId),
        api.getCategories(),
        api.getBrands()
      ]);
      
      console.log('Product data:', productData);
      setCategories(categoriesData);
      setBrands(brandsData);
      
      // Handle category properly - it might be an object or string
      const categoryId = typeof productData.category === 'object' ? productData.category._id : productData.category;
      
      // Handle brand properly - it might be an object or string
      const brandId = typeof productData.brand === 'object' ? productData.brand._id : productData.brand;
      
      setFormData({
        name: productData.name || '',
        description: productData.description || '',
        price: productData.price?.toString() || '',
        originalPrice: productData.originalPrice?.toString() || productData.discountPrice?.toString() || '',
        category: categoryId || '',
        brand: brandId || '',
        model: productData.model || '',
        stock: productData.stock?.toString() || '',
        attributes: productData.attributes || {},
        images: productData.images || []
      });

      // Load category attributes after setting form data
      if (categoryId) {
        await fetchCategoryAttributes(categoryId);
      }

      // Load existing accessories
      if (productData.accessories && productData.accessories.length > 0) {
        const accessoryIds = productData.accessories.map((acc: any) => 
          typeof acc.accessory === 'object' ? acc.accessory._id : acc.accessory
        );
        setSelectedAccessories(accessoryIds);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('خطا در بارگذاری اطلاعات');
      setLoading(false);
    }
  };

  const fetchCategoryAttributes = async (categoryId: string) => {
    try {
      const response = await api.getCategoryAttributes(categoryId);
      // Extract the actual attribute objects from CategoryAttribute
      const attributes = response.map((ca: any) => ca.attribute);
      setCategoryAttributes(attributes);
    } catch (error) {
      console.error('Error fetching category attributes:', error);
    }
  };

  const handleCreateAttribute = async () => {
    if (!newAttribute.name.trim()) {
      toast.error('نام ویژگی الزامی است');
      return;
    }
    
    try {
      const attributeData = {
        ...newAttribute,
        options: newAttribute.type === 'select' ? newAttribute.options.filter(opt => opt.trim()) : undefined
      };
      
      const response = await api.createAttribute(attributeData);
      setNewAttribute({ name: '', type: 'text', options: [''] });
      setShowNewAttribute(false);
      
      if (formData.category) {
        try {
          await api.assignAttributeToCategory(formData.category, response.attribute._id);
          fetchCategoryAttributes(formData.category);
          toast.success('✅ ویژگی جدید ایجاد و به دسته اضافه شد!');
        } catch (assignError) {
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
    setNewAttribute({
      ...newAttribute,
      options: [...newAttribute.options, '']
    });
  };

  const updateAttributeOption = (index: number, value: string) => {
    const newOptions = [...newAttribute.options];
    newOptions[index] = value;
    setNewAttribute({
      ...newAttribute,
      options: newOptions
    });
  };

  const removeAttributeOption = (index: number) => {
    setNewAttribute({
      ...newAttribute,
      options: newAttribute.options.filter((_, i) => i !== index)
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
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

    const previews = validFiles.map((file, index) => ({
      url: URL.createObjectURL(file),
      alt: file.name,
      isUploading: true
    }));
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...previews]
    }));

    setUploadingImages(true);
    
    try {
      const response = await api.uploadProductImages(validFiles, formData.name || 'محصول');
      
      setFormData(prev => ({
        ...prev,
        images: [
          ...prev.images.filter(img => !img.isUploading),
          ...response.images
        ]
      }));
      
      previews.forEach(preview => {
        if (preview.url.startsWith('blob:')) {
          URL.revokeObjectURL(preview.url);
        }
      });
      
      toast.success(`✅ ${validFiles.length} تصویر با موفقیت آپلود شد!`);
    } catch (error: any) {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter(img => !img.isUploading)
      }));
      
      previews.forEach(preview => {
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
    
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    
    toast.info('🗑️ تصویر حذف شد');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const filteredAttributes = Object.fromEntries(
        Object.entries(formData.attributes).filter(([_, value]) => value && value.trim())
      );
      
      const submitData = new FormData();
      
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      if (formData.originalPrice) {
        submitData.append('originalPrice', formData.originalPrice);
      }
      submitData.append('brand', formData.brand);
      submitData.append('category', formData.category);
      submitData.append('stock', formData.stock);
      if (formData.model) {
        submitData.append('model', formData.model);
      }

      // Add existing images
      submitData.append('existingImages', JSON.stringify(formData.images));

      // Add attributes
      if (Object.keys(filteredAttributes).length > 0) {
        const attributesArray = Object.entries(filteredAttributes)
          .map(([attribute, value]) => ({ attribute, value }));
        submitData.append('attributes', JSON.stringify(attributesArray));
      }

      // Add accessories
      if (selectedAccessories.length > 0) {
        submitData.append('accessories', JSON.stringify(selectedAccessories));
      }

      await api.updateProduct(productId, submitData);
      
      // Beautiful success toast
      toast.success('🎉 محصول با موفقیت بهروزرسانی شد!', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
        }
      });
      
      // Navigate after a short delay to let user see the toast
      setTimeout(() => {
        router.push('/admin/products');
      }, 1500);
    } catch (error: any) {
      console.error('Update product error:', error);
      toast.error('❌ ' + (error.message || 'خطا در بهروزرسانی محصول'), {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
        }
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            ویرایش محصول
          </h1>
          <p className="text-gray-600">اطلاعات محصول خود را بهروزرسانی کنید</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 space-y-8">
          {/* Basic Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">اطلاعات پایه</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">نام محصول *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">توضیحات *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <h3 className="text-lg font-semibold text-green-800 mb-4">قیمت گذاری</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">قیمت فروش (تومان) *</label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white/70"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">قیمت اصلی (اختیاری)</label>
                <input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white/70"
                />
              </div>
            </div>
          </div>

          {/* Category & Details */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
            <h3 className="text-lg font-semibold text-purple-800 mb-4">دسته بندی و جزئیات</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">دسته بندی *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/70"
                >
                  <option value="">انتخاب دسته بندی</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>

                {/* Category Attributes */}
                {formData.category && (
                  <div className="mt-6 p-4 bg-white/60 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-purple-800">ویژگی های محصول</h4>
                      <button
                        type="button"
                        onClick={() => setShowNewAttribute(!showNewAttribute)}
                        className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        ویژگی جدید
                      </button>
                    </div>

                    {/* Create New Attribute */}
                    {showNewAttribute && (
                      <div className="mb-4 p-4 bg-white/80 rounded-lg border border-purple-300">
                        <h5 className="text-sm font-semibold text-purple-800 mb-3">ایجاد ویژگی جدید برای {categories.find(c => c._id === formData.category)?.name}</h5>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">نام ویژگی</label>
                            <input
                              type="text"
                              value={newAttribute.name}
                              onChange={(e) => setNewAttribute({...newAttribute, name: e.target.value})}
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                              placeholder="مثال: رنگ، اندازه، جنس"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">نوع ویژگی</label>
                            <select
                              value={newAttribute.type}
                              onChange={(e) => setNewAttribute({
                                ...newAttribute, 
                                type: e.target.value as 'text' | 'number' | 'select',
                                options: e.target.value === 'select' ? [''] : []
                              })}
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                            >
                              <option value="text">متن</option>
                              <option value="number">عدد</option>
                              <option value="select">انتخابی</option>
                            </select>
                          </div>

                          {newAttribute.type === 'select' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">گزینهها</label>
                              <div className="space-y-2">
                                {newAttribute.options.map((option, index) => (
                                  <div key={index} className="flex gap-2">
                                    <input
                                      type="text"
                                      value={option}
                                      onChange={(e) => updateAttributeOption(index, e.target.value)}
                                      className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                                      placeholder={`گزینه ${index + 1}`}
                                    />
                                    {newAttribute.options.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => removeAttributeOption(index)}
                                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                      >
                                        ×
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={addAttributeOption}
                                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
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
                              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
                            >
                              ایجاد ویژگی
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowNewAttribute(false);
                                setNewAttribute({ name: '', type: 'text', options: [''] });
                              }}
                              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                            >
                              انصراف
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Existing Attributes */}
                    {categoryAttributes.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categoryAttributes.map((attr) => (
                          <div key={attr._id}>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-sm font-medium text-gray-700">
                                {attr.name}
                              </label>
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await api.removeAttributeFromCategory(formData.category, attr._id);
                                    toast.success('ویژگی از دسته حذف شد');
                                    fetchCategoryAttributes(formData.category);
                                    const newAttributes = { ...formData.attributes };
                                    delete newAttributes[attr._id];
                                    setFormData({ ...formData, attributes: newAttributes });
                                  } catch (error: any) {
                                    toast.error(error.message);
                                  }
                                }}
                                className="text-red-500 hover:text-red-700 text-xs"
                              >
                                ×
                              </button>
                            </div>
                            {attr.type === 'select' ? (
                              <select
                                value={formData.attributes[attr._id] || ''}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  attributes: {
                                    ...formData.attributes,
                                    [attr._id]: e.target.value
                                  }
                                })}
                                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                              >
                                <option value="">انتخاب کنید</option>
                                {attr.options?.map((option: string) => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={attr.type === 'number' ? 'number' : 'text'}
                                value={formData.attributes[attr._id] || ''}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  attributes: {
                                    ...formData.attributes,
                                    [attr._id]: e.target.value
                                  }
                                })}
                                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                                placeholder={`وارد کردن ${attr.name}`}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">این دسته هنوز ویژگی ندارد. برای ایجاد ویژگی جدید روی دکمه "ویژگی جدید" کلیک کنید.</p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">برند *</label>
                  <select
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/70"
                  >
                    <option value="">انتخاب برند</option>
                    {brands.map((brand) => (
                      <option key={brand._id} value={brand._id}>{brand.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">مدل</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/70"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">موجودی *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/70"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
            <h3 className="text-lg font-semibold text-orange-800 mb-4">تصاویر محصول</h3>
            
            <div className="border-2 border-dashed border-orange-200 rounded-xl p-8 bg-white/50 hover:bg-white/70 transition-all duration-200">
              <div className="text-center">
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl">
                    {uploadingImages ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        در حال آپلود...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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
                <p className="text-sm text-gray-600 mt-2">حداکثر 20 تصویر • JPG, PNG, WEBP</p>
              </div>
            </div>
            
            {/* Image Preview */}
            {formData.images.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">تصاویر ({formData.images.length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-80 overflow-y-auto p-4 bg-white/60 rounded-xl border border-orange-100">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200 group-hover:border-orange-300 transition-all duration-200">
                        <img
                          src={image.url}
                          alt={image.alt || `تصویر ${index + 1}`}
                          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 cursor-pointer ${
                            image.isUploading ? 'opacity-50' : ''
                          }`}
                          onClick={() => !image.isUploading && window.open(image.url, '_blank')}
                        />
                        
                        {image.isUploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                            <div className="animate-spin rounded-full h-8 w-8 border-3 border-white border-t-transparent"></div>
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

          {/* Accessories Section */}
          <AdminAccessorySelector
            selectedAccessories={selectedAccessories}
            onAccessoriesChange={setSelectedAccessories}
          />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={submitting || uploadingImages}
              className="flex-1 inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  در حال بهروزرسانی...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  بهروزرسانی محصول
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => router.push('/admin/products')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 border border-gray-200"
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