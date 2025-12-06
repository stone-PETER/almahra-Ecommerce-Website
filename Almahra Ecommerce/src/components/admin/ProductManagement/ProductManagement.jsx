import React, { useState, useEffect } from 'react';
import productService from '../../../services/productService.js';
import './ProductManagement.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // All available filter options
  const frameTypes = ['Full Rim', 'Half Rim', 'Rimless'];
  const frameShapes = ['Rectangle', 'Round', 'Square', 'Oval', 'Cat-Eye', 'Aviator', 'Wayfarer', 'Clubmaster', 'Geometric'];
  const materials = ['Acetate', 'Metal', 'Stainless Steel', 'Titanium', 'TR-90', 'Plastic', 'Wood', 'Mixed Material'];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFrameType, setSelectedFrameType] = useState('all');
  const [selectedFrameShape, setSelectedFrameShape] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form state for adding/editing products
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    frameType: '',
    frameShape: '',
    material: '',
    description: '',
    stock: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log('Fetching products...');
        const response = await productService.getAllProducts();
        console.log('Products response:', response);
        
        if (response && response.products) {
          setProducts(response.products);
          console.log(`Loaded ${response.products.length} products`);
        } else {
          console.warn('No products in response');
          setProducts([]);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        console.error('Error message:', err.message);
        console.error('Error details:', err.response);
        
        // Set error message based on error type
        if (err.message === 'Cannot connect to server. Make sure backend is running on http://localhost:5000') {
          setError('Cannot connect to backend. Please make sure the backend server is running.');
        } else if (err.response && err.response.status >= 500) {
          setError('Server error. Please try again later.');
        } else if (err.response && err.response.status === 401) {
          setError('Authentication required. Please login again.');
        } else {
          setError(`Error: ${err.message || 'Failed to load products'}`);
        }
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Helper function to calculate total stock from variants or direct stock
  const getTotalStock = (product) => {
    // If product has direct stock field, use that
    if (product.stock !== undefined && product.stock !== null) {
      return product.stock;
    }
    // Otherwise try variants
    if (!product.variants || product.variants.length === 0) {
      return 0;
    }
    return product.variants.reduce((total, variant) => total + (variant.stock || 0), 0);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFrameType = selectedFrameType === 'all' || product.frameType === selectedFrameType;
    const matchesFrameShape = selectedFrameShape === 'all' || product.frameShape === selectedFrameShape;
    const matchesMaterial = selectedMaterial === 'all' || product.material === selectedMaterial;
    
    return matchesSearch && matchesFrameType && matchesFrameShape && matchesMaterial;
  });

  const handleEdit = (productId) => {
    console.log('Edit product:', productId);
    // TODO: Implement edit functionality
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      await productService.deleteProduct(productId);
      // Refresh products list
      const response = await productService.getAllProducts();
      setProducts(response.products || []);
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  const handleAddProduct = () => {
    setFormData({
      name: '',
      brand: '',
      price: '',
      frameType: '',
      frameShape: '',
      material: '',
      description: '',
      stock: ''
    });
    setShowAddModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.brand || !formData.price) {
      alert('Please fill in all required fields (Name, Brand, Price)');
      return;
    }

    try {
      setIsSubmitting(true);
      await productService.createProduct(formData);
      
      // Refresh products list
      const response = await productService.getAllProducts();
      setProducts(response.products || []);
      
      // Close modal and reset form
      setShowAddModal(false);
      setFormData({
        name: '',
        brand: '',
        price: '',
        frameType: '',
        frameShape: '',
        material: '',
        description: '',
        stock: ''
      });
      
      alert('Product added successfully!');
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="product-management">
      {loading && (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Loading products...</p>
        </div>
      )}
      
      {error && (
        <div style={{ padding: '20px', backgroundColor: '#fee', color: '#c00', borderRadius: '4px', margin: '20px 0' }}>
          {error}
        </div>
      )}
      
      {!loading && (
        <>
          <div className="product-management__header">
            <h1 className="product-management__title">Product Management</h1>
            <button 
              className="btn btn--primary btn--compact"
              onClick={handleAddProduct}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              Add Product
            </button>
          </div>

      {/* Filters */}
      <div className="product-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <select
          value={selectedFrameType}
          onChange={(e) => setSelectedFrameType(e.target.value)}
          className="category-select"
        >
          <option value="all">All Frame Types</option>
          {frameTypes.map((frameType, index) => (
            <option key={index} value={frameType}>
              {frameType}
            </option>
          ))}
        </select>

        <select
          value={selectedFrameShape}
          onChange={(e) => setSelectedFrameShape(e.target.value)}
          className="category-select"
        >
          <option value="all">All Frame Shapes</option>
          {frameShapes.map((frameShape, index) => (
            <option key={index} value={frameShape}>
              {frameShape}
            </option>
          ))}
        </select>

        <select
          value={selectedMaterial}
          onChange={(e) => setSelectedMaterial(e.target.value)}
          className="category-select"
        >
          <option value="all">All Materials</option>
          {materials.map((material, index) => (
            <option key={index} value={material}>
              {material}
            </option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-card__image">
              <img 
                src={product.primaryImage || product.image || '/placeholder-product.png'} 
                alt={product.name}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                }}
              />
              <div className="product-card__overlay">
                <button 
                  className="btn btn--secondary btn--sm"
                  onClick={() => handleEdit(product.id)}
                >
                  Edit
                </button>
                <button 
                  className="btn btn--danger btn--sm"
                  onClick={() => handleDelete(product.id)}
                >
                  Delete
                </button>
              </div>
            </div>
            
            <div className="product-card__content">
              <h3 className="product-card__name">{product.name}</h3>
              <p className="product-card__brand">
                {typeof product.brand === 'object' ? product.brand?.name || 'No Brand' : product.brand || 'No Brand'}
              </p>
              <div className="product-card__details">
                <span className="product-card__price">₹{product.price?.toLocaleString() || '0'}</span>
                {product.frameType && (
                  <span className="product-card__category">{product.frameType}</span>
                )}
              </div>
              <div className="product-card__stock">
                {(() => {
                  const totalStock = getTotalStock(product);
                  const isInStock = totalStock > 0;
                  return (
                    <span className={`stock-indicator ${isInStock ? 'stock-indicator--in-stock' : 'stock-indicator--out-of-stock'}`}>
                      {isInStock ? (
                        <>
                          <span className="stock-count">{totalStock}</span>
                          <span className="stock-text">in stock</span>
                        </>
                      ) : (
                        'Out of Stock'
                      )}
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-state__icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="m7.5 4.27 9 5.15"></path>
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                <path d="m3.3 7 8.7 5 8.7-5"></path>
                <path d="M12 22V12"></path>
              </svg>
            </div>
            <h3 className="empty-state__title">No products found</h3>
            <p className="empty-state__message">
              {products.length === 0 
                ? "No products have been added yet. Click 'Add Product' to create your first product." 
                : "Try adjusting your search terms or filters to find what you're looking for."}
            </p>
          </div>
        )}
      </div>
        </>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Add New Product</h2>
              <button 
                className="modal__close"
                onClick={() => setShowAddModal(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal__content">
              <form className="product-form" onSubmit={handleFormSubmit}>
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input 
                    type="text" 
                    name="name"
                    className="form-input" 
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Brand *</label>
                  <input 
                    type="text" 
                    name="brand"
                    className="form-input" 
                    placeholder="Enter brand name"
                    value={formData.brand}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Price (₹) *</label>
                    <input 
                      type="number" 
                      name="price"
                      className="form-input" 
                      placeholder="0"
                      value={formData.price}
                      onChange={handleFormChange}
                      required
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock</label>
                    <input 
                      type="number" 
                      name="stock"
                      className="form-input" 
                      placeholder="Available quantity"
                      value={formData.stock}
                      onChange={handleFormChange}
                      min="0"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Frame Type</label>
                    <select 
                      className="form-select"
                      name="frameType"
                      value={formData.frameType}
                      onChange={handleFormChange}
                    >
                      <option value="">Select frame type</option>
                      {frameTypes.map((frameType, index) => (
                        <option key={index} value={frameType}>
                          {frameType}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Frame Shape</label>
                    <select 
                      className="form-select"
                      name="frameShape"
                      value={formData.frameShape}
                      onChange={handleFormChange}
                    >
                      <option value="">Select frame shape</option>
                      {frameShapes.map((frameShape, index) => (
                        <option key={index} value={frameShape}>
                          {frameShape}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Material</label>
                  <select 
                    className="form-select"
                    name="material"
                    value={formData.material}
                    onChange={handleFormChange}
                  >
                    <option value="">Select material</option>
                    {materials.map((material, index) => (
                      <option key={index} value={material}>
                        {material}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea 
                    className="form-textarea" 
                    rows="4" 
                    name="description"
                    placeholder="Enter product description"
                    value={formData.description}
                    onChange={handleFormChange}
                  ></textarea>
                </div>
                <div className="form-group">
                  <label className="form-label">Product Image</label>
                  <input type="file" className="form-input" accept="image/*" />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn--secondary" onClick={() => setShowAddModal(false)} disabled={isSubmitting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Adding Product...' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
