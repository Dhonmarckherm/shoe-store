import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, Shield, Truck } from 'lucide-react';
import { productAPI, recommendationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import Button from '../components/Button';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch featured products
      const featuredRes = await productAPI.getFeatured();
      setFeaturedProducts(featuredRes.data.data);

      // Fetch recommendations if authenticated
      if (isAuthenticated) {
        try {
          const recRes = await recommendationAPI.getRecommendations();
          setRecommendations(recRes.data.data);
        } catch (err) {
          console.error('Failed to fetch recommendations:', err);
        }
      }
    } catch (error) {
      console.error('Failed to fetch home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'AI-Powered',
      description: 'Personalized recommendations based on your preferences',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure Login',
      description: 'Face recognition technology for quick, secure access',
    },
    {
      icon: <Truck className="w-6 h-6" />,
      title: 'Fast Delivery',
      description: 'Free shipping on orders over $100',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Premium Quality',
      description: 'Authentic products from top brands',
    },
  ];

  const categories = [
    { name: 'Running', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', count: 45 },
    { name: 'Casual', image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400', count: 62 },
    { name: 'Sneakers', image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400', count: 38 },
    { name: 'Boots', image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400', count: 24 },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1920')] bg-cover bg-center opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered Shopping Experience</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Step Into the Future of Shoe Shopping
            </h1>
            <p className="text-lg lg:text-xl text-primary-100 mb-8">
              Discover your perfect pair with our AI recommendation engine. 
              Secure face recognition login and personalized picks just for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto !bg-white !text-primary-600 hover:!bg-primary-50">
                  Shop Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              {!isAuthenticated && (
                <Link to="/register">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                    Create Account
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col items-center text-center p-6">
                <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-secondary-50 dark:bg-secondary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
              Shop by Category
            </h2>
            <p className="text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto">
              Browse our wide selection of shoes across different categories
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/products?category=${category.name.toLowerCase()}`}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white mb-1">{category.name}</h3>
                  <p className="text-white/80 text-sm">{category.count} Products</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AI Recommendations Section */}
      {isAuthenticated && recommendations.length > 0 && (
        <section className="py-16 bg-white dark:bg-secondary-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-medium text-primary-600 uppercase tracking-wide">
                    AI Powered
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
                  Recommended for You
                </h2>
              </div>
              <Link to="/products" className="hidden sm:flex items-center text-primary-600 hover:text-primary-700 font-medium">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section className="py-16 bg-secondary-50 dark:bg-secondary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
              Featured Products
            </h2>
            <p className="text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto">
              Handpicked selection of our most popular and highly-rated shoes
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/products">
              <Button size="lg">
                View All Products
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-16 bg-primary-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Experience AI-Powered Shopping?
            </h2>
            <p className="text-primary-100 text-lg mb-8">
              Create an account today and get personalized recommendations, secure face login, and exclusive deals.
            </p>
            <Link to="/register">
              <Button size="lg" variant="secondary" className="!bg-white !text-primary-600 hover:!bg-primary-50">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
