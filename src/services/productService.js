import { getErrorMessage } from "../../errors/errorMessages.js";
import { getProductErrorMessage, getProductSuccessMessage } from "../../errors/productErrorMessages.js";
import Product from "../model/3dModal.js";
import User from "../model/userModal.js";

async function createProduct(data, userRef) {
    const { title, description, images, modalSetting, category, modal, tags } = data
    try {
        const createProduct = new Product({
            title: title,
            description: description,
            images: images,
            modal: modal,
            tags: tags,
            modalSetting: modalSetting,
            category: category,
            created_by: userRef
        })
        await createProduct.save();
        return { message: getProductSuccessMessage(201), status: true }
    } catch (err) {
        console.log(err, ' err')
    }
}

async function deleteProduct(_id) {
    try {
        const myProduct = await Product.findById(_id)
        if (!myProduct) {
            return { message: getProductErrorMessage(404), status: false, code: 404 }
        }
        await Product.findByIdAndDelete(_id)
        return { status: true }
    } catch (err) {
        return { message: getErrorMessage(500), status: false, code: 500 }
    }
}

async function getMyProducts(data) {
    try {
        const user = await User.findOne({ u_id: data })
        if (!user) {
            return { message: getErrorMessage(404), code: 404, status: false }
        }
        const { email: created_by } = user
        const myProducts = await Product.find({ created_by })
        if (!myProducts) {
            return { message: getProductErrorMessage(404), status: false, code: 404 }
        }
        return { myProducts, status: true, code: 200 }
    } catch (err) {

        return { message: getErrorMessage(500), status: false, code: 500 }
    }
}

async function getAllProducts(data) {
    const { currentFilter, category } = data;
    try {
        let allProducts;

        if (currentFilter === 'New Uploads') {
            const query = category !== "null" ? { category } : {};
            allProducts = await Product.find(query);
        } else if (currentFilter === "Trending") {
            const matchCondition = category !== "null" && category.length >= 0
                ? { category }
                : { $or: [{ category: null }, { category: { $exists: false } }] };
            const aggregationPipeline = [
                ...(category === "null" ? [] : [{ $match: matchCondition }]),
                { $addFields: { userViewsCount: { $size: "$userViews" } } },
                { $sort: { userViewsCount: -1 } }
            ];

            allProducts = await Product.aggregate(aggregationPipeline);
        } else if (currentFilter === "From top users") {
            const topUsers = await User.aggregate([
                {
                    $addFields: {
                        followersCount: { $size: "$followers" },
                    },
                },
                {
                    $sort: { followersCount: -1 },
                },
            ]);
            let productsArr = [];
            for (const user of topUsers.slice(0, 30)) {
                const products = await Product.find({created_by: user.email }).limit(1);
                if (products.length > 0) {
                    const validProducts = category == "null" 
                        ? products : products.filter(item => item.category === category && item.created_by === user.email)
                        console.log(validProducts,'validProducts')
                    productsArr.push(...validProducts);
                }
            }

            allProducts = productsArr;
        } else {
            const query = category !== "null" && category.length >= 0 ? { category } : {};
            allProducts = await Product.find(query);
            console.log(allProducts)
        }

        return { allProducts, status: true };
    } catch (err) {
        console.error(err);
        return { message: getErrorMessage(500), status: false, code: 500 };
    }
}

const getProduct = async (_id) => {
    try {
        const product = await Product.findOne({ _id })
        if (!product) {
            return { status: 404, message: getErrorMessage(404) }
        }
        const user = await User.findOne({ email: product.created_by })
        const totalProducts = await Product.countDocuments({ created_by: product.created_by })
        if (!user) {
            return { status: 404, message: getErrorMessage(404) }
        }
        return { product, totalProducts, user, status: 200 }
    } catch (error) {
        return { message: getErrorMessage(500), status: false, code: 500 }
    }
}

async function downloadImage(link) {
    try {
        const response = await fetch(link);
        if (response.ok) {
            const imageBuffer = await response.buffer();
            res.setHeader('Content-Type', response.headers.get('Content-Type'));
            res.setHeader('Content-Disposition', 'attachment; filename="downloaded_image.jpg"');
            res.send(imageBuffer);
        } else {
            res.status(response.status).send('Failed to download image');
        }
    } catch (error) {
        return { message: getErrorMessage(500), status: false, code: 500 }
    }
}

const fetchSimilarProducts = async (tags) => {
    let similarProducts;
    for (let i = 0; i < tags.length; i++) {
        similarProducts = await Product.find({ tags: { $in: tags[i] } });
    }
    return similarProducts;
}

async function getSimilarProducts(tags, created_by) {
    try {
        const similarProducts = await fetchSimilarProducts(tags)

        const productsFromSameUser = await Product.aggregate([
            { $match: { created_by } },
            { $sample: { size: 6 } },
        ]);
        if (!similarProducts) {
            return { message: getProductErrorMessage(404), code: 404, status: false }
        }
        return { similarProducts, productsFromSameUser, code: 200, status: true }
    } catch (error) {
        console.log(error, 'Error...')
        return { message: getErrorMessage(500), status: false, code: 500 }
    }
}

async function userView(userEmail, productId) {
    try {
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return { message: "Success", code: 203, status: true }
        }
        const product = await Product.findById(productId);
        if (!product) {
            return { message: "Success", code: 203, status: true }
        }
        const userView = product.userViews.find(email => email === user.email);
        if (userView) {
            return { message: "Success", code: 203, status: true }
        }
        product.userViews.push(user.email)
        await product.save();
        return { message: "Success", code: 200, status: true }
    } catch (error) {
        return { message: getErrorMessage(500), status: false, code: 500 }
    }
}

export default {
    createProduct,
    getMyProducts,
    deleteProduct,
    getAllProducts,
    getProduct,
    getSimilarProducts,
    downloadImage,
    userView
};