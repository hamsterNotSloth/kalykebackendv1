import { getErrorMessage, getSuccessMessage, } from "../../errors/errorMessages.js";
import userService from "../services/userService.js"
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dotenv from "dotenv";
dotenv.config();

const email_user = process.env.EMAIL;
const email_pass = process.env.EMAIL_PASS;

export const signIn = async (req, res) => {
  if (req && !req.body) {
    return res.status(400).json({ message: getErrorMessage(400), status: false, code: 400 })
  }
  try {
    const userData = await userService.signIn(
      req.body
    );
    if (userData) {
      if (userData.status === true) {
        return res.status(200).json({
          userData
        });
      }
      return res.status(userData.code).json({ message: getErrorMessage(userData.code), status: false, code: userData.code })
    }
    return res.status(400).json({ message: getErrorMessage(400), status: false, code: 400 })
  } catch (error) {
    res.status(500).json({
      message: getErrorMessage(500),
      status: false,
    });
  }
};

export const verifyUser = async (req, res) => {
  const token = req.params.token;
  try {
    // const response = await userService.verifyUser()
  } catch (error) {
    res.status(500).json({
      message: getErrorMessage(500), status: false
    });
  }
}

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const response = await userService.resetPassword({ token, password })
    if (response.status == false) {
      return res.status(response.code).json(response);
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: 'Server error.' });
  }
}

export const updateUserInfo = async (req, res) => {
  try {
    const newUserData = {
      userName: req.body.userName,
      description: req.body.description,
      socialMedia: req.body.socialMedia,
      profilePicture: req.body.profilePicture
    };
    const updatedUser = await userService.updateUser(req.user.email, newUserData);
    if (updatedUser) {
      res.status(updatedUser.code).json({
        message: getSuccessMessage(201),
        status: true,
      });

    } else {
      res.status(404).json({ message: "User not found", status: false });
    }
    return
  } catch (error) {
    return res.status(500).json({
      message: getErrorMessage(500), status: false
    });
  }
};

export const getUserProfile = async (req, res) => {
  let authId = `is not equal ${Math.random * Date.now()}`;
  if (req.user && req.user.uid) {
    authId = req.user.uid
  }
  const id = req.params.id;
  try {
    const userProfile = await userService.userProfile(id, authId);
    return res.status(userProfile.code).json(userProfile)
  } catch (error) {
    return res.status(500).json({
      message: getErrorMessage(500), status: false
    });
  }
};

export const getMyProfile = async (req, res) => {
  if (!req.user) {
    return
  }
  if (req.user && !req.user.email) {
    return
  }
  const email = req.user.email;
  try {
    const userProfile = await userService.myProfile(email);
    return res.status(userProfile.code).json(userProfile)
  } catch (error) {
    return res.status(500).json({
      message: getErrorMessage(500), status: false
    });
  }
};

export const follow = async (req, res) => {
  if (!req.user.email || !req.body.email) {
    return { message: getErrorMessage(404), status: false, code: 404 }
  }
  const follower_email = req.user.email;
  const following_email = req.body.email
  try {
    const response = await userService.followUser(follower_email, following_email)
    return res.status(response.code).json(response)
  } catch (error) {
    return res.status(500).json({
      message: getErrorMessage(500), status: false
    });
  }
}

export const serverHealthCheck = async (req, res) => {
  res.status(200).json("Hello world from the server!")
} 

export const wishList = async (req, res) => {
  if (req.body && !req.body.productId) {
    return res.status(400).json({
      message: getErrorMessage(400), status: false
    });
  }
  if (req.user && !req.user.email) {
    return res.status(400).json({
      message: getErrorMessage(400), status: false
    });
  }
  const productId = req.body.productId;
  const userEmail = req.user.email
  try {
    const response = await userService.wishList({ productId, userEmail })
    return res.status(response.code).json(response)
  } catch (error) {
    return res.status(500).json({
      message: getErrorMessage(500), status: false
    });
  }
}

export const getWishListItems = async (req, res) => {
  if(req.user && !req.user.email) {
    return res.status(400).json({
      message: getErrorMessage(400), status: false
    });
  }
  const userEmail = req.user.email
  try {
    const response = await userService.getWishListItems(userEmail)
    return res.status(response.code).json(response)
  } catch (error) {
    return res.status(500).json({
      message: getErrorMessage(500), status: false
    });
  }
}

export const getUserDownloadableItems = async(req, res) => {
  const {email} = req.user
  
  try {
    const response = await userService.getDownloadableItems(
      email
    );
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
