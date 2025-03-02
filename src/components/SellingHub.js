'use client'

// React and Next.js imports
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Icons
import { 
  Package, 
  Edit2, 
  Trash2, 
  MoreVertical, 
  MapPin, 
  Plus, 
  X, 
  UserCircle, 
  Search,
  Ticket,
  Laptop,
  Store
} from 'lucide-react';

// Context imports
import { useDarkMode } from '@/context/DarkModeContext';
import { useUser } from '@/context/UserContext';

// Firebase imports
import { db, storage } from '@/config/firebaseConfig';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot, 
  updateDoc,
  getDoc 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';

// Component imports
const CreateProductModal = dynamic(() => import('./CreateProductModal'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
});

// Image compression
import imageCompression from 'browser-image-compression';

const compressImage = async (file) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1024,
    useWebWorker: true,
    fileType: 'image/jpeg'
  };

  try {
    const compressedFile = await imageCompression(file, options);
    console.log('Original file size:', file.size / 1024 / 1024, 'MB');
    console.log('Compressed file size:', compressedFile.size / 1024 / 1024, 'MB');
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
};

const SellingHub = () => {
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const { user } = useUser();
  const [showOptionsFor, setShowOptionsFor] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [products, setProducts] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    collection: 'Campus',
    category: 'clothes',
    color: 'unknown',
    description: '',
    status: 'active'
  });
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const categories = [
    { id: 'clothes', icon: Package, label: 'Clothes' },
    { id: 'tickets', icon: Ticket, label: 'Tickets' },
    { id: 'electronics', icon: Laptop, label: 'Electronics' },
    { id: 'kitchen', icon: Store, label: 'Kitchen' },
    { id: 'other', icon: Package, label: 'Other' }
  ];

  // Fetch user's products
  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    const q = query(
      collection(db, 'products'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productList);
    });

    return () => unsubscribe();
  }, [user, router]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const compressedFile = await compressImage(file);
        setImageFile(compressedFile);
      } catch (error) {
        console.error('Error handling image:', error);
      }
    }
  };
  
  const handleEditImageChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const compressedFile = await compressImage(file);
        setEditingProduct({
          ...editingProduct,
          newImageFile: compressedFile,
          imagePreview: URL.createObjectURL(compressedFile)
        });
      } catch (error) {
        console.error('Error handling edit image:', error);
      }
    }
  };
  
  const handleEdit = async () => {
    if (!editingProduct || !user) return;
  
    try {
      const productRef = doc(db, 'products', editingProduct.id);
      
      // First verify the product belongs to the user
      const productDoc = await getDoc(productRef);
      if (!productDoc.exists() || productDoc.data().userId !== user.uid) {
        console.error('Not authorized to edit this product');
        return;
      }
  
      let imageUrl = editingProduct.imageUrl; // Keep existing image URL by default
  
      // If there's a new image, upload it
      if (editingProduct.newImageFile) {
        // Delete old image if it exists and is a Firebase URL
        if (editingProduct.imageUrl && editingProduct.imageUrl.includes('firebase')) {
          try {
            const oldImageRef = ref(storage, editingProduct.imageUrl);
            await deleteObject(oldImageRef);
          } catch (error) {
            console.error('Error deleting old image:', error);
          }
        }
  
        // Upload new image
        const imageRef = ref(storage, `products/${user.uid}/${Date.now()}-${editingProduct.newImageFile.name}`);
        const uploadResult = await uploadBytes(imageRef, editingProduct.newImageFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }
  
      await updateDoc(productRef, {
        name: editingProduct.name,
        price: parseFloat(editingProduct.price),
        collection: editingProduct.collection,
        category: editingProduct.category,
        description: editingProduct.description,
        imageUrl: imageUrl,
        updatedAt: new Date().toISOString()
      });
  
      setShowEditModal(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleImageUrl = (url) => {
    setImageUrl(url);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!user) return;

    setIsUploading(true);
    try {
      let imageUrl = '';
      
      if (imageFile) {
        // Upload file
        const imageRef = ref(storage, `products/${user.uid}/${Date.now()}-${imageFile.name}`);
        const uploadResult = await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
      } else if (imageUrl) {
        // Use direct URL
        imageUrl = imageUrl;
      }

      const productData = {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        color: newProduct.color || 'unknown',
        collection: newProduct.collection,
        description: newProduct.description,
        imageUrl,
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email.split('@')[0],
        status: 'active',
        views: 0,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'products'), productData);
      setShowCreateModal(false);
      setNewProduct({
        name: '',
        price: '',
        collection: 'Campus',
        category: 'clothes',
        color: 'unknown',
        description: '',
        status: 'active'
      });
      setImageFile(null);
      setImageUrl(null);
    } catch (error) {
      console.error('Error creating product:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!productToDelete || !user) return;
  
    try {
      const productRef = doc(db, 'products', productToDelete.id);
      
      // First verify the product belongs to the user
      const productDoc = await getDoc(productRef);
      if (!productDoc.exists() || productDoc.data().userId !== user.uid) {
        console.error('Not authorized to delete this product');
        return;
      }
  
      // Delete from Firestore first
      await deleteDoc(productRef);
      
      // Only try to delete the image if it's a Firebase Storage URL
      if (productToDelete.imageUrl && productToDelete.imageUrl.includes('firebase')) {
        try {
          const imageRef = ref(storage, productToDelete.imageUrl);
          await deleteObject(imageRef);
        } catch (storageError) {
          console.error('Error deleting image:', storageError);
          // Continue with the deletion even if image deletion fails
        }
      }
      
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Error deleting product. Please try again.');
    }
  };

  // Add error handling for both modals
const [error, setError] = useState('');

  const totalEarnings = products.reduce((sum, product) => 
    product.status === 'sold' ? sum + product.price : sum, 0
  );

  return (
    <div className={`min-h-screen transition-colors ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Earnings Banner */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Your Selling Hub
            </h1>
            <div className="mt-4">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Earnings
              </p>
              <p className="text-4xl font-bold text-green-500">
                £{totalEarnings.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create New Listing Button and Migration Button */}
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
  <button 
    onClick={() => setShowCreateModal(true)}
    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-4 px-6 flex items-center justify-center gap-2 transition-colors shadow-lg hover:shadow-xl"
  >
    <Plus className="w-5 h-5" />
    <span className="text-lg font-medium">Create New Listing</span>
  </button>
</div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product) => (
            <div key={product.id} 
              className={`${
                isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
              } rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md`}
            >
              <div className="flex flex-col h-full">
                <div className="relative w-full h-32 bg-gray-100 rounded-t-lg overflow-hidden">
                  <Image
                    src={product.imageUrl || '/placeholder.png'}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-3 flex-grow">
                  <h3 className="font-medium text-sm mb-1 truncate">{product.name}</h3>
                  
                  {/* Display color and category tags */}
                  <div className="flex flex-wrap gap-1 mb-1">
                    {product.color && product.color !== 'unknown' && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        product.color === 'red' ? 'bg-red-100 text-red-800 border border-red-300' :
                        product.color === 'blue' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                        product.color === 'green' ? 'bg-green-100 text-green-800 border border-green-300' :
                        product.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                        product.color === 'orange' ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                        product.color === 'purple' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                        product.color === 'pink' ? 'bg-pink-100 text-pink-800 border border-pink-300' :
                        product.color === 'black' ? 'bg-gray-800 text-white' :
                        product.color === 'white' ? 'bg-white text-gray-800 border border-gray-300' :
                        product.color === 'gray' ? 'bg-gray-200 text-gray-800 border border-gray-400' :
                        product.color === 'brown' ? 'bg-amber-700 text-white' :
                        product.color === 'beige' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        product.color === 'multicolor' ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white' :
                        product.color === 'patterned' ? 'bg-gray-200 text-gray-800 border border-gray-400' :
                        'bg-gray-100 text-gray-800 border border-gray-300'
                      }`}>
                        {product.color}
                      </span>
                    )}
                    
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      product.category === 'shirt' ? 'bg-indigo-100 text-indigo-800' :
                      product.category === 'tshirt' ? 'bg-sky-100 text-sky-800' :
                      product.category === 'blouse' ? 'bg-fuchsia-100 text-fuchsia-800' :
                      product.category === 'hoodie' ? 'bg-blue-100 text-blue-800' :
                      product.category === 'sweatshirt' ? 'bg-blue-100 text-blue-800' :
                      product.category === 'jacket' ? 'bg-cyan-100 text-cyan-800' :
                      product.category === 'blazer' ? 'bg-slate-100 text-slate-800' :
                      product.category === 'pants' ? 'bg-emerald-100 text-emerald-800' :
                      product.category === 'jeans' ? 'bg-blue-100 text-blue-800' :
                      product.category === 'shorts' ? 'bg-lime-100 text-lime-800' :
                      product.category === 'skirt' ? 'bg-pink-100 text-pink-800' :
                      product.category === 'dress' ? 'bg-violet-100 text-violet-800' :
                      product.category === 'shoes' ? 'bg-amber-100 text-amber-800' :
                      product.category === 'boots' ? 'bg-amber-100 text-amber-800' :
                      product.category === 'sandals' ? 'bg-yellow-100 text-yellow-800' :
                      product.category === 'accessories' ? 'bg-rose-100 text-rose-800' :
                      product.category === 'bag' ? 'bg-rose-100 text-rose-800' :
                      product.category === 'hat' ? 'bg-rose-100 text-rose-800' :
                      product.category === 'jewelry' ? 'bg-rose-100 text-rose-800' :
                      product.category === 'scarf' ? 'bg-rose-100 text-rose-800' :
                      product.category === 'electronics' ? 'bg-gray-200 text-gray-800' :
                      product.category === 'kitchen' ? 'bg-green-100 text-green-800' :
                      product.category === 'tickets' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {product.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500 mb-2">
                    <MapPin className="w-3 h-3 mr-1" />
                    {product.collection}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">£{product.price.toFixed(2)}</span>
                    <div className="flex">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setShowEditModal(true);
                          setShowOptionsFor(null);
                        }}
                        className="p-1.5 text-gray-500 hover:text-blue-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setProductToDelete(product);
                          setShowDeleteConfirm(true);
                          setShowOptionsFor(null);
                        }}
                        className="p-1.5 text-gray-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Product Modal */}
      {showCreateModal && (
        <CreateProductModal
          isDarkMode={isDarkMode}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateProduct}
          newProduct={newProduct}
          setNewProduct={setNewProduct}
          handleImageChange={handleImageChange}
          handleImageUrl={handleImageUrl}
          isUploading={isUploading}
          categories={categories}
        />
      )}

