/**
 * Transform backend product data (snake_case) to frontend format (camelCase)
 */
export const transformProduct = (product) => {
  if (!product) return null;

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    shortDescription: product.short_description,
    sku: product.sku,
    slug: product.slug,
    price: product.price,
    originalPrice: product.compare_price, // compare_price -> originalPrice
    comparePrice: product.compare_price,
    discountPercentage: product.discount_percentage,
    stock: product.stock_quantity,
    stockQuantity: product.stock_quantity,
    inStock:
      product.in_stock ?? product.is_in_stock ?? product.stock_quantity > 0,
    isLowStock: product.is_low_stock,
    brand:
      typeof product.brand === "object" ? product.brand?.name : product.brand,
    weight: product.weight,
    dimensions: product.dimensions,
    material: product.material,
    color: product.color,
    frameType: product.frame_type,
    frameShape: product.frame_shape,
    lensType: product.lens_type,
    frameWidth: product.frame_width,
    lensWidth: product.lens_width,
    bridgeWidth: product.bridge_width,
    templeLength: product.temple_length,
    isActive: product.is_active,
    featured: product.is_featured, // is_featured -> featured
    isFeatured: product.is_featured,
    rating: product.average_rating,
    averageRating: product.average_rating,
    reviewCount: product.review_count,
    reviews: product.review_count,
    images: product.primary_image
      ? [product.primary_image]
      : product.images?.length > 0
        ? typeof product.images[0] === "string"
          ? product.images
          : product.images.map((img) => img.image_url || img.url || img)
        : ["/images/placeholder.svg"],
    primaryImage:
      product.primary_image ||
      product.images?.[0]?.image_url ||
      product.images?.[0]?.url ||
      product.images?.[0] ||
      "/images/placeholder.svg",
    createdAt: product.created_at,
    publishedAt: product.published_at,
    variants: product.variants || [],
    categories: product.categories || [],
  };
};

/**
 * Transform array of products
 */
export const transformProducts = (products) => {
  if (!Array.isArray(products)) return [];
  return products.map(transformProduct);
};

/**
 * Transform user data from backend to frontend
 */
export const transformUser = (user) => {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    fullName: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
    phone: user.phone,
    role: user.role,
    isVerified: user.is_verified,
    emailVerified: user.is_verified,
    dateOfBirth: user.date_of_birth,
    profileImage: user.profile_image,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
};

/**
 * Transform order data from backend to frontend
 */
export const transformOrder = (order) => {
  if (!order) return null;

  return {
    id: order.id,
    orderNumber: order.order_number,
    userId: order.user_id,
    status: order.status,
    paymentStatus: order.payment_status,
    paymentMethod: order.payment_method,
    totalAmount: order.total_amount,
    subtotal: order.subtotal,
    shippingCost: order.shipping_cost,
    tax: order.tax,
    discount: order.discount,
    items: order.items || [],
    orderItems: order.items || [],
    shippingAddress: order.shipping_address,
    billingAddress: order.billing_address,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    trackingNumber: order.tracking_number,
    shippingMethod: order.shipping_method,
    notes: order.notes,
    adminNotes: order.admin_notes,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    shippedAt: order.shipped_at,
    deliveredAt: order.delivered_at,
  };
};

/**
 * Transform data from frontend (camelCase) to backend (snake_case)
 */
export const toSnakeCase = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);

  const snakeCaseObj = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(
      /[A-Z]/g,
      (letter) => `_${letter.toLowerCase()}`
    );
    snakeCaseObj[snakeKey] =
      typeof value === "object" ? toSnakeCase(value) : value;
  }
  return snakeCaseObj;
};
