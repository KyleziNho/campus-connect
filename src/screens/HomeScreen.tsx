import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Text, Card, Searchbar } from 'react-native-paper';
import { useFirebase } from '../context/FirebaseContext';
import { Product } from '../types';

const HomeScreen = ({ navigation }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { firestore } = useFirebase();

  const loadProducts = async () => {
    try {
      const snapshot = await firestore()
        .collection('products')
        .where('status', '==', 'available')
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();

      const productList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];

      setProducts(productList);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('ProductDetails', { product: item })}
    >
      <Card.Cover source={{ uri: item.images[0] }} />
      <Card.Title
        title={item.title}
        subtitle={`$${item.price.toFixed(2)}`}
      />
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search products"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {loading ? 'Loading products...' : 'No products found'}
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchbar: {
    margin: 16,
  },
  productList: {
    padding: 8,
  },
  card: {
    flex: 1,
    margin: 8,
  },
  emptyText: {
    textAlign: 'center',
    margin: 16,
  },
});

export default HomeScreen; 