import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();

  const menuItems = [
    {
      icon: 'account-edit',
      title: 'Edit Profile',
      onPress: () => {},
    },
    {
      icon: 'map-marker',
      title: 'My Addresses',
      onPress: () => {},
    },
    {
      icon: 'heart-outline',
      title: 'Wishlist',
      onPress: () => {},
    },
    {
      icon: 'package-variant',
      title: 'My Orders',
      onPress: () => {},
    },
    {
      icon: isDark ? 'white-balance-sunny' : 'moon-waning-crescent',
      title: isDark ? 'Light Mode' : 'Dark Mode',
      onPress: toggleTheme,
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      onPress: () => {},
    },
  ];

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.notAuthContainer}>
          <Icon name="account-lock" size={80} color={colors.textSecondary} />
          <Text style={[styles.notAuthTitle, { color: colors.text }]}>
            Not Signed In
          </Text>
          <Text style={[styles.notAuthSubtitle, { color: colors.textSecondary }]}>
            Sign in to view your profile and orders
          </Text>
          <TouchableOpacity
            style={[styles.signInButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Auth')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Profile Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        </View>
        <Text style={styles.userName}>{user?.fullName}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        {user?.hasFaceRegistered && (
          <View style={styles.faceBadge}>
            <Icon name="face-recognition" size={14} color="#fff" />
            <Text style={styles.faceBadgeText}>Face ID Enabled</Text>
          </View>
        )}
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, { backgroundColor: colors.surface }]}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <Icon name={item.icon} size={24} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                {item.title}
              </Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.surface }]}
          onPress={logout}
        >
          <View style={styles.menuItemLeft}>
            <Icon name="logout" size={24} color={colors.error} />
            <Text style={[styles.logoutText, { color: colors.error }]}>
              Logout
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 48,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  faceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  faceBadgeText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 6,
  },
  menuContainer: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    marginLeft: 16,
    fontWeight: '600',
  },
  notAuthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  notAuthTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  notAuthSubtitle: {
    fontSize: 16,
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
  },
  signInButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
