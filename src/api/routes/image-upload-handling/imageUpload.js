const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');

const multerStorage = multer.memoryStorage();
const { dirname } = require('path');
const appDir =      dirname(require.main.filename);

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb('Please upload only images !', false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const uploadFiles = upload.array('files');

exports.uploadImages = (req, res, next) => {
  uploadFiles(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        console.error('LIMIT_UNEXPECTED_FILE');
        return;
      }
    } else if (err) {
      console.error(err);
      return;
    }

    next();
  });
};

exports.resizeImages = async (req, res, next) => {
  if (!req.files){
    console.error('No files to resize');
    return next();
  }

  req.body.images = [];
  await Promise.all(
    req.files.map(async (file) => {
      const filename = file.originalname.replace(/\..+$/, '');
      const newFilename = `image-${req.files.indexOf(file) + 1}.jpeg`;
      const draftImgDir = `${appDir}/uploads/drafts/${req.params.draftId}/`;
      if(!fs.existsSync(`${appDir}/uploads/drafts/`)){
        fs.mkdirSync(draftImgDir);
        if(!fs.existsSync(draftImgDir)){
          fs.mkdirSync(draftImgDir);
        }
      }

      if(fs.existsSync(`${draftImgDir}`)){
        //Delete all files in this directory
        fs.readdirSync(draftImgDir).forEach(file => {
          fs.unlinkSync(`${draftImgDir}/${file}`);
        });
      }

      try{
        await sharp(file.buffer).toFormat('jpeg').resize(1024).jpeg({ quality: 70 }).toFile(`${appDir}/uploads/drafts/${req.params.draftId}/${newFilename}`);
      req.body.images.push(newFilename);
      }catch(err){
        console.error(err);
      }
      
    })
  );
  next();
};

exports.getResultImages = async (req, res, next) => {
  if (req.body.images.length <= 0) {
    console.log('No bitches ?');
  }
  next();
};