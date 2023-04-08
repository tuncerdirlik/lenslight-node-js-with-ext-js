import express from "express"
import * as photoController from '../controllers/photoController.js'

const router = express.Router();

router.route("/")
    .get(photoController.getAllPhotos)
    .post(photoController.createPhoto);

router.route("/:id")
    .get(photoController.getPhoto)
    .delete(photoController.deletePhoto)
    .put(photoController.updatePhoto);

export default router;