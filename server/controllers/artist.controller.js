import mongoose from "mongoose";
import { ArtistProfile } from "../models/artistProfile.model.js";
import { User } from "../models/user.model.js";
import { Review } from "../models/review.model.js";
import { CommissionOrder } from "../models/commissionOrder.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

let updateArtistProfile = asyncHandler(async (req, res) => {
    const { bio, categories, location, availability, profileImage, website, instagram, twitter } = req.body;

    if (req.user.role !== 'artist') {
        throw new ApiError(403, "Only artists can update their artist profile");
    }

    let profile = await ArtistProfile.findOne({ artistId: req.user._id });

    if (!profile) {
        profile = new ArtistProfile({ artistId: req.user._id });
    }

    if (bio !== undefined) profile.bio = bio;
    if (categories !== undefined) profile.categories = categories;
    if (location !== undefined) profile.location = location;
    if (availability !== undefined) profile.availability = availability;
    if (profileImage !== undefined) profile.profileImage = profileImage;
    if (website !== undefined) profile.website = website;
    if (instagram !== undefined) profile.instagram = instagram;
    if (twitter !== undefined) profile.twitter = twitter;

    await profile.save();

    return res.status(200).json(new ApiResponse(200, profile, "Artist profile updated successfully"));
});

let getArtistProfile = asyncHandler(async (req, res) => {
    const { artistId } = req.params;

    const profile = await ArtistProfile.findOne({ artistId }).populate("artistId", "email");

    if (!profile) {
        throw new ApiError(404, "Artist profile not found");
    }

    return res.status(200).json(new ApiResponse(200, profile, "Artist Profile fetched successfully"));
});

let browseArtists = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, category, location, availability, search } = req.query;

    const query = {};

    if (category) query.categories = { $in: [category] };
    if (location) query.location = { $regex: location, $options: "i" };
    if (availability !== undefined) query.availability = availability === "true";

    // Text search across bio and categories
    if (search) {
        const regex = new RegExp(search, "i");
        query.$or = [
            { bio: regex },
            { categories: regex },
            { location: regex },
        ];
    }

    const profiles = await ArtistProfile.find(query)
        .populate("artistId", "email fullName username profileImage bannerImage dob")
        .lean();

    // ── Rank each profile ────────────────────────────────────────────────────
    // For each artist, fetch their review stats and completed order count
    const ranked = await Promise.all(
        profiles.map(async (profile) => {
            const artistUserId = profile.artistId?._id;

            if (!artistUserId) {
                return {
                    ...profile,
                    avgRating: 5.0,
                    reviewCount: 0,
                    completedOrders: 0,
                    rankScore: 0,
                };
            }

            const [reviewStats, completedOrders] = await Promise.all([
                Review.aggregate([
                    { $match: { artistId: new mongoose.Types.ObjectId(artistUserId) } },
                    { $group: { _id: null, avgRating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } },
                ]),
                CommissionOrder.countDocuments({ artistId: artistUserId, status: "Completed" }),
            ]);

            const avg   = reviewStats[0]?.avgRating  ?? 0;
            const rcnt  = reviewStats[0]?.reviewCount ?? 0;

            // Weighted rank: rating carries most weight, then reviews, then orders
            const rankScore = avg * 0.5 + Math.min(rcnt, 50) * 0.3 + Math.min(completedOrders, 100) * 0.2;

            return {
                ...profile,
                avgRating: parseFloat(avg.toFixed(2)),
                reviewCount: rcnt,
                completedOrders,
                rankScore: parseFloat(rankScore.toFixed(3)),
            };
        })
    );

    // Sort by rank score descending
    ranked.sort((a, b) => b.rankScore - a.rankScore);

    const count = await ArtistProfile.countDocuments(query);

    return res.status(200).json(new ApiResponse(200, {
        data: ranked,
        total: count
    }, "Artists fetched successfully"));
});

export { updateArtistProfile, getArtistProfile, browseArtists };

