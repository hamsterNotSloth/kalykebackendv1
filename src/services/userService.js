import bcrypt from "bcryptjs";
import User from "../model/user.js";
import { getErrorMessage, getSuccessMessage } from "../../errors/errorMessages.js";
import Product from "../model/product.js";
import { db } from "../../config/firebase/firebase.js";
import { v4 as uuidv4 } from 'uuid';
import stripe from 'stripe';
const stripeInstance = stripe('sk_test_51OI4miLzxkeRIY0ySCCTWfE931dpYKJoi1wtWVVLAAXxMOuGueBBTyoTMxTnOv1jeWhU88Iu2N7PoGfXDdmObKY700i1ZzRIRM')

async function signIn(req) {
  try {
    const { credential: decoded } = req;
    if (!decoded || !decoded.uid || !decoded.providerData || !decoded.providerData[0] || !decoded.providerData[0].email) {
      return { message: getErrorMessage(400), status: false, code: 400, decoded };
    }

    const email = decoded.providerData[0].email || "No Email";

    const userQuery = await db.collection('users').where('email', '==', email).get();

    if (userQuery.empty) {
      const userData = createUserFromDecoded(decoded);
      await db.collection('users').doc(decoded.uid).set(userData);
      const user = await stripeInstance.accounts.create({
        type: 'express',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      await saveUserIdInFirestore(decoded.uid, user.id);
      return { message: getSuccessMessage(201), status: true, code: 201, token: `firebase ${decoded.stsTokenManager.accessToken}` };
    } else {
      return { message: getSuccessMessage(200), status: true, code: 200, token: `firebase ${decoded.stsTokenManager.accessToken}` };
    }
  } catch (err) {
    return { message: getErrorMessage(500), code: 500, err };
  }
}

async function saveUserIdInFirestore(accountId, stripeUserId) {
  const userRef = db.collection('users').doc(accountId);
  await userRef.set({
    stripeUserId: stripeUserId,
  }, { merge: true });

};

function createUserFromDecoded(decoded) {
  return {
    userName: decoded.displayName,
    email: decoded.providerData[0].email || "No Email",
    profilePicture: decoded.photoURL,
    u_id: decoded.uid || decoded.providerData[0].uid,
    _id: uuidv4(),
    createdAt: Date.now()
  };
}

async function userProfile(id, authId) {
  try {
    const userProfileByUidQuery = await db.collection('users').where('u_id', '==', id).get();
    const userProfileByEmailQuery = await db.collection('users').where('email', '==', id).get();

    let userProfile;

    if (!userProfileByUidQuery.empty) {
      userProfile = userProfileByUidQuery.docs[0].data();
    } else if (!userProfileByEmailQuery.empty) {
      userProfile = userProfileByEmailQuery.docs[0].data();
    }
    if (!userProfile) {
      return { message: getErrorMessage(404), status: false, code: 404 };
    }

    const productsCreatedQuery = await db.collection('products').where('created_by', '==', userProfile.email).get();
    const productsCreated = productsCreatedQuery.docs.map(doc => doc.data());
    const totalProductsViewed = productsCreated.reduce((accumulator, currentItem) => {
      if (currentItem.userViews) {
        return accumulator + currentItem.userViews.length;
      } else {
        return accumulator;
      }
    }, 0);

    const totalDownloads = productsCreated.reduce((accumulator, currentItem) => {
      if (currentItem.purchaseHistory) {
        return accumulator + currentItem.purchaseHistory.length;
      } else {
        return accumulator;
      }
    }, 0);

    const totalComments = productsCreated.reduce((accumulator, currentItem) => {
      if (currentItem.commentsLength != null) {
        return accumulator + currentItem.commentsLength;
      } else {
        return accumulator;
      }
    }, 0);

    let permissionGranter = false;
    if (authId == id) {
      permissionGranter = true;
    }

    return {
      message: getSuccessMessage(200),
      permissionGranter,
      totalComments: totalComments,
      totalDownloads: totalDownloads,
      status: true,
      code: 200,
      profile: userProfile,
      views: totalProductsViewed,
    };
  } catch (err) {
    throw { message: getErrorMessage(500), code: 500, err };
  }
}

async function updateUser(email, updatedUserData) {
  try {
    const userQuery = await db.collection('users').where('email', '==', email).get();
    const productsCollection = db.collection('products');
    console.log(updatedUserData,'updatedUserData')
    const querySnapshot = await productsCollection.where('created_by', '==', email).get();
    if (userQuery.empty) {
      return { message: getErrorMessage(404), status: false, code: 404 };
    }

    const userSnapshot = userQuery.docs[0];

    const existingUser = userSnapshot.data();
    const batch = db.batch();
    if (updatedUserData.userName) {
      existingUser.userName = updatedUserData.userName
      querySnapshot.forEach(doc => {
        const productRef = productsCollection.doc(doc.id);
        batch.update(productRef, { creator_name: updatedUserData.userName });
      });
    };
    if (updatedUserData.profilePicture) {
      existingUser.profilePicture = updatedUserData.profilePicture
      querySnapshot.forEach(doc => {
        const productRef = productsCollection.doc(doc.id);
        batch.update(productRef, { profileImg: updatedUserData.profilePicture });
      });
    };
    if (updatedUserData.description) existingUser.description = updatedUserData.description;
    if (updatedUserData.socialMedia) existingUser.socialMedia = updatedUserData.socialMedia;


    // Commit the batch update
    await batch.commit();
    await userSnapshot.ref.set(existingUser);

    return { message: getSuccessMessage(201), status: true, code: 201, updatedUser: existingUser };
  } catch (err) {
    return { message: getErrorMessage(500), code: 500, err };
  }
}

async function myProfile(email) {
  try {
    const userProfileByEmailQuery = await db.collection('users').where('email', '==', email).get();

    if (userProfileByEmailQuery.empty) {
      return { message: getErrorMessage(404), status: false, code: 404 };
    }

    const userProfile = userProfileByEmailQuery.docs[0].data();

    return { message: getSuccessMessage(200), status: true, code: 200, myProfile: userProfile };
  } catch (err) {
    return { message: getErrorMessage(500), code: 500, err };
  }
}

// export const resetPassword = async ({ token, password }) => {
//   try {
//     const user = await User.findOne({
//       resetToken: token,
//       resetTokenExpiration: { $gt: Date.now() },
//     });

//     if (!user) {
//       return { message: getErrorMessage(403), status: false, code: 400 };
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     user.password = hashedPassword;
//     user.resetToken = null;
//     user.resetTokenExpiration = null;
//     await user.save();
//     return { message: "Password updated Successfully!", status: true }
//   } catch (error) {
//     console.error(error);
//     return { message: getErrorMessage(500), code: 500, status: false };
//   }
// }

async function followUser(follower_email, following_email) {
  try {
    const usersRef = db.collection('users');

    // Use where clause to find both users
    const followerSnapshot = await usersRef.where('email', '==', follower_email).get();
    const followingSnapshot = await usersRef.where('email', '==', following_email).get();

    if (followerSnapshot.empty || followingSnapshot.empty) {
      return { message: getErrorMessage(404), status: false, code: 404 };
    }

    const followerDoc = followerSnapshot.docs[0];
    const followingDoc = followingSnapshot.docs[0];

    if (follower_email === following_email) {
      return { message: "Nice try, you can't follow yourself :).", status: false, code: 400 };
    }

    const followerData = followerDoc.data();
    const followingData = followingDoc.data();

    // Ensure the 'followers' and 'following' properties exist and initialize them if not
    if (!followerData.following) {
      await usersRef.doc(followerDoc.id).update({ following: [], followingCount: 0 });
    }

    if (!followingData.followers) {
      await usersRef.doc(followingDoc.id).update({ followers: [], followersCount: 0 });
    }

    const isFollowing = (followingData.followers || []).includes(follower_email);
    const isFollower = (followerData.following || []).includes(following_email);

    if (isFollowing && isFollower) {
      // Unfollow
      const updatedFollowing = (followingData.followers || []).filter(email => email !== follower_email);
      const updatedFollower = (followerData.following || []).filter(email => email !== following_email);

      await usersRef.doc(followerDoc.id).update({ following: updatedFollower, followingCount: updatedFollower.length });
      await usersRef.doc(followingDoc.id).update({ followers: updatedFollowing, followersCount: updatedFollowing.length });

      return { message: "Unfollow successful.", status: true, code: 200 };
    }

    // Follow
    await usersRef.doc(followerDoc.id).update({ following: [...(followerData.following || []), following_email], followingCount: (followerData.following || []).length + 1 });
    await usersRef.doc(followingDoc.id).update({ followers: [...(followingData.followers || []), follower_email], followersCount: (followingData.followers || []).length + 1 });

    return { message: "Follow request successful.", status: true, code: 200 };

  } catch (error) {
    console.error(error);
    return { message: getErrorMessage(500), status: false, code: 500 };
  }
}

async function promotedUsers() {
  try {
    const promotedUsers = await User.find({ isPromotionOn: true })
    if (!promotedUsers) {
      return { message: getSuccessMessage(204), status: true, code: 204 };
    }
    return { promotedUsers, message: getErrorMessage(200), status: true, code: 200 }
  } catch (err) {
    return { message: getErrorMessage(500), status: false, code: 500 };
  }
}

async function wishList(data) {
  const { productId, userEmail } = data;

  try {
    const userRef = db.collection('users').where('email', '==', userEmail);
    const userSnapshot = await userRef.get();

    if (userSnapshot.empty) {
      return { message: 'User not found', status: false, code: 404 };
    }

    const userDoc = userSnapshot.docs[0];

    const productRef = db.collection('products').where('_id', '==', productId);
    const productSnapshot = await productRef.get();

    if (productSnapshot.empty) {
      return { message: 'Product not found', status: false, code: 404 };
    }

    const productDoc = productSnapshot.docs[0];

    const userWishlist = userDoc.data().wishlist || [];
    const productWishlist = productDoc.data().wishlist || [];

    if (userWishlist.includes(productId)) {
      const updatedUserWishlist = userWishlist.filter((id) => id !== productId);
      await userDoc.ref.update({ wishlist: updatedUserWishlist });
    } else {
      userWishlist.push(productId);
      await userDoc.ref.update({ wishlist: userWishlist });
    }

    if (productWishlist.includes(userEmail)) {
      const updatedProductWishlist = productWishlist.filter((email) => email !== userEmail);
      await productDoc.ref.update({ wishlist: updatedProductWishlist });
    } else {
      productWishlist.push(userEmail);
      await productDoc.ref.update({ wishlist: productWishlist });
    }

    return { message: 'Product wishlist updated', status: true, code: 200 };
  } catch (err) {
    return { message: getErrorMessage(500), status: false, code: 500 };
  }
}

async function getWishListItems(userEmail) {
  try {
    const productsRef = db.collection('products');
    const query = productsRef.where('wishlist', 'array-contains', userEmail);

    const querySnapshot = await query.get();

    const products = [];
    querySnapshot.forEach((doc) => {
      const productData = doc.data();
      products.push(productData);
    });
    return { message: "Success", status: true, code: 201, products };

  } catch (err) {
    console.error(err);
    return { message: getErrorMessage(500), status: false, code: 500 };
  }
}

async function getDownloadableItems(email) {
  try {
    const productsRef = db.collection('products');
    const query = productsRef.where('purchaseHistory', '!=', null);

    const querySnapshot = await query.get();

    const products = [];

    querySnapshot.forEach((doc) => {
      const productData = doc.data();

      const hasMatchingEmail = productData.purchaseHistory.some(item => item.email === email);

      if (hasMatchingEmail) {
        products.push(productData);
      }
    });
    return { message: "Success", status: true, code: 201, products };

  } catch (err) {
    console.error(err);
    return { message: getErrorMessage(500), status: false, code: 500 };
  }
}

export default {
  signIn,
  updateUser,
  userProfile,
  myProfile,
  followUser,
  promotedUsers,
  wishList,
  getWishListItems,
  getDownloadableItems
};
