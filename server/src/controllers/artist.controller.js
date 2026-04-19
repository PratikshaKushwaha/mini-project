import { User } from "../models/user.model.js";
import { ArtistProfile } from "../models/artistProfile.model.js";
import { PortfolioItem } from "../models/portfolioItem.model.js";
import { Review } from "../models/review.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * @description Updates the detailed artist profile for the authenticated artist.
 * @route POST /api/v1/artists/profile
 * @access Restricted (Artist Only)
 */
export const updateArtistProfile = asyncHandler(async (req, res) => {
    const { bio, categories, startingPrice, experience, location, socialLinks } = req.body;

    let profile = await ArtistProfile.findOne({ artistId: req.user._id });

    if (profile) {
        profile.bio = bio;
        profile.categories = categories;
        profile.startingPrice = startingPrice;
        profile.experience = experience;
        profile.location = location;
        profile.socialLinks = socialLinks;
        await profile.save();
    } else {
        profile = await ArtistProfile.create({
            artistId: req.user._id,
            bio,
            categories,
            startingPrice,
            experience,
            location,
            socialLinks
        });
    }

    return res.status(200).json(new ApiResponse(200, profile, "Artist profile updated"));
});

/**
 * @description Retrieves a full artist profile including portfolio and review stats.
 * @route GET /api/v1/artists/:artistId
 * @access Public
 */
export const getArtistProfile = asyncHandler(async (req, res) => {
    const { artistId } = req.params;

    const artist = await User.findById(artistId).select("-password -refreshToken");
    if (!artist) throw new ApiError(404, "Artist not found");

    const profile = await ArtistProfile.findOne({ artistId });
    const portfolio = await PortfolioItem.find({ artistId }).sort({ createdAt: -1 });
    
    /** Aggregate review stats */
    const reviews = await Review.find({ artistId });
    const rating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0;

    return res.status(200).json(new ApiResponse(200, {
        artist,
        profile,
        portfolio,
        stats: {
            rating: Number(rating),
            reviewCount: reviews.length,
            completedOrders: 0 // In a real app, count from CommissionOrder
        }
    }, "Artist profile fetched"));
});

/**
 * @description Dynamic artist lookup with text search and category/location filters.
 * @route GET /api/v1/artists
 * @access Public
 */
export const getArtists = asyncHandler(async (req, res) => {
    const { search, category, location, minPrice, maxPrice } = req.query;
    const query = {};

    if (search) {
        query.$text = { $search: search };
    }

    if (category) query.categories = category;
    if (location) query.location = new RegExp(location, 'i');
    
    if (minPrice || maxPrice) {
        query.startingPrice = {};
        if (minPrice) query.startingPrice.$gte = Number(minPrice);
        if (maxPrice) query.startingPrice.$lte = Number(maxPrice);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const artists = await ArtistProfile.find(query)
        .populate("artistId", "fullName username profileImage bannerImage email")
        .sort(search ? { score: { $meta: "textScore" } } : { createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await ArtistProfile.countDocuments(query);

    return res.status(200).json(new ApiResponse(200, {
        profiles: artists,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalResults: total
    }, "Artists fetched successfully"));
});
