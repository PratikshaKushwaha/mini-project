import { ArtistProfile } from "../models/artistProfile.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const updateArtistProfile = asyncHandler(async (req, res) => {
    const { bio, categories, location, availability, profileImage, website, instagram, twitter } = req.body;

    // The auth middleware gives us req.user
    if (req.user.role !== 'artist') {
        throw new ApiError(403, "Only artists can update their artist profile");
    }

    let profile = await ArtistProfile.findOne({ artistId: req.user._id });

    if (!profile) {
        // Create if it somehow doesn't exist
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

const getArtistProfile = asyncHandler(async (req, res) => {
    const { artistId } = req.params;

    const profile = await ArtistProfile.findOne({ artistId }).populate("artistId", "email");

    if (!profile) {
        throw new ApiError(404, "Artist profile not found");
    }

    return res.status(200).json(new ApiResponse(200, profile, "Artist Profile fetched successfully"));
});

const browseArtists = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, category, location, availability } = req.query;

    const query = {};

    if (category) {
        query.categories = { $in: [category] };
    }
    if (location) {
        query.location = { $regex: location, $options: "i" };
    }
    if (availability !== undefined) {
        query.availability = availability === 'true';
    }

    const profiles = await ArtistProfile.find(query)
        .populate("artistId", "email")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

    const count = await ArtistProfile.countDocuments(query);

    return res.status(200).json(new ApiResponse(200, {
        profiles,
        totalPages: Math.ceil(count / limit),
        currentPage: page
    }, "Artists fetched successfully"));
});

export {
    updateArtistProfile,
    getArtistProfile,
    browseArtists
};
