import bcrypt from "bcryptjs"; 
import User from "../model/userModal.js";
import jwt from "jsonwebtoken";

const secret_key = process.env.SECRET_KEY;


async function createUser(data) {
  const { username, password,  email } = data;
  try {
    if (!username || !email || !password ) {
      return {message: "Something is missing.", status: false};
    }
    const userExists = await User.findOne({ username });
    if (userExists !== null) {
       return ({message: "Username or Email Already Exists.", status: false});
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      userName: username,
      email: email,
      password: hashedPassword
    });
    await newUser.save();
    return { message: "User Successfully created.", status: true, newUser };
  } catch (error) {
    return error; 
  }
}

async function loginUser(req) {
  try {
    const {credential} = req
    const decoded = jwt.decode(credential);
    const googleUserExist = await User.findOne({email: decoded && decoded.email})
    if(googleUserExist) {
      return credential 
    }
    if(googleUserExist === null && decoded) {
      const googleLoggedUser = new User({
        userName: decoded.name,
        email: decoded.email,
        firstName: decoded.given_name,
        LastName: decoded.family_name,
        source: "Google",
        profilePicture: decoded.picture
      })
      await googleLoggedUser.save()
    } 
    if(decoded === null) {
      const user = await User.findOne({
        email: req.email,
      });
      if (!user) {
        return null; 
      }
      const passwordChecker = await bcrypt.compare(req.password, user.password);
      if (!passwordChecker) {
        return null; 
      }
      const token = jwt.sign(
        {
          email: user.email,
          password: user.password,
          _id: user._id,
        },
        'new_web_secret',
        {
          expiresIn: "1d",
        }
      );
      return token;
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function updateUser(_id, updatedUserData) {
  try {
    const existingUser = await User.findById(_id);
    if (!existingUser) {
      return {message: "User does'nt exist.", status: false}; 
    }

    existingUser.userName = updatedUserData.userName;
    existingUser.description = updatedUserData.description;

    const updatedUser = await existingUser.save();
    return updatedUser; 
  } catch (err) {
    throw err; 
  }
}

async function userProfile(_id) {
  try {
    const userProfile = await User.findById(_id);
    if(!userProfile) {
      throw {message: "Profile not found.", status: false, code: 404};
    }
    console.log(userProfile)
    return userProfile;
  } catch(err) {
    throw {message: "Internal Server Error",code: 500, err};
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
    console.log(err);
    throw err; 
  }
}

export default {
  createUser,
  loginUser,
  updateUser,
  userProfile,
  deleteUserById,
};
