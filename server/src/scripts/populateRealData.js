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
import { Message } from '../models/message.model.js';

dotenv.config();

const categories = [
    { name: 'Digital Art', description: 'Art created using digital tools' },
    { name: 'Sketching', description: 'Pencil and charcoal drawings' },
    { name: 'UI Design', description: 'User interface and experience design' },
    { name: 'Portraits', description: 'Detailed portraits of people and animals' },
    { name: 'Anime', description: 'Japanese-style animation art' },
    { name: 'Logo Design', description: 'Branding and logo creation' },
    { name: 'Landscape', description: 'Scenery and nature paintings' },
    { name: 'Character Design', description: 'Concept art for characters' }
];

const mockArtists = [
    {
        fullName: 'Elena Vance',
        email: 'elena.vance@artisan.com',
        username: 'elena_vance',
        bio: 'Digital illustrator specializing in cyberpunk and futuristic environments. I love neon and high contrast.',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1200&h=400&fit=crop',
        category: 'Digital Art',
        skills: ['Cyberpunk', 'Neon', 'Sci-Fi'],
        location: 'Seattle, WA'
    },
    {
        fullName: 'Jasper Thorne',
        email: 'jasper.thorne@artisan.com',
        username: 'jasper_thorne',
        bio: 'Traditional sketching enthusiast. Capturing the soul through charcoal and graphite.',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1513364775212-60fc82a81171?q=80&w=1200&h=400&fit=crop',
        category: 'Sketching',
        skills: ['Charcoal', 'Graphite', 'Realistic'],
        location: 'London, UK'
    },
    {
        fullName: 'Maya Ito',
        email: 'maya.ito@artisan.com',
        username: 'maya_ito',
        bio: 'Anime and Manga artist. Experienced in both classic style and modern digital rendering.',
        profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1541560052-5e137f229371?q=80&w=1200&h=400&fit=crop',
        category: 'Anime',
        skills: ['Manga', 'Cel-Shading', 'Character Design'],
        location: 'Tokyo, Japan'
    },
    {
        fullName: 'Leo Rossi',
        email: 'leo.rossi@artisan.com',
        username: 'leo_rossi',
        bio: 'UI/UX Designer and Logo expert. Clean, minimal, and impactful designs for modern brands.',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?q=80&w=1200&h=400&fit=crop',
        category: 'UI Design',
        skills: ['Branding', 'Vector Art', 'Minimalism'],
        location: 'Milan, Italy'
    },
    {
        fullName: 'Sarah Jenkins',
        email: 'sarah.jenkins@artisan.com',
        username: 'sarah_jenkins',
        bio: 'Portrait artist focusing on expressive eyes and emotions. I work with oil and acrylic.',
        profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&h=200&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200&h=400&fit=crop',
        category: 'Portraits',
        skills: ['Oil Painting', 'Acrylic', 'Expressive'],
        location: 'New York, USA'
    },
    {
        fullName: 'Wei Chen',
        email: 'wei.chen@artisan.com',
        username: 'wei_chen',
        bio: 'Fine Art Landscape painter. Inspired by the majestic mountains and serene river valleys.',
        profileImage: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&h=200&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&h=400&fit=crop',
        category: 'Landscape',
        skills: ['Watercolor', 'Realism', 'Nature'],
        location: 'Shanghai, China'
    },
    {
        fullName: 'Isabella Gomez',
        email: 'isabella.gomez@artisan.com',
        username: 'isabella_gomez',
        bio: 'Fantasy Character Designer. Bringing mythical creatures and epic heroes to life.',
        profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&h=200&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&h=400&fit=crop',
        category: 'Character Design',
        skills: ['Concept Art', 'Creature Design', 'Fantasy'],
        location: 'Madrid, Spain'
    }
];

