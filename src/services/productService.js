import { getErrorMessage, getSuccessMessage } from "../../errors/errorMessages.js";
import { filterEnums } from "../enums/filterEnums.js";
import Product from "../model/product.js";
import User from "../model/user.js";

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
        return { message: getSuccessMessage(201), status: true }
    } catch (err) {
        return { message: getErrorMessage(500), status: false, code: 500 }
    }
}

async function deleteProduct(_id, user) {
    try {
        const myProduct = await Product.findById(_id)
        if (myProduct && myProduct.created_by != user) {
            return { message: getErrorMessage(403), status: false, code: 401 }
        }
        if (!myProduct) {
            return { message: getErrorMessage(404), status: false, code: 404 }
        }
        await Product.findByIdAndDelete(_id)
        return { status: true }
    } catch (err) {
        console.log(err, 'err')
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
            return { message: getErrorMessage(404), status: false, code: 404 }
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
        const commonCondition = category !== "null";
        //filters
        if (currentFilter === filterEnums.newProducts) {
            const query = commonCondition ? { category } : {};
            allProducts = await Product.find(query);
        } else if (currentFilter === filterEnums.trending) {
            const matchCondition = commonCondition && category.length >= 0
                ? { category }
                : { $or: [{ category: null }, { category: { $exists: false } }] };
            const aggregationPipeline = [
                ...(category === "null" ? [] : [{ $match: matchCondition }]),
                { $addFields: { userViewsCount: { $size: "$userViews" } } },
                { $sort: { userViewsCount: -1 } }
            ];

            allProducts = await Product.aggregate(aggregationPipeline);
        } else if (currentFilter === filterEnums.FromtopUsers) {
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
                const products = await Product.aggregate([
                    {
                        $match: {
                            created_by: user.email
                        }
                    },
                    {
                        $addFields: {
                            maxUserViewsLength: { $size: "$userViews" }
                        }
                    },
                    {
                        $sort: {
                            maxUserViewsLength: -1
                        }
                    }
                ]);
                if (products.length > 0) {
                    const validProducts = category == "null"
                        ? products : products.filter(item => item.category === category && item.created_by === user.email)
                    productsArr.push(...validProducts);
                }
            }

            allProducts = productsArr;
        } else {
            const query = commonCondition && category.length >= 0 ? { category } : {};
            allProducts = await Product.find(query);
        }

        return { allProducts, status: true, code: 200 };
    } catch (err) {
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
            return { message: getErrorMessage(404), code: 404, status: false }
        }
        return { similarProducts, productsFromSameUser, code: 200, status: true }
    } catch (error) {
        return { message: getErrorMessage(500), status: false, code: 500 }
    }
}

async function userView(userEmail, productId) {
    try {
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return { message: getSuccessMessage(204), code: 204, status: true }
        }
        const product = await Product.findById(productId);
        if (!product) {
            return { message: getSuccessMessage(204), code: 204, status: true }
        }
        const userView = product.userViews.find(email => email === user.email);
        if (userView) {
            return { message: getSuccessMessage(204), code: 204, status: true }
        }
        product.userViews.push(user.email)
        await product.save();
        return { message: getSuccessMessage(204), code: 204, status: true }
    } catch (error) {
        return { message: getErrorMessage(500), status: false, code: 500 }
    }
}

async function searchedProducts(data) {
    try {
        const products = await Product.find({ title: { $regex: data, $options: 'i' } })
        return { products, code: 200 }
    } catch (error) {
        console.log(error)
        return { message: getErrorMessage(500), status: false, code: 500 }
    }
}

async function addComments(data) {
    const { comment, user, productId } = data
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: getErrorMessage(400), status: false, code: 400 });
        }
        const newComment = { user, text: comment };
        product.comments.push(newComment);
        await product.save();
        return { message: "Success.", status: true, code: 201 }
    } catch (error) {
        return { message: getErrorMessage(500), status: false, code: 500 }
    }
}

async function deleteComment(data) {
    const { user, commentId, productId } = data
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return { message: getErrorMessage(400), status: false, code: 400 };
        }
        if (product && product.created_by != user) {
            return { message: getErrorMessage(403), status: false, code: 401 }
        }
        const comment = product.comments.id(commentId);
        if (!comment) {
            return { message: 'Comment not found', status: 404 };
        }
        product.comments.pull(commentId);
        await product.save();
        return { status: true, code: 204, message: "Success" }
    } catch (error) {
        console.log(error, 'service')
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
    userView,
    searchedProducts,
    addComments,
    deleteComment
};