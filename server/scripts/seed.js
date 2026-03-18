import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model.js';
import { Category } from '../models/category.model.js';
import { PortfolioItem } from '../models/portfolioItem.model.js';
import { ArtistProfile } from '../models/artistProfile.model.js';
import { Post } from '../models/post.model.js';
import { CommissionOrder } from '../models/commissionOrder.model.js';
import { Review } from '../models/review.model.js';

dotenv.config();

const categories = [
    { name: 'Painting', description: 'Traditional oil, acrylic, and watercolor paintings' },
    { name: 'Digital Art', description: 'Art created using digital tools' },
    { name: 'Photography', description: 'Captured moments and landscapes' },
    { name: 'Sculpture', description: 'Three-dimensional artistic creations' },
    { name: 'Sketching', description: 'Pencil and charcoal drawings' }
];

const mockArtists = [
    {
        fullName: 'Aria Palette',
        email: 'aria@example.com',
        username: 'aria_palette',
        bio: 'Contemporary oil painter focusing on abstract emotions and vibrant landscapes. Based in Pune.',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
        bannerImage: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19',
        category: 'Painting'
    },
    {
        fullName: 'Leo Digitalis',
        email: 'leo@example.com',
        username: 'leo_digital',
        bio: 'Cyberpunk and futuristic illustrator. I love creating detailed urban cityscapes of the future.',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
        bannerImage: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e',
        category: 'Digital Art'
    },
    {
        fullName: 'Sarah Shutter',
        email: 'sarah@example.com',
        username: 'sarah_clicks',
        bio: 'Travel and documentary photographer capturing the essence of street life and nature.',
        profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
        bannerImage: 'https://images.unsplash.com/photo-1554080353-a576cf803bda',
        category: 'Photography'
    },
    {
        fullName: 'Marcus Stone',
        email: 'marcus@example.com',
        username: 'marcus_stone',
        bio: 'Sculptor working with marble and recycled metals. Exploring the intersection of nature and industry.',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
        bannerImage: 'https://images.unsplash.com/photo-1549490349-8643362247b5',
        category: 'Sculpture'
    },
    {
        fullName: 'Elena Trace',
        email: 'elena@example.com',
        username: 'elena_sketch',
        bio: 'Minimalist charcoal artist. I find beauty in simplicity and monochromatic contrasts.',
        profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
        bannerImage: 'https://images.unsplash.com/photo-1513364775212-60fc82a81171',
        category: 'Sketching'
    }
];

const mockClients = [
    {
        fullName: 'Vikram Mehta',
        email: 'vikram@example.com',
        username: 'vikram_m',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e'
    },
    {
        fullName: 'Priya Sharma',
        email: 'priya@example.com',
        username: 'priya_art_lover',
        profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9'
    },
    {
        fullName: 'Rohan Gupta',
        email: 'rohan@example.com',
        username: 'rohan_g',
        profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6'
    }
];

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Category.deleteMany({});
        await PortfolioItem.deleteMany({});
        await ArtistProfile.deleteMany({});
        await Post.deleteMany({});
        await CommissionOrder.deleteMany({});
        await Review.deleteMany({});
        console.log('Cleared existing data.');

        // Seed Categories
        const createdCategories = await Category.insertMany(categories);
        console.log(`Seeded ${createdCategories.length} categories.`);

        const hashedPassword = await bcrypt.hash('password123', 10);

        // Seed Admins
        const adminEmail = process.env.ADMIN_EMAILS?.split(',')[0] || 'admin@example.com';
        await User.create({
            fullName: 'Platform Admin',
            email: adminEmail,
            username: 'admin',
            password: hashedPassword,
            role: 'admin',
            isSuperAdmin: true
        });

        // Seed Artists and Clients
        const usersToCreate = [
            ...mockArtists.map(a => ({
                fullName: a.fullName,
                email: a.email,
                username: a.username,
                password: hashedPassword,
                role: 'artist',
                profileImage: a.profileImage,
                bannerImage: a.bannerImage
            })),
            ...mockClients.map(c => ({
                fullName: c.fullName,
                email: c.email,
                username: c.username,
                password: hashedPassword,
                role: 'client',
                profileImage: c.profileImage
            }))
        ];

        const createdUsers = await User.insertMany(usersToCreate);
        console.log(`Seeded ${createdUsers.length} users.`);

        const artists = createdUsers.filter(u => u.role === 'artist');
        const clients = createdUsers.filter(u => u.role === 'client');

        // Seed Artist Profiles and Portfolio Items
        for (const artist of artists) {
            const artistMockInfo = mockArtists.find(a => a.email === artist.email);
            const category = createdCategories.find(c => c.name === artistMockInfo.category);
            
            await ArtistProfile.create({
                artistId: artist._id,
                bio: artistMockInfo.bio,
                location: 'India',
                categories: [category.name],
                availability: true
            });

            const portfolioImages = {
                'Painting': [
                    'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5',
                    'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9',
                    'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3'
                ],
                'Digital Art': [
                    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
                    'https://images.unsplash.com/photo-1633167606207-d840b5070fc2',
                    'https://images.unsplash.com/photo-1615529328331-f8917597711f'
                ],
                'Photography': [
                    'https://images.unsplash.com/photo-1493612276216-ee3925520721',
                    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05',
                    'https://images.unsplash.com/photo-1501785888041-af3ef285b470'
                ],
                'Sculpture': [
                    'https://images.unsplash.com/photo-1554188248-986adbb73be4',
                    'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7',
                    'https://images.unsplash.com/photo-1561339670-4dab3683017a'
                ],
                'Sketching': [
                    'https://images.unsplash.com/photo-1513364775212-60fc82a81171',
                    'https://images.unsplash.com/photo-1576016770956-debb63d92058',
                    'https://images.unsplash.com/photo-1549490349-8643362247b5'
                ]
            };

            const images = portfolioImages[category.name] || portfolioImages['Painting'];

            await PortfolioItem.create(images.map((img, index) => ({
                artistId: artist._id,
                title: `${category.name} Work #${index + 1}`,
                description: `Beautiful ${category.name.toLowerCase()} piece.`,
                mediaUrl: img,
                price: 2000 + (index * 1500),
                categoryId: category._id
            })));
        }

        console.log('Seeded artist profiles and portfolio items.');

        // Seed Orders and Reviews
        for (let i = 0; i < 3; i++) {
            const client = clients[i % clients.length];
            const artist = artists[i % artists.length];
            
            const order = await CommissionOrder.create({
                artistId: artist._id,
                clientId: client._id,
                title: `Special ${artist.fullName} Commission`,
                description: "I would like a custom piece for my living room.",
                status: 'completed'
            });

            await Review.create({
                clientId: client._id,
                artistId: artist._id,
                orderId: order._id,
                rating: 5,
                comment: `Amazing work! ${artist.fullName} really captured what I was looking for.`
            });
        }
        console.log('Seeded orders and reviews.');

        // Seed Community Posts
        await Post.create([
            {
                author: artists[0]._id,
                title: "Abstract Painting Tips 🎨",
                body: "Focus on the emotion rather than the form. Abstract art is all about the feeling.",
                tag: "Tips",
                image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19"
            },
            {
                author: clients[0]._id,
                title: "Look at this commission!",
                body: "Just received my artwork from Aria. I'm absolutely in love with it!",
                tag: "Showcase",
                image: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d"
            }
        ]);
        console.log('Seeded community posts.');

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
