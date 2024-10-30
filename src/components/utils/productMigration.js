// utils/productMigration.js
import { db, storage } from '@/config/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';

const existingProducts = [
    {
        id: 1,
        name: "Stussy T-Shirt",
        price: 25,
        category: "clothes",
        collection: "Campus",
        image: "https://media-photos.depop.com/b1/50136875/2056142809_9eba1d7b2d9d4102b9db25ada1f8cabb/P0.jpg"
      },
      {
        id: 2,
        name: "Ralph Lauren Hoodie",
        price: 75.00,
        category: "clothes",
        collection: "City",
        image: "https://media-photos.depop.com/b1/48869976/2276459206_a2d5f0faaa724afdbc777d4d0b55d29f/P0.jpg"
      },
      {
        id: 3,
        name: "Non-stick pan",
        price: 5,
        category: "kitchen",
        collection: "Oldfield Park",
        image: "https://media-photos.depop.com/b1/17540419/1928744315_178e7225eca64265ae53945736bd8767/P0.jpg"
      },
      {
        id: 4,
        name: "Thursday Night Labs Ticket",
        price: 4,
        category: "tickets",
        collection: "Campus",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnNnpCH_94RFwZL8xt5BBoGjAJb2ZLZRjagg&s"
      },
      {
        id: 5,
        name: "Origins Ticket 24th Oct",
        price: 10,
        category: "tickets",
        collection: "City",
        image: "https://www.totalguidetobath.com/images/content/2023-photos/18377_822komedia.jpeg"
      },
      {
        id: 6,
        name: "MacBook Air 2020",
        price: 320,
        category: "electronics",
        collection: "Oldfield Park",
        image: "https://media-photos.depop.com/b1/39749984/2274766780_56524fe5d2904cfa9f97e6d9a46c30ae/P0.jpg"
      },
      {
        id: 7,
        name: "Ralph Lauren Quarter Zip",
        price: 23,
        category: "clothes",
        collection: "City",
        image: "https://images1.vinted.net/t/01_012c1_NMZprFqP4MKuDh4XhTiXG8CU/f800/1729352064.jpeg?s=2376b80d6f397a5814c471f632cebbc12afa9527"
      },
      {
        id: 8,
        name: "NB Fleece",
        price: 12,
        category: "clothes",
        collection: "Oldfield Park",
        image: "https://images1.vinted.net/t/01_0033e_WBjjEZGn4RrQpX5FCVMw8fNL/f800/1730037242.jpeg?s=b286efe5774813274458c826e5b0497134b744d0"
      },
      {
        id: 9,
        name: "Miu Miu Glasses",
        price: 45,
        category: "other",
        collection: "City",
        image: "https://images1.vinted.net/t/04_00155_cH7ZqSYEzivbYMVNeLZNXqh4/f800/1730036753.jpeg?s=25f19d33f556bf8e32f04f503bd012e5a0b2e836"
      },
      {
        id: 10,
        name: "Zara Cardigan",
        price: 20,
        category: "clothes",
        collection: "Oldfield Park",
        image: "https://images1.vinted.net/t/04_01d7d_MfjkznwmiUWnDg3XgEioS7gB/f800/1730037211.jpeg?s=89dc1e069b5b0c112c33734a19678ceb4497e516"
      },
      {
        id: 11,
        name: "Pull & Bear joggers",
        price: 10,
        category: "clothes",
        collection: "Oldfield Park",
        image: "https://images1.vinted.net/t/01_02131_nDoob8VtvSwotepnZUqhEufa/f800/1728824059.jpeg?s=f5146e9bc162fcb4869cf86d1b44ad7637a7712b"
      },
      {
        id: 12,
        name: "Hair Straightener",
        price: 6.40,
        category: "electronics",
        collection: "Oldfield Park",
        image: "https://images1.vinted.net/t/02_00212_cWwfFTFjyKQEu11haf958c3e/f800/1727813359.jpeg?s=ca3d426e5f230dc3623b7f1f3e28bdfe8cd142cb"
      },
      {
        id: 13,
        name: "Airpod Pro Case",
        price: 2,
        category: "other",
        collection: "Campus",
        image: "https://images1.vinted.net/t/03_025cb_ambp8JxEEKB7c93XvcMgeuZz/f800/1729582485.jpeg?s=19dc94974ba2e70ec09fd7e92a0647f6ff82dc89"
      },
      {
        id: 14,
        name: "Apple Watch Series 6",
        price: 100,
        category: "electronics",
        collection: "Oldfield Park",
        image: "https://images1.vinted.net/t/02_01e7f_knDt62GvS2cHGBS8t5msd7kZ/f800/1729720219.jpeg?s=8e54e419b62cd7e8698007487291d0b3239bb6cb"
      },
      {
        id: 15,
        name: "New Balance 2002r Black",
        price: 80,
        category: "clothes",
        collection: "City",
        image: "https://images1.vinted.net/t/04_0085c_Ep61SQ6PdQJkBxJbSj7xtUy6/f800/1729783862.jpeg?s=bc5c48cd96ddb3ceac19d890b84fba82a894ec04"
      },
      {
        id: 16,
        name: "Acne Studios Jeans 32/32",
        price: 135,
        category: "clothes",
        collection: "City",
        image: "https://images1.vinted.net/t/02_01e2f_gLLXq7qy42dTEWHADAyEwM6j/f800/1725997910.jpeg?s=75f93c6f2dc546cf35c5e38e37b0db246cf308cf"
      },
      {
        id: 17,
        name: "Nike Vintage Red Hoodie",
        price: 26,
        category: "clothes",
        collection: "City",
        image: "https://images1.vinted.net/t/02_007c2_VeemhjfkpvBLzWXMFodAAUsG/f800/1728730088.jpeg?s=dcdf8a31f40563cb6a82d207417235a781b93138"
      },
      {
        id: 18,
        name: "Patagonia Coat",
        price: 68,
        category: "clothes",
        collection: "Oldfield Park",
        image: "https://images1.vinted.net/t/02_01014_Xf3vDoeF25bdtoPCeegw9sLA/f800/1729591854.jpeg?s=9e6db7527b817d1ce0df9a57dda876e317981999"
      },
      {
        id: 19,
        name: "Airpod Max",
        price: 230,
        category: "electronics",
        collection: "Campus",
        image: "https://images1.vinted.net/t/04_02164_GPKoNgyaUnAJu6io27tBW8cG/f800/1730026842.jpeg?s=253260ba86179d5e24b21bc8cfc87f9565338ee7"
      },
      {
        id: 20,
        name: "Burberry Coat L",
        price: 620,
        category: "clothes",
        collection: "City",
        image: "https://images1.vinted.net/t/02_01972_bjwriWW8JV9HWVNt8E5omqXb/f800/1729179350.jpeg?s=6fc51b0f1206764283e74648f8c48e048481fc19"
      }
    ];

// utils/productMigration.js

export async function migrateProducts(userId, userEmail, userName) {
    for (const product of existingProducts) {
      try {
        // Get the download URL from Firebase Storage
        const storageRef = ref(storage, `products/${userId}/${product.storageFileName}`);
        const imageUrl = await getDownloadURL(storageRef);
  
        // Create product document in Firestore
        const productData = {
          name: product.name,
          price: product.price,
          category: product.category,
          collection: product.collection,
          description: product.description,
          imageUrl: imageUrl,
          userId: userId,
          userEmail: userEmail,
          userName: userName,
          status: 'active',
          views: Math.floor(Math.random() * 100),
          createdAt: new Date().toISOString()
        };
  
        await addDoc(collection(db, 'products'), productData);
        console.log(`Migrated product: ${product.name}`);
      } catch (error) {
        console.error(`Error migrating product ${product.name}:`, error);
      }
    }
  }