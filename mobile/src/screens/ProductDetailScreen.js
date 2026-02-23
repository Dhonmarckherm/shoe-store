import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { productAPI, recommendationAPI } from '../services/api';

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { addToCart } = useCart();
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const [productRes, similarRes] = await Promise.all([
        productAPI.getProduct(productId),
        recommendationAPI.getSimilarProducts(productId),
      ]);
      setProduct(productRes.data.data);
      setSimilarProducts(similarRes.data.data);
      if (productRes.data.data.colors?.length > 0) {
        setSelectedColor(productRes.data.data.colors[0]);
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      Alert.alert('Select Size', 'Please select a size');
      return;
    }

    const result = await addToCart(productId, quantity, selectedSize, selectedColor);
    if (result.success) {
      Alert.alert('Added to Cart', 'Item has been added to your cart');
    }
  };

  if (loading || !product) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Loading...</Text>
      </View>
    );
  }

  const availableSizes = product.sizes.filter(s => s.stock > 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        {/* Product Image */}
        <Image source={{ uri: product.images[0] }} style={styles.productImage} />

        {/* Product Info */}
        <View style={[styles.infoContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.brand, { color: colors.textSecondary }]}>
            {product.brand}
          </Text>
          <Text style={[styles.name, { color: colors.text }]}>
            {product.name}
          </Text>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <Icon name="star" size={18} color="#fbbf24" />
            <Text style={[styles.rating, { color: colors.text }]}>
              {product.rating}
            </Text>
            <Text style={[styles.reviews, { color: colors.textSecondary }]}>
              ({product.numReviews} reviews)
            </Text>
          </View>

          {/* Price */}
          <Text style={[styles.price, { color: colors.primary }]}>
            ${product.price.toFixed(2)}
          </Text>

          {/* Description */}
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {product.description}
          </Text>

          {/* Colors */}
          {product.colors?.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Color
              </Text>
              <View style={styles.optionsContainer}>
                {product.colors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { 
                        backgroundColor: selectedColor === color ? colors.primary : colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setSelectedColor(color)}
                  >
                    <Text style={{ 
                      color: selectedColor === color ? '#fff' : colors.text,
                    }}>
                      {color}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Sizes */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Size
            </Text>
            <View style={styles.optionsContainer}>
              {product.sizes.map((sizeInfo) => (
                <TouchableOpacity
                  key={sizeInfo.size}
                  style={[
                    styles.sizeOption,
                    { 
                      backgroundColor: selectedSize === sizeInfo.size 
                        ? colors.primary 
                        : sizeInfo.stock === 0 
                          ? colors.border 
                          : colors.background,
                      borderColor: colors.border,
                      opacity: sizeInfo.stock === 0 ? 0.5 : 1,
                    },
                  ]}
                  onPress={() => sizeInfo.stock > 0 && setSelectedSize(sizeInfo.size)}
                  disabled={sizeInfo.stock === 0}
                >
                  <Text style={{ 
                    color: selectedSize === sizeInfo.size ? '#fff' : colors.text,
                    textDecorationLine: sizeInfo.stock === 0 ? 'line-through' : 'none',
                  }}>
                    {sizeInfo.size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quantity */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Quantity
            </Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={[styles.quantityButton, { borderColor: colors.border }]}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Icon name="minus" size={20} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.quantityText, { color: colors.text }]}>
                {quantity}
              </Text>
              <TouchableOpacity
                style={[styles.quantityButton, { borderColor: colors.border }]}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Icon name="plus" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAddToCart}
        >
          <Icon name="cart-plus" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  productImage: {
    width: width,
    height: width,
  },
  infoContainer: {
    padding: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  brand: {
    fontSize: 14,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  reviews: {
    fontSize: 14,
    marginLeft: 4,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  sizeOption: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    width: 50,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProductDetailScreen;
