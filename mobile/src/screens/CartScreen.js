import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { cart, updateQuantity, removeFromCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to proceed with checkout');
      return;
    }
    Alert.alert('Coming Soon', 'Checkout functionality will be available soon!');
  };

  const renderCartItem = ({ item }) => (
    <View style={[styles.cartItem, { backgroundColor: colors.surface }]}>
      <Image
        source={{ uri: item.productId?.images?.[0] || 'https://via.placeholder.com/100' }}
        style={styles.itemImage}
      />
      <View style={styles.itemDetails}>
        <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
          {item.productId?.name || 'Product'}
        </Text>
        <Text style={[styles.itemBrand, { color: colors.textSecondary }]}>
          {item.productId?.brand}
        </Text>
        <Text style={[styles.itemVariant, { color: colors.textSecondary }]}>
          Size: {item.size} {item.color && `| Color: ${item.color}`}
        </Text>
        <Text style={[styles.itemPrice, { color: colors.primary }]}>
          ${((item.productId?.price || 0) * item.quantity).toFixed(2)}
        </Text>
      </View>
      <View style={styles.itemActions}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={[styles.quantityButton, { borderColor: colors.border }]}
            onPress={() => updateQuantity(item._id, item.quantity - 1)}
          >
            <Icon name="minus" size={16} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.quantityText, { color: colors.text }]}>
            {item.quantity}
          </Text>
          <TouchableOpacity
            style={[styles.quantityButton, { borderColor: colors.border }]}
            onPress={() => updateQuantity(item._id, item.quantity + 1)}
          >
            <Icon name="plus" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFromCart(item._id)}
        >
          <Icon name="delete" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (cart.items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Icon name="cart-outline" size={80} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Your Cart is Empty
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Add some items to get started
          </Text>
          <TouchableOpacity
            style={[styles.shopButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Products')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const shippingCost = cart.totalAmount > 100 ? 0 : 15;
  const tax = cart.totalAmount * 0.08;
  const total = cart.totalAmount + shippingCost + tax;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={cart.items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
      />

      {/* Summary */}
      <View style={[styles.summary, { backgroundColor: colors.surface }]}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Subtotal
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            ${cart.totalAmount.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Shipping
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Tax (8%)
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            ${tax.toFixed(2)}
          </Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
          <Text style={[styles.totalValue, { color: colors.primary }]}>
            ${total.toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutButtonText}>
            {isAuthenticated ? 'Proceed to Checkout' : 'Sign In to Checkout'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemBrand: {
    fontSize: 12,
    marginTop: 2,
  },
  itemVariant: {
    fontSize: 12,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  itemActions: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    width: 32,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    padding: 4,
  },
  summary: {
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkoutButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  shopButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CartScreen;
