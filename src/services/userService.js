import bcrypt from "bcryptjs";
import User from "../model/userModal.js";
import jwt from "jsonwebtoken";
import { getUserErrorMessage, getUserSuccessMessage } from "../../errors/userErrorMessages.js";
import { getErrorMessage } from "../../errors/errorMessages.js";

async function signIn(req) {
  try {
    const { credential: decoded } = req;
    const email = decoded.providerData[0].email || "No Email";
    const user = await User.findOne({ email });
    if (!decoded || !decoded.uid || !decoded.providerData || !decoded.providerData[0].email) {
      return { message: "Something is missing. If error continues contact support.", status: false, code: 404 }
    }
    if (!user) {
      const userData = createUserFromDecoded(decoded)
      await userData.save()
      return { message: getUserSuccessMessage(201), status: true, code: 201, token: `firebase ${decoded.stsTokenManager.accessToken}` };
    }
    else if (user) {
      return { message: getUserSuccessMessage(200), status: true, code: 200, token: `firebase ${decoded.stsTokenManager.accessToken}` };
    }
    return { message: "Invalid request.", status: false, code: 400 };
  } catch (err) {
    throw err;
  }
}

async function verifyUser() {

}

function createUserFromDecoded(decoded) {
  return new User({
    userName: decoded.displayName,
    email: decoded.providerData[0].email || "No Email",
    profilePicture: decoded.photoURL,
    u_id: decoded.uid || decoded.providerData[0].uid,
  });
}

async function updateUser(email, updatedUserData) {
  try {
    const existingUser = await User.findOne({ email });
    // if (existingUser) {
    //   return { message: getUserErrorMessage(404), status: false };
    // }
    existingUser.userName = updatedUserData.userName;
    existingUser.description = updatedUserData.description;
    existingUser.socialMedia = updatedUserData.socialMedia;
    existingUser.profilePicture = updatedUserData.profilePicture;

    const updatedUser = await existingUser.save();
    return updatedUser;
  } catch (err) {
    throw err;
  }
}

async function userProfile(id, authId) {
  try {
    const userProfileByUid = await User.findOne({ u_id: id }, 'createdAt userName u_id profilePicture followers following');
    const userProfileByEmail = await User.findOne({ email: id }, 'createdAt userName u_id profilePicture followers following')
    if (!userProfileByUid && !userProfileByEmail) {
      return { message: getUserErrorMessage(404), status: false, code: 404 };
    }
    let permissionGranter = false;
    if (authId == id) {
      permissionGranter = true
    }
    return userProfileByEmail ? { message: "Successfully fetched info", permissionGranter, status: true, code: 200, profile: userProfileByEmail } : { message: "Successfully fetched info", permissionGranter, status: true, code: 200, profile: userProfileByUid };
  } catch (err) {
    throw { message: getUserErrorMessage(500), code: 500, err };
  }
}

async function myProfile(email) {
  try {
    const userProfileByEmail = await User.findOne({ email: email }, 'createdAt userName u_id profilePicture followers following')
    if (!userProfileByEmail) {
      return { message: getUserErrorMessage(404), status: false, code: 404 };
    }
    return { message: "Successfully fetched info", status: true, code: 200, myProfile: userProfileByEmail };
  } catch (err) {
    return { message: getUserErrorMessage(500), code: 500, err };
  }
}

export const resetPassword = async ({ token, password }) => {
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return { message: 'Invalid or expired token.', status: false, code: 400 };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save();
    return { message: "Password updated Successfully!", status: true }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error.' });
  }
}

async function deleteUserById(_id) {
  try {
    const existingUser = await User.findById(_id);
    if (!existingUser) {
      return false;
    }
    await User.findByIdAndDelete(_id);
    return true;
  } catch (err) {
    return { message: getErrorMessage(500), status: false, code: 500 };
  }
}

async function followUser(follower_email, following_email) {
  try {
    const userToFollow = await User.findOne({ email: following_email });
    const followingUser = await User.findOne({ email: follower_email });

    if (!userToFollow || !followingUser) {
      return { message: getErrorMessage(404), status: false, code: 404 };
    }
    if (userToFollow.email == followingUser.email) return { message: "Nice try, you cant follow yourself :).", status: false, code: 400 };
    if (userToFollow.followers.includes(follower_email) && followingUser.following.includes(following_email)) {
      const indexToRemoveFromfollower = followingUser.following.indexOf(following_email);
      followingUser.following.splice(indexToRemoveFromfollower, 1);
      const indexToRemoveFromFollowing = userToFollow.followers.indexOf(follower_email);
      userToFollow.followers.splice(indexToRemoveFromFollowing, 1);
      await followingUser.save();
      await userToFollow.save();
      return { message: "Unfollow successfull.", status: true, code: 200 };
    }
    followingUser.following.push(following_email);
    userToFollow.followers.push(follower_email);
    await followingUser.save();
    await userToFollow.save();

    return { message: "Follow request successfull", status: true, code: 200 };

  } catch (error) {
    console.log(error, 'error')
    return { message: getErrorMessage(500), status: false, code: 500 };
  }
}

async function promotedUsers() {
  try {
    const promotedUsers = await User.find({ isPromotionOn: true })
    if (!promotedUsers) {
      return { message: getUserSuccessMessage(204), status: true, code: 204 };
    }
    return { promotedUsers, message: "Success", status: true, code: 200 }
  } catch (err) {
    return { message: getErrorMessage(500), status: false, code: 500 };
  }
}

export default {
  signIn,
  updateUser,
  resetPassword,
  userProfile,
  myProfile,
  deleteUserById,
  followUser,
  verifyUser,
  promotedUsers
};
