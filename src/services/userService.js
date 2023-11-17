import bcrypt from "bcryptjs";
import User from "../model/user.js";
import { getErrorMessage, getSuccessMessage } from "../../errors/errorMessages.js";
import Product from "../model/product.js";

async function signIn(req) {
  try {
    const { credential: decoded } = req;
    const email = decoded.providerData[0].email || "No Email";
    const user = await User.findOne({ email });
    if (!decoded || !decoded.uid || !decoded.providerData || !decoded.providerData[0].email) {
      return { message: getErrorMessage(400), status: false, code: 400 }
    }
    if (!user) {
      const userData = createUserFromDecoded(decoded)
      await userData.save()
      return { message: getSuccessMessage(201), status: true, code: 201, token: `firebase ${decoded.stsTokenManager.accessToken}` };
    }
    else if (user) {
      return { message: getSuccessMessage(200), status: true, code: 200, token: `firebase ${decoded.stsTokenManager.accessToken}` };
    }
    return { message: getErrorMessage(400), status: false, code: 400 };
  } catch (err) {
    return { message: getErrorMessage(500), code: 500, err };
  }
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
    updatedUserData.userName? existingUser.userName = updatedUserData.userName : null;
    updatedUserData.description? existingUser.description = updatedUserData.description : null;
    updatedUserData.socialMedia? existingUser.socialMedia = updatedUserData.socialMedia : null;
    updatedUserData.profilePicture? existingUser.profilePicture = updatedUserData.profilePicture : null;

    const updatedUser = await existingUser.save();
    return updatedUser;
  } catch (err) {
    return { message: getErrorMessage(500), code: 500, err };
  }
}

async function userProfile(id, authId) {
  try {
    const userProfileByUid = await User.findOne({ u_id: id }, 'createdAt email userName u_id profilePicture followers following description');
    const userProfileByEmail = await User.findOne({ email: id }, 'createdAt email userName u_id profilePicture followers following description')
    if (!userProfileByUid && !userProfileByEmail) {
      return { message: getErrorMessage(404), status: false, code: 404 };
    }
    let email = userProfileByEmail? userProfileByEmail.email : userProfileByUid.email
    const productsCreated = await Product.find({created_by: email})
    const totalProductsViewed = productsCreated.reduce((accumulator, currentItem) => {
        return accumulator + currentItem.userViews.length;
    }, 0);
    let permissionGranter = false;
    if (authId == id) {
      permissionGranter = true
    }
    return userProfileByEmail ? { message: getSuccessMessage(200), permissionGranter, status: true, code: 200, profile: userProfileByEmail, views: totalProductsViewed } : { message: getSuccessMessage(200), permissionGranter, status: true, code: 200, profile: userProfileByUid, views: totalProductsViewed };
  } catch (err) {
    throw { message: getErrorMessage(500), code: 500, err };
  }
}

async function myProfile(email) {
  try {
    const userProfileByEmail = await User.findOne({ email: email }, 'createdAt userName u_id profilePicture followers following')
    if (!userProfileByEmail) {
      return { message: getErrorMessage(404), status: false, code: 404 };
    }
    return { message: getSuccessMessage(200), status: true, code: 200, myProfile: userProfileByEmail };
  } catch (err) {
    return { message: getErrorMessage(500), code: 500, err };
  }
}

export const resetPassword = async ({ token, password }) => {
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return { message: getErrorMessage(403), status: false, code: 400 };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save();
    return { message: "Password updated Successfully!", status: true }
  } catch (error) {
    console.error(error);
    return { message: getErrorMessage(500), code: 500, status: false };
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
    return { message: getErrorMessage(500), status: false, code: 500 };
  }
}

async function promotedUsers() {
  try {
    const promotedUsers = await User.find({ isPromotionOn: true })
    if (!promotedUsers) {
      return { message: getSuccessMessage(204), status: true, code: 204 };
    }
    return { promotedUsers, message: getErrorMessage(500), status: true, code: 200 }
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
  promotedUsers
};
