import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/product/ProductCard/ProductCard.jsx';
import productService from '../../services/productService.js';
import './ProductsPage.css';

const ProductsPage = () => {
  const { category: urlCategory } = useParams();
  const [searchParams] = useSearchParams();
  const [selectedFrameType, setSelectedFrameType] = useState('all');
  const [selectedFrameShape, setSelectedFrameShape] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;
  
  // State for products from API
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // All available filter options
  const frameTypes = ['Full Rim', 'Half Rim', 'Rimless'];
  const frameShapes = ['Rectangle', 'Round', 'Square', 'Oval', 'Cat-Eye', 'Aviator', 'Wayfarer', 'Clubmaster', 'Geometric'];
  const materials = ['Acetate', 'Metal', 'Stainless Steel', 'Titanium', 'TR-90', 'Plastic', 'Wood', 'Mixed Material'];

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getAllProducts();
        setProducts(response.products || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        // Only show error if it's a real API error, not just empty data
        if (err.response && err.response.status !== 404) {
          setError('Failed to connect to server. Please try again.');
        } else {
          setError(null);
        }
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Initialize filters from URL parameters
  useEffect(() => {
    const frameTypeParam = searchParams.get('frameType');
    const frameShapeParam = searchParams.get('frameShape');
    const materialParam = searchParams.get('material');
    
    if (frameTypeParam) setSelectedFrameType(frameTypeParam);
    if (frameShapeParam) setSelectedFrameShape(frameShapeParam);
    if (materialParam) setSelectedMaterial(materialParam);
  }, [urlCategory, searchParams]);

  // Filter products
  const filteredProducts = useMemo(() => {
    console.log('Filtering products:', {
      totalProducts: products.length,
      selectedFrameType,
      selectedFrameShape,
      selectedMaterial
    });
    
    return products.filter(product => {
      const frameTypeMatch = selectedFrameType === 'all' || product.frameType === selectedFrameType;
      const frameShapeMatch = selectedFrameShape === 'all' || product.frameShape === selectedFrameShape;
      const materialMatch = selectedMaterial === 'all' || product.material === selectedMaterial;
      
      return frameTypeMatch && frameShapeMatch && materialMatch;
    });
  }, [products, selectedFrameType, selectedFrameShape, selectedMaterial]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

  const clearFilters = () => {
    setSelectedFrameType('all');
    setSelectedFrameShape('all');
    setSelectedMaterial('all');
    setCurrentPage(1);
  };

  // Loading state
  if (loading) {
    return (
      <div className="products-page">
        <div className="products-loading">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="products-page">
        <div className="products-error">
          <h2>Error Loading Products</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-page__container">
        {/* Left Sidebar */}
        <aside className="products-sidebar">
          <div className="products-sidebar__header">
            <h1 className="products-sidebar__title">Ray Ban Aviators</h1>
          </div>
          
          <div className="filters">
            <div className="filters__header">
              <h3 className="filters__title">Filters</h3>
              <button className="filters__clear" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>

            <div className="filter-group">
              <h4 className="filter-group__title">Frame Type</h4>
              <ul className="filter-list">
                <li className="filter-item">
                  <label className="filter-label">
                    <input
                      type="radio"
                      name="frameType"
                      value="all"
                      checked={selectedFrameType === 'all'}
                      onChange={(e) => {
                        setSelectedFrameType(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="filter-input"
                    />
                    <span className="filter-text">All Frame Types</span>
                  </label>
                </li>
                {frameTypes.map(frameType => (
                  <li key={frameType} className="filter-item">
                    <label className="filter-label">
                      <input
                        type="radio"
                        name="frameType"
                        value={frameType}
                        checked={selectedFrameType === frameType}
                        onChange={(e) => {
                          setSelectedFrameType(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="filter-input"
                      />
                      <span className="filter-text">
                        {frameType}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div className="filter-group">
              <h4 className="filter-group__title">Frame Shape</h4>
              <ul className="filter-list">
                <li className="filter-item">
                  <label className="filter-label">
                    <input
                      type="radio"
                      name="frameShape"
                      value="all"
                      checked={selectedFrameShape === 'all'}
                      onChange={(e) => {
                        setSelectedFrameShape(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="filter-input"
                    />
                    <span className="filter-text">All Frame Shapes</span>
                  </label>
                </li>
                {frameShapes.map(frameShape => (
                  <li key={frameShape} className="filter-item">
                    <label className="filter-label">
                      <input
                        type="radio"
                        name="frameShape"
                        value={frameShape}
                        checked={selectedFrameShape === frameShape}
                        onChange={(e) => {
                          setSelectedFrameShape(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="filter-input"
                      />
                      <span className="filter-text">
                        {frameShape}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div className="filter-group">
              <h4 className="filter-group__title">Material</h4>
              <ul className="filter-list">
                <li className="filter-item">
                  <label className="filter-label">
                    <input
                      type="radio"
                      name="material"
                      value="all"
                      checked={selectedMaterial === 'all'}
                      onChange={(e) => {
                        setSelectedMaterial(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="filter-input"
                    />
                    <span className="filter-text">All Materials</span>
                  </label>
                </li>
                {materials.map(material => (
                  <li key={material} className="filter-item">
                    <label className="filter-label">
                      <input
                        type="radio"
                        name="material"
                        value={material}
                        checked={selectedMaterial === material}
                        onChange={(e) => {
                          setSelectedMaterial(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="filter-input"
                      />
                      <span className="filter-text">
                        {material}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Right Products Grid */}
        <main className="products-main">
          <div className="products-grid">
            {currentProducts.length > 0 ? (
              currentProducts.map(product => (
                <div key={product.id} className="product-grid-item">
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <div className="no-products">
                <div className="no-products-icon">📦</div>
                <h3>No Products Found</h3>
                <p>
                  {products.length === 0 
                    ? "We're adding new products soon. Check back later!" 
                    : "No products match your filters. Try adjusting your search criteria."}
                </p>
                {filteredProducts.length === 0 && products.length > 0 && (
                  <button onClick={clearFilters} className="btn btn--primary">
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <div className="pagination__dots">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`pagination__dot ${
                      currentPage === page ? 'pagination__dot--active' : ''
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* CTA Banner */}
          <div className="products-cta-banner">
            <div className="products-cta-banner__content">
              <h3>Find Your Perfect Ray-Ban Style</h3>
              <p>Discover our complete collection of premium eyewear</p>
            </div>
          </div>
        </main>
      </div>

      {/* Footer Content Grid - Same as Homepage */}
      <section className="footer-content">
        <div className="container">
          <div className="footer-content__grid">
            {/* Left large block */}
            <div className="footer-content__block footer-content__block--large">
              <div className="footer-placeholder">
                Main Footer Content
              </div>
            </div>
            
            {/* Right side with stacked blocks */}
            <div className="footer-content__right">
              <div className="footer-content__block footer-content__block--small">
                <div className="footer-placeholder">
                  Footer Block 1
                </div>
              </div>
              <div className="footer-content__block footer-content__block--small">
                <div className="footer-placeholder">
                  Footer Block 2
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;
