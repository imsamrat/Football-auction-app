const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const config = require('../config');
const Player = require('../models/Player');
const Bidder = require('../models/Bidder');
const Admin = require('../models/Admin');
const Settings = require('../models/Settings');
const Auction = require('../models/Auction');
const AuctionResult = require('../models/AuctionResult');
const Bid = require('../models/Bid');

const players = [
  {
    playerNumber: 9,
    name: 'Rakibul Hasan',
    position: 'STRIKER',
    division: 'Zipper Division',
    basePrice: 3000,
    matches: 18,
    goals: 22,
    assists: 7,
    rating: 8.7,
    auctionOrder: 1,
  },
  {
    playerNumber: 10,
    name: 'Arif Hossain',
    position: 'MIDFIELDER',
    division: 'Champion Division',
    basePrice: 4000,
    matches: 24,
    goals: 15,
    assists: 18,
    rating: 8.9,
    auctionOrder: 2,
  },
  {
    playerNumber: 7,
    name: 'Tanvir Ahmed',
    position: 'WINGER',
    division: 'Star Division',
    basePrice: 2500,
    matches: 20,
    goals: 12,
    assists: 14,
    rating: 8.2,
    auctionOrder: 3,
  },
  {
    playerNumber: 5,
    name: 'Mehedi Hasan',
    position: 'DEFENDER',
    division: 'Shield Division',
    basePrice: 2000,
    matches: 22,
    goals: 3,
    assists: 5,
    rating: 7.8,
    auctionOrder: 4,
  },
  {
    playerNumber: 8,
    name: 'Sakib Khan',
    position: 'MIDFIELDER',
    division: 'Zipper Division',
    basePrice: 3500,
    matches: 19,
    goals: 10,
    assists: 12,
    rating: 8.4,
    auctionOrder: 5,
  },
  {
    playerNumber: 1,
    name: 'Imran Hossain',
    position: 'GOALKEEPER',
    division: 'Shield Division',
    basePrice: 2000,
    matches: 25,
    goals: 0,
    assists: 2,
    rating: 8.1,
    auctionOrder: 6,
  },
  {
    playerNumber: 11,
    name: 'Nazmul Islam',
    position: 'FORWARD',
    division: 'Champion Division',
    basePrice: 3000,
    matches: 16,
    goals: 18,
    assists: 6,
    rating: 8.5,
    auctionOrder: 7,
  },
  {
    playerNumber: 3,
    name: 'Jubayer Rahman',
    position: 'DEFENDER',
    division: 'Star Division',
    basePrice: 1500,
    matches: 21,
    goals: 2,
    assists: 4,
    rating: 7.5,
    auctionOrder: 8,
  },
  {
    playerNumber: 6,
    name: 'Fahim Chowdhury',
    position: 'MIDFIELDER',
    division: 'Zipper Division',
    basePrice: 2500,
    matches: 17,
    goals: 8,
    assists: 11,
    rating: 7.9,
    auctionOrder: 9,
  },
  {
    playerNumber: 4,
    name: 'Sazzad Hossain',
    position: 'DEFENDER',
    division: 'Champion Division',
    basePrice: 2000,
    matches: 23,
    goals: 4,
    assists: 3,
    rating: 7.7,
    auctionOrder: 10,
  },
];

const bidders = [
  {
    name: 'Rahim Ahmed',
    bidderNumber: 1,
    team: 'Tigers FC',
    password: '1234',
    budget: 100000,
    remainingBudget: 100000,
  },
  {
    name: 'Karim Hasan',
    bidderNumber: 2,
    team: 'Eagles United',
    password: '1234',
    budget: 80000,
    remainingBudget: 80000,
  },
  {
    name: 'Tanvir Khan',
    bidderNumber: 3,
    team: 'Royal Strikers',
    password: '1234',
    budget: 120000,
    remainingBudget: 120000,
  },
  {
    name: 'Saiful Islam',
    bidderNumber: 4,
    team: 'Phoenix Warriors',
    password: '1234',
    budget: 90000,
    remainingBudget: 90000,
  },
  {
    name: 'Mahfuz Rahman',
    bidderNumber: 5,
    team: 'Storm Blazers',
    password: '1234',
    budget: 110000,
    remainingBudget: 110000,
  },
];

const seedData = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Player.deleteMany({}),
      Bidder.deleteMany({}),
      Admin.deleteMany({}),
      Settings.deleteMany({}),
      Auction.deleteMany({}),
      AuctionResult.deleteMany({}),
      Bid.deleteMany({}),
    ]);
    console.log('🗑️ Cleared existing data');

    // Create admin
    await Admin.create({
      username: config.adminUsername,
      password: config.adminPassword,
    });
    console.log('👤 Admin created (username: admin, password: admin123)');

    // Create players
    await Player.insertMany(players);
    console.log(`⚽ ${players.length} players created`);

    // Create bidders (need to use save() for password hashing)
    for (const bidderData of bidders) {
      await Bidder.create(bidderData);
    }
    console.log(`🏷️ ${bidders.length} bidders created`);

    // Create default settings
    await Settings.create({
      auctionDuration: 30,
      bidIncrement: 500,
      bidExtensionEnabled: false,
      bidExtensionTime: 5,
      bidExtensionThreshold: 5,
      autoAuction: false,
      autoAuctionDelay: 5,
      soundEnabled: true,
      bidSound: true,
      soldSound: true,
    });
    console.log('⚙️ Default settings created');

    console.log('\n✅ Seed data created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin: username=admin, password=admin123');
    console.log('   Bidders: bidderNumber=1-5, password=1234');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
