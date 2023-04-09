import Photo from "../models/photoModel.js";
import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

const createPhoto = async (req, res) => {

    const fileUploadResult = await cloudinary.uploader.upload(
        req.files.image.tempFilePath,
        {
            use_filename: true,
            folder: "lenslight_tr"
        }
    );

    try {

        await Photo.create({
            name: req.body.name,
            description: req.body.description,
            user: res.locals.user._id,
            url: fileUploadResult.secure_url,
            image_id: fileUploadResult.public_id
        });

        fs.unlinkSync(req.files.image.tempFilePath);

        res.status(201).redirect("/users/dashboard");

    } catch (error) {
        res.status(500).json({
            succeded: false,
            error: error
        })
    }
};

const deletePhoto = async (req, res) => {
    try {
        const photo = await Photo.findById(req.params.id);
        if (photo) {
            await cloudinary.uploader.destroy(photo.image_id);
            await Photo.findOneAndRemove({ _id: req.params.id });

            res.status(200).redirect("/users/dashboard");
        }
        else {

            res.status(404).json({
                ucceded: false,
                error: "photo not found"
            })
        }



    } catch (error) {
        res.status(500).json({
            succeded: false,
            error: error
        })
    }
}

const updatePhoto = async (req, res) => {
    try {
        const photo = await Photo.findById(req.params.id);
        if (photo) {
            if (req.files) {
                await cloudinary.uploader.destroy(photo.image_id);

                const fileUploadResult = await cloudinary.uploader.upload(
                    req.files.image.tempFilePath,
                    {
                        use_filename: true,
                        folder: "lenslight_tr"
                    }
                );

                photo.url = fileUploadResult.secure_url;
                photo.image_id = fileUploadResult.public_id;

                fs.unlinkSync(req.files.image.tempFilePath);
            }

            photo.name = req.body.name;
            photo.description = req.body.description;

            photo.save();

            res.status(200).redirect(`/photos/${req.params.id}`);
        }
        else {

            res.status(404).json({
                ucceded: false,
                error: "photo not found"
            })
        }



    } catch (error) {
        res.status(500).json({
            succeded: false,
            error: error
        })
    }
}

const getAllPhotos = async (req, res) => {
    try {
        const photos = res.locals.user
            ? await Photo.find({ user: { $ne: res.locals.user._id } })
            : await Photo.find({});

        res.status(200).render("photos", {
            photos: photos,
            link: 'photos'
        });

    } catch (error) {
        res.status(500).json({
            succeded: false,
            error: error
        })
    }
}

const getPhoto = async (req, res) => {
    try {
        const photo = await Photo.findById(req.params.id).populate("user");
        let isOwner = false;

        if (res.locals.user && photo.user.equals(res.locals.user._id)) {
            isOwner = true;
        }

        res.status(200).render("photo", {
            photo: photo,
            isOwner: isOwner,
            link: 'photos'
        });

    } catch (error) {
        res.status(500).json({
            succeded: false,
            error: error
        })
    }
}

export { createPhoto, deletePhoto, updatePhoto, getAllPhotos, getPhoto }