{/* Edit Modal */}
{showEditModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className={`w-full max-w-md rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Edit Listing
        </h2>
        <button onClick={() => setShowEditModal(false)}>
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-4">
        {/* Current Image Preview */}
        <div className="relative">
          <div className="w-full h-48 rounded-lg overflow-hidden">
            <Image
              src={editingProduct?.imagePreview || editingProduct?.imageUrl || '/placeholder-image.jpg'}
              alt={editingProduct?.name}
              width={500}
              height={300}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Update Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleEditImageChange}
            className={`w-full ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Category
          </label>
          <select
            value={editingProduct?.category}
            onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
            className={`w-full rounded-lg p-2 border ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Name
          </label>
          <input
            type="text"
            value={editingProduct?.name}
            onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
            className={`w-full rounded-lg p-2 border ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Price
          </label>
          <input
            type="number"
            value={editingProduct?.price}
            onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
            className={`w-full rounded-lg p-2 border ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Collection Point
          </label>
          <select
            value={editingProduct?.collection}
            onChange={(e) => setEditingProduct({...editingProduct, collection: e.target.value})}
            className={`w-full rounded-lg p-2 border ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          >
            <option>Campus</option>
            <option>City</option>
            <option>Oldfield Park</option>
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Description
          </label>
          <textarea
            value={editingProduct?.description}
            onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
            className={`w-full rounded-lg p-2 border ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
            rows={3}
          />
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowEditModal(false)}
            className={`flex-1 py-2 rounded-lg ${
              isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleEdit}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
)}
{/* Delete Confirmation Modal */}
{showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-sm rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 text-red-200 rounded-lg">
                {error}
              </div>
            )}
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Confirm Delete
            </h2>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Are you sure you want to delete &quot;{productToDelete?.name}&quot;? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setError('');
                }}
                className={`flex-1 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellingHub;