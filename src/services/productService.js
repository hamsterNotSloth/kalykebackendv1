import { db } from "../../config/firebase/firebase.js";
import { getErrorMessage, getSuccessMessage } from "../../errors/errorMessages.js";
import { filterEnums } from "../enums/filterEnums.js";
import { v4 as uuidv4 } from 'uuid';

const allowedExtensionsDownloadHandler = async (modal) => {
  const extensionsAllowed = modal.map(item => {
    return item.downloadLink.split(/[#?]/)[0].split('.').pop().trim();
  })
  const uniqFiles = [...new Set(extensionsAllowed)]
  return uniqFiles
}
async function createProduct(data, userRef) {
  const { title, description, images, modalSetting, category, modal, tags, price, license } = data;
  try {
    const { email } = userRef;
    const usersCollection = db.collection('users');
    const querySnapshot = await usersCollection.where('email', '==', email).get();
    if (querySnapshot.empty) {
      return res.status(404).json({
        message: 'User not found',
        status: false,
      });
    }
    const userData = querySnapshot.docs[0].data();
    const extensions = await allowedExtensionsDownloadHandler(modal)
    const productsCollection = db.collection('products');
    const _id = uuidv4();
    let free = true
    if (price != 0) {
      free = false
    }
    await productsCollection.add({
      title,
      description,
      images,
      modal,
      tags,
      _id,
      modalSetting,
      category,
      createdAt: Date.now(),
      created_by: userData.email,
      u_id: userData.u_id,
      price: price,
      free,
      creator_name: userData.userName,
      extensions,
      stripeUserId: userData.stripeUserId,
      profileImg: userData.profilePicture,
      license
    });

    return { message: getSuccessMessage(201), status: true };
  } catch (err) {
    console.error('Error creating product:', err);
    return { message: getErrorMessage(500), status: false, code: 500 };
  }
}

async function getMyProducts(data) {
  try {
    const userSnapshot = await db.collection('users').where('u_id', '==', data).limit(1).get();

    if (userSnapshot.empty) {
      return { message: getErrorMessage(404), code: 404, status: false };
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    const { email: created_by } = userData;

    const productsSnapshot = await db.collection('products').where('created_by', '==', created_by).orderBy('createdAt', 'desc').get();

    if (productsSnapshot.empty) {
      return { message: getErrorMessage(404), status: false, code: 404 };
    }

    const myProducts = productsSnapshot.docs.map((productDoc) => productDoc.data());

    return { myProducts, status: true, code: 200 };
  } catch (err) {
    console.error('Error fetching products:', err);
    return { message: getErrorMessage(500), status: false, code: 500 };
  }
}

async function deleteProduct(_id, user) {
  try {
    const querySnapshot = await db.collection('products').where('_id', '==', _id).get();

    if (querySnapshot.empty) {
      return { message: getErrorMessage(404), status: false, code: 404 };
    }

    const documentReference = querySnapshot.docs[0].ref;

    const productData = querySnapshot.docs[0].data();

    if (productData.created_by !== user) {
      return { message: getErrorMessage(403), status: false, code: 403 };
    }

    await documentReference.delete();

    return { message: getSuccessMessage(200), status: true, code: 200 };
  } catch (err) {
    return { message: getErrorMessage(500), status: false, code: 500 };
  }
}

async function getAllProducts(data) {
  const { currentFilter, category, isFree, fileType: toSmall } = data;
  try {
    let allProducts;
    const productsCollection = db.collection('products');
    const fileType = toSmall.toLowerCase()
    let query;
    let tester = null;
    switch (currentFilter) {
      case filterEnums.newProducts:
        if (isFree == "false") {
          if (fileType != "all file types") {
            query = productsCollection.where('free', '==', true).where('extensions', 'array-contains', fileType).orderBy('createdAt', 'desc');
          } else {

            query = productsCollection.where('free', '==', true).orderBy('createdAt', 'desc');
          }
        }
        else if (isFree == "true") {
          if (fileType != "all file types") {
            query = productsCollection.where('free', '==', false).where('extensions', 'array-contains', fileType).orderBy('createdAt', 'desc');
          } else {
            query = productsCollection.where('free', '==', false).orderBy('createdAt', 'desc');
          }
        }
        else {
          if (fileType != "all file types") {
            query = productsCollection.where('extensions', 'array-contains', fileType).orderBy('createdAt', 'desc');
          } else {
            query = productsCollection.orderBy('createdAt', 'desc');
          }
        }
        break;
      case filterEnums.trending:
        if (isFree == "false") {
          if (fileType != "all file types") {
            query = productsCollection.where('free', '==', true).where('extensions', 'array-contains', fileType).orderBy('userViewsLength', 'desc');
          }
          query = productsCollection.where('free', '==', true).orderBy('userViewsLength', 'desc');
        }
        else if (isFree == "true") {
          if (fileType != "all file types") {
            query = productsCollection.where('free', '==', false).where('extensions', 'array-contains', fileType).orderBy('userViewsLength', 'desc');
          }
          else {
            query = productsCollection.where('free', '==', false).orderBy('userViewsLength', 'desc');
          }
        } else {
          if (fileType != "all file types") {
            query = productsCollection.where('extensions', 'array-contains', fileType).orderBy('userViewsLength', 'desc');
          }
          else {
            query = productsCollection.orderBy('userViewsLength', 'desc');
          }
        }
        break;
      case filterEnums.mostDownload:
        if (isFree == "false") {
          if (fileType != "all file types") {
            query = productsCollection.where('free', '==', true).where('extensions', 'array-contains', fileType).orderBy('purchaseHistoryLength', 'desc');
          }
          else {
            query = productsCollection.where('free', '==', true).orderBy('purchaseHistoryLength', 'desc');
          }
        }
        else if (isFree == "true") {
          if (fileType != "all file types") {
            query = productsCollection.where('free', '==', false).where('extensions', 'array-contains', fileType).orderBy('purchaseHistoryLength', 'desc');
          }
          else {
            query = productsCollection.where('free', '==', false).orderBy('purchaseHistoryLength', 'desc');
          }
        }
        else {
          if (fileType != "all file types") {
            query = productsCollection.where('extensions', 'array-contains', fileType).orderBy('purchaseHistoryLength', 'desc');
          }
          else {
            query = productsCollection.orderBy('purchaseHistoryLength', 'desc');

          }
        }
        break;
      case filterEnums.FromtopUsers:
        query = await db.collection('users').orderBy('followersCount', 'desc').limit(30).get();
        const topUsers = query.docs.map(doc => doc.data());
        let productsArr = [];

        for (const userDoc of topUsers) {
          let productsQuery;
          if (isFree == "false") {
            if (fileType != "all file types") {
              productsQuery = await db.collection('products').where('extensions', 'array-contains', fileType).where('created_by', '==', userDoc.email).where('free', '==', true).orderBy('userViewsLength', 'desc').orderBy('createdAt', 'desc').limit(1).get();
            }
            else {
              productsQuery = await db.collection('products').where('created_by', '==', userDoc.email).where('free', '==', true).orderBy('userViewsLength', 'desc').orderBy('createdAt', 'desc').limit(1).get();
            }
          }
          else if (isFree == "true") {
            if (fileType != "all file types") {
              productsQuery = await db.collection('products').where('extensions', 'array-contains', fileType).where('created_by', '==', userDoc.email).where('free', '==', false).orderBy('userViewsLength', 'desc').orderBy('createdAt', 'desc').limit(1).get();
            }
            else {
              productsQuery = await db.collection('products').where('created_by', '==', userDoc.email).where('free', '==', false).orderBy('userViewsLength', 'desc').orderBy('createdAt', 'desc').limit(1).get();
            }
          }
          else {
            if (fileType != "all file types") {
              productsQuery = await db.collection('products').where('extensions', 'array-contains', fileType).where('created_by', '==', userDoc.email).orderBy('userViewsLength', 'desc').orderBy('createdAt', 'desc').limit(1).get();
            }
            else {
              productsQuery = await db.collection('products').where('created_by', '==', userDoc.email).orderBy('userViewsLength', 'desc').orderBy('createdAt', 'desc').limit(1).get();
            }
          }
          const products = productsQuery.docs.map(doc => doc.data());
          if (products.length > 0) {
            const validProduct = category === "null" ? products[0] : products.find(item => item.category === category);
            if (validProduct) {
              productsArr.push(validProduct);
            }
          }
        }

        allProducts = productsArr;
        tester = 'not null'
        break;

      default:
        query = productsCollection;
        break;
    }

    // Add category filter if category is not null
    if (category !== "null") {
      query = query.where('category', '==', category);
    }
    if (tester == null) {

      const querySnapshot = await query.get();
      allProducts = querySnapshot.docs.map(doc => doc.data());
    }
    return { allProducts, status: true, code: 200 };
  } catch (err) {
    console.error('Error fetching products:', err);
    return { message: getErrorMessage(500), status: false, code: 500 };
  }
}


const getProduct = async (_id) => {
  try {
    const productsCollection = db.collection('products');

    const productQuerySnapshot = await productsCollection.where('_id', '==', _id).get();

    if (productQuerySnapshot.empty) {
      return { status: 404, code: 404, message: getErrorMessage(404), product: [] };
    }

    const productData = productQuerySnapshot.docs[0].data();

    const usersCollection = db.collection('users');
    const userQuerySnapshot = await usersCollection.where('email', '==', productData.created_by).get();

    if (userQuerySnapshot.empty) {
      return { status: 404, code: 404, message: getErrorMessage(404) };
    }

    const userData = userQuerySnapshot.docs[0].data();

    const totalProductsQuerySnapshot = await productsCollection.where('created_by', '==', productData.created_by).get();
    const totalProducts = totalProductsQuerySnapshot.size;

    return { product: productData, totalProducts, user: userData, status: 200, code: 200 };
  } catch (error) {
    return { message: getErrorMessage(500), status: 500, code: 500 };
  }
};

const fetchSimilarProducts = async (tags) => {
  let similarProducts = [];

  for (let i = 0; i < tags.length; i++) {
    const querySnapshot = await db.collection('products').where('tags', 'array-contains', tags[i]).get();

    similarProducts = [...similarProducts, ...querySnapshot.docs.map(doc => doc.data())];
  }

  return similarProducts;
};

async function getSimilarProducts(tags, created_by) {
  try {
    const similarProducts = await fetchSimilarProducts(tags);

    const productsFromSameUserQuerySnapshot = await db.collection('products').where('created_by', '==', created_by).limit(6).get();
    const productsFromSameUser = productsFromSameUserQuerySnapshot.docs.map(doc => doc.data());

    if (!similarProducts.length) {
      return { message: getErrorMessage(404), code: 404, status: false };
    }

    return { similarProducts, productsFromSameUser, code: 200, status: true };
  } catch (error) {
    return { message: getErrorMessage(500), status: false, code: 500 };
  }
}

async function userView(userEmail, _id) {
  try {
    const userSnapshot = await db.collection('users').where('email', '==', userEmail).get();
    if (userSnapshot.empty) {
      return { message: getSuccessMessage(204), code: 204, status: true };
    }

    const productsSnapshot = await db.collection('products').where('_id', '==', _id).get();

    if (productsSnapshot.empty) {
      return { message: getSuccessMessage(204), code: 204, status: true };
    }

    const productDoc = productsSnapshot.docs[0];
    const productData = productDoc.data();

    if (productData.userViews && productData.userViews.includes(userEmail)) {
      return { message: getSuccessMessage(204), code: 204, status: true };
    }

    const updatedUserViews = [...(productData.userViews || []), userEmail];
    await productDoc.ref.update({
      userViews: updatedUserViews,
      userViewsLength: updatedUserViews.length
    });

    return { message: getSuccessMessage(204), code: 204, status: true };
  } catch (error) {
    console.error(error);
    return { message: getErrorMessage(500), status: false, code: 500 };
  }
}

async function searchedProducts(data) {
  try {
    const productsCollection = db.collection('products');

    const querySnapshot = await productsCollection.where('title', '>=', data.toLowerCase())
      .where('title', '<=', data.toLowerCase() + '\uf8ff').get();

    const products = querySnapshot.docs.map(doc => doc.data());

    return { products, code: 200 };
  } catch (error) {
    return { message: getErrorMessage(500), status: false, code: 500 }
  }
}

async function addComments(data) {
  const { comment, user, productId } = data;

  try {
    const productRef = db.collection('products');
    const querySnapshot = await productRef.where('_id', '==', productId).limit(1).get();

    if (querySnapshot.empty) {
      return { message: getErrorMessage(404), status: false, code: 404 };
    }

    const currentUserRef = db.collection('users').where('email', '==', user.email).limit(1);
    const currentUserDoc = await currentUserRef.get();

    if (currentUserDoc.empty) {
      return { message: getErrorMessage(404), status: false, code: 404 };
    }

    const _id = uuidv4();

    const currentUserData = currentUserDoc.docs[0].data();
    const newComment = {
      userName: currentUserData.userName,
      u_id: currentUserData.u_id,
      profilePic: currentUserData.profilePicture,
      user: currentUserData.email,
      text: comment,
      createdAt: Date.now(),
      _id
    };

    const productDoc = querySnapshot.docs[0];
    let comments = productDoc.exists ? productDoc.data().comments || [] : [];

    comments.push(newComment);

    await productRef.doc(productDoc.id).update({
      comments: comments,
      commentsLength: comments.length,
    });

    return { message: 'Success.', status: true, code: 201 };
  } catch (error) {
    console.error(error);
    return { message: getErrorMessage(500), status: false, code: 500 };
  }
}

async function addReply(data) {
  const { commentId, reply, user, productId } = data;

  try {
    const productQuery = db.collection('products').where('_id', '==', productId);
    const productSnapshot = await productQuery.get();

    if (productSnapshot.empty) {
      return { message: getErrorMessage(404), status: false, code: 404 };
    }

    const productDoc = productSnapshot.docs[0];
    const productData = productDoc.data();

    const commentIndex = productData.comments.findIndex(comment => comment._id === commentId);

    if (commentIndex === -1) {
      return { message: getErrorMessage(404), status: false, code: 404 };
    }

    const comment = productData.comments[commentIndex];

    const currentUserQuery = db.collection('users').where('email', '==', user.email).limit(1);
    const currentUserSnapshot = await currentUserQuery.get();

    if (currentUserSnapshot.empty) {
      return { message: getErrorMessage(404), status: false, code: 404 };
    }

    const currentUserData = currentUserSnapshot.docs[0].data();

    const newReply = {
      userName: currentUserData.userName,
      u_id: currentUserData.u_id,
      profilePic: currentUserData.profilePicture,
      user: currentUserData.email,
      text: reply,
      CreatedAt: Date.now(),
      _id: uuidv4(),
    };

    if (!comment.replies) {
      comment.replies = [];
    }

    comment.replies.push(newReply);

    await productDoc.ref.update({
      comments: productData.comments,
    });

    return { message: 'Success.', status: true, code: 201 };
  } catch (error) {
    console.error(error);
    return { message: getErrorMessage(500), status: false, code: 500 };
  }
}

async function deleteReply(data) {
  const { commentId, replyId, user, productId } = data;

  try {
    const productQuery = db.collection('products').where('_id', '==', productId);
    const productSnapshot = await productQuery.get();

    if (productSnapshot.empty) {
      return { message: getErrorMessage(404), status: false, code: 404 };
    }

    const productDoc = productSnapshot.docs[0];
    const productData = productDoc.data();

    const commentIndex = productData.comments.findIndex(comment => comment._id === commentId);

    if (commentIndex === -1) {
      return { message: getErrorMessage(404), status: false, code: 404 };
    }

    const comment = productData.comments[commentIndex];

    const replyIndex = comment.replies.findIndex(reply => reply._id === replyId);

    if (replyIndex === -1) {
      return { message: getErrorMessage(404), status: false, code: 404 };
    }

    const reply = comment.replies[replyIndex];

    if (reply.user !== user.email) {
      return { message: "Unauthorized", status: false, code: 403 };
    }

    comment.replies.splice(replyIndex, 1);

    await productDoc.ref.update({
      comments: productData.comments,
    });

    return { message: "Success.", status: true, code: 200 };
  } catch (error) {
    console.error(error);
    return { message: getErrorMessage(500), status: false, code: 500 };
  }
}

async function deleteComment(data) {
  const { user, commentId, productId } = data;

  try {
    const productRef = db.collection('products');
    const productQuery = productRef.where('_id', '==', productId).limit(1);
    const productSnapshot = await productQuery.get();

    if (productSnapshot.empty) {
      return { message: getErrorMessage(404), status: false, code: 404 };
    }

    const productDoc = productSnapshot.docs[0];
    const productData = productDoc.data();

    const commentIndex = productData.comments.findIndex(comment => comment._id === commentId);

    if (commentIndex === -1) {
      return { message: 'Comment not found', code: 404, status: false };
    }

    const comment = productData.comments[commentIndex];

    if (comment.user !== user) {
      return { message: 'Unauthorized', status: false, code: 403 };
    }

    productData.comments.splice(commentIndex, 1);

    await productRef.doc(productDoc.id).update({
      comments: productData.comments,
      commentsLength: productData.comments.length,
    });

    return { status: true, code: 204, message: 'Success' };
  } catch (error) {
    console.error(error);
    return { message: getErrorMessage(500), status: false, code: 500 };
  }
}

async function addPurchase(productId, email) {
  try {
    const productQuery = db.collection('products').where('_id', '==', productId);
    const productSnapshot = await productQuery.get();

    if (productSnapshot.empty) {
      return { message: getErrorMessage(404), status: false, code: 404 };
    }

    const productDoc = productSnapshot.docs[0];
    const productData = productDoc.data();

    if (!productData.purchaseHistory) {
      productData.purchaseHistory = [];
    }

    const existingPurchase = productData.purchaseHistory.find(purchase => purchase.email === email);

    if (existingPurchase) {
      return { message: 'User has already purchased this product', code: 204, status: true };
    }

    productData.purchaseHistory.push({
      email,
      purchaseDate: new Date(),
      _id: uuidv4()
    });

    await productDoc.ref.update({
      purchaseHistory: productData.purchaseHistory,
      purchaseHistoryLength: productData.purchaseHistory.length
    });

    return { code: 200, status: true };
  } catch (error) {
    console.error(error);
    return { message: getErrorMessage(500), status: false, code: 500 };
  }
}

async function addRating(productId, user, rating) {
  try {
    const productQuery = await db.collection('products').where('_id', '==', productId).get();

    if (!productQuery.empty) {
      const productDoc = productQuery.docs[0];
      const ratingsArray = productDoc.data().ratings || [];

      const existingRatingIndex = ratingsArray.findIndex(
        (rating) => rating.email === user.email
      );

      if (existingRatingIndex === -1) {
        ratingsArray.push({
          email: user.email,
          u_id: user.uid,
          rating: rating
        });

        const sumOfRatings = ratingsArray.reduce((total, r) => total + r.rating, 0);
        const avgRating = sumOfRatings / ratingsArray.length;

        await productDoc.ref.update({
          ratings: ratingsArray,
          avgRating: avgRating
        });

      } else {
        console.log(`User with email ${user.email} has already rated the product`);
      }
    }

    return { message: getSuccessMessage(204), status: false, code: 204 };
  }
  catch (error) {
    console.error(error, 'error');
    return { message: getErrorMessage(500), status: false, code: 500 };
  }
}

export default {
  createProduct,
  getMyProducts,
  deleteProduct,
  getAllProducts,
  getProduct,
  getSimilarProducts,
  userView,
  searchedProducts,
  addComments,
  deleteComment,
  addPurchase,
  addReply,
  deleteReply,
  addRating
};