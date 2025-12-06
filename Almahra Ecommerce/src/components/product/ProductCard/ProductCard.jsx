import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProductCard.css";
import Button from "../../common/Button/Button.jsx";
import { formatCurrency } from "../../../utils/helpers.js";
import { useCart } from "../../../context/CartContext.jsx";

const ProductCard = ({ product, className = "" }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants?.[0] || null
  );

  const handleAddToCart = () => {
    addToCart(product, selectedVariant);
  };

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
  };

  const handleTryAR = () => {
    navigate('/try-ar', { state: { product } });
  };

  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  return (
    <div className={`product-card ${className}`}>
      {/* Product Image */}
      <div className="product-card__image-container">
        <img
          src={product.images?.[0] || "/images/placeholder.svg"}
          alt={product.name}
          className="product-card__image"
        />

        {/* Badges */}
        <div className="product-card__badges">
          {product.featured && (
            <span className="product-card__badge product-card__badge--featured">
              Featured
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="product-card__badge product-card__badge--discount">
              -{discountPercentage}%
            </span>
          )}
          {!product.inStock && (
            <span className="product-card__badge product-card__badge--out-of-stock">
              Out of Stock
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="product-card__actions">
          <button
            className="product-card__action-btn"
            aria-label="Add to Wishlist"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          <button className="product-card__action-btn" aria-label="Quick View">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="product-card__content">
        {/* Brand */}
        {product.brand && (
          <p className="product-card__brand">{product.brand}</p>
        )}

        {/* Name */}
        <h3 className="product-card__name">{product.name}</h3>

        {/* Rating */}
        {product.rating && (
          <div className="product-card__rating">
            <div className="product-card__stars">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`product-card__star ${
                    i < Math.floor(product.rating)
                      ? "product-card__star--filled"
                      : ""
                  }`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <span className="product-card__rating-text">
              {product.reviews > 0 ? `(${product.reviews})` : 'No reviews yet'}
            </span>
          </div>
        )}

        {/* Price */}
        <div className="product-card__price">
          <span className="product-card__current-price">
            {formatCurrency(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="product-card__original-price">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Colors */}
        {product.variants && product.variants.length > 0 && (
          <div className="product-card__colors">
            {product.variants.slice(0, 4).map((variant) => (
              <button
                key={variant.id}
                className={`product-card__color ${
                  selectedVariant?.id === variant.id
                    ? "product-card__color--selected"
                    : ""
                }`}
                style={{ backgroundColor: variant.colorCode }}
                title={variant.color}
                onClick={() => handleVariantSelect(variant)}
              />
            ))}
            {product.variants.length > 4 && (
              <span className="product-card__color-more">
                +{product.variants.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Try AR Button */}
        <Button
          variant="secondary"
          size="medium"
          onClick={handleTryAR}
          className="product-card__try-ar"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          }
        >
          Try AR
        </Button>

        {/* Add to Cart Button */}
        <Button
          variant="primary"
          size="medium"
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="product-card__add-to-cart"
        >
          {product.inStock ? "Add to Cart" : "Out of Stock"}
        </Button>

        {/* View Cart Button */}
        <Button
          variant="secondary"
          size="medium"
          onClick={() => navigate('/cart')}
          className="product-card__view-cart"
        >
          View Cart
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
