import mongoose from "mongoose";
import { ArtistProfile } from "../models/artistProfile.model.js";
import { User } from "../models/user.model.js";
import { Review } from "../models/review.model.js";
import { CommissionOrder } from "../models/commissionOrder.model.js";
import { PortfolioItem } from "../models/portfolioItem.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const updateArtistProfile = asyncHandler(async (req, res) => {
    const { bio, categories, location, availability, website, instagram, twitter, startingPrice } = req.body;

    if (req.user.role !== 'artist') {
        throw new ApiError(403, "Only artists can update their artist profile");
    }

    let profile = await ArtistProfile.findOne({ artistId: req.user._id });
    if (!profile) {
        profile = new ArtistProfile({ artistId: req.user._id });
    }

    if (bio !== undefined) profile.bio = bio;
    if (categories !== undefined) {
        profile.categories = Array.isArray(categories) ? categories : [categories];
    }
    if (location !== undefined) profile.location = location;
    if (availability !== undefined) profile.availability = availability === 'true' || availability === true;
    if (website !== undefined) profile.website = website;
    if (instagram !== undefined) profile.instagram = instagram;
    if (twitter !== undefined) profile.twitter = twitter;
    if (startingPrice !== undefined) profile.startingPrice = parseFloat(startingPrice) || null;

    await profile.save();

    const populated = await ArtistProfile.findById(profile._id)
        .populate("artistId", "fullName username profileImage bannerImage email");

    return res.status(200).json(new ApiResponse(200, populated, "Artist profile updated successfully"));
});

const getArtistProfile = asyncHandler(async (req, res) => {
    const { artistId } = req.params;

    const profile = await ArtistProfile.findOne({ artistId })
        .populate("artistId", "fullName username profileImage bannerImage email createdAt");

    if (!profile) throw new ApiError(404, "Artist profile not found");

    // Include portfolio and review stats with the profile
    const [portfolioItems, reviewStats] = await Promise.all([
        PortfolioItem.find({ artistId }).sort({ createdAt: -1 }),
        Review.aggregate([
            { $match: { artistId: new mongoose.Types.ObjectId(artistId) } },
            { $group: { _id: null, avgRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } }
        ])
    ]);

    return res.status(200).json(new ApiResponse(200, {
        ...profile.toObject(),
        portfolio: portfolioItems,
        stats: reviewStats[0] || { avgRating: 0, totalReviews: 0 }
    }, "Artist profile fetched"));
});

const browseArtists = asyncHandler(async (req, res) => {
    const { page = 1, limit = 12, category, location, availability, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (category) query.categories = { $in: [category] };
    if (location) query.location = { $regex: location, $options: "i" };
    if (availability !== undefined) query.availability = availability === "true";

    // Use MongoDB text search when search query is present
    if (search) {
        query.$text = { $search: search };
    }

    const findQuery = ArtistProfile.find(query)
        .populate("artistId", "email fullName username profileImage bannerImage createdAt");

    // Sort by text score relevance if searching, otherwise default sort
    if (search) {
        findQuery.select({ score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } });
    }

    const profiles = await findQuery.skip(skip).limit(parseInt(limit)).lean();
    const total = await ArtistProfile.countDocuments(query);

    // Enrich each profile with rank data
    const enriched = await Promise.all(profiles.map(async (profile) => {
        const artistUserId = profile.artistId?._id;
        if (!artistUserId) return { ...profile, avgRating: 0, reviewCount: 0, completedOrders: 0, portfolioPreview: [] };

        const [reviewStats, completedOrders, portfolioPreview] = await Promise.all([
            Review.aggregate([
                { $match: { artistId: new mongoose.Types.ObjectId(artistUserId) } },
                { $group: { _id: null, avgRating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } }
            ]),
            CommissionOrder.countDocuments({ artistId: artistUserId, status: "completed" }), // Fixed: lowercase
            PortfolioItem.find({ artistId: artistUserId, isAvailable: true }).limit(3).select("mediaUrl title price isAvailable").lean()
        ]);

        const avg = reviewStats[0]?.avgRating ?? 0;
        const rcnt = reviewStats[0]?.reviewCount ?? 0;
        const rankScore = avg * 0.5 + Math.min(rcnt, 50) * 0.3 + Math.min(completedOrders, 100) * 0.2;

        return {
            ...profile,
            avgRating: parseFloat(avg.toFixed(2)),
            reviewCount: rcnt,
            completedOrders,
            rankScore: parseFloat(rankScore.toFixed(3)),
            portfolioPreview
        };
    }));

    // Sort by rank when not using text search
    if (!search) {
        enriched.sort((a, b) => b.rankScore - a.rankScore);
    }

    return res.status(200).json(new ApiResponse(200, {
        profiles: enriched,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit))
    }, "Artists fetched"));
});

export { updateArtistProfile, getArtistProfile, browseArtists };
