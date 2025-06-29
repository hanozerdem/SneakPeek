import { useState, useEffect } from 'react';
import { Package, Trash2, Upload, Plus, X, AlertTriangle, Edit } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

// Import interfaces from project
import { 
  Product, 
  CreateProductRequest, 
  ProductSizeInput 
} from '../interfaces/products.interface';

const ProductsTabComponent = ({ filterValue }: { filterValue: string }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const filteredProducts = products.filter((product) => {
    if (filterValue === "All") return true;
    if (filterValue === "Active") return (product.price ?? 0) > 0;
    if (filterValue === "Inactive") return product.price === 0 || !product.price;
    return true;
  });


  
  
  // Form state
  const [formData, setFormData] = useState<CreateProductRequest>({
    productName: '',
    brand: '',
    model: '',
    serialNumber: '',
    warrantyStatus: '',
    distributor: '',
    description: '',
    color: '',
    category: '',
    tags: [],
    sizes: [{ size: '', quantity: 0 }],
    imageUrl: '',
    productStatus: 'INACTIVE',
    // These fields are in the actual interface but not needed for initial product creation
    // Will be set by Sales Manager later and product will be acctive
    price: 0,
    currency: ''
  });

  // Tag input state
  const [tagInput, setTagInput] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:9000/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      if (data.status && data.products) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      setError('Error loading products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSizeChange = (index: number, field: 'size' | 'quantity', value: string | number) => {
    const newSizes = [...(formData.sizes || [])] as ProductSizeInput[];
    newSizes[index] = { 
      ...newSizes[index], 
      [field]: field === 'quantity' ? Number(value) : value 
    };
    setFormData(prev => ({ ...prev, sizes: newSizes }));
  };

  const addSizeField = () => {
    setFormData(prev => ({
      ...prev,
      sizes: [...(prev.sizes || []), { size: '', quantity: 0 }]
    }));
  };

  const removeSizeField = (index: number) => {
    if ((formData.sizes ?? []).length > 1) {
      const newSizes = [...(formData.sizes || [])];
      newSizes.splice(index, 1);
      setFormData(prev => ({ ...prev, sizes: newSizes }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags ?? []).filter(t => t !== tag)
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
  
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('upload_preset', 'sneakpeek');
  
      const res = await fetch('https://api.cloudinary.com/v1_1/dfubca7s3/image/upload', {
        method: 'POST',
        body: formData
      });
  
      const data = await res.json();
      if (data.secure_url) {
        setFormData(prev => ({ ...prev, imageUrl: data.secure_url }));
      } else {
        throw new Error('Cloudinary response error');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };
  

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
  
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('upload_preset', 'sneakpeek'); // ← preset ismi
  
      const res = await fetch('https://api.cloudinary.com/v1_1/dfubca7s3/image/upload', {
        method: 'POST',
        body: formData
      });
  
      const data = await res.json();
      if (data.secure_url) {
        setFormData(prev => ({ ...prev, imageUrl: data.secure_url }));
      } else {
        throw new Error('Cloudinary response error');
      }
    } catch (err) {
      console.error('Drop error:', err);
      setError('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const url =
        formMode === 'edit' && selectedProduct
          ? `http://localhost:9000/api/products/update/${selectedProduct.productId}`
          : 'http://localhost:9000/api/products/create';
  
      const method = formMode === 'edit' ? 'PUT' : 'POST';
  
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend Error:', errorText);
        throw new Error('Failed to submit form');
      }
  
      await fetchProducts();
  
      // Reset form
      setFormData({
        productName: '',
        brand: '',
        model: '',
        serialNumber: '',
        warrantyStatus: '',
        distributor: '',
        description: '',
        color: '',
        category: '',
        tags: [],
        sizes: [{ size: '', quantity: 0 }],
        imageUrl: '',
        productStatus: 'INACTIVE',
        price: 0,
        currency: ''
      });
  
      setSelectedProduct(null);
      setFormMode('add');
      setIsFormOpen(false);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to submit form');
    }
  };
  

  const openDeleteConfirm = (productId: string) => {
    setProductToDelete(productId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      const response = await fetch(`http://localhost:9000/api/products/${productToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      // Refresh products list
      await fetchProducts();
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product');
    }
  };

  const openUpdateModal = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      productName: product.productName || '',
      brand: product.brand || '',
      model: product.model || '',
      serialNumber: product.serialNumber || '',
      warrantyStatus: product.warrantyStatus || '',
      distributor: product.distributor || '',
      description: product.description || '',
      color: product.color || '',
      category: product.category || '',
      tags: product.tags || [],
      sizes: product.sizes || [{ size: '', quantity: 0 }],
      imageUrl: product.imageUrl || '',
      productStatus: product.productStatus || 'INACTIVE',
      price: product.price || 0,
      currency: product.currency || ''
    });
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    try {
      const response = await fetch(`http://localhost:9000/api/products/${selectedProduct.productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      // Refresh products list
      await fetchProducts();
      
      // Reset form and close modal
      setFormData({
        productName: '',
        brand: '',
        model: '',
        serialNumber: '',
        warrantyStatus: '',
        distributor: '',
        description: '',
        color: '',
        category: '',
        tags: [],
        sizes: [{ size: '', quantity: 0 }],
        imageUrl: '',
        productStatus: 'INACTIVE',
        price: 0,
        currency: ''
      });
      setFormMode('edit');
      setIsFormOpen(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error('Error updating product:', err);
      setError('Failed to update product');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300"></div>
      </div>
    );
  }

  return (
<div className={`bg-white rounded-xl p-4 shadow-sm relative ${isFormOpen ? 'blur-sm pointer-events-none' : ''}`}> 
  <div className="flex justify-end items-center mb-6">
    <button
      onClick={() => {
        setFormData({
          productName: '',
          brand: '',
          model: '',
          serialNumber: '',
          warrantyStatus: '',
          distributor: '',
          description: '',
          color: '',
          category: '',
          tags: [],
          sizes: [{ size: '', quantity: 0 }],
          imageUrl: '',
          productStatus: 'INACTIVE',
          price: 0,
          currency: ''
        });
        setIsFormOpen(true);
      }}      
      className="bottom-6 right-6 flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg"
    >
      <Plus size={18} />
      Add Product
    </button>
  </div>

  {error && (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
      <AlertTriangle size={20} className="mr-2" />
      {error}
    </div>
  )}

  <div className="overflow-x-auto">
    <table className="min-w-full bg-white rounded-xl overflow-hidden">
      <thead className="bg-gray-100">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Image</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Product Info</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Details</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No products found. Add your first product to get started.
                </td>
              </tr>
            ) : (
              
              filteredProducts.map((product) => (
                <tr key={product.productId} 
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() => openUpdateModal(product)}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-transparent">


                      {product.imageUrl ? (
                        <img 
                        src={product.imageUrl} 
                        alt={product.productName} 
                        className="w-full h-[48px] object-contain" 
                      />
                      
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={20} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                    <div className="text-xs text-gray-600">{product.brand} • {product.model}</div>
                    <div className="text-xs text-gray-500">SN: {product.serialNumber}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-700">{product.category}</div>
                    <div className="flex gap-1 mt-1">
                      {product.tags && product.tags.slice(0, 2).map((tag, idx) => (
                        <span key={idx} className="text-xs bg-transparent border border-gray-300 text-gray-700 px-2 py-0.5 rounded-full">

                          {tag}
                        </span>
                      ))}
                      {product.tags && product.tags.length > 2 && (
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                          +{product.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      product.price && product.price > 0
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {product.price && product.price > 0 ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openUpdateModal(product);
                        }}
                        className="text-black-600 hover:text-black-800 transition-colors p-1.5 rounded-lg hover:bg-black-100"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteConfirm(product.productId.toString());
                        }}
                        className="text-black-600 hover:text-black-800 transition-colors p-1.5 rounded-lg hover:bg-black-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      <Transition appear show={isFormOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsFormOpen(false)}>
        <Transition.Child
  as={Fragment}
  enter="ease-out duration-300"
  enterFrom="opacity-0"
  enterTo="opacity-100"
  leave="ease-in duration-200"
  leaveFrom="opacity-100"
  leaveTo="opacity-0"
>
  <div className="fixed inset-0 backdrop-blur-sm backdrop-brightness-75 bg-black/10" />
</Transition.Child>


          <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center pt-20 p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4 flex justify-between items-center">
                    Add New Product
                    <button 
                      onClick={() => setIsFormOpen(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={20} />
                    </button>
                  </Dialog.Title>

                  <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Image
                      </label>
                      <div
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                      >
                        {formData.imageUrl ? (
                          <div className="flex flex-col items-center">
                            <img 
                                src={formData.imageUrl} 
                                alt="Product" 
                                className="max-h-40 w-auto object-contain mb-4"
                              />
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                              className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                            >
                              <X size={16} /> Remove image
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload size={36} className="text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 mb-2">Drag and drop an image here, or click to select a file</p>
                            {uploadingImage ? (
                              <div className="animate-pulse text-gray-600">Uploading...</div>
                            ) : (
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="fileInput"
                              />
                            )}
                            <label
                              htmlFor="fileInput"
                              className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-4 py-2 rounded-lg cursor-pointer"
                            >
                              Select File
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
                          Product Name*
                        </label>
                        <input
                          type="text"
                          id="productName"
                          name="productName"
                          value={formData.productName}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                          Brand*
                        </label>
                        <input
                          type="text"
                          id="brand"
                          name="brand"
                          value={formData.brand}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                          Model*
                        </label>
                        <input
                          type="text"
                          id="model"
                          name="model"
                          value={formData.model}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700 mb-1">
                          Serial Number*
                        </label>
                        <input
                          type="text"
                          id="serialNumber"
                          name="serialNumber"
                          value={formData.serialNumber}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="warrantyStatus" className="block text-sm font-medium text-gray-700 mb-1">
                          Warranty Status
                        </label>
                        <select
  id="warrantyStatus"
  name="warrantyStatus"
  value={formData.warrantyStatus}
  onChange={handleInputChange}
  className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm focus:ring-black focus:border-black"
>
  <option value="">Select warranty</option>
  <option value="No Warranty">No Warranty</option>
  <option value="1 Year">1 Year</option>
  <option value="2 Years">2 Years</option>
  <option value="3 Years">3 Years</option>
</select>

                      </div>

                      <div>
                        <label htmlFor="distributor" className="block text-sm font-medium text-gray-700 mb-1">
                          Distributor
                        </label>
                        <input
                          type="text"
                          id="distributor"
                          name="distributor"
                          value={formData.distributor}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                          Color*
                        </label>
                        <select
  id="color"
  name="color"
  value={formData.color}
  onChange={handleInputChange}
  required
  className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm focus:ring-black focus:border-black"
>
  <option value="">Select color</option>
  <option value="Black">Black</option>
  <option value="White">White</option>
  <option value="Gray">Gray</option>
  <option value="Red">Red</option>
  <option value="Blue">Blue</option>
  <option value="Green">Green</option>
  <option value="Beige">Beige</option>
  <option value="Pink">Pink</option>
  <option value="Purple">Purple</option>
  <option value="Yellow">Yellow</option>
  <option value="Brown">Brown</option>
  <option value="Orange">Orange</option>
</select>

                      </div>

                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                          Category*
                        </label>
                        <select
  id="category"
  name="category"
  value={formData.category}
  onChange={handleInputChange}
  required
  className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm focus:ring-black focus:border-black"
>
  <option value="">Select category</option>
  <option value="Men">Men</option>
  <option value="Women">Women</option>
  <option value="Unisex">Unisex</option>
  <option value="Child">Child</option>
  <option value="Baby">Baby</option>
</select>

                      </div>
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {(formData.tags ?? []).map((tag, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-800 px-2 py-1 text-sm rounded-full flex items-center">
                            {tag}
                            <button 
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1.5 text-gray-600 hover:text-gray-800"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          placeholder="Add tag and press Enter"
                          className="flex-1 bg-white border border-gray-300 text-gray-900 rounded-l-lg p-2.5 text-sm focus:ring-blue-500 focus:border-black-500"
                        />
                        <button
                          type="button"
                          onClick={addTag}
                          className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sizes & Quantity*
                      </label>
                      {(formData.sizes ?? []).map((size, index) => (
                        <div key={index} className="flex items-center gap-3 mb-2">
                          <select
  value={size.size}
  onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
  required
  className="flex-1 bg-white border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm focus:ring-black focus:border-black"
>
  <option value="">Select size</option>
  {[...Array(11)].map((_, i) => (
    <option key={i} value={(35 + i).toString()}>
      {35 + i}
    </option>
  ))}
</select>

                          <input
                            type="number"
                            value={size.quantity}
                            onChange={(e) => handleSizeChange(index, 'quantity', e.target.value)}
                            min={0}
                            placeholder="Quantity"
                            required
                            className="w-24 bg-white border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeSizeField(index)}
                            disabled={(formData.sizes?.length ?? 0) === 1}
                            className={`p-2 rounded-lg ${
                              (formData.sizes?.length ?? 0) === 1
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-red-600 hover:text-red-800 hover:bg-red-100'
                            }`}
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addSizeField}
                        className="mt-2 flex items-center gap-1 text-sm text-gray-400 hover:text-gray-800"
                      >
                        <Plus size={16} /> Add another size
                      </button>
                    </div>

                  

                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"

                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
                      >
                        {formMode === 'edit' ? 'Update Product' : 'Add Product'}

                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
     
      {/* Delete Confirmation Modal */}
      <Transition appear show={deleteConfirmOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setDeleteConfirmOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 backdrop-blur-sm backdrop-brightness-75" />

          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white">
                    Delete Product
                  </Dialog.Title>
                  <div className="mt-3">
                    <p className="text-sm text-gray-300">
                      Are you sure you want to delete this product? This action cannot be undone.
                    </p>
                  </div>

                  <div className="mt-5 flex justify-end gap-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg border border-transparent bg-gray-600 px-4 py-2
                        text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onClick={() => setDeleteConfirmOpen(false)}
                    >
                        Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg border border-transparent bg-red-600 px-4 py-2
                        text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      onClick={handleDeleteProduct}
                    >
                        Delete
                    </button>
                    </div>
                </Dialog.Panel>
                </Transition.Child>
            </div>
            </div>
        </Dialog>
        </Transition>
    </div>
    );
}
export default ProductsTabComponent;
