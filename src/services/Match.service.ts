import { Match } from "../models/Match.js";
import { UserSkill } from "../models/mappings/UserSkill.js";
import { User } from "../models/User.js";
import type { IMatch, IMatchCandidate } from "../interfaces/Match.js";
import { AppError } from "../utils/AppError.js";
import { HTTPStatusCodes } from "../constants/HttpStatusCodes.js";



function haversineKm(loc1: number[], loc2: number[]): number {
    const lng1 = loc1[0]!;
    const lat1 = loc1[1]!;
    const lng2 = loc2[0]!;
    const lat2 = loc2[1]!;

    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}


const PROFICIENCY_SCORE: Record<string, number> = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
};


async function getCandidates(userId: string,maxDistanceKm = 100,limit = 20,): Promise<IMatchCandidate[]> {

    const existingMatches = await Match.find({
        $or: [{ person1: userId }, { person2: userId }],
    });

    const excludedIds = new Set<string>([userId]);
    for (const m of existingMatches) {
        excludedIds.add(m.person1.toString());
        excludedIds.add(m.person2.toString());
    }


    const mySkills = await UserSkill.find({ userId }).populate<{
        skillId: { _id: string; name: string };
    }>("skillId");

    const mySkillMap = new Map(
        mySkills.map((s) => [s.skillId._id.toString(), s.proficiency]),
    );


    const me = await User.findById(userId).select("lastKnownLocation");
    const myLocation = me?.lastKnownLocation as number[] | null;


    const candidates = await User.find({
        _id: { $nin: Array.from(excludedIds) },
        status: "active",
    }).select("_id name headline bio profilePicture lastKnownLocation");


    const candidateIds = candidates.map((c) => c._id);
    const allCandidateSkills = await UserSkill.find({
        userId: { $in: candidateIds },
    }).populate<{ skillId: { _id: string; name: string } }>("skillId");


    const skillsByUser = new Map<string, typeof allCandidateSkills>();
    for (const skill of allCandidateSkills) {
        const uid = skill.userId.toString();
        if (!skillsByUser.has(uid)) skillsByUser.set(uid, []);
        skillsByUser.get(uid)!.push(skill);
    }


    const scored: IMatchCandidate[] = [];

    for (const candidate of candidates) {
        const candidateLocation = candidate.lastKnownLocation as number[] | null;


        let distanceKm: number | null = null;
        if (myLocation?.length === 2 && candidateLocation?.length === 2) {
        distanceKm = haversineKm(myLocation, candidateLocation);
        if (distanceKm > maxDistanceKm) continue;
        }

        const theirSkills = skillsByUser.get(candidate._id.toString()) ?? [];
        const sharedSkills: string[] = [];
        let skillScore = 0;

        for (const theirSkill of theirSkills) {
        const skillId = theirSkill.skillId._id.toString();
        const skillName = theirSkill.skillId.name;
        if (mySkillMap.has(skillId)) {
            sharedSkills.push(skillName);


            skillScore += 10;


            const myLevel = PROFICIENCY_SCORE[mySkillMap.get(skillId)!] ?? 0;
            const theirLevel = PROFICIENCY_SCORE[theirSkill.proficiency] ?? 0;
            if (myLevel === theirLevel)
            skillScore += 5;
            else skillScore -= Math.abs(myLevel - theirLevel);
        }
        }

        
        const locationScore =
        distanceKm !== null ? Math.max(0, 20 - distanceKm / 5) : 0;

        const totalScore = skillScore + locationScore;

        
        if (sharedSkills.length === 0) continue;

        scored.push({
        user: {
            _id: candidate._id,
            name: candidate.name,
            headline: candidate.headline,
            bio: candidate.bio,
            profilePicture: candidate.profilePicture || null,
            lastKnownLocation: candidateLocation ?? [],
        },
        score: totalScore,
        sharedSkills,
        distanceKm,
        });
    }

    
    return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

async function likeUser(userId: string, targetId: string): Promise<IMatch> {
    if (userId === targetId)
        throw new AppError("Cannot like yourself", HTTPStatusCodes.BAD_REQUEST);

    // 1. FIRST check: Did they already like me?
    const theyLikedMe = await Match.findOne({
        person1: targetId,
        person2: userId,
        status: "pending",
    });

    // If yes, upgrade it to a mutual match immediately!
    if (theyLikedMe) {
        const accepted = await Match.findByIdAndUpdate(
            theyLikedMe._id,
            { status: "accepted" },
            { new: true },
        );
        return accepted!.toObject() as IMatch;
    }

    // 2. SECOND check: Did *I* already interact with them previously?
    const iAlreadyInteracted = await Match.findOne({
        person1: userId,
        person2: targetId,
    });

    if (iAlreadyInteracted) {
        throw new AppError(
            "Already interacted with this user",
            HTTPStatusCodes.CONFLICT,
        );
    }

    // 3. If no past interactions, create a fresh pending like
    const match = await Match.create({
        person1: userId,
        person2: targetId,
        status: "pending",
    });
    
    return match.toObject() as IMatch;
}

async function rejectUser(userId: string, targetId: string): Promise<void> {
    if (userId === targetId)
        throw new AppError("Cannot reject yourself", HTTPStatusCodes.BAD_REQUEST);

    // 1. If they liked me, but I swipe left, update their pending like to rejected
    const theyLikedMe = await Match.findOne({
        person1: targetId,
        person2: userId,
        status: "pending",
    });

    if (theyLikedMe) {
        await Match.findByIdAndUpdate(theyLikedMe._id, { status: "rejected" });
        return;
    }

    // 2. Check if I already interacted with them
    const iAlreadyInteracted = await Match.findOne({
        person1: userId,
        person2: targetId,
    });

    if (iAlreadyInteracted) {
        throw new AppError(
            "Already interacted with this user",
            HTTPStatusCodes.CONFLICT,
        );
    }

    // 3. Create a fresh rejection record
    await Match.create({
        person1: userId,
        person2: targetId,
        status: "rejected",
    });
}
async function getAcceptedMatches(userId: string): Promise<IMatch[]> {
    const matches = await Match.find({
        $or: [{ person1: userId }, { person2: userId }],
        status: "accepted",
    })
        .populate("person1", "name headline profilePicture")
        .populate("person2", "name headline profilePicture");

    return matches.map((m) => m.toObject() as IMatch);
}

async function getPendingLikes(userId: string): Promise<IMatch[]> {
    const matches = await Match.find({
        person2: userId,
        status: "pending",
    }).populate("person1", "name headline profilePicture");

    return matches.map((m) => m.toObject() as IMatch);
}

async function unmatch(userId: string, matchId: string): Promise<void> {
    const match = await Match.findById(matchId);
    if (!match) throw new AppError("Match not found", HTTPStatusCodes.NOT_FOUND);

    const isParticipant =
        match.person1.toString() === userId || match.person2.toString() === userId;

    if (!isParticipant)
        throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);

    await Match.findByIdAndDelete(matchId);
}

export const MatchService = {
    getCandidates,
    likeUser,
    rejectUser,
    getAcceptedMatches,
    getPendingLikes,
    unmatch,
};