const mockClients = [
    {
        fullName: 'David Miller',
        email: 'david.miller@gmail.com',
        username: 'david_miller',
        bio: 'Collector of fine art and digital illustration. Always looking for unique pieces.',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&fit=crop'
    },
    {
        fullName: 'Sophia Wang',
        email: 'sophia.wang@outlook.com',
        username: 'sophia_wang',
        bio: 'App developer looking for custom UI assets and icons.',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&h=200&fit=crop'
    },
    {
        fullName: 'Ethan Hunt',
        email: 'ethan.hunt@mission.com',
        username: 'ethan_hunt',
        bio: 'Business owner interested in branding and logo design.',
        profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&h=200&fit=crop'
    },
    {
        fullName: 'Olivia Blake',
        email: 'olivia.blake@icloud.com',
        username: 'olivia_blake',
        bio: 'Gift shopping for custom portraits of my family and pets.',
        profileImage: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=200&h=200&fit=crop'
    },
    {
        fullName: 'Marc Thompson',
        email: 'marc.thompson@media.com',
        username: 'marc_thompson',
        bio: 'Producer looking for concept artists for a new web series.',
        profileImage: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200&h=200&fit=crop'
    },
    {
        fullName: 'Zoe Kravitz',
        email: 'zoe.kravitz@artfan.com',
        username: 'zoe_kravitz',
        bio: 'Lover of anime and manga art. Just here to support great artists!',
        profileImage: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=200&h=200&fit=crop'
    },
    {
        fullName: 'Kevin Spacey',
        email: 'kevin.spacey@theatre.com',
        username: 'kevin_spacey',
        bio: 'Interested in traditional sketching and charcoal works.',
        profileImage: 'https://images.unsplash.com/photo-1463453091185-61582044d556?q=80&w=200&h=200&fit=crop'
    }
];

