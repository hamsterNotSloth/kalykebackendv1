import bcrypt from "bcryptjs";
import User from "../model/userModal.js";
import jwt from "jsonwebtoken";
import { getUserErrorMessage, getUserSuccessMessage } from "../../errors/userErrorMessages.js";

const secret_key = process.env.SECRET_KEY;


// async function createUser(credentials, userData) {
//   const { uid, email} = credentials
//   const { username: userName } = userData;
//   try {
//     if (!userName && !email) {
//       return { message: getUserErrorMessage(400), status: false, code: 400 };
//     }
//     const userByUsername = await User.findOne({ userName });
//     const userByEmail = await User.findOne({ email });
//     if (userByUsername || userByEmail) {
//       return { message: getUserErrorMessage(404), status: false, code: 404 };
//     }
//     const newUser = new User({
//       userName: userName,
//       email: email,
//       source: "Email",
//       u_id: uid
//     });
//     await newUser.save();
//     return { message: getUserSuccessMessage(201), status: true, code: 201 };
//   } catch (error) {
//     return { message: error, status: true, code: 500 };
//   }
// }

// login functionality starts here

// async function handleEmailLogin(email, password) {
//   const user = await User.findOne({ email });

//   if (!user) {
//     return { message: getUserErrorMessage(404), status: false, code: 404 };
//   }

//   const passwordChecker = await bcrypt.compare(password, user.password);

//   if (!passwordChecker) {
//     return { message: getUserErrorMessage(400), status: false, code: 400 };
//   }

//   const token = generateAuthToken(user);
//   return { token, status: true };
// }

// async function handleFacebookLogin(decoded) {
//   const email = decoded.providerData[0].email || "No Email";
//   const user = await User.findOne({ email, source: "Facebook" });

//   if (user && user.source === "Facebook") {
//     return { message: getUserSuccessMessage(200), status: true, code: 201, token: `firebase ${decoded.stsTokenManager.accessToken}` };
//   } else {
//     const newUser = createUserFromDecoded(decoded, "Facebook");
//     await newUser.save();
//     return { message: getUserSuccessMessage(201), status: true, code: 201, token: `firebase ${decoded.stsTokenManager.accessToken}` };
//   }
// }

// async function handleGoogleLogin(decoded) {
//   const email = decoded.providerData.email || "No Email";
//   const user = await User.findOne({ email });
//   console.log(decoded.providerData, 'req.body')

//   if (user && user.source === "Google") {
//     return { message: getUserSuccessMessage(200), status: true, code: 200, token: `firebase ${decoded.stsTokenManager.accessToken}` };
//   } else {
//     const newUser = createUserFromDecoded(decoded.providerData, "Google");
//     await newUser.save();
//     return { message: getUserSuccessMessage(201), status: true, code: 201, token: `firebase ${decoded.stsTokenManager.accessToken}` };
//   }
// }

async function signIn(req) {
  try {
    const { credential: decoded } = req;
    const email = decoded.providerData[0].email || "No Email";
    const user = await User.findOne({ email });
    if(!decoded || !decoded.uid || !decoded.providerData || !decoded.providerData[0].email) {
      return {message: "Something is missing. If error continues contact support.", status: false, code: 404 }
    }
    if(!user) {
      const userData = createUserFromDecoded(decoded)
      await userData.save()
      return { message: getUserSuccessMessage(201), status: true, code: 201, token: `firebase ${decoded.stsTokenManager.accessToken}` };
    }
    else if(user) {
      return { message: getUserSuccessMessage(200), status: true, code: 200, token: `firebase ${decoded.stsTokenManager.accessToken}` };
    }
    return { message: "Invalid request.", status: false, code: 400 };
  } catch (err) {
    throw err;
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

async function updateUser(email, updatedUserData) {
  try {
    const existingUser = await User.findOne({email});
    // if (existingUser) {
    //   return { message: getUserErrorMessage(404), status: false };
    // }
    existingUser.userName = updatedUserData.userName;
    existingUser.description = updatedUserData.description;
    existingUser.socialMedia = updatedUserData.socialMedia;

    const updatedUser = await existingUser.save();
    return updatedUser;
  } catch (err) {
    throw err;
  }
}

async function userProfile(data) {
  try {
    const userProfileByUid = await User.findOne({u_id: data.uid}, 'createdAt userName u_id profilePicture');
    const userProfileByEmail = await User.findOne({email: data.email})
    if (!userProfileByUid && !userProfileByEmail) {
      return { message: getUserErrorMessage(404), status: false, code: 404 };
    }
    return !userProfileByUid? userProfileByEmail : userProfileByUid;
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
  // createUser,
  signIn,
  updateUser,
  resetPassword,
  userProfile,
  deleteUserById,
};
