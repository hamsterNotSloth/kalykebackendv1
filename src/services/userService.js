import bcrypt from "bcryptjs";
import User from "../model/userModal.js";
import jwt from "jsonwebtoken";
import { getUserErrorMessage, getUserSuccessMessage } from "../../errors/userErrorMessages.js";

const secret_key = process.env.SECRET_KEY;


async function createUser(data) {
  const { username: userName, password, email } = data.values;
  try {
    if (!userName && !email && !password) {
      return { message: getUserErrorMessage(400), status: false, code: 400 };
    }
    const userByUsername = await User.findOne({ userName });
    const userByEmail = await User.findOne({ email });
    if (userByUsername && userByEmail) {
      return { message: getUserErrorMessage(404), status: false, code: 404 };
    } if (userByUsername) {
      return { message: getUserErrorMessage(404), status: false, code: 404 };
    } if (userByEmail) {
      return { message: getUserErrorMessage(404), status: false, code: 404 };
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      userName: userName,
      email: email,
      password: hashedPassword,
      source: data.source,
      u_id: null
    });
    await newUser.save();
    return { message: getUserSuccessMessage(200), status: true, code: 200 };
  } catch (error) {
    return { message: error, status: true, code: 500 };
  }
}

// async function loginUser(req) {
//   try {
//     const { credential: decoded } = req
//     if(decoded && req.source === "Facebook") {
//       const fbUserExist = await User.findOne({userName: decoded.displayName, source: "Facebook"})
//       if(fbUserExist && fbUserExist.source === "Facebook") {
//         return { message: "Successfully Logged in with Facebook Account.", status: true, code: 200, token: `firebase ${decoded.stsTokenManager.accessToken}` } 
//       }
//       else {
//         const fbCreateUser = new User({
//           userName: decoded.displayName,
//           email: decoded.providerData[0].email? decoded.providerData[0].email: "No email",
//           source: "Facebook",
//           profilePicture: decoded.photoURL,
//           u_id: decoded.uid
//         })
//         await fbCreateUser.save()
//         return { message: "Sign in with Facebook Account Successful.", status: true, code: 200, token: `firebase ${decoded.stsTokenManager.accessToken}` }
//       }
//     }
//     if (decoded && req.source === "Google") {
//       const googleUserExist = await User.findOne({ email: decoded && decoded.providerData[0].email })
//       if (googleUserExist && googleUserExist.source === "Google") {
//         return { message: "Successfully Logged in with Google Account.", status: true, code: 200, token: `firebase ${decoded.stsTokenManager.accessToken}` }
//       }
//       if (googleUserExist === null) {
//         const googleLoggedUser = new User({
//           userName: decoded.displayName,
//           email: decoded.providerData[0].email? decoded.providerData[0].email : "No Email",
//           source: "Google",
//           profilePicture: decoded.photoURL,
//           u_id: decoded.uid
//         })
//         await googleLoggedUser.save()
//         return { message: "Sign in with Google Account Successful.", status: true, code: 200, token: `firebase ${decoded.stsTokenManager.accessToken}` }
//       }
//     }
//     if (!decoded) {
//       const user = await User.findOne({
//         email: req.values.email,
//       });
//       if (user == null) {
//         return { message: "Account not found.", status: false, code: 404 };
//       }
//       const passwordChecker = await bcrypt.compare(req.values.password, user.password);
//       if (!passwordChecker) {
//         return { message: "password or email incorrect.", status: false, code: 400 };
//       }
//       const token = jwt.sign(
//         {
//           email: user.email,
//           password: user.password,
//           _id: user._id,
//         },
//         'new_web_secret',
//         {
//           expiresIn: "1d",
//         }
//       );
//       return { token: `Bearer ${token}`, status: true };
//     }
//   } catch (err) {
//     throw err;
//   }
// }

async function loginUser(req) {
  try {
    const { credential: decoded, source } = req;
    
    if (!decoded) {
      return await handleEmailLogin(req.values.email, req.values.password);
    }
    
    if (source === "Facebook") {
      return await handleFacebookLogin(decoded);
    }
    
    if (source === "Google") {
      return await handleGoogleLogin(decoded);
    }
    
    return { message: "Invalid request.", status: false, code: 400 };
  } catch (err) {
    throw err;
  }
}

async function handleEmailLogin(email, password) {
  const user = await User.findOne({ email });

  if (!user) {
    return { message: getUserErrorMessage(404), status: false, code: 404 };
  }

  const passwordChecker = await bcrypt.compare(password, user.password);

  if (!passwordChecker) {
    return { message: getUserErrorMessage(400), status: false, code: 400 };
  }

  const token = generateAuthToken(user);
  return { token, status: true };
}

async function handleFacebookLogin(decoded) {
  const user = await User.findOne({ userName: decoded.displayName, source: "Facebook" });

  if (user && user.source === "Facebook") {
    return { message: getUserSuccessMessage(200), status: true, code: 201, token: `firebase ${decoded.stsTokenManager.accessToken}` };
  } else {
    const newUser = createUserFromDecoded(decoded, "Facebook");
    await newUser.save();
    return { message: getUserSuccessMessage(201), status: true, code: 201, token: `firebase ${decoded.stsTokenManager.accessToken}` };
  }
}

async function handleGoogleLogin(decoded) {
  const email = decoded.providerData[0].email || "No Email";
  const user = await User.findOne({ email });

  if (user && user.source === "Google") {
    return { message: getUserSuccessMessage(200), status: true, code: 200, token: `firebase ${decoded.stsTokenManager.accessToken}` };
  } else {
    const newUser = createUserFromDecoded(decoded, "Google");
    await newUser.save();
    return { message: getUserSuccessMessage(201), status: true, code: 201, token: `firebase ${decoded.stsTokenManager.accessToken}` };
  }
}

function createUserFromDecoded(decoded, source) {
  return new User({
    userName: decoded.displayName,
    email: decoded.providerData[0].email || "No Email",
    source,
    profilePicture: decoded.photoURL,
    u_id: decoded.uid
  });
}

function generateAuthToken(user) {
  const token = jwt.sign(
    {
      email: user.email,
      password: user.password,
      _id: user._id
    },
    'new_web_secret',
    {
      expiresIn: "1d"
    }
  );

  return `Bearer ${token}`;
}

async function updateUser(_id, updatedUserData) {
  try {
    const existingUser = await User.findById(_id);
    if (!existingUser) {
      return { message: getUserErrorMessage(404), status: false };
    }

    existingUser.userName = updatedUserData.userName;
    existingUser.description = updatedUserData.description;

    const updatedUser = await existingUser.save();
    return updatedUser;
  } catch (err) {
    throw err;
  }
}

async function userProfile(_id, sign_in_method) {
  try {
    let userProfile;
    if(sign_in_method === "Email Login") {
      userProfile = await User.findById(_id, 'createdAt email userName uid profilePicture');
    }
    if(sign_in_method === "Firebase Login"){
      userProfile = await User.findOne({u_id: _id}, 'createdAt email userName uid profilePicture');
    }
    if (!userProfile) {
      throw { message: getUserErrorMessage(404), status: false, code: 404 };
    }
    return userProfile;
  } catch (err) {
    throw { message: getUserErrorMessage(500), code: 500, err };
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
    throw err;
  }
}

export default {
  createUser,
  loginUser,
  updateUser,
  resetPassword,
  userProfile,
  deleteUserById,
};