const artworks = {
    'Digital Art': [
        { title: 'Neon Night City', desc: 'A vast cyberpunk cityscape with neon signs.', tags: ['city', 'neon', 'cyberpunk'], price: 5000, img: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=800' },
        { title: 'Cyber Warrior', desc: 'Futuristic soldier in heavy armor.', tags: ['character', 'sci-fi', 'armor'], price: 3500, img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800' },
        { title: 'Synthwave Sunset', desc: 'Retro 80s aesthetic landscape.', tags: ['retro', 'sunset', 'synthwave'], price: 2500, img: 'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?q=80&w=800' },
        { title: 'Glitch in the Matrix', desc: 'Abstract digital glitch art.', tags: ['abstract', 'glitch', 'digital'], price: 1500, img: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=800' },
        { title: 'The Android Dream', desc: 'Surreal portrait of an android.', tags: ['surreal', 'android', 'dream'], price: 4000, img: 'https://images.unsplash.com/photo-1615529328331-f8917597711f?q=80&w=800' }
    ],
    'Sketching': [
        { title: 'Old Man Portrait', desc: 'Charcoal drawing highlighting every wrinkle.', tags: ['charcoal', 'portrait', 'realistic'], price: 2000, img: 'https://images.unsplash.com/photo-1576016770956-debb63d92058?q=80&w=800' },
        { title: 'Lonely Tree', desc: 'Pencil sketch of a tree in a field.', tags: ['pencil', 'nature', 'tree'], price: 1000, img: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=800' },
        { title: 'City Motion', desc: 'Fast-paced street sketch.', tags: ['urban', 'sketch', 'pencil'], price: 1500, img: 'https://images.unsplash.com/photo-1513364775212-60fc82a81171?q=80&w=800' },
        { title: 'Anatomy Study', desc: 'Detailed muscular structure sketch.', tags: ['anatomy', 'study', 'academic'], price: 1200, img: 'https://images.unsplash.com/photo-1515405848677-961f9e535ad6?q=80&w=800' },
        { title: 'Still Life with Vase', desc: 'Shading practice with charcoal.', tags: ['stilllife', 'shading', 'charcoal'], price: 800, img: 'https://images.unsplash.com/photo-1579541814924-49fef17c5be5?q=80&w=800' }
    ],
    'Anime': [
        { title: 'School Girl Spirit', desc: 'Ethereal anime girl with spirit wisps.', tags: ['anime', 'spirit', 'fantasy'], price: 3000, img: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?q=80&w=800' },
        { title: 'Mecha Battle', desc: 'Giant robots fighting in space.', tags: ['mecha', 'battle', 'sci-fi'], price: 4500, img: 'https://images.unsplash.com/photo-1560942485-b2a11cc13456?q=80&w=800' },
        { title: 'Cherry Blossom Breeze', desc: 'Traditional anime scene under Sakura trees.', tags: ['sakura', 'peaceful', 'landscape'], price: 2800, img: 'https://images.unsplash.com/photo-1528164344705-47542687990d?q=80&w=800' },
        { title: 'Katana Master', desc: 'Dynamic samurai action pose.', tags: ['samurai', 'action', 'sword'], price: 3500, img: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=800' },
        { title: 'Magical Girl', desc: 'Vibrant transformation scene.', tags: ['magic', 'girl', 'colorful'], price: 3200, img: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=800' }
    ],
    'UI Design': [
        { title: 'Crystal App Dashboard', desc: 'Glassmorphism dashboard design.', tags: ['glassmorphism', 'ui', 'dashboard'], price: 6000, img: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?q=80&w=800' },
        { title: 'Vector Fox Logo', desc: 'Geometric fox branding mascot.', tags: ['logo', 'branding', 'geometric'], price: 5000, img: 'https://images.unsplash.com/photo-1583321500900-82807e458f3c?q=80&w=800' },
        { title: 'Fitness Tracker UI', desc: 'Modern and energetic mobile app UI.', tags: ['mobile', 'fitness', 'app'], price: 4500, img: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=800' },
        { title: 'Travel Website Concept', desc: 'Immersive hotel booking layout.', tags: ['web', 'travel', 'clean'], price: 5500, img: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800' },
        { title: 'Minimal Icon Set', desc: '100+ minimal line icons.', tags: ['icons', 'minimal', 'assets'], price: 3000, img: 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=800' }
    ],
    'Portraits': [
        { title: 'Strength in Silence', desc: 'Oil portrait of a silent monk.', tags: ['oil', 'emotion', 'monk'], price: 4000, img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800' },
        { title: 'The Golden Muse', desc: 'Acrylic piece with gold leaf accents.', tags: ['acrylic', 'gold', 'muse'], price: 5500, img: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=800' },
        { title: 'Native Pride', desc: 'Highly detailed portrait of a chieftain.', tags: ['detail', 'culture', 'portrait'], price: 7000, img: 'https://images.unsplash.com/photo-1554188248-986adbb73be4?q=80&w=800' },
        { title: 'Laughter', desc: 'Expressive sketch of a child laughing.', tags: ['child', 'joy', 'sketch'], price: 2500, img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800' },
        { title: 'Old Soul', desc: 'Monochromatic portrait of an elderly lady.', tags: ['monochrome', 'age', 'wisdom'], price: 3500, img: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=800' }
    ],
    'Landscape': [
        { title: 'Misty Mountains', desc: 'Ethereal view of the Alps in morning fog.', tags: ['nature', 'mountains', 'fog'], price: 4500, img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800' },
        { title: 'Oceanic Serenity', desc: 'Waves crashing against rugged cliffs.', tags: ['ocean', 'cliffs', 'power'], price: 3800, img: 'https://images.unsplash.com/photo-1439405326854-014607f694d7?q=80&w=800' },
        { title: 'Fall Colors', desc: 'A path through a vibrant autumn forest.', tags: ['forest', 'autumn', 'colors'], price: 3200, img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800' },
        { title: 'Tuscan Sunset', desc: 'Warm glow over the rolling hills of Italy.', tags: ['italy', 'hills', 'sunset'], price: 5000, img: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=800' },
        { title: 'Winter Silence', desc: 'Deep snow in a lonely cabin setting.', tags: ['snow', 'cabin', 'winter'], price: 4200, img: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?q=80&w=800' }
    ],
    'Character Design': [
        { title: 'Dragon Knight', desc: 'Heavy armor knight with draconic features.', tags: ['fantasy', 'knight', 'dragon'], price: 5500, img: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=800' },
        { title: 'Forest Dryad', desc: 'Nature spirit blending with the trees.', tags: ['dryad', 'nature', 'spirit'], price: 4000, img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800' },
        { title: 'Cyber Infiltrator', desc: 'Stealth operative with advanced gadgets.', tags: ['cyberpunk', 'stealth', 'tech'], price: 4800, img: 'https://images.unsplash.com/photo-1560942485-b2a11cc13456?q=80&w=800' },
        { title: 'Desert Nomad', desc: 'Traveler adapted to harsh desert winds.', tags: ['desert', 'survival', 'character'], price: 3500, img: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=800' },
        { title: 'Void Weaver', desc: 'Mage controlling dark cosmic energy.', tags: ['mage', 'cosmic', 'void'], price: 6000, img: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=800' }
    ]
};

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for real seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Category.deleteMany({});
        await PortfolioItem.deleteMany({});
        await ArtistProfile.deleteMany({});
        await Post.deleteMany({});
        await CommissionOrder.deleteMany({});
        await Review.deleteMany({});
        await Message.deleteMany({});
        console.log('Cleared existing data.');

        // Seed Categories
        const createdCategories = await Category.insertMany(categories);
        console.log(`Seeded ${createdCategories.length} categories.`);

        const hashedPassword = await bcrypt.hash('password123', 10);

        // Seed Admin
        const adminEmail = process.env.ADMIN_EMAILS?.split(',')[0] || 'admin@artisan.com';
        const adminUser = await User.create({
            fullName: 'Master Admin',
            email: adminEmail,
            username: 'admin',
            password: hashedPassword,
            role: 'admin',
            isSuperAdmin: true,
            profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&h=200&fit=crop'
        });
        console.log('Seeded Admin user.');

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
        console.log(`Seeded ${createdUsers.length} users (artists and clients).`);

        const artists = createdUsers.filter(u => u.role === 'artist');
        const clients = createdUsers.filter(u => u.role === 'client');

        // Seed Artist Profiles and Portfolios
        for (const artist of artists) {
            const artistMock = mockArtists.find(a => a.email === artist.email);
            const category = createdCategories.find(c => c.name === artistMock.category);
            
            await ArtistProfile.create({
                artistId: artist._id,
                bio: artistMock.bio,
                location: artistMock.location,
                categories: [category.name],
                availability: true,
                website: `https://${artist.username}.portfolio.com`,
                instagram: `https://instagram.com/${artist.username}`,
                twitter: `https://twitter.com/${artist.username}`
            });

            const artistArtworks = artworks[category.name] || artworks['Digital Art'];
            await PortfolioItem.create(artistArtworks.map(art => ({
                artistId: artist._id,
                title: art.title,
                description: art.desc,
                mediaUrl: art.img,
                price: art.price,
                categoryId: category._id
            })));
        }
        console.log('Seeded artist profiles and 5 artworks each.');

        // Seed Community Posts (20+) + 3 Admin Posts
        const postContent = [
            "Just finished a new piece! What do you guys think?",
            "Looking for feedback on my latest character design.",
            "Commission slots are finally open! DM for info.",
            "Found this amazing color palette today, so inspiring.",
            "Can't believe how much my art has improved in a year.",
            "Quick sketch during lunch break.",
            "The neon vibes in this city are unreal.",
            "Trying out oil painting for the first time. It's tough!",
            "Any tips for drawing hands? They're my nemesis.",
            "Love seeing all the talent in this community.",
            "Which one is better? Left or Right?",
            "Finally got my project done. Feeling proud.",
            "Art is the only way to run away without leaving home.",
            "Working on something BIG. Stay tuned!",
            "Thank you to everyone who supported my latest drop.",
            "Day 10 of my 30-day art challenge.",
            "Symmetry is overrated. Embrace the chaos.",
            "The lighting today is perfect for photography.",
            "Digital art has come such a long way.",
            "Manga style study. Focus on line weight."
        ];

        const postsToCreate = postContent.map((caption, index) => {
            const author = createdUsers[index % createdUsers.length];
            return {
                author: author._id,
                title: `My Daily Art Update #${index + 1}`,
                body: caption,
                tag: index % 2 === 0 ? "Showcase" : "Discussion",
                image: `https://picsum.photos/seed/${author.username}${index}/800/600`,
                likes: [createdUsers[(index + 1) % createdUsers.length]._id, createdUsers[(index + 2) % createdUsers.length]._id]
            };
        });

        // Add 3 Admin Posts
        postsToCreate.push(
            {
                author: adminUser._id,
                title: "Welcome to Artisan!",
                body: "We are thrilled to have you here. This is a space for artists to showcase their talent and for clients to find the perfect masterpieces. Start exploring today!",
                tag: "Announcement",
                image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=800"
            },
            {
                author: adminUser._id,
                title: "How It Works",
                body: "1. Browse the Discover page for inspiration.\n2. Click on an artist to view their full portfolio.\n3. Send a commission request if you like their style.\n4. Chat directly to finalize the details!",
                tag: "Tutorial",
                image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800"
            },
            {
                author: adminUser._id,
                title: "Community Guidelines",
                body: "Be respectful. Support each other. No plagiarism. Let's keep Artisan a positive and creative environment for everyone.",
                tag: "Policy",
                image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=800"
            }
        );

        await Post.insertMany(postsToCreate);
        console.log(`Seeded ${postsToCreate.length} community posts (including 3 from admin).`);

        // Seed Commission Orders (10+)
        const orderData = [
            { title: 'Cyberpunk Portrait', budget: 4000, status: 'completed' },
            { title: 'Minimalist Logo', budget: 3000, status: 'pending' },
            { title: 'Family Oil Painting', budget: 6000, status: 'accepted' },
            { title: 'Manga Character Sheet', budget: 4500, status: 'completed' },
            { title: 'Landscape for Office', budget: 5000, status: 'pending' },
            { title: 'Pet Charcoal Sketch', budget: 1500, status: 'accepted' },
            { title: 'Portfolio Website Assets', budget: 7000, status: 'completed' },
            { title: 'Fantasy Book Cover', budget: 5500, status: 'pending' },
            { title: 'Abstract Mural Concept', budget: 8000, status: 'accepted' },
            { title: 'Wedding Gift Sketch', budget: 2000, status: 'completed' }
        ];

        const createdOrders = [];
        for (let i = 0; i < orderData.length; i++) {
            const client = clients[i % clients.length];
            const artist = artists[i % artists.length];
            const order = await CommissionOrder.create({
                artistId: artist._id,
                clientId: client._id,
                title: orderData[i].title,
                description: `Requesting a high-quality ${orderData[i].title.toLowerCase()} for personal use.`,
                status: orderData[i].status,
                statusHistory: [{ status: 'pending', updatedBy: client._id }]
            });
            createdOrders.push(order);

            // Seed Reviews for completed orders
            if (order.status === 'completed') {
                await Review.create({
                    clientId: client._id,
                    artistId: artist._id,
                    orderId: order._id,
                    rating: 4 + (i % 2),
                    comment: "Excellent experience. The artist was professional and the work exceeded my expectations!"
                });
            }
        }
        console.log('Seeded 10 commission orders and their reviews.');

        // Seed Chat Threads (5+)
        const chatMessages = [
            { sender: 'client', msg: "Hi! I really love your portfolio. Are you available for a portrait commission?" },
            { sender: 'artist', msg: "Hello! Thank you so much. Yes, I am available. What did you have in mind?" },
            { sender: 'client', msg: "I want a portrait of my cat in a royal outfit. Is that possible?" },
            { sender: 'artist', msg: "That sounds fun! I can definitely do that. My price for such a piece starts at $50." },
            { sender: 'client', msg: "Great! Let's do it. When can you start?" }
        ];

        for (let i = 0; i < 5; i++) {
            const order = createdOrders[i];
            for (const chat of chatMessages) {
                await Message.create({
                    orderId: order._id,
                    senderId: chat.sender === 'client' ? order.clientId : order.artistId,
                    message: chat.msg
                });
            }
        }
        console.log('Seeded 5 message threads (25 messages total).');

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
