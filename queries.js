// queries.js - MongoDB queries for PLP Bookstore


const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'plp_bookstore';
const collectionName = 'books';

async function runQueries() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB ');

    const db = client.db(dbName);
    const books = db.collection(collectionName);

    //Basic CRUD Operations 

    // Find all books in a specific genre-i hve used the fiction genre for this as a sample
    const fictionBooks = await books.find({ genre: 'Fiction' }).toArray();
    console.log('\nFiction books:', fictionBooks);

    // Find books published after a certain year-here i have used 2000
    const recentBooks = await books.find({ published_year: { $gt: 2000 } }).toArray();
    console.log('\nBooks published after 2000:', recentBooks);

    // Find books by a specific author-orwell as my sampl author
    const orwellBooks = await books.find({ author: 'George Orwell' }).toArray();
    console.log('\nBooks by George Orwell:', orwellBooks);

    // Update the price of a specific book- 1984 is my sample for the title here
    const updateResult = await books.updateOne(
      { title: '1984' },
      { $set: { price: 4.99 } }
    );
    console.log('\nUpdated 1984 price:', updateResult.modifiedCount);

    // Delete a book by its title- deleted moby dick as a sample to be deleted so there are only 11 documents remaining
    const deleteResult = await books.deleteOne({ title: 'Moby Dick' });
    console.log('\nDeleted Moby Dick:', deleteResult.deletedCount);

   
    // Find books in stock and published after 2010
    const inStockRecent = await books.find({
      in_stock: true,
      published_year: { $gt: 2010 }
    }).toArray();
    console.log('\nIn stock & published after 2010:', inStockRecent);

    //  return only title, author, price
    const projectionExample = await books.find(
      {},
      { projection: { title: 1, author: 1, price: 1, _id: 0 } }
    ).toArray();
    console.log('\nProjection (title, author, price):', projectionExample);

    // Sorting: ascending
    const priceAsc = await books.find().sort({ price: 1 }).toArray();
    console.log('\nBooks sorted by price ascending:', priceAsc);

    // Sorting: descending
    const priceDesc = await books.find().sort({ price: -1 }).toArray();
    console.log('\nBooks sorted by price descending:', priceDesc);

    // Pagination (5 per page)
    const page1 = await books.find().limit(5).toArray();
    const page2 = await books.find().skip(5).limit(5).toArray();
    console.log('\nPage 1:', page1);
    console.log('\nPage 2:', page2);


    // Average price by genre
    const avgPriceByGenre = await books.aggregate([
      { $group: { _id: '$genre', avgPrice: { $avg: '$price' } } }
    ]).toArray();
    console.log('\nAverage price by genre:', avgPriceByGenre);

    // Author with most books
    const mostBooksByAuthor = await books.aggregate([
      { $group: { _id: '$author', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]).toArray();
    console.log('\nAuthor with most books:', mostBooksByAuthor);

    // Group by decade
    const booksByDecade = await books.aggregate([
      {
        $group: {
          _id: { $subtract: [ { $divide: ['$published_year', 10] }, { $mod: [ { $divide: ['$published_year', 10] }, 1 ] } ] },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();
    console.log('\nBooks grouped by decade:', booksByDecade);

    

    // Created index on the title
    await books.createIndex({ title: 1 });
    console.log('\nIndex created on title');

    // Compounded index on author + published_year
    await books.createIndex({ author: 1, published_year: 1 });
    console.log('Compound index created on author + published_year');

    // Use explain() to check index usage
    const explainResult = await books.find({ title: '1984' }).explain('executionStats');
    console.log('\nExplain result for title search:', explainResult.executionStats);

  } catch (err) {
    console.error('Error running queries:', err);
  } finally {
    await client.close();
    console.log('\nConnection closed');
  }
}

runQueries();
